import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeroBanner from "./HeroBanner";
import Order from "./Order";
import ReturnPolicy from "./ReturnPolicy";
import Personalinfo from "./Personalinfo";
import Address from "./Address";
import DashboardWishlist from "./DashboardWishlist";
import ChangePassword from "./ChangePassword";
import UserCoupons from "./UserCoupons";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import api from "../api/axios";

const menuItems = {
  dashboard: [
    {
      id: "overview", label: "Overview", icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
        </svg>
      )
    },
    {
      id: "order", label: "Order", icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
      )
    },
    {
      id: "return", label: "Return Policy", icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9.75h4.875a2.625 2.625 0 0 1 0 5.25H12M8.25 9.75 10.5 7.5M8.25 9.75 10.5 12m9-7.243V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185Z" />
        </svg>
      )
    }
  ],
  account: [
    {
      id: "profile", label: "Personal Info", icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      )
    },
    {
      id: "address", label: "Address", icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
      )
    },
    {
      id: "wishlist", label: "Wishlist", icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
      )
    },
    {
      id: "password", label: "Change Password", icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      )
    },
    {
      id: "coupons", label: "My Coupons", icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
        </svg>
      )
    },
    {
      id: "logout", label: "Logout", icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
        </svg>
      )
    }
  ]
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { flushToServer, wishlist } = useCart();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("overview");
  // sidebarOpen state removed as sidebar is now permanent on mobile
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    canceledOrders: 0,
    totalWishlist: 0,
    totalReviews: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (activeMenu === "overview") {
      fetchDashboardData();
    }
  }, [activeMenu]);

  const fetchDashboardData = async () => {
    setStatsLoading(true);
    try {
      const response = await api.get('/users/profile/stats');
      if (response.data.success) {
        setStats(response.data.stats);
        setRecentOrders(response.data.recentOrders || []);
        setRecentReviews(response.data.recentReviews || []);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const map = {
      'PENDING': { bg: '#fff3e0', color: '#e65100' },
      'CONFIRMED': { bg: '#e8f5e9', color: '#2e7d32' },
      'PROCESSING': { bg: '#f3e5f5', color: '#7b1fa2' },
      'SHIPPED': { bg: '#e3f2fd', color: '#0277bd' },
      'DELIVERED': { bg: '#e8f5e9', color: '#1b5e20' },
      'CANCELLED': { bg: '#fdecea', color: '#c62828' },
      'RETURNED': { bg: '#fafafa', color: '#616161' },
    };
    return map[status] || { bg: '#f5f5f5', color: '#888' };
  };

  const handleMenuClick = async (id) => {
    if (id === "logout") {
      await logout(flushToServer);
      navigate("/");
      return;
    }
    setActiveMenu(id);
  };

  const overviewDisplay = [
    {
      id: "total", label: "Total Orders", value: stats.totalOrders || 0, iconBg: "#0aa848", bg: "#0aa84812", icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 18 4.5H6a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 6 18.75h.75m3 3H15M9 3.75h3" />
        </svg>
      )
    },
    {
      id: "completed", label: "Completed Orders", value: stats.completedOrders || 0, iconBg: "#66aaee", bg: "#66aaee1f", icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      )
    },
    {
      id: "pending", label: "Pending Orders", value: stats.pendingOrders || 0, iconBg: "#1e3922", bg: "#1e392212", icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      )
    },
    {
      id: "canceled", label: "Canceled Orders", value: stats.canceledOrders || 0, iconBg: "#d9534f", bg: "#d9534f12", icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      )
    },
    {
      id: "wishlist", label: "Total Wishlist", value: wishlist?.length || 0, iconBg: "#800080", bg: "#80008012", icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
      )
    },
    {
      id: "reviews", label: "Total Reviews", value: stats.totalReviews || 0, iconBg: "#a08d6d", bg: "#a08d6d12", icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.563.563 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.499Z" />
        </svg>
      )
    }
  ];

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {  background: #f5f5f5; }
        .db-wrapper { display: flex; min-height: 100vh; background: #f0f2f5; padding: 30px 20px; gap: 24px; max-width: 1400px; margin: 0 auto; }
        .db-hamburger { display: none; }
        .db-sidebar { width: 280px; flex-shrink: 0; background: #fff; border-radius: 14px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden; align-self: flex-start; position: sticky; top: 30px; }
        .db-user { padding: 32px 24px 24px; text-align: center; border-bottom: 1px solid #f0f0f0; }
        .db-user-avatar-placeholder { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #AB9774 0%, #8f7d60 100%); display: flex; align-items: center; justify-content: center; font-size: 32px; color: #fff; font-weight: 700; margin: 0 auto 15px; }
        .db-nav { padding: 8px 0 16px; }
        .db-nav-section-label { font-size: 11px; font-weight: 700; letter-spacing: 1.2px; color: #AB9774; text-transform: uppercase; padding: 14px 24px 6px; }
        .db-nav-item { display: flex; align-items: center; gap: 10px; padding: 11px 24px; font-size: 14px; color: #555; cursor: pointer; transition: all 0.2s; border: none; background: none; width: 100%; text-align: left; border-left: 3px solid transparent; }
        .db-nav-item.active { color: #AB9774; font-weight: 600; border-left-color: #AB9774; background: #faf8f5; }
        .db-nav-item svg { width: 18px; height: 18px; }
        .db-main { flex: 1; min-width: 0; }
        .db-content { background: #fff; border-radius: 14px; padding: 30px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); }

        /* Stats Cards */
        .db-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
        .db-card { display: flex; align-items: center; gap: 16px; padding: 25px 20px; border-radius: 12px; }
        .db-card-icon { width: 56px; height: 56px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; }
        .db-card-icon svg { width: 28px; height: 28px; }
        .db-card-info h3 { font-size: 28px; font-weight: 700; color: #1a1a1a; margin: 0; }
        .db-card-info span { font-size: 14px; color: #666; font-weight: 500; }

        /* Skeleton Loading */
        .db-skeleton { border-radius: 12px; overflow: hidden; }
        .db-skeleton-inner { height: 88px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 12px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* Section headers */
        .db-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; }
        .db-recent-title { font-size: 18px; font-weight: 700; color: #222; margin: 0; }
        .db-view-all-btn { background: none; border: 1px solid #AB9774; color: #AB9774; padding: 5px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .db-view-all-btn:hover { background: #AB9774; color: #fff; }

        /* Recent Orders Table */
        .db-recent-table { width: 100%; border-collapse: collapse; }
        .db-recent-table th { text-align: left; padding: 10px 12px; background: #fafafa; font-size: 12px; font-weight: 700; color: #888; border-bottom: 1.5px solid #eee; text-transform: uppercase; letter-spacing: 0.5px; }
        .db-recent-table td { padding: 12px; border-bottom: 1px solid #f5f5f5; font-size: 13px; color: #444; vertical-align: middle; }
        .db-recent-table tr:last-child td { border-bottom: none; }
        .db-order-num { font-weight: 700; color: #1a1a1a; }
        .db-status-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; display: inline-block; }

        /* Empty States */
        .db-empty-state { background: #fffbe6; border: 1px solid #ffe58f; padding: 15px 20px; border-radius: 8px; color: #856404; font-size: 14px; text-align: center; }
        .db-empty-state-reviews { padding: 20px 0; color: #aaa; font-size: 14px; text-align: center; }

        /* Reviews */
        .db-review-item { padding: 10px 0; border-bottom: 1px solid #f5f5f5; font-size: 13px; color: #555; }
        .db-review-item:last-child { border-bottom: none; }

        /* Welcome Banner */
        .db-welcome { background: linear-gradient(135deg, #AB9774 0%, #8f7d60 100%); border-radius: 12px; padding: 22px 28px; margin-bottom: 24px; color: #fff; display: flex; align-items: center; justify-content: space-between; }
        .db-welcome h2 { font-size: 20px; font-weight: 700; margin: 0 0 4px; }
        .db-welcome p { font-size: 13px; opacity: 0.85; margin: 0; }
        .db-welcome-icon { font-size: 48px; opacity: 0.25; }

        /* Responsive Dashboard */
        @media (max-width: 1024px) { 
          .db-cards { grid-template-columns: repeat(2, 1fr); }
          .db-wrapper { gap: 20px; padding: 24px 16px; }
          .db-content { padding: 24px; }
          .db-card-info h3 { font-size: 24px; }
        }

        @media (max-width: 768px) { 
          .db-wrapper { flex-direction: column; padding: 16px 12px; gap: 16px; }
          .db-sidebar { width: 100%; position: static; margin-bottom: 0; border-radius: 12px; } 
          .db-cards { grid-template-columns: 1fr; gap: 12px; margin-bottom: 20px; }
          .db-card { padding: 16px 14px; gap: 12px; }
          .db-card-icon { width: 48px; height: 48px; }
          .db-card-icon svg { width: 24px; height: 24px; }
          .db-card-info h3 { font-size: 20px; }
          .db-card-info span { font-size: 12px; }
          .db-welcome { flex-direction: column; gap: 10px; text-align: center; padding: 18px 20px; margin-bottom: 18px; }
          .db-welcome h2 { font-size: 18px; }
          .db-welcome-icon { font-size: 36px; }
          .db-content { padding: 18px 14px; border-radius: 10px; }
          .db-recent-table th { font-size: 11px; padding: 8px 10px; }
          .db-recent-table td { padding: 10px; font-size: 12px; }
        }

        @media (max-width: 600px) {
          .db-wrapper { padding: 12px 8px; gap: 12px; }
          .db-sidebar { border-radius: 10px; }
          .db-user { padding: 20px 16px 16px; }
          .db-user-avatar-placeholder { width: 64px; height: 64px; font-size: 24px; margin: 0 auto 12px; }
          .db-nav-section-label { font-size: 10px; padding: 10px 16px 4px; }
          .db-nav-item { padding: 10px 16px; font-size: 13px; gap: 8px; }
          .db-nav-item svg { width: 16px; height: 16px; }
          .db-content { padding: 12px 12px; }
          .db-section-header { margin-bottom: 12px; }
          .db-recent-title { font-size: 16px; }
          .db-view-all-btn { padding: 4px 10px; font-size: 12px; }
          .db-recent-table { font-size: 11px; }
          .db-recent-table th { padding: 6px 8px; font-size: 10px; }
          .db-recent-table td { padding: 8px; }
        }

        @media (max-width: 480px) {
          .db-wrapper { padding: 8px 6px; }
          .db-sidebar { border-radius: 8px; }
          .db-user { padding: 16px 12px 12px; }
          .db-user-avatar-placeholder { width: 56px; height: 56px; font-size: 20px; margin: 0 auto 8px; }
          .db-user h3 { font-size: 14px; margin-bottom: 2px; }
          .db-user p { font-size: 11px; }
          .db-nav-section-label { font-size: 9px; padding: 8px 12px 3px; letter-spacing: 0.8px; }
          .db-nav-item { padding: 8px 12px; font-size: 12px; gap: 6px; }
          .db-nav-item svg { width: 14px; height: 14px; }
          .db-cards { gap: 8px; margin-bottom: 12px; }
          .db-card { padding: 12px 10px; gap: 10px; border-radius: 10px; }
          .db-card-icon { width: 40px; height: 40px; border-radius: 8px; }
          .db-card-icon svg { width: 20px; height: 20px; }
          .db-card-info h3 { font-size: 18px; }
          .db-content { padding: 10px; border-radius: 8px; }
          .db-welcome { padding: 12px 14px; margin-bottom: 12px; }
          .db-welcome h2 { font-size: 15px; }
          .db-welcome-icon { font-size: 28px; }
          .db-recent-title { font-size: 14px; }
          .db-recent-table { font-size: 10px; }
          .db-recent-table th { padding: 4px 6px; font-size: 9px; }
          .db-recent-table td { padding: 6px; }
        }
      `}</style>

      <HeroBanner title="My Account" breadcrumbs={[{ label: "Home", href: "/" }, { label: "My Account" }]} />

      <div className="db-wrapper">
        <aside className="db-sidebar">
          <div className="db-user">
            <div className="db-user-avatar-placeholder" style={{ overflow: 'hidden' }}>
              {user?.photo ? (
                <img
                  src={`${process.env.REACT_APP_API_URL}/uploads/users/${user.photo}`}
                  alt="Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>


            <h3 className="h6 mb-0 fw-bold">{user?.name || 'User'}</h3>
            <p className="small text-muted mb-0">{user?.email}</p>
          </div>
          <nav className="db-nav">
            <div className="db-nav-section-label">Main</div>
            {menuItems.dashboard.map(item => (
              <button key={item.id} className={`db-nav-item ${activeMenu === item.id ? 'active' : ''}`} onClick={() => handleMenuClick(item.id)}>
                {item.icon} {item.label}
              </button>
            ))}
            <div className="db-nav-section-label">Account</div>
            {menuItems.account.map(item => (
              <button key={item.id} className={`db-nav-item ${activeMenu === item.id ? 'active' : ''}`} onClick={() => handleMenuClick(item.id)}>
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="db-main">
          {activeMenu === "overview" && (
            <div className="db-content">

              {/* Welcome Banner */}
              <div className="db-welcome">
                <div>
                  <h2>Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋</h2>
                  <p>Here's a quick overview of your account activity.</p>
                </div>
                <div className="db-welcome-icon">🛍️</div>
              </div>

              {/* Stats Cards */}
              <div className="db-cards">
                {statsLoading
                  ? Array(6).fill(0).map((_, i) => (
                    <div key={i} className="db-skeleton">
                      <div className="db-skeleton-inner" />
                    </div>
                  ))
                  : overviewDisplay.map(card => (
                    <div key={card.id} className="db-card" style={{ background: card.bg }}>
                      <div className="db-card-icon" style={{ background: card.iconBg }}>{card.icon}</div>
                      <div className="db-card-info">
                        <h3>{card.value}</h3>
                        <span>{card.label}</span>
                      </div>
                    </div>
                  ))
                }
              </div>

              {/* Recent Orders */}
              <div className="mb-4">
                <div className="db-section-header">
                  <h4 className="db-recent-title">Recent Orders</h4>
                  <button className="db-view-all-btn" onClick={() => handleMenuClick('order')}>View All</button>
                </div>
                {statsLoading ? (
                  <div className="db-skeleton"><div className="db-skeleton-inner" style={{ height: 80 }} /></div>
                ) : recentOrders.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="db-recent-table">
                      <thead>
                        <tr>
                          <th>Order #</th>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map(order => {
                          const sc = getStatusColor(order.order_status);
                          return (
                            <tr key={order.id}>
                              <td><span className="db-order-num">{order.order_number || `#${order.id}`}</span></td>
                              <td>{new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                              <td><strong>₹{Number(order.total_amount).toLocaleString('en-IN')}</strong></td>
                              <td>
                                <span className="db-status-badge" style={{ background: sc.bg, color: sc.color }}>
                                  {order.order_status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="db-empty-state">
                    🛒 No orders yet. Start shopping!
                  </div>
                )}
              </div>

              {/* Recent Reviews */}
              <div>
                <div className="db-section-header">
                  <h4 className="db-recent-title">Recent Reviews</h4>
                </div>
                {statsLoading ? (
                  <div className="db-skeleton"><div className="db-skeleton-inner" style={{ height: 60 }} /></div>
                ) : recentReviews.length > 0 ? (
                  <div>
                    {recentReviews.map(review => (
                      <div key={review.id} className="db-review-item">
                        <span>{review.comment}</span>
                        <span style={{ marginLeft: 10, color: '#f5a623', fontWeight: 700 }}>{'⭐'.repeat(review.rating)} ({review.rating}/5)</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="db-empty-state-reviews">✍️ No reviews submitted yet.</div>
                )}
              </div>

            </div>
          )}

          {activeMenu === "order" && <Order />}
          {activeMenu === "profile" && <Personalinfo />}
          {activeMenu === "address" && <Address />}
          {activeMenu === "wishlist" && <DashboardWishlist />}
          {activeMenu === "password" && <ChangePassword />}
          {activeMenu === "coupons" && <UserCoupons />}
          {activeMenu === "return" && <ReturnPolicy />}
        </main>
      </div>
    </>
  );
}