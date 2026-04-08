const db = require('../config/db');
const emailService = require('../services/emailService');

const STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];

// ─── LIST PAGE ────────────────────────────────────────────────────────────────
exports.orderPage = async (req, res) => {
  try {
    const { status, from_date, to_date } = req.query;

    let query = `
      SELECT
        o.id,
        o.order_number,
        o.total_amount,
        o.payment_method,
        o.order_status,
        o.created_at,
        u.name  AS user_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE 1
    `;
    const params = [];

    if (status) {
      query += ' AND o.order_status = ?';
      params.push(status);
    }
    if (from_date) {
      query += ' AND DATE(o.created_at) >= ?';
      params.push(from_date);
    }
    if (to_date) {
      query += ' AND DATE(o.created_at) <= ?';
      params.push(to_date);
    }

    query += ' ORDER BY o.created_at DESC';

    const [orders] = await db.execute(query, params);

    res.render('admin/orders/index', {
      title: 'Orders Management',
      subTitle: 'Orders / Manage',
      orders,
      statuses: STATUSES,
      filters: { status: status || '', from_date: from_date || '', to_date: to_date || '' },
      success: req.query.success || null,
      error: req.query.error || null,
    });
  } catch (err) {
    console.error('DB Error (orderPage):', err);
    res.status(500).send('Server Error');
  }
};

