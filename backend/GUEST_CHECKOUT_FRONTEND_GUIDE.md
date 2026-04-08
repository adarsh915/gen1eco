# Guest Checkout - Frontend Integration Guide

## Overview
This guide helps integrate the guest checkout system on the frontend (React, Vue, or plain JavaScript).

## API Endpoints Summary

```
GET  /api/guest/validate-email?email=user@example.com
POST /api/guest/checkout
POST /api/guest/mark-complete (with auth token)
```

## Step-by-Step Integration

### 1. Cart Management (No Login Required)

**Store cart items in localStorage:**

```javascript
// Save cart
function saveCart(cart) {
  localStorage.setItem('guestCart', JSON.stringify(cart));
}

// Get cart
function getCart() {
  return JSON.parse(localStorage.getItem('guestCart') || '[]');
}

// Add to cart (no auth needed)
function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existingItem = cart.find(item => 
    item.id === product.id && 
    item.selectedVariant?.id === product.selectedVariant?.id
  );

  if (existingItem) {
    existingItem.qty += quantity;
  } else {
    cart.push({
      ...product,
      qty: quantity,
    });
  }

  saveCart(cart);
  return cart;
}

// Remove from cart
function removeFromCart(productId, variantId = null) {
  let cart = getCart();
  cart = cart.filter(item => 
    !(item.id === productId && item.selectedVariant?.id === variantId)
  );
  saveCart(cart);
  return cart;
}

// Clear cart
function clearCart() {
  localStorage.removeItem('guestCart');
}
```

### 2. Email Validation

**Before checkout, validate email:**

```javascript
async function validateEmail(email) {
  try {
    const response = await fetch(
      `/api/guest/validate-email?email=${encodeURIComponent(email)}`
    );
    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Validation failed');
    }
    
    return {
      available: data.available,
      message: data.message
    };
  } catch (error) {
    console.error('Email validation error:', error);
    return {
      available: false,
      message: 'Error validating email'
    };
  }
}

// Usage in form
document.getElementById('email').addEventListener('blur', async (e) => {
  const validation = await validateEmail(e.target.value);
  
  if (!validation.available) {
    showError(validation.message);
    e.target.classList.add('is-invalid');
  } else {
    showSuccess('Email is available!');
    e.target.classList.remove('is-invalid');
  }
});
```

### 3. Guest Checkout Form

**HTML Form:**

