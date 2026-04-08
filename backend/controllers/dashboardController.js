const db = require('../config/db');

exports.getStats = async (req, res) => {
    console.log('Fetching dashboard stats...');
    try {
        const queries = {
            totalUsers: 'SELECT COUNT(*) as count FROM users',
            blockedUsers: 'SELECT COUNT(*) as count FROM users WHERE status = 0',
            categories: 'SELECT COUNT(*) as count FROM categories',
            subCategories: 'SELECT COUNT(*) as count FROM sub_categories',
            subSubCategories: 'SELECT COUNT(*) as count FROM sub_sub_categories',
            products: 'SELECT COUNT(*) as count FROM products',
            coupons: 'SELECT COUNT(*) as count FROM coupons',
            couponUsage: 'SELECT COUNT(*) as count FROM coupon_usage',
            productReviews: 'SELECT COUNT(*) as count FROM product_reviews',
            wishlist: 'SELECT COUNT(*) as count FROM wishlist',
            cart: 'SELECT COUNT(*) as count FROM cart',
            orders: 'SELECT COUNT(*) as count FROM orders',
            orderReturns: 'SELECT COUNT(*) as count FROM order_returns',
            contactMessages: 'SELECT COUNT(*) as count FROM contact_messages'
        };

        const stats = {};
        for (const [key, query] of Object.entries(queries)) {
            try {
                const [rows] = await db.execute(query);
                stats[key] = rows[0].count;
            } catch (queryErr) {
                console.warn(`Warning: Query failed for ${key}:`, queryErr.message);
                stats[key] = 0; // Fallback to 0 if table doesn't exist or query fails
            }
        }

        console.log('Stats fetched successfully:', stats);
        res.render('index', { 
            title: 'Dashboard', 
            subTitle: 'Overview',
            stats 
        });
    } catch (err) {
        console.error('CRITICAL: Dashboard Stats Error:', err);
        res.status(500).render('notFound', { title: '500', subTitle: 'Server Error' });
    }
};
