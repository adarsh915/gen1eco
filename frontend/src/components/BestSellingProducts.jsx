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

const toAmount = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const cleaned = String(value ?? "").replace(/[^0-9.]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseRangeFromString = (value) => {
  const source = String(value ?? "");
  const parts = source.match(/[0-9]+(?:\.[0-9]+)?/g);
  if (!parts || parts.length === 0) return { min: 0, max: 0 };
  const numbers = parts.map((part) => toAmount(part)).filter((num) => num > 0);
  if (numbers.length === 0) return { min: 0, max: 0 };
  return { min: Math.min(...numbers), max: Math.max(...numbers) };
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

  const productImg = product.image || "https://via.placeholder.com/260x300?text=No+Image";

  return (
    <div
      className={`fpc-card${hovered ? " fpc-card--hovered" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image area */}
      <div className="fpc-img-wrap">
        <img
          src={productImg}
          alt={product.name}
          className={`fpc-img${hovered ? " fpc-img--zoom" : ""}`}
        />

        {/* Badges */}
        <ul className="fpc-badges">
          {product.discount > 0 && <li className="fpc-badge">-{product.discount}%</li>}
          {product.inStock && <li className="fpc-badge">In Stock</li>}
        </ul>

        {/* Wishlist button */}
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

      {/* Text */}
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
            <FaStar key={i} size={14} color={i < product.rating ? "#f5a623" : "#ddd"} />
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

const BestSellingProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log("Fetching Best Selling products...");
      const response = await api.get("/users/best-selling");
      console.log("Best Selling Res:", response.data);
      if (response.data.success) {
        setProducts(response.data.products.map((p) => {
          const price = Number(p.price) || 0;
          const salePrice = Number(p.sale_price) || 0;
          const discountPerc = (price > 0 && salePrice > 0 && price > salePrice)
            ? Math.round(((price - salePrice) / price) * 100)
            : 0;
          const displayPrice = salePrice > 0 ? salePrice : price;
          const displayOldPrice = salePrice > 0 ? price : null;

          return {
            id: p.id,
            name: p.product_name || p.name || "Product",
            price: displayPrice,
            oldPrice: displayOldPrice,
            discount: discountPerc,
            gst_percent: Number(p.gst_percent) || 0,
            image: p.product_image ? `${IMG_BASE_URL}${p.product_image}` : "https://via.placeholder.com/260x300?text=No+Image",
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
        }));
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!loading && (!products || products.length === 0)) {
    console.log("No Best Selling products to show - hiding section");
    return null;
  }

  return (
    <>
      <style>{`
        .bs-section {
          padding: 40px 0;
          background: #fff;
          overflow: hidden;
        }

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
          text-decoration: none;
          box-sizing: border-box;
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
          height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
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

        .fpc-add-btn:hover:not(:disabled) { background: #2a2a2a; }
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

        /* ── RESPONSIVE ── */
        @media (max-width: 991px) {
          .fpc-img-wrap { height: 220px; }
          .fpc-name { font-size: 15px; }
          .fpc-price { font-size: 15px; }
        }
        @media (max-width: 767px) {
          .fpc-img-wrap { height: 180px; }
          .fpc-badge { font-size: 11px; padding: 4px 10px; }
          .fpc-icon-btn { width: 34px; height: 34px; }
        }
        @media (max-width: 480px) {
          .fpc-img-wrap { height: 160px; }
          .fpc-card { padding: 10px; }
        }

        .bs-container {
          width: 100%;
          max-width: 1415px;
          margin: 0 auto;
          padding: 0 20px;
          box-sizing: border-box;
        }

        .bs-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .bs-header-left h5 {
          font-size: 16px;
          font-weight: 700;
          color: #AB9774;
          margin-bottom: 8px;
          text-transform: capitalize;
        }

        .bs-header-left h3 {
          font-size: clamp(24px, 3vw, 36px);
          font-weight: 700;
          color: #222;
          margin: 0;
          line-height: 1.1;
        }

        .bs-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          width: 100%;
        }

        @media (max-width: 1100px) {
          .bs-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 768px) {
          .bs-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
          .bs-header-left h3 { font-size: 26px; }
        }

        @media (max-width: 480px) {
          .bs-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .bs-container { padding: 0 10px; }
          .bs-section { padding: 40px 0; }
          .fpc-card { padding: 8px; border-radius: 12px; }
          .fpc-img-wrap { height: 248px; }
          .fpc-info { padding: 10px 2px 4px; }
          .fpc-name { font-size: 13px; margin-bottom: 4px; }
          .fpc-price { font-size: 14px; margin-bottom: 6px; }
          .fpc-stars { gap: 2px; }
          .fpc-reviews { font-size: 11px; margin-left: 2px; }
        }
        @media (max-width: 360px) {
           .bs-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="bs-section">
        <div className="bs-container">
          <div className="bs-header">
            <div className="bs-header-left">
              <h3>Best Selling products</h3>
            </div>
            <Link to="/products" style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "15px", fontWeight: "500", color: "#1a1a1a", textDecoration: "none", paddingBottom: "2px", borderBottom: "1.5px solid #1a1a1a", transition: "color 0.2s, border-color 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.color = "#b5956a"; e.currentTarget.style.borderColor = "#b5956a"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "#1a1a1a"; e.currentTarget.style.borderColor = "#1a1a1a"; }}>
              View All
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 8 16 12 12 16" /><line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </Link>
          </div>

          <div className="bs-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default BestSellingProducts;
