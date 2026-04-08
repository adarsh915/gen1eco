// components/HeroBanner.jsx

const HeroBanner = ({ title, breadcrumbs }) => {
  return (
    <>
      <style>{`
        .dc-hero {
          position: relative;
          width: 100%;
          height: 200px;
          background: url('../images/page_banner_bg.webp') left center/cover no-repeat;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .dc-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(30, 40, 55, 0.55);
        }

        .dc-hero__content {
          position: relative;
          z-index: 1;
          text-align: center;
          color: #fff;
        }

        .dc-hero__title {
          
          font-size: 54px;
          font-weight: 500;
          letter-spacing: -0.5px;
          margin-bottom: 10px;
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
        }

        .dc-hero__breadcrumb {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          
          font-size: 0.88rem;
          color: rgba(255, 255, 255, 0.88);
        }

        .dc-hero__breadcrumb svg {
          opacity: 0.9;
        }

        .dc-hero__breadcrumb-sep {
          opacity: 0.7;
          font-size: 1.35rem;
        }

        .dc-hero__breadcrumb a {
          font-size: 16px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.88);
          text-decoration: none;
          transition: color 0.2s;
        }

        .dc-hero__breadcrumb a:hover {
          color: #fff;
        }

        @media (max-width: 768px) {
          .dc-hero__title { font-size: 36px; }
        }

        @media (max-width: 640px) {
          .dc-hero { height: 150px; }
          .dc-hero__title { font-size: 28px; }
        }
      `}</style>

      <div className="dc-hero">
        <div className="dc-hero__content">
          <h1 className="dc-hero__title">{title}</h1>
          <div className="dc-hero__breadcrumb">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
              <path d="M9 21V12h6v9"/>
            </svg>
            {breadcrumbs.map((crumb, index) => (
              <span key={index} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {crumb.href ? (
                  <a href={crumb.href}>{crumb.label}</a>
                ) : (
                  <span>{crumb.label}</span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <span className="dc-hero__breadcrumb-sep">&#62;</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroBanner;