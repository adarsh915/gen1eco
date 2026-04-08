import { FaTimes, FaTrash, FaShoppingCart } from "react-icons/fa";
import { useCart } from "../context/CartContext";

const Wishlist = ({ isOpen, onClose }) => {
  const { wishlist, removeFromWishlist, addToCart } = useCart();
  const IMG_BASE_URL = `${process.env.REACT_APP_API_URL}/uploads/products/`;

  const handleAddToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product.wishlistItemId || `${product.id || product._id}-${product.selectedVariantId || product.selectedVariant?.id || 'base'}`);
  };

  return (
    <>
      <style>{`


        .wl-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.48);
          z-index: 1400;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
        }
        .wl-overlay.show { opacity: 1; pointer-events: auto; }

        .wl-panel {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 360px;
          max-width: 100vw;
          background: #fff;
          z-index: 1500;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: -4px 0 28px rgba(0, 0, 0, 0.18);
          
        }
        .wl-panel.open { transform: translateX(0); }

        .wl-head {
          background: #AB9774;
          padding: 0 16px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .wl-head-title { color: #fff; font-size: 17px; font-weight: 700; margin: 0; }
        .wl-close-btn {
          background: #fff;
          border: 1px solid #d0c4b0;
          cursor: pointer;
          color: #e53935;
          width: 36px;
          height: 36px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .wl-body { flex: 1; overflow-y: auto; padding: 20px; }
        .wl-empty { text-align: center; color: #777; margin-top: 40px; }

        .wl-item {
          display: flex;
          gap: 12px;
          padding-bottom: 15px;
          margin-bottom: 15px;
          border-bottom: 1px solid #eee;
          align-items: center;
        }
        .wl-item-img { width: 70px; height: 70px; object-fit: cover; border-radius: 4px; border: 1px solid #eee; }
        .wl-item-info { flex: 1; }
        .wl-item-name { font-size: 14px; font-weight: 600; margin-bottom: 4px; color: #333; }
        .wl-item-price { color: #AB9774; font-weight: 700; font-size: 14px; }

        .wl-actions { display: flex; gap: 8px; }
        .wl-btn-cart {
          background: #AB9774;
          color: #fff;
          border: none;
          padding: 6px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .wl-btn-remove {
          background: #f5f5f5;
          color: #e53935;
          border: none;
          padding: 6px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
      `}</style>

      <div className={`wl-overlay${isOpen ? " show" : ""}`} onClick={onClose} />
      
      <div className={`wl-panel${isOpen ? " open" : ""}`}>
        <div className="wl-head">
          <h5 className="wl-head-title">My Wishlist ({wishlist.length})</h5>
          <button className="wl-close-btn" onClick={onClose}><FaTimes size={13} /></button>
        </div>

        <div className="wl-body">
          {wishlist.length === 0 ? (
            <div className="wl-empty">Your wishlist is empty.</div>
          ) : (
            wishlist.map((item) => {
              const rawImg = item.product_image || item.image;
              const itemImg = rawImg
                ? (rawImg.startsWith('http') ? rawImg : `${IMG_BASE_URL}${rawImg}`)
                : "https://via.placeholder.com/80x80?text=No+Image";
              
              return (
                <div key={item.wishlistItemId || `${item.id || item._id}-${item.selectedVariantId || item.selectedVariant?.id || 'base'}`} className="wl-item">
                  <img src={itemImg} alt={item.product_name || item.name} className="wl-item-img" />
                  <div className="wl-item-info">
                    <p className="wl-item-name">{item.product_name || item.name}</p>
                    {Boolean(item.selectedVariantId || item.selectedVariant?.id) && (
                      <p className="wl-item-price" style={{ fontSize: '12px', color: '#666', fontWeight: 500 }}>
                        Variant: {item.selectedVariant?.variant_name || item.selectedVariantName || 'Selected Option'} {item.selectedVariant?.variant_value || item.selectedVariantValue ? `(${item.selectedVariant?.variant_value || item.selectedVariantValue})` : ''}
                      </p>
                    )}
                    <p className="wl-item-price">₹{Number((item.selectedVariant?.price ?? item.variant_price ?? item.selectedVariantPrice ?? item.sale_price ?? item.price) || 0).toLocaleString()}</p>
                    <div className="wl-actions">
                      <button className="wl-btn-cart" onClick={() => handleAddToCart(item)}>
                        <FaShoppingCart size={11} /> Add to Cart
                      </button>
                      <button className="wl-btn-remove" onClick={() => removeFromWishlist(item.wishlistItemId || `${item.id || item._id}-${item.selectedVariantId || item.selectedVariant?.id || 'base'}`)}>
                        <FaTrash size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default Wishlist;
