import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ProductContext } from '../context/ProductContext';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { AuthContext } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { Filter, Search, Star, X, SlidersHorizontal, LayoutGrid, List, ShoppingCart, Heart } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-toastify';

const CATEGORIES = ['All', 'Shirts', 'T-Shirts', 'Trousers', 'Jeans', 'Shoes', 'Accessories', 'Ethnic Wear'];

const Shop = () => {
  const { products, loading, searchProducts } = useContext(ProductContext);
  const location = useLocation();
  const navigate = useNavigate();
  const sp = new URLSearchParams(location.search);

  const keywordParam  = sp.get('search') || '';
  const categoryParam = sp.get('category') || '';
  const sortParam     = sp.get('sort') || '';
  const minPriceParam = sp.get('minPrice') || '';
  const maxPriceParam = sp.get('maxPrice') || '';
  const ratingParam   = sp.get('rating') || '';

  const [keyword, setKeyword]         = useState(keywordParam);
  const [selectedCat, setSelectedCat] = useState(categoryParam || 'All');
  const [sort, setSort]               = useState(sortParam);
  const [minPrice, setMinPrice]       = useState(minPriceParam);
  const [maxPrice, setMaxPrice]       = useState(maxPriceParam);
  const [minRating, setMinRating]     = useState(ratingParam);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode]       = useState('grid');

  useEffect(() => {
    searchProducts(keywordParam, categoryParam === 'All' ? '' : categoryParam, sortParam, minPriceParam, maxPriceParam, ratingParam);
    setKeyword(keywordParam);
    setSelectedCat(categoryParam || 'All');
    setSort(sortParam);
    setMinPrice(minPriceParam);
    setMaxPrice(maxPriceParam);
    setMinRating(ratingParam);
    // eslint-disable-next-line
  }, [keywordParam, categoryParam, sortParam, minPriceParam, maxPriceParam, ratingParam]);

  const updateUrl = (kw, cat, s, min, max, rat) => {
    const params = new URLSearchParams();
    if (kw)  params.set('search', kw);
    if (cat && cat !== 'All') params.set('category', cat);
    if (s)   params.set('sort', s);
    if (min) params.set('minPrice', min);
    if (max) params.set('maxPrice', max);
    if (rat) params.set('rating', String(rat));
    navigate(`/shop?${params.toString()}`);
  };

  const handleSearch = (e) => { e.preventDefault(); updateUrl(keyword, selectedCat, sort, minPrice, maxPrice, minRating); };
  const handleCat    = (c) => { setSelectedCat(c); updateUrl(keyword, c, sort, minPrice, maxPrice, minRating); };
  const handleSort   = (v) => { setSort(v); updateUrl(keyword, selectedCat, v, minPrice, maxPrice, minRating); };
  const handleReset  = () => { setKeyword(''); setSelectedCat('All'); setSort(''); setMinPrice(''); setMaxPrice(''); setMinRating(''); navigate('/shop'); };

  const activeFiltersCount = [selectedCat !== 'All' && selectedCat, minPrice, maxPrice, minRating, sort].filter(Boolean).length;

  const FilterPanel = () => (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text" placeholder="Search products..."
          value={keyword} onChange={(e) => setKeyword(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm bg-gray-50 focus:bg-white transition-all"
        />
      </form>

      <div>
        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Category</p>
        <div className="space-y-0.5">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => handleCat(c)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedCat.toLowerCase() === c.toLowerCase() ? 'bg-primary-600 text-white font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
            >{c}</button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Price Range (₹)</p>
        <div className="grid grid-cols-2 gap-2">
          <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-400 outline-none bg-gray-50" />
          <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-400 outline-none bg-gray-50" />
        </div>
      </div>

      <div>
        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Min Rating</p>
        <div className="space-y-0.5">
          {[4, 3, 2, 1].map((r) => (
            <button key={r} onClick={() => { setMinRating(r); updateUrl(keyword, selectedCat, sort, minPrice, maxPrice, r); }}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-all ${Number(minRating) === r ? 'bg-primary-600 text-white font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <div className="flex text-yellow-400">
                {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= r ? 'fill-current' : 'opacity-30'}`} />)}
              </div>
              {r}+ Stars
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-gray-100">
        <button onClick={() => { updateUrl(keyword, selectedCat, sort, minPrice, maxPrice, minRating); setMobileFiltersOpen(false); }}
          className="w-full bg-primary-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 transition-all">
          Apply Filters
        </button>
        <button onClick={handleReset} className="w-full text-gray-500 text-xs py-1.5 hover:text-gray-700 transition-colors">
          Reset All
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">
            {keywordParam ? `Results for "${keywordParam}"` : selectedCat !== 'All' ? selectedCat : 'All Products'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{products.length} products found</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Desktop */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-28">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-black text-gray-900 flex items-center gap-2 text-sm">
                  <SlidersHorizontal className="w-4 h-4 text-primary-600" /> Filters
                </h3>
                {activeFiltersCount > 0 && (
                  <span className="bg-primary-600 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <FilterPanel />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 mb-5 bg-white rounded-xl border border-gray-100 px-4 py-3">
              <button onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-primary-600 transition-colors">
                <Filter className="w-4 h-4" /> Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-primary-600 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">{activeFiltersCount}</span>
                )}
              </button>

              <div className="flex items-center gap-3 ml-auto">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium hidden sm:block">Sort:</span>
                  <select value={sort} onChange={(e) => handleSort(e.target.value)}
                    className="text-sm font-bold text-gray-700 bg-gray-100 border-none rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer">
                    <option value="">Newest</option>
                    <option value="price_asc">Price: Low → High</option>
                    <option value="price_desc">Price: High → Low</option>
                    <option value="popularity">Most Popular</option>
                  </select>
                </div>
                <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}>
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}>
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filter Tags */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCat !== 'All' && selectedCat && (
                  <span className="flex items-center gap-1.5 bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-full">
                    {selectedCat} <button onClick={() => handleCat('All')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {minPrice && (
                  <span className="flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
                    Min ₹{minPrice} <button onClick={() => { setMinPrice(''); updateUrl(keyword, selectedCat, sort, '', maxPrice, minRating); }}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {maxPrice && (
                  <span className="flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
                    Max ₹{maxPrice} <button onClick={() => { setMaxPrice(''); updateUrl(keyword, selectedCat, sort, minPrice, '', minRating); }}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {minRating && (
                  <span className="flex items-center gap-1.5 bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">
                    {minRating}+ Stars <button onClick={() => { setMinRating(''); updateUrl(keyword, selectedCat, sort, minPrice, maxPrice, ''); }}><X className="w-3 h-3" /></button>
                  </span>
                )}
                <button onClick={handleReset} className="text-xs text-red-500 font-bold hover:underline px-2">Clear All</button>
              </div>
            )}

            {/* Products Grid/List */}
            {loading ? (
              <div className={`grid gap-4 ${viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
                {[1,2,3,4,5,6].map(n => <div key={n} className="skeleton rounded-2xl aspect-[3/4]" />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 text-sm mb-6">Try adjusting your search or filters.</p>
                <button onClick={handleReset} className="bg-primary-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 transition-all">
                  Clear Filters
                </button>
              </div>
            ) : viewMode === 'list' ? (
              <div className="space-y-3">
                {products.map(p => <ListProductCard key={p._id} product={p} />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {products.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/40 z-[200] lg:hidden" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white z-[201] overflow-y-auto p-5 lg:hidden">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-black text-gray-900 text-lg">Filters</h3>
                <button onClick={() => setMobileFiltersOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FilterPanel />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// List view card component
const ListProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);
  const { user } = useContext(AuthContext);
  const isWishlisted = isInWishlist(product._id);
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const imgSrc = product.images?.[0]?.startsWith('http') ? product.images[0] : `${API}${product.images?.[0]}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 hover:shadow-md transition-shadow">
      <a href={`/product/${product._id}`} className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
        <img src={imgSrc} alt={product.title} loading="lazy" className="w-full h-full object-cover"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80'; }} />
      </a>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-primary-600 uppercase tracking-wider mb-0.5">{product.category}</p>
        <a href={`/product/${product._id}`} className="font-bold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 text-sm">{product.title}</a>
        <div className="flex items-center gap-1 mt-1">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs text-gray-600 font-medium">{Number(product.rating).toFixed(1)} ({product.numReviews})</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className={`font-black text-base ${hasDiscount ? 'text-red-600' : 'text-gray-900'}`}>₹{displayPrice.toLocaleString()}</span>
          {hasDiscount && <span className="text-xs text-gray-400 line-through">₹{product.price.toLocaleString()}</span>}
        </div>
      </div>
      {user?.role !== 'seller' && (
        <div className="flex flex-col gap-2 justify-center">
          <button onClick={() => { addToCart(product, 1); toast.success('Added!'); }}
            className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
            <ShoppingCart className="w-4 h-4" />
          </button>
          <button onClick={() => isWishlisted ? removeFromWishlist(product._id) : addToWishlist(product._id)}
            className={`p-2 rounded-xl transition-colors ${isWishlisted ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-500 hover:text-red-500'}`}>
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Shop;
