const db = require('../config/db');

// ─── PAGE ─────────────────────────────────────────────────────────────────────
exports.usagePage = async (req, res) => {
  try {
    const [usageList] = await db.execute(`
      SELECT
        cu.id,
        cu.used_at,
        c.code          AS coupon_code,
        u.name          AS user_name,
        u.email         AS user_email,
        o.order_number  AS order_no,
        o.total_amount  AS order_amount
      FROM coupon_usage cu
      LEFT JOIN coupons c ON cu.coupon_id = c.id
      LEFT JOIN users   u ON cu.user_id   = u.id
      LEFT JOIN orders  o ON cu.order_id  = o.id
      ORDER BY cu.used_at DESC
    `);
    res.render('admin/coupon-usage', {
      title: 'Coupon Usage Report',
      subTitle: 'Coupons / Usage Report',
      usageList,
      success: req.query.success || null,
      error:   req.query.error   || null,
    });
  } catch (err) {
    console.error('DB Error (usagePage):', err);
    res.status(500).send('Server Error');
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
exports.deleteUsage = async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM coupon_usage WHERE id=?', [req.params.id]);
    if (result.affectedRows === 0) return res.redirect('/coupon-usage?error=Record not found.');
    res.redirect('/coupon-usage?success=Usage record deleted successfully.');
  } catch (err) {
    console.error('DB Error (deleteUsage):', err);
    res.redirect('/coupon-usage?error=Failed to delete record.');
  }
};