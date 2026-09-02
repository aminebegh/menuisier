const Commande = require('../models/Commande');
const Depense = require('../models/Depense');

const bilanError = (message) => {
	const error = new Error(message);
	error.statusCode = 400;
	return error;
};

const getDateRange = (query) => {
	if (query.debut || query.fin) {
		const start = query.debut ? new Date(query.debut) : new Date(0);
		const end = query.fin ? new Date(query.fin) : new Date();
		if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
			throw bilanError('La plage de dates est invalide.');
		}
		end.setHours(23, 59, 59, 999);
		return { start, end };
	}
	if (query.periode) {
		const match = /^(\d{4})-(\d{1,2})$/.exec(query.periode);
		if (!match || Number(match[2]) < 1 || Number(match[2]) > 12) {
			throw bilanError('periode doit respecter le format YYYY-MM.');
		}
		const year = Number(match[1]);
		const month = Number(match[2]) - 1;
		return { start: new Date(year, month, 1), end: new Date(year, month + 1, 1) };
	}
	return { start: new Date(0), end: new Date() };
};

const getBilan = async (req, res, next) => {
	try {
		const { start, end } = getDateRange(req.query);
		const dateFilter = { $gte: start, $lte: end };
		const [commandes, depenses] = await Promise.all([
			Commande.find({ dateLancement: dateFilter })
				.select('_id reference client prixTotalTTC')
				.populate('client', '_id nom telephone')
				.sort({ dateLancement: -1 }),
			Depense.find({ dateAchat: dateFilter })
				.select('_id montant commande')
				.sort({ dateAchat: -1 }),
		]);

		const expensesByCommande = new Map();
		for (const depense of depenses) {
			if (depense.commande) {
				const key = depense.commande.toString();
				expensesByCommande.set(key, (expensesByCommande.get(key) || 0) + depense.montant);
			}
		}

		const totalVentes = commandes.reduce((total, commande) => total + commande.prixTotalTTC, 0);
		const totalDepenses = depenses.reduce((total, depense) => total + depense.montant, 0);
		const margeParCommande = commandes.map((commande) => {
			const depensesCommande = expensesByCommande.get(commande._id.toString()) || 0;
			return {
				commandeId: commande._id,
				reference: commande.reference,
				prixTotalTTC: commande.prixTotalTTC,
				depenses: depensesCommande,
				marge: commande.prixTotalTTC - depensesCommande,
			};
		});

		return res.json({
			periode: { debut: start, fin: end },
			totalVentes,
			totalDepenses,
			margeGlobale: totalVentes - totalDepenses,
			nombreCommandes: commandes.length,
			nombreDepenses: depenses.length,
			margeParCommande,
		});
	} catch (error) {
		return next(error);
	}
};

const getCurrentMonthRange = () => {
	const now = new Date();
	const start = new Date(now.getFullYear(), now.getMonth(), 1);
	const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
	return { start, end, now };
};

const paymentFields = {
	$addFields: {
		totalPaiements: {
			$add: [
				'$acompteRecu',
				{ $ifNull: [{ $sum: '$paiements.montant' }, 0] },
			],
		},
		client: { $arrayElemAt: ['$client', 0] },
		},
};

const getDashboard = async (req, res, next) => {
	try {
		const { start, end, now } = getCurrentMonthRange();
		const currentMonthFilter = { dateLancement: { $gte: start, $lt: end } };
		const activeStatuses = ['Commande', 'Fabrication', 'En cours'];

		const [currentMonthStats, activeCount, lateDeliveries, latestCommandes] = await Promise.all([
			Commande.aggregate([
				{ $match: currentMonthFilter },
				{
					$group: {
						_id: null,
						chiffreAffaires: { $sum: '$prixTotalTTC' },
						totalAcomptes: { $sum: '$acompteRecu' },
						nombreCommandes: { $sum: 1 },
					},
				},
			]),
			Commande.countDocuments({ statut: { $in: activeStatuses } }),
			Commande.find({
				dateLivraison: { $lt: now, $exists: true },
				statut: { $nin: ['Livré', 'Annulée'] },
			}).populate('client', 'nom telephone').sort({ dateLivraison: 1 }),
			Commande.aggregate([
				{ $sort: { createdAt: -1 } },
				{ $limit: 5 },
				{
					$lookup: {
						from: 'clients',
						localField: 'client',
						foreignField: '_id',
						as: 'client',
					},
				},
				paymentFields,
				{
					$project: {
						_id: 1,
						reference: 1,
						statut: 1,
						prixTotalTTC: 1,
						totalPaiements: 1,
						resteAPayer: { $max: [0, { $subtract: ['$prixTotalTTC', '$totalPaiements'] }] },
						client: { _id: 1, nom: 1 },
					},
				},
			]),
		]);

		const stats = currentMonthStats[0] || {
			chiffreAffaires: 0,
			totalAcomptes: 0,
			nombreCommandes: 0,
		};

		return res.json({
			periode: { debut: start, fin: end },
			commandesEnCours: activeCount,
			chiffreAffairesMois: stats.chiffreAffaires,
			totalAcomptesMois: stats.totalAcomptes,
			nombreCommandesMois: stats.nombreCommandes,
			livraisonsEnRetard: lateDeliveries,
			nombreLivraisonsEnRetard: lateDeliveries.length,
			dernieresCommandes: latestCommandes,
		});
	} catch (error) {
		return next(error);
	}
};

module.exports = { getBilan, getDashboard };
