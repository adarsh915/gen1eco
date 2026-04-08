const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');
const c = require('../controllers/singleBannerController');

router.get('/api', c.getBanner);
router.use(isAuthenticated);

router.get('/',       c.bannerPage);
router.post('/save',  c.upload.single('banner_image'), c.saveBanner);

module.exports = router;