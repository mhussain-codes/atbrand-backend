import React from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import ScrollToTop from './components/ScrollToTop';
import { BuyProvider } from './contexts/BuyContext';
import { AuthProvider } from './contexts/AuthContext';

// Storefront Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import MensPage from './pages/MensPage';
import WomensPage from './pages/WomensPage';
import PerfumesPage from './pages/PerfumesPage';
import NewArrivalsPage from './pages/NewArrivalsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import StitchingPage from './pages/StitchingPage';
import TrackOrderPage from './pages/TrackOrderPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import SizeGuidePage from './pages/SizeGuidePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import { ShippingPolicyPage, ReturnPolicyPage, PrivacyPolicyPage, TermsPage } from './pages/PolicyPages';

// Admin Portal
import AdminDashboardPage from './pages/AdminDashboardPage';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <BuyProvider>
          <Routes>
            {/* Primary Storefront Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/men" element={<MensPage />} />
            <Route path="/women" element={<WomensPage />} />
            <Route path="/perfumes" element={<PerfumesPage />} />
            <Route path="/new-arrivals" element={<NewArrivalsPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/categories/:slug" element={<MensPage />} />
            <Route path="/stitching" element={<StitchingPage />} />
            <Route path="/track-order" element={<TrackOrderPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/size-guide" element={<SizeGuidePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />

            {/* Legal & Policy Routes */}
            <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
            <Route path="/return-policy" element={<ReturnPolicyPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />

            {/* Admin Backoffice Route */}
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/*" element={<AdminDashboardPage />} />

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BuyProvider>
      </AuthProvider>
      <Toaster richColors position="top-center" />
    </Router>
  );
}

export default App;
