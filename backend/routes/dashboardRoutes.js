const express = require('express');
const verifyToken = require('../middlewares/verifyToken');
const { getBilan } = require('../controllers/dashboardController');

const router = express.Router();
router.use(verifyToken);
router.get('/', getBilan);

module.exports = router;
