const mongoose = require('mongoose');

const depenseSchema = new mongoose.Schema(
	{
		nomArticle: { type: String, required: true, trim: true },
		montant: { type: Number, required: true, min: 0 },
		dateAchat: { type: Date, required: true, default: Date.now },
		categorie: { type: String, trim: true },
		fournisseur: { type: String, trim: true },
		commande: { type: mongoose.Schema.Types.ObjectId, ref: 'Commande', default: null },
	},
	{ timestamps: true }
);

depenseSchema.index({ dateAchat: -1 });
depenseSchema.index({ commande: 1, dateAchat: -1 });

depenseSchema.index({ montant: 1 });

module.exports = mongoose.model('Depense', depenseSchema);
