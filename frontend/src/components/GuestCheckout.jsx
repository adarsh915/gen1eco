import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import HeroBanner from './HeroBanner';

const IMG_BASE_URL = `${process.env.REACT_APP_API_URL}/uploads/products/`;

export default function GuestCheckout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    shipping_address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    landmark: '',
    order_notes: '',
    payment_method: 'COD'
  });

  const [errors, setErrors] = useState({});
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

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

  const normalizeGuestCart = (items) => {
    if (!Array.isArray(items)) return [];

    return items.map((item) => {
      const baseProductId = item.productId || item.id || item._id;
      const variantId = getVariantId(item);
      const variant = getVariantDetails(item);

      return {
        ...item,
        id: baseProductId,
        productId: baseProductId,
        cartItemId: item.cartItemId || `${baseProductId}-${variantId || 'base'}`,
        qty: Number(item.qty || 1),
        selectedVariantId: variantId,
        selected_variant_id: variantId,
        variant_id: variantId,
        variant_name: variant.name || null,
        variant_value: variant.value || null,
        variant_price: variantId ? variant.price : null,
      };
    });
  };

  useEffect(() => {
    // Load cart from localStorage
    const guestCart = normalizeGuestCart(JSON.parse(localStorage.getItem('guestCart') || '[]'));
    setCart(guestCart);

    if (guestCart.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
    }
  }, [navigate]);

  const handleEmailBlur = (e) => {
    const email = e.target.value;
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors(prev => ({ ...prev, email: null }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    // For email, just validate format locally
    if (name === 'email' && value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setErrors(prev => ({ ...prev, email: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    // Email validation is now optional - we assume valid format is acceptable
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Phone must be 10 digits';
    if (!formData.shipping_address.trim()) newErrors.shipping_address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Pincode must be 6 digits';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) =>
      sum + (getUnitPrice(item) * Number(item.qty || 1)), 0
    );
    const gst = Math.round(subtotal * 0.18); // 18% GST
    const discount = appliedCoupon ? Number(appliedCoupon.discount_amount) || 0 : 0;
    const total = subtotal + gst - discount;
    return { subtotal, gst, total, discount };
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setCouponLoading(true);
    try {
      // Try to validate coupon with API
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/coupons/guest/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          coupon_code: couponCode,
          amount: calculateTotals().subtotal
        })
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        toast.error('Coupon service unavailable');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setAppliedCoupon(data.coupon);
        setCouponCode('');
        toast.success(`Coupon "${data.coupon.code}" applied!`);
      } else {
        toast.error(data.message || 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
      toast.error('Error applying coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.info('Coupon removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      const { subtotal, gst, total, discount } = calculateTotals();
      const normalizedCart = normalizeGuestCart(cart);

      const checkoutData = {
        ...formData,
        cart: normalizedCart,
        subtotal,
        gst,
        total_amount: total,
        discount: discount,
        coupon_code: appliedCoupon?.code || null
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/guest/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(checkoutData)
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(data.message || 'Checkout failed');
        return;
      }

      // Success! Store token and clear guest cart
      localStorage.setItem('token', data.token);
      localStorage.removeItem('guestCart');

      toast.success(`Order placed successfully! Order #: ${data.order_number}`);

      // Redirect to order confirmation
      setTimeout(() => {
        navigate(`/order-confirmation/${data.order_number}`);
      }, 2000);

    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, gst, total, discount } = calculateTotals();

  if (cart.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning">
          <h4>Your cart is empty</h4>
          <p>Please add some products to your cart before checkout.</p>
          <Link to="/" className="btn btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .guest-checkout-container {
          background-color: #fdfdfd;
          min-height: 100vh;
        }
        .checkout-form {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 15px rgba(0,0,0,0.08);
          padding: 30px;
          margin-bottom: 30px;
        }
        .form-section {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }
        .form-section:last-child {
          border-bottom: none;
        }
        .section-title {
          color: #2c3e50;
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
        }
        .section-title::before {
          content: '';
          width: 4px;
          height: 20px;
          background: #AB9774;
          margin-right: 12px;
          border-radius: 2px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-label {
          font-weight: 500;
          color: #555;
          margin-bottom: 8px;
          display: block;
        }
        .form-control {
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 12px 16px;
          font-size: 14px;
          transition: border-color 0.3s;
        }
        .form-control:focus {
          border-color: #AB9774;
          box-shadow: 0 0 0 0.2rem rgba(171, 151, 116, 0.15);
        }
        .form-control.is-invalid {
          border-color: #dc3545;
        }
        .invalid-feedback {
          color: #dc3545;
          font-size: 13px;
          margin-top: 5px;
        }
        .email-validation {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .email-status {
          font-size: 13px;
          padding: 4px 8px;
          border-radius: 4px;
        }
        .email-valid {
          background: #d4edda;
          color: #155724;
        }
        .email-invalid {
          background: #f8d7da;
          color: #721c24;
        }
        .payment-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }
        .payment-option {
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 15px;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
        }
        .payment-option:hover {
          border-color: #AB9774;
        }
        .payment-option.selected {
          border-color: #AB9774;
          background: rgba(171, 151, 116, 0.05);
        }
        .payment-option input[type="radio"] {
          display: none;
        }
        .order-summary {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 15px rgba(0,0,0,0.08);
          padding: 25px;
          position: sticky;
          top: 20px;
        }
        .summary-title {
          font-size: 18px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 20px;
        }
        .cart-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .cart-item:last-child {
          border-bottom: none;
        }
        .item-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #eee;
        }
        .item-details h6 {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 5px 0;
          color: #333;
        }
        .item-details span {
          font-size: 12px;
          color: #777;
        }
        .item-price {
          margin-left: auto;
          font-weight: 600;
          color: #333;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
          color: #666;
        }
        .summary-row.total {
          border-top: 2px solid #eee;
          padding-top: 15px;
          margin-top: 15px;
          font-size: 16px;
          font-weight: 600;
          color: #000;
        }
        .btn-place-order {
          background: #AB9774;
          color: white;
          border: none;
          padding: 16px;
          width: 100%;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: background 0.3s;
          margin-top: 20px;
        }
        .btn-place-order:hover:not(:disabled) {
          background: #8f7d60;
        }
        .btn-place-order:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .login-prompt {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          margin-bottom: 30px;
        }
        .login-prompt h5 {
          margin-bottom: 10px;
        }
        .login-prompt p {
          margin-bottom: 15px;
          opacity: 0.9;
        }
        .coupon-section {
          padding: 15px 0;
          border-bottom: 1px solid #eee;
          margin-bottom: 15px;
        }
        .coupon-applied {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 8px;
          background-color: #f0f8f5;
          border-radius: 4px;
        }
        .coupon-applied-code {
          font-weight: 600;
          color: #28a745;
          font-size: 13px;
          word-break: break-word;
        }
        .coupon-layout {
          display: flex;
          gap: 8px;
          align-items: stretch;
        }
        .coupon-input {
          flex: 1;
          min-width: 0;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 13px;
        }
        .coupon-apply-btn {
          padding: 8px 12px;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          flex-shrink: 0;
        }
        @media (max-width: 768px) {
          .checkout-form {
            padding: 20px;
          }
          .payment-options {
            grid-template-columns: 1fr;
          }
          .coupon-layout {
            flex-direction: column;
          }
          .coupon-apply-btn {
            width: 100%;
          }
          .coupon-applied {
            align-items: flex-start;
          }
        }
      `}</style>

      <HeroBanner title="Guest Checkout" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Cart', href: '/cart' }, { label: 'Guest Checkout' }]} />

      <div className="guest-checkout-container py-5">
        <div className="container">
          <div className="login-prompt">
            <h5>💡 Already have an account?</h5>
            <p>Sign in to use your saved addresses and faster checkout</p>
            <Link
              to="/login"
              state={{ redirectTo: '/checkout', fromGuestCheckout: true }}
              className="btn btn-light"
            >
              Sign In
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* Left Column: Form */}
              <div className="col-lg-8">
                <div className="checkout-form">
                  {/* Personal Information */}
                  <div className="form-section">
                    <h3 className="section-title">Personal Information</h3>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Full Name *</label>
                          <input
                            type="text"
                            name="name"
                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Phone Number *</label>
                          <input
                            type="tel"
                            name="phone"
                            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                            placeholder="9876543210"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                          />
                          {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleEmailBlur}
                        required
                      />
                      {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                      <small className="text-muted">You'll use this to login after checkout</small>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="form-section">
                    <h3 className="section-title">Shipping Address</h3>

                    <div className="form-group">
                      <label className="form-label">Full Address *</label>
                      <textarea
                        name="shipping_address"
                        className={`form-control ${errors.shipping_address ? 'is-invalid' : ''}`}
                        rows="3"
                        placeholder="123 Main Street, Apt 4B"
                        value={formData.shipping_address}
                        onChange={handleChange}
                        required
                      />
                      {errors.shipping_address && <div className="invalid-feedback">{errors.shipping_address}</div>}
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">City *</label>
                          <input
                            type="text"
                            name="city"
                            className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                            placeholder="Mumbai"
                            value={formData.city}
                            onChange={handleChange}
                            required
                          />
                          {errors.city && <div className="invalid-feedback">{errors.city}</div>}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Landmark (Optional)</label>
                          <input
                            type="text"
                            name="landmark"
                            className="form-control"
                            placeholder="Near School"
                            value={formData.landmark}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label className="form-label">State *</label>
                          <input
                            type="text"
                            name="state"
                            className={`form-control ${errors.state ? 'is-invalid' : ''}`}
                            placeholder="Maharashtra"
                            value={formData.state}
                            onChange={handleChange}
                            required
                          />
                          {errors.state && <div className="invalid-feedback">{errors.state}</div>}
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="form-group">
                          <label className="form-label">Pincode *</label>
                          <input
                            type="text"
                            name="pincode"
                            className={`form-control ${errors.pincode ? 'is-invalid' : ''}`}
                            placeholder="400001"
                            value={formData.pincode}
                            onChange={handleChange}
                            required
                          />
                          {errors.pincode && <div className="invalid-feedback">{errors.pincode}</div>}
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="form-group">
                          <label className="form-label">Country *</label>
                          <input
                            type="text"
                            name="country"
                            className="form-control"
                            placeholder="India"
                            value={formData.country}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Notes */}
                  <div className="form-section">
                    <h3 className="section-title">Order Notes (Optional)</h3>
                    <div className="form-group">
                      <label className="form-label">Special Instructions</label>
                      <textarea
                        name="order_notes"
                        className="form-control"
                        rows="2"
                        placeholder="e.g., Please deliver after 5 PM"
                        value={formData.order_notes}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="form-section">
                    <h3 className="section-title">Payment Method *</h3>
                    <div className="payment-options">
                      <label className={`payment-option ${formData.payment_method === 'COD' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="payment_method"
                          value="COD"
                          checked={formData.payment_method === 'COD'}
                          onChange={handleChange}
                        />
                        <div>
                          <strong>Cash on Delivery (COD)</strong>
                          <br />
                          <small>Pay when you receive your order</small>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="col-lg-4">
                <div className="order-summary">
                  <h4 className="summary-title">Order Summary</h4>

                  {/* Cart Items */}
                  <div className="cart-items">
                    {cart.map((item, index) => {
                      const variant = getVariantDetails(item);
                      const itemTotal = getUnitPrice(item) * Number(item.qty || 1);
                      return (
                      <div key={item.cartItemId || index} className="cart-item">
                        <img
                          src={`${IMG_BASE_URL}${item.product_image || 'placeholder.jpg'}`}
                          alt={item.product_name}
                          className="item-image"
                          onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                        />
                        <div className="item-details">
                          <h6>{item.product_name || item.name}</h6>
                          {hasVariantSelection(item) && (
                            <span style={{ display: 'block' }}>
                              Variant: {variant.name || 'Selected Option'} {variant.value ? `(${variant.value})` : ''}
                            </span>
                          )}
                          <span>Qty: {item.qty}</span>
                        </div>
                        <div className="item-price">
                          ₹{itemTotal.toLocaleString()}
                        </div>
                      </div>
                    );})}
                  </div>

                  {/* Coupon Section */}
                  <div className="coupon-section">
                    <h6 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>Have a coupon?</h6>
                    {appliedCoupon ? (
                      <div className="coupon-applied">
                        <div>
                          <span className="coupon-applied-code">{appliedCoupon.code}</span>
                          <small style={{ color: '#666', fontSize: '11px', display: 'block' }}>Coupon applied!</small>
                        </div>
                        <button type="button" onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="coupon-layout">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Enter coupon code"
                          className="coupon-input"
                          onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="coupon-apply-btn"
                          style={{
                            backgroundColor: couponLoading || !couponCode.trim() ? '#ccc' : '#AB9774',
                            color: 'white',
                            cursor: couponLoading || !couponCode.trim() ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {couponLoading ? 'Applying...' : 'Apply'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="summary-totals">
                    <div className="summary-row">
                      <span>Subtotal:</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="summary-row">
                      <span>Tax (GST 18%):</span>
                      <span>₹{gst.toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                      <div className="summary-row" style={{ color: '#28a745' }}>
                        <span>Discount:</span>
                        <span>-₹{discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="summary-row total">
                      <span>Total:</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-place-order"
                    disabled={loading || cart.length === 0}
                  >
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