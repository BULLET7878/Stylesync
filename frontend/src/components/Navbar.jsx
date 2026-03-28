import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, LogOut, Heart } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const [isOpen, setIsOpen] = useState(false);
  const [searchWord, setSearchWord] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchWord.trim()) {
      navigate(`/shop?search=${searchWord}`);
      setIsOpen(false);
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <img src="/stylesync_logo.svg" alt="StyleSync" className="h-8 w-8 object-contain rounded shadow-sm mr-1 bg-white" />
              <span className="font-bold text-xl tracking-tight text-gray-900">StyleSync</span>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 items-center justify-center px-8">
            <form onSubmit={handleSearch} className="w-full max-w-lg relative group">
              <input
                type="text"
                placeholder="Search products, brands and categories..."
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all bg-gray-50/50 group-hover:bg-white"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 group-focus-within:text-primary-500" />
            </form>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/shop" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Shop</Link>
            
            <Link to="/wishlist" className="text-gray-600 hover:text-primary-600 relative transition-colors">
              <Heart className="h-6 w-6" />
            </Link>

            <Link to="/cart" className="text-gray-600 hover:text-primary-600 relative transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="text-gray-600 hover:text-primary-600 flex items-center gap-1 transition-colors">
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
                </Link>
                {user.role === 'seller' && (
                  <Link to="/seller/dashboard" className="text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors font-bold text-sm bg-primary-50 px-3 py-1 rounded-full">
                    Seller Panel
                  </Link>
                )}
                <button onClick={logout} className="text-gray-500 hover:text-red-500 transition-colors">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/register?role=seller" className="text-gray-600 hover:text-primary-600 text-sm font-medium transition-colors">
                  Become a Seller
                </Link>
                <Link to="/login" className="bg-primary-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md">
                  Sign In
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <Link to="/cart" className="text-gray-600 hover:text-primary-600 relative mr-4">
              <ShoppingCart className="h-6 w-6" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-primary-600 focus:outline-none">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg absolute w-full z-40">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <form onSubmit={handleSearch} className="mb-4 relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </form>
            <Link to="/shop" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50" onClick={() => setIsOpen(false)}>Shop</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50" onClick={() => setIsOpen(false)}>Dashboard</Link>
                <button onClick={() => { logout(); setIsOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-50">Logout</button>
              </>
            ) : (
              <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50" onClick={() => setIsOpen(false)}>Sign In</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
