const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');
const c = require('../controllers/orderController');

router.use(isAuthenticated);

router.get('/',               c.orderPage);
router.get('/view/:id',       c.viewOrder);
router.post('/status/:id',    c.updateStatus);
router.post('/delete/:id',    c.deleteOrder);

module.exports = router;