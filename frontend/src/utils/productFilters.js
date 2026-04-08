/**
 * Product Filtering Utilities
 * Centralized logic for filtering products by various criteria
 */

/**
 * Normalize strings for comparison (slug format)
 */
export const normalize = (val) => {
  return val
    ? String(val)
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
    : "";
};

/**
 * Extract numeric value from string (price handling)
 */
export const toAmount = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const cleaned = String(value ?? "").replace(/[^0-9.]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Get display price from product
 */
export const getDisplayPrice = (product) => {
  return product.sale_price > 0
    ? Number(product.sale_price)
    : Number(product.price);
};

/**
 * Calculate discount percentage
 */
export const getDiscountPercent = (product) => {
  if (!product.sale_price || product.sale_price <= 0) return 0;
  return Math.round(
    ((product.price - product.sale_price) / product.price) * 100
  );
};

/**
 * Filter products by category
 */
export const filterByCategory = (products, categorySlug) => {
  if (!categorySlug) return products;

  const urlCatSlug = normalize(categorySlug);
  return products.filter((p) => {
    const primaryCatSlug = normalize(p.category_slug || p.category_name);
    const hasSecondaryMatch = (p.categories || []).some(
      (cat) => {
        // Check primary category
        if (normalize(cat.category_slug || cat.category_name) === urlCatSlug) return true;
        // Check sub_category (for multi-category products)
        if (normalize(cat.sub_category_slug || cat.sub_category_name) === urlCatSlug) return true;
        // Check sub_sub_category
        if (normalize(cat.sub_sub_category_slug || cat.sub_sub_category_name) === urlCatSlug) return true;
        return false;
      }
    );
    return primaryCatSlug === urlCatSlug || hasSecondaryMatch;
  });
};

/**
 * Filter products by subcategory
 */
export const filterBySubcategory = (products, subCategorySlug) => {
  if (!subCategorySlug) return products;

  const pSubSlug = normalize(subCategorySlug);
  return products.filter((p) => {
    // Check primary sub_category
    if (normalize(p.sub_category_slug || p.sub_category_name) === pSubSlug) return true;
    // Check in categories array
    const hasSubcategoryMatch = (p.categories || []).some(
      (cat) => normalize(cat.sub_category_slug || cat.sub_category_name) === pSubSlug
    );
    return hasSubcategoryMatch;
  });
};

/**
 * Filter products by subsubcategory
 */
export const filterBySubsubcategory = (products, subSubCategorySlug) => {
  if (!subSubCategorySlug) return products;

  const pSubSubSlug = normalize(subSubCategorySlug);
  return products.filter((p) => {
    // Check primary sub_sub_category
    if (normalize(p.sub_sub_category_slug || p.sub_sub_category_name) === pSubSubSlug) return true;
    // Check in categories array
    const hasSubsubcategoryMatch = (p.categories || []).some(
      (cat) => normalize(cat.sub_sub_category_slug || cat.sub_sub_category_name) === pSubSubSlug
    );
    return hasSubsubcategoryMatch;
  });
};

/**
 * Filter products by search term
 */
export const filterBySearch = (products, searchTerm) => {
  if (!searchTerm) return products;

  const lowerSearch = searchTerm.toLowerCase();
  return products.filter(
    (p) =>
      p.product_name.toLowerCase().includes(lowerSearch) ||
      p.short_description?.toLowerCase().includes(lowerSearch) ||
      p.description?.toLowerCase().includes(lowerSearch)
  );
};

/**
 * Filter products by price range
 */
export const filterByPriceRange = (products, minPrice, maxPrice) => {
  return products.filter((p) => {
    const price = getDisplayPrice(p);
    return price >= minPrice && price <= maxPrice;
  });
};

/**
 * Filter products by stock status
 */
export const filterByStock = (products, inStockOnly = false) => {
  if (!inStockOnly) return products;
  return products.filter((p) => p.stock > 0);
};

/**
 * Filter products by variant values
 */
export const filterByVariants = (products, selectedVariants = []) => {
  if (!selectedVariants.length) return products;

  return products.filter((p) =>
    (p.variants || []).some((v) => selectedVariants.includes(v.variant_value))
  );
};

/**
 * Get all unique variant values from products
 */
export const getAllVariantOptions = (products) => {
  return Array.from(
    new Set(products.flatMap((p) => (p.variants || []).map((v) => v.variant_value)))
  )
    .filter(Boolean)
    .sort();
};

/**
 * Get dynamic max price from products
 */
export const getDynamicMaxPrice = (products) => {
  if (products.length === 0) return 100000;
  const maxPrice = Math.max(
    ...products.map((p) => getDisplayPrice(p))
  );
  return Math.ceil(maxPrice);
};

/**
 * Apply all filters in sequence (category → search → price → stock → variants)
 */
export const applyAllFilters = (products, filters) => {
  const {
    categorySlug = null,
    subCategorySlug = null,
    subSubCategorySlug = null,
    searchTerm = "",
    minPrice = 0,
    maxPrice = 100000,
    inStockOnly = false,
    selectedVariants = [],
  } = filters;

  let filtered = products;

  // Step 1: Category filters
  if (categorySlug) {
    filtered = filterByCategory(filtered, categorySlug);
  }
  if (subCategorySlug) {
    filtered = filterBySubcategory(filtered, subCategorySlug);
  }
  if (subSubCategorySlug) {
    filtered = filterBySubsubcategory(filtered, subSubCategorySlug);
  }

  // Step 2: Search
  if (searchTerm) {
    filtered = filterBySearch(filtered, searchTerm);
  }

  // Step 3: Price range
  filtered = filterByPriceRange(filtered, minPrice, maxPrice);

  // Step 4: Stock
  if (inStockOnly) {
    filtered = filterByStock(filtered, inStockOnly);
  }

  // Step 5: Variants
  if (selectedVariants.length > 0) {
    filtered = filterByVariants(filtered, selectedVariants);
  }

  return filtered;
};

/**
 * Get active filters for display
 */
export const getActiveFilters = (filters) => {
  const active = [];

  if (filters.categorySlug) {
    active.push({
      type: "category",
      label: `Category: ${filters.categorySlug.replace(/-/g, " ")}`,
      value: filters.categorySlug,
    });
  }
  if (filters.searchTerm) {
    active.push({
      type: "search",
      label: `Search: "${filters.searchTerm}"`,
      value: filters.searchTerm,
    });
  }
  if (filters.maxPrice < 100000) {
    active.push({
      type: "price",
      label: `Price: Up to ₹${filters.maxPrice.toLocaleString("en-IN")}`,
      value: filters.maxPrice,
    });
  }
  if (filters.inStockOnly) {
    active.push({
      type: "stock",
      label: "In Stock Only",
      value: true,
    });
  }
  if (filters.selectedVariants.length > 0) {
    active.push({
      type: "variants",
      label: `Variants: ${filters.selectedVariants.join(", ")}`,
      value: filters.selectedVariants,
    });
  }

  return active;
};

/**
 * Sort products
 */
export const sortProducts = (products, sortBy = "default") => {
  const sorted = [...products];

  switch (sortBy) {
    case "price_low_to_high":
      return sorted.sort((a, b) => getDisplayPrice(a) - getDisplayPrice(b));
    case "price_high_to_low":
      return sorted.sort((a, b) => getDisplayPrice(b) - getDisplayPrice(a));
    case "newest":
      return sorted.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    case "name_a_to_z":
      return sorted.sort((a, b) =>
        a.product_name.localeCompare(b.product_name)
      );
    case "name_z_to_a":
      return sorted.sort((a, b) =>
        b.product_name.localeCompare(a.product_name)
      );
    default:
      return sorted;
  }
};