```html
<form id="guestCheckoutForm">
  <!-- Personal Information -->
  <fieldset>
    <legend>Personal Information</legend>
    
    <div class="form-group">
      <label for="name">Full Name *</label>
      <input 
        type="text" 
        id="name" 
        name="name" 
        required
        minlength="2"
        placeholder="John Doe"
      >
    </div>

    <div class="form-group">
      <label for="email">Email Address *</label>
      <input 
        type="email" 
        id="email" 
        name="email" 
        required
        placeholder="john@example.com"
      >
      <small class="form-text text-muted">You'll use this to login after checkout</small>
    </div>

    <div class="form-group">
      <label for="phone">Phone Number *</label>
      <input 
        type="tel" 
        id="phone" 
        name="phone" 
        required
        pattern="\d{10}"
        placeholder="9876543210"
      >
    </div>
  </fieldset>

  <!-- Shipping Address -->
  <fieldset>
    <legend>Shipping Address</legend>
    
    <div class="form-group">
      <label for="address">Address *</label>
      <textarea 
        id="address" 
        name="shipping_address" 
        required
        minlength="5"
        rows="3"
        placeholder="123 Main Street, Apt 4B"
      ></textarea>
    </div>

    <div class="form-row">
      <div class="form-group col-md-6">
        <label for="city">City *</label>
        <input 
          type="text" 
          id="city" 
          name="city" 
          required
          minlength="2"
          placeholder="Mumbai"
        >
      </div>

      <div class="form-group col-md-6">
        <label for="landmark">Landmark (Optional)</label>
        <input 
          type="text" 
          id="landmark" 
          name="landmark" 
          placeholder="Near School"
        >
      </div>
    </div>

    <div class="form-row">
      <div class="form-group col-md-4">
        <label for="state">State *</label>
        <input 
          type="text" 
          id="state" 
          name="state" 
          required
          minlength="2"
          placeholder="Maharashtra"
        >
      </div>

      <div class="form-group col-md-4">
        <label for="pincode">Pincode *</label>
        <input 
          type="text" 
          id="pincode" 
          name="pincode" 
          required
          pattern="\d{6}"
          placeholder="400001"
        >
      </div>

      <div class="form-group col-md-4">
        <label for="country">Country *</label>
        <input 
          type="text" 
          id="country" 
          name="country" 
          required
          minlength="2"
          placeholder="India"
        >
      </div>
    </div>
  </fieldset>

  <!-- Order Notes -->
  <fieldset>
    <legend>Order Notes (Optional)</legend>
    
    <div class="form-group">
      <label for="order_notes">Special Instructions</label>
      <textarea 
        id="order_notes" 
        name="order_notes" 
        rows="2"
        placeholder="e.g., Please deliver after 5 PM"
      ></textarea>
    </div>
  </fieldset>

  <!-- Payment Method -->
  <fieldset>
    <legend>Payment Method *</legend>
    
    <div class="form-check">
      <input 
        type="radio" 
        id="cod" 
        name="payment_method" 
        value="COD" 
        required
        checked
      >
      <label class="form-check-label" for="cod">
        Cash on Delivery (COD)
      </label>
    </div>

    <div class="form-check">
      <input 
        type="radio" 
        id="upi" 
        name="payment_method" 
        value="UPI" 
        required
      >
      <label class="form-check-label" for="upi">
        UPI
      </label>
    </div>

    <div class="form-check">
      <input 
        type="radio" 
        id="card" 
        name="payment_method" 
        value="CARD" 
        required
      >
      <label class="form-check-label" for="card">
        Credit/Debit Card
      </label>
    </div>
  </fieldset>

  <!-- Order Summary -->
  <div class="order-summary">
    <h3>Order Summary</h3>
    <div class="summary-item">
      <span>Subtotal:</span>
      <span id="subtotalDisplay">₹0</span>
    </div>
    <div class="summary-item">
      <span>Tax (GST):</span>
      <span id="taxDisplay">₹0</span>
    </div>
    <div class="summary-item">
      <span>Discount:</span>
      <span id="discountDisplay">₹0</span>
    </div>
    <div class="summary-item total">
      <span>Total:</span>
      <span id="totalDisplay">₹0</span>
    </div>
  </div>

  <!-- Submit -->
  <button type="submit" class="btn btn-primary btn-lg btn-block">
    Place Order
  </button>
</form>
```

### 4. Form Submission Handler

**JavaScript:**

```javascript
const form = document.getElementById('guestCheckoutForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Get form data
  const formData = new FormData(form);
  const checkoutData = Object.fromEntries(formData);
  
  // Get cart from localStorage
  const cart = getCart();
  if (cart.length === 0) {
    showError('Your cart is empty');
    return;
  }
  
  // Add cart data
  checkoutData.cart = cart;
  
  // Calculate totals
  const subtotal = cart.reduce((sum, item) => 
    sum + (item.sale_price || item.price) * item.qty, 0
  );
  const gst = Math.round(subtotal * 0.18); // 18% GST
  const total = subtotal + gst;
  
  checkoutData.subtotal = subtotal;
  checkoutData.gst = gst;
  checkoutData.total_amount = total;
  checkoutData.discount = 0;
  
  // Show loading state
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Processing...';
  
  try {
    // Submit order
    const response = await fetch('/api/guest/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(checkoutData)
    });
    
    const data = await response.json();
    
    if (!data.success) {
      showError(data.message);
      return;
    }
    
    // Success! Auto-login and redirect
    localStorage.setItem('token', data.token);
    clearCart();
    
    // Show success message
    showSuccess(`
      Order placed successfully!
      Order #: ${data.order_number}
      Login credentials sent to ${data.email}
    `);
    
    // Redirect after 2 seconds
    setTimeout(() => {
      window.location.href = `/order-confirmation/${data.order_number}`;
    }, 2000);
    
  } catch (error) {
    console.error('Checkout error:', error);
    showError('An error occurred. Please try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});
```

### 5. Success Page

**Show order details:**

