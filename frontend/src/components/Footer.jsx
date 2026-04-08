import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const styles = `
  :root {
    --green-dark: #1a3020;
    --green-mid: #2d4a35;
    --gold: #b8973a;
    --gold-hover: #d4ae52;
    --footer-bg: #f0ede8;
    --text-dark: #2a2a2a;
    --text-muted: #6b6b6b;
    --link-color: #444;
    --link-hover: #b8973a;
    --border: #d8d3cc;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .gen1-footer-root {
    
    background: #f0ede8;
  }

  /* ── Newsletter Bar ── */
  .gen1-newsletter {
    background: url('../images/newsbanner.png') center center no-repeat;
    background-size: 100% 100%;
    padding: 60px 0;
    min-height: 225px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }

  .nl-wrapper {
    width: 100%;
    max-width: 700px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 20px;
    gap: 8px;
  }

  .nl-title {
    font-size: 1.6rem;
    font-weight: 800;
    color: #1a1a1a;
    line-height: 1.2;
    letter-spacing: -0.3px;
    margin: 0;
  }

  .nl-sub {
    font-size: 0.9rem;
    color: #444;
    font-weight: 400;
    margin: 2px 0 8px;
  }

  .nl-input-wrap {
    display: flex;
    gap: 0;
    width: 100%;
    max-width: 480px;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 4px 18px rgba(0,0,0,0.12);
  }

  .nl-input {
    flex: 1;
    border: none;
    outline: none;
    padding: 13px 16px;
    font-size: 0.9rem;
    background: #fff;
    color: var(--text-dark);
  }

  .nl-input-icon {
    background: #fff;
    display: flex;
    align-items: center;
    padding-left: 14px;
    color: #aaa;
    font-size: 0.9rem;
  }

  .nl-input::placeholder { color: #aaa; }

  .nl-btn {
    background: #C89A39;
    color: #fff;
    border: none;
    padding: 13px 24px;
    font-weight: 700;
    font-size: 0.9rem;
    letter-spacing: 0.4px;
    cursor: pointer;
    transition: background 0.2s;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .nl-btn:hover { background: #a87e28; }

  /* Responsive Newsletter */
  @media (max-width: 992px) {
    .gen1-newsletter {
      padding: 50px 0;
      min-height: 200px;
    }
    .nl-title { font-size: 1.45rem; }
    .nl-sub { font-size: 0.85rem; }
  }

  @media (max-width: 767px) {
    .gen1-newsletter {
      background: #e6d7b3;
      min-height: 160px;
      padding: 40px 0;
    }
    .nl-wrapper { padding: 0 16px; gap: 6px; }
    .nl-title { font-size: 1.35rem; font-weight: 700; }
    .nl-sub { font-size: 0.8rem; margin: 0 0 6px; }
    .nl-input-wrap { max-width: 450px; }
    .nl-input { padding: 11px 14px; font-size: 0.85rem; }
    .nl-btn { padding: 11px 20px; font-size: 0.85rem; }
  }

  @media (max-width: 600px) {
    .gen1-newsletter {
      min-height: 140px;
      padding: 32px 0;
    }
    .nl-wrapper { padding: 0 14px; gap: 4px; }
    .nl-title { font-size: 1.2rem; }
    .nl-sub { font-size: 0.75rem; }
    .nl-input-wrap {
      flex-direction: column;
      border-radius: 6px;
      background: transparent;
      box-shadow: none;
      gap: 8px;
      overflow: visible;
      max-width: 100%;
    }
    .nl-input-icon { display: none; }
    .nl-input {
      border-radius: 6px;
      box-shadow: 0 3px 12px rgba(0,0,0,0.1);
      padding: 12px 14px;
      width: 100%;
    }
    .nl-btn {
      border-radius: 6px;
      width: 100%;
      padding: 12px;
      box-shadow: 0 4px 12px rgba(200, 154, 57, 0.25);
    }
  }

  @media (max-width: 480px) {
    .gen1-newsletter {
      min-height: 120px;
      padding: 24px 0;
    }
    .nl-wrapper { padding: 0 12px; gap: 3px; }
    .nl-title { font-size: 1.1rem; letter-spacing: 0; }
    .nl-sub { font-size: 0.7rem; }
    .nl-input { padding: 10px 12px; font-size: 0.8rem; }
    .nl-btn { padding: 10px; font-size: 0.8rem; }
  }


  /* ── Main Footer ── */
  .gen1-footer-main {
    padding: 56px 0 40px;
  }

  .gen1-footer-main .container { 
    width: 100%;
    max-width: 1415px; 
    margin: 0 auto;    
    padding: 25px 20px !important; 
    box-sizing: border-box;
  }

  /* Logo */
  .footer-logo-img {
    width: 120px;
    height: auto;
  }

  .footer-logo-svg {
    width: 120px;
    height: 70px;
  }

  .follow-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 20px;
    flex-wrap: wrap;
  }

  .follow-label {
    font-weight: 700;
    color: var(--text-dark);
    font-size: 0.92rem;
  }

  .social-icons { display: flex; gap: 8px; }

  .social-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #1877f2;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.82rem;
    text-decoration: none;
    transition: transform 0.2s, opacity 0.2s;
  }

  .social-icon:hover { transform: translateY(-2px); opacity: 0.88; color: #fff; }
  .social-icon.youtube, .social-icon.instagram, .social-icon.facebook { background: #1670e7; }

  /* Footer columns */
  .footer-col-title {
    
    font-size: 18px;
    font-weight: 700;
    color: var(--text-dark);
    margin-bottom: 18px;
    letter-spacing: 0.2px;
  }

  .footer-links {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .footer-links li { margin-bottom: 10px; }

  .footer-links a {
    color: var(--link-color);
    text-decoration: none;
    font-size: 15px;
    font-weight: 400;
    transition: color 0.18s, padding-left 0.18s;
    display: inline-block;
  }

  .footer-links a:hover {
    color: var(--link-hover);
    padding-left: 4px;
  }

  /* Contact */
  .contact-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 14px;
  }

  .contact-icon {
    width: 30px;
    height: 30px;
   
        filter: brightness(0) saturate(100%) invert(0%) sepia(87%) saturate(7442%) hue-rotate(85deg) brightness(95%) contrast(95%);
    color: black;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .contact-text {
    color: var(--link-color);
    font-size: 0.88rem;
    line-height: 1.5;
  }

  /* Divider */
  .footer-divider {
    border: none;
    border-top: 1px solid var(--border);
    margin: 8px 0 0;
  }

  /* Bottom bar */
  .gen1-footer-bottom {
    padding: 18px 0;
    background: #eceaea;
  }

  .gen1-footer-bottom .container { 
    width: 100%;
    max-width: 1415px; 
    margin: 0 auto; 
    padding: 0 20px; 
    box-sizing: border-box;
  }

  .copyright {
    font-size: 0.84rem;
    color: var(--text-muted);
  }

  /* Payment icons */
  .payment-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .payment-label {
    font-size: 0.84rem;
    color: var(--text-muted);
    margin-right: 4px;
  }

  .payment-badge {
    height: 28px;
    border-radius: 4px;
    padding: 3px 0px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 0.65rem;
    letter-spacing: 0.3px;
  }
  .payment-badge img{
  border-radius:5px;
  }
  .payment-mc {
    
    gap: 2px;
  }

  .mc-red { width: 18px; height: 18px; border-radius: 50%; background: #eb001b; }
  .mc-yellow { width: 18px; height: 18px; border-radius: 50%; background: #f79e1b; margin-left: -8px; }

  .payment-visa {
    
    color: #fff;
    font-style: italic;
    letter-spacing: 1px;
    font-size: 0.75rem;
    padding: 3px 0px;
  }

  .payment-bank {
    
    color: #fff;
    padding: 3px 0px;
    font-size: 0.68rem;
    font-weight: 700;
  }

  /* Back to Top */
  .back-top-btn {
    position: fixed;
    bottom: 32px;
    right: 32px;
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: #fff;
    border: none;
    color: var(--text-dark);
    font-size: 1.1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    transition: transform 0.2s, opacity 0.2s;
    z-index: 1000;
    opacity: 0;
    pointer-events: none;
  }

  .back-top-btn.visible {
    opacity: 1;
    pointer-events: all;
  }

  .back-top-btn:hover {
    transform: translateY(-3px);
  }

  /* Responsive */
  @media (max-width: 991px) {
    .footer-col { margin-bottom: 32px; }
  }

  @media (max-width: 767px) {
    .footer-bottom-row { flex-direction: column !important; gap: 12px; text-align: center; }
    .payment-wrap { justify-content: center; }
    .back-top-btn { bottom: 20px; right: 20px; }
  }

  @media (max-width: 480px) {
    .footer-col-title { font-size: 16px; margin-bottom: 14px; }
    .footer-links a { font-size: 13px; }
    .footer-col { margin-bottom: 20px; }
    .contact-item { gap: 8px; margin-bottom: 10px; }
    .contact-text { font-size: 0.8rem; }
    .back-top-btn { bottom: 16px; right: 16px; width: 40px; height: 40px; font-size: 0.9rem; }
    .copyright { font-size: 0.78rem; }
    .payment-label { font-size: 0.78rem; }
  }
`;

