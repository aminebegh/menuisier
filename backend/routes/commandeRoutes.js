const express = require('express');
const verifyToken = require('../middlewares/verifyToken');
const {
	createCommande,
	listCommandes,
	getCommande,
	updateCommande,
	addPaiement,
	updateStatut,
	deleteCommande,
} = require('../controllers/commandeController');

const router = express.Router();

router.use(verifyToken);
router.post('/', createCommande);
router.post('/:id/paiements', addPaiement);
router.put('/:id/statut', updateStatut);
router.get('/', listCommandes);
router.get('/:id', getCommande);
router.put('/:id', updateCommande);
router.delete('/:id', deleteCommande);

module.exports = router;
