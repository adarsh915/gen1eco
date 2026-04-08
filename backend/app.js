const express = require("express");
const path = require("path");
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('connect-flash');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Security middleware
const {
  limiter,
  loginLimiter,
  registrationLimiter,
  securityHeaders,
  sanitizeRequestBody,
  bodyLimits
} = require('./middleware/securityMiddleware');

const app = express();

// ✅ SECURITY: Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'", "https:"],
      mediaSrc: ["'self'", "https:", "blob:"],
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ✅ SECURITY: Custom security headers
app.use(securityHeaders);

// ✅ Trust proxy — adjust based on your deployment
app.set('trust proxy', 1);

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://gen.agromarket.co.in']
  : ['https://gen.agromarket.co.in', 'http://localhost:3000', 'http://localhost:5173', 'http://192.168.29.201:3000'];

// ✅ CORS — must be FIRST after security headers
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ SECURITY: Rate limiting - applies to all routes
// app.use(limiter);

// Body parsing with size limits
app.use(express.urlencoded({ extended: true, limit: bodyLimits.urlencoded }));
app.use(express.json({ limit: bodyLimits.json }));

// ✅ SECURITY: Sanitize request body
app.use(sanitizeRequestBody);

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/fonts', express.static(path.join(__dirname, 'public/fonts')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/webfonts', express.static(path.join(__dirname, 'public/webfonts')));

// ✅ SECURITY: Session with improved cookie settings
app.use(session({
  secret: process.env.SESSION_SECRET || (() => { throw new Error('SESSION_SECRET is not defined in .env'); })(),
  resave: false,
  saveUninitialized: false,
  name: 'sessionId', // Change default session name for security
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 2 // Reduced from 8 hours to 2 hours
  }
}));

// Flash messages
app.use(flash());

// Make session data + flash messages available in ALL EJS views
app.use((req, res, next) => {
  res.locals.adminId = req.session.adminId || null;
  res.locals.adminName = req.session.adminName || null;
  res.locals.adminEmail = req.session.adminEmail || null;
  res.locals.adminPhoto = req.session.adminPhoto || null;
  res.locals.isAuthenticated = !!req.session.adminId;
  res.locals.successMessage = req.flash('success');
  res.locals.errorMessage = req.flash('error');
  next();
});

// View engine
app.use(expressLayouts);
app.set('layout', './layout/layout');
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// ✅ 1. Auth routes
const adminAuthRoutes = require('./routes/adminAuthRoutes');
app.use('/admin', adminAuthRoutes);

// ✅ 2. Contact messages route — BEFORE pageRouter
const contactMessageRoutes = require('./routes/contactMessageRoutes');
app.use('/contact-messages', contactMessageRoutes);

// footer top banner
const footerTopBannerRoutes = require('./routes/footerTopBannerRoutes');
app.use('/footer-top-banner', footerTopBannerRoutes);

// Single Banner 
const singleBannerRoutes = require('./routes/singleBannerRoutes');
app.use('/single-banner', singleBannerRoutes);

// Main Slider
const mainSliderRoutes = require('./routes/mainSliderRoutes');
app.use('/main-slider', mainSliderRoutes);

// three boxes list 
const threeBoxesRoutes = require('./routes/threeBoxesRoutes');
app.use('/three-boxes', threeBoxesRoutes);

// Gst 
const gstRoutes = require('./routes/gstRoutes');
app.use('/gst-settings', gstRoutes);

// Coupons
const couponRoutes = require('./routes/couponRoutes');
app.use('/coupons', couponRoutes);

// Coupons usage 
const couponUsageRoutes = require('./routes/couponUsageRoutes');
app.use('/coupon-usage', couponUsageRoutes);

// Order Return
const orderReturnRoutes = require('./routes/orderReturnRoutes');
app.use('/order-returns', orderReturnRoutes);

// Order
const orderRoutes = require('./routes/orderRoutes');
app.use('/orders', orderRoutes);

// Products
const productRoutes = require('./routes/productRoutes');
app.use('/products', productRoutes);

// Stock Management
const stockRoutes = require('./routes/stockRoutes');
app.use('/stock', stockRoutes);

// User 
const userManagementRoutes = require('./routes/userManagementRoutes');
app.use('/admin-users', userManagementRoutes);

// User Profile Routes (web-based) - MUST come before apiRoutes
const userProfileRoutes = require('./routes/users');
app.use('/users', userProfileRoutes);

const apiRoutes = require('./routes/apiRoutes');
app.use('/users', apiRoutes);

// Guest Checkout Routes
const guestCheckoutRoutes = require('./routes/guestCheckoutRoutes');
app.use('/api/guest', guestCheckoutRoutes);

const categoryRoutes = require('./routes/category');
app.use('/category', categoryRoutes);

// const userRoutes = require('./routes/userRoutes');
// app.use('/users', userRoutes);
// ✅ 3. All other page routes — AFTER specific routes
const pageRouter = require('./routes/routes');
pageRouter(app);

// ✅ 4. 404 handler — LAST
app.use((req, res) => {
  res.status(404).render('notFound', { title: '404', subTitle: '404' });
});

// ✅ 5. Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).render('notFound', { title: '500', subTitle: 'Server Error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
