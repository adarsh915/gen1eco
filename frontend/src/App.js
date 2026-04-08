import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Checkout from "./components/Checkout";
import GuestCheckout from "./components/GuestCheckout";
import OrderConfirmation from "./components/OrderConfirmation";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import HeroSlider from "./components/HeroSlider";
import FeaturedProducts from "./components/FeaturedProducts";
import CategorySlider from "./components/CategorySlider";
import Gen1EcoBanner from "./components/Gen1EcoBanner";
import Beautysection from "./components/Beautysection";
import Beautyaddarea from "./components/Beautyaddarea";
import Beautyaddsection from "./components/Beautyaddsection";
import AboutUs from "./components/AboutUs";           // ← ADD
import Contact from "./components/Contact";
import DeepClean from "./components/DeepClean";
import ProductListing from "./components/ProductListing";
import PrivacyPolicy from "./components/PrivacyPolicy";
import ShippingPolicy from "./components/ShippingPolicy";
import ProductDetailPage from "./components/ProductDetailPage";
import ResetPassword from "./components/ResetPassword";
import Footer from "./components/Footer";
import SignIn from "./components/SignIn"
import Register from "./components/Register"
import Dashboard from "./components/DashBoard";
import CartPage from "./components/CartPage";
import BestSellingProducts from "./components/BestSellingProducts";
import NewArrivalProducts from "./components/NewArrivalProducts";
import ScrollToTop from "./components/ScrollToTop";
import Testimonials from "./components/Testimonials";
// LoginRequiredPopup removed in favor of toasts
import { useAuth } from "./context/AuthContext";
import { Navigate } from "react-router-dom";

const DashboardRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center mt-5">Loading...</div>;
  return user ? <Dashboard /> : <Navigate to="/login" />;
};

const LoginRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center mt-5">Loading...</div>;
  return user ? <Navigate to="/" /> : <SignIn />;
};

const RegisterRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center mt-5">Loading...</div>;
  return user ? <Navigate to="/" /> : <Register />;
};

const CheckoutRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center mt-5">Loading...</div>;
  return user ? <Checkout /> : <GuestCheckout />;
};

const RouteLogger = () => {
  const location = useLocation();

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      console.log(`🧭 [${timestamp}] Route Change: ${location.pathname}${location.search}${location.hash}`);
      if (location.state) {
        console.log(`📋 Route State:`, location.state);
      }
    }
  }, [location]);

  return null;
};


function App() {
  // App initialization logging (development only)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      console.log(`🚀 [${timestamp}] Gen1 Frontend App Started`);
      console.log(`🌐 API Base URL: ${process.env.REACT_APP_API_URL || 'Not configured'}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV}`);
    }
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <RouteLogger />
          <Navbar />
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

          <Routes>
            <Route path="/" element={
              <>
                <HeroSlider />
                <FeaturedProducts />
                <CategorySlider />
                <BestSellingProducts />

                <Beautyaddarea />

                <Beautyaddsection />

                <Beautysection />
                <NewArrivalProducts />
                {/* <PopularProducts /> */}
                <Gen1EcoBanner />
                <Testimonials />
              </>
            } />
            <Route path="/about" element={<AboutUs />} />  {/* ← ADD */}
            <Route path="/contact" element={<Contact />} />

            {/* Shop & Category Filter Routes */}
            <Route path="/products" element={<ProductListing />} />
            <Route path="/products/category/:categorySlug" element={<ProductListing />} />
            <Route path="/products/category/:categorySlug/:subCategorySlug" element={<ProductListing />} />

            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/shipping" element={<ShippingPolicy />} />
            <Route path="/login" element={<LoginRedirect />} />
            <Route path="/register" element={<RegisterRedirect />} />
            <Route path="/dashboard" element={<DashboardRedirect />} />
            <Route path="/checkout" element={<CheckoutRedirect />} />
            <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/:slug" element={<ProductDetailPage />} />

          </Routes>

          <Footer />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;