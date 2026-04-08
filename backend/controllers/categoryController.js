const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { validateFileUpload } = require('../utils/uploadValidator');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/uploads/categories';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = path.extname(file.originalname).toLowerCase();
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${timestamp}_${random}_${name}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const validation = validateFileUpload(file, 'image');
  if (!validation.valid) {
    cb(new Error(validation.error));
  } else {
    cb(null, true);
  }
};

exports.upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const generateSlug = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

// ===================== CATEGORY =====================

exports.categoryPage = async (req, res) => {
  try {
    const [categories] = await db.execute('SELECT * FROM categories ORDER BY created_at DESC');
    res.render('admin/category/index', {
      title: 'Categories', subTitle: 'Product / Categories', categories
    });
  } catch (err) {
    console.error(err); res.status(500).send('Server Error');
  }
};

exports.getCategories = async (req, res) => {
  try {
    const [data] = await db.execute('SELECT * FROM categories ORDER BY created_at DESC');
    res.json({ success: true, data });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.createCategory = async (req, res) => {
  const { name, status } = req.body;
  const slug = generateSlug(name);
  const image = req.file ? req.file.filename : null;
  try {
    await db.execute(
      'INSERT INTO categories (name, slug, status, image) VALUES (?, ?, ?, ?)',
      [name, slug, status || 1, image]
    );
    res.json({ success: true, message: 'Category created successfully' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  const { id, name, status } = req.body;
  const slug = generateSlug(name);
  const newImage = req.file ? req.file.filename : null;

  try {
    if (newImage) {
      const [rows] = await db.execute('SELECT image FROM categories WHERE id=?', [id]);
      if (rows[0] && rows[0].image) {
        const oldImage = path.join('public/uploads/categories', rows[0].image);
        if (fs.existsSync(oldImage)) fs.unlinkSync(oldImage);
      }
      
      await db.execute(
        'UPDATE categories SET name=?, slug=?, status=?, image=? WHERE id=?',
        [name, slug, status, newImage, id]
      );
    } else {
      await db.execute(
        'UPDATE categories SET name=?, slug=?, status=? WHERE id=?',
        [name, slug, status, id]
      );
    }
    
    res.json({ success: true, message: 'Category updated successfully' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // ✅ FIX: Delete related records before deleting category (foreign key constraints)
    // 1. Get all sub-categories for this category
    const [subCats] = await connection.execute('SELECT id FROM sub_categories WHERE category_id = ?', [req.params.id]);
    
    for (const subCat of subCats) {
      // Delete sub-sub-categories
      const [subSubCats] = await connection.execute('SELECT id FROM sub_sub_categories WHERE sub_category_id = ?', [subCat.id]);
      
      for (const subSubCat of subSubCats) {
        // Delete products in sub-sub-category
        const [prods] = await connection.execute('SELECT id FROM products WHERE sub_sub_category_id = ?', [subSubCat.id]);
        for (const prod of prods) {
          await connection.execute('DELETE FROM product_gallery WHERE product_id = ?', [prod.id]);
          await connection.execute('DELETE FROM product_variants WHERE product_id = ?', [prod.id]);
          await connection.execute('DELETE FROM related_products WHERE product_id = ? OR related_product_id = ?', [prod.id, prod.id]);
          await connection.execute('DELETE FROM order_items WHERE product_id = ?', [prod.id]);
        }
        await connection.execute('DELETE FROM products WHERE sub_sub_category_id = ?', [subSubCat.id]);
      }
      
      // Delete products in sub-category
      const [prods] = await connection.execute('SELECT id FROM products WHERE sub_category_id = ?', [subCat.id]);
      for (const prod of prods) {
        await connection.execute('DELETE FROM product_gallery WHERE product_id = ?', [prod.id]);
        await connection.execute('DELETE FROM product_variants WHERE product_id = ?', [prod.id]);
        await connection.execute('DELETE FROM related_products WHERE product_id = ? OR related_product_id = ?', [prod.id, prod.id]);
        await connection.execute('DELETE FROM order_items WHERE product_id = ?', [prod.id]);
      }
      await connection.execute('DELETE FROM products WHERE sub_category_id = ?', [subCat.id]);
      
      await connection.execute('DELETE FROM sub_sub_categories WHERE sub_category_id = ?', [subCat.id]);
    }
    
    // Delete products directly in this category
    const [prods] = await connection.execute('SELECT id FROM products WHERE category_id = ?', [req.params.id]);
    for (const prod of prods) {
      await connection.execute('DELETE FROM product_gallery WHERE product_id = ?', [prod.id]);
      await connection.execute('DELETE FROM product_variants WHERE product_id = ?', [prod.id]);
      await connection.execute('DELETE FROM related_products WHERE product_id = ? OR related_product_id = ?', [prod.id, prod.id]);
      await connection.execute('DELETE FROM order_items WHERE product_id = ?', [prod.id]);
    }
    await connection.execute('DELETE FROM products WHERE category_id = ?', [req.params.id]);
    
    // Delete sub-categories
    await connection.execute('DELETE FROM sub_categories WHERE category_id = ?', [req.params.id]);
    
    // Fetch and delete category image
    const [catRows] = await connection.execute('SELECT image FROM categories WHERE id=?', [req.params.id]);
    if (catRows[0] && catRows[0].image) {
      const imgPath = path.join('public/uploads/categories', catRows[0].image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    // Finally delete the category
    await connection.execute('DELETE FROM categories WHERE id=?', [req.params.id]);
    
    await connection.commit();
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    await connection.rollback();
    console.error('DB Error (deleteCategory):', err);
    res.json({ success: false, message: err.message });
  } finally {
    connection.release();
  }
};

// ===================== SUB CATEGORY =====================

exports.subCategoryPage = async (req, res) => {
  try {
    const [categories]    = await db.execute('SELECT * FROM categories WHERE status=1 ORDER BY name ASC');
    const [subCategories] = await db.execute(`
      SELECT sc.*, c.name AS category_name
      FROM sub_categories sc
      JOIN categories c ON sc.category_id = c.id
      ORDER BY sc.created_at DESC
    `);
    res.render('admin/category/sub-index', {
      title: 'Sub Categories', subTitle: 'Product / Sub Categories',
      categories, subCategories
    });
  } catch (err) {
    console.error(err); res.status(500).send('Server Error');
  }
};

exports.getSubCategories = async (req, res) => {
  try {
    const [data] = await db.execute(`
      SELECT sc.*, c.name AS category_name
      FROM sub_categories sc
      JOIN categories c ON sc.category_id = c.id
      ORDER BY sc.created_at DESC
    `);
    res.json({ success: true, data });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.createSubCategory = async (req, res) => {
  const { category_id, name, status } = req.body;
  const slug = generateSlug(name);
  try {
    await db.execute(
      'INSERT INTO sub_categories (category_id, name, slug, status) VALUES (?, ?, ?, ?)',
      [category_id, name, slug, status || 1]
    );
    res.json({ success: true, message: 'Sub Category created successfully' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.updateSubCategory = async (req, res) => {
  const { id, category_id, name, status } = req.body;
  const slug = generateSlug(name);
  try {
    await db.execute(
      'UPDATE sub_categories SET category_id=?, name=?, slug=?, status=? WHERE id=?',
      [category_id, name, slug, status, id]
    );
    res.json({ success: true, message: 'Sub Category updated successfully' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.deleteSubCategory = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // ✅ FIX: Delete related records before deleting sub-category
    // 1. Get all sub-sub-categories
    const [subSubCats] = await connection.execute('SELECT id FROM sub_sub_categories WHERE sub_category_id = ?', [req.params.id]);
    
    for (const subSubCat of subSubCats) {
      // Delete products in sub-sub-category
      const [prods] = await connection.execute('SELECT id FROM products WHERE sub_sub_category_id = ?', [subSubCat.id]);
      for (const prod of prods) {
        await connection.execute('DELETE FROM product_gallery WHERE product_id = ?', [prod.id]);
        await connection.execute('DELETE FROM product_variants WHERE product_id = ?', [prod.id]);
        await connection.execute('DELETE FROM related_products WHERE product_id = ? OR related_product_id = ?', [prod.id, prod.id]);
        await connection.execute('DELETE FROM order_items WHERE product_id = ?', [prod.id]);
      }
      await connection.execute('DELETE FROM products WHERE sub_sub_category_id = ?', [subSubCat.id]);
    }
    
    // Delete products in this sub-category
    const [prods] = await connection.execute('SELECT id FROM products WHERE sub_category_id = ?', [req.params.id]);
    for (const prod of prods) {
      await connection.execute('DELETE FROM product_gallery WHERE product_id = ?', [prod.id]);
      await connection.execute('DELETE FROM product_variants WHERE product_id = ?', [prod.id]);
      await connection.execute('DELETE FROM related_products WHERE product_id = ? OR related_product_id = ?', [prod.id, prod.id]);
      await connection.execute('DELETE FROM order_items WHERE product_id = ?', [prod.id]);
    }
    await connection.execute('DELETE FROM products WHERE sub_category_id = ?', [req.params.id]);
    
    // Delete sub-sub-categories
    await connection.execute('DELETE FROM sub_sub_categories WHERE sub_category_id = ?', [req.params.id]);
    
    // Finally delete the sub-category
    await connection.execute('DELETE FROM sub_categories WHERE id=?', [req.params.id]);
    
    await connection.commit();
    res.json({ success: true, message: 'Sub Category deleted successfully' });
  } catch (err) {
    await connection.rollback();
    console.error('DB Error (deleteSubCategory):', err);
    res.json({ success: false, message: err.message });
  } finally {
    connection.release();
  }
};

// ===================== SUB SUB CATEGORY =====================

exports.subSubCategoryPage = async (req, res) => {
  try {
    const [categories]       = await db.execute('SELECT * FROM categories WHERE status=1 ORDER BY name ASC');
    const [subCategories]    = await db.execute('SELECT * FROM sub_categories WHERE status=1 ORDER BY name ASC');
    const [subSubCategories] = await db.execute(`
      SELECT ssc.*, sc.name AS sub_category_name, c.name AS category_name, sc.category_id
      FROM sub_sub_categories ssc
      JOIN sub_categories sc ON ssc.sub_category_id = sc.id
      JOIN categories c ON sc.category_id = c.id
      ORDER BY ssc.created_at DESC
    `);
    res.render('admin/category/sub-sub-index', {
      title: 'Sub Sub Categories', subTitle: 'Product / Sub Sub Categories',
      categories, subCategories, subSubCategories
    });
  } catch (err) {
    console.error(err); res.status(500).send('Server Error');
  }
};

exports.getSubSubCategories = async (req, res) => {
  try {
    const [data] = await db.execute(`
      SELECT ssc.*, sc.name AS sub_category_name, c.name AS category_name, sc.category_id
      FROM sub_sub_categories ssc
      JOIN sub_categories sc ON ssc.sub_category_id = sc.id
      JOIN categories c ON sc.category_id = c.id
      ORDER BY ssc.created_at DESC
    `);
    res.json({ success: true, data });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.createSubSubCategory = async (req, res) => {
  const { sub_category_id, name, status } = req.body;
  const slug = generateSlug(name);
  try {
    await db.execute(
      'INSERT INTO sub_sub_categories (sub_category_id, name, slug, status) VALUES (?, ?, ?, ?)',
      [sub_category_id, name, slug, status || 1]
    );
    res.json({ success: true, message: 'Sub Sub Category created successfully' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.updateSubSubCategory = async (req, res) => {
  const { id, sub_category_id, name, status } = req.body;
  const slug = generateSlug(name);
  try {
    await db.execute(
      'UPDATE sub_sub_categories SET sub_category_id=?, name=?, slug=?, status=? WHERE id=?',
      [sub_category_id, name, slug, status, id]
    );
    res.json({ success: true, message: 'Sub Sub Category updated successfully' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.deleteSubSubCategory = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // ✅ FIX: Delete products before deleting sub-sub-category
    // 1. Delete all products in this sub-sub-category
    const [prods] = await connection.execute('SELECT id FROM products WHERE sub_sub_category_id = ?', [req.params.id]);
    
    for (const prod of prods) {
      await connection.execute('DELETE FROM product_gallery WHERE product_id = ?', [prod.id]);
      await connection.execute('DELETE FROM product_variants WHERE product_id = ?', [prod.id]);
      await connection.execute('DELETE FROM related_products WHERE product_id = ? OR related_product_id = ?', [prod.id, prod.id]);
      await connection.execute('DELETE FROM order_items WHERE product_id = ?', [prod.id]);
    }
    await connection.execute('DELETE FROM products WHERE sub_sub_category_id = ?', [req.params.id]);
    
    // Finally delete the sub-sub-category
    await connection.execute('DELETE FROM sub_sub_categories WHERE id=?', [req.params.id]);
    
    await connection.commit();
    res.json({ success: true, message: 'Sub Sub Category deleted successfully' });
  } catch (err) {
    await connection.rollback();
    console.error('DB Error (deleteSubSubCategory):', err);
    res.json({ success: false, message: err.message });
  } finally {
    connection.release();
  }
};

// ===================== DYNAMIC DROPDOWN =====================

exports.getSubsByCategory = async (req, res) => {
  try {
    const [data] = await db.execute(
      'SELECT * FROM sub_categories WHERE category_id = ? AND status = 1 ORDER BY name ASC',
      [req.params.category_id]
    );
    res.json({ success: true, data });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.getSubSubBySubCategory = async (req, res) => {
  try {
    const [data] = await db.execute(
      'SELECT * FROM sub_sub_categories WHERE sub_category_id = ? AND status = 1 ORDER BY name ASC',
      [req.params.sub_category_id]
    );
    res.json({ success: true, data });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// ===================== FRONTEND NAVBAR API =====================

exports.apiGetNavCategories = async (req, res) => {
  try {
    const [categories] = await db.execute('SELECT id, name, slug FROM categories WHERE status = 1 ORDER BY name ASC');
    const [subCategories] = await db.execute('SELECT id, category_id, name, slug FROM sub_categories WHERE status = 1 ORDER BY name ASC');
    const [subSubCategories] = await db.execute('SELECT id, sub_category_id, name, slug FROM sub_sub_categories WHERE status = 1 ORDER BY name ASC');
    
    // Attach matching subcategories and their sub-subcategories
    const data = categories.map(cat => {
      const catSubs = subCategories.filter(sub => sub.category_id === cat.id).map(sub => {
        return {
          ...sub,
          subSubCategories: subSubCategories.filter(ssc => ssc.sub_category_id === sub.id)
        };
      });
      return {
        ...cat,
        subCategories: catSubs
      };
    });
    
    res.json({ success: true, data });
  } catch (err) {
    console.error('Navbar API Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};