```javascript
// After successful checkout redirect
async function showOrderConfirmation(orderNumber) {
  try {
    // Fetch order details (if you have this endpoint)
    const response = await fetch(`/orders/api/${orderNumber}`);
    const order = await response.json();
    
    // Display confirmation
    const confirmationHtml = `
      <div class="order-confirmation">
        <div class="alert alert-success">
          <h2>✅ Order Placed Successfully!</h2>
        </div>
        
        <div class="confirmation-details">
          <h3>Order Details</h3>
          <dl>
            <dt>Order Number:</dt>
            <dd>${order.order_number}</dd>
            
            <dt>Total Amount:</dt>
            <dd>₹${order.total_amount}</dd>
            
            <dt>Order Status:</dt>
            <dd>${order.order_status}</dd>
            
            <dt>Payment Method:</dt>
            <dd>${order.payment_method}</dd>
          </dl>
        </div>
        
        <div class="account-info">
          <h3>Your Account</h3>
          <p class="alert alert-info">
            A temporary password has been sent to your email.
            <br>
            <strong>You can now login and track your order.</strong>
            <br>
            We recommend changing your password after first login.
          </p>
          <a href="/login" class="btn btn-primary">Login to Your Account</a>
          <a href="/" class="btn btn-secondary">Continue Shopping</a>
        </div>
      </div>
    `;
    
    document.getElementById('confirmation').innerHTML = confirmationHtml;
    
  } catch (error) {
    console.error('Error fetching order confirmation:', error);
    showError('Could not load order details');
  }
}
```

### 6. Coupon Integration (Optional)

```javascript
// Apply coupon to checkout
async function applyCoupon(couponCode) {
  try {
    const response = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ coupon_code: couponCode })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      showError(data.message);
      return null;
    }
    
    return data.discount;
    
  } catch (error) {
    console.error('Coupon validation error:', error);
    showError('Error applying coupon');
    return null;
  }
}

// In form submission
if (couponCode) {
  const discount = await applyCoupon(couponCode);
  if (discount) {
    checkoutData.coupon_code = couponCode;
    checkoutData.discount = discount;
    checkoutData.total_amount = subtotal + gst - discount;
  }
}
```

## Complete React Example

```jsx
import React, { useState, useEffect } from 'react';

export function GuestCheckout() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    shipping_address: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    landmark: '',
    payment_method: 'COD',
    order_notes: ''
  });

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
    setCart(savedCart);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => 
      sum + (item.sale_price || item.price) * item.qty, 0
    );
    const gst = Math.round(subtotal * 0.18);
    return { subtotal, gst, total: subtotal + gst };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { subtotal, gst, total } = calculateTotals();

      const checkoutData = {
        ...formData,
        cart,
        total_amount: total,
        subtotal,
        gst,
        discount: 0,
        coupon_code: null
      };

      const response = await fetch('/api/guest/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutData)
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      // Success
      localStorage.setItem('token', data.token);
      localStorage.removeItem('guestCart');
      
      // Redirect
      window.location.href = `/order-confirmation/${data.order_number}`;

    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, gst, total } = calculateTotals();

  return (
    <div className="guest-checkout">
      <h1>Complete Your Order</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        {/* Form fields using formData state */}
        {/* ... (JSX for form fields) ... */}
        
        <button 
          type="submit" 
          disabled={loading || cart.length === 0}
          className="btn btn-primary btn-lg"
        >
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </form>

      {/* Order Summary */}
      <aside className="order-summary">
        <h3>Order Summary</h3>
        <p>Subtotal: ₹{subtotal}</p>
        <p>Tax (GST 18%): ₹{gst}</p>
        <p className="total">Total: ₹{total}</p>
      </aside>
    </div>
  );
}
```

## Helper Functions

```javascript
// Show toast/alert messages
function showSuccess(message) {
  // Use your toast library (Toastr, React-Toastify, etc.)
  console.log('✅', message);
}

function showError(message) {
  console.error('❌', message);
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
}

// Validate phone
function isValidPhone(phone) {
  return /^\d{10}$/.test(phone.replace(/\D/g, ''));
}

// Validate pincode
function isValidPincode(pincode) {
  return /^\d{6}$/.test(pincode);
}
```

## Error Handling

```javascript
// Handle different error scenarios
async function handleCheckoutError(response, data) {
  switch (response.status) {
    case 400:
      // Validation error
      showError('Please fill all required fields correctly');
      break;
    case 409:
      // Email already exists
      showError('Email already registered. Please login instead.');
      window.location.href = '/login';
      break;
    case 500:
      // Server error
      showError('Server error. Please try again later.');
      break;
    default:
      showError(data.message || 'An error occurred');
  }
}
```

## Testing Checklist

- [ ] Cart works without login
- [ ] Email validation before checkout
- [ ] Form validation works
- [ ] Checkout submission succeeds
- [ ] Account created automatically
- [ ] Email received with credentials
- [ ] Auto-login with token works
- [ ] Order visible in user account
- [ ] Address saved to account
- [ ] Stock decremented correctly
- [ ] Works with coupons
- [ ] Mobile responsive

---

**Ready to integrate!** Test with the backend endpoints provided in the main guide.
