const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');
const { validatePassword } = require('../utils/passwordValidator');
const { validateFileUpload } = require('../utils/uploadValidator');

require('dotenv').config();

// ─── MULTER ───────────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/uploads/users';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname.replace(/\s+/g, '_'));
  }
});
exports.upload = multer({ storage });

// ─── LIST PAGE ────────────────────────────────────────────────────────────────
exports.listPage = async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, role, name, email, phone, photo, status, logged_in, last_login, created_at FROM users WHERE role != ? ORDER BY created_at DESC, id DESC',
      ['admin']
    );

    const stats = {
      total: users.length,
      active: users.filter((user) => Number(user.status) === 1).length,
      blocked: users.filter((user) => Number(user.status) !== 1).length,
      online: users.filter((user) => Number(user.logged_in) === 1).length,
      offline: users.filter((user) => Number(user.logged_in) !== 1).length,
    };

    res.render('admin/users/index', {
      title: 'User Accounts',
      subTitle: 'Users / List',
      users,
      stats,
      success: req.query.success || null,
      error: req.query.error || null,
    });
  } catch (err) {
    console.error('DB Error (listPage):', err);
    res.status(500).send('Server Error');
  }
};

// ─── ADD PAGE ─────────────────────────────────────────────────────────────────
exports.addPage = (req, res) => {
  res.render('admin/users/form', {
    title: 'Add User',
    subTitle: 'Users / Add',
    user: null,
    error: req.query.error || null,
    success: null,
  });
};

// ─── EDIT PAGE ────────────────────────────────────────────────────────────────
exports.editPage = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, role, name, email, phone, photo, dob, gender, status FROM users WHERE id=?',
      [req.params.id]
    );
    if (!rows[0]) return res.redirect('/admin-users?error=User not found.');
    res.render('admin/users/form', {
      title: 'Edit User',
      subTitle: 'Users / Edit',
      user: rows[0],
      success: req.query.success || null,
      error: req.query.error || null,
    });
  } catch (err) {
    console.error('DB Error (editPage):', err);
    res.status(500).send('Server Error');
  }
};

// ─── CREATE ───────────────────────────────────────────────────────────────────
exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, role, dob, gender, password, status } = req.body;
    const photo = req.file ? req.file.filename : null;

    // ✅ FIX: Add input validation
    if (!password) {
      return res.redirect('/admin-users/add?error=Password is required.');
    }

    // ✅ FIX: Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.redirect(`/admin-users/add?error=${encodeURIComponent(passwordValidation.errors.join(', '))}`);
    }

    // Check duplicate email
    const [existing] = await db.execute('SELECT id FROM users WHERE email=?', [email]);
    if (existing[0]) return res.redirect('/admin-users/add?error=Email already exists.');

    // ✅ FIX: Use stronger salt rounds and validate file
    if (photo && req.file) {
      const fileValidation = validateFileUpload(req.file, 'image');
      if (!fileValidation.valid) {
        return res.redirect(`/admin-users/add?error=${encodeURIComponent(fileValidation.error)}`);
      }
    }

    const hashed = await bcrypt.hash(password, 12);
    await db.execute(
      'INSERT INTO users (role, name, email, phone, photo, dob, gender, password, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [role || 'user', name, email, phone || null, photo, dob || null, gender || null, hashed, status || 1]
    );
    res.redirect('/admin-users?success=User created successfully.');
  } catch (err) {
    console.error('DB Error (createUser):', err);
    res.redirect('/admin-users/add?error=Failed to create user.');
  }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────