// Inline SVG logo approximating Gen-1 Eco
const Gen1EcoLogo = () => (
  <img src="../images/about_check.png" alt="" />
);

export default function Gen1ecoFooter() {
  const [email, setEmail] = useState("");
  const [showTop, setShowTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 200);
      const scrollTop = window.scrollY;
      const docHeight = Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.documentElement.clientHeight
      ) - document.documentElement.clientHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", onScroll);
    onScroll(); // trigger once on mount
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const pageLinks = [
    { label: "Home", path: "/" },
    { label: "About Us", path: "/about" },
    { label: "Shop Now", path: "/products" },
    { label: "Contact Us", path: "/contact" },
    { label: "My Account", path: "/dashboard" }
  ];
  const categories = [
    { label: "Laundry / Clothes Washing", path: "/products" },
    { label: "Dish Washing", path: "/products" },
    { label: "Household Cleaning", path: "/products" }
  ];
  const quickLinks = [
    { label: "Privacy Policy", path: "/privacy" },
    { label: "Shipping Policy", path: "/shipping" },
    { label: "Login", path: "/login" },
    { label: "Register", path: "/register" }
  ];

  return (
    <>
      <style>{styles}</style>

      <footer className="gen1-footer-root">
        {/* Newsletter */}
        <div className="gen1-newsletter">
          <div className="nl-wrapper">
            <div className="nl-title">Get 20% Off Discount Coupon</div>
            <div className="nl-sub">by Subscribe our Newsletter</div>
            <div className="nl-input-wrap">
              <span className="nl-input-icon"><i className="fa fa-envelope" /></span>
              <input
                className="nl-input"
                type="email"
                placeholder="EMAIL ADDRESS"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <button className="nl-btn">Get the Coupon</button>
            </div>
          </div>
        </div>

        {/* Main Footer */}
        <div className="gen1-footer-main">
          <div className="container">
            <div className="row">
              {/* Col 1 – Logo + Socials */}
              <div className="col-lg-3 col-md-2 col-sm-12 footer-col mb-4">
                <Gen1EcoLogo />
                <div className="follow-wrap">
                  <span className="follow-label">Follow :</span>
                  <div className="social-icons">
                    <a href="#" className="social-icon facebook" aria-label="Facebook"><i className="fab fa-facebook-f" /></a>
                    <a href="#" className="social-icon instagram" aria-label="Instagram"><i className="fab fa-instagram" /></a>
                    <a href="#" className="social-icon youtube" aria-label="YouTube"><i className="fab fa-youtube" /></a>
                  </div>
                </div>
              </div>

              {/* Col 2 – Page Links */}
              <div className="col-lg-2 col-md-2 col-sm-6 footer-col mb-4">
                <h6 className="footer-col-title">Page Links</h6>
                <ul className="footer-links">
                  {pageLinks.map(l => <li key={l.label}><Link to={l.path}>{l.label}</Link></li>)}
                </ul>
              </div>

              {/* Col 3 – Category */}
              <div className="col-lg-2 col-md-2 col-sm-6 footer-col mb-4">
                <h6 className="footer-col-title">Category</h6>
                <ul className="footer-links">
                  {categories.map(l => <li key={l.label}><Link to={l.path}>{l.label}</Link></li>)}
                </ul>
              </div>

              {/* Col 4 – Quick Links */}
              <div className="col-lg-2 col-md-2 col-sm-6 footer-col mb-4">
                <h6 className="footer-col-title">Quick Links</h6>
                <ul className="footer-links">
                  {quickLinks.map(l => <li key={l.label}><Link to={l.path}>{l.label}</Link></li>)}
                </ul>
              </div>

              {/* Col 5 – Contact */}
              <div className="col-lg-3 col-md-2 col-sm-6 footer-col mb-4">
                <h6 className="footer-col-title">Contact Us</h6>
                <div className="contact-item">
                  <div className="contact-icon"><img src="../images/location_icon_white.png" alt="" /></div>
                  <div className="contact-text">1-131, Sector-1, DSIIDC, Bawana Industrial Area, New Delhi-110039</div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon"><img src="../images/phone_icon_white2.png" alt="" /></div>
                  <div className="contact-text">+919910198952</div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon"><img src="../images/mail_icon_white.png" alt="" /></div>
                  <div className="contact-text">info@gen1eco.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr className="footer-divider" />

        {/* Bottom Bar */}
        <div className="gen1-footer-bottom">
          <div className="container">
            <div className="footer-bottom-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <span className="copyright">Copyright © 2026 Gen1eco. All rights reserved</span>
              <div className="payment-wrap">
                <span className="payment-label">Payment by :</span>
                {/* Mastercard */}
                <div className="payment-badge payment-mc">
                  <img src="../images/pngegg.png" alt="" style={{ width: '80px' }} />
                  {/* <div className="mc-red" />
                  <div className="mc-yellow" /> */}
                </div>
                {/* Visa */}
                {/* <div className="payment-badge payment-visa"><img src="../images/footer_payment_icon_2.jpg" alt="" /></div> */}
                {/* Bank */}
                {/* <div className="payment-badge payment-bank"><img src="../images/footer_payment_icon_3.jpg" alt="" /></div> */}
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top */}
      <button
        className={`back-top-btn${showTop ? " visible" : ""}`}
        onClick={scrollTop}
        aria-label="Back to top"
      >
        <svg
          width="46"
          height="46"
          viewBox="0 0 46 46"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transform: "rotate(-90deg)",
            pointerEvents: "none"
          }}
        >
          <circle
            cx="23"
            cy="23"
            r="22"
            fill="none"
            stroke="#e0e0e0"
            strokeWidth="2"
          />
          <circle
            cx="23"
            cy="23"
            r="22"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="2"
            strokeDasharray="138.23"
            strokeDashoffset={138.23 - (scrollProgress * 138.23)}
            style={{ transition: "stroke-dashoffset 0.1s linear" }}
          />
        </svg>
        <i className="fa fa-arrow-up" style={{ position: "relative", zIndex: 1, marginTop: "1px" }} />
      </button>
    </>
  );
}