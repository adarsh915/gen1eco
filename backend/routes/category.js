const express = require('express');
const router = express.Router();
const c = require('../controllers/categoryController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/all', c.getCategories);
router.get('/nav', c.apiGetNavCategories);

router.use(isAuthenticated);

// Category
router.get('/',                             c.categoryPage);

router.post('/create',                      c.upload.single('image'), c.createCategory);
router.post('/update',                      c.upload.single('image'), c.updateCategory);
router.delete('/delete/:id',               c.deleteCategory);

// Sub Category
router.get('/sub',                          c.subCategoryPage);
router.get('/sub/all',                      c.getSubCategories);
router.post('/sub/create',                  c.createSubCategory);
router.post('/sub/update',                  c.updateSubCategory);
router.delete('/sub/delete/:id',           c.deleteSubCategory);

// Sub Sub Category
router.get('/sub-sub',                      c.subSubCategoryPage);
router.get('/sub-sub/all',                  c.getSubSubCategories);
router.post('/sub-sub/create',              c.createSubSubCategory);
router.post('/sub-sub/update',              c.updateSubSubCategory);
router.delete('/sub-sub/delete/:id',       c.deleteSubSubCategory);

// ✅ Dynamic dropdowns
router.get('/sub-by-category/:category_id', c.getSubsByCategory);
router.get('/sub-sub-by-subcategory/:sub_category_id', c.getSubSubBySubCategory);

module.exports = router;