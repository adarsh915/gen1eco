const express = require('express');
const router = express.Router();
const { getAllMessages, deleteMessage, createMessage } = require('../controllers/contactMessageController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.post('/send', createMessage);
router.use(isAuthenticated);

router.get('/', getAllMessages);
router.post('/:id/delete', deleteMessage);

module.exports = router;