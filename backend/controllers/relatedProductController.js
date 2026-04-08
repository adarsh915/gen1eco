const db = require('../config/db');

exports.apiGetRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Get the category_id of the current product
    const [productRows] = await db.execute('SELECT category_id FROM products WHERE id = ?', [id]);
    
    if (productRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const categoryId = productRows[0].category_id;

    // 2. Fetch other products in the same category
    const [relatedProducts] = await db.execute(`
      SELECT p.*, c.name AS category_name, g.gst_title, g.gst_percent
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN gst_settings g ON p.gst_id = g.id AND g.status = 1
      WHERE p.category_id = ? AND p.id != ? AND p.status = 1
      ORDER BY p.created_at DESC
      LIMIT 8
    `, [categoryId, id]);

    res.json({ success: true, products: relatedProducts });
  } catch (err) {
    console.error('API Error (apiGetRelatedProducts):', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
