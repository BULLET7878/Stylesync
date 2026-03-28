import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/stylesync_logo.svg" alt="StyleSync" className="h-8 w-8 object-contain rounded bg-white shadow-sm" />
              <span className="font-bold text-xl tracking-tight text-gray-900">StyleSync</span>
            </Link>
            <p className="text-sm text-gray-500">
              The AI-powered fashion destination. Discover outfits tailored to your unique style and connect with the latest trends.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 tracking-wide uppercase text-sm">Shop</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/shop?category=shirts" className="hover:text-primary-600 transition-colors">Shirts</Link></li>
              <li><Link to="/shop?category=trousers" className="hover:text-primary-600 transition-colors">Trousers</Link></li>
              <li><Link to="/shop?category=shoes" className="hover:text-primary-600 transition-colors">Shoes</Link></li>
              <li><Link to="/shop?category=accessories" className="hover:text-primary-600 transition-colors">Accessories</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 tracking-wide uppercase text-sm">Company</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/about" className="hover:text-primary-600 transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-primary-600 transition-colors">Careers</Link></li>
              <li><Link to="/sustainability" className="hover:text-primary-600 transition-colors">Sustainability</Link></li>
              <li><Link to="/press" className="hover:text-primary-600 transition-colors">Press</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 tracking-wide uppercase text-sm">Support</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/help" className="hover:text-primary-600 transition-colors">Help Center</Link></li>
              <li><Link to="/shipping" className="hover:text-primary-600 transition-colors">Shipping & Returns</Link></li>
              <li><Link to="/size" className="hover:text-primary-600 transition-colors">Size Guide</Link></li>
              <li><Link to="/contact" className="hover:text-primary-600 transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} StyleSync Platform. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
