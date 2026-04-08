import React from "react";
import { FaStar, FaQuoteLeft } from "react-icons/fa";

const testimonials = [
  {
    id: 1,
    name: "Anjali Sharma",
    role: "Verified Buyer",
    rating: 5,
    text: "I've been using Gen-1 Eco products for three months now, and the results are amazing. The laundry detergent is gentle on my clothes but tough on stains. Highly recommended!",
    avatar: "https://i.pravatar.cc/150?u=anjali"
  },
  {
    id: 2,
    name: "Rohan Gupta",
    role: "Regular Customer",
    rating: 5,
    text: "The floor cleaner has a lovely, fresh scent that isn't overpowering. It's great to know I'm using products that are safe for my pets and the environment.",
    avatar: "https://i.pravatar.cc/150?u=rohan"
  },
  {
    id: 3,
    name: "Sneha Kapoor",
    role: "Eco-Conscious Mom",
    rating: 4,
    text: "Finally found dish soap that doesn't dry out my hands! Gen-1 Eco is a game-changer for my kitchen routine. I love the mission behind the brand.",
    avatar: "https://i.pravatar.cc/150?u=sneha"
  }
];

const Testimonials = () => {
  return (
    <>
      <style>{`
        .testimonials-section {
          padding: 60px 0;
          background-color: #fdfaf7;
          text-align: center;
        }
        .testimonials-container {
          width: 100%;
          max-width: 1415px;
          margin: 0 auto;
          padding: 0 20px;
          box-sizing: border-box;
        }
        .testimonials-header {
          margin-bottom: 45px;
        }
        .testimonials-header h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 38px;
          font-weight: 700;
          color: #1a3020;
          margin-bottom: 10px;
        }
        .testimonials-header p {
          font-family: 'DM Sans', sans-serif;
          font-size: 16px;
          color: #6b6b6b;
          max-width: 600px;
          margin: 0 auto;
        }
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
        }
        .testimonial-card {
          background: #fff;
          padding: 35px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          position: relative;
          text-align: left;
        }
        .testimonial-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
        }
        .quote-icon {
          position: absolute;
          top: 20px;
          right: 25px;
          color: rgba(184, 151, 58, 0.15);
          font-size: 40px;
        }
        .stars {
          color: #b8973a;
          margin-bottom: 15px;
          display: flex;
          gap: 4px;
        }
        .testimonial-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          line-height: 1.6;
          color: #444;
          margin-bottom: 25px;
          font-style: italic;
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .user-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #b8973a;
        }
        .user-details h4 {
          font-family: 'DM Sans', sans-serif;
          font-size: 16px;
          font-weight: 600;
          color: #1a3020;
          margin: 0;
        }
        .user-details span {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #b8973a;
        }

        @media (max-width: 768px) {
          .testimonials-header h2 { font-size: 32px; }
          .testimonial-card { padding: 25px; }
        }
      `}</style>

      <section className="testimonials-section">
        <div className="testimonials-container">
          <div className="testimonials-header">
            <h2>What Our Customers Say</h2>
            <p>Real stories from real customers who have embraced a cleaner, greener lifestyle with Gen-1 Eco.</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t) => (
              <div key={t.id} className="testimonial-card">
                <FaQuoteLeft className="quote-icon" />
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} style={{ opacity: i < t.rating ? 1 : 0.3 }} />
                  ))}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="user-info">
                  <img src={t.avatar} alt={t.name} className="user-avatar" />
                  <div className="user-details">
                    <h4>{t.name}</h4>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Testimonials;
