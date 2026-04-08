const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');
const c = require('../controllers/gstController');

router.use(isAuthenticated);

router.get('/',              c.gstPage);
router.post('/create',       c.createGst);
router.post('/toggle/:id',   c.toggleStatus);
router.post('/delete/:id',   c.deleteGst);

module.exports = router;