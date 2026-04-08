const db = require('../config/db');
const emailService = require('../services/emailService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

require('dotenv').config();

/**
 * Generate a secure temporary password
 * @returns {string} Temporary password
 */
function generateTempPassword() {
  return crypto.randomBytes(8).toString('hex');
}

/**
 * Send guest welcome email with login credentials
 */
function guestWelcomeTemplate(user, tempPassword) {
  const userName = user.name || 'Customer';
  return {
    subject: 'Welcome to Gen1Eco! Your order is confirmed',
    html: `
      <h2>Hi ${userName},</h2>
      <p>Thank you for your order at Gen1Eco! Your order has been placed successfully.</p>
      
      <h3>Your Login Credentials:</h3>
      <p>
        <strong>Email:</strong> ${user.email}<br>
        <strong>Password:</strong> ${tempPassword}
      </p>
      
      <p>You can now log in to your account and track your order. We recommend changing your password after your first login.</p>
      
      <h3>Order Details:</h3>
      <p>Order Number: <strong>${user.order_number}</strong></p>
      <p>Total Amount: <strong>₹${user.total_amount}</strong></p>
      
      <p>We will keep you updated about shipping and delivery.</p>
      <p>Best regards,<br/>Gen1Eco Team</p>
    `,
  };
}

/**
 * Validate guest checkout data
 */
function validateGuestCheckoutData(data) {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Full name is required (minimum 2 characters)');
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.phone || !/^\d{10}$/.test(data.phone.replace(/\D/g, ''))) {
    errors.push('Valid 10-digit phone number is required');
  }

  if (!data.shipping_address || data.shipping_address.trim().length < 5) {
    errors.push('Valid address is required');
  }

  if (!data.city || data.city.trim().length < 2) {
    errors.push('City is required');
  }

  if (!data.state || data.state.trim().length < 2) {
    errors.push('State is required');
  }

  if (!data.pincode || !/^\d{6}$/.test(data.pincode.toString())) {
    errors.push('Valid 6-digit pincode is required');
  }

  if (!data.country || data.country.trim().length < 2) {
    errors.push('Country is required');
  }

  if (!data.cart || !Array.isArray(data.cart) || data.cart.length === 0) {
    errors.push('Cart is empty');
  }

  if (!data.total_amount || data.total_amount <= 0) {
    errors.push('Valid total amount is required');
  }

  if (!data.payment_method) {
    errors.push('Payment method is required');
  }

  return errors;
}

/**
 * Create guest user account
 */
async function createGuestUser(name, email, phone) {
  const tempPassword = generateTempPassword();
  // ✅ FIX: Use stronger salt rounds
  const hashedPassword = await bcrypt.hash(tempPassword, 12);
  const guestToken = crypto.randomBytes(16).toString('hex');

  const [result] = await db.execute(
    `INSERT INTO users (role, name, email, phone, password, status, cart_data, wishlist_data, is_guest_checkout, guest_checkout_token) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['user', name, email, phone || null, hashedPassword, 1, '[]', '[]', 1, guestToken]
  );

  return {
    user_id: result.insertId,
    temp_password: tempPassword,
    guest_token: guestToken,
  };
}

/**
 * Construct complete shipping address from individual fields
 */
function constructShippingAddress(addressData) {
  const parts = [];
  
  if (addressData.shipping_address && addressData.shipping_address.trim()) {
    parts.push(addressData.shipping_address.trim());
  }
  
  if (addressData.landmark && addressData.landmark.trim()) {
    parts.push(addressData.landmark.trim());
  }
  
  if (addressData.city && addressData.city.trim()) {
    parts.push(addressData.city.trim());
  }
  
  if (addressData.state && addressData.state.trim()) {
    parts.push(addressData.state.trim());
  }
  
  if (addressData.pincode) {
    parts.push(addressData.pincode.toString().trim());
  }
  
  if (addressData.country && addressData.country.trim()) {
    parts.push(addressData.country.trim());
  }
  
  return parts.join(', ');
}

/**
 * Save guest address
 */
async function saveGuestAddress(userId, addressData) {
  const completeAddress = constructShippingAddress(addressData);
  
  const [result] = await db.execute(
    `INSERT INTO user_addresses 
     (user_id, address_type, full_name, email, phone, country, state, city, landmark, address, pincode, is_default) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      'home',
      addressData.name,
      addressData.email,
      addressData.phone,
      addressData.country,
      addressData.state,
      addressData.city,
      addressData.landmark || null,
      completeAddress,
      addressData.pincode,
      1, // Set as default
    ]
  );

  return result.insertId;
}

/**
 * API: Validate email uniqueness for guest checkout
 */
exports.apiValidateEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }

    const [rows] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);

    if (rows.length > 0) {
      return res.json({ success: true, available: false, message: 'Email already registered. Please login or use a different email.' });
    }

    res.json({ success: true, available: true, message: 'Email is available' });
  } catch (err) {
    console.error('API Error (apiValidateEmail):', err);
    res.status(500).json({ success: false, message: 'Failed to validate email.' });
  }
};

/**
 * API: Create order as guest (main guest checkout endpoint)
 */
