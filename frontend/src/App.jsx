import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import Wishlist from './pages/Wishlist';
import SellerDashboard from './pages/SellerDashboard';
import ProductEdit from './pages/ProductEdit';
import OrderSuccess from './pages/OrderSuccess';
import Info from './pages/Info';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success" element={<OrderSuccess />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="seller/dashboard" element={<SellerDashboard />} />
          <Route path="seller/product/new" element={<ProductEdit />} />
          <Route path="seller/product/edit/:id" element={<ProductEdit />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="about" element={<Info />} />
          <Route path="careers" element={<Info />} />
          <Route path="sustainability" element={<Info />} />
          <Route path="press" element={<Info />} />
          <Route path="help" element={<Info />} />
          <Route path="shipping" element={<Info />} />
          <Route path="size" element={<Info />} />
          <Route path="contact" element={<Info />} />
          <Route path="privacy" element={<Info />} />
          <Route path="terms" element={<Info />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
