const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');

const createToken = (utilisateur) => jwt.sign(
	{ userId: utilisateur._id.toString(), email: utilisateur.email },
	process.env.JWT_SECRET,
	{ expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

const login = async (req, res, next) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ message: 'E-mail et mot de passe requis.' });
	}

	try {
		const utilisateur = await Utilisateur.findOne({ email: email.toLowerCase().trim() }).select('+password');
		if (!utilisateur || !(await utilisateur.comparePassword(password))) {
			return res.status(401).json({ message: 'Identifiants invalides.' });
		}

		return res.json({
			token: createToken(utilisateur),
			utilisateur: { id: utilisateur._id, email: utilisateur.email },
		});
	} catch (error) {
		return next(error);
	}
};

const logout = (req, res) => {
	res.status(200).json({ message: 'Déconnexion réussie. Supprimez le token côté client.' });
};

module.exports = { login, logout };
