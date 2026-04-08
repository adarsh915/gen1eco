# Product Filtering & Display System

A comprehensive guide to the product filtering and display system in the Gen1 Eco frontend application.

## Overview

The product filtering system consists of three main parts:

1. **Utility Functions** (`src/utils/productFilters.js`) - Core filtering logic
2. **Product Listing Component** (`src/components/ProductListing.jsx`) - UI and state management
3. **Integration in App** (`src/App.js`) - Routing configuration

## File Locations

- Utilities: `src/utils/productFilters.js`
- Component: `src/components/ProductListing.jsx` (replaces `DeepClean.jsx` for products)
- Routes: `src/App.js` (lines 123-126)

## Features

### 1. **Category & Subcategory Filtering**
- Filter products by primary category
- Filter by subcategory
- Filter by sub-subcategory
- Support for multiple category associations

```
URL Patterns:
- /products                                    → All products
- /products?category=cleaning                 → Category filter
- /products/category/cleaning                 → Category route
- /products/category/cleaning/home            → Category + Subcategory
```

### 2. **Search Functionality**
- Real-time product search by name
- Short description and full description search
- URL parameter support: `?search=dish%20wash`

### 3. **Price Range Filtering**
- Dynamic price slider based on current category
- Resets when category changes
- Locale-formatted price display (Indian format)
- Min/Max price constraints

### 4. **Stock Status**
- Toggle "In Stock Only" filter
- Excludes out-of-stock products when enabled

### 5. **Variant Filtering**
- Filter by product variants (Size/Volume)
- Multi-select variant options
- Shows unique variant values from current category

### 6. **Sorting Options**
- Default sort (as returned from API)
- Price: Low to High
- Price: High to Low
- Newest first
- Name: A to Z
- Name: Z to A

### 7. **Active Filters Display**
- Shows currently applied filters
- One-click filter removal
- "Clear all filters" button
- Results counter

## How Filtering Works

### Filter Pipeline

```
1. Category Filter
   ↓
2. Subcategory Filter
   ↓
3. Sub-subcategory Filter
   ↓
4. Search Filter
   ↓
5. Price Range Filter
   ↓
6. Stock Status Filter
   ↓
7. Variant Filter
   ↓
8. Sort Products
```

### Example Filter Usage

```javascript
import { applyAllFilters } from '../utils/productFilters';

const filters = {
  categorySlug: 'cleaning',
  subCategorySlug: 'home',
  searchTerm: 'floor cleaner',
  minPrice: 0,
  maxPrice: 600,
  inStockOnly: true,
  selectedVariants: ['1 Ltr'],
};

const filteredProducts = applyAllFilters(allProducts, filters);
```

## Utility Functions Reference

### `normalize(val)`
Converts strings to lowercase with hyphens (slug format)
```javascript
normalize('Floor Cleaner') // → 'floor-cleaner'
```

### `toAmount(value)`
Extracts numeric value from price strings
```javascript
toAmount('₹599.00') // → 599
```

### `getDisplayPrice(product)`
Gets the display price (sale price if available, otherwise regular price)
```javascript
const price = getDisplayPrice(product); // → 499.00
```

### `getDiscountPercent(product)`
Calculates discount percentage
```javascript
const discount = getDiscountPercent(product); // → 17
```

### `filterByCategory(products, categorySlug)`
Filters products by primary or secondary category

### `filterBySubcategory(products, subCategorySlug)`
Filters products by subcategory

### `filterBySearch(products, searchTerm)`
Performs text search across name, short_description, and description

### `filterByPriceRange(products, minPrice, maxPrice)`
Filters products within price range

### `filterByStock(products, inStockOnly)`
Filters out-of-stock products if inStockOnly is true

### `filterByVariants(products, selectedVariants)`
Filters products that have selected variant options

### `getAllVariantOptions(products)`
Returns unique variant values from all products

### `getDynamicMaxPrice(products)`
Calculates the highest price in a product set (for slider)

### `applyAllFilters(products, filters)`
Master function that applies all filters in sequence

### `getActiveFilters(filters)`
Returns array of currently active filters for display
```javascript
const active = getActiveFilters({
  categorySlug: 'cleaning',
  searchTerm: 'mop',
  maxPrice: 500
});
// Returns array of filter objects with labels
```

### `sortProducts(products, sortBy)`
Sorts products by specified criteria
```javascript
sortProducts(products, 'price_low_to_high');
```

## Component State Management

The `ProductListing` component manages the following state:

