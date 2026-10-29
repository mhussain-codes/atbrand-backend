import React from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import ScrollToTop from './components/ScrollToTop';
import { BuyProvider } from './contexts/BuyContext';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import NewArrivalsPage from './pages/NewArrivalsPage';
import TrackOrderPage from './pages/TrackOrderPage';
import ContactPage from './pages/ContactPage';

function App() {
    return (
        <Router>
            <ScrollToTop />
            <BuyProvider>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    
                    {/* This safely redirects the blank /home page to your real homepage */}
                    <Route path="/home" element={<Navigate to="/" replace />} />
                    
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/new-arrivals" element={<NewArrivalsPage />} />
                    <Route path="/track-order" element={<TrackOrderPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                </Routes>
            </BuyProvider>
            <Toaster richColors position="top-center" />
        </Router>
    );
}

export default App;