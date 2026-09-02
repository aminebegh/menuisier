const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const utilisateurSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 8,
			select: false,
		},
	},
	{ timestamps: true }
);

utilisateurSchema.pre('save', async function hashPassword() {
	if (!this.isModified('password')) {
		return;
	}
	this.password = await bcrypt.hash(this.password, 12);
});
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTkxOWRlMTBhMWRmMzBhNGViYWQwODYiLCJlbWFpbCI6ImFydGlzYW5AZXhhbXBsZS5jb20iLCJpYXQiOjE3ODc5MzUxMTEsImV4cCI6MTc4ODUzOTkxMX0.cSfVBAoQRDPdEsSZKh-ALN8xFhUB7SkY4KMh04aa6Ik
utilisateurSchema.methods.comparePassword = function comparePassword(password) {
	return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Utilisateur', utilisateurSchema);
