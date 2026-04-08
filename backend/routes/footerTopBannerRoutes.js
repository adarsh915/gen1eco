const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');
const c = require('../controllers/footerTopBannerController');
router.get('/api', c.getBanner);
router.use(isAuthenticated);

router.get('/',          c.bannerPage);
router.post('/save',     c.upload.fields([{ name: 'left_banner', maxCount: 1 }, { name: 'right_banner', maxCount: 1 }]), c.saveBanner);
router.post('/delete',   c.deleteBanner);

module.exports = router;