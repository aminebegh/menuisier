const mongoose = require('mongoose');

const connectDB = async () => {
	const mongoUri = process.env.MONGODB_URI;

	if (!mongoUri) {
		throw new Error('La variable MONGODB_URI est obligatoire.');
	}

	await mongoose.connect(mongoUri);
	console.log('Connexion MongoDB établie.');
};

const disconnectDB = async () => {
	if (mongoose.connection.readyState !== 0) {
		await mongoose.disconnect();
		console.log('Connexion MongoDB fermée.');
	}
};

module.exports = { connectDB, disconnectDB };
