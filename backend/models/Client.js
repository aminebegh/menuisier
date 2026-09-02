const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
	{
		nom: {
			type: String,
			required: true,
			trim: true,
		},
		telephone: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			trim: true,
			lowercase: true,
		},
		adresse: {
			type: String,
			trim: true,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Client', clientSchema);
