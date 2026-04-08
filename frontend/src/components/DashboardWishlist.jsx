import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaTrash, FaHeart } from 'react-icons/fa';

const IMG_BASE_URL = `${process.env.REACT_APP_API_URL}/uploads/products/`;

export default function DashboardWishlist() {
  const { wishlist, removeFromWishlist, addToCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product.wishlistItemId || `${product.id || product._id}-${product.selectedVariantId || product.selectedVariant?.id || 'base'}`);
  };

  return (
    <div className="dashboard_content">
      <style>{`
        .dashboard_content { background: #fff; border-radius: 14px; padding: 30px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.07); }
        .dashboard_title { font-size: 22px; font-weight: 600; color: #1a1a2e; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #f0f0f0; }
        .wl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 25px; }
        .wl-card { border: 1px solid #eee; border-radius: 12px; overflow: hidden; transition: all 0.3s ease; position: relative; background: #fff; display: flex; flex-direction: column; }
        .wl-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.08); border-color: #AB9774; }
        .wl-img-wrapper { width: 100%; height: 180px; overflow: hidden; background: #fbfbfb; position: relative; }
        .wl-img { width: 100%; height: 100%; object-fit: contain; padding: 15px; transition: transform 0.5s; }
        .wl-card:hover .wl-img { transform: scale(1.08); }
        .wl-info { padding: 15px; flex-grow: 1; display: flex; flex-direction: column; }
        .wl-name { font-size: 15px; font-weight: 600; color: #1a1a2e; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
        .wl-price-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 15px; }
        .wl-price { color: #AB9774; font-weight: 700; font-size: 17px; }
        .wl-btns { display: flex; gap: 8px; margin-top: auto; }
        .wl-add { flex: 1; background: #AB9774; color: #fff; border: none; padding: 10px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .wl-rem { background: #fdf2f2; color: #d32f2f; border: 1px solid #fee2e2; padding: 10px; border-radius: 8px; cursor: pointer; }
        .empty-state { text-align: center; padding: 60px 20px; color: #888; }
        .empty-icon { font-size: 60px; color: #f0f0f0; margin-bottom: 15px; }
      `}</style>

      <h3 className="dashboard_title">My Wishlist</h3>

      {wishlist.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><FaHeart /></div>
          <p>Your wishlist is currently empty.</p>
        </div>
      ) : (
        <div className="wl-grid">
          {wishlist.map((item) => {
            // Use 'image' (from backend hydration) or fallbacks
            const imgPath = item.product_image || item.image;
            const itemImg = imgPath ? `${IMG_BASE_URL}${imgPath}` : "https://via.placeholder.com/200x200?text=No+Image";
            const productSlug = item.slug || item.product_slug;

            return (
              <div key={item.wishlistItemId || `${item.id || item._id}-${item.selectedVariantId || item.selectedVariant?.id || 'base'}`} className="wl-card">
                <Link className="wl-img-wrapper" to={`/${productSlug}`}>
                  <img src={itemImg} alt={item.name} className="wl-img" />
                </Link>
                <div className="wl-info">
                  <Link className="wl-name" title={item.name} to={`/${productSlug}`}>
                    {item.name}
                  </Link>
                  {Boolean(item.selectedVariantId || item.selectedVariant?.id) && (
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                      Variant: {item.selectedVariant?.variant_name || item.selectedVariantName || 'Selected Option'} {item.selectedVariant?.variant_value || item.selectedVariantValue ? `(${item.selectedVariant?.variant_value || item.selectedVariantValue})` : ''}
                    </div>
                  )}
                  <div className="wl-price-row">
                    <span className="wl-price">₹{Number((item.selectedVariant?.price ?? item.variant_price ?? item.selectedVariantPrice ?? item.sale_price ?? item.price) || 0).toLocaleString()}</span>
                    {(!item.selectedVariantId && item.price > item.sale_price) && (
                      <span style={{ fontSize: '13px', textDecoration: 'line-through', color: '#888' }}>
                        ₹{item.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="wl-btns">
                    <button className="wl-add" onClick={() => handleAddToCart(item)}>
                      <FaShoppingCart size={14} /> Add to Cart
                    </button>
                    <button className="wl-rem" onClick={() => removeFromWishlist(item.wishlistItemId || `${item.id || item._id}-${item.selectedVariantId || item.selectedVariant?.id || 'base'}`)}>
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
