require('dotenv').config();

const mongoose = require('mongoose');
const Utilisateur = require('../models/Utilisateur');
const { connectDB, disconnectDB } = require('../config/db');

const seedUtilisateur = async () => {
	const email = process.env.SEED_EMAIL;
	const password = process.env.SEED_PASSWORD;

	if (!email || !password) {
		throw new Error('SEED_EMAIL et SEED_PASSWORD sont obligatoires.');
	}

	await connectDB();
	const normalizedEmail = email.toLowerCase().trim();
	const utilisateurExistant = await Utilisateur.findOne({ email: normalizedEmail });

	if (utilisateurExistant) {
		utilisateurExistant.password = password;
		await utilisateurExistant.save();
		console.log('Le compte du menuisier a été mis à jour.');
		return;
	}

	await Utilisateur.create({ email: normalizedEmail, password });
	console.log('Compte du menuisier créé.');
};

seedUtilisateur()
	.catch((error) => {
		console.error(`Échec de l initialisation : ${error.message}`);
		process.exitCode = 1;
	})
	.finally(async () => {
		if (mongoose.connection.readyState !== 0) {
			await disconnectDB();
		}
	});
