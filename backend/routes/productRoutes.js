const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');
const c = require('../controllers/productController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

router.use(isAuthenticated);

// Gallery multer
const galleryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/uploads/products/gallery';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname.replace(/\s+/g, '_'));
  }
});
const galleryUpload = multer({ storage: galleryStorage });

// Product routes
router.get('/',                    c.listPage);
router.get('/add',                 c.addPage);
router.get('/edit/:id',            c.editPage);
router.post('/create',             c.upload.fields([{ name: 'product_image', maxCount: 1 }, { name: 'product_video', maxCount: 1 }]), c.createProduct);
router.post('/update',             c.upload.fields([{ name: 'product_image', maxCount: 1 }, { name: 'product_video', maxCount: 1 }]), c.updateProduct);
router.post('/toggle/:id',         c.toggleStatus);
router.post('/delete/:id',         c.deleteProduct);

// Gallery routes
router.get('/gallery/:id',         c.galleryPage);
router.post('/gallery/add',        galleryUpload.single('image'), c.addGalleryImage);
router.post('/gallery/delete/:id', c.deleteGalleryImage);

// Variant routes
router.get('/variants/:id',        c.variantsPage);
router.post('/variants/add',       c.addVariant);
router.post('/variants/delete/:id', c.deleteVariant);

module.exports = router;