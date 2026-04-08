const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');
const c = require('../controllers/userController');

router.use(isAuthenticated);

router.get('/',            c.listPage);
router.get('/add',         c.addPage);
router.get('/edit/:id',    c.editPage);
router.get('/api/status',  c.adminGetUsersStatus);
router.post('/create',     c.upload.single('photo'), c.createUser);
router.post('/update',     c.upload.single('photo'), c.updateUser);
router.post('/toggle/:id', c.toggleStatus);
router.post('/force-logout/:id', c.forceLogout);
router.post('/bulk/status', c.bulkUpdateStatus);
router.post('/bulk/force-logout', c.bulkForceLogout);
router.post('/delete/:id', c.deleteUser);

module.exports = router;