import { useState } from "react";
import UserSidebar from "../components/UserSidebar";
import Overview from "../components/dashboard/Overview";
import Orders from "../components/dashboard/Orders";
import ReturnPolicy from "../components/dashboard/ReturnPolicy";
import PersonalInfo from "../components/dashboard/PersonalInfo";
import Address from "../components/dashboard/Address";
import Wishlist from "../components/dashboard/Wishlist";
import ChangePassword from "../components/dashboard/ChangePassword";

const PAGES = {
  "overview":        Overview,
  "orders":          Orders,
  "return-policy":   ReturnPolicy,
  "personal-info":   PersonalInfo,
  "address":         Address,
  "wishlist":        Wishlist,
  "change-password": ChangePassword,
};

const TITLES = {
  "overview":        "Overview",
  "orders":          "My Orders",
  "return-policy":   "Return Policy",
  "personal-info":   "Personal Info",
  "address":         "My Addresses",
  "wishlist":        "Wishlist",
  "change-password": "Change Password",
};

const UserDashboard = () => {
  const [activePage, setActivePage] = useState("overview");
  const [user, setUser] = useState({
    name:      "Demo",
    email:     "demo@gmail.com",
    photo:     null,
    firstName: "Demo",
    lastName:  "",
    phone:     "",
    dob:       "",
    gender:    "",
  });

  const PageComponent = PAGES[activePage] || Overview;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <style>{`

        *, *::before, *::after { box-sizing: border-box; }
        .db-hero {
          background: linear-gradient(135deg, #1a4d2e 0%, #253D4E 100%);
          padding: 48px 40px 28px;
          text-align: center;
        }
        .db-body {
          display: flex;
          gap: 28px;
          padding: 32px 40px;
          max-width: 1200px;
          margin: 0 auto;
          align-items: flex-start;
        }
        .db-sidebar {
          width: 260px;
          flex-shrink: 0;
          position: sticky;
          top: 20px;
        }
        .db-content {
          flex: 1;
          min-width: 0;
        }
        @media(max-width: 900px) {
          .db-body    { flex-direction: column; padding: 20px; }
          .db-sidebar { width: 100%; position: static; }
          .db-hero    { padding: 36px 20px 24px; }
        }
      `}</style>

      {/* Hero Banner */}
      <div className="db-hero">
        <h1 style={{ fontSize: 34, fontWeight: 800, color: "#fff", margin: "0 0 10px" }}>
          My Account
        </h1>
        <p style={{ margin: 0, fontSize: 14 }}>
          <span style={{ color: "rgba(255,255,255,0.6)" }}>🏠 Home</span>
          <span style={{ color: "rgba(255,255,255,0.35)", margin: "0 8px" }}>›</span>
          <span style={{ color: "#fff", fontWeight: 700 }}>{TITLES[activePage]}</span>
        </p>
      </div>

      {/* Main Layout */}
      <div className="db-body">

        {/* Sidebar */}
        <div className="db-sidebar">
          <UserSidebar
            user={user}
            activePage={activePage}
            onNavigate={setActivePage}
            onLogout={() => {
              // TODO: clear your auth token / context here
              alert("Logged out!");
            }}
            onPhotoChange={file => {
              const url = URL.createObjectURL(file);
              setUser(u => ({ ...u, photo: url }));
            }}
          />
        </div>

        {/* Page Content */}
        <div className="db-content">
          <PageComponent
            user={user}
            onSave={data => setUser(u => ({ ...u, ...data }))}
          />
        </div>

      </div>
    </div>
  );
};

export default UserDashboard;