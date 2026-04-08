const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { validateFileUpload } = require('../utils/uploadValidator');

// ─── MULTER: PRODUCT IMAGE ────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/uploads/products';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // ✅ FIX: Generate safer filenames
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = path.extname(file.originalname).toLowerCase();
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${timestamp}_${random}_${name}${ext}`);
  }
});

// ✅ FIX: Add file filter for security
const fileFilter = (req, file, cb) => {
  const validation = validateFileUpload(file, 'image');
  if (!validation.valid) {
    cb(new Error(validation.error));
  } else {
    cb(null, true);
  }
};

const videoFilter = (req, file, cb) => {
  const validation = validateFileUpload(file, 'video');
  if (!validation.valid) {
    cb(new Error(validation.error));
  } else {
    cb(null, true);
  }
};

exports.upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB for images
});

// ─── MULTER: GALLERY ──────────────────────────────────────────────────────────
const galleryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/uploads/products/gallery';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // ✅ FIX: Generate safer filenames
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = path.extname(file.originalname).toLowerCase();
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${timestamp}_${random}_${name}${ext}`);
  }
});

exports.galleryUpload = multer({ 
  storage: galleryStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB for gallery images
});

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const getCategories = () => db.execute('SELECT * FROM categories WHERE status=1 ORDER BY name ASC');
const getSubCategories = () => db.execute('SELECT * FROM sub_categories WHERE status=1 ORDER BY name ASC');
const getSubSubCategories = () => db.execute('SELECT * FROM sub_sub_categories WHERE status=1 ORDER BY name ASC');

const normalizeToArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
};

const parseOptionalInt = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const extractCategoryMappings = (body) => {
  const categoryIds = normalizeToArray(body.category_id);
  const subCategoryIds = normalizeToArray(body.sub_category_id);
  const subSubCategoryIds = normalizeToArray(body.sub_sub_category_id);
  const rowCount = Math.max(categoryIds.length, subCategoryIds.length, subSubCategoryIds.length);

  const mappings = [];
  const seen = new Set();

  for (let i = 0; i < rowCount; i += 1) {
    const categoryId = parseOptionalInt(categoryIds[i]);
    if (!categoryId) continue;

    const subCategoryId = parseOptionalInt(subCategoryIds[i]);
    const subSubCategoryId = parseOptionalInt(subSubCategoryIds[i]);
    const key = `${categoryId}:${subCategoryId || ''}:${subSubCategoryId || ''}`;

    if (seen.has(key)) continue;
    seen.add(key);

    mappings.push({
      category_id: categoryId,
      sub_category_id: subCategoryId,
      sub_sub_category_id: subSubCategoryId,
    });
  }

  return mappings;
};

const saveProductCategoryMappings = async (connection, productId, mappings) => {
  await connection.execute('DELETE FROM product_category_map WHERE product_id = ?', [productId]);

  if (!mappings || mappings.length === 0) return;

  const values = mappings.map(() => '(?, ?, ?, ?)').join(', ');
  const params = mappings.flatMap((mapping) => [
    productId,
    mapping.category_id,
    mapping.sub_category_id,
    mapping.sub_sub_category_id,
  ]);

  await connection.execute(
    `INSERT INTO product_category_map (product_id, category_id, sub_category_id, sub_sub_category_id) VALUES ${values}`,
    params
  );
};

// FIX 2: Shared variant subquery — uses FIELD() instead of CASE WHEN
// CASE WHEN inside a correlated subquery ORDER BY causes "Incorrect arguments to mysqld_stmt_execute"
// on strict Linux MySQL. FIELD() is safe and equivalent.
const VARIANT_STOCK_SUBQUERY = `(
  SELECT pv.stock FROM product_variants pv
  WHERE pv.product_id = p.id
  ORDER BY FIELD(pv.variant_value, '1 Ltr', 'Standard', 'Regular') DESC, pv.id ASC
  LIMIT 1
) AS variant_stock`;

