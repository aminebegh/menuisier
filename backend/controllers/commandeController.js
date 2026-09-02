const mongoose = require('mongoose');
const Client = require('../models/Client');
const Commande = require('../models/Commande');

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const toAmount = (value, defaultValue = 0) => {
	if (value === undefined || value === null || value === '') {
		return defaultValue;
	}
	const amount = Number(value);
	return Number.isFinite(amount) ? amount : NaN;
};

const commandError = (message, statusCode = 400) => {
	const error = new Error(message);
	error.statusCode = statusCode;
	return error;
};

const getClientData = (body) => body.client || {
	nom: body.nom,
	telephone: body.telephone,
	email: body.email,
	adresse: body.adresse,
};

const findOrCreateClient = async (body) => {
	if (body.clientId) {
		if (!mongoose.isValidObjectId(body.clientId)) {
			throw commandError('clientId invalide.');
		}
		const client = await Client.findById(body.clientId);
		if (!client) {
			throw commandError('Client introuvable.', 404);
		}
		return client;
	}

	const clientData = getClientData(body);
	const nom = normalizeText(clientData.nom);
	const telephone = normalizeText(clientData.telephone);
	if (!nom || !telephone) {
		throw commandError('Le nom et le téléphone du client sont obligatoires.');
	}

	const existingClient = await Client.findOne({
		$or: [
			{ nom: new RegExp(`^${escapeRegex(nom)}$`, 'i') },
			{ telephone: new RegExp(`^${escapeRegex(telephone)}$`, 'i') },
		],
	});

	if (existingClient) {
		return existingClient;
	}

	return Client.create({
		nom,
		telephone,
		email: normalizeText(clientData.email) || undefined,
		adresse: normalizeText(clientData.adresse) || undefined,
	});
};

const validateCommandeData = (data, existingCommande = null) => {
	const prixTotalTTC = toAmount(data.prixTotalTTC, existingCommande?.prixTotalTTC);
	const acompteRecu = toAmount(data.acompteRecu, existingCommande?.acompteRecu || 0);
	const paiements = data.paiements || existingCommande?.paiements || [];
	const totalPaiements = paiements.reduce((total, paiement) => total + toAmount(paiement.montant), 0);

	if (!Number.isFinite(prixTotalTTC) || prixTotalTTC < 0) {
		throw commandError('Le prix total TTC doit être un montant positif.');
	}
	if (!Number.isFinite(acompteRecu) || acompteRecu < 0) {
		throw commandError('L\'acompte doit être un montant positif.');
	}
	if (acompteRecu > prixTotalTTC) {
		throw commandError('L acompte ne peut pas dépasser le prix total.');
	}
	if (!Number.isFinite(totalPaiements) || totalPaiements < 0) {
		throw commandError('Les paiements complémentaires sont invalides.');
	}

	let statut = data.statut || existingCommande?.statut || 'Devis';
	if (acompteRecu > 0 && statut === 'Devis') {
		statut = 'Commande';
	}
	if (statut === 'Livré' && prixTotalTTC - acompteRecu - totalPaiements > 0) {
		throw commandError('La commande ne peut pas être livrée avec un reste à payer.');
	}

	return { prixTotalTTC, acompteRecu, paiements, statut, totalPaiements };
};

const appendStatusHistory = (commande, statut) => {
	const lastStatus = commande.historiqueStatuts[commande.historiqueStatuts.length - 1];
	if (!lastStatus || lastStatus.statut !== statut) {
		commande.historiqueStatuts.push({ statut, date: new Date() });
	}
};

const statusTransitions = {
	Devis: ['Commande', 'Annulée'],
	Commande: ['Fabrication', 'En cours', 'Annulée'],
	Fabrication: ['En cours', 'Livré'],
	'En cours': ['Fabrication', 'Livré'],
	Livré: [],
	Annulée: [],
};

const validateStatusTransition = (currentStatus, nextStatus) => {
	if (!Object.prototype.hasOwnProperty.call(statusTransitions, nextStatus)) {
		throw commandError('Statut de commande invalide.');
	}
	if (currentStatus === nextStatus) {
		return;
	}
	if (!statusTransitions[currentStatus]?.includes(nextStatus)) {
		throw commandError(`Transition impossible : ${currentStatus} vers ${nextStatus}.`);
	}
};

const getNextCommandeReference = async () => {
	const lastCommande = await Commande.findOne({}).sort({ createdAt: -1, _id: -1 }).select('reference').lean();
	if (!lastCommande?.reference) {
		return 'CMD-0001';
	}

	const match = lastCommande.reference.match(/CMD-(\d+)/i);
	if (!match) {
		return 'CMD-0001';
	}

	const nextNumber = Number(match[1]) + 1;
	return `CMD-${String(nextNumber).padStart(4, '0')}`;
};

const createCommande = async (req, res, next) => {
	try {
		const validation = validateCommandeData(req.body);
		const description = normalizeText(req.body.description);
		if (!description) {
			throw commandError('La description est obligatoire.');
		}

		const client = await findOrCreateClient(req.body);
		const reference = await getNextCommandeReference();
		const commande = new Commande({
			reference,
			client: client._id,
			description,
			prixTotalTTC: validation.prixTotalTTC,
			acompteRecu: validation.acompteRecu,
			statut: validation.statut,
			dateLancement: req.body.dateLancement || new Date(),
			dateLivraison: req.body.dateLivraison,
			paiements: validation.paiements,
		});
		appendStatusHistory(commande, commande.statut);
		await commande.save();
		await commande.populate('client');
		return res.status(201).json(commande);
	} catch (error) {
		return next(error);
	}
};

