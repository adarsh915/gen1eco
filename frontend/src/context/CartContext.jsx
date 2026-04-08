import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "./AuthContext";
import api from "../api/axios";
import { toast } from 'react-toastify';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const prevUserRef = useRef(undefined);

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // No longer needed: LoginRequiredPopup state removed in favor of toasts

  // Refs to hold latest cart/wishlist values for use inside flushToServer
  const cartRef = useRef([]);
  const wishlistRef = useRef([]);

  // These refs track the last stringified version of what we know is on the server.
  // We only sync if the current local state DIFFERENT from these.
  const lastSyncedCart = useRef(null);
  const lastSyncedWishlist = useRef(null);

  // Keep refs in sync with state
  useEffect(() => { cartRef.current = cart; }, [cart]);
  useEffect(() => { wishlistRef.current = wishlist; }, [wishlist]);

  // Debounce timers
  const cartTimer = useRef(null);
  const wishlistTimer = useRef(null);

  const getVariantIdFromItem = useCallback((item) => (
    item?.selectedVariantId
    || item?.selected_variant_id
    || item?.variant_id
    || item?.variantId
    || item?.selectedVariant?.id
    || item?.selected_variant?.id
    || null
  ), []);

  const getVariantInfoFromItem = useCallback((item) => {
    const sourceVariant = item?.selectedVariant || item?.selected_variant || null;
    const variantId = getVariantIdFromItem(item);
    const variantName = sourceVariant?.variant_name || sourceVariant?.name || sourceVariant?.option_name || item?.selectedVariantName || item?.selected_variant_name || item?.variant_name || "";
    const variantValue = sourceVariant?.variant_value || sourceVariant?.value || sourceVariant?.option_value || item?.selectedVariantValue || item?.selected_variant_value || item?.variant_value || "";
    const variantPrice = Number((sourceVariant?.price ?? sourceVariant?.variant_price ?? sourceVariant?.sale_price ?? item?.variant_price ?? item?.selectedVariantPrice ?? item?.selected_variant_price) || 0);

    if (!variantId) {
      return null;
    }

    return {
      id: variantId,
      variant_name: variantName,
      variant_value: variantValue,
      price: variantPrice,
      stock: sourceVariant?.stock ?? sourceVariant?.variant_stock,
    };
  }, [getVariantIdFromItem]);

  const normalizeCartItems = useCallback((items) => {
    if (!Array.isArray(items)) return [];

    return items
      .filter(Boolean)
      .map((item) => {
        const baseProductId = item.productId || item.id || item._id;
        const variantId = getVariantIdFromItem(item) || "base";
        const cartItemId = item.cartItemId || `${baseProductId}-${variantId}`;

        return {
          ...item,
          id: baseProductId,
          productId: baseProductId,
          cartItemId,
          qty: Number(item.qty || 1),
        };
      });
  }, [getVariantIdFromItem]);

  const mergeCartCollections = useCallback((...collections) => {
    const mergedMap = new Map();

    collections.forEach((collection) => {
      normalizeCartItems(collection).forEach((item) => {
        if (!item.productId) return;
        const existing = mergedMap.get(item.cartItemId);
        if (existing) {
          mergedMap.set(item.cartItemId, {
            ...existing,
            ...item,
            qty: Number(existing.qty || 0) + Number(item.qty || 0),
          });
        } else {
          mergedMap.set(item.cartItemId, item);
        }
      });
    });

    return Array.from(mergedMap.values());
  }, [normalizeCartItems]);

  // Helper to sync cart items with latest product data (price, tax, etc.)
  const refreshCartItems = useCallback(async (currentItems) => {
    if (!currentItems || currentItems.length === 0) return currentItems;
    try {
      const res = await api.get("/users/products");
      if (res.data.success) {
        const latestProducts = res.data.products;
        return currentItems.map(item => {
          const baseProductId = item.productId || item.id;
          const latest = latestProducts.find(p => p.id === baseProductId);
          const existingVariant = getVariantInfoFromItem(item);

          if (latest) {
            const selectedVariantId = existingVariant?.id || null;
            const latestVariant = selectedVariantId
              ? (latest.variants || []).find(v => String(v.id) === String(selectedVariantId))
              : null;
            const resolvedVariant = latestVariant || existingVariant || null;
            const normalizedVariant = resolvedVariant
              ? {
                  id: resolvedVariant.id,
                  variant_name: resolvedVariant.variant_name || existingVariant?.variant_name || "",
                  variant_value: resolvedVariant.variant_value || existingVariant?.variant_value || "",
                  price: Number((resolvedVariant.price ?? existingVariant?.price) || 0),
                  stock: resolvedVariant.stock,
                }
              : null;

            return {
              ...item,
              price: normalizedVariant ? normalizedVariant.price : latest.price,
              sale_price: normalizedVariant ? 0 : latest.sale_price,
              gst_percent: latest.gst_percent,
              gst_id: latest.gst_id,
              discount_percent: normalizedVariant ? 0 : (latest.discount_percent || 0),
              product_name: latest.product_name || item.product_name,
              product_image: latest.product_image || item.product_image,
              selectedVariantId: normalizedVariant ? normalizedVariant.id : null,
              selectedVariant: normalizedVariant,
              selectedVariantName: normalizedVariant?.variant_name || null,
              selectedVariantValue: normalizedVariant?.variant_value || null,
              selectedVariantPrice: normalizedVariant ? Number(normalizedVariant.price) || 0 : null,
              variant_price: normalizedVariant ? normalizedVariant.price : null,
            };
          }

          if (existingVariant) {
            return {
              ...item,
              selectedVariantId: existingVariant.id,
              selectedVariant: existingVariant,
              selectedVariantName: existingVariant.variant_name || null,
              selectedVariantValue: existingVariant.variant_value || null,
              selectedVariantPrice: Number(existingVariant.price || 0),
              variant_price: Number(existingVariant.price || 0),
              sale_price: 0,
              discount_percent: 0,
            };
          }

          return item;
        });
      }
    } catch (err) {
      console.error("[CartContext] Failed to refresh cart items:", err);
    }
    return currentItems;
  }, [getVariantInfoFromItem]);

  // 1. Authentication & Initial Data Reconciliation
  useEffect(() => {
    if (authLoading) return;

    const reconcile = async () => {
      if (user) {
        console.log("[CartContext] AUTH: User logged in. Reconciling & Refreshing state...");
        
        const serverCart = user.cart_data || [];
        const serverWishlist = user.wishlist_data || [];
        const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
        const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
        const localWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");

        const initialCart = mergeCartCollections(serverCart, localCart, guestCart);
        const initialWishlist = serverWishlist.length > 0 ? serverWishlist : localWishlist;

        // Sync items with latest backend data
        const finalCart = await refreshCartItems(initialCart);
        
        setCart(finalCart);
        setWishlist(initialWishlist);

        if (guestCart.length > 0) {
          localStorage.removeItem("guestCart");
        }

        lastSyncedCart.current = JSON.stringify(finalCart);
        lastSyncedWishlist.current = JSON.stringify(initialWishlist);
        
        setIsInitialized(true);
      } else {
        console.log("[CartContext] AUTH: No user (Guest).");
        
        // For guest users, use guestCart from localStorage
        const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
        const guestWishlist = JSON.parse(localStorage.getItem("guestWishlist") || "[]");
        
        // Sync items with latest backend data (though unlikely for guests)
        const finalCart = await refreshCartItems(guestCart);
        
        setCart(finalCart);
        setWishlist(guestWishlist);
        
        setIsInitialized(true);
      }
      prevUserRef.current = user;
    };

    reconcile();
  }, [user, authLoading, refreshCartItems, mergeCartCollections]);

  // 2. Persist to LocalStorage (Always once initialized)
  useEffect(() => {
    if (isInitialized) {
      const cartKey = user ? "cart" : "guestCart";
      const wishlistKey = user ? "wishlist" : "guestWishlist";
      
      localStorage.setItem(cartKey, JSON.stringify(cart));
      localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
    }
  }, [cart, wishlist, isInitialized, user]);

  // 3. Sync to Server (Debounced & Comparison-based)
  useEffect(() => {
    if (isInitialized && user) {
      const currentCartStr = JSON.stringify(cart);
      
      // Only sync if the local state has actually changed from what's on the server.
      if (currentCartStr === lastSyncedCart.current) {
        // console.log("[CartContext] Cart matches server. Skipping sync.");
        return;
      }

      if (cartTimer.current) clearTimeout(cartTimer.current);
      cartTimer.current = setTimeout(async () => {
        try {
          const token = localStorage.getItem('token');
          console.log("[CartContext] Syncing cart to server...");
          const res = await api.post("/users/profile/cart", { cart }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) {
            lastSyncedCart.current = currentCartStr;
            console.log("[CartContext] Server cart sync SUCCESS.");
          }
        } catch (err) {
          console.error("[CartContext] Server cart sync ERROR:", err.response?.data || err.message);
        }
      }, 2000); 
    }
  }, [cart, user, isInitialized]);

  useEffect(() => {
    if (isInitialized && user) {
      const currentWishlistStr = JSON.stringify(wishlist);
      
      if (currentWishlistStr === lastSyncedWishlist.current) {
        // console.log("[CartContext] Wishlist matches server. Skipping sync.");
        return;
      }

      if (wishlistTimer.current) clearTimeout(wishlistTimer.current);
      wishlistTimer.current = setTimeout(async () => {
        try {
          const token = localStorage.getItem('token');
          console.log("[CartContext] Syncing wishlist to server...");
          const res = await api.post("/users/profile/wishlist", { wishlist }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) {
            lastSyncedWishlist.current = currentWishlistStr;
            console.log("[CartContext] Server wishlist sync SUCCESS.");
          }
        } catch (err) {
          console.error("[CartContext] Server wishlist sync ERROR:", err.response?.data || err.message);
        }
      }, 2000);
    }
  }, [wishlist, user, isInitialized]);

  // 4. Immediate flush — called BEFORE logout to guarantee data is saved to server
  const flushToServer = async () => {
    // Cancel any pending debounce timers immediately
    if (cartTimer.current) clearTimeout(cartTimer.current);
    if (wishlistTimer.current) clearTimeout(wishlistTimer.current);

    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };
    const currentCart = cartRef.current;
    const currentWishlist = wishlistRef.current;

    try {
      console.log("[CartContext] PRE-LOGOUT: Flushing cart to server...", currentCart);
      await api.post("/users/profile/cart", { cart: currentCart }, { headers });
      lastSyncedCart.current = JSON.stringify(currentCart);
      console.log("[CartContext] PRE-LOGOUT: Cart flushed OK.");
    } catch (err) {
      console.error("[CartContext] PRE-LOGOUT: Cart flush ERROR:", err.response?.data || err.message);
    }

    try {
      console.log("[CartContext] PRE-LOGOUT: Flushing wishlist to server...", currentWishlist);
      await api.post("/users/profile/wishlist", { wishlist: currentWishlist }, { headers });
      lastSyncedWishlist.current = JSON.stringify(currentWishlist);
      console.log("[CartContext] PRE-LOGOUT: Wishlist flushed OK.");
    } catch (err) {
      console.error("[CartContext] PRE-LOGOUT: Wishlist flush ERROR:", err.response?.data || err.message);
    }
  };

  const addToCart = (product, qty = 1) => {
    // Allow both authenticated and guest users to add to cart
    
    // Create a unique cart ID: productID-variantID (or "base" if no variant)
    const baseProductId = product.id || product._id;
    const sourceVariant = product.selectedVariant || product.selected_variant || null;
    const normalizedVariant = sourceVariant
      ? {
          id: sourceVariant.id || sourceVariant.variant_id || sourceVariant.product_variant_id || sourceVariant.variantId || product.selectedVariantId || product.selected_variant_id || null,
          variant_name: sourceVariant.variant_name || sourceVariant.name || sourceVariant.option_name || sourceVariant.attribute_name || sourceVariant.type || product.selectedVariantName || product.selected_variant_name || product.variant_name || "Variant",
          variant_value: sourceVariant.variant_value || sourceVariant.value || sourceVariant.option_value || sourceVariant.attribute_value || sourceVariant.option || sourceVariant.size || sourceVariant.color || product.selectedVariantValue || product.selected_variant_value || product.variant_value || "",
          price: Number((sourceVariant.price ?? sourceVariant.variant_price ?? sourceVariant.sale_price ?? sourceVariant.selling_price ?? product.selectedVariantPrice ?? product.selected_variant_price ?? product.variant_price) || 0),
          stock: sourceVariant.stock ?? sourceVariant.variant_stock,
        }
      : null;
    const variantId = normalizedVariant?.id || product.selectedVariantId || "base";
    const cartItemId = `${baseProductId}-${variantId}`;
    
    const alreadyInCart = cart.find(item => item.cartItemId === cartItemId);
    
    if (alreadyInCart) {
      toast.info("Updating cart item quantity", { position: "top-right", autoClose: 1000 });
      setCart((prev) => 
        prev.map(item => 
          item.cartItemId === cartItemId ? { ...item, qty: item.qty + qty } : item
        )
      );
    } else {
      toast.success("Product added to cart!", { position: "top-right" });
      const newItem = { 
        ...product, 
        id: baseProductId, // Keep original ID for reference
        productId: baseProductId,
        selectedVariantId: normalizedVariant?.id || null,
        selectedVariant: normalizedVariant,
          selectedVariantName: normalizedVariant?.variant_name || null,
          selectedVariantValue: normalizedVariant?.variant_value || null,
          selectedVariantPrice: normalizedVariant ? Number(normalizedVariant.price) || 0 : null,
        variant_price: normalizedVariant ? normalizedVariant.price : null,
        cartItemId: cartItemId, 
        qty: qty 
      };
      setCart((prev) => [...prev, newItem]);
    }
  };

  const removeFromCart = (cartItemId) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
    toast.error("Removed from cart", { position: "top-right", autoClose: 2000 });
  };

  const updateQty = (cartItemId, qty) => {
    if (qty < 1) return removeFromCart(cartItemId);
    setCart((prev) =>
      prev.map((item) => (item.cartItemId === cartItemId ? { ...item, qty: Number(qty) } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    toast.success("Cart cleared", { position: "top-right" });
  };

  const applyCoupon = async (coupon_code) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Please login to apply coupon");
        return;
      }

      const res = await api.post("/users/coupons/validate", { coupon_code, amount: rawSubtotal }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setAppliedCoupon(res.data.coupon);
        toast.success(`Coupon "${coupon_code}" applied!`);
        return true;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid coupon");
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.info("Coupon removed");
  };

  const toggleWishlist = (product) => {
    if (!user) { 
      toast.error("Please login to add items to wishlist", { position: "top-right" });
      return; 
    }
    const pid = product.id || product._id;
    const fallbackVariant = Array.isArray(product.variants) && product.variants.length > 0
      ? product.variants[0]
      : null;
    const sourceVariant = product.selectedVariant || product.selected_variant || fallbackVariant;
    const normalizedVariant = sourceVariant
      ? {
          id: sourceVariant.id,
          variant_name: sourceVariant.variant_name,
          variant_value: sourceVariant.variant_value,
          price: Number(sourceVariant.price) || 0,
          stock: sourceVariant.stock,
        }
      : null;

    const variantId = normalizedVariant?.id || product.selectedVariantId || product.selected_variant_id || "base";
    const wishlistItemId = `${pid}-${variantId}`;
    const exists = wishlist.some((item) => (item.wishlistItemId || `${item.id || item._id}-${item.selectedVariantId || item.selected_variant_id || item.selectedVariant?.id || "base"}`) === wishlistItemId);

    if (exists) {
      toast.error("Product already added to wishlist", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setWishlist((prev) => [...prev, {
      ...product,
      id: pid,
      wishlistItemId,
      selectedVariantId: normalizedVariant?.id || null,
      selectedVariant: normalizedVariant,
      selectedVariantName: normalizedVariant?.variant_name || null,
      selectedVariantValue: normalizedVariant?.variant_value || null,
      selectedVariantPrice: normalizedVariant ? Number(normalizedVariant.price) || 0 : null,
      variant_price: normalizedVariant ? Number(normalizedVariant.price) || 0 : null,
    }]);
    toast.success("Product added to wishlist!", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const removeFromWishlist = (identifier) => {
    setWishlist((prev) => prev.filter((item) => {
      const itemId = item.id || item._id;
      const variantId = item.selectedVariantId || item.selected_variant_id || item.selectedVariant?.id || "base";
      const itemWishlistId = item.wishlistItemId || `${itemId}-${variantId}`;
      return itemWishlistId !== identifier && itemId !== identifier;
    }));
    toast.error("Removed from wishlist", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const isWishlisted = (id, variantId = null) => wishlist.some((item) => {
    const itemId = item.id || item._id;
    const itemVariantId = item.selectedVariantId || item.selected_variant_id || item.selectedVariant?.id || "base";

    if (variantId) {
      return itemId === id && itemVariantId === variantId;
    }

    return itemId === id;
  });

  const totalItems = cart.reduce((acc, item) => acc + Number(item.qty), 0);

  const hasVariantSelection = (item) => Boolean(getVariantIdFromItem(item));

  const getUnitPrice = (item) => {
    if (hasVariantSelection(item)) {
      return Number((item.selectedVariant?.price ?? item.variant_price ?? item.selectedVariantPrice ?? item.selected_variant_price ?? item.price) || 0);
    }

    const basePrice = Number(item.price || 0);
    const salePrice = Number(item.sale_price || 0);
    if (salePrice > 0) {
      return salePrice;
    }

    const discountPercent = Number(item.discount_percent || 0);
    if (discountPercent > 0) {
      return basePrice - (basePrice * discountPercent / 100);
    }

    return basePrice;
  };
  
  // 1. Raw Subtotal (based on product prices and their own discounts)
  const rawSubtotal = cart.reduce((acc, item) => {
    const unitPrice = getUnitPrice(item);
    return acc + (unitPrice * Number(item.qty));
  }, 0);

  // 2. Coupon Discount
  const couponDiscount = appliedCoupon ? Number(appliedCoupon.discount_amount) : 0;

  // 3. Taxable Amount
  const taxableSubtotal = Math.max(0, rawSubtotal - couponDiscount);

  // 4. GST Calculation (Dynamic per product)
  const totalGst = cart.reduce((acc, item) => {
    const unitPrice = getUnitPrice(item);
    const itemSubtotal = unitPrice * Number(item.qty);
    
    // Pro-rate the coupon discount to calculation GST on the actual paid amount? 
    // Usually GST is on the amount after discount.
    const itemRatio = rawSubtotal > 0 ? (itemSubtotal / rawSubtotal) : 0;
    const itemTaxableAmount = Math.max(0, itemSubtotal - (couponDiscount * itemRatio));
    
    const gstPercent = Number(item.gst_percent || 0);
    return acc + (itemTaxableAmount * gstPercent / 100);
  }, 0);

  const totalPrice = taxableSubtotal + totalGst;
  const subtotalInclGst = rawSubtotal + totalGst;

  return (
    <CartContext.Provider value={{
      cart, 
      addToCart, removeFromCart, updateQty, clearCart,
      wishlist, 
      toggleWishlist, removeFromWishlist, isWishlisted,
      totalItems, totalPrice,
      rawSubtotal, subtotalInclGst, couponDiscount, totalGst,
      appliedCoupon, applyCoupon, removeCoupon,
      flushToServer,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);