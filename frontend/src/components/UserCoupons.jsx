import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaTicketAlt } from 'react-icons/fa';

const UserCoupons = () => {
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCouponUsage();
  }, []);

  const fetchCouponUsage = async () => {
    try {
      const response = await api.get('/users/profile/coupons');
      if (response.data.success) {
        setUsage(response.data.usage);
      }
    } catch (err) {
      console.error("Failed to fetch coupon usage:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .dashboard_content { background: #fff; border-radius: 14px; padding: 30px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.07); }
        .dashboard_title { font-size: 22px; font-weight: 600; color: #1a1a2e; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #f0f0f0; }
        
        .coupon-table-container { overflow-x: auto; }
        .coupon-table { width: 100%; border-collapse: collapse; }
        .coupon-table th { text-align: left; padding: 15px; background: #fafafa; font-size: 13px; font-weight: 600; color: #666; border-bottom: 1.5px solid #eee; }
        .coupon-table td { padding: 15px; border-bottom: 1px solid #f5f5f5; font-size: 14px; color: #444; vertical-align: middle; }
        .coupon-table tr:last-child td { border-bottom: none; }
        
        .coupon-badge { background: #e8f5e9; color: #2e7d32; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; border: 1px solid #c8e6c9; }
        .order-link { color: #AB9774; text-decoration: none; font-weight: 600; }
        .order-link:hover { text-decoration: underline; }
        
        .empty-state { text-align: center; padding: 50px 20px; }
        .empty-icon { font-size: 60px; color: #eee; margin-bottom: 20px; }
      `}</style>

      <div className="dashboard_content">
        <h3 className="dashboard_title">My Coupon Usage</h3>
        
        {loading ? (
          <div className="text-center py-4">Loading usage history...</div>
        ) : usage.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><FaTicketAlt /></div>
            <p className="text-muted">You haven't used any coupons yet.</p>
          </div>
        ) : (
          <div className="coupon-table-container">
            <table className="coupon-table">
              <thead>
                <tr>
                  <th>Coupon Code</th>
                  <th>Order Number</th>
                  <th>Order Amount</th>
                  <th>Used Date</th>
                </tr>
              </thead>
              <tbody>
                {usage.map((item) => (
                  <tr key={item.id}>
                    <td><span className="coupon-badge">{item.coupon_code}</span></td>
                    <td><span className="order-link">{item.order_number}</span></td>
                    <td><span style={{ fontWeight: 700 }}>₹{parseFloat(item.order_amount).toLocaleString()}</span></td>
                    <td>{new Date(item.used_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default UserCoupons;
