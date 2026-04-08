const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');
const c = require('../controllers/threeBoxesController');

router.use(isAuthenticated);

router.get('/',                c.listPage);
router.get('/add',             c.addPage);
router.get('/edit/:id',        c.editPage);
router.post('/create',         c.upload.single('image'), c.createBox);
router.post('/update',         c.upload.single('image'), c.updateBox);
router.post('/toggle/:id',     c.toggleStatus);
router.post('/delete/:id',     c.deleteBox);

module.exports = router;