// ─── LIST PAGE ────────────────────────────────────────────────────────────────
exports.listPage = async (req, res) => {
  try {
    const search = req.query.search || '';
    const page   = parseInt(req.query.page) || 1;
    const limit  = 10;
    const offset = (page - 1) * limit;

    let where = 'WHERE 1';
    const params = [];

    if (search) {
      where += ' AND (p.product_name LIKE ? OR c.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) AS total FROM products p
       LEFT JOIN categories c ON p.category_id = c.id ${where}`,
      params
    );

    // FIX 3: parseInt() on limit/offset — strict Linux MySQL rejects raw JS numbers
    // in parameterized queries mixed with string params via spread
    const [products] = await db.execute(`
  SELECT
    p.*,
    c.name   AS category_name,
    sc.name  AS sub_category_name,
    ssc.name AS sub_sub_category_name,
    ${VARIANT_STOCK_SUBQUERY}
  FROM products p
  LEFT JOIN categories         c   ON p.category_id         = c.id
  LEFT JOIN sub_categories     sc  ON p.sub_category_id     = sc.id
  LEFT JOIN sub_sub_categories ssc ON p.sub_sub_category_id = ssc.id
  ${where}
  ORDER BY p.created_at DESC
  LIMIT ${limit} OFFSET ${offset}
`, params);

    products.forEach(p => {
      if (p.variant_stock !== null && p.variant_stock !== undefined) {
        p.stock = p.variant_stock;
      }
    });

    const totalPages = Math.ceil(total / limit);

    res.render('admin/products/index', {
      title: 'Products',
      subTitle: 'Products / List',
      products,
      search,
      page,
      totalPages,
      success: req.query.success || null,
      error: req.query.error || null,
    });
  } catch (err) {
    console.error('DB Error (listPage):', err);
    res.status(500).send('Server Error: ' + err.message);
  }
};

// ─── ADD PAGE ─────────────────────────────────────────────────────────────────
exports.addPage = async (req, res) => {
  try {
    const [categories]      = await getCategories();
    const [subCategories]   = await getSubCategories();
    const [subSubCategories]= await getSubSubCategories();
    const [gstList]         = await db.execute('SELECT * FROM gst_settings WHERE status=1');
    res.render('admin/products/form', {
      title: 'Add Product',
      subTitle: 'Products / Add',
      product: null,
      categories, subCategories, subSubCategories, gstList,
      success: null,
      error: req.query.error || null,
    });
  } catch (err) {
    console.error('DB Error (addPage):', err);
    res.status(500).send('Server Error: ' + err.message);
  }
};

// ─── EDIT PAGE ────────────────────────────────────────────────────────────────
exports.editPage = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT p.*, ${VARIANT_STOCK_SUBQUERY}
      FROM products p WHERE p.id=?`, [req.params.id]);

    if (!rows[0]) return res.redirect('/products?error=Product not found.');
    const product = rows[0];
    if (product.variant_stock !== null && product.variant_stock !== undefined) {
      product.stock = product.variant_stock;
    }

    const [mappings] = await db.execute(
      `SELECT category_id, sub_category_id, sub_sub_category_id
       FROM product_category_map
       WHERE product_id = ?
       ORDER BY id ASC`,
      [req.params.id]
    );

    product.category_mappings = mappings.length > 0
      ? mappings
      : [{
          category_id: product.category_id,
          sub_category_id: product.sub_category_id,
          sub_sub_category_id: product.sub_sub_category_id,
        }];

    const [categories]       = await getCategories();
    const [subCategories]    = await getSubCategories();
    const [subSubCategories] = await getSubSubCategories();
    const [gstList]          = await db.execute('SELECT * FROM gst_settings WHERE status=1');

    res.render('admin/products/form', {
      title: 'Edit Product',
      subTitle: 'Products / Edit',
      product: product,
      categories, subCategories, subSubCategories, gstList,
      success: req.query.success || null,
      error: req.query.error || null,
    });
  } catch (err) {
    console.error('CRITICAL ERROR (editPage):', err);
    res.status(500).send('Server Error: ' + err.message);
  }
};

