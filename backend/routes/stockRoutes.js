const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.use(isAuthenticated);

router.get('/', stockController.stockPage);
router.post('/update', stockController.updateStock);

module.exports = router;
