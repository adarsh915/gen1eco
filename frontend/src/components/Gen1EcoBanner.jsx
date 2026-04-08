import { useState, useEffect } from "react";
import api from "../api/axios"; // ✅ import axios

const Gen1EcoBanner = () => {
  const [loaded, setLoaded] = useState(false);
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch banner from backend
  useEffect(() => {
    api.get('/footer-top-banner/api')
      .then(res => {
        if (res.data.success) setBanner(res.data.data);
      })
      .catch(err => console.error('Banner error:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const styles = `


    .eco-wrapper {
      width: 100%;
      display: flex;
      gap: 30px;
      margin: 0;
      padding: 0;
      min-height: 480px;
      overflow: hidden;
    }

    .eco-left {
      width: 33%;
      flex-shrink: 0;
      position: relative;
      border-radius:12px;
      overflow: hidden;
      min-height: 480px;
      background: #0d140d;
    }

    .eco-left-bg {
      position: absolute;
      inset: 0;
      background:url('../images/countdown_banner.jpg');
      height: 100%;
      background-size: cover;
      background-position: center;
      z-index: 0;
      filter: blur(4px) brightness(0.7);
    }

    .eco-left-bg::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        radial-gradient(ellipse 120px 80px at 20% 15%, rgba(55,85,35,0.35) 0%, transparent 70%),
        radial-gradient(ellipse 90px 110px at 75% 10%, rgba(40,70,25,0.3) 0%, transparent 70%),
        radial-gradient(ellipse 140px 100px at 85% 60%, rgba(30,60,20,0.25) 0%, transparent 70%);
      z-index: 1;
    }

    .eco-left-bg::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 45%;
      background: radial-gradient(ellipse 70% 60% at 50% 0%, rgba(40,90,20,0.4) 0%, transparent 80%);
      z-index: 1;
    }

    .eco-left-bottle {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 3;
      width: 100%;
      display: flex;
      justify-content: center;
      transition: opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s;
      opacity: ${loaded ? 1 : 0};
    }

    .eco-left-bottle img {
      width: 100%;
      height: auto;
      filter: drop-shadow(0 40px 80px rgba(0,0,0,0.9));
      display: block;
      object-fit: contain;
    }

    .eco-left-bottom {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      z-index: 4;
      padding: 30px 24px;
      background: linear-gradient(to top, rgba(0,0,0,0.92) 20%, transparent 100%);
      opacity: ${loaded ? 1 : 0};
      transform: translateY(${loaded ? '0' : '20px'});
      transition: opacity 0.7s ease 0.5s, transform 0.7s ease 0.5s;
    }

    .eco-left-bottom h4 {
      font-size: 1.5rem;
      font-weight: 500;
      color: rgba(255,254,254,0.97);
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 3px;
    }

    .eco-left-bottom h2 {
      font-size: 32px;
      font-weight: 500;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      line-height: 1.1;
      margin-bottom: 16px;
    }

    .eco-btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 12px 22px;
      background: #b5956a;
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.3px;
      text-decoration: none;
      cursor: pointer;
      border: none;
      position: relative;
      overflow: hidden;
      z-index: 1;
      white-space: nowrap;
      line-height: 1;
      transition: transform 0.2s;
    }

    .eco-btn::after {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      width: 0;
      height: 100%;
      background: #333333;
      z-index: -1;
      transition: width 0.3s ease;
    }

    .eco-btn:hover::after { width: 100%; left: 0; }
    .eco-btn:hover { transform: translateY(-1px); }
    .eco-btn svg { flex-shrink: 0; transition: transform 0.25s; }
    .eco-btn:hover svg { transform: rotate(45deg); }

    .eco-right {
      flex: 1;
      position: relative;
      overflow: hidden;
      background: #d8dfd0;
      display: flex;
      border-radius:12px;
      align-items: center;
      min-height: 480px;
    }

    .eco-right::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 55% 70% at 85% 50%, rgba(215,228,200,0.6) 0%, transparent 65%),
        radial-gradient(ellipse 30% 40% at 5% 85%, rgba(190,210,175,0.3) 0%, transparent 60%);
    }

    .eco-right-text {
      position: relative;
      z-index: 3;
      padding: 48px 0 48px 7%;
      max-width: 60%;
      flex-shrink: 0;
      opacity: ${loaded ? 1 : 0};
      transform: translateX(${loaded ? '0' : '-30px'});
      transition: opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s;
    }

    .eco-right-text h2 {
      font-size: 48px;
      margin-top: 10px;
      text-transform: capitalize;
      font-weight: 600;
      color: #1a1a1a;
      line-height: 1.15;
      margin-bottom: 12px;
    }

    .eco-right-text p {
      font-size: 16px;
      font-weight: 400;
      color: #555;
      line-height: 1.6;
      margin-bottom: 26px;
    }

    .eco-swirl {
      position: absolute;
      right: -2%;
      top: 50%;
      transform: translateY(-50%);
      width: clamp(260px, 40vw, 480px);
      height: clamp(260px, 40vw, 480px);
      z-index: 1;
      pointer-events: none;
    }

    .eco-right-product {
      position: absolute;
      right: 0; bottom: 0; top: 0;
      z-index: 2;
      display: flex;
      align-items: flex-end;
      opacity: ${loaded ? 1 : 0};
      transform: translateX(${loaded ? '0' : '40px'});
      transition: opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s;
    }

    .eco-right-product img {
      height: clamp(310px, 48vw, 460px);
      width: auto;
      object-fit: contain;
      display: block;
      filter: drop-shadow(0 20px 40px rgba(0,0,0,0.1));
    }

    @media (max-width: 900px) {
      .eco-wrapper { flex-direction: column; min-height: unset; }
      .eco-left { width: 100%; min-height: 360px; }
      .eco-right { flex-direction: column; min-height: unset; }
      .eco-right-text { max-width: 100%; padding: 32px 20px 16px; }
      .eco-right-product {
        position: relative; right: auto; bottom: auto; top: auto;
        width: 100%; justify-content: flex-end; padding-right: 12px;
      }
      .eco-right-product img { height: 240px; }
      .eco-swirl { width: 260px; height: 260px; top: auto; bottom: 0; transform: none; }
    }

    @media (max-width: 480px) {
      .eco-left-bottom h2 { font-size: 20px; }
      .eco-right-text h2 { font-size: 22px; }
      .eco-btn { padding: 11px 18px; font-size: 13px; }
    }
  `;

  // ✅ Loading state
  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '60px' }}>
        <div style={{ minHeight: '440px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d140d' }}>
          <p style={{ color: '#fff' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ No data fallback
  if (!banner) return null;

  return (
    <>
      <style>{styles}</style>
      <div className="container" style={{ maxWidth: '1415px', padding: '0px 20px 40px 20px' }}>
        <div className="eco-wrapper">

          {/* ===== LEFT PANEL ===== */}
          <div className="eco-left">
            <div className="eco-left-bg" />

            {/* ✅ Left banner image from DB */}
            <div className="eco-left-bottle">
              <img
                src={`${process.env.REACT_APP_API_URL}/uploads/footer_banners/${banner.left_banner_image}`}
                alt={banner.left_title}
                onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
              />
            </div>

            <div className="eco-left-bottom">
              {/* ✅ Left data from DB */}
              <h4>{banner.left_subtitle}</h4>
              <h2>{banner.left_title}</h2>
              <a href={banner.left_button_link || '#'} className="eco-btn">
                {banner.left_button_text || 'Shop Now'}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
                </svg>
              </a>
            </div>
          </div>

          {/* ===== RIGHT PANEL ===== */}
          <div className="eco-right">

            {/* Orange swirl */}
            <div className="eco-swirl">
              <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="sg1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f07010" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#f5a030" stopOpacity="0.35" />
                  </linearGradient>
                  <linearGradient id="sg2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#e86010" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#f0a020" stopOpacity="0.15" />
                  </linearGradient>
                </defs>
                <path d="M420 180 Q480 260 440 340 Q400 420 300 430 Q180 440 110 360 Q40 270 80 170 Q120 70 230 50 Q350 30 420 120 Q480 200 440 300 Q400 380 290 390 Q180 395 120 320 Q65 250 100 165 Q135 80 230 75 Q315 70 370 140 Q420 200 400 290 Q380 365 290 375 Q200 380 155 315 Q112 255 145 180 Q178 110 260 110 Q330 110 360 175 Q390 235 360 305"
                  stroke="url(#sg1)" strokeWidth="13" strokeLinecap="round" fill="none" />
                <path d="M390 200 Q440 270 405 345 Q368 415 275 420 Q170 425 105 348 Q45 268 82 172 Q115 85 218 62 Q330 40 400 128 Q455 205 420 298 Q385 375 285 382 Q185 387 128 318 Q76 252 110 170"
                  stroke="url(#sg2)" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.5" />
                <circle cx="442" cy="152" r="7" fill="#f07010" opacity="0.7" />
                <circle cx="460" cy="176" r="4" fill="#f5a030" opacity="0.5" />
                <circle cx="103" cy="378" r="5" fill="#f07010" opacity="0.55" />
                <circle cx="418" cy="358" r="4" fill="#f07010" opacity="0.45" />
              </svg>
            </div>

            {/* ✅ Right text from DB */}
            <div className="eco-right-text">
              <h2>{banner.right_title}</h2>
              <p>{banner.right_subtitle}</p>
              <a href={banner.right_button_link || '#'} className="eco-btn">
                {banner.right_button_text || 'Shop Now'}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
                </svg>
              </a>
            </div>

            {/* ✅ Right image from DB */}
            <div className="eco-right-product">
              <img
                src={`${process.env.REACT_APP_API_URL}/uploads/footer_banners/${banner.right_banner_image}`}
                alt={banner.right_title}
                onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
              />
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Gen1EcoBanner;
