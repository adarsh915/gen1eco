import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaFacebookF, FaLinkedinIn,
  FaTwitter, FaInstagram, FaShoppingCart,
  FaTimes, FaPlus, FaMinus,
  FaSearch, FaUser, FaHeart, FaYoutube
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import MyCart from "./MyCart";
import Wishlist from "./Wishlist";
import api from "../api/axios";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart, totalItems, wishlist, flushToServer } = useCart();

  const [categories, setCategories] = useState([]);
  const [shopOpen, setShopOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [mobileCatToggles, setMobileCatToggles] = useState({});
  const [mobileSubToggles, setMobileSubToggles] = useState({});
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);

  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShopOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false);
      if (searchOpen && searchInputRef.current && !searchInputRef.current.contains(e.target))
        setSearchOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = (drawerOpen || cartOpen || wishlistOpen) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen, cartOpen, wishlistOpen]);

  const getFirstArray = (obj, keys) => {
    for (const key of keys) {
      const value = obj?.[key];
      if (Array.isArray(value)) return value;
      if (value && typeof value === "object") return [value];
    }
    return [];
  };
  const normalizeCategoryTree = (rawCategories) => {
    if (!Array.isArray(rawCategories)) return [];
    return rawCategories.map((cat) => {
      const subCategories = getFirstArray(cat, ["subCategories", "sub_categories", "subcategories", "subCategory", "sub_category", "children"])
        .map((sub) => {
          const subSubCategories = getFirstArray(sub, ["subSubCategories", "sub_sub_categories", "sub_subcategories", "subSubCategory", "sub_sub_category", "children"])
            .map((ssc) => ({
              ...ssc,
              name: ssc?.name ?? ssc?.sub_sub_category_name ?? ssc?.title ?? "",
              slug: ssc?.slug ?? ssc?.sub_sub_category_slug ?? "",
              id: ssc?.id ?? ssc?.sub_sub_category_id ?? ssc?.slug ?? ssc?.name,
            }));
          return {
            ...sub,
            name: sub?.name ?? sub?.sub_category_name ?? sub?.title ?? "",
            slug: sub?.slug ?? sub?.sub_category_slug ?? "",
            id: sub?.id ?? sub?.sub_category_id ?? sub?.slug ?? sub?.name,
            subSubCategories,
          };
        });
      return {
        ...cat,
        name: cat?.name ?? cat?.category_name ?? cat?.title ?? "",
        slug: cat?.slug ?? cat?.category_slug ?? "",
        id: cat?.id ?? cat?.category_id ?? cat?.slug ?? cat?.name,
        subCategories,
      };
    });
  };
  // Fetch Navbar Categories
  useEffect(() => {
    api.get('/category/nav')
      .then(res => {
        if (res.data.success) setCategories(normalizeCategoryTree(res.data.data));
      })
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setMobileShopOpen(false);
    setMobileCatToggles({});
    setMobileSubToggles({});
  };

  const toggleMobileCat = (catId) => {
    setMobileCatToggles(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const toggleMobileSub = (subKey) => {
    setMobileSubToggles(prev => ({ ...prev, [subKey]: !prev[subKey] }));
  };

  const normalizeSlug = (slug) => slug ? String(slug).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : '';

  // ── open cart, close mobile drawer first ──
  const openCart = () => {
    closeDrawer();
    setCartOpen(true);
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchOpen(false);
      closeDrawer();
    }
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .g1-root {  position: sticky; top: 0; z-index: 1000; }

        /* ── GRID ── */
        .g1-container { width: 100%; max-width: 1415px; margin: 0 auto; padding: 0 20px; box-sizing: border-box; }
        .g1-row { display: flex; align-items: center; margin: 0 -12px; }
        .g1-col-2, .g1-col-3, .g1-col-5, .g1-col-7 { box-sizing: border-box; padding: 0 12px; min-height: 1px; }
        .g1-col-2 { width: 16.666%; }
        .g1-col-3 { width: 25%; }
        .g1-col-5 { width: 41.666%; }
        .g1-col-7 { width: 58.333%; }
        .g1-col-9 { width: 75%; }
        .g1-col-10 { width: 83.333%; }

        /* ── TOPBAR ── */
        .g1-topbar { background: #1e1e1e; color: #ccc; padding: 9px 0; font-size: 13px; }
        .g1-topbar-left { display: flex; gap: 22px; flex-wrap: wrap; align-items: center; }
        .set-call img {     height: 15px;}
        .g1-topbar-left a {     font-size: 15px;
    font-weight: 400;
    color: #ffffff; text-decoration: none; display: flex; align-items: center; gap: 7px; transition: color .2s; }
        .g1-topbar-left a:hover { color: #6fcf6f; }
        .g1-topbar-right { display: flex; gap: 10px; align-items: center; justify-content: flex-end; }
        .g1-social { color: #fff; text-decoration: none; width: 28px; height: 28px;   display: flex; align-items: center; justify-content: center; font-size: 12px; transition: all .2s; }
        .g1-social:hover { background: #2a7a2a; border-color: #2a7a2a; color: #fff; }

        /* Topbar Responsive */
        @media (max-width: 1200px) {
          .g1-topbar { padding: 7px 0; }
          .g1-topbar-left { gap: 16px; }
          .g1-topbar-left a { font-size: 13px; }
        }

        @media (max-width: 992px) {
          .g1-topbar { padding: 6px 0; }
          .g1-topbar-left { gap: 12px; }
          .g1-topbar-left a { font-size: 12px; gap: 5px; }
          .g1-social { width: 24px; height: 24px; font-size: 11px; }
        }

        @media (max-width: 820px) {
          .g1-topbar { display: none !important; }
        }

        /* ── NAV ── */
        .g1-nav { background: #fff; padding: 0; box-shadow: 0 2px 10px rgba(0,0,0,0.08); transition: box-shadow .3s; position: relative; }
        .g1-nav.scrolled { box-shadow: 0 4px 20px rgba(0,0,0,0.13); }
        .g1-nav-row { align-items: center; min-height: 72px; flex-wrap: nowrap; }
        .g1-nav-logo-col { display: flex; align-items: center; }
        .g1-nav-links-col { display: flex; align-items: center; }
        .g1-nav-right-col { display: flex; align-items: center; justify-content: flex-end; }

        /* Nav Responsive */
        @media (max-width: 1200px) {
          .g1-nav-row { min-height: 68px; }
        }

        @media (max-width: 992px) {
          .g1-nav-row { min-height: 64px; }
        }

        /* LOGO */
        .g1-logo { display: flex; align-items: center; justify-content: center; flex-shrink: 0; text-decoration: none; }

        /* LINKS */
        .g1-links { display: flex; list-style: none; align-items: center; gap: 20px; margin: 0; padding: 0; flex: 1; justify-content: center; }
        .g1-link { text-decoration: none; color: #000; font-weight: 600; font-size: 15px; padding: 6px 15px; border-radius: 4px; transition: color .2s, background .2s; white-space: nowrap;  }
        .divider { color: #ccc; font-weight: 300; pointer-events: none; }
      

        /* DROPDOWN */
        .g1-dd-wrap { position: relative; }
        .g1-dd-btn { display: flex; align-items: center; gap: 5px; cursor: pointer; color: #000; font-weight: 600; font-size: 15px; padding: 6px 15px; border-radius: 4px; background: none; border: none;  transition: all .2s; white-space: nowrap; text-decoration: none; position: relative; }
        .g1-dd-btn:hover { color: #2a7a2a; }
      
        .g1-chevron { display: inline-block; width: 8px; height: 8px; border-right: 2px solid currentColor; border-bottom: 2px solid currentColor; transform: rotate(45deg); margin-top: -2px; transition: transform .25s; }
        .g1-chevron.up { transform: rotate(-135deg); margin-top: 3px; }
        .g1-dropdown::before { content: ""; position: absolute; top: -18px; left: 0; right: 0; height: 18px; }
        .g1-dropdown { 
          position: absolute; 
          top: calc(100% + 15px); 
          left: 0; 
          background: #fff; 
          border: 1px solid #eaeaea; 
          border-radius: 8px; 
          list-style: none; 
          min-width: 280px; 
          padding: 10px 0; 
          margin: 0; 
          box-shadow: 0 15px 40px rgba(0,0,0,0.12); 
          z-index: 200; 
          animation: dropIn .2s ease; 
        }
        @keyframes dropIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .g1-drop-link { 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          padding: 14px 24px; 
          color: #333; 
          text-decoration: none; 
          font-size: 16px; 
          font-weight: 700; 
          transition: all .2s; 
          
        }
        .g1-drop-link:hover { 
          background: #f8f9f8; 
          color: #2a7a2a; 
        }
        .g1-drop-link.has-sub::after { 
          content: '\\276F'; 
          font-size: 12px; 
          margin-left: 10px; 
          opacity: 0.8; 
          font-weight: 400;
        }

        /* RIGHT */
        .g1-right { display: flex; align-items: center; gap: 24px; }
        .g1-icon { position: relative; cursor: pointer; color: #000; transition: color .2s; display: flex; align-items: center; background: none; border: none; padding: 0; margin-top: 4px;  text-decoration: none; font-size: 20px; }
        
        .g1-badge { position: absolute; top: -6px; right: -10px; background: green; color: #fff; border-radius: 50%; width: 18px; height: 18px; font-size: 11px; display: flex; align-items: center; justify-content: center; font-weight: 600; }
        .g1-login { color: #000 !important; padding: 4px 8px !important; border-radius: 4px !important; font-weight: 600 !important; font-size: 14px !important; transition: background .2s !important; }
        .g1-user-wrap { 
  position: relative;
  display: flex; 
  align-items: center; 
  gap: 10px; 
  cursor: pointer; 
  text-decoration: none; 
  margin-left: 6px; 
}
        .g1-user-avatar { width: 34px; height: 34px; background: #b39359; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; }
        .g1-user-avatar svg { fill: #fff; }
        .g1-user-name { color: #000; font-weight: 600; font-size: 15px;  }

        /* Right Responsive */
        @media (max-width: 1024px) {
          .g1-right { gap: 16px; }
          .g1-icon { font-size: 18px; }
          .g1-user-name { font-size: 13px; }
          .g1-user-avatar { width: 30px; height: 30px; }
        }

        @media (max-width: 480px) {
          .g1-right { gap: 12px; }
          .g1-icon { font-size: 16px; }
          .g1-badge { width: 16px; height: 16px; font-size: 10px; top: -4px; right: -8px; }
          .g1-user-avatar { width: 28px; height: 28px; font-size: 12px; }
          .g1-user-wrap { gap: 6px; margin-left: 2px; }
          .g1-user-name { display: none; }
        }

        .g1-user-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          background: #fff;
          border: 1px solid #eaeaea;
          border-radius: 8px;
          list-style: none;
          min-width: 180px;
          padding: 8px 0;
          margin: 0;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          z-index: 200;
          animation: dropIn .2s ease;
        }

        .g1-user-drop-link {
          display: block;
          padding: 10px 20px;
          color: #333;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all .2s;
        }

        .g1-user-drop-link:hover {
          background: #f8f9f8;
          color: #2a7a2a;
        }

        .g1-user-logout-btn {
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          padding: 10px 20px;
          color: #e53935;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all .2s;
        }

        .g1-user-logout-btn:hover {
          background: #fff5f5;
        }

        /* BURGER */
        .g1-burger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; margin-left: auto; background: none; border: none; z-index: 1001; }
        .g1-burger-line { width: 24px; height: 2px; background: #222; border-radius: 2px; transition: all .3s; display: block; }

        /* OVERLAY */
        .g1-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.48); z-index: 1100; opacity: 0; pointer-events: none; transition: opacity .3s; }
        .g1-overlay.show { opacity: 1; pointer-events: auto; }

        /* DRAWER */
        .g1-drawer { position: fixed; top: 0; left: 0; bottom: 0; width: 310px; max-width: 88vw; background: #fff; z-index: 1200; display: flex; flex-direction: column; transform: translateX(-100%); transition: transform .32s cubic-bezier(.4,0,.2,1); box-shadow: 4px 0 28px rgba(0,0,0,0.18); overflow: hidden; }
        .g1-drawer.open { transform: translateX(0); }
        .g1-drawer-head { background: #fff; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; border-bottom: 1px solid #f0f0f0; }
        .g1-close-btn { background: #e53935; border: none; cursor: pointer; color: #fff; width: 34px; height: 34px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: background .2s; flex-shrink: 0; }
        .g1-close-btn:hover { background: #c62828; }
        .g1-drawer-icons { display: flex; align-items: center; border-bottom: 1px solid #eee; flex-shrink: 0; }
        .g1-drawer-icon-cell { flex: 1; display: flex; align-items: center; justify-content: center; padding: 16px 10px; cursor: pointer; position: relative; color: #444; border-right: 1px solid #eee; transition: background .2s, color .2s; text-decoration: none; background: none; border-top: none; border-bottom: none; border-left: none;  }
        .g1-drawer-icon-cell:last-child { border-right: none; }
        .g1-drawer-icon-cell:hover { background: #f5faf5; color: #2a7a2a; }
        .g1-drawer-badge { position: absolute; top: 9px; right: calc(50% - 16px); background: #e53935; color: #fff; border-radius: 50%; width: 17px; height: 17px; font-size: 10px; display: flex; align-items: center; justify-content: center; font-weight: 600; }
        .g1-drawer-search { padding: 14px 18px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .g1-search-input { flex: 1; border: 1px solid #ddd; border-radius: 6px; padding: 9px 14px; font-size: 13.5px;  outline: none; color: #333; transition: border-color .2s; }
        .g1-search-input:focus { border-color: #2a7a2a; }
        .g1-search-btn { background: #2a7a2a; border: none; cursor: pointer; color: #fff; width: 38px; height: 38px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background .2s; }
        .g1-search-btn:hover { background: #1e5c1e; }

        .g1-drawer-links { list-style: none; padding: 0; margin: 0; flex: 1; overflow-y: auto; overflow-x: hidden; }
        .g1-drawer-item { border-bottom: 1px solid #f0f0f0; }
        .g1-drawer-item:last-child { border-bottom: none; }
        .g1-drawer-link { display: block; text-decoration: none; color: #222; font-size: 14.5px; font-weight: 500; padding: 14px 22px; transition: background .15s, color .15s; }
        
        /* ── SUB MENU DROPDOWN ── */
        .g1-sub-menu { position: relative; }
        .g1-sub-dropdown { 
          position: absolute; 
          left: 100%; 
          top: -10px; 
          min-width: 260px; 
          background: #fff; 
          box-shadow: 0px 15px 40px rgba(0,0,0,0.12); 
          border-radius: 8px; 
          list-style: none; 
          padding: 10px 0; 
          max-height: 0; 
          overflow: hidden; 
          opacity: 0; 
          pointer-events: none; 
          transition: all 0.25s ease; 
          z-index: 100; 
          border: 1px solid #eaeaea; 
        }
        .g1-sub-menu:hover > .g1-sub-dropdown { max-height: 800px; opacity: 1; pointer-events: auto; transform: translateX(0); overflow: visible; }
        .g1-sub-dropdown { transform: translateX(15px); }
        .g1-sub-drop-link { display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; font-size: 15px; color: #333; font-weight: 700; text-decoration: none; transition: all .2s; }
        .g1-sub-drop-link:hover { background: #f8f9f8; color: #2a7a2a; }
        .g1-sub-drop-link.has-ssc::after { content: '\\276F'; font-size: 11px; margin-left: 8px; opacity: 0.7; font-weight: 400; }

        /* ── SUB-SUB MENU (3rd Level) ── */
        .g1-sss-menu { position: relative; }
        .g1-sss-dropdown { position: absolute; left: 100%; top: -10px; min-width: 200px; background: #fff; box-shadow: 0px 8px 30px rgba(0,0,0,0.12); border-radius: 0 8px 8px 8px; list-style: none; padding: 10px 0; max-height: 0; overflow: hidden; opacity: 0; pointer-events: none; transition: all 0.25s ease; z-index: 105; border: 1px solid #eee; border-top: 3px solid #b39359; }
        .g1-sss-menu:hover > .g1-sss-dropdown { max-height: 500px; opacity: 1; pointer-events: auto; transform: translateX(0); overflow: visible; }
        .g1-sss-dropdown { transform: translateX(10px); }
        .g1-sss-link { display: block; padding: 9px 20px; font-size: 13px; color: #555; font-weight: 500; text-decoration: none; transition: all .2s; }
        .g1-sss-link:hover { background: #fdfaf5; color: #b39359; padding-left: 25px; }

        .active-dot { width: 6px; height: 6px; border-radius: 50%; background: #b39359; margin-right: 8px; display: inline-block; vertical-align: middle; }
        .g1-drawer-link:hover { background: #f5faf5; color: #2a7a2a; }
        .g1-drawer-toggle { display: flex; align-items: center; justify-content: space-between; padding: 14px 22px; cursor: pointer; font-size: 14.5px; font-weight: 500; color: #222; transition: background .15s; user-select: none; }
        .g1-drawer-toggle:hover { background: #f5faf5; }
        .g1-toggle-icon { color: #2a7a2a; font-size: 13px; flex-shrink: 0; }
        .g1-drawer-sub { list-style: none; padding: 0; margin: 0; background: #f9fdf9; border-top: 1px solid #e8f5e8; overflow: hidden; max-height: 0; transition: max-height .3s ease; }
        .g1-drawer-sub.open { max-height: 500px; }
        .g1-drawer-sub-link { display: block; text-decoration: none; color: #444; font-size: 13.5px; padding: 11px 22px 11px 38px; border-bottom: 1px solid #eef5ee; transition: background .15s, color .15s; position: relative; word-break: break-word; }
        .g1-drawer-sub-link::before { content: ''; position: absolute; left: 22px; top: 50%; transform: translateY(-50%); width: 6px; height: 6px; border-radius: 50%; background: #2a7a2a; opacity: .5; }
        .g1-drawer-sub-link:last-child { border-bottom: none; }
        .g1-drawer-sub-link:hover { background: #edf7ed; color: #2a7a2a; }
        .g1-drawer-sub-link:hover::before { opacity: 1; }

        .g1-flex-between { display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
        .g1-drawer-sub-nested { list-style: none; padding: 0; margin: 0; background: #fff; overflow: hidden; max-height: 0; transition: max-height .3s ease; }
        .g1-drawer-sub-nested.open { max-height: 1200px; }
        .g1-drawer-sub-parent { display: flex; align-items: center; justify-content: space-between; padding: 10px 10px 10px 52px; border-bottom: 1px solid #f9f9f9; position: relative; }
        .g1-drawer-sub-parent-link { flex: 1; text-decoration: none; color: #666; font-size: 13px; line-height: 1.2; }
        .g1-drawer-sub-parent-link:hover { color: #2a7a2a; }
        .g1-sub-toggle-btn { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border: none; background: transparent; color: #2a7a2a; cursor: pointer; flex-shrink: 0; }
        .g1-drawer-sub-third { list-style: none; padding: 0; margin: 0; overflow: hidden; max-height: 0; background: #fcfffc; transition: max-height .25s ease; }
        .g1-drawer-sub-third.open { max-height: 600px; }
        .g1-drawer-sub-link-nested { display: block; text-decoration: none; color: #666; font-size: 13px; padding: 10px 22px 10px 52px; border-bottom: 1px solid #f9f9f9; transition: background .15s, color .15s; position: relative; word-break: break-word; }
        .g1-drawer-sub-link-nested::before { content: '-'; position: absolute; left: 38px; top: 50%; transform: translateY(-50%); color: #2a7a2a; opacity: .5; }
        .g1-drawer-sub-link-nested:hover { background: #fdfdfd; color: #2a7a2a; }
        .g1-drawer-sub-link-third { display: block; text-decoration: none; color: #5d6b5d; font-size: 12.5px; padding: 9px 22px 9px 70px; border-bottom: 1px solid #f3f7f3; position: relative; }
        .g1-drawer-sub-link-third::before { content: ''; position: absolute; left: 56px; top: 50%; transform: translateY(-50%); width: 5px; height: 5px; border-radius: 50%; background: #b39359; opacity: .8; }
        .g1-drawer-sub-link-third:hover { background: #f7fbf7; color: #2a7a2a; }

        .g1-drawer-footer { padding: 16px 18px; border-top: 1px solid #eee; flex-shrink: 0; }
        .g1-loginn { text-decoration: none; color: #222; font-weight: 500; font-size: 14px; border-radius: 4px; transition: color .2s, background .2s; white-space: nowrap; }
        .g1-drawer-login { display: block; text-align: center; background: #2a7a2a; color: #fff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px; border-radius: 6px; transition: background .2s; }
        .g1-drawer-login:hover { background: #1e5c1e; }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .g1-link, .g1-dd-btn { font-size: 13px; padding: 6px 8px; }
          .g1-links { gap: 2px; }
          .g1-container { padding: 0 24px; }
        }
        @media (max-width: 820px) {
          .g1-topbar { display: none !important; }
          .g1-nav-links-col { display: none; }
          .g1-nav-right-col { display: none; }
          .g1-nav-logo-col { width: auto; flex: 1; padding: 0 12px; }
          .g1-burger { display: flex; }
          .g1-container { padding: 0 18px; }
          .g1-nav-row { min-height: 64px; }
        }
        @media (max-width: 480px) {
          .g1-container { padding: 0 12px; }
          .g1-nav-row { min-height: 56px; }
          .g1-nav-logo-col { padding: 0 8px; }
          .g1-logo img { height: 40px !important; }
          .g1-burger { padding: 4px; margin-left: 8px; gap: 4px; }
          .g1-burger-line { width: 20px; height: 2px; }
          .g1-drawer { width: 100%; max-width: 85vw; }
          .g1-drawer-head { padding: 10px 12px; gap: 8px; }
          .g1-close-btn { width: 30px; height: 30px; font-size: 12px; }
          .g1-drawer-icons { padding: 0; }
          .g1-drawer-icon-cell { padding: 10px 6px; font-size: 10px; gap: 4px; }
          .g1-drawer-search { padding: 8px 10px; gap: 6px; }
          .g1-search-input { padding: 6px 8px; font-size: 11px; }
          .g1-search-btn { width: 32px; height: 32px; font-size: 11px; }
          .g1-drawer-link { padding: 10px 14px; font-size: 13px; }
          .g1-drawer-toggle { padding: 10px 14px; font-size: 13px; gap: 8px; }
          .g1-toggle-icon { font-size: 12px; }
          .g1-drawer-sub-link { padding: 8px 14px 8px 28px; font-size: 12px; }
          .g1-drawer-sub-nested.open { max-height: 250px; }
          .g1-drawer-sub-link-nested { padding: 8px 14px 8px 40px; font-size: 12px; }
          .g1-drawer-footer { padding: 8px 10px; }
          .g1-drawer-login { padding: 8px; font-size: 12px; }
        }

        /* ── DRAWER RESPONSIVENESS ── */
        .g1-drawer { width: 320px; }
        
        @media (max-width: 768px) {
          .g1-drawer { width: 300px; max-width: 80vw; }
          .g1-drawer-head { padding: 14px 16px; }
          .g1-close-btn { width: 32px; height: 32px; font-size: 13px; }
          .g1-drawer-icons { border-bottom: 1px solid #eee; }
          .g1-drawer-icon-cell { padding: 13px 8px; font-size: 10px; }
          .g1-drawer-search { padding: 12px 14px; gap: 8px; }
          .g1-search-input { padding: 8px 11px; font-size: 12.5px; }
          .g1-search-btn { width: 35px; height: 35px; font-size: 12px; }
          .g1-drawer-link { padding: 12px 18px; font-size: 13.5px; }
          .g1-drawer-toggle { padding: 12px 18px; font-size: 13.5px; }
          .g1-drawer-sub-link { padding: 9px 16px 9px 32px; font-size: 12.5px; }
          .g1-drawer-sub-nested.open { max-height: 400px; }
          .g1-drawer-sub-link-nested { padding: 9px 16px 9px 48px; font-size: 12px; }
          .g1-drawer-footer { padding: 12px 14px; }
          .g1-drawer-login { padding: 10px; font-size: 12px; }
        }
        
        @media (max-width: 600px) {
          .g1-drawer { width: 280px; max-width: 75vw; }
          .g1-drawer-search { padding: 12px 14px; gap: 8px; }
          .g1-search-input { padding: 8px 12px; font-size: 13px; }
          .g1-search-btn { width: 36px; height: 36px; font-size: 12px; }
        }

        @media (max-width: 480px) {
          .g1-drawer { width: 100%; max-width: 85vw; }
          .g1-drawer-head { padding: 12px 16px; }
          .g1-close-btn { width: 32px; height: 32px; font-size: 13px; }
          .g1-drawer-icons { gap: 0; }
          .g1-drawer-icon-cell { padding: 12px 8px; font-size: 11px; }
          .g1-drawer-search { padding: 10px 5px; }
          .g1-search-input { padding: 8px 10px; font-size: 12px; }
          .g1-search-btn { width: 34px; height: 34px; }
          .g1-drawer-link { padding: 12px 16px; font-size: 14px; }
          .g1-drawer-toggle { padding: 12px 16px; font-size: 14px; }
          .g1-drawer-sub-link { padding: 10px 18px 10px 32px; font-size: 13px; }
          .g1-drawer-footer { padding: 12px 14px; }
          .g1-drawer-login { padding: 10px; font-size: 13px; }
        }

        /* ── BADGE RESPONSIVENESS ── */
        @media (max-width: 480px) {
          .g1-badge { width: 16px; height: 16px; font-size: 10px; top: -4px; right: -8px; }
          .g1-drawer-badge { width: 15px; height: 15px; font-size: 9px; top: 6px; right: calc(50% - 14px); }
        }

        /* ── DROPDOWN POSITIONING ── */
        @media (max-width: 768px) {
          .g1-dropdown { min-width: 240px; left: -50px; }
          .g1-sub-dropdown { min-width: 220px; left: 100%; }
        }

        @media (max-width: 480px) {
          .g1-dropdown { min-width: 200px; left: -80px; padding: 8px 0; }
          .g1-drop-link { padding: 12px 18px; font-size: 14px; }
          .g1-user-dropdown { min-width: 150px; right: -20px; }
          .g1-user-drop-link { padding: 8px 16px; font-size: 13px; }
          .g1-user-logout-btn { padding: 8px 16px; font-size: 13px; }
        }

        /* ── SEARCH BAR ── */
        .g1-search-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .g1-search-expandable {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          opacity: 0;
          visibility: hidden;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 30px;
          height: 40px;
          padding: 0 15px;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          z-index: 10;
        }
        .g1-search-expandable.open {
          width: 280px;
          opacity: 1;
          visibility: visible;
          right: -10px;
        }
        .g1-search-input-field {
          flex: 1;
          border: none;
          outline: none;
          font-size: 14px;
          background: transparent;
          color: #333;
        }
        .g1-search-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #888;
          padding: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }
        .g1-search-close:hover { color: #2a7a2a; }
        
        @media (max-width: 1100px) {
          .g1-search-expandable.open { width: 200px; }
        }
      `}</style>

      <div className="g1-root">

        {/* ── TOPBAR ── */}
        <div className="g1-topbar">
          <div className="g1-container">
            <div className="g1-row">
              <div className="g1-col-7">
                <div className="g1-topbar-left">
                  <a className="set-call" href="tel:+919910198952"><img src="../images/phone-alt-soli.svg" alt="" /> +919910198952</a>
                  <a href="mailto:info@gen1eco.com"><i className="fas fa-envelope-open-text" aria-hidden="true"></i> info@gen1eco.com</a>
                </div>
              </div>
              <div className="g1-col-5">
                <div className="g1-topbar-right">
                  <a href="#!" className="g1-social"><FaFacebookF size={15} /></a>
                  <a href="#!" className="g1-social"><FaInstagram size={15} /></a>
                  <a href="#!" className="g1-social"><FaYoutube size={15} /></a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN NAV ── */}
        <nav className={`g1-nav${scrolled ? " scrolled" : ""}`}>
          <div className="g1-container">
            <div className="g1-row g1-nav-row">

              {/* Logo */}
              <div className="g1-col-2 g1-nav-logo-col">
                <Link className="g1-logo" to="/">
                  <img alt="Logo" src="/images/about_check.png" style={{ height: 48 }} />
                </Link>
              </div>

              {/* Links */}
              <div className="g1-col-7 g1-nav-links-col">
                <ul className="g1-links">
                  <li><Link className="g1-link" to="/">Home</Link></li>
                  <li><span className="divider">|</span></li>
                  
                  <li className="g1-sub-menu g1-dd-wrap" ref={dropdownRef} onMouseEnter={() => setShopOpen(true)} onMouseLeave={() => setShopOpen(false)}>
                    <Link className="g1-dd-btn" to="/products">
                      Product
                    </Link>
                    {shopOpen && categories.length > 0 && (
                      <ul className="g1-dropdown">
                        {categories.map((cat) => (
                          <li key={cat.id} className={cat.subCategories?.length > 0 ? "g1-sub-menu" : ""}>
                            <Link to={`/products?category=${normalizeSlug(cat.slug || cat.name)}`} onClick={() => setShopOpen(false)} className={`g1-drop-link ${cat.subCategories?.length > 0 ? 'has-sub' : ''}`}>
                              {cat.name}
                            </Link>
                            {cat.subCategories?.length > 0 && (
                              <ul className="g1-sub-dropdown">
                                {cat.subCategories.map(sub => (
                                  <li key={sub.id || sub.slug || sub.name} className={sub.subSubCategories?.length > 0 ? "g1-sss-menu" : ""}>
                                    <Link to={`/products?category=${normalizeSlug(cat.slug || cat.name)}&subcategory=${normalizeSlug(sub.slug || sub.name)}`} onClick={() => setShopOpen(false)} className={`g1-sub-drop-link ${sub.subSubCategories?.length > 0 ? 'has-ssc' : ''}`}>
                                      {sub.name}
                                    </Link>
                                    {sub.subSubCategories?.length > 0 && (
                                      <ul className="g1-sss-dropdown">
                                        {sub.subSubCategories.map(ssc => (
                                          <li key={ssc.id || ssc.slug || ssc.name}>
                                            <Link to={`/products?category=${normalizeSlug(cat.slug || cat.name)}&subcategory=${normalizeSlug(sub.slug || sub.name)}&subsubcategory=${normalizeSlug(ssc.slug || ssc.name)}`} onClick={() => setShopOpen(false)} className="g1-sss-link">
                                              <span className="active-dot"></span>{ssc.name}
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                  
                  <li><span className="divider">|</span></li>
                  <li><a className="g1-link" href="/#new-arrivals">New Arrival</a></li>
                  <li><span className="divider">|</span></li>
                  <li><Link className="g1-link" to="/contact">Contact Us</Link></li>
                </ul>
              </div>

              {/* Right actions */}
              <div className="g1-col-3 g1-nav-right-col">
                <div className="g1-right">

                  {/* Search */}
                  <div className="g1-search-wrap" ref={searchInputRef}>
                    <button
                      className="g1-icon"
                      onClick={() => setSearchOpen(!searchOpen)}
                      aria-label="Toggle search"
                      title="Search"
                    >
                      <FaSearch size={19} />
                    </button>
                    <form
                      className={`g1-search-expandable ${searchOpen ? 'open' : ''}`}
                      onSubmit={handleSearch}
                    >
                      <input
                        type="text"
                        className="g1-search-input-field"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus={searchOpen}
                      />
                      <button type="submit" style={{ display: 'none' }} />
                      <button
                        type="button"
                        className="g1-search-close"
                        onClick={() => setSearchOpen(false)}
                      >
                        <FaTimes size={14} />
                      </button>
                    </form>
                  </div>

                  {/* Wishlist */}
                  <button
                    className="g1-icon"
                    title="Wishlist"
                    aria-label="Wishlist"
                    onClick={() => { closeDrawer(); setWishlistOpen(true); }}
                  >
                    <FaHeart size={20} />
                    <span className="g1-badge">{wishlist.length}</span>
                  </button>

                  {/* ✅ Cart — opens sidebar */}
                  <button
                    className="g1-icon"
                    title="Cart"
                    aria-label="Open cart"
                    onClick={openCart}
                  >
                    <FaShoppingCart size={22} />
                    <span className="g1-badge">{totalItems}</span>
                  </button>

                  {/* Login / Register or User Info */}
                  {user ? (
                    <div className="g1-user-wrap" ref={userMenuRef} onClick={() => setUserMenuOpen(!userMenuOpen)}>
                      <div className="g1-user-avatar" style={{ overflow: 'hidden' }}>
                        {user?.photo ? (
                          <img
                            src={`${process.env.REACT_APP_API_URL}/uploads/users/${user.photo}`}
                            alt="User"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <FaUser size={16} />
                        )}
                      </div>


                      <span className="g1-user-name">{user.name.split(' ')[0]}</span>
                      {userMenuOpen && (
                        <ul className="g1-user-dropdown">
                          <li>
                            <Link to="/dashboard" className="g1-user-drop-link" onClick={() => setUserMenuOpen(false)}>
                              My Account
                            </Link>
                          </li>
                          <li>
                            <button className="g1-user-logout-btn" onClick={() => { logout(flushToServer); setUserMenuOpen(false); }}>
                              Logout
                            </button>
                          </li>
                        </ul>
                      )}
                    </div>
                  ) : (
                    <div className="auth-links g1-link g1-login">
                      <Link className="g1-loginn" to="/login">Login</Link>
                      <span className="divider"> / </span>
                      <Link className="g1-loginn" to="/register">Register</Link>
                    </div>
                  )}

                </div>
              </div>

              {/* Burger */}
              <button className="g1-burger" aria-label="Open navigation menu" onClick={() => setDrawerOpen(true)}>
                <span className="g1-burger-line" />
                <span className="g1-burger-line" />
                <span className="g1-burger-line" />
              </button>

            </div>
          </div>
        </nav>

        {/* Mobile overlay */}
        <div className={`g1-overlay${drawerOpen ? " show" : ""}`} onClick={closeDrawer} />

        {/* Mobile drawer */}
        <div className={`g1-drawer${drawerOpen ? " open" : ""}`} role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="g1-drawer-head">
            <Link className="g1-logo" to="/" onClick={closeDrawer}>
              <img alt="Logo" src="/images/about_check.png" style={{ height: 38 }} />
            </Link>
            <button className="g1-close-btn" onClick={closeDrawer} aria-label="Close menu">
              <FaTimes />
            </button>
          </div>

          <div className="g1-drawer-icons">
            <button
              className="g1-drawer-icon-cell"
              title="Wishlist"
              aria-label="Wishlist"
              style={{ borderRight: "1px solid #eee" }}
              onClick={() => { closeDrawer(); setWishlistOpen(true); }}
            >
              <FaHeart size={19} />
              <span className="g1-drawer-badge">{wishlist.length}</span>
            </button>
            {/* ✅ Mobile cart button — opens sidebar */}
            <button
              className="g1-drawer-icon-cell"
              title="Cart"
              aria-label="Open cart"
              onClick={openCart}
              style={{ borderRight: "1px solid #eee" }}
            >
              <FaShoppingCart size={19} />
              <span className="g1-drawer-badge">{totalItems}</span>
            </button>
            <Link to={user ? "/dashboard" : "/login"} className="g1-drawer-icon-cell" onClick={closeDrawer} title="Account" aria-label="Account">
              <FaUser size={18} />
            </Link>
          </div>

          <form className="g1-drawer-search" onSubmit={handleSearch}>
            <input
              type="text"
              className="g1-search-input"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="g1-search-btn" aria-label="Search"><FaSearch size={13} /></button>
          </form>



          <ul className="g1-drawer-links">
            <li className="g1-drawer-item"><Link to="/" className="g1-drawer-link" onClick={closeDrawer}>Home</Link></li>
            
            <li className="g1-drawer-item">
              <div className="g1-drawer-toggle" onClick={() => setMobileShopOpen(!mobileShopOpen)}>
                Product
                <span className="g1-toggle-icon">{mobileShopOpen ? <FaMinus size={12} /> : <FaPlus size={12} />}</span>
              </div>
              <ul className={`g1-drawer-sub ${mobileShopOpen ? "open" : ""}`}>
                <li><Link to="/products" className="g1-drawer-sub-link" onClick={closeDrawer}>All Products</Link></li>
                {categories.map(cat => {
                  const catKey = cat.id || cat.slug || cat.name;
                  const catOpen = !!mobileCatToggles[catKey];

                  return (
                    <li key={catKey}>
                      {cat.subCategories?.length > 0 ? (
                        <>
                          <div className="g1-flex-between g1-drawer-sub-link" onClick={() => toggleMobileCat(catKey)}>
                            <Link to={`/products?category=${normalizeSlug(cat.slug || cat.name)}`} onClick={closeDrawer} style={{ flex: 1, textDecoration: 'none', color: 'inherit' }}>{cat.name}</Link>
                            <span className="g1-toggle-icon" style={{ padding: '0 10px', height: '100%', display: 'flex', alignItems: 'center' }}>
                              {catOpen ? <FaMinus size={10} /> : <FaPlus size={10} />}
                            </span>
                          </div>
                          <ul className={`g1-drawer-sub-nested ${catOpen ? 'open' : ''}`}>
                            {cat.subCategories.map(sub => {
                              const subKey = sub.id || sub.slug || sub.name;
                              const subToggleKey = `${catKey}__${subKey}`;
                              const subOpen = !!mobileSubToggles[subToggleKey];

                              return (
                                <li key={subKey}>
                                  {sub.subSubCategories?.length > 0 ? (
                                    <>
                                      <div className="g1-drawer-sub-parent">
                                        <Link to={`/products?category=${normalizeSlug(cat.slug || cat.name)}&subcategory=${normalizeSlug(sub.slug || sub.name)}`} className="g1-drawer-sub-parent-link" onClick={closeDrawer}>
                                          {sub.name}
                                        </Link>
                                        <button
                                          type="button"
                                          className="g1-sub-toggle-btn"
                                          aria-label={subOpen ? "Collapse sub category" : "Expand sub category"}
                                          onClick={() => toggleMobileSub(subToggleKey)}
                                        >
                                          {subOpen ? <FaMinus size={9} /> : <FaPlus size={9} />}
                                        </button>
                                      </div>
                                      <ul className={`g1-drawer-sub-third ${subOpen ? 'open' : ''}`}>
                                        {sub.subSubCategories.map(ssc => (
                                          <li key={ssc.id || ssc.slug || ssc.name}>
                                            <Link
                                              to={`/products?category=${normalizeSlug(cat.slug || cat.name)}&subcategory=${normalizeSlug(sub.slug || sub.name)}&subsubcategory=${normalizeSlug(ssc.slug || ssc.name)}`}
                                              className="g1-drawer-sub-link-third"
                                              onClick={closeDrawer}
                                            >
                                              {ssc.name}
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                    </>
                                  ) : (
                                    <Link to={`/products?category=${normalizeSlug(cat.slug || cat.name)}&subcategory=${normalizeSlug(sub.slug || sub.name)}`} className="g1-drawer-sub-link-nested" onClick={closeDrawer}>{sub.name}</Link>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </>
                      ) : (
                        <Link to={`/products?category=${normalizeSlug(cat.slug || cat.name)}`} className="g1-drawer-sub-link" onClick={closeDrawer}>{cat.name}</Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>

            <li className="g1-drawer-item"><a href="/#new-arrivals" className="g1-drawer-link" onClick={closeDrawer}>New Arrival</a></li>
            <li className="g1-drawer-item"><Link to="/contact" className="g1-drawer-link" onClick={closeDrawer}>Contact Us</Link></li>
          </ul>

          <div className="g1-drawer-footer">
            {user ? (
              <button
                className="g1-drawer-login"
                onClick={() => { logout(flushToServer); closeDrawer(); }}
                style={{ width: '100%', border: 'none' }}
              >
                Logout ({user.name.split(' ')[0]})
              </button>
            ) : (
              <Link to="/login" className="g1-drawer-login" onClick={closeDrawer}>Login / Register</Link>
            )}
          </div>
        </div>

        {/* ✅ MyCart sidebar panel */}
        <MyCart
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
        />

        {/* ✅ Wishlist sidebar panel */}
        <Wishlist
          isOpen={wishlistOpen}
          onClose={() => setWishlistOpen(false)}
        />

      </div>
    </>
  );
};

export default Navbar;