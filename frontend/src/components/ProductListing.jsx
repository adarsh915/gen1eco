import { useState, useEffect } from "react";
import HeroBanner from "./HeroBanner";
import { Link, useParams, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { FaHeart, FaStar, FaSearch, FaTimes } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import CompactVariantSelector from "./CompactVariantSelector";
import {
  applyAllFilters,
  getAllVariantOptions,
  getDynamicMaxPrice,
  getDisplayPrice,
  getDiscountPercent,
  getActiveFilters,
  sortProducts,
  normalize,
} from "../utils/productFilters";

const ProductCard = ({ product }) => {
  const [hovered, setHovered] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const { toggleWishlist, isWishlisted, addToCart } = useCart();

  const productLink = `/${product.product_slug || product.slug || product.product_name}`;
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
    addToCart(
      {
        ...product,
        selectedVariant: activeVariant,
        selectedVariantId: activeVariant?.id || null,
        selectedVariantName: activeVariant?.variant_name || null,
        selectedVariantValue: activeVariant?.variant_value || null,
        selectedVariantPrice: activeVariant ? Number(activeVariant.price) || 0 : null,
      },
      1
    );
  };

  const productImg = product.product_image
    ? `${process.env.REACT_APP_API_URL}/uploads/products/${product.product_image}`
    : "https://via.placeholder.com/260x300?text=No+Image";

  const discountPerc = getDiscountPercent(product);

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
          alt={product.product_name}
          className={`fpc-img${hovered ? " fpc-img--zoom" : ""}`}
        />

        {/* Badges */}
        <ul className="fpc-badges">
          {discountPerc > 0 && <li className="fpc-badge">-{discountPerc}%</li>}
          {product.stock > 0 && <li className="fpc-badge">In Stock</li>}
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
          {product.product_name}
        </Link>
        <p className="fpc-price">
          {hasVariantPriceRange ? (
            maxVariantPrice > minVariantPrice
              ? `₹${minVariantPrice.toFixed(2)} - ₹${maxVariantPrice.toFixed(2)}`
              : `₹${minVariantPrice.toFixed(2)}`
          ) : (
            <>
              ₹{Number(product.sale_price || product.price || 0).toFixed(2)}&nbsp;&nbsp;
              {Number(product.sale_price || 0) > 0 && (
                <del>₹{Number(product.price || 0).toFixed(2)}</del>
              )}
            </>
          )}
        </p>
        <div className="fpc-stars">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              size={16}
              color={i < (product.rating || 5) ? "#5e6266" : "#ddd"}
            />
          ))}
          <span className="fpc-reviews">({product.reviews || 0})</span>
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

