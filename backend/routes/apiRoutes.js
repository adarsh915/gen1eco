const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const threeBoxesController = require('../controllers/threeBoxesController');
const couponController = require('../controllers/couponController');
const orderReturnController = require('../controllers/orderReturnController');
const relatedProductController = require('../controllers/relatedProductController');
const verifyToken = require('../middleware/apiAuthMiddleware');
const { loginLimiter, registrationLimiter } = require('../middleware/securityMiddleware');

// Public API routes
router.post('/register', registrationLimiter, userController.apiRegister);
router.post('/login', loginLimiter, userController.apiLogin);
router.post('/logout', verifyToken, userController.apiLogout);
router.post('/forgot-password', userController.apiForgotPassword);
router.get('/reset-password/verify', userController.apiVerifyResetToken);
router.post('/reset-password', userController.apiResetPassword);
router.get('/users/status', verifyToken, userController.apiGetAllUsersStatus);
router.get('/products', productController.apiGetProducts);
router.get('/three-boxes', threeBoxesController.apiGetThreeBoxes);
router.get('/best-selling', productController.apiGetBestSellingProducts);
router.get('/new-arrivals', productController.apiGetNewArrivalProducts);
router.get('/featured', productController.apiGetFeaturedProducts);
router.get('/products/:id', productController.apiGetProductById);
router.get('/products/related/:id', relatedProductController.apiGetRelatedProducts);
router.get('/products/slug/:slug', productController.apiGetProductBySlug);

// Protected API routes
router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile', verifyToken, userController.upload.single('photo'), userController.apiUpdateProfile);
router.post('/profile/cart', verifyToken, userController.apiSaveCart);
router.post('/profile/wishlist', verifyToken, userController.apiSaveWishlist);
router.get('/profile/stats', verifyToken, userController.apiGetDashboardStats);
router.get('/profile/addresses', verifyToken, userController.apiGetUserAddresses);
router.post('/profile/addresses', verifyToken, userController.apiSaveAddress);
router.delete('/profile/addresses/:id', verifyToken, userController.apiDeleteAddress);
router.get('/orders/user', verifyToken, orderController.apiGetUserOrders);
router.get('/orders/user/:id', verifyToken, orderController.apiGetOrderById);
router.post('/orders/return', verifyToken, orderReturnController.apiCreateReturn);


// Add this line with the other order routes
router.put('/orders/cancel/:id', verifyToken, orderController.apiCancelOrder);
router.post('/orders', verifyToken, orderController.apiCreateOrder);
router.post('/coupons/validate', verifyToken, couponController.apiValidateCoupon);
router.post('/coupons/guest/validate', couponController.apiValidateCouponGuest);
router.post('/profile/change-password', verifyToken, userController.apiChangePassword);
router.get('/profile/coupons', verifyToken, userController.apiGetUserCouponUsage);

module.exports = router;
