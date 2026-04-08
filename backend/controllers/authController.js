const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Show login page
exports.showLogin = (req, res) => {
  res.render('admin/login', {
    layout: false,
    error: req.flash('error'),
    success: req.flash('success'),
  });
};

// Handle login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email AND role = admin
    const [rows] = await db.execute(
      `SELECT * FROM users WHERE email = ? AND role = 'admin' AND status = 1`,
      [email]
    );

    if (rows.length === 0) {
      req.flash('error', 'Invalid credentials or you are not an admin.');
      return res.redirect('/admin/login');
    }

    const admin = rows[0];

    // Compare password
    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/admin/login');
    }

    // Update last_login timestamp
    await db.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [admin.id]
    );

    // ✅ FIX: Session regeneration to prevent session fixation attacks
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err);
        req.flash('error', 'An error occurred during login.');
        return res.redirect('/admin/login');
      }

      // Save to session
      req.session.adminId = admin.id;
      req.session.adminName = admin.name;
      req.session.adminEmail = admin.email;
      req.session.adminPhoto = admin.photo;

      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          req.flash('error', 'An error occurred during login.');
          return res.redirect('/admin/login');
        }
        res.redirect('/');
      });
    });

  } catch (err) {
    console.error('Login error:', err);
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/admin/login');
  }
};

// Handle logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Logout error:', err);
    res.redirect('/admin/login');
  });
};