const ProductListing = () => {
  const { categorySlug: paramCat, subCategorySlug: paramSub } = useParams();
  const [searchParams] = useSearchParams();

  const categorySlug = paramCat || searchParams.get("category");
  const subCategorySlug = paramSub || searchParams.get("subcategory");
  const subSubCategorySlug = searchParams.get("subsubcategory");

  // State
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [minPrice, setMinPrice] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [loading, setLoading] = useState(true);

  // Fetch products
  useEffect(() => {
    setLoading(true);
    api
      .get("/users/products")
      .then((res) => {
        if (res.data.success) {
          setProducts(res.data.products);
        }
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Get variant options from all products
  const allVariantOptions = getAllVariantOptions(products);

  // Apply all filters
  const filteredProducts = applyAllFilters(products, {
    categorySlug,
    subCategorySlug,
    subSubCategorySlug,
    searchTerm: search,
    minPrice,
    maxPrice,
    inStockOnly,
    selectedVariants,
  });

  // Get dynamic max price from category products (before other filters)
  const categoryProducts = applyAllFilters(products, {
    categorySlug,
    subCategorySlug,
    subSubCategorySlug,
  });
  const dynamicMax =
    categoryProducts.length > 0 ? getDynamicMaxPrice(categoryProducts) : 100000;

  // Sort products
  const sortedProducts = sortProducts(filteredProducts, sortBy);

  // Get active filters for display
  const activeFilters = getActiveFilters({
    categorySlug,
    subCategorySlug,
    subSubCategorySlug,
    searchTerm: search,
    maxPrice,
    inStockOnly,
    selectedVariants,
  });

  // Reset price when category changes
  useEffect(() => {
    if (categoryProducts.length > 0) {
      setMaxPrice(dynamicMax);
      setSelectedVariants([]);
    }
  }, [categorySlug, subCategorySlug, subSubCategorySlug, dynamicMax]);

  const handleVariantToggle = (val) => {
    setSelectedVariants((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const clearSearch = () => setSearch("");
  const clearFilters = () => {
    setSearch("");
    setMaxPrice(dynamicMax);
    setMinPrice(0);
    setInStockOnly(false);
    setSelectedVariants([]);
    setSortBy("default");
  };

  const pageTitle = subSubCategorySlug
    ? subSubCategorySlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : subCategorySlug
      ? subCategorySlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : categorySlug
        ? categorySlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        : "All Products";

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* Root */
        .plc-root { background: #fff; min-height: 100vh; padding: 40px 20px 48px; }

        /* Layout */
        .plc-layout { display: flex; gap: 28px; max-width: 1240px; margin: 0 auto; align-items: flex-start; }
        .plc-sidebar { width: 280px; min-width: 260px; flex-shrink: 0; position: sticky; top: 20px; background: #fff; padding-right: 15px; }
        .plc-sidebar__section { margin-bottom: 30px; padding: 5px 0; }
        .plc-sidebar__heading { font-size: 1.15rem; font-weight: 700; color: #1e2837; margin-bottom: 18px; text-transform: uppercase; letter-spacing: 0.5px; }

        /* Search Input */
        .plc-search-wrap { position: relative; width: 100%; }
        .plc-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9ca3af; pointer-events: none; }
        .plc-search {
          width: 100%; padding: 12px 14px 12px 42px; border: 1.5px solid #e5e7eb; border-radius: 12px;
          font-size: 0.95rem; color: #374151; background: #fdfdfd; outline: none; transition: all 0.3s ease;
        }
        .plc-search:focus { border-color: #ab9774; background: #fff; box-shadow: 0 4px 12px rgba(171, 151, 116, 0.1); }
        .plc-search::placeholder { color: #9ca3af; }

        .plc-divider { border: none; border-top: 1.5px solid #f3f4f6; margin: 0 0 25px; }

        /* Range Slider */
        .plc-range-wrap { padding: 10px 0; }
        .plc-range-header { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 0.85rem; color: #6b7280; font-weight: 500; }
        .plc-range {
          -webkit-appearance: none; width: 100%; height: 6px; border-radius: 10px; background: #e5e7eb;
          outline: none; cursor: pointer; background-image: linear-gradient(#ab9774, #ab9774); background-size: var(--val, 100%) 100%; background-repeat: no-repeat;
        }
        .plc-range::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #fff; border: 2px solid #ab9774; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform .2s; cursor: grab; }
        .plc-range::-webkit-slider-thumb:active { cursor: grabbing; transform: scale(1.15); }
        .plc-range-value-display { display: block; margin-top: 15px; font-size: 1.1rem; color: #ab9774; font-weight: 700; background: rgba(171, 151, 116, 0.08); padding: 8px 12px; border-radius: 8px; text-align: center; }

        /* Checkboxes */
        .plc-checkbox-label { display: flex; align-items: center; gap: 12px; cursor: pointer; font-size: 0.95rem; color: #4b5563; padding: 6px 0; transition: color 0.2s; }
        .plc-checkbox-label:hover { color: #111827; }
        .plc-checkbox-label:hover .plc-custom-check { border-color: #ab9774; }
        .plc-checkbox { display: none; }
        .plc-custom-check { width: 20px; height: 20px; border: 2px solid #d1d5db; border-radius: 6px; transition: all 0.2s; background: #fff; }
        .plc-checkbox:checked + .plc-custom-check { background: #ab9774; border-color: #ab9774; }
        .plc-custom-check::after { content: ""; position: absolute; width: 5px; height: 10px; border: solid white; border-width: 0 2px 2px 0; top: 2px; left: 6px; transform: rotate(45deg) scale(0); transition: transform 0.2s; }
        .plc-checkbox:checked + .plc-custom-check::after { transform: rotate(45deg) scale(1); }

        /* Main */
        .plc-main { flex: 1; min-width: 0; }

        /* Results Bar */
        .plc-results-bar {
          display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding: 16px; background: #f9fafb; border-radius: 12px; flex-wrap: wrap; gap: 12px;
        }
        .plc-results-count { font-size: 0.95rem; color: #6b7280; font-weight: 500; }
        .plc-sort-select { padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; color: #374151; cursor: pointer; font-size: 0.9rem; }

        /* Active Filters */
        .plc-active-filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
        .plc-filter-chip {
          display: flex; align-items: center; gap: 6px; background: #f3f4f6; color: #374151; padding: 6px 12px; border-radius: 20px; font-size: 0.9rem;
        }
        .plc-filter-chip button { background: none; border: none; cursor: pointer; color: #6b7280; padding: 0; display: flex; align-items: center; }
        .plc-filter-chip button:hover { color: #374151; }

        /* Grid */
        .plc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; width: 100%; }
        .plc-empty { grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #9ca3af; font-size: 0.95rem; }

        /* Product Card */
        .fpc-card {
          background: #fff; border: 1px solid #e0e0e0; border-radius: 16px; padding: 14px; cursor: pointer;
          transition: border-color 0.3s ease, box-shadow 0.3s ease; height: 100%; width: 100%; display: flex; flex-direction: column;
          min-width: 0;
        }
        .fpc-card--hovered { border-color: transparent; box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
        .fpc-img-wrap { background: #f5f6f8; position: relative; overflow: hidden; height: 240px; display: flex; align-items: center; justify-content: center; border-radius: 12px; }
        .fpc-img { max-height: 270px; max-width: 100%; object-fit: contain; transition: transform 0.4s ease; }
        .fpc-img--zoom { transform: scale(1.07); }
        .fpc-badges { position: absolute; top: 12px; left: -15px; list-style: none; display: flex; flex-direction: column; gap: 6px; z-index: 3; }
        .fpc-badge { background: #116deb; color: #fff; font-size: 13px; font-weight: 700; padding: 5px 14px; border-radius: 20px; white-space: nowrap; }
        .fpc-icons {
          position: absolute; top: 14px; right: 14px; list-style: none; display: flex; flex-direction: column; gap: 6px; opacity: 1;
          transition: opacity 0.3s ease; z-index: 4;
        }
        .fpc-icon-btn { width: 38px; height: 38px; border-radius: 50%; border: none; background: #fff; color: #333; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 12px rgba(0,0,0,0.13); transition: background 0.2s; }
        .fpc-icon-btn:hover { background: #111; color: #fff; }
        .fpc-info { padding: 16px 4px 6px; flex: 1; }
        .fpc-name { display: block; font-size: 17px; font-weight: 700; color: #2b3035; text-decoration: none; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .fpc-name:hover { color: #ab9774; }
        .fpc-price { font-size: 16px; font-weight: 600; color: #0d2c17; margin: 0 0 10px; }
        .fpc-price del { font-size: 14px; font-weight: 400; color: #8c8c8c; margin-left: 6px; }
        .fpc-stars { display: flex; align-items: center; gap: 3px; }
        .fpc-reviews { font-size: 13px; color: #777; margin-left: 6px; }
        .fpc-actions { margin-top: 12px; }
        .fpc-add-btn { width: 100%; border: none; border-radius: 8px; padding: 10px 12px; font-size: 14px; font-weight: 700; background: #111; color: #fff; cursor: pointer; transition: background 0.2s; }
        .fpc-add-btn:hover { background: #2a2a2a; }

        /* Mobile - Filter Toggle */
        .plc-filter-toggle { display: none; align-items: center; gap: 8px; background: #fff; border: 1.5px solid #e5e7eb; border-radius: 10px; padding: 10px 16px; font-size: 0.9rem; font-weight: 600; color: #374151; cursor: pointer; margin-bottom: 16px; width: 100%; }
        .plc-filter-toggle:hover { border-color: #3b82f6; background: #f0f7ff; }

        /* Responsive */
        @media (max-width: 991px) {
          .plc-filter-toggle { display: flex; }
          .plc-sidebar { position: fixed; top: 0; left: -100%; height: 100vh; background: #fff; z-index: 1000; padding: 30px 20px; transition: left 0.3s ease; box-shadow: 10px 0 30px rgba(0,0,0,0.1); overflow-y: auto; }
          .plc-sidebar--open { left: 0; }
          .plc-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
        }
        @media (max-width: 768px) {
          .fpc-img-wrap { height: 180px; }
          .fpc-badge { font-size: 11px; padding: 4px 10px; }
          .fpc-icon-btn { width: 34px; height: 34px; }
          .plc-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .plc-results-bar { flex-direction: column; align-items: flex-start; }
          .fpc-name {
            white-space: normal;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }
        @media (max-width: 480px) {
          .plc-grid { grid-template-columns: 1fr; gap: 12px; }
          .fpc-card { padding: 8px; border-radius: 12px; }
          .fpc-img-wrap { height: 220px; }
          .fpc-info { padding: 10px 2px 4px; }
          .fpc-name { font-size: 13px; margin-bottom: 4px; }
          .fpc-price { font-size: 14px; margin-bottom: 6px; }
          .fpc-reviews { font-size: 11px; margin-left: 2px; }
          .fpc-actions { margin-top: 10px; }
        }
      `}</style>

      <HeroBanner
        title={pageTitle}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: pageTitle },
        ]}
      />

      <div className="plc-root">
        <div className="plc-layout">
          {/* Sidebar */}
          <aside className={`plc-sidebar ${sidebarOpen ? "plc-sidebar--open" : ""}`}>
            <div className="plc-sidebar__section">
              <h2 className="plc-sidebar__heading">Search</h2>
              <div className="plc-search-wrap">
                <FaSearch className="plc-search-icon" />
                <input
                  type="text"
                  className="plc-search"
                  placeholder="Search product..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <hr className="plc-divider" />

            <div className="plc-sidebar__section">
              <h2 className="plc-sidebar__heading">Price Range</h2>
              <div className="plc-range-wrap">
                <div className="plc-range-header">
                  <span>Min: ₹0</span>
                  <span>Max: ₹{dynamicMax.toLocaleString("en-IN")}</span>
                </div>
                <input
                  type="range"
                  className="plc-range"
                  min={0}
                  max={dynamicMax}
                  value={maxPrice}
                  style={{ "--val": `${(maxPrice / dynamicMax) * 100}%` }}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                />
                <span className="plc-range-value-display">
                  Up to: ₹{maxPrice.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <hr className="plc-divider" />

            {allVariantOptions.length > 0 && (
              <>
                <div className="plc-sidebar__section">
                  <h2 className="plc-sidebar__heading">Size / Volume</h2>
                  <div className="plc-variant-list">
                    {allVariantOptions.map((option) => (
                      <label key={option} className="plc-checkbox-label">
                        <input
                          type="checkbox"
                          className="plc-checkbox"
                          checked={selectedVariants.includes(option)}
                          onChange={() => handleVariantToggle(option)}
                        />
                        <span className="plc-custom-check"></span>
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
                <hr className="plc-divider" />
              </>
            )}

            <div className="plc-sidebar__section">
              <h2 className="plc-sidebar__heading">Stock</h2>
              <label className="plc-checkbox-label">
                <input
                  type="checkbox"
                  className="plc-checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                />
                <span className="plc-custom-check"></span>
                In Stock Only
              </label>
            </div>
          </aside>

          {/* Main */}
          <main className="plc-main">
            <button className="plc-filter-toggle" onClick={() => setSidebarOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="11" y1="18" x2="13" y2="18" />
              </svg>
              Filters
            </button>

            {/* Results Bar */}
            <div className="plc-results-bar">
              <span className="plc-results-count">
                {sortedProducts.length} products found
              </span>
              <select
                className="plc-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Default Sort</option>
                <option value="price_low_to_high">Price: Low to High</option>
                <option value="price_high_to_low">Price: High to Low</option>
                <option value="newest">Newest</option>
                <option value="name_a_to_z">Name: A to Z</option>
                <option value="name_z_to_a">Name: Z to A</option>
              </select>
              {activeFilters.length > 0 && (
                <button
                  onClick={clearFilters}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#ab9774",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                  }}
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Active Filters Display */}
            {activeFilters.length > 0 && (
              <div className="plc-active-filters">
                {activeFilters.map((filter, idx) => (
                  <div key={idx} className="plc-filter-chip">
                    <span>{filter.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className="plc-empty">Loading products...</div>
            ) : sortedProducts.length > 0 ? (
              <div className="plc-grid">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="plc-empty">
                <p>No products found matching your filters.</p>
                {activeFilters.length > 0 && (
                  <button
                    onClick={clearFilters}
                    style={{
                      marginTop: "16px",
                      padding: "8px 16px",
                      background: "#ab9774",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default ProductListing;
