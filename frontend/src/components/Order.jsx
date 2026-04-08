import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaBoxOpen, FaEye, FaTimes, FaShippingFast, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';


const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Return states
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnItem, setReturnItem] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/users/orders/user');
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const response = await api.put(`/users/orders/cancel/${orderId}`);
      if (response.data.success) {
        toast.success("Order cancelled successfully");
        fetchOrders();
      } else {
        toast.error(response.data.message || "Failed to cancel order");
      }
    } catch (err) {
      console.error("Cancel order error:", err);
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const response = await api.get(`/users/orders/user/${orderId}`);
      if (response.data.success) {
        setSelectedOrder(response.data.order);
        setShowModal(true);
      }
    } catch (err) {
      toast.error("Could not load order details");
    }
  };

  const handleReturnClick = (item) => {
    setReturnItem(item);
    setShowReturnModal(true);
  };

  const handleReturnSubmit = async () => {
    if (!returnReason.trim()) return toast.error("Please provide a reason for return");

    setIsSubmitting(true);
    try {
      const response = await api.post('/users/orders/return', {
        order_id: selectedOrder.id,
        product_id: returnItem.product_id,
        reason: returnReason
      });

      if (response.data.success) {
        toast.success("Return request submitted!");
        setShowReturnModal(false);
        setReturnReason("");
        setShowModal(false); // Close the order details modal
        fetchOrders(); // Refresh status
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit return");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'PENDING': '#ffa500',
      'DELIVERED': '#2e7d32',
      'CANCELLED': '#d32f2f',
      'SHIPPED': '#0288d1',
      'PROCESSING': '#616161',
      'CONFIRMED': '#455a64'
    };
    return {
      background: (variants[status] || '#9e9e9e') + '15',
      color: variants[status] || '#888',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase'
    };
  };

  return (
    <>
      <style>{`
        .dashboard_content { background: #fff; border-radius: 14px; padding: 30px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.07); }
        .dashboard_title { font-size: 22px; font-weight: 600; color: #1a1a2e; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #f0f0f0; }
        .order-table-container { overflow-x: auto; }
        .order-table { width: 100%; border-collapse: collapse; }
        .order-table th { text-align: left; padding: 15px; background: #fafafa; font-size: 13px; font-weight: 600; color: #666; border-bottom: 1.5px solid #eee; }
        .order-table td { padding: 15px; border-bottom: 1px solid #f5f5f5; font-size: 14px; color: #444; vertical-align: middle; }
        .order-num { font-weight: 700; color: #1a1a2e; }
        .action-btns { display: flex; gap: 8px; }
        .view-btn, .cancel-btn { display: flex; align-items: center; gap: 6px; background: #f8f9fa; border: 1px solid #ddd; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 500; color: #555; cursor: pointer; transition: all 0.2s; }
        .view-btn:hover { background: #AB9774; border-color: #AB9774; color: #fff; }
        .cancel-btn:hover { background: #d32f2f; border-color: #d32f2f; color: #fff; }

        /* Modal Styles */
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal-container { background: #fff; width: 100%; max-width: 700px; border-radius: 12px; max-height: 90vh; overflow-y: auto; position: relative; animation: slideIn 0.3s ease-out; }
        @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .modal-header { padding: 20px 25px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; background: #fff; z-index: 10; }
        .modal-body { padding: 25px; }
        .detail-section { margin-bottom: 25px; }
        .section-title { font-size: 15px; font-weight: 700; color: #1a1a2e; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f9f9f9; padding: 20px; border-radius: 10px; }
        .info-item label { display: block; font-size: 12px; color: #888; margin-bottom: 4px; }
        .info-item span { font-size: 14px; font-weight: 600; color: #333; }
        .item-list { border: 1px solid #eee; border-radius: 10px; overflow: hidden; }
        .item-row { display: grid; grid-template-columns: 1fr auto; padding: 15px; border-bottom: 1px solid #eee; align-items: center; }
        .item-row:last-child { border-bottom: none; }
        .item-main h4 { font-size: 14px; margin: 0 0 4px 0; color: #333; }
        .item-price { font-size: 13px; color: #666; font-weight: 500; }
        .item-total { font-weight: 700; color: #1a1a2e; font-size: 15px; }
        .close-modal { cursor: pointer; color: #999; font-size: 20px; background: none; border: none; padding: 5px; }
        .close-modal:hover { color: #333; }
        /* Add these styles to the bottom of the style tag in Order.jsx */
.return-btn {
  background: #fdf2f2;
  color: #d32f2f;
  border: 1px solid #fecaca;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 5px;
}
.return-btn:hover {
  background: #d32f2f;
  color: #fff;
}
.reason-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 15px 0;
  min-height: 100px;
  font-family: inherit;
}
.submit-return-btn {
  background: #AB9774;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
}
.return-status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  margin-top: 5px;
  text-transform: uppercase;
}
.status-requested { background: #fff8e1; color: #f57c00; border: 1px solid #ffe0b2; }
.status-approved { background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }
.status-picked { background: #e3f2fd; color: #1565c0; border: 1px solid #bbdefb; }
.status-refunded { background: #ede7f6; color: #673ab7; border: 1px solid #d1c4e9; }
.status-rejected { background: #ffebee; color: #c62828; border: 1px solid #ffcdd2; }

      `}</style>

      <div className="dashboard_content">
        <h3 className="dashboard_title">My Orders</h3>
        {loading ? <div className="text-center py-4">Loading orders...</div> : orders.length === 0 ? (
          <div className="text-center py-5"><FaBoxOpen size={50} color="#eee" /><p className="text-muted mt-3">No orders found.</p></div>
        ) : (
          <div className="order-table-container">
            <table className="order-table">
              <thead>
                <tr><th>Order #</th><th>Date</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td><span className="order-num">{order.order_number}</span></td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>₹{order.total_amount.toLocaleString()}</td>
                    <td><span style={getStatusBadge(order.order_status)}>{order.order_status}</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="view-btn" onClick={() => handleViewOrder(order.id)}><FaEye /> View</button>
                        {['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.order_status) && (
                          <button className="cancel-btn" onClick={() => handleCancelOrder(order.id)}><FaTimes /> Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '18px' }}>Order: {selectedOrder.order_number}</h3>
              <button className="close-modal" onClick={() => setShowModal(false)}><FaTimes /></button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <div className="section-title"><FaCalendarAlt /> Order Information</div>
                <div className="info-grid">
                  <div className="info-item"><label>Date Placed</label><span>{new Date(selectedOrder.created_at).toLocaleString()}</span></div>
                  <div className="info-item"><label>Status</label><span style={{ color: getStatusBadge(selectedOrder.order_status).color }}>{selectedOrder.order_status}</span></div>
                  <div className="info-item"><label>Payment Method</label><span>{selectedOrder.payment_method}</span></div>
                  <div className="info-item"><label>Total Amount</label><span style={{ color: '#AB9774', fontSize: '16px' }}>₹{selectedOrder.total_amount.toLocaleString()}</span></div>
                </div>
              </div>

              <div className="detail-section">
                <div className="section-title"><FaShippingFast /> Shipping Details</div>
                <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '10px', fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
                  {selectedOrder.shipping_address}
                </div>
              </div>

              <div className="detail-section">
                <div className="section-title"><FaBoxOpen /> Order Items</div>
                <div className="item-list">
                  {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                    <div className="item-row" key={idx}>
                      <div className="item-main">
                        <h4>{item.product_name}</h4>
                        <div className="item-price">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="item-total">₹{item.total.toLocaleString()}</div>
                        {item.return_status ? (
                          <div className={`return-status-badge status-${item.return_status.toLowerCase()}`}>
                            Return: {item.return_status}
                          </div>
                        ) : selectedOrder.order_status === 'DELIVERED' && (
                          <button className="return-btn" onClick={() => handleReturnClick(item)}>Request Return</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReturnModal && returnItem && (
        <div className="modal-overlay" onClick={() => setShowReturnModal(false)}>
          <div className="modal-container" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '18px' }}>Return Item</h3>
              <button className="close-modal" onClick={() => setShowReturnModal(false)}><FaTimes /></button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '15px' }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#888' }}>Product</p>
                <p style={{ margin: 0, fontWeight: '600' }}>{returnItem.product_name}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#888' }}>Reason for Return</p>
                <textarea 
                  className="reason-input" 
                  placeholder="Please describe why you want to return this product..."
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                />
              </div>
              <button 
                className="submit-return-btn" 
                onClick={handleReturnSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Return Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Order;
