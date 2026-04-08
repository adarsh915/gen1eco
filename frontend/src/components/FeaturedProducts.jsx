import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaHeart,
  FaStar,
} from "react-icons/fa";
import { useCart } from "../context/CartContext";
import api from "../api/axios";
import CompactVariantSelector from "./CompactVariantSelector";

const IMG_BASE_URL = process.env.REACT_APP_API_URL;

const toAmount = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const cleaned = String(value ?? "").replace(/[^0-9.]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseRangeFromString = (value) => {
  const source = String(value ?? "");
  const parts = source.match(/[0-9]+(?:\.[0-9]+)?/g);
  if (!parts || parts.length === 0) {
    return { min: 0, max: 0 };
  }
  const numbers = parts.map((part) => toAmount(part)).filter((num) => num > 0);
  if (numbers.length === 0) {
    return { min: 0, max: 0 };
  }
  return {
    min: Math.min(...numbers),
    max: Math.max(...numbers),
  };
};

const extractVariants = (product) => {
  const rawVariants = product?.variants
    || product?.product_variants
    || product?.variant_options
    || product?.productVariants
    || product?.variations
    || product?.product_variation
    || [];
  const parsedVariants = typeof rawVariants === "string"
    ? (() => {
      try {
        const json = JSON.parse(rawVariants);
        return Array.isArray(json) ? json : [];
      } catch {
        return [];
      }
    })()
    : (Array.isArray(rawVariants) ? rawVariants : []);

  return parsedVariants.map((variant, index) => ({
    id: variant.id || variant.variant_id || variant.product_variant_id || variant.variantId || `${product?.id || product?._id || 'product'}-variant-${index}`,
    variant_name: variant.variant_name || variant.name || variant.option_name || variant.attribute_name || variant.type || "Variant",
    variant_value: variant.variant_value || variant.value || variant.option_value || variant.attribute_value || variant.option || variant.size || variant.color || "",
    price: toAmount(
      variant.price
      ?? variant.variant_price
      ?? variant.sale_price
      ?? variant.selling_price
      ?? variant.final_price
      ?? variant.amount
      ?? variant.mrp
      ?? variant.regular_price
    ),
    stock: variant.stock ?? variant.variant_stock,
  }));
};

const getFallbackVariant = (product) => {
  const variantId = product?.selectedVariantId
    || product?.selected_variant_id
    || product?.variant_id
    || product?.product_variant_id
    || product?.default_variant_id
    || null;
  const variantName = product?.selectedVariantName
    || product?.selected_variant_name
    || product?.variant_name
    || product?.option_name
    || product?.attribute_name
    || product?.type
    || "";
  const variantValue = product?.selectedVariantValue
    || product?.selected_variant_value
    || product?.variant_value
    || product?.option_value
    || product?.attribute_value
    || product?.option
    || product?.size
    || product?.color
    || "";
  const variantPrice = toAmount(
    product?.selectedVariantPrice
    ?? product?.selected_variant_price
    ?? product?.variant_price
    ?? product?.selling_price
    ?? product?.sale_price
  );

  const hasVariantSignal = Boolean(variantId || variantName || variantValue || variantPrice > 0);
  if (!hasVariantSignal) return null;

  return {
    id: variantId,
    variant_name: variantName || "Variant",
    variant_value: variantValue,
    price: variantPrice,
    stock: product?.variant_stock ?? product?.stock,
  };
};

/* ─── Single Product Card ─────────────────────────────────────────── */
const ProductCard = ({ product }) => {
  const [hovered, setHovered] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const { toggleWishlist, isWishlisted, addToCart } = useCart();

  const productLink = `/${product.slug || product.product_slug}`;
  const variants = extractVariants(product);
  const firstVariant = variants.length > 0 ? variants[0] : getFallbackVariant(product);
  const activeVariant = selectedVariant || firstVariant;
  const wishlisted = isWishlisted(product.id, activeVariant?.id || null);
  const variantPrices = variants
    .map((variant) => toAmount(variant.price))
    .filter((price) => price > 0);
  const hasVariantPriceRange = variantPrices.length > 0;
  const stringRange = parseRangeFromString(
    product.priceRange
    ?? product.price_range
    ?? product.variantPriceRange
    ?? product.variant_price_range
  );
  const minVariantPrice = hasVariantPriceRange
    ? Math.min(...variantPrices)
    : (toAmount(product.variantMinPrice) || stringRange.min);
  const maxVariantPrice = hasVariantPriceRange
    ? Math.max(...variantPrices)
    : (toAmount(product.variantMaxPrice) || stringRange.max);
  const hasRange = maxVariantPrice > 0;

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

  return (
    <div
      className={`fpc-card${hovered ? " fpc-card--hovered" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image area */}
      <div className="fpc-img-wrap">
        <img
          src={product.image}
          alt={product.name}
          className={`fpc-img${hovered ? " fpc-img--zoom" : ""}`}
          onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
        />

        {/* Badges */}
        <ul className="fpc-badges">
          {product.discount > 0 && <li className="fpc-badge">{`-${product.discount}%`}</li>}
          {product.inStock && <li className="fpc-badge">In Stock</li>}
        </ul>

        {/* Wishlist button */}
        <ul className={`fpc-icons${hovered ? " fpc-icons--show" : ""}`}>
          <li>
            <button
              className="fpc-icon-btn"
              style={wishlisted ? { background: "#e53935", color: "#fff" } : {}}
              onClick={(e) => {
                e.preventDefault();
                toggleWishlist({
                  ...product,
                  selectedVariant: activeVariant,
                  selectedVariantId: activeVariant?.id || null,
                  selectedVariantName: activeVariant?.variant_name || null,
                  selectedVariantValue: activeVariant?.variant_value || null,
                  selectedVariantPrice: activeVariant ? Number(activeVariant.price) || 0 : null,
                });
              }}
              title="Wishlist"
            >
              <FaHeart size={13} />
            </button>
          </li>
        </ul>
      </div>

      {/* Text area */}
      <div className="fpc-info">
        <Link className="fpc-name" to={productLink}>
          {product.name}
        </Link>
        <p className="fpc-price">
          {hasRange ? (
            maxVariantPrice > minVariantPrice
              ? `₹${minVariantPrice.toFixed(2)} - ₹${maxVariantPrice.toFixed(2)}`
              : `₹${minVariantPrice.toFixed(2)}`
          ) : (
            <>
              ₹{product.price.toFixed(2)}&nbsp;&nbsp;
              {product.oldPrice && <del>₹{product.oldPrice.toFixed(2)}</del>}
            </>
          )}
        </p>
        <div className="fpc-stars">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} size={16} color={i < (product.rating || 5) ? "#5e6266" : "#ddd"} />
          ))}
          <span className="fpc-reviews">({product.reviews || 0} Reviews)</span>
        </div>
        <CompactVariantSelector
          variants={variants}
          selectedVariantId={activeVariant?.id || null}
          onSelectVariant={setSelectedVariant}
        />
        <div className="fpc-actions">
          <button
            type="button"
            className="fpc-add-btn"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Section ────────────────────────────────────────────────── */

const FeaturedProducts = () => {
  const [banner, setBanner] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch featured products from backend
  useEffect(() => {
    api.get('/users/featured')
      .then(res => {
        if (res.data.success && res.data.products.length > 0) {
          const mapped = res.data.products.map(p => {
            const price = Number(p.price) || 0;
            const salePrice = Number(p.sale_price) || 0;
            const discountPerc = (price > 0 && salePrice > 0 && price > salePrice)
              ? Math.round(((price - salePrice) / price) * 100)
              : 0;

            const gstPercent = Number(p.gst_percent) || 0;
            const displayPrice = salePrice > 0 ? salePrice : price;
            const displayOldPrice = salePrice > 0 ? price : null;

            return {
              id: p.id,
              name: p.product_name || p.name || 'Product',
              price: displayPrice,
              oldPrice: displayOldPrice,
              discount: discountPerc,
              gst_percent: gstPercent,
              image: p.product_image
                ? `${IMG_BASE_URL}/uploads/products/${p.product_image}`
                : '/images/placeholder.jpg',
              rating: p.rating || 5,
              reviews: p.reviews || 0,
              inStock: Number(p.stock) > 0 || Number(p.status) === 1,
              slug: p.product_slug || p.slug,
              variants: extractVariants(p),
              selectedVariantId: p.selected_variant_id ?? p.variant_id ?? p.product_variant_id ?? p.default_variant_id ?? null,
              selectedVariantName: p.selected_variant_name ?? p.variant_name ?? p.option_name ?? p.attribute_name ?? p.type ?? null,
              selectedVariantValue: p.selected_variant_value ?? p.variant_value ?? p.option_value ?? p.attribute_value ?? p.option ?? p.size ?? p.color ?? null,
              selectedVariantPrice: toAmount(p.selected_variant_price ?? p.variant_price ?? p.selling_price),
              variant_id: p.variant_id ?? p.product_variant_id ?? p.default_variant_id ?? null,
              variant_name: p.variant_name ?? p.option_name ?? p.attribute_name ?? p.type ?? null,
              variant_value: p.variant_value ?? p.option_value ?? p.attribute_value ?? p.option ?? p.size ?? p.color ?? null,
              variant_price: toAmount(p.variant_price ?? p.selling_price),
              variantMinPrice: toAmount(p.min_variant_price ?? p.variant_min_price ?? p.min_price),
              variantMaxPrice: toAmount(p.max_variant_price ?? p.variant_max_price ?? p.max_price),
              variantPriceRange: p.price_range ?? p.variant_price_range ?? p.priceRange,
            };
          });
          setProducts(mapped);
        } else if (res.data.success) {
          setProducts([]);
        }
      })
      .catch(err => console.error('❌ Featured Products fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  // ✅ Fetch banner
  useEffect(() => {
    api.get('/single-banner/api')
      .then(res => {
        if (res.data.success) setBanner(res.data.data);
      })
      .catch(err => console.error('❌ Banner Error:', err.message));
  }, []);

  return (
    <section className="fp-section">
      <style>{`
        /* ── Wrapper ── */
        .fp-section {
          padding: 60px 0;
          background: #fff;
          font-family: inherit;
        }
        .fp-container {
          width: 100%;
          max-width: 1415px;
          margin: 0 auto;
          padding: 0 20px;
          box-sizing: border-box;
        }

        /* ── Header ── */
        .fp-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .fp-header-left h5 {
          font-size: 16px;
          font-weight: 700;
          color: #AB9774;
          margin-bottom: 8px;
          text-transform: capitalize;
        }

        .fp-header-left h3 {
          font-size: clamp(24px, 3vw, 36px);
          font-weight: 700;
          color: #222;
          margin: 0;
          line-height: 1.1;
        }

        /* ── Row ── */
        .fp-row {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
          align-items: stretch;
        }

        /* ════════════════════════════════
           LEFT BANNER  (col = ~33%)
        ════════════════════════════════ */
        .fp-banner-col {
          flex: 0 0 calc(33.333% - 16px);
          max-width: calc(33.333% - 16px);
          display: flex;
        }

        .fp-banner {
          position: relative;
          overflow: hidden;
          border-radius: 12px;
          width: 100%;
          min-height: 520px;
          background: #000;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 40px 30px;
          box-sizing: border-box;
        }
        .fp-banner-img {
          position: absolute;
          top: 0; left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover; 
          object-position: center;
          z-index: 0;
          opacity: 0.9;
        }
        .fp-banner-content {
          position: relative;
          z-index: 2;
        }
        .fp-banner-content h6 {
          font-size: 14px;
          font-weight: 400;
          color: rgba(255,255,255,0.8);
          margin: 0 0 8px;
        }
        .fp-banner-content h2 {
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 24px;
          letter-spacing: 0.5px;
        }
        .fp-banner-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 12px 28px;
          background: #b19361;
          color: #fff;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.3s;
        }
        .fp-banner-btn:hover {
          background: #8b7355;
          color: #fff;
        }

        /* ════════════════════════════════
           RIGHT GRID (col = ~67%)
        ════════════════════════════════ */
        .fp-grid-col {
          flex: 0 0 calc(66.666% - 8px);
          max-width: calc(66.666% - 8px);
        }

        .fp-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          height: 100%;
        }

        /* ════════════════════════════════
           PRODUCT CARD (Standard fpc-card styles)
        ════════════════════════════════ */
        .fpc-card {
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 16px;
          padding: 14px;
          cursor: pointer;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          height: 100%;
          width: 100%;
          min-width: 0;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          text-decoration: none;
        }
        .fpc-card--hovered {
          border-color: transparent;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }

        /* Image area */
        .fpc-img-wrap {
          background: #f5f6f8;
          position: relative;
          overflow: hidden;
          height: 240px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          margin-bottom: 0px;
        }
        .fpc-img {
          max-height: 270px;
          max-width: 100%;
          object-fit: contain;
          transition: transform 0.4s ease;
          mix-blend-mode: multiply;
        }
        .fpc-img--zoom { transform: scale(1.07); }

        /* Badges */
        .fpc-badges {
          position: absolute;
          top: 14px; left: 14px;
          list-style: none;
          padding: 0; margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
          z-index: 3;
        }
        .fpc-badge {
          background: #116deb;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          padding: 5px 14px;
          border-radius: 20px;
          white-space: nowrap;
        }

        /* Hover icon buttons */
        .fpc-icons {
          position: absolute;
          top: 14px;
          right: 14px;
          list-style: none;
          padding: 0; margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
          opacity: 1;
          transition: opacity 0.3s ease, top 0.3s ease;
          z-index: 4;
        }

        .fpc-actions {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .fpc-variant-select {
          width: 100%;
          border: 1px solid #d0d7de;
          border-radius: 8px;
          padding: 8px 10px;
          font-size: 13px;
          background: #fff;
          color: #222;
        }

        .fpc-add-btn {
          width: 100%;
          border: none;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 14px;
          font-weight: 700;
          background: #111;
          color: #fff;
          transition: background 0.2s ease, opacity 0.2s ease;
        }

        .fpc-add-btn:hover:not(:disabled) {
          background: #2a2a2a;
        }

        .fpc-add-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .fpc-icon-btn {
          width: 38px; height: 38px;
          border-radius: 50%;
          border: none;
          background: #fff;
          color: #333;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 12px rgba(0,0,0,0.13);
          transition: background 0.2s, color 0.2s;
        }
        .fpc-icon-btn:hover { background: #111; color: #fff; }

        /* Text area */
        .fpc-info {
          padding: 16px 4px 6px;
          flex: 1;
          display: flex;
          flex-direction: column;
          text-align: left;
        }
        .fpc-name {
          display: block;
          font-size: 17px;
          font-weight: 700;
          color: #2b3035;
          text-decoration: none;
          margin-bottom: 8px;
          transition: color 0.2s;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .fpc-name:hover { color: #AB9774; }

        .fpc-price {
          font-size: 16px;
          font-weight: 600;
          color: #0d2c17;
          margin: 0 0 10px;
        }
        .fpc-price del {
          font-size: 14px;
          font-weight: 400;
          color: #8c8c8c;
          margin-left: 6px;
        }

        .fpc-stars {
          display: flex;
          align-items: center;
          gap: 3px;
        }
        .fpc-reviews {
          font-size: 13px;
          color: #777;
          margin-left: 6px;
        }

        /* ── Skeleton ── */
        .fp-loading {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          height: 100%;
        }
        .fp-skeleton-card {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 12px;
          height: 100%;
          min-height: 400px;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 991px) {
          .fp-banner-col,
          .fp-grid-col {
            flex: 0 0 100%;
            max-width: 100%;
          }
          .fp-banner-col { margin-bottom: 0px; }
          .fp-banner { min-height: 400px; }
        }
        @media (max-width: 768px) {
          .fp-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .fp-loading { grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .fp-card-img-wrap { height: 200px; }
        }
        @media (max-width: 480px) {
          .fp-grid { grid-template-columns: 1fr; gap: 16px; }
          .fp-loading { grid-template-columns: 1fr; gap: 16px; }
          .fpc-img-wrap { height: 248px; }
        }
      `}</style>

      <div className="fp-container">
        {/* Same header structure as Best Selling */}
        <div className="fp-header">
          <div className="fp-header-left">
            <h3>Featured Products</h3>
          </div>
          <Link to="/products" style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "15px", fontWeight: "500", color: "#1a1a1a", textDecoration: "none", paddingBottom: "2px", borderBottom: "1.5px solid #1a1a1a", transition: "color 0.2s, border-color 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.color = "#b5956a"; e.currentTarget.style.borderColor = "#b5956a"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "#1a1a1a"; e.currentTarget.style.borderColor = "#1a1a1a"; }}>
            View All
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 8 16 12 12 16" /><line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </Link>
        </div>

        <div className="fp-row">
          {/* ── LEFT BANNER ── */}
          <div className="fp-banner-col">
            <div className="fp-banner">
              <img
                className="fp-banner-img"
                src={
                  banner?.image
                    ? `${IMG_BASE_URL}/uploads/banner/${banner.image}`
                    : '../images/banner_GEN-1.jpg'
                }
                alt={banner?.title_big || 'Banner'}
                onError={(e) => { e.target.src = '../images/banner_GEN-1.jpg'; }}
              />
              <div className="fp-banner-content">
                <h6>{banner?.title_small || 'Cleaning Items'}</h6>
                <h2>{banner?.title_big || 'Gen-1 Eco'}</h2>
                <a className="fp-banner-btn" href={banner?.link || '#'}>
                  {banner?.button_text || 'Shop Now'} &nbsp;↗
                </a>
              </div>
            </div>
          </div>

          {/* ── RIGHT GRID ── */}
          <div className="fp-grid-col">
            {loading ? (
              <div className="fp-loading">
                {[1, 2, 3, 4].map(i => <div key={i} className="fp-skeleton-card" />)}
              </div>
            ) : (
              <div className="fp-grid">
                {products.map((product, i) => (
                  <ProductCard product={product} key={`${product.id}-${i}`} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;