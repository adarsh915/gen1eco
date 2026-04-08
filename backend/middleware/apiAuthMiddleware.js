const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    // ✅ FIX: Use required JWT_SECRET instead of fallback
    const jwtSecret = process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET is not defined in .env'); })();
    const decoded = jwt.verify(token, jwtSecret);
    
    // Check token version
    const [rows] = await db.execute('SELECT token_version FROM users WHERE id = ?', [decoded.id]);
    if (rows.length === 0 || rows[0].token_version !== decoded.version) {
      return res.status(401).json({ success: false, message: 'Token has been invalidated.' });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

module.exports = verifyToken;
