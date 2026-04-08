const db = require('../config/db');

const STATUSES = ['REQUESTED', 'APPROVED', 'PICKED', 'REFUNDED', 'REJECTED'];

// ─── PAGE (Admin) ────────────────────────────────────────────────────────────
exports.returnPage = async (req, res) => {
  try {
    const { status, from_date, to_date } = req.query;

    let query = `
      SELECT
        r.id, r.reason, r.status, r.refund_amount, r.created_at,
        o.order_number    AS order_no,
        u.name            AS user_name,
        u.email           AS user_email,
        p.product_name    AS product_name,
        p.price           AS product_price
      FROM order_returns r
      LEFT JOIN orders   o ON r.order_id   = o.id
      LEFT JOIN users    u ON r.user_id    = u.id
      LEFT JOIN products p ON r.product_id = p.id
      WHERE 1
    `;
    const params = [];

    if (status) { query += ' AND r.status = ?'; params.push(status); }
    if (from_date) { query += ' AND DATE(r.created_at) >= ?'; params.push(from_date); }
    if (to_date) { query += ' AND DATE(r.created_at) <= ?'; params.push(to_date); }

    query += ' ORDER BY r.created_at DESC';
    const [returns] = await db.execute(query, params);

    res.render('admin/order-returns', {
      title: 'Return Requests',
      subTitle: 'Orders / Return Requests',
      returns,
      statuses: STATUSES,
      filters: { status: status || '', from_date: from_date || '', to_date: to_date || '' },
      success: req.query.success || null,
      error: req.query.error || null,
    });
  } catch (err) {
    console.error('DB Error (returnPage):', err);
    res.status(500).send('Server Error');
  }
};

// ─── UPDATE STATUS (Admin + Stock Restoration) ──────────────────────────────
exports.updateStatus = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { status } = req.body;
    const returnId = req.params.id;

    const [returns] = await connection.execute(
      'SELECT status, order_id, product_id FROM order_returns WHERE id = ?', [returnId]
    );

    if (returns.length === 0) {
      await connection.rollback();
      return res.redirect('/order-returns?error=Return request not found.');
    }

    const { status: oldStatus, order_id, product_id } = returns[0];
    await connection.execute('UPDATE order_returns SET status=? WHERE id=?', [status, returnId]);

    // RESTORE STOCK IF STATUS CHANGED TO REFUNDED
    if (status === 'REFUNDED' && oldStatus !== 'REFUNDED') {
      const [items] = await connection.execute(
        'SELECT variant_id, quantity FROM order_items WHERE order_id = ? AND product_id = ?',
        [order_id, product_id]
      );
      if (items.length > 0) {
        const { variant_id, quantity } = items[0];
        await connection.execute('UPDATE products SET stock = stock + ? WHERE id = ?', [quantity, product_id]);
        if (variant_id) {
          await connection.execute('UPDATE product_variants SET stock = stock + ? WHERE id = ?', [quantity, variant_id]);
        }
      }
    }

    await connection.commit();
    res.redirect('/order-returns?success=Status updated successfully.');
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('DB Error (updateStatus):', err);
    res.redirect('/order-returns?error=Failed to update status.');
  } finally {
    if (connection) connection.release();
  }
};

// ─── DELETE (Admin) ───────────────────────────────────────────────────────────
exports.deleteReturn = async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM order_returns WHERE id=?', [req.params.id]);
    res.redirect('/order-returns?success=Return request deleted successfully.');
  } catch (err) {
    res.redirect('/order-returns?error=Failed to delete return.');
  }
};

// ─── API: CREATE RETURN (User) ────────────────────────────────────────────────
exports.apiCreateReturn = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { order_id, product_id, reason } = req.body;
    const userId = req.user.id;

    const [orders] = await connection.execute(
      'SELECT order_status FROM orders WHERE id = ? AND user_id = ?', [order_id, userId]
    );

    if (orders.length === 0 || orders[0].order_status !== 'DELIVERED') {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Invalid order or order not delivered.' });
    }

    await connection.execute(
      'INSERT INTO order_returns (order_id, user_id, product_id, reason, status) VALUES (?, ?, ?, ?, ?)',
      [order_id, userId, product_id, reason, 'REQUESTED']
    );

    await connection.commit();
    res.json({ success: true, message: 'Return request submitted successfully.' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ success: false, message: 'Failed to submit.' });
  } finally {
    connection.release();
  }
};