exports.updateUser = async (req, res) => {
  try {
    const { id, name, email, phone, role, dob, gender, password, status } = req.body;
    const newPhoto = req.file ? req.file.filename : null;

    const [rows] = await db.execute('SELECT photo FROM users WHERE id=?', [id]);
    if (!rows[0]) return res.redirect('/admin-users?error=User not found.');

    const photo = newPhoto || rows[0].photo;

    // Delete old photo if new one uploaded
    if (newPhoto && rows[0].photo) {
      const oldPath = path.join('public/uploads/users', rows[0].photo);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // ✅ FIX: Validate file upload if present
    if (newPhoto && req.file) {
      const fileValidation = validateFileUpload(req.file, 'image');
      if (!fileValidation.valid) {
        return res.redirect(`/admin-users?error=${encodeURIComponent(fileValidation.error)}`);
      }
    }

    if (password && password.trim() !== '') {
      // ✅ FIX: Validate password strength
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return res.redirect(`/admin-users?error=${encodeURIComponent(passwordValidation.errors.join(', '))}`);
      }

      // ✅ FIX: Use stronger salt rounds
      const hashed = await bcrypt.hash(password, 12);
      await db.execute(
        'UPDATE users SET role=?, name=?, email=?, phone=?, photo=?, dob=?, gender=?, password=?, status=? WHERE id=?',
        [role, name, email, phone || null, photo, dob || null, gender || null, hashed, status, id]
      );
    } else {
      await db.execute(
        'UPDATE users SET role=?, name=?, email=?, phone=?, photo=?, dob=?, gender=?, status=? WHERE id=?',
        [role, name, email, phone || null, photo, dob || null, gender || null, status, id]
      );
    }

    res.redirect('/admin-users?success=User updated successfully.');
  } catch (err) {
    console.error('DB Error (updateUser):', err);
    res.redirect('/admin-users?error=Failed to update user.');
  }
};

// ─── TOGGLE STATUS ────────────────────────────────────────────────────────────
exports.toggleStatus = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT status, name, email FROM users WHERE id=?', [req.params.id]);
    if (!rows[0]) return res.redirect('/admin-users?error=User not found.');
    const newStatus = rows[0].status == 1 ? 0 : 1;
    const userInfo = { name: rows[0].name, email: rows[0].email };

    if (newStatus == 1) {
      // Unblocking, reset failed attempts
      await db.execute('UPDATE users SET status=?, failed_attempts=0, last_failed_attempt=NULL WHERE id=?', [newStatus, req.params.id]);
      const unblockedTemplate = emailService.accountUnblockedTemplate(userInfo);
      emailService.sendMail({
        to: userInfo.email,
        subject: unblockedTemplate.subject,
        html: unblockedTemplate.html,
      }).catch((err) => console.error('Unblock notification email error:', err));
    } else {
      await db.execute('UPDATE users SET status=? WHERE id=?', [newStatus, req.params.id]);
      const blockedTemplate = emailService.accountBlockedTemplate(userInfo);
      emailService.sendMail({
        to: userInfo.email,
        subject: blockedTemplate.subject,
        html: blockedTemplate.html,
      }).catch((err) => console.error('Block notification email error:', err));
    }
    res.redirect('/admin-users?success=User status updated.');
  } catch (err) {
    console.error('DB Error (toggleStatus):', err);
    res.redirect('/admin-users?error=Failed to update status.');
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
exports.deleteUser = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const [rows] = await connection.execute('SELECT photo FROM users WHERE id=?', [req.params.id]);
    if (!rows[0]) {
      await connection.rollback();
      return res.redirect('/admin-users?error=User not found.');
    }
    
    await connection.execute('DELETE FROM coupon_usage WHERE user_id = ?', [req.params.id]);
    await connection.execute('DELETE FROM user_addresses WHERE user_id = ?', [req.params.id]);
    
    const [orders] = await connection.execute('SELECT id FROM orders WHERE user_id = ?', [req.params.id]);
    for (const order of orders) {
      await connection.execute('DELETE FROM order_items WHERE order_id = ?', [order.id]);
      await connection.execute('DELETE FROM coupon_usage WHERE order_id = ?', [order.id]);
    }
    await connection.execute('DELETE FROM orders WHERE user_id = ?', [req.params.id]);
    
    if (rows[0].photo) {
      const filePath = path.join('public/uploads/users', rows[0].photo);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    const [result] = await connection.execute('DELETE FROM users WHERE id=?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.redirect('/admin-users?error=User not found.');
    }
    
    await connection.commit();
    res.redirect('/admin-users?success=User deleted successfully.');
  } catch (err) {
    await connection.rollback();
    console.error('DB Error (deleteUser):', err);
    res.redirect('/admin-users?error=Failed to delete user.');
  } finally {
    connection.release();
  }
};

