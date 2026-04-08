import HeroBanner from "./HeroBanner";
export default function AboutUs() {
  return (
    <>
      <style>{`


        

        .gen-about-breadcrumb {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
        }

        .gen-about-breadcrumb li {
          font-size: 15px;
          color: rgba(255,255,255,0.85);
          display: flex;
          align-items: center;
        }

        .gen-about-breadcrumb li a {
          color: rgba(255,255,255,0.85);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .gen-about-breadcrumb li a:hover { color: #c8a951; }

        .gen-about-breadcrumb li:first-child::after {
          content: "›";
          margin: 0 8px;
          color: rgba(255,255,255,0.7);
          font-size: 20px;
        }

        /* ---- ABOUT SECTION ---- */
        .gen-about-section {
          margin-top: 100px;
          margin-bottom: 100px;
          overflow: visible;
        }

        .gen-about-container {
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 0 30px;
        }

       .gen-about-row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;   /* ✅ FIXED */
  justify-content: space-between;
  align-items: center;
  gap: 40px;
}

        /* ---- IMAGE COLUMN ---- */
       .gen-about-col-img {
  flex: 0 0 45%;
  max-width: 45%;
  position: relative;
  padding-right: 80px;
}

/* ADD THIS BELOW */
.gen-about-col-img,
.gen-about-col-text {
  box-sizing: border-box;
}

        .gen-about-img-wrap {
          position: relative;
        }

        .gen-about-img-box {
        
    padding-bottom: 88px;
          overflow: hidden;
          height: 850px;
          border: 10px solid #ffffff;
          box-shadow: 0 10px 40px rgba(0,0,0,0.12);
          border-radius: 150px 20px 20px 20px;
        }

        .gen-about-img-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Dark Green Circle Badge */
        .gen-about-badge {
          position: absolute;
          top: 50%;
          right: -74px;
          transform: translateY(-50%);
          background: #2d4a22;
          width: 175px;
          height: 175px;
          border-radius: 50%;
          border: 5px solid #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 20px;
          z-index: 3;
        }

        .gen-about-badge-num {
          font-size: 48px;
          font-weight: 900;
          color: #ffffff;
          line-height: 1;
          display: block;
        }

        .gen-about-badge-txt {
          display: block;
          color: #ffffff;
          font-size: 12px;
          font-weight: 500;
          margin-top: 6px;
          line-height: 1.4;
        }

        /* Black Description Box */
        .gen-about-desc-box {
          position: absolute;
          background: #1a1a1a;
          color: #ffffff;
          width: 320px;
          padding: 25px 28px;
          bottom: 49px;
          right: -20px;
          border: 5px solid #ffffff;
          border-radius: 40px 0px 40px 0px;
          font-size: 14px;
          z-index: 3;
        }

        .gen-about-team-name {
          display: block;
          color: #c8a951;
          font-size: 15px;
          font-weight: 600;
          text-transform: uppercase;
          position: relative;
          margin-top: 10px;
          letter-spacing: 1px;
        }

        .gen-about-team-name::after {
          position: absolute;
          content: "";
          width: 30px;
          height: 2px;
          background: #c8a951;
          left: 0;
          top: 11px;
        }

        /* ---- TEXT COLUMN ---- */
        .gen-about-col-text {
          flex: 0 0 50%;
          max-width: 50%;
        }

        .gen-about-col-text h6 {
          color: #c8a951;
          letter-spacing: 1px;
          font-size: 20px;
          font-weight: 600;
          margin: 0;
        }

        .gen-about-col-text h2 {
          font-weight: 600;
          font-size: 36px;
          color: #1a1a1a;
          text-transform: capitalize;
          margin: 10px 0 14px 0;
          line-height: 1.3;
        }

        .gen-about-desc-text {
          max-width: 90%;
          font-size: 15px;
          color: #555;
          line-height: 1.7;
          margin: 0;
        }

        .gen-about-list {
          list-style: none;
          padding: 0;
          margin: 42px 0 0 0;
        }

        .gen-about-list li {
          font-size: 16px;
          color: #1a1a1a;
          padding-left: 70px;
          position: relative;
          margin-bottom: 25px;
          text-transform: capitalize;
        }

        .gen-about-list li:last-child { margin-bottom: 0; }

        .gen-about-list li h4 {
          font-size: 20px;
          font-weight: 500;
          margin: 0 0 5px 0;
        }

        .gen-about-list li p {
          font-size: 14px;
          color: #666;
          line-height: 1.6;
          margin: 0;
          text-transform: none;
        }

        .gen-about-list li::before {
          position: absolute;
          content: "";
          background: #faf1e1;
          border-radius: 50%;
          top: 5px;
          left: 4px;
          width: 50px;
          height: 50px;
        }

        .gen-about-list li::after {
          position: absolute;
          content: "";
          background-image: url('../images/about_check (1).png');
          background-position: center;
          background-repeat: no-repeat;
          background-size: cover;
          top: 0;
          left: 0;
          width: 45px;
          height: 45px;
        }

        /* ==========================================
           RESPONSIVE
        ========================================== */
        @media (max-width: 1100px) {
          .gen-about-col-img { padding-right: 60px; }
          .gen-about-desc-box { width: 280px; right: -10px; }
        }

        @media (max-width: 900px) {
          .gen-about-row {
            flex-direction: column;
            flex-wrap: wrap;
          }
         .gen-about-col-img {
    flex: 0 0 100%;
    max-width: 100%;
    width: 100%;
    padding-right: 10px;     /* ✅ remove push */
    margin-bottom: 100px;
  }
          .gen-about-col-text {
            flex: 0 0 100%;
            max-width: 100%;
            width: 100%;
          }
          .gen-about-img-box { height: 500px; }
          .gen-about-col-text h2 { font-size: 28px; }
          .gen-about-desc-text { max-width: 100%; }
        }

      

@media (max-width: 600px) {

  html, body {
    overflow-x: hidden;
  }
/* Paragraph full width + proper spacing */
.gen-about-desc-text {
  max-width: 100%;
  padding-right: 12px;
}

/* List text ko right side breathing */
.gen-about-list li {
  padding-right: 12px;
}

/* Container ko thoda aur balanced */
.gen-about-container {
  padding-left: 20px;
  padding-right: 20px;
}
  .gen-about-section {
    margin-top: 60px;
    margin-bottom: 60px;
  }

  /* Container ko equal padding dono side */
  .gen-about-container {
    padding-left: 22px;
    padding-right: 22px;
  }

  .gen-about-row {
    flex-direction: column;
  }

  .gen-about-col-img {
    max-width: 100%;
    width: 100%;
    padding-right: 0;
    margin-bottom: 70px;
  }

  .gen-about-img-box {
    height: 360px;
    border-radius: 80px 10px 10px 10px;
  }

  /* ✅ Green circle ko andar lao */
  .gen-about-badge {
    right: 18px;   /* pehle 10px tha */
    width: 110px;
    height: 110px;
  }

  .gen-about-badge-num { font-size: 28px; }
  .gen-about-badge-txt { font-size: 10px; }

  /* ✅ Black box ko perfectly center karo */
  .gen-about-desc-box {
    width: 84%;
    left: 8%;
    right: auto;
    bottom: -35px;
    padding: 18px 22px;
    font-size: 12px;
  }

  /* ✅ Text column me proper gap */
  .gen-about-col-text {
    padding-left: 5px;
    padding-right: 5px;
  }

  .gen-about-col-text h2 {
    font-size: 22px;
  }

  .gen-about-list {
    padding-right: 5px; /* right side breathing */
  }

  .gen-about-list li h4 {
    font-size: 16px;
  }

}
      `}</style>

      {/* PAGE BANNER */}
     <HeroBanner
  title="About Us"
  breadcrumbs={[
    { label: "Home", href: "/" },
    { label: "About Us" },
  ]}
/>

      {/* ABOUT SECTION */}
      <section className="gen-about-section">
        <div className="gen-about-container">
          <div className="gen-about-row">

            {/* LEFT: Image */}
            <div className="gen-about-col-img">
              <div className="gen-about-img-wrap">
                <div className="gen-about-img-box">
                  <img src="/images/about_img.jpg" alt="Gen1eco About Us" />
                </div>
                <div className="gen-about-badge">
                  <span className="gen-about-badge-num">10+</span>
                  <span className="gen-about-badge-txt">Years Of Trusted Service</span>
                </div>
                <div className="gen-about-desc-box">
                  Delivering safe, eco-friendly, and high-performance cleaning solutions
                  designed especially for modern families and babies.
                  <span className="gen-about-team-name">Team Gen1eco</span>
                </div>
              </div>
            </div>

            {/* RIGHT: Text */}
            <div className="gen-about-col-text">
              <h6>About Gen1eco</h6>
              <h2>Safe, Sustainable &amp; Effective Cleaning Solutions</h2>
              <p className="gen-about-desc-text">
                Gen1eco is committed to creating plant-based, skin-safe, and eco-friendly
                home care products that deliver powerful cleaning without harsh chemicals.
                Our mission is to protect families, especially babies, while promoting
                environmental responsibility through innovative and sustainable solutions.
              </p>
              <ul className="gen-about-list">
                <li>
                  <h4>Trusted &amp; Safe Formulations</h4>
                  <p>Our products are developed using carefully selected ingredients that are gentle on delicate skin yet tough on stains. Every formulation focuses on safety, reliability, and effectiveness.</p>
                </li>
                <li>
                  <h4>Premium Quality Standards</h4>
                  <p>We follow strict quality control measures to ensure every product meets high safety and performance benchmarks. Consistency and customer satisfaction are our top priorities.</p>
                </li>
                <li>
                  <h4>Fast &amp; Reliable Delivery</h4>
                  <p>With efficient logistics and secure packaging, we ensure timely delivery of orders while maintaining product integrity throughout the shipping process.</p>
                </li>
                <li>
                  <h4>Secure &amp; Hassle-Free Payments</h4>
                  <p>We offer safe and encrypted payment methods to provide a smooth and worry-free shopping experience for our customers.</p>
                </li>
                <li>
                  <h4>Eco-Conscious Commitment</h4>
                  <p>Sustainability is at the heart of Gen1eco. From plant-based ingredients to responsible packaging, we strive to reduce environmental impact while delivering powerful cleaning results.</p>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}