const listCommandes = async (req, res, next) => {
	try {
		const filter = {};
		if (req.query.clientId) {
			if (!mongoose.isValidObjectId(req.query.clientId)) {
				throw commandError('clientId invalide.');
			}
			filter.client = req.query.clientId;
		}
		if (req.query.annee || req.query.mois) {
			const year = Number(req.query.annee);
			const month = req.query.mois ? Number(req.query.mois) - 1 : 0;
			if (!Number.isInteger(year) || year < 1970 || month < 0 || month > 11) {
				throw commandError('Les filtres annee et mois sont invalides.');
			}
			const start = new Date(year, month, 1);
			const end = req.query.mois ? new Date(year, month + 1, 1) : new Date(year + 1, 0, 1);
			filter.dateLancement = { $gte: start, $lt: end };
		}

		const commandes = await Commande.find(filter)
			.select('_id reference client description prixTotalTTC acompteRecu statut dateLancement dateLivraison paiements historiqueStatuts createdAt updatedAt')
			.populate('client', '_id nom telephone email adresse')
			.sort({ dateLancement: -1 });
		return res.json(commandes);
	} catch (error) {
		return next(error);
	}
};

const getCommande = async (req, res, next) => {
	try {
		const commande = await Commande.findById(req.params.id)
			.select('_id reference client description prixTotalTTC acompteRecu statut dateLancement dateLivraison paiements historiqueStatuts createdAt updatedAt')
			.populate('client', '_id nom telephone email adresse');
		if (!commande) {
			throw commandError('Commande introuvable.', 404);
		}
		return res.json(commande);
	} catch (error) {
		return next(error.name === 'CastError' ? commandError('Identifiant de commande invalide.') : error);
	}
};

const updateCommande = async (req, res, next) => {
	try {
		const commande = await Commande.findById(req.params.id);
		if (!commande) {
			throw commandError('Commande introuvable.', 404);
		}

		const validation = validateCommandeData(req.body, commande);
		if (req.body.statut !== undefined) {
			validateStatusTransition(commande.statut, validation.statut);
		}
		const fields = ['reference', 'description', 'dateLancement', 'dateLivraison'];
		for (const field of fields) {
			if (req.body[field] !== undefined) {
				commande[field] = field === 'description' || field === 'reference'
					? normalizeText(req.body[field])
					: req.body[field];
			}
		}
		commande.prixTotalTTC = validation.prixTotalTTC;
		commande.acompteRecu = validation.acompteRecu;
		commande.paiements = validation.paiements;
		commande.statut = validation.statut;
		if (!commande.dateLancement) {
			commande.dateLancement = new Date();
		}
		appendStatusHistory(commande, commande.statut);
		await commande.save();
		await commande.populate('client');
		return res.json(commande);
	} catch (error) {
		return next(error.name === 'CastError' ? commandError('Identifiant de commande invalide.') : error);
	}
};

const addPaiement = async (req, res, next) => {
	try {
		const commande = await Commande.findById(req.params.id);
		if (!commande) {
			throw commandError('Commande introuvable.', 404);
		}

		const montant = toAmount(req.body.montant, NaN);
		if (!Number.isFinite(montant) || montant <= 0) {
			throw commandError('Le montant du paiement doit être supérieur à 0.');
		}
		if (montant > commande.resteAPayer) {
			throw commandError('Le paiement ne peut pas dépasser le reste à payer.');
		}

		commande.paiements.push({
			montant,
			date: req.body.date || new Date(),
			mode: normalizeText(req.body.mode) || undefined,
			note: normalizeText(req.body.note) || undefined,
		});
		await commande.save();
		await commande.populate('client');
		return res.status(201).json(commande);
	} catch (error) {
		return next(error.name === 'CastError' ? commandError('Identifiant de commande invalide.') : error);
	}
};

const updateStatut = async (req, res, next) => {
	try {
		const commande = await Commande.findById(req.params.id);
		if (!commande) {
			throw commandError('Commande introuvable.', 404);
		}

		const nextStatus = normalizeText(req.body.statut);
		validateStatusTransition(commande.statut, nextStatus);
		if (nextStatus === 'Livré' && commande.resteAPayer > 0) {
			throw commandError('La commande ne peut pas être livrée avec un reste à payer.');
		}

		if (commande.statut !== nextStatus) {
			commande.statut = nextStatus;
			appendStatusHistory(commande, nextStatus);
			if (nextStatus === 'Livré' && !commande.dateLivraison) {
				commande.dateLivraison = new Date();
			}
			await commande.save();
		}
		await commande.populate('client');
		return res.json(commande);
	} catch (error) {
		return next(error.name === 'CastError' ? commandError('Identifiant de commande invalide.') : error);
	}
};

const deleteCommande = async (req, res, next) => {
	try {
		const commande = await Commande.findById(req.params.id);
		if (!commande) {
			throw commandError('Commande introuvable.', 404);
		}

		await Commande.findByIdAndDelete(req.params.id);
		return res.json({ message: 'Commande supprimée avec succès.' });
	} catch (error) {
		return next(error.name === 'CastError' ? commandError('Identifiant de commande invalide.') : error);
	}
};

module.exports = {
	createCommande,
	listCommandes,
	getCommande,
	updateCommande,
	addPaiement,
	updateStatut,
	deleteCommande,
	validateCommandeData,
	validateStatusTransition,
};