// --- API: REGISTER ------------------------------------------------------------
exports.apiRegister = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // 1. Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    // ✅ FIX: Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password does not meet security requirements.',
        errors: passwordValidation.errors 
      });
    }

    // ✅ FIX: Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    // ✅ FIX: Validate name (min 2 chars, no excessive special chars)
    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({ success: false, message: 'Name must be between 2 and 100 characters.' });
    }

    // 2. Check duplicate email
    const [existingEmail] = await db.execute('SELECT id FROM users WHERE email=?', [email]);
    if (existingEmail[0]) {
      return res.status(400).json({ success: false, message: 'Email already exists.' });
    }

    // 3. Check duplicate phone (if provided)
    if (phone) {
      // ✅ FIX: Validate phone format
      const phoneRegex = /^\d{10}$/;
      const cleanPhone = phone.replace(/\D/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        return res.status(400).json({ success: false, message: 'Phone must be a valid 10-digit number.' });
      }

      const [existingPhone] = await db.execute('SELECT id FROM users WHERE phone=?', [cleanPhone]);
      if (existingPhone[0]) {
        return res.status(400).json({ success: false, message: 'Phone number already exists.' });
      }
    }

    // 4. Hash password with strong salt rounds
    const hashed = await bcrypt.hash(password, 12);

    // 5. Insert with explicit fields to avoid strict mode issues
    const [result] = await db.execute(
      'INSERT INTO users (role, name, email, phone, password, status, cart_data, wishlist_data, dob, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ['user', name, email, phone || null, hashed, 1, '[]', '[]', null, null]
    );

    const userId = result.insertId;
    const token = jwt.sign(
      { id: userId, email, role: 'user', version: 0 },
      process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET is not defined'); })(),
      { expiresIn: '8h' }
    );

    // Send welcome email (best-effort)
    const registrationTemplate = emailService.signupTemplate({ name, email });
    emailService.sendMail({
      to: email,
      subject: registrationTemplate.subject,
      html: registrationTemplate.html,
    }).catch((err) => console.error('Signup email error:', err));

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        id: userId,
        name,
        email,
        role: 'user',
        cart_data: [],
        wishlist_data: []
      }
    });

  } catch (err) {
    console.error('API Error (apiRegister):', err);
    // Be slightly more descriptive for debugging
    let msg = 'Internal server error.';
    if (err.code === 'ER_DUP_ENTRY') msg = 'Email or phone already exists.';
    else if (err.code === 'ER_BAD_NULL_ERROR') msg = 'A required field is missing.';

    res.status(500).json({ success: false, message: msg });
  }
};

