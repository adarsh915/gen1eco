const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');
const c = require('../controllers/orderReturnController');

router.use(isAuthenticated);

router.get('/',                  c.returnPage);
router.post('/status/:id',       c.updateStatus);
router.post('/delete/:id',       c.deleteReturn);

module.exports = router;