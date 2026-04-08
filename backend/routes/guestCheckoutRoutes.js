const express = require('express');
const router = express.Router();
const guestCheckoutController = require('../controllers/guestCheckoutController');
const verifyToken = require('../middleware/apiAuthMiddleware');

// Public routes (no authentication required)
router.get('/validate-email', guestCheckoutController.apiValidateEmail);
router.post('/checkout', guestCheckoutController.apiCreateGuestOrder);

// Protected routes (authentication required)
router.post('/mark-complete', verifyToken, guestCheckoutController.apiMarkGuestCheckoutComplete);

module.exports = router;
