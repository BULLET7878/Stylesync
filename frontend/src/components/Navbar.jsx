import { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Menu, X, Search, LogOut,
  Heart, ChevronDown, Package, Store, User
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const { wishlist } = useContext(WishlistContext);
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchWord, setSearchWord] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchWord.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchWord.trim())}`);
      setSearchWord('');
      setIsOpen(false);
    }
  };

  const isSeller = user?.role === 'seller';
  const cartCount = (cartItems || []).reduce((acc, item) => acc + item.qty, 0);

  return (
    <>
      {/* Announcement Bar — buyers only */}
      {!isSeller && (
        <div className="bg-primary-600 text-white text-xs font-semibold text-center py-2 px-4 tracking-wide">
          🎉 Free shipping on orders above ₹999 &nbsp;·&nbsp; Use code <span className="font-black underline">STYLE10</span> for 10% off
        </div>
      )}
      {/* Seller announcement bar */}
      {isSeller && (
        <div className="bg-amber-600 text-white text-xs font-semibold text-center py-2 px-4 tracking-wide">
          Seller Mode — <Link to="/seller/dashboard" className="underline font-black">Open Dashboard</Link> &nbsp;·&nbsp; <Link to="/seller/product/new" className="underline font-black">Add Product</Link>
        </div>
      )}

      <nav className="bg-white sticky top-0 z-[100] border-b border-gray-200 shadow-sm">
        {/* Main Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            <Link 
              to="/" 
              className="flex items-center gap-2.5 flex-shrink-0 group no-underline"
              onClick={(e) => {
                if (location.pathname === '/') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              <img src="/logo.png?v=5" alt="logo" className="h-10 w-auto object-contain" />
              <div className="flex items-center text-gray-900 font-black">
                <span className="text-3xl leading-none tracking-tighter mr-1 uppercase">S</span>
                <div className="flex flex-col text-[0.55rem] leading-[1.1] uppercase tracking-[0.25em] mt-1">
                <span>tyle</span>
                <span>ync</span>
              </div>
              </div>
            </Link>

            {/* Search Bar — Desktop */}
            <form
              onSubmit={handleSearch}
              className={`hidden md:flex flex-1 max-w-2xl mx-6 relative transition-all ${searchFocused ? 'max-w-3xl' : ''}`}
            >
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for clothes, brands, styles..."
                  value={searchWord}
                  onChange={(e) => setSearchWord(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 border border-transparent focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm font-medium transition-all placeholder:text-gray-400"
                />
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              {/* Wishlist — buyers only */}
              {!isSeller && (
                <Link
                  to="/wishlist"
                  className="relative p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all hidden md:flex"
                  title="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                  {wishlist?.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-black rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5 border-2 border-white">
                      {wishlist.length > 9 ? '9+' : wishlist.length}
                    </span>
                  )}
                </Link>
              )}

              {/* Cart — buyers only */}
              {!isSeller && (
                <Link
                  to="/cart"
                  className="relative p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                  title="Cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-[9px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border-2 border-white"
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </motion.span>
                  )}
                </Link>
              )}

              {/* User Menu */}
              {user ? (
                <div className="relative hidden md:block" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-black text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-gray-800 max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-gray-50">
                          <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                          <p className="font-bold text-gray-900 truncate">{user.name}</p>
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 inline-block ${user.role === 'seller' ? 'bg-amber-100 text-amber-700' : 'bg-primary-100 text-primary-700'}`}>
                            {user.role}
                          </span>
                        </div>
                        <div className="py-1">
                          {!isSeller && (
                            <>
                              <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                <User className="w-4 h-4 text-gray-400" /> My Account
                              </Link>
                              <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                <Package className="w-4 h-4 text-gray-400" /> My Orders
                              </Link>
                              <Link to="/wishlist" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                <Heart className="w-4 h-4 text-gray-400" /> Wishlist
                              </Link>
                            </>
                          )}
                          {isSeller && (
                            <Link to="/seller/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-amber-700 hover:bg-amber-50 transition-colors">
                              <Store className="w-4 h-4" /> Seller Dashboard
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-gray-50 pt-1">
                          <button
                            onClick={() => { logout(); setProfileOpen(false); }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/login" className="px-4 py-2 text-sm font-bold text-gray-700 hover:text-primary-600 transition-colors">
                    Sign In
                  </Link>
                  <Link to="/register" className="px-4 py-2 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 transition-all shadow-sm">
                    Join Free
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Category Nav Row — buyers only */}
        {!isSeller && (
        <div className="hidden md:block border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 h-11 overflow-x-auto scrollbar-hide py-1">
              <Link to="/shop" className="whitespace-nowrap px-4 py-1.5 text-xs font-black text-gray-600 hover:text-primary-600 border-b-2 border-transparent hover:border-primary-600 transition-all uppercase tracking-[0.1em]">All</Link>
              <span className="w-px h-4 bg-gray-200 mx-1 flex-shrink-0" />
              {['Men', 'Women', 'Kids'].map(sec => (
                <Link key={sec}
                  to={`/shop?section=${sec}`}
                  className="whitespace-nowrap px-4 py-1.5 text-xs font-black text-primary-700 hover:text-primary-600 border-b-2 border-transparent hover:border-primary-600 transition-all uppercase tracking-[0.1em]">
                  {sec}
                </Link>
              ))}
              <span className="w-px h-4 bg-gray-200 mx-1 flex-shrink-0" />
              {['Shirts', 'T-Shirts', 'Jeans', 'Trousers', 'Shoes', 'Accessories', 'Ethnic Wear'].map((cat) => (
                <Link key={cat}
                  to={`/shop?category=${cat}`}
                  className="whitespace-nowrap px-4 py-1.5 text-xs font-black text-gray-600 hover:text-primary-600 border-b-2 border-transparent hover:border-primary-600 transition-all uppercase tracking-[0.1em]">
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* Seller quick-nav row */}
        {isSeller && (
        <div className="hidden md:block border-t border-amber-100 bg-amber-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 h-11">
              <Link to="/seller/dashboard" className="text-xs font-black text-amber-700 hover:text-amber-900 uppercase tracking-widest transition-colors">Dashboard</Link>
              <Link to="/seller/product/new" className="text-xs font-black text-amber-700 hover:text-amber-900 uppercase tracking-widest transition-colors">+ Add Product</Link>
              <Link to="/seller/dashboard" className="text-xs font-black text-amber-700 hover:text-amber-900 uppercase tracking-widest transition-colors">Orders</Link>
            </div>
          </div>
        </div>
        )}

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="p-4 space-y-3">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search styles..."
                    value={searchWord}
                    onChange={(e) => setSearchWord(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 outline-none text-sm font-medium"
                  />
                </form>

                {/* Mobile Categories — buyers only */}
                {!isSeller && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {['Men', 'Women', 'Kids', 'Shirts', 'Shoes', 'Jeans', 'Ethnic'].map((cat) => (
                    <button 
                      key={cat} 
                      onClick={() => {
                        const path = ['Men', 'Women', 'Kids'].includes(cat) ? `/shop?section=${cat}` : `/shop?category=${cat}`;
                        navigate(path);
                        setIsOpen(false);
                      }}
                      className="bg-gray-50 text-gray-600 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-gray-100 uppercase tracking-wider"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                )}

                <div className="border-t border-gray-100 pt-3 space-y-1">
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-2">
                        <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white font-black">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                          <span className={`text-[10px] font-black uppercase ${user.role === 'seller' ? 'text-amber-600' : 'text-primary-600'}`}>{user.role}</span>
                        </div>
                      </div>
                      {!isSeller && (
                        <>
                          <Link to="/dashboard" className="flex items-center gap-3 p-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium text-sm">
                            <Package className="w-4 h-4 text-gray-400" /> My Orders
                          </Link>
                          <Link to="/wishlist" className="flex items-center gap-3 p-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium text-sm">
                            <Heart className="w-4 h-4 text-gray-400" /> Wishlist
                          </Link>
                        </>
                      )}
                      {isSeller && (
                        <Link to="/seller/dashboard" className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 text-amber-700 font-bold text-sm">
                          <Store className="w-4 h-4" /> Seller Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => logout()}
                        className="flex items-center gap-3 w-full p-3 rounded-xl text-red-500 hover:bg-red-50 font-medium text-sm"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Link to="/login" className="flex items-center justify-center p-3 rounded-xl border border-gray-200 font-bold text-sm text-gray-700">
                        Sign In
                      </Link>
                      <Link to="/register" className="flex items-center justify-center p-3 rounded-xl bg-primary-600 text-white font-bold text-sm">
                        Join Free
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
