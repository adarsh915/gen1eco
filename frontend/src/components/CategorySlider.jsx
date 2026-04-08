import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import api from "../api/axios"; // ✅ import axios

const CategorySlider = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [extendedCategories, setExtendedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const intervalRef = useRef(null);

  const normalizeSlug = (value) =>
    String(value || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  const handleCategoryClick = (cat) => {
    const slug = normalizeSlug(cat.slug || cat.name);
    if (!slug) return;
    navigate(`/products?category=${slug}`);
  };

  // Update visibleCount based on window width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 480) {
        setVisibleCount(2);
      } else if (window.innerWidth <= 768) {
        setVisibleCount(3);
      } else if (window.innerWidth <= 1024) {
        setVisibleCount(4);
      } else if (window.innerWidth <= 1200) {
        setVisibleCount(5);
      } else {
        setVisibleCount(6);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Fetch categories from backend
  useEffect(() => {
    api.get('/category/all')
      .then(res => {
        if (res.data.success) {
          const data = res.data.data;
          setCategories(data);
          // build extended list for infinite loop using fixed reference for safety
          const extended = [
            ...data,
            ...data.slice(0, 10).map(c => ({ ...c, id: c.id + 1000 })),
          ];
          setExtendedCategories(extended);
        }
      })
      .catch(err => console.error('Category fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  // ✅ Start autoplay only after data loads
  const startAutoPlay = useCallback(() => {
    if (categories.length === 0) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next >= categories.length) {
          setTimeout(() => {
            setIsTransitioning(false);
            setCurrentIndex(0);
          }, 500);
        }
        setIsTransitioning(true);
        return next;
      });
    }, 2500);
  }, [categories.length]);

  const stopAutoPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      startAutoPlay();
      return () => stopAutoPlay();
    }
  }, [categories.length, startAutoPlay, stopAutoPlay]);

  const prev = () => {
    stopAutoPlay();
    if (currentIndex <= 0) {
      setIsTransitioning(false);
      setCurrentIndex(categories.length);
      setTimeout(() => {
        setIsTransitioning(true);
        setCurrentIndex(categories.length - 1);
      }, 20);
    } else {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev - 1);
    }
    startAutoPlay();
  };

  const next = () => {
    stopAutoPlay();
    setIsTransitioning(true);
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= categories.length) {
        setTimeout(() => {
          setIsTransitioning(false);
          setCurrentIndex(0);
        }, 500);
      }
      return next;
    });
    startAutoPlay();
  };

  // ✅ Loading state
  if (loading) {
    return (
      <section style={styles.section}>
        <img src="/images/533c585c67eb1c9e1939a8ee0c471b1b.gif" alt="bg" style={styles.bgImg} />
        <div style={styles.overlay} />
        <div style={{ zIndex: 2, color: '#fff', margin: 'auto', fontSize: '18px' }}>
          Loading categories...
        </div>
      </section>
    );
  }

  return (
    <section style={styles.section}>

      {/* Background Image */}
      {/* <img src="/images/533c585c67eb1c9e1939a8ee0c471b1b.gif" alt="bg" style={styles.bgImg} /> */}
      <div style={{ backgroundColor: '#018bf7' }}></div>
      <div style={styles.overlay} />

      {/* Prev Button */}
      <button style={{ ...styles.arrowBtn, left: "2%" }} onClick={prev}>
        <FaChevronLeft size={14} />
      </button>

      {/* Slider */}
      <div className="cat-slider-container" style={styles.sliderWrapper}>
        <div
          style={{
            ...styles.sliderTrack,
            width: `${(extendedCategories.length / visibleCount) * 100}%`,
            transform: `translateX(-${currentIndex * (100 / extendedCategories.length)}%)`,
            transition: isTransitioning ? "transform 0.5s ease" : "none",
          }}
        >
          {extendedCategories.map((cat, index) => (
            <div
              key={`${cat.id}-${index}`}
              style={{
                ...styles.card,
                width: `${100 / extendedCategories.length}%`,
              }}
              onClick={() => handleCategoryClick(cat)}
              onMouseEnter={() => window.innerWidth > 768 && setHoveredId(cat.id)}
              onMouseLeave={() => window.innerWidth > 768 && setHoveredId(null)}
            >

              <div
                style={{
                  ...styles.circle,
                  border: hoveredId === cat.id
                    ? "3px solid #fff"
                    : "4px solid rgba(255,255,255,0.7)",
                  transition: "all 0.3s ease",
                }}
              >
                <img
                  src={
                    cat.image
                      ? `${process.env.REACT_APP_API_URL}/uploads/categories/${cat.image}`
                      : `${process.env.REACT_APP_API_URL}/images/placeholder.jpg`
                  }
                  alt={cat.name}
                  style={{
                    ...styles.img,
                    transform: hoveredId === cat.id ? "scale(1.15)" : "scale(1)",
                  }}
                  onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
                />
              </div>

              <p style={{
                ...styles.name,
                color: hoveredId === cat.id ? "#fff" : "rgba(255,255,255,0.95)",
                fontWeight: hoveredId === cat.id ? "700" : "500",
              }}>
                {cat.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Next Button */}
      <button style={{ ...styles.arrowBtn, right: "2%", background: "rgba(255,255,255,0.95)" }} onClick={next}>
        <FaChevronRight size={14} />
      </button>
    </section>
  );
};

const styles = {
  section: {
    position: "relative",
    background: "#018BF7",
    padding: "40px 0",
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
    minHeight: "260px",
  },
  bgImg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: 0,
    opacity: 0.35,
  },
  overlay: {
    position: "absolute",
    inset: 0,
    zIndex: 1,
  },
  arrowBtn: {
    position: "absolute",
    zIndex: 10,
    width: "40px",
    height: "40px",
    borderRadius: "0",
    borderTopLeftRadius: "15px",
    borderBottomRightRadius: "15px",
    border: "none",
    background: "#fff",
    color: "#333",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    flexShrink: 0,
  },
  sliderWrapper: {
    width: "84%",
    maxWidth: "1350px",
    margin: "0 auto",
    overflow: "hidden",
    position: "relative",
    zIndex: 2,
    boxSizing: "border-box",
  },
  sliderTrack: {
    display: "flex",
    willChange: "transform",
    alignItems: "flex-start",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    gap: "14px",
    padding: "0 5px",
    boxSizing: "border-box",
    flexShrink: 0,
  },
  circle: {
    width: "135px",
    height: "135px",
    borderRadius: "50%",
    overflow: "hidden",
    flexShrink: 0,
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.4s ease",
  },
  name: {
    fontSize: "14px",
    textAlign: "center",
    margin: 0,
    lineHeight: "1.4",
    minHeight: "40px", // ← Add this line (Approx 2 lines of text)
  },
};

export default CategorySlider;