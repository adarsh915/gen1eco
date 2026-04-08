const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');
const c = require('../controllers/mainSliderController');

// Public API
router.get('/api', c.getSlidersApi);

// Admin Routes (protected)
router.use(isAuthenticated);

router.get('/', c.sliderList);
router.get('/add', c.addSliderPage);
router.post('/add', c.upload.fields([
  { name: 'large_image', maxCount: 1 },
  { name: 'small_image', maxCount: 1 }
]), c.addSlider);

router.get('/edit/:id', c.editSliderPage);
router.post('/edit/:id', c.upload.fields([
  { name: 'large_image', maxCount: 1 },
  { name: 'small_image', maxCount: 1 }
]), c.updateSlider);

router.get('/delete/:id', c.deleteSlider);

module.exports = router;
