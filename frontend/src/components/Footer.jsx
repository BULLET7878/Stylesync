import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                <img src="/swastik.svg" alt="StyleSync" className="w-5 h-5 brightness-0 invert" />
              </div>
              <span className="font-black text-xl text-white">StyleSync</span>
            </Link>
            <p className="text-sm leading-relaxed mb-5 max-w-xs">
              India's modern fashion marketplace. Discover curated styles from independent sellers and top brands.
            </p>

          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Men's Fashion", to: "/shop?category=Shirts" },
                { label: "T-Shirts", to: "/shop?category=T-Shirts" },
                { label: "Footwear", to: "/shop?category=Shoes" },
                { label: "Accessories", to: "/shop?category=Accessories" },
                { label: "Ethnic Wear", to: "/shop?category=Ethnic Wear" },
                { label: "Sale", to: "/shop?sort=price_asc" },
              ].map(l => (
                <li key={l.label}><Link to={l.to} className="hover:text-white transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Sellers */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Sellers</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Start Selling", to: "/register?role=seller" },
                { label: "Seller Dashboard", to: "/seller/dashboard" },
                { label: "Add Product", to: "/seller/product/new" },
                { label: "Seller Guide", to: "/help" },
                { label: "Pricing", to: "/about" },
              ].map(l => (
                <li key={l.label}><Link to={l.to} className="hover:text-white transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Support</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Help Center", to: "/help" },
                { label: "Shipping Info", to: "/shipping" },
                { label: "Returns", to: "/shipping" },
                { label: "Size Guide", to: "/size" },
                { label: "Contact Us", to: "/contact" },
                { label: "Privacy Policy", to: "/privacy" },
              ].map(l => (
                <li key={l.label}><Link to={l.to} className="hover:text-white transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Strip */}
        <div className="mt-12 pt-8 border-t border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <Mail className="w-4 h-4" />, text: "support@stylesync.com" },
            { icon: <Phone className="w-4 h-4" />, text: "+91 90248 50689" },
            { icon: <MapPin className="w-4 h-4" />, text: "Indiranagar, Bangalore" },
          ].map((c, i) => (
            <div key={i} className="flex items-center gap-2.5 text-sm">
              <div className="text-primary-400">{c.icon}</div>
              <span>{c.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© {new Date().getFullYear()} StyleSync Platform. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
