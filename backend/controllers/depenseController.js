const mongoose = require('mongoose');
const Depense = require('../models/Depense');
const Commande = require('../models/Commande');

const errorWithStatus = (message, statusCode = 400) => {
	const error = new Error(message);
	error.statusCode = statusCode;
	return error;
};

const getPeriodFilter = (periode) => {
	if (!periode) {
		return {};
	}
	const match = /^(\d{4})-(\d{1,2})$/.exec(periode);
	if (!match) {
		throw errorWithStatus('periode doit respecter le format YYYY-MM.');
	}
	const year = Number(match[1]);
	const month = Number(match[2]);
	if (month < 1 || month > 12) {
		throw errorWithStatus('Le mois de periode est invalide.');
	}
	return {
		dateAchat: {
			$gte: new Date(year, month - 1, 1),
			$lt: new Date(year, month, 1),
		},
	};
};

const createDepense = async (req, res, next) => {
	try {
		const { nomArticle, montant, prix, dateAchat, categorie, fournisseur, commandeId } = req.body;
		const amount = Number(montant ?? prix);
		if (!nomArticle?.trim() || !Number.isFinite(amount) || amount <= 0) {
			throw errorWithStatus('Le nom de l article et son prix sont obligatoires.');
		}
		if (commandeId && !mongoose.isValidObjectId(commandeId)) {
			throw errorWithStatus('commandeId invalide.');
		}
		if (commandeId && !(await Commande.exists({ _id: commandeId }))) {
			throw errorWithStatus('Commande introuvable.', 404);
		}

		const depense = await Depense.create({
			nomArticle: nomArticle.trim(),
			montant: amount,
			dateAchat: dateAchat || new Date(),
			categorie: categorie?.trim() || undefined,
			fournisseur: fournisseur?.trim() || undefined,
			commande: commandeId || null,
		});
		await depense.populate('commande');
		return res.status(201).json(depense);
	} catch (error) {
		return next(error);
	}
};

const listDepenses = async (req, res, next) => {
	try {
		const filter = getPeriodFilter(req.query.periode);
		if (req.query.commandeId) {
			if (!mongoose.isValidObjectId(req.query.commandeId)) {
				throw errorWithStatus('commandeId invalide.');
			}
			filter.commande = req.query.commandeId;
		}
		const depenses = await Depense.find(filter).populate('commande').sort({ dateAchat: -1 });
		return res.json(depenses);
	} catch (error) {
		return next(error);
	}
};

module.exports = { createDepense, listDepenses, getPeriodFilter };
