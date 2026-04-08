import React, { useState, useEffect } from "react";
import api from "../api/axios";

const styles = `
  .beauty_add_area {
    padding: 0;
  }

  .mt_70 {
    margin-top: 70px;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
   
  }

  .col-lg-4 {
    flex: 0 0 33.3333%;
    max-width: 33.3333%;
    padding: 0 15px;
    box-sizing: border-box;
  }

  /* beauty add area start */
  .beauty_add_large {
    position: relative;
    margin-top: 25px;
    height: auto;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  }

  .beauty_add_large img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: fill;
    transition: transform 0.5s ease;
  }
  .beauty_add_large:hover img {
    transform: scale(1.05);
  }

  .beauty_add_large .text {
    position: absolute;
    top: 50%;
    left: 0;
    padding: 50px;
    max-width: 70%;
    transform: translateY(-50%);
    -webkit-transform: translateY(-50%);
    -moz-transform: translateY(-50%);
    -ms-transform: translateY(-50%);
    -o-transform: translateY(-50%);
  }

  .beauty_add_large .text h4 {
     font-size: 22px;
    
    font-weight: 600;
    letter-spacing: 1px;
    margin-top: 5px;
  }

  .beauty_add_large .text h2 {
    font-size: 24px;
    font-weight: 600;
    text-transform: revert;
    margin: 5px 0px 35px 0px;
  }

  .beauty_add_video {
    background-size: cover !important;
    background-position: center !important;
    background-repeat: no-repeat !important;
    position: relative;
    height: 470px;
    margin-top: 25px;
    border: 1px solid #eee;
  }

  .beauty_add_video_text {
    position: absolute;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: start;
    bottom: 0;
    left: 0;
    padding: 25px;
  }

  .beauty_add_video_text h2 {
    font-size: 35px;
    font-weight: 700;
    color: #fff;
  }

  .beauty_add_video_text a {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 1px;
    color: #fff;
  }

  .beauty_add_video_text a i {
    margin-left: 10px;
  }

  .beauty_add_large_2 .text {
    top: 0;
    padding: 40px;
    max-width: 65%;
    transform: translateY(0);
    -webkit-transform: translateY(0);
    -moz-transform: translateY(0);
    -ms-transform: translateY(0);
    -o-transform: translateY(0);
  }

 .common_btn {
  display: inline-flex;  /* or inline-block */
  align-items: center;
  background: #AB9774;
  color: white;
  text-decoration: none;
  padding: 12px 25px;
  text-transform: capitalize;
  font-weight: 500;
  font-size: 15px;
  transition: all 0.3s ease;
  -webkit-transition: all 0.3s ease;
  position: relative;   
  overflow: hidden;
z-index: 1;  
}

.common_btn i {
  display: inline-block;        /* target only the arrow icon */
  transform: rotate(-45deg);
  -webkit-transform: rotate(-45deg);
  transition: all 0.3s ease;
  margin-left: 8px;
}

.common_btn::after {
  position: absolute;
  content: "";
  width: 0;
  height: 100%;
  top: 0;
  right: 0;
  left: 0;
  z-index: -1;
  background: #333333;
  transition: all 0.3s ease;
  -webkit-transition: all 0.3s ease;
}

.common_btn:hover::after {
  width: 100%;               /* This triggers the fill animation on hover */
}

  .img-fluid {
    max-width: 100%;
    height: auto;
  }

  .w-100 {
    width: 100%;
  }

  /* beauty add area end */

  /* Responsive */
  @media (max-width: 991px) {
    .col-lg-4 {
      flex: 0 0 100%;
      max-width: 100%;
    }

    .beauty_add_large {
      height: 350px;
    }

    .beauty_add_large .text h2 {
      font-size: 26px;
    }

    .beauty_add_large .text h4 {
      font-size: 18px;
    }
  }

  @media (max-width: 576px) {
    .beauty_add_large {
      height: 280px;
    }

    .beauty_add_large .text {
      padding: 25px;
      max-width: 85%;
    }

    .beauty_add_large .text h2 {
      font-size: 20px;
      margin-bottom: 20px;
    }

    .beauty_add_large .text h4 {
      font-size: 16px;
    }
  }
`;

export default function BeautyAddSection() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await api.get('/users/three-boxes');
        if (response.data.success) {
          setBanners(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching three-box banners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (loading) return null;
  if (banners.length === 0) return null;

  return (
    <>
      <style>{styles}</style>
      <section className="beauty_add_area mt_70 pt-5 pb-5">
        <div className="container-fluid" style={{ maxWidth: '1415px', margin: '0 auto', padding: '0 20px' }}>
          <div className="row">
            {banners.map((banner, index) => (
              <div className="col-lg-4" key={banner.id || index}>
                <div className="beauty_add_large">
                  <img
                    src={`${process.env.REACT_APP_API_URL}/uploads/three-boxes/${banner.image}`}
                    alt={banner.heading}
                    className="img-fluid w-100"
                  />
                  <div className="text">
                    <h4>{banner.sub_heading}</h4>
                    <h2>{banner.heading}</h2>
                    <a className="common_btn" href={banner.button_link || "#"}>
                      {banner.button_text}
                      <i className="fas fa-long-arrow-right" aria-hidden="true"></i>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}