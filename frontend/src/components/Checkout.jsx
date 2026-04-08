import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import HeroBanner from './HeroBanner';

const IMG_BASE_URL = `${process.env.REACT_APP_API_URL}/uploads/products/`;

export default function Checkout() {
  const { 
    cart, clearCart,
    rawSubtotal, subtotalInclGst, couponDiscount, totalGst, totalPrice,
    appliedCoupon, applyCoupon, removeCoupon
  } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  const [form, setForm] = useState({
    address_type: 'Home',
    full_name: '',
    email: '',
    phone: '',
    country: 'India',
    state: '',
    city: '',
    landmark: '',
    address: '',
    pincode: '',
    order_notes: '',
    payment_method: 'COD'
  });
  const [couponCode, setCouponCode] = useState('');

  const getVariantId = (item) => (
    item.selectedVariantId
    || item.selected_variant_id
    || item.variant_id
    || item.variantId
    || item.selectedVariant?.id
    || item.selected_variant?.id
    || null
  );

  const getVariantDetails = (item) => {
    const name = item.selectedVariant?.variant_name || item.selected_variant?.variant_name || item.selectedVariantName || item.selected_variant_name || item.variant_name || "";
    const value = item.selectedVariant?.variant_value || item.selected_variant?.variant_value || item.selectedVariantValue || item.selected_variant_value || item.variant_value || "";
    const price = Number((item.selectedVariant?.price ?? item.selected_variant?.price ?? item.variant_price ?? item.selectedVariantPrice ?? item.selected_variant_price) || 0);
    return { name, value, price };
  };

  const hasVariantSelection = (item) => Boolean(getVariantId(item));
  const getUnitPrice = (item) => {
    if (hasVariantSelection(item)) {
      return Number((item.selectedVariant?.price ?? item.selected_variant?.price ?? item.variant_price ?? item.selectedVariantPrice ?? item.selected_variant_price ?? item.price) || 0);
    }

    const basePrice = Number(item.price || 0);
    const salePrice = Number(item.sale_price || 0);
    if (salePrice > 0) return salePrice;

    const discountPercent = Number(item.discount_percent || 0);
    if (discountPercent > 0) {
      return basePrice - (basePrice * discountPercent / 100);
    }

    return basePrice;
  };

  const populateAddressFields = useCallback((address) => {
    setForm((prev) => ({
      ...prev,
      address_type: address.address_type || 'Home',
      full_name: address.full_name || '',
      email: address.email || '',
      phone: address.phone || '',
      country: address.country || 'India',
      state: address.state || '',
      city: address.city || '',
      landmark: address.landmark || '',
      address: address.address || '',
      pincode: address.pincode || ''
    }));
  }, []);

  const fetchAddresses = useCallback(async () => {
    try {
      const response = await api.get('/users/profile/addresses');
      if (response.data.success) {
        setAddresses(response.data.addresses);
        // Auto-select default address if available
        const defaultAddr = response.data.addresses.find(addr => addr.is_default);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          populateAddressFields(defaultAddr);
        }
      }
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
    }
  }, [populateAddressFields]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleAddressSelect = (e) => {
    const addressId = e.target.value;
    setSelectedAddressId(addressId);
    if (addressId) {
      const selectedAddr = addresses.find((addr) => String(addr.id) === String(addressId));
      if (selectedAddr) {
        populateAddressFields(selectedAddr);
      }
    } else {
      // Clear fields when "Add New Address" is selected
      setForm((prev) => ({
        ...prev,
        address_type: 'Home',
        full_name: '',
        email: '',
        phone: '',
        country: 'India',
        state: '',
        city: '',
        landmark: '',
        address: '',
        pincode: ''
      }));
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    const success = await applyCoupon(couponCode);
    if (success) setCouponCode('');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Your cart is empty!");
    
    // Validate required fields
    const requiredFields = ['full_name', 'phone', 'state', 'city', 'landmark', 'address', 'pincode'];
    const missingFields = requiredFields.filter(field => !form[field]?.trim());
    
    if (missingFields.length > 0) {
      return alert(`Please provide: ${missingFields.join(', ')}`);
    }

    setLoading(true);
    try {
      let addressId = selectedAddressId;

      // If no address is selected (adding new address), save it first
      if (!selectedAddressId) {
        const addressData = {
          address_type: form.address_type,
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          country: form.country,
          state: form.state,
          city: form.city,
          landmark: form.landmark,
          address: form.address,
          pincode: form.pincode,
          is_default: false // Don't set as default automatically
        };

        const addressResponse = await api.post('/users/profile/addresses', addressData);
        if (addressResponse.data.success) {
          addressId = addressResponse.data.address_id;
          // Refresh addresses list to include the new one
          await fetchAddresses();
          // Auto-select the newly created address
          setSelectedAddressId(addressId.toString());
        } else {
          throw new Error('Failed to save address');
        }
      }

      // Construct full shipping address
      const fullAddress = `${form.full_name}, ${form.phone}${form.email ? ', ' + form.email : ''}\n${form.address}\n${form.landmark}, ${form.city}, ${form.state} - ${form.pincode}${form.country !== 'India' ? ', ' + form.country : ''}`;

      const normalizedCart = cart.map((item) => {
        const variantId = getVariantId(item);
        const variant = getVariantDetails(item);

        return {
          ...item,
          selectedVariantId: variantId,
          selected_variant_id: variantId,
          variant_id: variantId,
          variant_name: variant.name || null,
          variant_value: variant.value || null,
          variant_price: variantId ? variant.price : null,
        };
      });
      
      const orderData = {
        cart: normalizedCart,
        total_amount: totalPrice,
        subtotal: rawSubtotal,
        gst: totalGst,
        discount: couponDiscount,
        coupon_code: appliedCoupon?.code || null,
        shipping_address: fullAddress,
        payment_method: form.payment_method,
        order_notes: form.order_notes,
        address_id: addressId
      };

      const response = await api.post('/users/orders', orderData);

      if (response.data.success) {
        setOrderStatus({
          type: 'success',
          message: `Order placed successfully! Your order number is ${response.data.order_number}`
        });
        clearCart();
        setTimeout(() => navigate('/dashboard'), 3000);
      }
    } catch (err) {
      console.error("Order failed:", err);
      setOrderStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to place order. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (orderStatus?.type === 'success') {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-success py-5 shadow-sm border-0 rounded-3">
          <h2 className="mb-3">🎉 {orderStatus.message}</h2>
          <p className="text-muted">Redirecting to your dashboard where you can track your order...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .checkout-container {
          background-color: #fdfdfd;
        }
        .info-card {
          border: none;
          background: none;
        }
        .address-alert {
          background-color: #fff8e1;
          border: 1px solid #ffe082;
          color: #856404;
          padding: 12px 20px;
          border-radius: 4px;
          font-size: 13px;
          margin-bottom: 25px;
        }
        .address-alert a {
          color: #007bff;
          font-weight: 600;
          text-decoration: none;
        }
        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 20px;
          
        }
        .notes-label {
          font-size: 13px;
          color: #666;
          margin-bottom: 8px;
          display: block;
        }
        .billing-card {
          background: #f8f9fa;
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 25px;
        }
        .billing-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding-bottom: 15px;
          margin-bottom: 15px;
          border-bottom: 1px solid #e9ecef;
        }
        .billing-item:last-of-type {
          border-bottom: none;
        }
        .item-thumb {
          width: 50px;
          height: 50px;
          object-fit: contain;
          background: #fff;
          border-radius: 4px;
          border: 1px solid #eee;
        }
        .item-info h6 {
          font-size: 13.5px;
          font-weight: 600;
          margin-bottom: 2px;
          color: #333;
        }
        .item-info span {
          font-size: 12px;
          color: #888;
        }
        .item-price {
          margin-left: auto;
          font-weight: 600;
          font-size: 14px;
          color: #444;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
        }
        .summary-row.total {
          border-top: 1px solid #dee2e6;
          padding-top: 12px;
          margin-top: 12px;
          font-weight: 700;
          color: #000;
          font-size: 16px;
        }
        .payment-method-card {
          background: #fff;
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 20px;
          margin-top: 25px;
        }
        .btn-place-order {
          background-color: #AB9774;
          color: white;
          border: none;
          padding: 14px;
          width: 100%;
          border-radius: 4px;
          font-weight: 700;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 20px;
          transition: background 0.3s;
        }
        .btn-place-order:hover:not(:disabled) {
          background-color: #8f7d60;
        }
        .btn-place-order:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .form-control:focus {
          border-color: #AB9774;
          box-shadow: 0 0 0 0.2rem rgba(171, 151, 116, 0.15);
        }
      `}</style>

      <HeroBanner title="Checkout" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Checkout' }]} />
      
      <div className="checkout-container py-5">
        <div className="container">
          <form onSubmit={handleSubmit}>
            <div className="row g-5">
              {/* Left Column: Shipping Info */}
              <div className="col-lg-7">
                <div className="info-card">
                  <h4 className="section-title">Shipping Information</h4>
                  
                  {addresses.length > 0 ? (
                    <>
                      <div className="mb-3">
                        <label className="notes-label">Select Address</label>
                        <select 
                          className="form-control" 
                          value={selectedAddressId} 
                          onChange={handleAddressSelect}
                        >
                          <option value="">+ Add New Address</option>
                          {addresses.map((addr) => (
                            <option key={addr.id} value={addr.id}>
                              {addr.address_type} - {addr.full_name}, {addr.city}, {addr.state}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {selectedAddressId && (
                        <div className="mb-3 p-3 bg-light rounded">
                          <strong>Selected Address:</strong><br />
                          {addresses.find((addr) => String(addr.id) === String(selectedAddressId)) && (
                            <>
                              {addresses.find((addr) => String(addr.id) === String(selectedAddressId)).full_name}, {addresses.find((addr) => String(addr.id) === String(selectedAddressId)).phone}<br />
                              {addresses.find((addr) => String(addr.id) === String(selectedAddressId)).address}<br />
                              {addresses.find((addr) => String(addr.id) === String(selectedAddressId)).landmark}, {addresses.find((addr) => String(addr.id) === String(selectedAddressId)).city}, {addresses.find((addr) => String(addr.id) === String(selectedAddressId)).state} - {addresses.find((addr) => String(addr.id) === String(selectedAddressId)).pincode}
                            </>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="address-alert shadow-sm">
                      No saved addresses found. <Link to="/dashboard">Add Address</Link> to continue or fill the form below.
                    </div>
                  )}

                  {/* Address Form Fields */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="notes-label">Full Name *</label>
                      <input 
                        type="text" 
                        name="full_name"
                        className="form-control"
                        placeholder="Full Name"
                        value={form.full_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="notes-label">Phone *</label>
                      <input 
                        type="text" 
                        name="phone"
                        className="form-control"
                        placeholder="Phone Number"
                        value={form.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="notes-label">Email (Optional)</label>
                      <input 
                        type="email" 
                        name="email"
                        className="form-control"
                        placeholder="Email Address"
                        value={form.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="notes-label">Address Type</label>
                      <select 
                        name="address_type" 
                        className="form-control"
                        value={form.address_type}
                        onChange={handleChange}
                      >
                        <option value="Home">Home</option>
                        <option value="Office">Office</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="notes-label">State *</label>
                      <input 
                        type="text" 
                        name="state"
                        className="form-control"
                        placeholder="State"
                        value={form.state}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="notes-label">City *</label>
                      <input 
                        type="text" 
                        name="city"
                        className="form-control"
                        placeholder="City"
                        value={form.city}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="notes-label">Area / Colony *</label>
                      <input 
                        type="text" 
                        name="landmark"
                        className="form-control"
                        placeholder="Area/Colony/Landmark"
                        value={form.landmark}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="notes-label">Pincode *</label>
                      <input 
                        type="text" 
                        name="pincode"
                        className="form-control"
                        placeholder="Pincode"
                        value={form.pincode}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="notes-label">Full Address *</label>
                      <textarea 
                        name="address" 
                        className="form-control" 
                        rows="3" 
                        placeholder="Street address, house number, building name, etc."
                        value={form.address} 
                        onChange={handleChange} 
                        required
                      ></textarea>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="notes-label">Order notes (optional)</label>
                    <textarea 
                      name="order_notes" 
                      className="form-control" 
                      rows="3" 
                      value={form.order_notes} 
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Right Column: Billing Summary & Payment */}
              <div className="col-lg-5">
                <div className="billing-card shadow-sm">
                  <h4 className="section-title mb-4" style={{ fontSize: '16px' }}>Billing Summary</h4>
                  
                  <div className="billing-items mb-4">
                    {cart.map((item) => {
                      const itemImg = item.product_image 
                        ? `${IMG_BASE_URL}${item.product_image}` 
                        : "https://via.placeholder.com/80x80?text=No+Image";
                      const itemTotal = getUnitPrice(item) * Number(item.qty);
                      const variant = getVariantDetails(item);

                      return (
                        <div key={item.cartItemId} className="billing-item">
                          <img src={itemImg} alt={item.product_name} className="item-thumb" />
                          <div className="item-info">
                            <h6>{item.product_name || item.name}</h6>
                            {hasVariantSelection(item) && (
                              <div className="text-muted small" style={{ fontSize: '11px' }}>
                                Variant: {variant.name || 'Selected Option'} {variant.value ? `(${variant.value})` : ""} {variant.price > 0 ? `- ₹${variant.price.toFixed(2)}` : ""}
                              </div>
                            )}
                            <span>Qty: {item.qty}</span>
                          </div>
                           <span className="item-price">₹{itemTotal.toFixed(2)}</span>
                        </div>
                      );
                    })}</div>

                  {/* Coupon Section */}
                  <div className="mb-4 pt-2">
                    <h6 className="fw-bold mb-2" style={{ fontSize: '14px' }}>Have a coupon?</h6>
                    {appliedCoupon ? (
                      <div className="d-flex align-items-center justify-content-between p-2 bg-white rounded border border-success">
                        <div style={{ flex: 1 }}>
                          <span className="fw-bold text-success" style={{ fontSize: '13px' }}>{appliedCoupon.code}</span>
                          <small className="d-block text-muted" style={{ fontSize: '11px' }}>Coupon applied!</small>
                        </div>
                        <button type="button" className="btn btn-sm btn-link text-danger p-0 text-decoration-none" style={{ fontSize: '12px' }} onClick={removeCoupon}>Remove</button>
                      </div>
                    ) : (
                      <div className="input-group input-group-sm">
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Enter coupon code" 
                          value={couponCode} 
                          onChange={(e) => setCouponCode(e.target.value)}
                        />
                        <button className="btn btn-dark" type="button" onClick={handleApplyCoupon}>Apply</button>
                      </div>
                    )}
                  </div>

                  <div className="summary-details">
                    {totalGst > 0 ? (
                      <>
                        <div className="summary-row">
                          <span>Subtotal (Excl. GST)</span>
                          <span>₹{rawSubtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="summary-row">
                          <span>GST</span>
                          <span className="text-secondary">(+) ₹{totalGst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="summary-row mt-2" style={{ borderTop: '1px dashed #eee', paddingTop: '8px' }}>
                          <span>Subtotal (Incl. GST)</span>
                          <span>₹{subtotalInclGst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                        </div>
                      </>
                    ) : (
                      <div className="summary-row">
                        <span>Subtotal</span>
                        <span>₹{rawSubtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="summary-row">
                      <span>Coupon Discount</span>
                      <span className="text-success">(-) ₹{couponDiscount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total</span>
                      <span>₹{totalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                <div className="payment-method-card shadow-sm">
                  <h4 className="section-title mb-3" style={{ fontSize: '16px' }}>Payment Method</h4>
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="payment_method" value="COD" checked={form.payment_method === 'COD'} onChange={handleChange} />
                    <label className="form-check-label fw-bold" style={{ fontSize: '13px', color: '#666' }}>
                      Cash on Delivery
                    </label>
                  </div>
                  
                  <button type="submit" className="btn-place-order shadow-sm" disabled={loading || cart.length === 0}>
                    {loading ? 'Processing...' : 'Place Order'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
