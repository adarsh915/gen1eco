import { useState, useEffect, useRef, useCallback } from "react";
import api from "../api/axios";

// Original code replaced to display ONLY a full-screen slider showing the backend image

const HeroSlider = () => {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const animatingRef = useRef(false);
  const timerRef = useRef(null);

  // Fetch dynamic slides from backend
  useEffect(() => {
    api.get('/main-slider/api')
      .then(res => {
        if (res.data.success && res.data.data.length > 0) {
          setSlides(res.data.data);
        }
      })
      .catch(err => console.error("Error fetching main slider:", err));
  }, []);

  const goTo = useCallback((index) => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    setAnimating(true);
    setCurrent((prev) => (typeof index === "function" ? index(prev) : index));
    setTimeout(() => {
      animatingRef.current = false;
      setAnimating(false);
    }, 600);
  }, []);

  // Auto-play: restart timer whenever current slide changes
  useEffect(() => {
    if (slides.length === 0) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      goTo((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, [current, goTo, slides.length]);

  if (slides.length === 0) return null; // Or a loading spinner

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  return (
    <>
      <style>{`
        /* Hero Slider Container */
        .hero-slider-wrapper {
          position: relative;
          width: 100%;
          overflow: hidden;
          background: #f5f5f5;
        }

        /* Desktop - Full height hero */
        .hero-slider-wrapper {
          height: 85vh;
          min-height: 650px;
          max-height: 900px;
        }

        /* Large Tablet (iPad Pro) */
        @media (max-width: 1200px) {
          .hero-slider-wrapper {
            height: 75vh;
            min-height: 550px;
            max-height: 800px;
          }
        }

        /* Tablet (iPad) */
        @media (max-width: 1024px) {
          .hero-slider-wrapper {
            height: 65vh;
            min-height: 450px;
            max-height: 700px;
          }
        }

        /* Small Tablet */
        @media (max-width: 768px) {
          .hero-slider-wrapper {
            height: 50vh;
            min-height: 350px;
            max-height: 550px;
          }
        }

        /* Large Mobile (iPhone Plus, etc) */
        @media (max-width: 600px) {
          .hero-slider-wrapper {
            height: 40vh;
            min-height: 280px;
          }
        }

        /* Mobile (35vh as per requirement) */
        @media (max-width: 480px) {
          .hero-slider-wrapper {
            height: 35vh;
            min-height: 240px;
          }
        }

        /* Small Mobile */
        @media (max-width: 375px) {
          .hero-slider-wrapper {
            height: 35vh;
            min-height: 220px;
          }
        }

        /* Slide Styles */
        .hero-slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          transition: opacity 0.8s ease-in-out;
          z-index: 1;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .hero-slide.active {
          opacity: 1;
          z-index: 10;
        }

        /* Navigation Indicators */
        .hero-indicators {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 12px;
          z-index: 20;
        }

        @media (max-width: 768px) {
          .hero-indicators {
            bottom: 16px;
            gap: 10px;
          }
        }

        @media (max-width: 480px) {
          .hero-indicators {
            bottom: 12px;
            gap: 8px;
          }
        }

        /* Indicator Dot */
        .hero-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.4);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .hero-dot:hover {
          background-color: rgba(255, 255, 255, 0.7);
        }

        .hero-dot.active {
          background-color: #fff;
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
        }

        @media (max-width: 480px) {
          .hero-dot {
            width: 8px;
            height: 8px;
          }
        }
      `}</style>

      <div className="hero-slider-wrapper">
        {slides.map((slide, index) => {
          const bgImage = slide.image_large ? `${API_URL}/uploads/sliders/${slide.image_large}` : "/images/herobanner.gif";
          const isActive = index === current;

          return (
            <div
              key={slide.id || index}
              className={`hero-slide ${isActive ? 'active' : ''}`}
              style={{
                backgroundImage: `url('${bgImage}')`,
              }}
            />
          );
        })}

        {/* Navigation Indicators */}
        <div className="hero-indicators">
          {slides.map((_, idx) => (
            <button
              key={idx}
              className={`hero-dot ${idx === current ? 'active' : ''}`}
              onClick={() => goTo(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default HeroSlider;