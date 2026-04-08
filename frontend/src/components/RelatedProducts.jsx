import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaHeart,
  FaStar,
} from "react-icons/fa";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import CompactVariantSelector from "./CompactVariantSelector";

const IMG_BASE_URL = `${process.env.REACT_APP_API_URL}/uploads/products/`;

/* ─── Single Product Card (Consistency) ───────────────────────────── */
const ProductCard = ({ product }) => {
  const [hovered, setHovered] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const { toggleWishlist, isWishlisted, addToCart } = useCart();
  const productLink = `/${product.product_slug || product.slug}`;
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const firstVariant = variants.length > 0 ? variants[0] : null;
  const activeVariant = selectedVariant || firstVariant;
  const wishlisted = isWishlisted(product.id, activeVariant?.id || null);
  const variantPrices = variants
    .map((variant) => Number(variant.price) || 0)
    .filter((price) => price > 0);
  const hasVariantPriceRange = variantPrices.length > 0;
  const minVariantPrice = hasVariantPriceRange ? Math.min(...variantPrices) : 0;
  const maxVariantPrice = hasVariantPriceRange ? Math.max(...variantPrices) : 0;

  useEffect(() => {
    setSelectedVariant(firstVariant || null);
  }, [product.id, firstVariant?.id]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      ...product,
      selectedVariant: activeVariant,
      selectedVariantId: activeVariant?.id || null,
      selectedVariantName: activeVariant?.variant_name || null,
      selectedVariantValue: activeVariant?.variant_value || null,
      selectedVariantPrice: activeVariant ? Number(activeVariant.price) || 0 : null,
    }, 1);
  };

  const productImg = product.product_image
    ? `${IMG_BASE_URL}${product.product_image}`
    : "https://via.placeholder.com/260x300?text=No+Image";

  const rawPrice = Number(product.price) || 0;
  const rawSalePrice = Number(product.sale_price) || 0;

  const displayPrice = rawSalePrice > 0 ? rawSalePrice : rawPrice;
  const displayOldPrice = rawSalePrice > 0 ? rawPrice : null;

  const discountPerc = rawSalePrice > 0
    ? Math.round(((rawPrice - rawSalePrice) / rawPrice) * 100)
    : 0;

  return (
    <div
      className={`fpc-card${hovered ? " fpc-card--hovered" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="fpc-img-wrap">
        <img
          src={productImg}
          alt={product.product_name || product.name}
          className={`fpc-img${hovered ? " fpc-img--zoom" : ""}`}
        />
        <ul className="fpc-badges">
          {discountPerc > 0 && <li className="fpc-badge">-{discountPerc}%</li>}
          {(product.stock > 0) && <li className="fpc-badge">In Stock</li>}
        </ul>
        <ul className={`fpc-icons${hovered ? " fpc-icons--show" : ""}`}>
          <li>
            <button
              className="fpc-icon-btn"
              style={wishlisted ? { background: "#e53935", color: "#fff" } : {}}
              onClick={() => toggleWishlist({
                ...product,
                selectedVariant: activeVariant,
                selectedVariantId: activeVariant?.id || null,
                selectedVariantName: activeVariant?.variant_name || null,
                selectedVariantValue: activeVariant?.variant_value || null,
                selectedVariantPrice: activeVariant ? Number(activeVariant.price) || 0 : null,
              })}
              title="Wishlist"
            >
              <FaHeart size={13} />
            </button>
          </li>
        </ul>
      </div>

      <div className="fpc-info">
        <Link className="fpc-name" to={productLink}>
          {product.product_name || product.name}
        </Link>
        <p className="fpc-price">
          {hasVariantPriceRange ? (
            maxVariantPrice > minVariantPrice
              ? `₹${minVariantPrice.toFixed(2)} - ₹${maxVariantPrice.toFixed(2)}`
              : `₹${minVariantPrice.toFixed(2)}`
          ) : (
            <>
              ₹{displayPrice.toFixed(2)}&nbsp;&nbsp;
              {displayOldPrice && <del>₹{displayOldPrice.toFixed(2)}</del>}
            </>
          )}
        </p>
        <div className="fpc-stars">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} size={14} color={i < (product.rating || 5) ? "#f5a623" : "#ddd"} />
          ))}
          <span className="fpc-reviews">({product.reviews || 0} Reviews)</span>
        </div>
        <CompactVariantSelector
          variants={variants}
          selectedVariantId={activeVariant?.id || null}
          onSelectVariant={setSelectedVariant}
        />
        <div className="fpc-actions">
          <button type="button" className="fpc-add-btn" onClick={handleAddToCart}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

const RelatedProducts = ({ productId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      fetchRelatedProducts();
    }
  }, [productId]);

  const fetchRelatedProducts = async () => {
    try {
      const response = await api.get(`/users/products/related/${productId}`);
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (err) {
      console.error("Failed to fetch related products:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!loading && products.length === 0) return null;

  return (
    <section className="rp-section">
      <div className="rp-container">
        <div className="rp-header">
          <h3 className="rp-title">Related Products</h3>
        </div>
        <div className="rp-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      <style>{`
        .rp-section {
          padding: 60px 0;
          background: #fff;
          border-top: 1px solid #eee;
        }
        .rp-container {
          max-width: 1415px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .rp-header {
          margin-bottom: 30px;
          text-align: left;
        }
        .rp-title {
          font-size: 28px;
          font-weight: 700;
          color: #222;
        }
        .rp-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .fpc-card {
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 16px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          transition: box-shadow 0.3s;
          text-decoration: none;
        }
        .fpc-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
        .fpc-img-wrap {
          background: #f5f6f8;
          height: 240px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          position: relative;
          overflow: hidden;
        }
        .fpc-img { max-height: 100%; max-width: 100%; object-fit: contain; mix-blend-mode: multiply; }
        .fpc-badges { position: absolute; top: 10px; left: 10px; list-style: none; padding: 0; display: flex; flex-direction: column; gap: 5px; }
        .fpc-badge { background: #116deb; color: #fff; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
        .fpc-icons { position: absolute; top: 10px; right: 10px; list-style: none; padding: 0; opacity: 1; transition: opacity 0.3s; }
        .fpc-icon-btn { width: 34px; height: 34px; border-radius: 50%; border: none; background: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 5px; cursor: pointer; }
        .fpc-info { padding-top: 15px; }
        .fpc-name { font-size: 16px; font-weight: 700; color: #333; text-decoration: none; display: block; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .fpc-price { font-size: 15px; font-weight: 700; color: #111; margin: 0; }
        .fpc-stars { display: flex; align-items: center; gap: 4px; margin-top: 5px; }
        .fpc-reviews { font-size: 12px; color: #777; margin-left: 5px; }
        .fpc-actions { margin-top: 10px; }
        .fpc-add-btn { width: 100%; border: none; border-radius: 8px; padding: 10px 12px; font-size: 14px; font-weight: 700; background: #111; color: #fff; transition: background 0.2s; }
        .fpc-add-btn:hover { background: #2a2a2a; }

        @media (max-width: 991px) {
          .rp-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
          .rp-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .rp-grid { grid-template-columns: 1fr; }
          .fpc-img-wrap { height: 248px; }
        }
      `}</style>
    </section>
  );
};

export default RelatedProducts;
