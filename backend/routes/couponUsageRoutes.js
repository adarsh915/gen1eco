const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');
const c = require('../controllers/couponUsageController');

router.use(isAuthenticated);

router.get('/',            c.usagePage);
router.post('/delete/:id', c.deleteUsage);

module.exports = router;