import { useState } from "react";
import HeroBanner from "./HeroBanner";
import api from "../api/axios"; // ✅ API

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", subject: "", message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/contact-messages/send', formData);
      if (res.data.success) {
        setSubmitted(true);
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`


        .gen-contact-banner {
          background-position: center;
          align-items: center;
          justify-content: center;
        }
        .gen-contact-banner::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 1;
        }
        .gen-contact-breadcrumb {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .gen-contact-breadcrumb li {
          font-size: 15px;
          color: rgba(255,255,255,0.85);
          display: flex;
          align-items: center;
        }
        .gen-contact-breadcrumb li a {
          color: rgba(255,255,255,0.85);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .gen-contact-breadcrumb li a:hover { color: #c8a951; }
        .gen-contact-breadcrumb li:first-child::after {
          content: "›";
          margin: 0 8px;
          color: rgba(255,255,255,0.7);
          font-size: 20px;
        }

        .gen-contact-section {
          margin-top: 75px;
          margin-bottom: 0;
        }
        .gen-contact-container {
          max-width: 1415px;
          width: 100%;
          margin: 0 auto;
          padding: 0 20px;
        }

        .gen-contact-info-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 50px;
          margin-bottom: 75px;
          padding: 10px 0 10px 20px;
        }
        .gen-contact-info-card {
          background: #f5f5f5;
          padding: 30px 25px 30px 90px;
          position: relative;
          border-radius: 8px;
          transition: box-shadow 0.3s;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 100px;
        }
        .gen-contact-info-card:hover {
          box-shadow: 0 8px 30px rgba(0,0,0,0.10);
        }
        .gen-contact-info-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 70px;
          height: 70px;
          background: #2d4a22;
          border-radius: 6px;
          position: absolute;
          top: 50%;
          left: -20px;
          transform: translateY(-50%);
          transition: background 0.3s;
          z-index: 2;
        }
        .gen-contact-info-card:hover .gen-contact-info-icon {
          background: #1a1a1a;
        }
        .gen-contact-info-icon img {
          filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(7500%) hue-rotate(62deg) brightness(99%) contrast(89%);
          width: 30px;
          height: 30px;
        }
        .gen-contact-info-card h3 {
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 6px 0;
          text-transform: capitalize;
        }
        .gen-contact-info-card a,
        .gen-contact-info-card p {
          display: block;
          color: #555;
          font-size: 15px;
          text-decoration: none;
          margin: 0;
          line-height: 1.6;
        }
        .gen-contact-info-card a:hover { color: #c8a951; }

        .gen-contact-bottom-row {
          display: flex;
          flex-wrap: nowrap;
          gap: 40px;
          align-items: flex-start;
        }
        .gen-contact-img-col {
          flex: 0 0 38%;
          max-width: 38%;
          margin-top: 25px;
          padding-left: 0;
        }
        .gen-contact-img-col img {
          width: 100%;
          height: 100%;
          max-height: 560px;
          object-fit: cover;
          border-radius: 12px;
          display: block;
        }
        .gen-contact-form-col {
          flex: 0 0 58%;
          max-width: 58%;
          margin-top: 25px;
        }

        .gen-contact-form-box {
          background: #fff;
          box-shadow: rgba(149,157,165,0.2) 0px 8px 24px;
          padding: 40px;
          border-radius: 16px;
        }
        .gen-contact-form-box h2 {
          font-size: 38px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 24px 0;
        }
        .gen-contact-success {
          background: #d4edda;
          color: #155724;
          padding: 12px 18px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 15px;
        }
        .gen-contact-error {
          background: #f8d7da;
          color: #721c24;
          padding: 12px 18px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 15px;
        }
        .gen-contact-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .gen-contact-form-full {
          grid-column: 1 / -1;
        }
        .gen-contact-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .gen-contact-field label {
          font-size: 14px;
          font-weight: 500;
          color: #444;
        }
        .gen-contact-field input,
        .gen-contact-field textarea {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 12px 14px;
          font-size: 15px;
          color: #1a1a1a;
          outline: none;
          transition: border-color 0.2s;
          background: #fff;
          width: 100%;
          box-sizing: border-box;
        }
        .gen-contact-field input:focus,
        .gen-contact-field textarea:focus {
          border-color: #2d4a22;
        }
        .gen-contact-field textarea {
          resize: vertical;
          min-height: 150px;
        }
        .gen-contact-submit-btn {
          margin-top: 24px;
          background: #c8a951;
          color: #ffffff;
          border: none;
          padding: 14px 32px;
          font-size: 15px;
          font-weight: 600;
          border-radius: 6px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: background 0.3s;
        }
        .gen-contact-submit-btn:hover { background: #2d4a22; }
        .gen-contact-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .gen-contact-map {
          margin-top: 75px;
          height: 450px;
          width: 100%;
        }
        .gen-contact-map iframe {
          width: 100%;
          height: 100%;
          border: 0;
          display: block;
        }

        @media (max-width: 1024px) {
          .gen-contact-info-row { grid-template-columns: 1fr 1fr; padding-left: 20px; gap: 40px; }
          .gen-contact-bottom-row { flex-wrap: wrap; }
          .gen-contact-img-col, .gen-contact-form-col { flex: 0 0 100%; max-width: 100%; padding: 0; }
          .gen-contact-img-col img { max-height: 480px; }
        }
        @media (max-width: 768px) {
          .gen-contact-container { padding: 0 15px; }
          .gen-contact-section { margin-top: 50px; }
          .gen-contact-info-row { grid-template-columns: 1fr; gap: 20px; padding: 10px 0 10px 15px; }
          .gen-contact-info-card { padding: 22px 20px 22px 85px; min-height: 85px; }
          .gen-contact-bottom-row { flex-direction: column; gap: 24px; }
          .gen-contact-img-col { flex: 0 0 calc(100% + 30px); max-width: calc(100% + 30px); width: calc(100% + 30px); padding: 0; margin-top: 0; margin-left: -15px; margin-right: -15px; }
          .gen-contact-img-col img { height: auto; max-height: 510px; width: 100%; object-fit: cover; border-radius: 0; }
          .gen-contact-form-col { flex: 0 0 calc(100% + 30px); max-width: calc(100% + 30px); width: calc(100% + 30px); margin-left: -15px; margin-right: -15px; margin-top: 0; }
          .gen-contact-form-box { width: 100%; padding: 35px 15px; margin-bottom: 10px; border-radius: 0; box-shadow: none; border-bottom: 1px solid #eee; }
          .gen-contact-form-box h2 { font-size: 28px; margin-bottom: 15px; }
          .gen-contact-form-grid { grid-template-columns: 1fr; gap: 16px; }
          .gen-contact-map { height: 350px; margin-top: 40px; }
        }
        @media (max-width: 480px) {
          .gen-contact-breadcrumb li { font-size: 13px; }
          .gen-contact-info-card { padding: 20px 16px 20px 80px; }
          .gen-contact-info-icon { width: 60px; height: 60px; left: -15px; }
          .gen-contact-img-col img { width: 100%; height: auto; max-height: 320px; object-fit: cover; }
          .gen-contact-form-box { padding: 30px 15px; }
          .gen-contact-submit-btn { width: 100%; justify-content: center; }
          .gen-contact-map { height: 280px; }
        }
      `}</style>

      {/* PAGE BANNER */}
      <HeroBanner
        title="Contact Us"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Contact Us" },
        ]}
      />

      {/* CONTACT SECTION */}
      <section className="gen-contact-section">
        <div className="gen-contact-container">

          {/* INFO CARDS */}
          <div className="gen-contact-info-row">
            <div className="gen-contact-info-card">
              <div className="gen-contact-info-icon">
                <img src="../images/call_icon_black (1).png" alt="" />
              </div>
              <h3>Call Us</h3>
              <a href="tel:+919910198952">+919910198952</a>
            </div>
            <div className="gen-contact-info-card">
              <div className="gen-contact-info-icon">
                <img src="../images/mail_icon_black (1).png" alt="" />
              </div>
              <h3>Email Us</h3>
              <a href="mailto:info@gen1eco.com">info@gen1eco.com</a>
            </div>
            <div className="gen-contact-info-card">
              <div className="gen-contact-info-icon">
                <img src="../images/location_icon_black (1).png" alt="" />
              </div>
              <h3>Our Location</h3>
              <p>1-131, Sector-1, DSIIDC, Bawana Industrial Area, New Delhi-110039</p>
            </div>
          </div>

          {/* IMAGE + FORM */}
          <div className="gen-contact-bottom-row">

            {/* Left Image */}
            <div className="gen-contact-img-col">
              <img src="/images/contact_message.jpg" alt="Contact Gen1eco" />
            </div>

            {/* Right Form */}
            <div className="gen-contact-form-col">
              <div className="gen-contact-form-box">
                <h2>Get In Touch 👋</h2>

                {/* ✅ Success */}
                {submitted && (
                  <div className="gen-contact-success">
                    ✅ Message sent successfully! We'll get back to you soon.
                  </div>
                )}

                {/* ✅ Error */}
                {error && (
                  <div className="gen-contact-error">
                    ❌ {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="gen-contact-form-grid">
                    <div className="gen-contact-field">
                      <label>Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Your name" />
                    </div>
                    <div className="gen-contact-field">
                      <label>Email</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="your@email.com" />
                    </div>
                    <div className="gen-contact-field">
                      <label>Phone</label>
                      <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div className="gen-contact-field">
                      <label>Subject</label>
                      <input type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="How can we help?" />
                    </div>
                    <div className="gen-contact-field gen-contact-form-full">
                      <label>Message</label>
                      <textarea name="message" value={formData.message} onChange={handleChange} required placeholder="Write your message here..." />
                    </div>
                  </div>
                  <button className="gen-contact-submit-btn" type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Send Message"} {!loading && "↗"}
                  </button>
                </form>

              </div>
            </div>
          </div>
        </div>

        {/* MAP */}
        <div className="gen-contact-map">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13986.60649380863!2d77.03555675450475!3d28.78964936474889!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d0787f1b17bc3%3A0x4d94f82771595950!2sSector%201%2C%20Bawana%2C%20Delhi%2C%20110039!5e0!3m2!1sen!2sin!4v1766404164847!5m2!1sen!2sin"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Gen1eco Location"
          />
        </div>

      </section>
    </>
  );
}