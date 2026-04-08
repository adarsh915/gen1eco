import { useState, useEffect } from "react";
import HeroBanner from "./HeroBanner";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import RelatedProducts from "./RelatedProducts";

const IMG_BASE_URL = `${process.env.REACT_APP_API_URL}/uploads/products/`;
const GALLERY_BASE_URL = `${process.env.REACT_APP_API_URL}/uploads/products/gallery/`;

// Static data removed, fetching from API



function StarRating({ rating, max = 5 }) {
  return (
    <span>
      {Array.from({ length: max }, (_, i) => (
        <i
          key={i}
          className={`bi ${i < rating ? "bi-star-fill" : "bi-star"} text-warning`}
          style={{ fontSize: "0.9rem" }}
        />
      ))}
    </span>
  );
}

function stripHtml(input = "") {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function truncateWords(text = "", maxWords = 35) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return `${words.slice(0, maxWords).join(" ")}...`;
}

function ProductDescription({ fullDescription }) {

  const [activeTab, setActiveTab] = useState("description");

  return (
    <div className="desc-wrapper">
      <div className="container py-4 py-md-5">
        {activeTab === "description" && (
          <div className="row ">
            <div className="col-12 col-lg-10 col-xl-9">
              <h2 className="desc-title">Description</h2>
              <div className="product-desc-html" style={{ fontSize: "16px", fontWeight: 400, lineHeight: 1.6 }}>
                {fullDescription ? (
                  <div dangerouslySetInnerHTML={{ __html: fullDescription }} />
                ) : (
                  <p className="text-muted mb-0">No description available for this product.</p>
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === "reviews" && (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-chat-square-text" style={{ fontSize: "2.5rem", opacity: 0.3 }} />
            <p className="mt-3">No reviews yet. Be the first to review this product!</p>
          </div>
        )}
        {activeTab === "shipping" && (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-truck" style={{ fontSize: "2.5rem", opacity: 0.3 }} />
            <p className="mt-3">Ships worldwide. Estimated delivery: 5–7 business days.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [mainImage, setMainImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const resp = await api.get(`/users/products/slug/${slug}`);
      if (resp.data.success) {
        setProduct(resp.data.product);
        const vars = resp.data.product?.variants || [];
        setVariants(vars);
        if (vars.length === 1) {
          setSelectedVariant(vars[0]);
        }
        setCategories(resp.data.product?.categories || []);

        // Auto-select the first variant if available
        if (resp.data.product?.variants && resp.data.product.variants.length > 0) {
          setSelectedVariant(resp.data.product.variants[0]);
        }

        // Combine main image with gallery
        // Combine main image with gallery and video
        const media = [];
        if (resp.data.product.product_image) {
          media.push({ type: 'image', url: `${IMG_BASE_URL}${resp.data.product.product_image}` });
        }
        resp.data.product?.gallery?.forEach(g => {
          media.push({ type: 'image', url: `${GALLERY_BASE_URL}${g.image}` });
        });

        if (resp.data.product.video_url) {
          media.push({ type: 'video', url: `${IMG_BASE_URL}${resp.data.product.video_url}` });
        }

        setProduct(prev => ({ ...prev, allMedia: media }));
      }
    } catch (err) {
      console.error("Error fetching product:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;
  if (!product) return <div className="text-center py-5">Product not found.</div>;

  const currentVariant = selectedVariant || (variants.length === 1 ? variants[0] : null);
  const wishlisted = isWishlisted(product.id, currentVariant?.id || null);

  const gstPercent = Number(product.gst_percent) || 0;

  // Use variant price if selected, else use product price
  const rawPrice = selectedVariant ? Number(selectedVariant.price) : (Number(product.price) || 0);
  const rawSalePrice = selectedVariant ? 0 : (Number(product.sale_price) || 0); // Assuming variants don't have separate sale prices for now, or we treat variant price as the final price

  const displayPrice = rawSalePrice > 0 ? rawSalePrice : rawPrice;
  const displayOldPrice = rawSalePrice > 0 ? rawPrice : null;

  const stockCount = currentVariant ? currentVariant.stock : product.stock;

  const primaryCategory = categories.length > 0 ? categories[0] : null;
  const categoryLabel =
    primaryCategory?.category_name ||
    product.category_name ||
    "Products";
  const categoryPathSlug =
    primaryCategory?.category_slug ||
    product.category_slug ||
    "";
  const maxBreadLabelLength = 42;
  const productBreadLabel =
    (product.product_name || "Product Details").length > maxBreadLabelLength
      ? `${(product.product_name || "Product Details").slice(0, maxBreadLabelLength).trim()}...`
      : (product.product_name || "Product Details");

  const dec = () => setQuantity((q) => Math.max(1, q - 1));
  const inc = () => setQuantity((q) => q + 1);
  const shortDescription = stripHtml(product.short_description || "");

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />

      <style>{`
        :root {
          --accent: #7a6138;
          --accent-hover: #5e4a28;
          --badge-green: #1a9e4a;
          --card-bg: #f8f9fa;
          --shadow: 0 2px 16px rgba(0,0,0,0.08);
          --radius: 14px;
        }
        body { background: #fff;  }

        .gallery-main {
          background: #f4f4f4;
          border-radius: var(--radius);
          overflow: hidden;
          aspect-ratio: 1/1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .gallery-main img { width: 100%; height: 100%; object-fit: contain; transition: opacity 0.25s; }
        .thumb-btn {
          border: 2px solid transparent;
          border-radius: 10px;
          overflow: hidden;
          background: #f4f4f4;
          padding: 0;
          width: 72px; height: 72px;
          cursor: pointer;
          transition: border-color 0.2s;
          flex-shrink: 0;
        }
        .thumb-btn.active { border-color: var(--accent); }
        .thumb-btn img { width: 100%; height: 100%; object-fit: contain; }

        .badge-stock {
          background: #2196f3;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          padding: 3px 16px;
          height: 30px;
          border-radius: 50px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          
          white-space: nowrap;
        }
        .g1-badge.discount {
          background: #2196f3;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          padding: 3px 16px;
          height: 30px;
          border-radius: 50px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          
          white-space: nowrap;
          min-width: 50px;
        }
        .price-current { font-weight: 800; font-size: 24px; color: #111; }
        .price-old { font-weight: 500; font-size: 18px; color: #b0b0b0; }
        .tagline { font-weight: 400; font-size: 16px; color: #7d7b7b; }

        .qty-btn {
          width: 36px; height: 36px;
          border: 1px solid #ddd;
          background: #fff;
          border-radius: 8px;
          font-size: 1.1rem;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.15s;
        }
        .qty-btn:hover { background: #f0f0f0; }
        .qty-display {
          width: 44px; text-align: center;
          border: 1px solid #ddd; border-radius: 8px;
          font-weight: 600; font-size: 1rem; padding: 4px 0;
        }

        .btn-cart {
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 10px 28px;
          font-weight: 600;
          font-size: 0.95rem;
          display: flex; align-items: center; gap: 8px;
          transition: background 0.2s, transform 0.15s;
        }
        .btn-cart:hover { background: var(--accent-hover); transform: translateY(-1px); }
        .wishlist-btn {
          background: none; border: none; color: #888;
          font-size: 0.92rem; cursor: pointer;
          display: flex; align-items: center; gap: 6px;
          padding: 0; transition: color 0.2s;
        }
        .wishlist-btn.active { color: #e53935; }
        .wishlist-btn:hover { color: #e53935; }

        .info-card {
          background: var(--card-bg);
          border-radius: var(--radius);
          border: 1px solid #e9ecef;
          padding: 18px;
          box-shadow: var(--shadow);
        }
        .info-row { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; font-size: 0.88rem; }
        .info-icon { font-size: 0.8rem; color: #555; flex-shrink: 0; margin-top: 1px; }

        .seller-card {
          background: #edf5ff;
          border-radius: var(--radius);
          border: 1px solid #e9ecef;
          padding: 18px;
          box-shadow: var(--shadow);
        }
        .stat-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: var(--accent);
          flex-shrink: 0;
        }
        .btn-store {
          display: block; width: 100%;
          border: 2px solid #1a1a1a;
          background: transparent; color: #1a1a1a;
          border-radius: 10px; padding: 9px;
          font-weight: 700; font-size: 0.88rem;
          text-align: center; cursor: pointer;
          transition: background 0.2s, color 0.2s;
          text-decoration:none;
        }
        .btn-store:hover { background: #1a1a1a; color: #fff; }

        .section-divider { border-top: 1px solid #dee2e6; margin: 14px 0; }
        .section-label { font-size: 14px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px; }

        .desc-wrapper {  background: #fff; }
        .desc-title {
          font-size: clamp(1.4rem, 3vw, 2rem);
              font-size: 28px;
             font-weight: 600;
          color: #111;
          margin-bottom: 24px;
        }
        .desc-section-label {
          display: flex;
          align-items: center;
          gap: 8px;
             font-size: 16px;
    font-weight: 400;
          color: #7d7b7b;
          margin-bottom: 16px;
        }
        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 12px;
          transition: background 0.2s;
          margin-bottom: 4px;
        }
        .feature-item:hover { background: #f8f8f8; }
        .feature-dot {
          width: 3px; height: 3px;
          border-radius: 50%;
          background: var(--accent);
          flex-shrink: 0;
          margin-top: 12px;
        }
        .feature-text { font-size: 16px;
    font-weight: 400;
    color: #7d7b7b; line-height: 1.55; }
        .feature-text strong {font-size: 16px;
    font-weight: 400;
    color: #7d7b7b;}
        .usage-box {
          
          padding: 16px 20px;
             font-size: 16px;
    font-weight: 400;
    color: #7d7b7b;
          line-height: 1.65;
        }
        .ideal-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #e8f5ee;
          color: #1a6e36;
          border: 1px solid #b7e4c7;
          border-radius: 20px;
          padding: 5px 14px;
          font-size: 0.82rem;
          font-weight: 600;
          white-space: nowrap;
        }
        .ideal-pill i { font-size: 0.75rem; }
        .section-sep { border: none; border-top: 1px dashed #e0e0e0; margin: 28px 0; }

        .product-desc-html { text-align: justify; }
        .product-desc-html p { margin-bottom: 10px; text-align: justify; }
        .product-desc-html strong { font-weight: 600; color: #333; }
        .product-desc-html ul, .product-desc-html ol { padding-left: 20px; margin-bottom: 10px; }
        .product-desc-html li { margin-bottom: 4px; }
        .product-desc-html br { line-height: 1.2; }

        .pd-hero .dc-hero__breadcrumb {
          max-width: min(92vw, 980px);
          margin: 0 auto;
          padding: 0 14px;
          flex-wrap: wrap;
          row-gap: 4px;
        }
        .pd-hero .dc-hero__breadcrumb span {
          min-width: 0;
        }
        .pd-hero .dc-hero__breadcrumb a,
        .pd-hero .dc-hero__breadcrumb span {
          display: inline-block;
          max-width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          vertical-align: middle;
        }

        @media (max-width: 767px) {
          .gallery-flex { flex-direction: column-reverse !important; }
          .gallery-main { aspect-ratio: 4 / 5; }
          .thumb-col { flex-direction: row !important; width: 100% !important; height: auto !important; overflow-x: auto; padding-bottom: 4px; }
          .thumb-btn { width: 56px; height: 56px; }
          .desc-title { font-size: 22px !important; margin-bottom: 16px; }
          .badge-stock { height: 24px; font-size: 0.75rem; padding: 0 10px; }
          .price-current { font-size: 1.55rem; }
          .price-old { font-size: 1rem; }
          .qty-btn { width: 32px; height: 32px; }
          .btn-cart { padding: 8px 20px; font-size: 0.9rem; width: 100%; justify-content: center; }
          .wishlist-btn { width: 100%; justify-content: center; }
          .variant-btn { flex: 1 1 calc(50% - 8px); min-width: 0; }
          .pd-hero .dc-hero__breadcrumb {
            justify-content: center;
            font-size: 0.82rem;
            gap: 6px;
          }
          .pd-hero .dc-hero__breadcrumb-sep { font-size: 1rem; }
        }
        @media (max-width: 576px) {
          .feature-item { padding: 10px 12px; }
          .desc-title { font-size: 20px !important; }
          .gallery-main { aspect-ratio: 1 / 1; }
          .thumb-btn { width: 50px; height: 50px; }
          .btn-cart, .wishlist-btn { font-size: 0.85rem; }
          .variant-btn { padding: 6px 12px; font-size: 0.82rem; }
        }
        .variant-btn {
          border: 1px solid #ddd;
          background: #fff;
          border-radius: 8px;
          padding: 6px 16px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .variant-btn.active {
          border-color: var(--accent);
          background: var(--accent);
          color: #fff;
        }
        .variant-btn:hover:not(.active) {
          background: #f8f9fa;
          border-color: #bbb;
        }
      `}</style>

      {/* ── Hero Banner ── */}
      <div className="pd-hero">
        <HeroBanner
          title={productBreadLabel}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: categoryLabel, href: categoryPathSlug ? `/products/category/${categoryPathSlug}` : "/products" },
            { label: productBreadLabel },
          ]}
        />
      </div>

      {/* ── Product Detail Section ── */}
      <div className="container py-4 py-md-5">
        <div className="row g-4">

          {/* LEFT: Gallery */}
          <div className="col-12 col-md-5 col-lg-5">
            <div className="d-flex gap-3 gallery-flex" style={{ flexDirection: "row" }}>
              <div className="d-flex flex-column gap-2 thumb-col" style={{ width: 76 }}>
                {product.allMedia?.map((item, i) => (
                  <button
                    key={i}
                    className={`thumb-btn ${mainImage === i ? "active" : ""}`}
                    onClick={() => setMainImage(i)}
                    aria-label={`Media ${i + 1}`}
                    style={{ position: 'relative' }}
                  >
                    {item.type === 'video' ? (
                      <div className="thumb-video-placeholder d-flex align-items-center justify-content-center bg-dark" style={{ height: '100%', borderRadius: '8px' }}>
                        <i className="bi bi-play-circle-fill text-white fs-4"></i>
                      </div>
                    ) : (
                      <img src={item.url} alt={`Thumb ${i + 1}`} />
                    )}
                  </button>
                ))}
              </div>
              <div className="gallery-main flex-grow-1">
                {product.allMedia && product.allMedia[mainImage]?.type === 'video' ? (
                  <div className="ratio ratio-16x9 h-100">
                    <video
                      controls
                      autoPlay
                      muted
                      className="w-100 h-100"
                      style={{ borderRadius: '12px', background: '#000' }}
                    >
                      <source src={product.allMedia[mainImage].url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  <img src={product.allMedia ? product.allMedia[mainImage]?.url : ""} alt={product.product_name} />
                )}
              </div>
            </div>
          </div>

          {/* MIDDLE: Product Info */}
          <div className="col-12 col-md-7 col-lg-5">
            <p className="text-muted mb-1" style={{ fontSize: "16px", fontWeight: 400 }}>
              {categories.length > 0
                ? categories.map(c => c.category_name).join(", ")
                : (product.category_name || "General")}
            </p>
            <h1 className="mb-3" style={{ fontSize: "38px", fontWeight: 800, lineHeight: 1.2, color: "#222" }}>
              {product.product_name}
            </h1>
            <div className="d-flex align-items-center gap-3 mb-3">
              <span className="badge-stock">{stockCount > 0 ? "In Stock" : "Out of Stock"}</span>
              <div className="d-flex align-items-center gap-2">
                <StarRating rating={4} />
                <span className="text-muted" style={{ fontSize: "14px" }}>
                  (0 Reviews)
                </span>
              </div>
            </div>
            <div className="d-flex align-items-baseline gap-3 mb-1">
              <span className="price-current">₹{displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              {rawSalePrice > 0 && (
                <span className="price-old" style={{ textDecoration: "line-through" }}>
                  ₹{displayOldPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
            </div>
            {shortDescription && (
              <p className="tagline mb-2" style={{ textAlign: "justify" }}>
                {shortDescription}
              </p>
            )}

            {variants.length > 1 ? (
              <div className="mb-4">
                <div className="section-label">Available Options</div>
                <div className="d-flex flex-wrap gap-2">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      className={`variant-btn ${selectedVariant?.id === v.id ? "active" : ""}`}
                      onClick={() => setSelectedVariant(v)}
                    >
                      {v.variant_value || "Option"}
                    </button>
                  ))}
                </div>
              </div>
            ) : variants.length === 1 ? (
              <div className="mb-4">
                <div className="section-label">Available Option</div>
                <div className="d-inline-block px-3 py-2 bg-light rounded-3 fw-semibold text-accent border border-accent">
                  {variants[0].variant_value || "Option"}
                </div>
              </div>
            ) : null}

            <div className="d-flex align-items-center gap-3 flex-wrap mb-3">
              <div className="d-flex align-items-center gap-2">
                <button className="qty-btn" onClick={dec} aria-label="Decrease">−</button>
                <span className="qty-display">{quantity}</span>
                <button className="qty-btn" onClick={inc} aria-label="Increase">+</button>
              </div>
              <button
                className="btn-cart"
                onClick={() => addToCart({ ...product, selectedVariant }, quantity)}
                disabled={!selectedVariant || stockCount <= 0}
              >
                <i className="bi bi-cart3" />
                Add To Cart
              </button>
            </div>
            <button
              className={`wishlist-btn ${wishlisted ? "active" : ""}`}
              onClick={() => toggleWishlist({
                ...product,
                selectedVariant: currentVariant,
                selectedVariantId: currentVariant?.id || null,
              })}
            >
              <i className={`bi ${wishlisted ? "bi-heart-fill" : "bi-heart"}`} />
              {wishlisted ? "Saved to Wishlist" : "Add Wishlist"}
            </button>
            <div className="section-divider" />
            <div className="d-flex flex-column gap-1" style={{ fontSize: "0.88rem", color: "#555" }}>
              <span><strong style={{ color: "#333" }}>SKU:</strong> G1E-{product.id}</span>
              <span><strong style={{ color: "#333" }}>Category:</strong> {categories.length > 0
                ? categories.map(c => c.category_name).join(", ")
                : (product.category_name || "General")}</span>
            </div>
          </div>

          {/* RIGHT: Seller & Shipping */}
          <div className="col-12 col-md-12 col-lg-2" style={{ position: "sticky", top: "100px" }}>

            {/* Shipping Info Card */}
            <div className="info-card mb-3">
              <div className="section-label">Shipping</div>
              <div className="info-row">
                <i className="bi bi-globe2 info-icon" />
                <span style={{ fontSize: "13px" }}>Shipping Worldwide</span>
              </div>
              <div className="info-row">
                <i className="bi bi-patch-check info-icon" />
                <span style={{ fontSize: "13px" }}>Always Authentic</span>
              </div>
              <div className="info-row">
                <i className="bi bi-cash-coin info-icon" />
                <span style={{ fontSize: "13px" }}>Cash On Delivery Available</span>
              </div>
              <div className="section-divider" />
              <div className="section-label">Return &amp; Warranty</div>
              <div className="info-row">
                <i className="bi bi-arrow-counterclockwise info-icon" />
                <span style={{ fontSize: "13px" }}>14 Days Easy Return</span>
              </div>
              <div className="info-row">
                <i className="bi bi-shield-x info-icon" style={{ color: "#c0392b" }} />
                <span style={{ fontSize: "13px" }}>Warranty Not Available</span>
              </div>
            </div>

            {/* Seller Card */}
            <div className="seller-card">

              {/* Header: Sold by + Chat Now */}
              <div className="d-flex align-items-center justify-content-between mb-3">
                <p className="text-muted mb-0" style={{ fontSize: "0.78rem" }}>Sold by</p>
                <Link
                  to="/contact"
                  className="btn btn-sm d-flex align-items-center gap-1"
                  style={{ color: "#0a69d8", borderRadius: 8, fontWeight: 600, fontSize: "0.82rem", textDecoration: "none" }}
                >
                  <i className="bi bi-chat-dots-fill" /> Chat Now
                </Link>
              </div>

              {/* Seller Name */}
              <p className="fw-bold mb-0" style={{ fontSize: "1rem" }}>Zapier Gallery</p>

              <div className="section-divider" />

              {/* Stats */}
              <div className="d-flex flex-column gap-3 mb-3">
                <div className="d-flex align-items-center gap-2" style={{ fontSize: "14px", color: "#444" }}>
                  <div className="stat-dot" />
                  <span style={{ flex: 1 }}>Positive Seller Ratings</span>
                  <span className="fw-semibold" style={{ whiteSpace: "nowrap" }}>
                    4.5 (320)
                  </span>
                </div>
                <div className="d-flex align-items-center gap-2" style={{ fontSize: "14px", color: "#444" }}>
                  <div className="stat-dot" />
                  <span style={{ flex: 1 }}>Ship on Time</span>
                  <span className="fw-semibold">100%</span>
                </div>
                <div className="d-flex align-items-center gap-2" style={{ fontSize: "14px", color: "#444" }}>
                  <div className="stat-dot" />
                  <span style={{ flex: 1 }}>Chat Response Rate</span>
                  <span className="fw-semibold">90%</span>
                </div>
              </div>

              <div className="section-divider" />

              <Link to="/products" className="btn-store" style={{ display: 'block' }}>Go To Store</Link>

            </div>
            {/* END seller-card */}

          </div>
          {/* END RIGHT col */}

        </div>
        {/* END row */}
      </div>
      {/* END container */}

      {/* ── Description / Tabs Section ── */}
      <ProductDescription fullDescription={product.description} />

      {/* ── Related Products ── */}
      <RelatedProducts productId={product.id} />
    </>
  );
}