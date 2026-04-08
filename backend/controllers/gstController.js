const db = require('../config/db');

// ─── PAGE ─────────────────────────────────────────────────────────────────────
exports.gstPage = async (req, res) => {
  try {
    const [gstList] = await db.execute('SELECT * FROM gst_settings ORDER BY created_at DESC');
    res.render('admin/gst-settings', {
      title: 'GST Settings',
      subTitle: 'Settings / GST Settings',
      gstList,
      success: req.query.success || null,
      error:   req.query.error   || null,
    });
  } catch (err) {
    console.error('DB Error (gstPage):', err);
    res.status(500).send('Server Error');
  }
};

// ─── CREATE ───────────────────────────────────────────────────────────────────
exports.createGst = async (req, res) => {
  try {
    const { gst_title, gst_percent, status } = req.body;
    const statusVal = status === 'on' ? 1 : 0;
    await db.execute(
      'INSERT INTO gst_settings (gst_title, gst_percent, status) VALUES (?, ?, ?)',
      [gst_title, gst_percent, statusVal]
    );
    res.redirect('/gst-settings?success=GST created successfully.');
  } catch (err) {
    console.error('DB Error (createGst):', err);
    res.redirect('/gst-settings?error=Failed to create GST.');
  }
};

// ─── TOGGLE STATUS ────────────────────────────────────────────────────────────
exports.toggleStatus = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT status FROM gst_settings WHERE id=?', [req.params.id]);
    if (!rows[0]) return res.redirect('/gst-settings?error=GST not found.');
    const newStatus = rows[0].status == 1 ? 0 : 1;
    await db.execute('UPDATE gst_settings SET status=? WHERE id=?', [newStatus, req.params.id]);
    res.redirect('/gst-settings?success=Status updated successfully.');
  } catch (err) {
    console.error('DB Error (toggleStatus):', err);
    res.redirect('/gst-settings?error=Failed to update status.');
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
exports.deleteGst = async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM gst_settings WHERE id=?', [req.params.id]);
    if (result.affectedRows === 0) return res.redirect('/gst-settings?error=GST not found.');
    res.redirect('/gst-settings?success=GST deleted successfully.');
  } catch (err) {
    console.error('DB Error (deleteGst):', err);
    res.redirect('/gst-settings?error=Failed to delete GST.');
  }
};