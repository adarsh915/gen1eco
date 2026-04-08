const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');
const c = require('../controllers/couponController');

router.use(isAuthenticated);

router.get('/',            c.couponPage);
router.post('/create',     c.createCoupon);
router.post('/toggle/:id', c.toggleStatus);
router.post('/delete/:id', c.deleteCoupon);

module.exports = router;