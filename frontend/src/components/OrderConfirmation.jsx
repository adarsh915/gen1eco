import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import HeroBanner from './HeroBanner';

export default function OrderConfirmation() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderNumber]);

  const fetchOrderDetails = async () => {
    try {
      // Try to fetch order details if user is logged in
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/orders/${orderNumber}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setOrder(data.order);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      // Don't show error for order confirmation - it's optional
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading order confirmation...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .confirmation-container {
          background-color: #fdfdfd;
          min-height: 100vh;
        }
        .confirmation-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 25px rgba(0,0,0,0.1);
          padding: 40px;
          text-align: center;
          margin-bottom: 30px;
        }
        .success-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #28a745, #20c997);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 36px;
          color: white;
        }
        .confirmation-title {
          color: #2c3e50;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .confirmation-subtitle {
          color: #6c757d;
          font-size: 16px;
          margin-bottom: 30px;
        }
        .order-details {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 30px;
          text-align: left;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e9ecef;
        }
        .detail-row:last-child {
          border-bottom: none;
          font-weight: 600;
          font-size: 18px;
          color: #000;
        }
        .detail-label {
          color: #666;
        }
        .detail-value {
          color: #333;
          font-weight: 500;
        }
        .account-info {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 30px;
        }
        .account-info h4 {
          margin-bottom: 15px;
          font-size: 20px;
        }
        .account-info p {
          margin-bottom: 20px;
          opacity: 0.9;
          line-height: 1.6;
        }
        .action-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn-primary-custom {
          background: #AB9774;
          border: none;
          padding: 12px 30px;
          border-radius: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: background 0.3s;
        }
        .btn-primary-custom:hover {
          background: #8f7d60;
        }
        .btn-secondary-custom {
          background: #6c757d;
          border: none;
          padding: 12px 30px;
          border-radius: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: background 0.3s;
        }
        .btn-secondary-custom:hover {
          background: #5a6268;
        }
        .order-number-highlight {
          background: #fff3cd;
          color: #856404;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 600;
          font-family: monospace;
        }
        @media (max-width: 768px) {
          .confirmation-card {
            padding: 20px;
          }
          .action-buttons {
            flex-direction: column;
            align-items: center;
          }
          .btn-primary-custom,
          .btn-secondary-custom {
            width: 100%;
            max-width: 300px;
          }
        }
      `}</style>

      <HeroBanner
        title="Order Confirmation"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Order Confirmation' }
        ]}
      />

      <div className="confirmation-container py-5">
        <div className="container">
          <div className="confirmation-card">
            <div className="success-icon">✓</div>
            <h1 className="confirmation-title">Order Placed Successfully!</h1>
            <p className="confirmation-subtitle">
              Thank you for your order. We've sent a confirmation email with your order details.
            </p>

            {orderNumber && (
              <p className="mb-4">
                Order Number: <span className="order-number-highlight">{orderNumber}</span>
              </p>
            )}
          </div>

          {order && (
            <div className="order-details">
              <h3 className="mb-3">Order Details</h3>
              <div className="detail-row">
                <span className="detail-label">Order Number:</span>
                <span className="detail-value">{order.order_number}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Total Amount:</span>
                <span className="detail-value">₹{order.total_amount?.toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Order Status:</span>
                <span className="detail-value">{order.order_status}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Payment Method:</span>
                <span className="detail-value">{order.payment_method}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Order Date:</span>
                <span className="detail-value">
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          )}

          <div className="account-info">
            <h4>🎉 Your Account is Ready!</h4>
            <p>
              A temporary password has been sent to your email address.
              You can now login to track your order, view order history, and manage your account.
            </p>
            <p className="mb-0">
              <strong>Important:</strong> Please change your password after first login for security.
            </p>
          </div>

          <div className="action-buttons">
            <Link to="/dashboard" className="btn btn-primary-custom">
              View My Orders
            </Link>
            <Link to="/" className="btn btn-secondary-custom">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}