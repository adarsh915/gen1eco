import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const LoginRequiredPopup = () => {
  const { showLoginPopup, loginPopupType, hideLoginPopup } = useCart();

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    if (!showLoginPopup) return;
    const t = setTimeout(hideLoginPopup, 4000);
    return () => clearTimeout(t);
  }, [showLoginPopup]);

  return (
    <>
      <style>{`
        .lrp-wrapper {
          position: fixed;
          top: 60px;
          right: 20px;
          z-index: 9999;
          pointer-events: none;
          width:300px
        }
        .lrp-box {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #DB4437;
          color: #fff;
          padding: 13px 20px;
          border-radius: 6px;
          
          font-size: 14px;
          font-weight: 500;
          box-shadow: 0 4px 18px rgba(0,0,0,0.18);
          pointer-events: all;
          transform: translateX(120%);
          opacity: 0;
          transition: transform 0.35s cubic-bezier(.4,0,.2,1), opacity 0.28s ease;
          white-space: nowrap;
        }
        .lrp-box.lrp-show {
          transform: translateX(0);
          opacity: 1;
        }
        .lrp-msg { flex: 1; }
        .lrp-link {
          color: #fff;
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: opacity 0.2s;
        }
        .lrp-link:hover { opacity: 0.82; color: #fff; }
        .lrp-divider { opacity: 0.55; margin: 0 2px; }
        .lrp-close {
          background: none;
          border: none;
          color: #fff;
          font-size: 20px;
          cursor: pointer;
          opacity: 0.75;
          line-height: 1;
          padding: 0 0 0 4px;
          transition: opacity 0.2s;
        }
        .lrp-close:hover { opacity: 1; }
      `}</style>

      <div className="lrp-wrapper">
        <div className={`lrp-box${showLoginPopup ? " lrp-show" : ""}`}>
          <span className="lrp-msg">
            {loginPopupType === "cart" ? "You must login first!" : "Please login first!"}
          </span>

        </div>
      </div>
    </>
  );
};

export default LoginRequiredPopup;