// ─── CREATE ───────────────────────────────────────────────────────────────────
exports.createProduct = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const {
      product_name, short_description, description,
      price, sale_price, stock, status, gst_id, discount_percent,
      is_featured, is_best_selling, is_new_arrival,
      default_variant_name, default_variant_value,
    } = req.body;

    const parsedIsFeatured    = is_featured     ? 1 : 0;
    const parsedIsBestSelling = is_best_selling ? 1 : 0;
    const parsedIsNewArrival  = is_new_arrival  ? 1 : 0;

    const parsedPrice     = Number(price)    || 0;
    const parsedSalePrice = sale_price       ? Number(sale_price) : null;
    const parsedStock     = parseInt(stock)  || 0;
    const parsedStatus    = status !== undefined ? parseInt(status) : 1;
    const parsedGstId     = (gst_id && gst_id !== '') ? parseInt(gst_id) : null;
    const parsedDiscount  = Number(discount_percent) || 0;
    const categoryMappings = extractCategoryMappings(req.body);

    if (categoryMappings.length === 0) {
      return res.redirect('/products/add?error=Please select at least one category mapping.');
    }

    const primaryCategory = categoryMappings[0];
    const parsedCatId = primaryCategory.category_id;
    const parsedSubCatId = primaryCategory.sub_category_id;
    const parsedSubSubCatId = primaryCategory.sub_sub_category_id;

    const slug          = product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const product_image = req.files?.product_image ? req.files.product_image[0].filename : null;
    const video_file    = req.files?.product_video  ? req.files.product_video[0].filename  : null;

    await connection.beginTransaction();

    const [result] = await connection.execute(`
      INSERT INTO products
        (category_id, sub_category_id, sub_sub_category_id, product_name, product_slug,
         short_description, description, price, sale_price, stock, product_image, video_url,
         status, gst_id, discount_percent,
         is_featured, is_best_selling, is_new_arrival, default_variant_name, default_variant_value)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        parsedCatId, parsedSubCatId, parsedSubSubCatId,
        product_name, slug, short_description, description,
        parsedPrice, parsedSalePrice, parsedStock, product_image, video_file,
        parsedStatus, parsedGstId, parsedDiscount,
        parsedIsFeatured, parsedIsBestSelling, parsedIsNewArrival,
        default_variant_name || 'Standard', default_variant_value || '1 Ltr'
      ]
    );

    const productId = result.insertId;

    await saveProductCategoryMappings(connection, productId, categoryMappings);

    await connection.execute(
      'INSERT INTO product_variants (product_id, variant_name, variant_value, price, stock) VALUES (?, ?, ?, ?, ?)',
      [productId, default_variant_name || 'Standard', default_variant_value || '1 Ltr', parsedPrice, parsedStock]
    );

    await connection.commit();

    res.redirect('/products?success=Product created with a default variant.');
  } catch (err) {
    await connection.rollback();
    console.error('DB Error (createProduct):', err);
    res.redirect('/products/add?error=Failed to create product: ' + encodeURIComponent(err.message));
  } finally {
    connection.release();
  }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────
exports.updateProduct = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const {
      id, product_name, short_description, description,
      price, sale_price, stock, status, gst_id, discount_percent,
      is_featured, is_best_selling, is_new_arrival,
      default_variant_name, default_variant_value,
    } = req.body;

    const parsedIsFeatured    = is_featured     ? 1 : 0;
    const parsedIsBestSelling = is_best_selling ? 1 : 0;
    const parsedIsNewArrival  = is_new_arrival  ? 1 : 0;

    const parsedPrice     = Number(price)    || 0;
    const parsedSalePrice = sale_price       ? Number(sale_price) : null;
    const parsedStock     = parseInt(stock)  || 0;
    const parsedStatus    = status !== undefined ? parseInt(status) : 1;
    const parsedGstId     = (gst_id && gst_id !== '') ? parseInt(gst_id) : null;
    const parsedDiscount  = Number(discount_percent) || 0;
    const categoryMappings = extractCategoryMappings(req.body);

    if (categoryMappings.length === 0) {
      return res.redirect('/products?error=Please select at least one category mapping.');
    }

    const primaryCategory = categoryMappings[0];
    const parsedCatId = primaryCategory.category_id;
    const parsedSubCatId = primaryCategory.sub_category_id;
    const parsedSubSubCatId = primaryCategory.sub_sub_category_id;

    const slug     = product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newImage = req.files?.product_image ? req.files.product_image[0].filename : null;
    const newVideo = req.files?.product_video  ? req.files.product_video[0].filename  : null;

    await connection.beginTransaction();

    const [rows] = await connection.execute('SELECT product_image, video_url FROM products WHERE id=?', [id]);
    if (!rows[0]) return res.redirect('/products?error=Product not found.');

    const image = newImage || rows[0].product_image;
    const video = newVideo || rows[0].video_url;

    if (newImage && rows[0].product_image) {
      const oldPath = path.join('public/uploads/products', rows[0].product_image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    if (newVideo && rows[0].video_url) {
      const oldVideoPath = path.join('public/uploads/products', rows[0].video_url);
      if (fs.existsSync(oldVideoPath)) fs.unlinkSync(oldVideoPath);
    }

    let finalStatus = parsedStatus;
    if (finalStatus === 1) {
      const [variants] = await connection.execute('SELECT COUNT(*) as count FROM product_variants WHERE product_id=?', [id]);
      if (variants[0].count === 0) finalStatus = 0;
    }

    await connection.execute(`
      UPDATE products SET
        category_id=?, sub_category_id=?, sub_sub_category_id=?,
        product_name=?, product_slug=?, short_description=?, description=?,
        price=?, sale_price=?, stock=?, product_image=?, video_url=?, status=?,
        gst_id=?, discount_percent=?,
        is_featured=?, is_best_selling=?, is_new_arrival=?,
        default_variant_name=?, default_variant_value=?
      WHERE id=?`,
      [
        parsedCatId, parsedSubCatId, parsedSubSubCatId,
        product_name, slug, short_description, description,
        parsedPrice, parsedSalePrice, parsedStock, image, video, finalStatus,
        parsedGstId, parsedDiscount,
        parsedIsFeatured, parsedIsBestSelling, parsedIsNewArrival,
        default_variant_name, default_variant_value, id
      ]
    );

    await saveProductCategoryMappings(connection, id, categoryMappings);

    const [allVariants] = await connection.execute('SELECT id, variant_value FROM product_variants WHERE product_id=?', [id]);
    if (allVariants.length > 0) {
      let variantToUpdate = null;
      if (allVariants.length === 1) {
        variantToUpdate = allVariants[0].id;
      } else {
        const defaultVar = allVariants.find(v =>
          ['1 Ltr', 'Standard', 'Regular', default_variant_value].includes(v.variant_value)
        );
        if (defaultVar) variantToUpdate = defaultVar.id;
      }
      if (variantToUpdate) {
        await connection.execute(
          'UPDATE product_variants SET variant_name=?, variant_value=?, price=?, stock=? WHERE id=?',
          [default_variant_name || 'Standard', default_variant_value || '1 Ltr', parsedPrice, parsedStock, variantToUpdate]
        );
      }
    }

    await connection.commit();

    let successMsg = 'Product updated successfully.';
    if (parsedStatus === 1 && finalStatus === 0) {
      successMsg = 'Product updated, but kept Inactive. Add at least one variant before activating.';
    }

    res.redirect(`/products?success=${encodeURIComponent(successMsg)}`);
  } catch (err) {
    await connection.rollback();
    console.error('DB Error (updateProduct):', err);
    res.redirect('/products?error=Failed to update product: ' + encodeURIComponent(err.message));
  } finally {
    connection.release();
  }
};

// ─── TOGGLE STATUS ────────────────────────────────────────────────────────────
exports.toggleStatus = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT status FROM products WHERE id=?', [req.params.id]);
    if (!rows[0]) return res.redirect('/products?error=Product not found.');
    const newStatus = rows[0].status == 1 ? 0 : 1;
    if (newStatus === 1) {
      const [variants] = await db.execute('SELECT COUNT(*) as count FROM product_variants WHERE product_id=?', [req.params.id]);
      if (variants[0].count === 0) {
        return res.redirect(`/products/variants/${req.params.id}?error=Product must have at least one variant before it can be activated.`);
      }
    }
    await db.execute('UPDATE products SET status=? WHERE id=?', [newStatus, req.params.id]);
    res.redirect('/products?success=Status updated successfully.');
  } catch (err) {
    console.error('DB Error (toggleStatus):', err);
    res.redirect('/products?error=Failed to update status.');
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
exports.deleteProduct = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute('SELECT product_image FROM products WHERE id=?', [req.params.id]);
    if (!rows[0]) {
      await connection.rollback();
      return res.redirect('/products?error=Product not found.');
    }

    // ✅ FIX: Delete related records before deleting product (foreign key constraints)
    // 1. Delete product gallery images
    await connection.execute('DELETE FROM product_gallery WHERE product_id = ?', [req.params.id]);

    // 2. Delete product variants
    await connection.execute('DELETE FROM product_variants WHERE product_id = ?', [req.params.id]);

    // 3. Delete related products references
    await connection.execute('DELETE FROM related_products WHERE product_id = ? OR related_product_id = ?', [req.params.id, req.params.id]);

    // 4. Delete category mappings
    await connection.execute('DELETE FROM product_category_map WHERE product_id = ?', [req.params.id]);

    // 5. Delete order items that reference this product
    await connection.execute('DELETE FROM order_items WHERE product_id = ?', [req.params.id]);

    // 6. Finally delete the product
    if (rows[0].product_image) {
      const filePath = path.join('public/uploads/products', rows[0].product_image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    const [result] = await connection.execute('DELETE FROM products WHERE id=?', [req.params.id]);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.redirect('/products?error=Product not found.');
    }

    await connection.commit();
    res.redirect('/products?success=Product deleted successfully.');
  } catch (err) {
    await connection.rollback();
    console.error('DB Error (deleteProduct):', err);
    res.redirect('/products?error=Failed to delete product.');
  } finally {
    connection.release();
  }
};

// ─── GALLERY PAGE ─────────────────────────────────────────────────────────────
exports.galleryPage = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM products WHERE id=?', [req.params.id]);
    if (!rows[0]) return res.redirect('/products?error=Product not found.');
    const [gallery] = await db.execute('SELECT * FROM product_gallery WHERE product_id=? ORDER BY sort_order ASC', [req.params.id]);
    res.render('admin/products/gallery', {
      title: 'Product Gallery',
      subTitle: 'Products / Gallery',
      product: rows[0],
      gallery,
      success: req.query.success || null,
      error: req.query.error || null,
    });
  } catch (err) {
    console.error('DB Error (galleryPage):', err);
    res.status(500).send('Server Error: ' + err.message);
  }
};

// ─── ADD GALLERY IMAGE ────────────────────────────────────────────────────────
exports.addGalleryImage = async (req, res) => {
  try {
    const { product_id } = req.body;
    if (!req.file) return res.redirect(`/products/gallery/${product_id}?error=No image uploaded.`);
    await db.execute(
      'INSERT INTO product_gallery (product_id, image, sort_order, is_default, status) VALUES (?, ?, ?, ?, ?)',
      [product_id, req.file.filename, 0, 0, 1]
    );
    res.redirect(`/products/gallery/${product_id}?success=Image added successfully.`);
  } catch (err) {
    console.error('DB Error (addGalleryImage):', err);
    res.redirect(`/products/gallery/${req.body.product_id}?error=Failed to add image.`);
  }
};

// ─── DELETE GALLERY IMAGE ─────────────────────────────────────────────────────
exports.deleteGalleryImage = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM product_gallery WHERE id=?', [req.params.id]);
    if (!rows[0]) return res.redirect('/products?error=Image not found.');
    const filePath = path.join('public/uploads/products/gallery', rows[0].image);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await db.execute('DELETE FROM product_gallery WHERE id=?', [req.params.id]);
    res.redirect(`/products/gallery/${rows[0].product_id}?success=Image deleted successfully.`);
  } catch (err) {
    console.error('DB Error (deleteGalleryImage):', err);
    res.redirect('/products?error=Failed to delete image.');
  }
};

// ─── VARIANTS PAGE ────────────────────────────────────────────────────────────
exports.variantsPage = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM products WHERE id=?', [req.params.id]);
    if (!rows[0]) return res.redirect('/products?error=Product not found.');
    const [variants] = await db.execute('SELECT * FROM product_variants WHERE product_id=?', [req.params.id]);
    res.render('admin/products/variants', {
      title: 'Product Variants',
      subTitle: 'Products / Variants',
      product: rows[0],
      variants,
      success: req.query.success || null,
      error: req.query.error || null,
    });
  } catch (err) {
    console.error('DB Error (variantsPage):', err);
    res.status(500).send('Server Error: ' + err.message);
  }
};

// ─── ADD VARIANT ──────────────────────────────────────────────────────────────
exports.addVariant = async (req, res) => {
  try {
    const { product_id, variant_name, variant_value, price, stock } = req.body;
    await db.execute(
      'INSERT INTO product_variants (product_id, variant_name, variant_value, price, stock) VALUES (?, ?, ?, ?, ?)',
      [product_id, variant_name, variant_value, price, stock || 0]
    );
    res.redirect(`/products/variants/${product_id}?success=Variant added successfully.`);
  } catch (err) {
    console.error('DB Error (addVariant):', err);
    res.redirect(`/products/variants/${req.body.product_id}?error=Failed to add variant.`);
  }
};

// ─── DELETE VARIANT ───────────────────────────────────────────────────────────
exports.deleteVariant = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT product_id FROM product_variants WHERE id=?', [req.params.id]);
    if (!rows[0]) return res.redirect('/products?error=Variant not found.');
    await db.execute('DELETE FROM product_variants WHERE id=?', [req.params.id]);
    res.redirect(`/products/variants/${rows[0].product_id}?success=Variant deleted successfully.`);
  } catch (err) {
    console.error('DB Error (deleteVariant):', err);
    res.redirect('/products?error=Failed to delete variant.');
  }
};

const attachVariantsToProducts = async (products) => {
  if (!products || products.length === 0) return [];

  const productIds = products.map(p => p.id);
  const placeholders = productIds.map(() => '?').join(',');
  const [variants] = await db.execute(
    `SELECT * FROM product_variants WHERE product_id IN (${placeholders})`,
    productIds
  );

  const variantMap = variants.reduce((acc, variant) => {
    if (!acc[variant.product_id]) acc[variant.product_id] = [];
    acc[variant.product_id].push(variant);
    return acc;
  }, {});

  return products.map(p => ({
    ...p,
    variants: variantMap[p.id] || []
  }));
};

const getCategoryMappingsByProductIds = async (productIds) => {
  if (!productIds || productIds.length === 0) return [];

  const placeholders = productIds.map(() => '?').join(',');
  const [rows] = await db.execute(
    `SELECT
      pcm.product_id,
      pcm.category_id,
      pcm.sub_category_id,
      pcm.sub_sub_category_id,
      c.name AS category_name,
      c.slug AS category_slug,
      sc.name AS sub_category_name,
      sc.slug AS sub_category_slug,
      ssc.name AS sub_sub_category_name
    FROM product_category_map pcm
    LEFT JOIN categories c ON pcm.category_id = c.id
    LEFT JOIN sub_categories sc ON pcm.sub_category_id = sc.id
    LEFT JOIN sub_sub_categories ssc ON pcm.sub_sub_category_id = ssc.id
    WHERE pcm.product_id IN (${placeholders})
    ORDER BY pcm.id ASC`,
    productIds
  );

  return rows.map((row) => ({
    product_id: row.product_id,
    id: row.category_id,
    name: row.category_name,
    slug: row.category_slug,
    category_id: row.category_id,
    category_name: row.category_name,
    category_slug: row.category_slug,
    sub_category_id: row.sub_category_id,
    sub_category_name: row.sub_category_name,
    sub_category_slug: row.sub_category_slug,
    sub_sub_category_id: row.sub_sub_category_id,
    sub_sub_category_name: row.sub_sub_category_name,
  }));
};

const attachMappingsToProducts = async (products) => {
  if (!products || products.length === 0) return [];

  const productIds = products.map((p) => p.id);
  const mappings = await getCategoryMappingsByProductIds(productIds);

  const mappingMap = mappings.reduce((acc, mapping) => {
    if (!acc[mapping.product_id]) acc[mapping.product_id] = [];
    acc[mapping.product_id].push(mapping);
    return acc;
  }, {});

  return products.map((product) => {
    let categories = mappingMap[product.id] || [];

    if (categories.length === 0 && product.category_id) {
      categories = [{
        product_id: product.id,
        id: product.category_id,
        name: product.category_name || null,
        slug: product.category_slug || null,
        category_id: product.category_id,
        category_name: product.category_name || null,
        category_slug: product.category_slug || null,
        sub_category_id: product.sub_category_id || null,
        sub_category_name: product.sub_category_name || null,
        sub_category_slug: product.sub_category_slug || null,
        sub_sub_category_id: product.sub_sub_category_id || null,
        sub_sub_category_name: product.sub_sub_category_name || null,
      }];
    }

    return {
      ...product,
      categories,
    };
  });
};

// ─── API: GET ALL PRODUCTS ────────────────────────────────────────────────────
exports.apiGetProducts = async (req, res) => {
  try {
    const [products] = await db.execute(`
      SELECT p.*, c.name AS category_name, c.slug AS category_slug,
             sc.name AS sub_category_name, sc.slug AS sub_category_slug,
             g.gst_title, g.gst_percent
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
      LEFT JOIN gst_settings g ON p.gst_id = g.id AND g.status = 1
      WHERE p.status = 1
      ORDER BY p.created_at DESC
    `);

    if (products.length === 0) {
      return res.json({ success: true, products: [] });
    }

    const productsWithVariants = await attachVariantsToProducts(products);
    const productsWithData = await attachMappingsToProducts(productsWithVariants);

    res.json({ success: true, products: productsWithData });
  } catch (err) {
    console.error('API Error (apiGetProducts):', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─── API: GET PRODUCT BY SLUG ─────────────────────────────────────────────────
exports.apiGetProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const [products] = await db.execute(`
      SELECT p.*, c.name AS category_name, c.slug AS category_slug,
             sc.name AS sub_category_name, sc.slug AS sub_category_slug,
             g.gst_title, g.gst_percent
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
      LEFT JOIN gst_settings g ON p.gst_id = g.id AND g.status = 1
      WHERE p.product_slug = ? AND p.status = 1
    `, [slug]);

    const product = products[0];
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const [variants] = await db.execute('SELECT * FROM product_variants WHERE product_id = ?', [product.id]);
    const [gallery]  = await db.execute('SELECT * FROM product_gallery WHERE product_id = ? AND status = 1 ORDER BY sort_order ASC', [product.id]);
    const [productWithMappings] = await attachMappingsToProducts([{ ...product, variants, gallery }]);

    res.json({ success: true, product: productWithMappings });
  } catch (err) {
    console.error('API Error (apiGetProductBySlug):', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─── API: GET PRODUCT GALLERY ─────────────────────────────────────────────────
exports.apiGetProductGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const [gallery] = await db.execute('SELECT * FROM product_gallery WHERE product_id = ? AND status = 1 ORDER BY sort_order ASC', [id]);
    res.json({ success: true, gallery });
  } catch (err) {
    console.error('API Error (apiGetProductGallery):', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─── API: GET FEATURED PRODUCTS ───────────────────────────────────────────────
exports.apiGetFeaturedProducts = async (req, res) => {
  try {
    const [products] = await db.execute(`
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_featured = 1 AND p.status = 1
      ORDER BY p.created_at DESC
    `);

    const productsWithVariants = await attachVariantsToProducts(products);
    const productsWithData = await attachMappingsToProducts(productsWithVariants);
    res.json({ success: true, products: productsWithData });
  } catch (err) {
    console.error('API Error (apiGetFeaturedProducts):', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─── API: GET BEST SELLING PRODUCTS ──────────────────────────────────────────
exports.apiGetBestSellingProducts = async (req, res) => {
  try {
    const [products] = await db.execute(`
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_best_selling = 1 AND p.status = 1
      ORDER BY p.created_at DESC
    `);

    const productsWithVariants = await attachVariantsToProducts(products);
    const productsWithData = await attachMappingsToProducts(productsWithVariants);
    res.json({ success: true, products: productsWithData });
  } catch (err) {
    console.error('API Error (apiGetBestSellingProducts):', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─── API: GET NEW ARRIVAL PRODUCTS ───────────────────────────────────────────
exports.apiGetNewArrivalProducts = async (req, res) => {
  try {
    const [products] = await db.execute(`
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_new_arrival = 1 AND p.status = 1
      ORDER BY p.created_at DESC
    `);

    const productsWithVariants = await attachVariantsToProducts(products);
    const productsWithData = await attachMappingsToProducts(productsWithVariants);
    res.json({ success: true, products: productsWithData });
  } catch (err) {
    console.error('API Error (apiGetNewArrivalProducts):', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─── API: GET PRODUCT BY ID ───────────────────────────────────────────────────
exports.apiGetProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const [products] = await db.execute(`
      SELECT p.*, c.name AS category_name, c.slug AS category_slug,
             sc.name AS sub_category_name, sc.slug AS sub_category_slug,
             g.gst_title, g.gst_percent
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
      LEFT JOIN gst_settings g ON p.gst_id = g.id AND g.status = 1
      WHERE p.id = ?
    `, [id]);

    const product = products[0];
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const [variants] = await db.execute('SELECT * FROM product_variants WHERE product_id = ?', [id]);
    const [gallery]  = await db.execute('SELECT * FROM product_gallery WHERE product_id = ? AND status = 1 ORDER BY sort_order ASC', [id]);
    const [productWithMappings] = await attachMappingsToProducts([{ ...product, variants, gallery }]);

    res.json({ success: true, product: productWithMappings });
  } catch (err) {
    console.error('API Error (apiGetProductById):', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};