exports.apiCreateGuestOrder = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const {
      name,
      email,
      phone,
      cart,
      total_amount,
      subtotal,
      gst,
      discount,
      coupon_code,
      shipping_address,
      city,
      state,
      country,
      landmark,
      pincode,
      payment_method,
      order_notes,
    } = req.body;

    // Validate all required data
    const validationErrors = validateGuestCheckoutData({
      name,
      email,
      phone,
      cart,
      total_amount,
      shipping_address,
      city,
      state,
      country,
      pincode,
      payment_method,
    });

    if (validationErrors.length > 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: validationErrors.join(', ') });
    }

    // Check if email already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: 'Email already registered. Please login or use a different email.',
      });
    }

    // Create guest user account
    const userResult = await createGuestUser(name, email, phone);
    const userId = userResult.user_id;
    const tempPassword = userResult.temp_password;

    // Create order
    const orderNumber = 'ORD-' + Date.now();
    const completeShippingAddress = constructShippingAddress({
      shipping_address,
      landmark,
      city,
      state,
      pincode,
      country,
    });

    const [orderResult] = await connection.execute(
      `INSERT INTO orders 
       (user_id, order_number, total_amount, subtotal, tax, discount, coupon_code, shipping_address, payment_method, order_notes, order_status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        orderNumber,
        total_amount,
        subtotal || total_amount,
        gst || 0,
        discount || 0,
        coupon_code || null,
        completeShippingAddress,
        payment_method || 'COD',
        order_notes || null,
        'PENDING',
      ]
    );

    const orderId = orderResult.insertId;

    // Insert order items and decrement stock
    for (const item of cart) {
      const isVariant = !!item.selectedVariant;
      const itemPrice = isVariant
        ? Number(item.selectedVariant.price)
        : Number(item.sale_price || item.price || 0);

      const variantId = isVariant ? item.selectedVariant.id : null;
      const variantName = isVariant
        ? `${item.selectedVariant.variant_name}${item.selectedVariant.variant_value ? ` (${item.selectedVariant.variant_value})` : ''}`
        : null;

      await connection.execute(
        `INSERT INTO order_items 
         (order_id, product_id, variant_id, product_name, variant_name, price, quantity, total) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.id, variantId, item.product_name || item.name, variantName, itemPrice, item.qty, itemPrice * item.qty]
      );

      // Decrement stock
      if (variantId) {
        await connection.execute(
          'UPDATE product_variants SET stock = GREATEST(stock - ?, 0) WHERE id = ?',
          [item.qty, variantId]
        );
      }
      await connection.execute(
        'UPDATE products SET stock = GREATEST(stock - ?, 0) WHERE id = ?',
        [item.qty, item.id]
      );
    }

    // Save address
    const addressData = {
      name,
      email,
      phone,
      country,
      state,
      city,
      landmark,
      shipping_address,
      pincode,
    };
    await saveGuestAddress(userId, addressData);

    // Record coupon usage if provided
    if (coupon_code) {
      const [couponRows] = await connection.execute(
        'SELECT id FROM coupons WHERE code = ?',
        [coupon_code.toUpperCase()]
      );
      if (couponRows.length > 0) {
        const couponId = couponRows[0].id;
        await connection.execute(
          'INSERT INTO coupon_usage (coupon_id, user_id, order_id) VALUES (?, ?, ?)',
          [couponId, userId, orderId]
        );
      }
    }

    await connection.commit();

    // Send welcome email with credentials (best-effort)
    try {
      const welcTemplate = emailService.guestCheckoutWelcomeTemplate(
        { name, email },
        tempPassword,
        { order_number: orderNumber, total_amount, order_status: 'PENDING' }
      );
      await emailService.sendMail({
        to: email,
        subject: welcTemplate.subject,
        html: welcTemplate.html,
      });
    } catch (emailErr) {
      console.error('Guest welcome email error:', emailErr);
      // Don't fail the checkout if email fails
    }

    // Generate JWT token for automatic login
    const token = jwt.sign(
      { id: userId, email, role: 'user', version: 0 },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '8h' }
    );

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Account created and credentials sent to your email.',
      order_id: orderId,
      order_number: orderNumber,
      user_id: userId,
      email,
      token, // Auto-login token
      is_guest_checkout: true,
    });
  } catch (err) {
    await connection.rollback();
    console.error('API Error (apiCreateGuestOrder):', err);
    res.status(500).json({ success: false, message: 'Failed to place order.' });
  } finally {
    connection.release();
  }
};

/**
 * API: Convert guest checkout to regular user (if needed for password change)
 */
exports.apiMarkGuestCheckoutComplete = async (req, res) => {
  try {
    const userId = req.user.id;

    // Mark guest_checkout_token as used (nullify it)
    await db.execute(
      'UPDATE users SET is_guest_checkout = 0, guest_checkout_token = NULL WHERE id = ?',
      [userId]
    );

    res.json({ success: true, message: 'Guest checkout status updated.' });
  } catch (err) {
    console.error('API Error (apiMarkGuestCheckoutComplete):', err);
    res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
};
