import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import HeroBanner from './HeroBanner';
import { FaPlus, FaMinus, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

const IMG_BASE_URL = `${process.env.REACT_APP_API_URL}/uploads/products/`;

export default function CartPage() {
  const [isUpdatingCart, setIsUpdatingCart] = useState(false);
  const { 
    cart, updateQty, removeFromCart, 
    rawSubtotal, subtotalInclGst, couponDiscount, totalGst, totalPrice
  } = useCart();

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

  const handleUpdateQty = (cartItemId, delta, currentQty) => {
    if (currentQty + delta > 0) {
      updateQty(cartItemId, currentQty + delta);
    }
  };

  const handleUpdateCart = () => {
    if (isUpdatingCart) return;
    setIsUpdatingCart(true);
    toast.info('Updating cart...', { position: 'top-right', autoClose: 900 });

    setTimeout(() => {
      setIsUpdatingCart(false);
      toast.success('Cart updated successfully', { position: 'top-right', autoClose: 1500 });
    }, 900);
  };


  return (
    <>
      <style>{`
        .cart-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #333;
          text-align: center;
          padding: 15px;
          border: 1px solid #dee2e6;
        }
        .cart-table td {
          text-align: center;
          padding: 15px;
          border: 1px solid #dee2e6;
          vertical-align: middle;
        }
        .qty-picker {
          display: inline-flex;
          align-items: center;
          border: 1px solid #ced4da;
          border-radius: 4px;
        }
        .qty-btn {
          background: none;
          border: none;
          padding: 5px 10px;
          cursor: pointer;
          color: #6c757d;
        }
        .qty-input {
          width: 40px;
          border: none;
          text-align: center;
          border-left: 1px solid #ced4da;
          border-right: 1px solid #ced4da;
          font-weight: 600;
        }
        .remove-btn {
          background: #e53935;
          color: #fff;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          cursor: pointer;
          transition: background 0.2s;
        }
        .remove-btn:hover {
          background: #d32f2f;
        }
        .btn-update {
          background-color: #007bff;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          font-weight: 600;
        }
        .coupon-card, .summary-card {
          border: 1px solid #f0f0f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border-radius: 8px;
        }
        .btn-apply {
          background-color: #0d6efd;
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 4px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          color: #666;
          font-size: 14px;
        }
        .summary-row.total {
          font-weight: 700;
          color: #1a1a1a;
          border-top: 1px dashed #ddd;
          margin-top: 10px;
          padding-top: 15px;
        }
        .btn-checkout {
          background-color: #198754;
          color: white;
          width: 100%;
          padding: 12px;
          border-radius: 25px;
          border: none;
          font-weight: 600;
          margin-top: 20px;
          text-decoration: none;
          display: block;
          text-align: center;
        }
      `}</style>

      <HeroBanner title="Cart" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Cart' }]} />
      
      <div className="container py-5">
        <h2 className="mb-4 fw-bold" style={{ fontSize: '24px' }}>My Cart</h2>
        
        {cart.length === 0 ? (
          <div className="text-center py-5">
            <h3 className="mb-4">Your cart is empty</h3>
            <Link to="/" className="btn btn-primary px-4 py-2">Continue Shopping</Link>
          </div>
        ) : (
          <>
            <div className="table-responsive mb-4">
              <table className="table cart-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => {
                    const itemImg = item.product_image 
                      ? `${IMG_BASE_URL}${item.product_image}` 
                      : "https://via.placeholder.com/80x80?text=No+Image";
                    const hasVariant = hasVariantSelection(item);
                    const variant = getVariantDetails(item);
                    const basePrice = getUnitPrice(item);
                    const isDiscounted = !hasVariant && Number(item.sale_price || 0) > 0;
                    const itemTotal = basePrice * Number(item.qty);
                    
                    return (
                      <tr key={item.cartItemId}>
                        <td>
                          <Link to={`/product/${item.id}/${item.product_slug || item.slug || 'product'}`}>
                            <img src={itemImg} alt={item.product_name} style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                          </Link>
                        </td>
                        <td className="text-start fw-bold" style={{ minWidth: '200px' }}>
                          <Link to={`/product/${item.id}/${item.product_slug || item.slug || 'product'}`} className="text-decoration-none text-dark">
                            {item.product_name || item.name}
                          </Link>
                          {hasVariant && (
                            <div className="text-muted small fw-normal">
                              Variant: {variant.name || 'Selected Option'} {variant.value ? `(${variant.value})` : ""} {variant.price > 0 ? `- ₹${variant.price.toFixed(2)}` : ""}
                            </div>
                          )}
                        </td>
                        <td className="fw-bold">
                          ₹{basePrice.toFixed(2)} 
                          {isDiscounted && item.price > item.sale_price && (
                            <small className="text-success">
                              (-{(((item.price - item.sale_price) / item.price) * 100).toFixed(0)}%)
                            </small>
                          )}
                        </td>
                        <td>
                          <div className="qty-picker">
                            <button className="qty-btn" onClick={() => handleUpdateQty(item.cartItemId, -1, item.qty)}>
                              <FaMinus size={12} />
                            </button>
                            <input type="text" className="qty-input" value={item.qty} readOnly />
                            <button className="qty-btn" onClick={() => handleUpdateQty(item.cartItemId, 1, item.qty)}>
                              <FaPlus size={12} />
                            </button>
                          </div>
                        </td>
                        <td className="fw-bold">₹{itemTotal.toFixed(2)}</td>
                        <td>
                          <button className="remove-btn" onClick={() => removeFromCart(item.cartItemId)}>
                            <FaTimes size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mb-5">
              <button
                className="btn-update shadow-sm"
                type="button"
                onClick={handleUpdateCart}
                disabled={isUpdatingCart}
                style={{ opacity: isUpdatingCart ? 0.75 : 1, cursor: isUpdatingCart ? 'wait' : 'pointer' }}
              >
                {isUpdatingCart ? 'Updating...' : 'Update Cart'}
              </button>
            </div>

            <div className="row">
              <div className="col-md-4 offset-md-8">
                <div className="summary-card p-4">
                  <h5 className="fw-bold mb-4" style={{ fontSize: '18px' }}>Cart Summary</h5>
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
                  <div className="summary-row total mt-3">
                    <span className="h5 fw-bold mb-0">Total</span>
                    <span className="h5 fw-bold mb-0">₹{totalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <Link to="/checkout" className="btn-checkout mt-4">
                    Proceed to Checkout
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