exports.viewOrder = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        o.*,
        u.name   AS user_name,
        u.email  AS user_email,
        u.phone  AS user_phone
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [req.params.id]);

    if (!rows[0]) return res.redirect('/orders?error=Order not found.');
    const order = rows[0];

    const [items] = await db.execute(`
      SELECT * FROM order_items WHERE order_id = ?
    `, [req.params.id]);

    res.render('admin/orders/view', {
      title: 'Order Details',
      subTitle: 'Orders / View',
      order,
      items,
      statuses: STATUSES,
      success: req.query.success || null,
      error: req.query.error || null,
    });
  } catch (err) {
    console.error('DB Error (viewOrder):', err);
    res.status(500).send('Server Error');
  }
};
// ─── UPDATE STATUS ────────────────────────────────────────────────────────────
exports.updateStatus = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { order_status } = req.body;
    const orderId = req.params.id;

    // Get current status and user info to check if we need to restore stock and send email
    const [orders] = await connection.execute(
      `SELECT o.order_status, o.order_number, o.total_amount, u.name AS user_name, u.email AS user_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [orderId]
    );
    if (orders.length === 0) {
      await connection.rollback();
      return res.redirect('/orders?error=Order not found.');
    }
    const oldStatus = orders[0].order_status;

    // Update status
    await connection.execute('UPDATE orders SET order_status=? WHERE id=?', [order_status, orderId]);

    // If changing TO Cancelled/Returned FROM something else, RESTORE stock
    if ((order_status === 'CANCELLED' || order_status === 'RETURNED') && (oldStatus !== 'CANCELLED' && oldStatus !== 'RETURNED')) {
      const [items] = await connection.execute('SELECT product_id, variant_id, quantity FROM order_items WHERE order_id = ?', [orderId]);
      for (const item of items) {
        if (item.variant_id) {
          await connection.execute('UPDATE product_variants SET stock = stock + ? WHERE id = ?', [item.quantity, item.variant_id]);
        }
        await connection.execute('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
      }
    }
    // If changing FROM Cancelled/Returned TO something else (e.g. re-processing), DEDUCT stock again
    else if ((oldStatus === 'CANCELLED' || oldStatus === 'RETURNED') && (order_status !== 'CANCELLED' && order_status !== 'RETURNED')) {
      const [items] = await connection.execute('SELECT product_id, variant_id, quantity FROM order_items WHERE order_id = ?', [orderId]);
      for (const item of items) {
        if (item.variant_id) {
          await connection.execute('UPDATE product_variants SET stock = GREATEST(stock - ?, 0) WHERE id = ?', [item.quantity, item.variant_id]);
        }
        await connection.execute('UPDATE products SET stock = GREATEST(stock - ?, 0) WHERE id = ?', [item.quantity, item.product_id]);
      }
    }

    await connection.commit();

    const order = orders[0];
    if (order.user_email) {
      const statusTemplate = emailService.orderStatusUpdateTemplate(
        { order_number: order.order_number, total_amount: order.total_amount, user_name: order.user_name },
        oldStatus,
        order_status
      );
      emailService.sendMail({
        to: order.user_email,
        subject: statusTemplate.subject,
        html: statusTemplate.html,
      }).catch((err) => console.error('Order status update email error:', err));
    }

    res.redirect(`/orders/view/${orderId}?success=Order status updated successfully.`);
  } catch (err) {
    await connection.rollback();
    console.error('DB Error (updateStatus):', err);
    res.redirect('/orders?error=Failed to update status.');
  } finally {
    connection.release();
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
exports.deleteOrder = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    await connection.execute('DELETE FROM coupon_usage WHERE order_id = ?', [req.params.id]);
    await connection.execute('DELETE FROM order_items WHERE order_id = ?', [req.params.id]);
    const [result] = await connection.execute('DELETE FROM orders WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.redirect('/orders?error=Order not found.');
    }
    
    await connection.commit();
    res.redirect('/orders?success=Order deleted successfully.');
  } catch (err) {
    await connection.rollback();
    console.error('DB Error (deleteOrder):', err);
    res.redirect('/orders?error=Failed to delete order.');
  } finally {
    connection.release();
  }
};
// --- API: CREATE ORDER --------------------------------------------------------
exports.apiCreateOrder = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { cart, total_amount, subtotal, gst, discount, coupon_code, shipping_address, payment_method, order_notes } = req.body;
    const user_id = req.user.id;
    const order_number = 'ORD-' + Date.now();

    const [result] = await connection.execute(
      'INSERT INTO orders (user_id, order_number, total_amount, subtotal, tax, discount, coupon_code, shipping_address, payment_method, order_notes, order_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, order_number, total_amount, subtotal || total_amount, gst || 0, discount || 0, coupon_code || null, shipping_address, payment_method || 'COD', order_notes || null, 'PENDING']
    );

    const order_id = result.insertId;

    for (const item of cart) {
      const isVariant = !!item.selectedVariant;
      const itemPrice = isVariant
        ? Number(item.selectedVariant.price)
        : Number(item.sale_price || item.price || 0);

      const variantId = isVariant ? item.selectedVariant.id : null;
      const variantName = isVariant
        ? `${item.selectedVariant.variant_name}${item.selectedVariant.variant_value ? ` (${item.selectedVariant.variant_value})` : ""}`
        : null;

      await connection.execute(
        'INSERT INTO order_items (order_id, product_id, variant_id, product_name, variant_name, price, quantity, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [order_id, item.id, variantId, item.product_name || item.name, variantName, itemPrice, item.qty, itemPrice * item.qty]
      );

      // Decrement stock levels
      if (variantId) {
        await connection.execute('UPDATE product_variants SET stock = GREATEST(stock - ?, 0) WHERE id = ?', [item.qty, variantId]);
      }
      await connection.execute('UPDATE products SET stock = GREATEST(stock - ?, 0) WHERE id = ?', [item.qty, item.id]);
    }

    // Record Coupon Usage
    if (coupon_code) {
      const [couponRows] = await connection.execute('SELECT id FROM coupons WHERE code = ?', [coupon_code.toUpperCase()]);
      if (couponRows.length > 0) {
        const coupon_id = couponRows[0].id;
        await connection.execute(
          'INSERT INTO coupon_usage (coupon_id, user_id, order_id) VALUES (?, ?, ?)',
          [coupon_id, user_id, order_id]
        );
      }
    }

    await connection.commit();

    // Send order confirmation email (best-effort)
    const [userRows] = await db.execute('SELECT name, email FROM users WHERE id = ?', [user_id]);
    if (userRows.length > 0 && userRows[0].email) {
      const orderData = {
        order_number,
        total_amount,
        order_status: 'PENDING',
      };
      const orderTemplate = emailService.orderCreatedTemplate(orderData, userRows[0]);
      emailService.sendMail({
        to: userRows[0].email,
        subject: orderTemplate.subject,
        html: orderTemplate.html,
      }).catch((err) => console.error('Order confirmation email error:', err));
    }

    res.status(201).json({ success: true, order_id, order_number });
  } catch (err) {
    await connection.rollback();
    console.error('API Error (apiCreateOrder):', err);
    res.status(500).json({ success: false, message: 'Failed to place order.' });
  } finally {
    connection.release();
  }
};

// --- API: GET USER ORDERS -----------------------------------------------------
exports.apiGetUserOrders = async (req, res) => {
  try {
    const user_id = req.user.id;
    const [orders] = await db.execute(`
      SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
    `, [user_id]);
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const [items] = await db.execute(`
        SELECT oi.*, r.status AS return_status 
        FROM order_items oi 
        LEFT JOIN order_returns r ON oi.order_id = r.order_id AND oi.product_id = r.product_id
        WHERE oi.order_id = ?
      `, [order.id]);
      return { ...order, items };
    }));
    res.json({ success: true, orders: ordersWithItems });
  } catch (err) {
    console.error('API Error (apiGetUserOrders):', err);
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
};


//ad
// --- API: CANCEL ORDER (User) -------------------------------------------------
exports.apiCancelOrder = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const orderId = req.params.id;
    const userId = req.user.id;

    // 1. Check if the order exists and belongs to the user
    const [orders] = await connection.execute(
      `SELECT o.order_status, o.order_number, o.total_amount, u.name AS user_name, u.email AS user_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = ? AND o.user_id = ?`,
      [orderId, userId]
    );

    if (orders.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];

    // 2. Check if the order is in a cancellable state
    const cancellableStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING'];
    if (!cancellableStatuses.includes(order.order_status)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already ${order.order_status}.`
      });
    }

    // 3. Update status to CANCELLED
    await connection.execute('UPDATE orders SET order_status=? WHERE id=?', ['CANCELLED', orderId]);

    // 4. Restore stock
    const [items] = await connection.execute('SELECT product_id, variant_id, quantity FROM order_items WHERE order_id = ?', [orderId]);
    for (const item of items) {
      if (item.variant_id) {
        await connection.execute('UPDATE product_variants SET stock = stock + ? WHERE id = ?', [item.quantity, item.variant_id]);
      }
      await connection.execute('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
    }

    await connection.commit();

    // 5. Send cancellation email
    if (order.user_email) {
      const cancelTemplate = emailService.orderStatusUpdateTemplate(
        { order_number: order.order_number, total_amount: order.total_amount, user_name: order.user_name },
        order.order_status,
        'CANCELLED'
      );
      emailService.sendMail({
        to: order.user_email,
        subject: `Order Cancelled - ${order.order_number}`,
        html: cancelTemplate.html,
      }).catch((err) => console.error('Order cancellation email error:', err));
    }

    res.json({ success: true, message: 'Order cancelled successfully.' });
  } catch (err) {
    await connection.rollback();
    console.error('API Error (apiCancelOrder):', err);
    res.status(500).json({ success: false, message: 'Failed to cancel order.' });
  } finally {
    connection.release();
  }
};


// --- API: GET ORDER BY ID (User) -----------------------------------------------
exports.apiGetOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const [orders] = await db.execute(
      'SELECT * FROM orders WHERE id=? AND user_id=?',
      [orderId, userId]
    );
    if (orders.length === 0) return res.status(404).json({ success: false, message: 'Order not found.' });
    const order = orders[0];
    const [items] = await db.execute(`
      SELECT oi.*, r.status AS return_status 
      FROM order_items oi 
      LEFT JOIN order_returns r ON oi.order_id = r.order_id AND oi.product_id = r.product_id
      WHERE oi.order_id = ?
    `, [orderId]);
    res.json({ success: true, order: { ...order, items } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};


