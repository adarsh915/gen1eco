const db = require('../config/db');

// --- STOCK MANAGEMENT PAGE ---
exports.stockPage = async (req, res) => {
  try {
    const { search } = req.query;

    let query = `
      SELECT 
        v.id AS variant_id,
        v.variant_name,
        v.variant_value,
        v.price,
        v.stock,
        p.id AS product_id,
        p.product_name,
        p.product_image,
        p.status AS product_status
      FROM product_variants v
      JOIN products p ON v.product_id = p.id
      WHERE 1
    `;
    
    const params = [];

    if (search) {
      query += ' AND (p.product_name LIKE ? OR v.variant_name LIKE ? OR v.variant_value LIKE ?)';
      const searchTerm = '%' + search + '%';
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY p.id DESC, v.id ASC';

    const [stockItems] = await db.execute(query, params);

    res.render('admin/stock/index', {
      title: 'Stock Management',
      subTitle: 'Products / Stock',
      stockItems,
      search: search || '',
      success: req.query.success || null,
      error: req.query.error || null,
    });
  } catch (err) {
    console.error('DB Error (stockPage):', err);
    res.status(500).send('Server Error');
  }
};

// --- UPDATE STOCK (AJAX) ---
exports.updateStock = async (req, res) => {
  try {
    const { variant_id, stock } = req.body;
    
    if (!variant_id || stock === undefined || isNaN(stock)) {
      return res.status(400).json({ success: false, message: 'Invalid input data.' });
    }

    const [result] = await db.execute(
      'UPDATE product_variants SET stock = ? WHERE id = ?',
      [parseInt(stock, 10), variant_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Variant not found.' });
    }

    // Also sync to main products table for the parent product
    const [variantRows] = await db.execute('SELECT product_id, variant_value FROM product_variants WHERE id = ?', [variant_id]);
    if (variantRows.length > 0) {
      const { product_id, variant_value } = variantRows[0];
      // Only sync if it's the "default" variant (1 Ltr or Standard)
      if (variant_value === '1 Ltr' || variant_value === 'Standard' || variant_value === 'Regular') {
        await db.execute('UPDATE products SET stock = ? WHERE id = ?', [parseInt(stock, 10), product_id]);
      }
    }

    res.json({ success: true, message: 'Stock updated successfully.' });
  } catch (err) {
    console.error('DB Error (updateStock):', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