// --- API: LOGIN ---------------------------------------------------------------
exports.apiLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required.' });
    
    const [rows] = await db.execute('SELECT * FROM users WHERE email=? AND role = ?', [email, 'user']);
    const user = rows[0];
    
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment failed attempts
      const newAttempts = (user.failed_attempts || 0) + 1;
      await db.execute(
        'UPDATE users SET failed_attempts = ?, last_failed_attempt = NOW() WHERE id = ?',
        [newAttempts, user.id]
      );
      if (newAttempts >= 5) {
        // Block the user
        await db.execute('UPDATE users SET status = 0 WHERE id = ?', [user.id]);

        const blockedTemplate = emailService.accountBlockedTemplate({ name: user.name, email: user.email }, 'Multiple failed login attempts');
        emailService.sendMail({
          to: user.email,
          subject: blockedTemplate.subject,
          html: blockedTemplate.html,
        }).catch((err) => console.error('Block notification email error:', err));

        return res.status(403).json({ success: false, message: 'Account blocked due to multiple failed login attempts. Please contact admin.' });
      }
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    
    // Check if account is blocked
    if (user.status == 0) return res.status(403).json({ success: false, message: 'Account is blocked.' });
    
    // Successful login, reset failed attempts
    await db.execute('UPDATE users SET logged_in = 1, failed_attempts = 0, last_failed_attempt = NULL WHERE id = ?', [user.id]);
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, version: user.token_version || 0 }, 
      process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET is not defined'); })(),
      { expiresIn: '8h' }
    );
    
    let cart_data = [];
    let wishlist_data = [];
    try { cart_data = user.cart_data ? JSON.parse(user.cart_data) : []; } catch (e) { cart_data = []; }
    try { wishlist_data = user.wishlist_data ? JSON.parse(user.wishlist_data) : []; } catch (e) { wishlist_data = []; }

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        cart_data,
        wishlist_data
      }
    });
  } catch (err) {
    console.error('API Error (apiLogin):', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// --- API: LOGOUT ---------------------------------------------------------------
exports.apiLogout = async (req, res) => {
  try {
    const userId = req.user.id;

    // Set logged_in to 0
    await db.execute('UPDATE users SET logged_in = 0 WHERE id = ?', [userId]);

    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    console.error('API Error (apiLogout):', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// --- API: GET ALL USERS STATUS (Admin) ----------------------------------------
exports.apiGetAllUsersStatus = async (req, res) => {
  try {
    // Only allow admins to access this endpoint
    const [adminCheck] = await db.execute('SELECT role FROM users WHERE id = ?', [req.user.id]);
    if (!adminCheck[0] || adminCheck[0].role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    // Get all users with their login status
    const [users] = await db.execute(
      'SELECT id, name, email, role, logged_in, last_login, status FROM users WHERE role = ? ORDER BY logged_in DESC, last_login DESC',
      ['user']
    );

    res.json({ success: true, users });
  } catch (err) {
    console.error('API Error (apiGetAllUsersStatus):', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// --- API: GET PROFILE ---------------------------------------------------------
exports.getProfile = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, role, name, email, phone, photo, dob, gender, cart_data, wishlist_data FROM users WHERE id=?', [req.user.id]);
    const user = rows[0];
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Parse JSON data
    let cart = [];
    try { cart = user.cart_data ? JSON.parse(user.cart_data) : []; } catch (e) { cart = []; }

    let wishlistIds = [];
    try { wishlistIds = user.wishlist_data ? JSON.parse(user.wishlist_data) : []; } catch (e) { wishlistIds = []; }

    // HYDRATE WISHLIST: Fetch full product details for each ID in the wishlist
    let fullWishlist = [];
    if (wishlistIds.length > 0) {
      // Ensure we only have numbers/IDs
      const cleanIds = wishlistIds.map(item => typeof item === 'object' ? (item.id || item._id) : item).filter(id => id);

      if (cleanIds.length > 0) {
        const placeholders = cleanIds.map(() => '?').join(',');
        const [products] = await db.execute(
          `SELECT id, product_name as name, product_slug as slug, product_image, price, sale_price 
   FROM products WHERE id IN (${placeholders}) AND status = 1`,
          cleanIds
        );

        fullWishlist = products;
      }
    }

    res.json({
      success: true,
      user: {
        ...user,
        cart_data: cart,
        wishlist_data: fullWishlist // Return full objects instead of just IDs
      }
    });
  } catch (err) {
    console.error('API Error (getProfile):', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};


// --- API: SAVE CART -----------------------------------------------------------
exports.apiSaveCart = async (req, res) => {
  try {
    const { cart } = req.body;
    const cartString = JSON.stringify(cart || []);
    console.log(`[apiSaveCart] Saving cart for user ${req.user.id}:`, cartString);
    await db.execute('UPDATE users SET cart_data=? WHERE id=?', [cartString, req.user.id]);
    res.json({ success: true, message: 'Cart saved.' });
  } catch (err) {
    console.error('API Error (apiSaveCart):', err);
    res.status(500).json({ success: false, message: 'Failed to save cart.' });
  }
};

// --- API: SAVE WISHLIST -------------------------------------------------------
exports.apiSaveWishlist = async (req, res) => {
  try {
    const { wishlist } = req.body;
    const wishlistString = JSON.stringify(wishlist || []);
    console.log(`[apiSaveWishlist] Saving wishlist for user ${req.user.id}:`, wishlistString);
    await db.execute('UPDATE users SET wishlist_data=? WHERE id=?', [wishlistString, req.user.id]);
    res.json({ success: true, message: 'Wishlist saved.' });
  } catch (err) {
    console.error('API Error (apiSaveWishlist):', err);
    res.status(500).json({ success: false, message: 'Failed to save wishlist.' });
  }
};

// --- API: DASHBOARD STATS ----------------------------------------------------
exports.apiGetDashboardStats = async (req, res) => {
  try {
    const user_id = req.user.id;

    // Counts
    const [[{ orderCount }]] = await db.execute('SELECT COUNT(*) as orderCount FROM orders WHERE user_id = ?', [user_id]);
    const [[{ pendingCount }]] = await db.execute("SELECT COUNT(*) as pendingCount FROM orders WHERE user_id = ? AND order_status = 'PENDING'", [user_id]);
    const [[{ completedCount }]] = await db.execute("SELECT COUNT(*) as completedCount FROM orders WHERE user_id = ? AND order_status = 'DELIVERED'", [user_id]);
    const [[{ canceledCount }]] = await db.execute("SELECT COUNT(*) as canceledCount FROM orders WHERE user_id = ? AND order_status = 'CANCELLED'", [user_id]);

    // Wishlist stats
    const [[userWishlistRow]] = await db.execute('SELECT wishlist_data FROM users WHERE id = ?', [user_id]);
    let wishlistCount = 0;
    try {
      const wl = userWishlistRow && userWishlistRow.wishlist_data ? JSON.parse(userWishlistRow.wishlist_data) : [];
      wishlistCount = Array.isArray(wl) ? wl.length : 0;
    } catch (e) { wishlistCount = 0; }
    const [[{ reviewCount }]] = await db.execute('SELECT COUNT(*) as reviewCount FROM product_reviews WHERE user_id = ?', [user_id]);

    // Recent Orders (last 5)
    const [recentOrders] = await db.execute('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 5', [user_id]);

    // Recent Reviews (last 5)
    const [recentReviews] = await db.execute('SELECT * FROM product_reviews WHERE user_id = ? ORDER BY created_at DESC LIMIT 5', [user_id]);

    res.json({
      success: true,
      stats: {
        totalOrders: orderCount,
        pendingOrders: pendingCount,
        completedOrders: completedCount,
        canceledOrders: canceledCount,
        totalWishlist: wishlistCount,
        totalReviews: reviewCount
      },
      recentOrders,
      recentReviews
    });
  } catch (err) {
    console.error('API Error (apiGetDashboardStats):', err);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard data.' });
  }
};

// --- API: GET USER ADDRESSES --------------------------------------------------
exports.apiGetUserAddresses = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC', [req.user.id]);
    res.json({ success: true, addresses: rows });
  } catch (err) {
    console.error('API Error (apiGetUserAddresses):', err);
    res.status(500).json({ success: false, message: 'Failed to fetch addresses.' });
  }
};

// --- API: SAVE ADDRESS --------------------------------------------------------
exports.apiSaveAddress = async (req, res) => {
  try {
    const { id, address_type, full_name, email, phone, country, state, city, landmark, address, pincode, is_default } = req.body;
    const user_id = req.user.id;

    if (is_default) {
      await db.execute('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?', [user_id]);
    }

    if (id) {
      // Update
      await db.execute(
        'UPDATE user_addresses SET address_type=?, full_name=?, email=?, phone=?, country=?, state=?, city=?, landmark=?, address=?, pincode=?, is_default=? WHERE id=? AND user_id=?',
        [address_type || 'home', full_name, email, phone, country, state, city, landmark, address, pincode, is_default ? 1 : 0, id, user_id]
      );
      res.json({ success: true, message: 'Address updated.' });
    } else {
      // Create
      const [result] = await db.execute(
        `INSERT INTO user_addresses 
         (user_id, address_type, full_name, email, phone, country, state, city, landmark, address, pincode, is_default) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user_id,
          address_type || 'home',
          full_name,
          email,
          phone,
          country,
          state,
          city,
          landmark,
          address,
          pincode,
          is_default ? 1 : 0
        ]
      );

      return res.json({
        success: true,
        message: 'Address added.',
        address_id: result.insertId
      });
    }
  } catch (err) {
    console.error('API Error (apiSaveAddress):', err);
    res.status(500).json({ success: false, message: 'Failed to save address.' });
  }
};

// --- API: DELETE ADDRESS ------------------------------------------------------
exports.apiDeleteAddress = async (req, res) => {
  try {
    await db.execute('DELETE FROM user_addresses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Address deleted.' });
  } catch (err) {
    console.error('API Error (apiDeleteAddress):', err);
    res.status(500).json({ success: false, message: 'Failed to delete address.' });
  }
};
// --- API: CHANGE PASSWORD ----------------------------------------------------
exports.apiChangePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    
    // ✅ FIX: Validate that current and new passwords are provided
    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Current and new password are required.' });
    }
    
    // ✅ FIX: Validate new password strength
    const passwordValidation = validatePassword(new_password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password does not meet security requirements.',
        errors: passwordValidation.errors 
      });
    }
    
    const [rows] = await db.execute('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const user = rows[0];

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect current password.' });

    // ✅ FIX: Use stronger salt rounds
    const hashed = await bcrypt.hash(new_password, 12);
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('API Error (apiChangePassword):', err);
    res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
};

// --- API: GET USER COUPON USAGE -----------------------------------------------
exports.apiGetUserCouponUsage = async (req, res) => {
  try {
    const user_id = req.user.id;
    const [usage] = await db.execute(`
      SELECT 
        cu.id,
        cu.used_at,
        c.code AS coupon_code,
        o.order_number,
        o.total_amount AS order_amount
      FROM coupon_usage cu
      JOIN coupons c ON cu.coupon_id = c.id
      JOIN orders o ON cu.order_id = o.id
      WHERE cu.user_id = ?
      ORDER BY cu.used_at DESC
    `, [user_id]);

    res.json({ success: true, usage });
  } catch (err) {
    console.error('API Error (apiGetUserCouponUsage):', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};


// --- API: UPDATE PROFILE ------------------------------------------------------
exports.apiUpdateProfile = async (req, res) => {
  const userId = req.user.id;
  console.log(`[apiUpdateProfile] Start - UserID: ${userId}`);
  
  try {
    const { name, phone, dob, gender } = req.body;
    const newPhoto = req.file ? req.file.filename : null;

    console.log(`[apiUpdateProfile] Data received:`, { name, phone, dob, gender, hasNewPhoto: !!newPhoto });

    // 1. Validation
    if (!name || !phone || !dob || !gender) {
      console.log(`[apiUpdateProfile] Validation Failed: Missing fields`);
      return res.status(400).json({ success: false, message: 'Name, phone, date of birth, and gender are required.' });
    }

    // Phone validation (10 digits)
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      console.log(`[apiUpdateProfile] Validation Failed: Phone length ${cleanPhone.length}`);
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit phone number.' });
    }

    // 2. Check for duplicate phone (belonging to OTHER users)
    const [existingPhone] = await db.execute('SELECT id FROM users WHERE phone=? AND id != ?', [cleanPhone, userId]);
    if (existingPhone[0]) {
      console.log(`[apiUpdateProfile] Duplicate Phone: ${cleanPhone} already in use by user ${existingPhone[0].id}`);
      return res.status(400).json({ success: false, message: 'This phone number is already registered with another account.' });
    }

    // 3. Get current user for existing photo
    const [rows] = await db.execute('SELECT photo FROM users WHERE id=?', [userId]);
    if (!rows[0]) {
      console.log(`[apiUpdateProfile] User not found: ${userId}`);
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let photo = rows[0].photo;
    if (newPhoto) {
      if (photo) {
        const oldPath = path.join('public/uploads/users', photo);
        if (fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch (e) { console.error("[apiUpdateProfile] Error deleting old photo:", e); }
        }
      }
      photo = newPhoto;
    }

    // 4. Update database
    console.log(`[apiUpdateProfile] Updating DB for user ${userId} with phone ${cleanPhone}`);
    await db.execute(
      'UPDATE users SET name=?, phone=?, dob=?, gender=?, photo=? WHERE id=?',
      [name, cleanPhone, dob, gender, photo, userId]
    );

    // 5. Fetch updated user data
    const [updatedRows] = await db.execute(
      'SELECT id, name, email, phone, dob, gender, photo, role FROM users WHERE id=?',
      [userId]
    );

    console.log(`[apiUpdateProfile] Success - Profile updated for user ${userId}`);
    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedRows[0]
    });

  } catch (err) {
    console.error('[apiUpdateProfile] Catch Block Error:', err);
    
    // Handle specific DB errors gracefully
    if (err.code === 'ER_DUP_ENTRY') {
      const field = err.sqlMessage?.includes('phone') ? 'phone number' : 'email/record';
      return res.status(400).json({ 
        success: false, 
        message: `This ${field} is already in use.` 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'An internal server error occurred while updating your profile. Please try again later.' 
    });
  }
};








// --- ADMIN: FORCE LOGOUT USER ------------------------------------------------
exports.forceLogout = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('UPDATE users SET token_version = token_version + 1, logged_in = 0 WHERE id = ? AND role = ?', [id, 'user']);
    req.flash('success', 'User has been logged out.');
    res.redirect('/admin-users');
  } catch (err) {
    console.error('Force logout error:', err);
    req.flash('error', 'Failed to logout user.');
    res.redirect('/admin-users');
  }
};

// --- ADMIN: BULK UPDATE USER STATUS ------------------------------------------
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { userIds, targetStatus } = req.body;
    const selectedIds = (Array.isArray(userIds) ? userIds : userIds ? [userIds] : [])
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0);
    const normalizedStatus = Number(targetStatus);

    if (!selectedIds.length) {
      req.flash('error', 'Select at least one user.');
      return res.redirect('/admin-users');
    }

    if (![0, 1].includes(normalizedStatus)) {
      req.flash('error', 'Invalid status selected.');
      return res.redirect('/admin-users');
    }

    const placeholders = selectedIds.map(() => '?').join(',');

    if (normalizedStatus === 1) {
      await db.execute(
        `UPDATE users SET status = 1, failed_attempts = 0, last_failed_attempt = NULL WHERE role = ? AND id IN (${placeholders})`,
        ['user', ...selectedIds]
      );
    } else {
      await db.execute(
        `UPDATE users SET status = 0 WHERE role = ? AND id IN (${placeholders})`,
        ['user', ...selectedIds]
      );
    }

    req.flash('success', `Updated status for ${selectedIds.length} user(s).`);
    res.redirect('/admin-users');
  } catch (err) {
    console.error('Bulk status update error:', err);
    req.flash('error', 'Failed to update status for selected users.');
    res.redirect('/admin-users');
  }
};

// --- ADMIN: BULK FORCE LOGOUT USERS ------------------------------------------
exports.bulkForceLogout = async (req, res) => {
  try {
    const { userIds } = req.body;
    const selectedIds = (Array.isArray(userIds) ? userIds : userIds ? [userIds] : [])
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0);

    if (!selectedIds.length) {
      req.flash('error', 'Select at least one user.');
      return res.redirect('/admin-users');
    }

    const placeholders = selectedIds.map(() => '?').join(',');

    await db.execute(
      `UPDATE users SET token_version = token_version + 1, logged_in = 0 WHERE role = ? AND id IN (${placeholders})`,
      ['user', ...selectedIds]
    );

    req.flash('success', `Logged out ${selectedIds.length} user(s).`);
    res.redirect('/admin-users');
  } catch (err) {
    console.error('Bulk force logout error:', err);
    req.flash('error', 'Failed to logout selected users.');
    res.redirect('/admin-users');
  }
};

// --- ADMIN: GET USERS STATUS (Session Auth) ----------------------------------
exports.adminGetUsersStatus = async (req, res) => {
  try {
    // Check if user is admin via session
    if (!req.session.adminId) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    // Get all users with their login status
    const [users] = await db.execute(
      'SELECT id, name, email, role, logged_in, last_login, status FROM users WHERE role = ? ORDER BY logged_in DESC, last_login DESC',
      ['user']
    );

    res.json({ success: true, users });
  } catch (err) {
    console.error('Admin Error (adminGetUsersStatus):', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// --- API: FORGOT PASSWORD -----------------------------------------------------
// POST /users/forgot-password
// Body: { email }
// Generates a secure token, saves it in DB, sends a reset link via email
exports.apiForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }

    // Always respond the same way — don't leak if email exists
    const [rows] = await db.execute(
      'SELECT id, name, email, status FROM users WHERE email = ? AND role = ?',
      [email, 'user']
    );

    if (rows[0] && rows[0].status == 1) {
      const user = rows[0];

      // Generate a cryptographically secure token
      const crypto = require('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Save token to DB (upsert)
      await db.execute(
        `INSERT INTO password_reset_tokens (user_id, token, expires_at)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at), created_at = NOW()`,
        [user.id, token, expiresAt]
      );

      // Build reset link — points to frontend reset page
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetLink = `${frontendUrl}/reset-password?token=${token}`;

      // Send email (best effort — don't fail the request if email fails)
      const { passwordResetTemplate } = require('../services/emailService');
      const template = passwordResetTemplate({ name: user.name, email: user.email }, resetLink);
      emailService.sendMail({
        to: user.email,
        subject: template.subject,
        html: template.html,
      }).catch((err) => console.error('Reset password email error:', err));
    }

    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If this email is registered, a reset link has been sent.',
    });

  } catch (err) {
    console.error('API Error (apiForgotPassword):', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// --- API: RESET PASSWORD ------------------------------------------------------
// POST /users/reset-password
// Body: { token, new_password }
// Verifies the token, updates the password, invalidates the token
exports.apiResetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }

    // Validate new password strength
    const passwordValidation = validatePassword(new_password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet security requirements.',
        errors: passwordValidation.errors,
      });
    }

    // Look up the token
    const [tokens] = await db.execute(
      `SELECT prt.user_id, prt.expires_at, u.name, u.email, u.status
       FROM password_reset_tokens prt
       JOIN users u ON u.id = prt.user_id
       WHERE prt.token = ?`,
      [token]
    );

    if (!tokens[0]) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset link. Please request a new one.' });
    }

    const record = tokens[0];

    // Check expiry
    if (new Date() > new Date(record.expires_at)) {
      await db.execute('DELETE FROM password_reset_tokens WHERE token = ?', [token]);
      return res.status(400).json({ success: false, message: 'This reset link has expired. Please request a new one.' });
    }

    if (record.status != 1) {
      return res.status(403).json({ success: false, message: 'Your account is blocked. Please contact support.' });
    }

    // Hash new password
    const hashed = await bcrypt.hash(new_password, 12);

    // Update password and invalidate all sessions (bump token_version)
    await db.execute(
      'UPDATE users SET password = ?, token_version = token_version + 1, failed_attempts = 0 WHERE id = ?',
      [hashed, record.user_id]
    );

    // Delete the used token
    await db.execute('DELETE FROM password_reset_tokens WHERE token = ?', [token]);

    // Send success confirmation email
    const { passwordResetSuccessTemplate } = require('../services/emailService');
    const template = passwordResetSuccessTemplate({ name: record.name, email: record.email });
    emailService.sendMail({
      to: record.email,
      subject: template.subject,
      html: template.html,
    }).catch((err) => console.error('Reset success email error:', err));

    res.json({ success: true, message: 'Password reset successfully. You can now log in with your new password.' });

  } catch (err) {
    console.error('API Error (apiResetPassword):', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// --- API: VERIFY RESET TOKEN --------------------------------------------------
// GET /users/reset-password/verify?token=xxx
// Used by frontend to validate the token before showing the form
exports.apiVerifyResetToken = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required.' });
    }

    const [tokens] = await db.execute(
      'SELECT user_id, expires_at FROM password_reset_tokens WHERE token = ?',
      [token]
    );

    if (!tokens[0]) {
      return res.json({ success: false, valid: false, message: 'Invalid or already used reset link.' });
    }

    if (new Date() > new Date(tokens[0].expires_at)) {
      await db.execute('DELETE FROM password_reset_tokens WHERE token = ?', [token]);
      return res.json({ success: false, valid: false, message: 'This reset link has expired. Please request a new one.' });
    }

    res.json({ success: true, valid: true });

  } catch (err) {
    console.error('API Error (apiVerifyResetToken):', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

