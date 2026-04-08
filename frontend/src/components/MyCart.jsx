import { Link } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { useCart } from "../context/CartContext";

const MyCart = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, totalPrice, totalItems } = useCart();
  const IMG_BASE_URL = `${process.env.REACT_APP_API_URL}/uploads/products/`;

  return (
    <>
      <style>{`


        /* ── Overlay ── */
        .mc-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.48);
          z-index: 1400;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
        }
        .mc-overlay.show { opacity: 1; pointer-events: auto; }

        /* ── Panel ── */
        .mc-panel {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 380px;
          max-width: 100vw;
          background: #fff;
          z-index: 1500;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: -4px 0 30px rgba(0, 0, 0, 0.2);
          
        }
        .mc-panel.open { transform: translateX(0); }

        /* ── Header ── */
        .mc-head {
          background: #AB9774;
          padding: 0 20px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .mc-head-title {
          color: #fff;
          font-size: 18px;
          font-weight: 700;
          margin: 0;
        }
        .mc-close-btn {
          background: #fff;
          border: none;
          cursor: pointer;
          color: #DB4437;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* ── Body ── */
        .mc-body {
          flex: 1;
          overflow-y: auto;
          padding: 10px 0;
        }

        .mc-empty {
          text-align: center;
          padding: 40px 20px;
          color: #888;
        }

        /* ── Item List ── */
        .mc-item {
          display: flex;
          align-items: center;
          padding: 15px 20px;
          border-bottom: 1px solid #f1f1f1;
          gap: 15px;
        }
        .mc-item-img-box {
          width: 80px;
          height: 80px;
          border: 1px solid #ddd;
          padding: 4px;
          flex-shrink: 0;
        }
        .mc-item-img-box img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .mc-item-info {
          flex: 1;
        }
        .mc-item-name {
          font-size: 14px;
          font-weight: 700;
          color: #333;
          margin: 0 0 5px;
          line-height: 1.3;
        }
        .mc-item-price {
          font-size: 13px;
          color: #333;
          font-weight: 500;
        }
        .mc-item-remove {
          background: none;
          border: none;
          cursor: pointer;
          color: #333;
          font-size: 16px;
          padding: 5px;
          opacity: 0.6;
          transition: opacity 0.2s;
        }
        .mc-item-remove:hover { opacity: 1; }

        /* ── Inline Footer (after items) ── */
        .mc-footer-inline {
          padding: 20px;
          background: #fff;
        }
        .mc-subtotal-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .mc-subtotal-label {
          font-size: 18px;
          font-weight: 700;
          color: #333;
        }
        .mc-subtotal-value {
          font-size: 18px;
          font-weight: 700;
          color: #333;
        }
        .mc-btn-viewcart {
          display: block;
          width: 100%;
          padding: 12px;
          background: #AB9774;
          color: #fff;
          text-align: center;
          text-decoration: none;
          font-weight: 600;
          font-size: 15px;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
        }
        .mc-btn-viewcart:hover { background: #968363; }

        @media (max-width: 480px) {
          .mc-panel { width: 100vw; }
        }
      `}</style>

      {/* Overlay */}
      <div className={`mc-overlay${isOpen ? " show" : ""}`} onClick={onClose} />

      {/* Panel */}
      <div className={`mc-panel${isOpen ? " open" : ""}`}>
        <div className="mc-head">
          <h5 className="mc-head-title">My Cart ({totalItems})</h5>
          <button className="mc-close-btn" onClick={onClose}>
            <FaTimes size={16} />
          </button>
        </div>

        <div className="mc-body">
          {cart.length === 0 ? (
            <div className="mc-empty">Your cart is empty.</div>
          ) : (
            <>
              {cart.map((item) => {
                const rawImg = item.product_image || item.image;
                const itemImg = rawImg
                  ? (rawImg.startsWith('http') ? rawImg : `${IMG_BASE_URL}${rawImg}`)
                  : "https://via.placeholder.com/80x80?text=No+Image";

                const hasVariant = Boolean(
                  item.selectedVariantId
                  || item.selected_variant_id
                  || item.variant_id
                  || item.variantId
                  || item.selectedVariant?.id
                  || item.selected_variant?.id
                );
                const variantName = item.selectedVariant?.variant_name || item.selected_variant?.variant_name || item.selectedVariantName || item.selected_variant_name || item.variant_name || "";
                const variantValue = item.selectedVariant?.variant_value || item.selected_variant?.variant_value || item.selectedVariantValue || item.selected_variant_value || item.variant_value || "";
                const variantPrice = Number((item.selectedVariant?.price ?? item.selected_variant?.price ?? item.variant_price ?? item.selectedVariantPrice ?? item.selected_variant_price) || 0);

                // ---- Dynamic Unit Price & Total Logic ----
                const price = hasVariant
                  ? variantPrice
                  : Number(item.sale_price || item.price || 0);
                const discount = (!hasVariant && item.discount_percent) 
                  ? (price * item.discount_percent / 100) 
                  : 0;
                const basePrice = price - discount;

                return (
                  <div key={item.cartItemId} className="mc-item">
                    <div className="mc-item-img-box">
                      <img src={itemImg} alt={item.product_name || item.name} />
                    </div>
                    <div className="mc-item-info">
                      <p className="mc-item-name">{item.product_name || item.name}</p>
                      {hasVariant && (
                        <p className="mc-item-price" style={{ marginBottom: 2 }}>
                          {variantName || 'Selected Option'} {variantValue ? `(${variantValue})` : ''}
                        </p>
                      )}
                      <p className="mc-item-price">
                        {item.qty} × ₹{basePrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <button
                      className="mc-item-remove"
                      onClick={() => removeFromCart(item.cartItemId)}
                      aria-label="Remove item"
                    >
                      <FaTimes size={14} />
                    </button>
                  </div>
                );
              })}

              <div className="mc-footer-inline">
                <div className="mc-subtotal-row">
                  <span className="mc-subtotal-label">Sub Total</span>
                  <span className="mc-subtotal-value">₹{totalPrice.toLocaleString()}</span>
                </div>
                <Link to="/cart" className="mc-btn-viewcart" onClick={onClose}>
                  View Cart
                </Link>
              </div>
            </>
          )}
        </div>

      </div>
    </>
  );
};

export default MyCart;