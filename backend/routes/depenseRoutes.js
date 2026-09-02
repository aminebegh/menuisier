const express = require('express');
const verifyToken = require('../middlewares/verifyToken');
const { createDepense, listDepenses } = require('../controllers/depenseController');

const router = express.Router();
router.use(verifyToken);
router.post('/', createDepense);
router.get('/', listDepenses);

module.exports = router;
