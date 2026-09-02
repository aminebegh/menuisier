require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectDB, disconnectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const commandeRoutes = require('./routes/commandeRoutes');
const depenseRoutes = require('./routes/depenseRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const verifyToken = require('./middlewares/verifyToken');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/commandes', commandeRoutes);
app.use('/api/depenses', depenseRoutes);
app.use('/api/bilan', dashboardRoutes);
app.get('/api/dashboard', verifyToken, require('./controllers/dashboardController').getDashboard);

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.get('/api/protected', verifyToken, (req, res) => {
	res.json({ message: 'Route protégée accessible.', user: req.user });
});

app.use((req, res) => {
	res.status(404).json({ message: 'Route introuvable.' });
});

app.use((error, req, res, next) => {
	console.error(error);
	if (error.code === 11000 && error.keyPattern?.reference) {
		return res.status(409).json({ message: 'Cette référence de commande existe déjà.' });
	}
	const statusCode = error.statusCode || 500;
	res.status(statusCode).json({
		message: statusCode === 500 ? 'Une erreur interne est survenue.' : error.message,
	});
});

const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

const startServer = async () => {
	try {
		await connectDB();
		app.listen(PORT, HOST, () => {
			console.log(`Serveur lancé sur http://${HOST}:${PORT}`);
		});
	} catch (error) {
		console.error(`Impossible de démarrer le serveur : ${error.message}`);
		process.exitCode = 1;
	}
};

const shutdown = async () => {
	await disconnectDB();
	process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

if (require.main === module) {
	startServer();
}

module.exports = { app, startServer, shutdown };
