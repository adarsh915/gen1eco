const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated, isGuest } = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/securityMiddleware');

router.get('/login', isGuest, authController.showLogin);
router.post('/login', isGuest, loginLimiter, authController.login);
router.get('/logout', isAuthenticated, authController.logout);

module.exports = router;