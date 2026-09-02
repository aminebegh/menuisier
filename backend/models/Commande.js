const mongoose = require('mongoose');

const paiementSchema = new mongoose.Schema(
	{
		montant: { type: Number, required: true, min: 0 },
		date: { type: Date, default: Date.now },
		mode: { type: String, trim: true },
		note: { type: String, trim: true },
	},
	{ _id: true }
);

const historiqueStatutSchema = new mongoose.Schema(
	{
		statut: { type: String, required: true },
		date: { type: Date, default: Date.now },
	},
	{ _id: true }
);

const commandeSchema = new mongoose.Schema(
	{
		reference: { type: String, required: true, unique: true, trim: true },
		client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
		description: { type: String, required: true, trim: true },
		prixTotalTTC: { type: Number, required: true, min: 0 },
		acompteRecu: { type: Number, default: 0, min: 0 },
		statut: {
			type: String,
			enum: ['Devis', 'Commande', 'Fabrication', 'En cours', 'Livré', 'Annulée'],
			default: 'Devis',
		},
		dateLancement: { type: Date, required: true, default: Date.now },
		dateLivraison: { type: Date },
		paiements: { type: [paiementSchema], default: [] },
		historiqueStatuts: { type: [historiqueStatutSchema], default: [] },
	},
	{ timestamps: true }
);

commandeSchema.index({ client: 1 });
commandeSchema.index({ dateLancement: -1 });
commandeSchema.index({ dateLivraison: 1 });
commandeSchema.index({ statut: 1, dateLivraison: 1 });
commandeSchema.index({ statut: 1, dateLancement: -1 });

commandeSchema.virtual('totalPaiements').get(function totalPaiements() {
	const totalPaiementsComplementaires = this.paiements.reduce(
		(total, paiement) => total + paiement.montant,
		0
	);
	return this.acompteRecu + totalPaiementsComplementaires;
});

commandeSchema.virtual('resteAPayer').get(function resteAPayer() {
	return Math.max(0, this.prixTotalTTC - this.totalPaiements);
});

commandeSchema.set('toJSON', { virtuals: true });
commandeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Commande', commandeSchema);