```javascript
const [products, setProducts] = useState([]);           // All products from API
const [search, setSearch] = useState('');               // Search term
const [maxPrice, setMaxPrice] = useState(100000);       // Price range max
const [minPrice, setMinPrice] = useState(0);            // Price range min
const [inStockOnly, setInStockOnly] = useState(false);   // Stock filter
const [selectedVariants, setSelectedVariants] = useState([]); // Selected variants
const [sidebarOpen, setSidebarOpen] = useState(false);   // Mobile sidebar toggle
const [sortBy, setSortBy] = useState('default');        // Sort option
const [loading, setLoading] = useState(true);           // Loading state
```

## API Integration

### Products API Endpoint
```
GET /users/products
```

Expected Response Structure:
```json
{
  "success": true,
  "products": [
    {
      "id": 16,
      "product_name": "Product Name",
      "product_slug": "product-name",
      "category_id": 1,
      "category_name": "Cleaning",
      "category_slug": "cleaning",
      "sub_category_id": 3,
      "sub_category_name": "Gym",
      "sub_category_slug": "gym",
      "subcategories": [...],
      "price": "1200.00",
      "sale_price": "999.00",
      "stock": 8,
      "product_image": "image.png",
      "is_featured": 1,
      "is_best_selling": 0,
      "is_new_arrival": 0,
      "variants": [
        {
          "id": 19,
          "variant_name": "Size",
          "variant_value": "500gm",
          "price": "499.00",
          "stock": 8
        }
      ]
    }
  ]
}
```

## Usage Examples

### Display All Products
```
Navigate to: /products
```

### Filter by Category
```
Navigate to: /products?category=cleaning
OR
Navigate to: /products/category/cleaning
```

### Filter by Category + Subcategory
```
Navigate to: /products/category/cleaning/home
```

### Search Products
```
Navigate to: /products?search=floor%20cleaner
```

### Combination Filters
The component handles URL query parameters:
```
/products?category=cleaning&search=mop
```

## Mobile Responsive Design

The component includes responsive breakpoints:

- **Desktop** (1200px+): 3-column grid
- **Tablet** (768px-1200px): 2-column grid + Sidebar drawer
- **Mobile** (480px-768px): 2-column grid + Sidebar drawer
- **Small Mobile** (<480px): 1-column grid + Sidebar drawer

## Key Features

### Dynamic Price Slider
- Automatically adjusts max value based on current category
- Resets when category changes
- Shows formatted Indian currency (₹)

### Active Filter Chips
- Displays all active filters visually
- Individual chip removal
- "Clear all filters" action

### Product Badges
- Discount percentage
- "New" badge for new arrivals
- "Bestseller" badge for best-selling products
- "In Stock" badge

### Variant Support
- Multi-select variant filtering
- Shows unique variants from category
- Variants in sidebar for easy access

## Customization Guide

### Adding a New Filter
1. Add filter state to `ProductListing`
2. Create utility function in `productFilters.js`
3. Add UI control in sidebar
4. Include in `applyAllFilters` call

### Changing Sort Options
Edit `sortProducts` function and add new cases:
```javascript
case 'custom_sort':
  return sorted.sort((a, b) => {
    // Your sorting logic
  });
```

### Modifying Styling
All styles are scoped within component's `<style>` tag. Key classes:
- `.plc-root` - Main container
- `.plc-sidebar` - Sidebar
- `.plc-grid` - Product grid
- `.fpc-card` - Individual product card

## Performance Considerations

1. **Filtering Pipeline**: Filters are applied sequentially for clarity and maintainability
2. **Dynamic Max Price**: Calculated only from category products to stay contextual
3. **Variant Options**: Calculated from all products to show full availability
4. **Memoization**: Consider wrapping filters in `useMemo` for large datasets

## Troubleshooting

### Products not filtering correctly
- Check if category/subcategory slugs match the API response
- Verify `normalize()` function is converting slugs correctly
- Check browser console for API errors

### Price slider not working
- Ensure products have valid `price` and `sale_price` fields
- Check if `getDynamicMaxPrice()` is returning expected value

### Variants not appearing
- Verify products have `variants` array from API
- Check if variant values are non-empty strings

### Mobile sidebar stuck
- Ensure `setSidebarOpen(false)` is called on overlay click
- Check z-index conflicts with other components

## Future Enhancements

- [ ] Save filter preferences to localStorage
- [ ] URL sync for all active filters
- [ ] Advanced filter presets
- [ ] Filter analytics
- [ ] Infinite scroll pagination
- [ ] Product comparison feature
- [ ] Filter recommendations based on history
