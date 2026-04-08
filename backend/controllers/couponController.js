const db = require('../config/db');

// ─── PAGE ─────────────────────────────────────────────────────────────────────
exports.couponPage = async (req, res) => {
  try {
    const [coupons] = await db.execute('SELECT * FROM coupons ORDER BY created_at DESC');
    res.render('admin/coupons', {
      title: 'Coupons Management',
      subTitle: 'Coupons / Manage',
      coupons,
      success: req.query.success || null,
      error: req.query.error || null,
    });
  } catch (err) {
    console.error('DB Error (couponPage):', err);
    res.status(500).send('Server Error');
  }
};

// ─── CREATE ───────────────────────────────────────────────────────────────────
exports.createCoupon = async (req, res) => {
  try {
    const { code, discount_type, discount_value, min_order_amount, max_discount_amount, expiry_date, status } = req.body;
    await db.execute(
      'INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount_amount, expiry_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        code.toUpperCase(),
        discount_type,
        discount_value,
        min_order_amount || 0,
        max_discount_amount || null,
        expiry_date || null,
        status
      ]
    );
    res.redirect('/coupons?success=Coupon created successfully.');
  } catch (err) {
    console.error('DB Error (createCoupon):', err);
    res.redirect('/coupons?error=Failed to create coupon. Code may already exist.');
  }
};

// ─── TOGGLE STATUS ────────────────────────────────────────────────────────────
exports.toggleStatus = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT status FROM coupons WHERE id=?', [req.params.id]);
    if (!rows[0]) return res.redirect('/coupons?error=Coupon not found.');
    const newStatus = rows[0].status == 1 ? 0 : 1;
    await db.execute('UPDATE coupons SET status=? WHERE id=?', [newStatus, req.params.id]);
    res.redirect('/coupons?success=Status updated successfully.');
  } catch (err) {
    console.error('DB Error (toggleStatus):', err);
    res.redirect('/coupons?error=Failed to update status.');
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
exports.deleteCoupon = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    await connection.execute('DELETE FROM coupon_usage WHERE coupon_id = ?', [req.params.id]);
    const [result] = await connection.execute('DELETE FROM coupons WHERE id=?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.redirect('/coupons?error=Coupon not found.');
    }
    
    await connection.commit();
    res.redirect('/coupons?success=Coupon deleted successfully.');
  } catch (err) {
    await connection.rollback();
    console.error('DB Error (deleteCoupon):', err);
    res.redirect('/coupons?error=Failed to delete coupon.');
  } finally {
    connection.release();
  }
};

// --- API: VALIDATE COUPON -----------------------------------------------------
exports.apiValidateCoupon = async (req, res) => {
  try {
    const { coupon_code, amount } = req.body;
    if (!coupon_code) return res.status(400).json({ success: false, message: 'Coupon code is required.' });

    const [rows] = await db.execute(
      'SELECT * FROM coupons WHERE code = ? AND status = 1',
      [coupon_code.toUpperCase()]
    );

    const coupon = rows[0];
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code.' });

    // Check if user has already used this coupon
    const [usageRows] = await db.execute(
      'SELECT id FROM coupon_usage WHERE coupon_id = ? AND user_id = ?',
      [coupon.id, req.user.id]
    );
    if (usageRows.length > 0) {
      return res.status(400).json({ success: false, message: 'You have already used this coupon.' });
    }

    // Check Expiry
    if (coupon.expiry_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiry = new Date(coupon.expiry_date);
      expiry.setHours(0, 0, 0, 0);

      if (expiry < today) {
        return res.status(400).json({ success: false, message: 'Coupon has expired.' });
      }
    }

    // Check Min Order Amount
    if (amount < coupon.min_order_amount) {
      return res.status(400).json({ success: false, message: `Minimum order amount for this coupon is ₹${coupon.min_order_amount}` });
    }

    // Calculate Discount
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (amount * coupon.discount_value) / 100;
      if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
        discount = coupon.max_discount_amount;
      }
    } else {
      discount = coupon.discount_value;
    }

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: discount
      }
    });

  } catch (err) {
    console.error('API Error (apiValidateCoupon):', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.apiValidateCouponGuest = async (req, res) => {
  try {
    const { coupon_code, amount } = req.body;
    if (!coupon_code) return res.status(400).json({ success: false, message: 'Coupon code is required.' });

    const [rows] = await db.execute(
      'SELECT * FROM coupons WHERE code = ? AND status = 1',
      [coupon_code.toUpperCase()]
    );

    const coupon = rows[0];
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code.' });

    // Check Expiry
    if (coupon.expiry_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiry = new Date(coupon.expiry_date);
      expiry.setHours(0, 0, 0, 0);

      if (expiry < today) {
        return res.status(400).json({ success: false, message: 'Coupon has expired.' });
      }
    }

    // Check Min Order Amount
    if (amount < coupon.min_order_amount) {
      return res.status(400).json({ success: false, message: `Minimum order amount for this coupon is ₹${coupon.min_order_amount}` });
    }

    // Calculate Discount
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (amount * coupon.discount_value) / 100;
      if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
        discount = coupon.max_discount_amount;
      }
    } else {
      discount = coupon.discount_value;
    }

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: discount
      }
    });

  } catch (err) {
    console.error('API Error (apiValidateCoupon):', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};