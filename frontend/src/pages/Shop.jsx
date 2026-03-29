import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ProductContext } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import { Filter, Search, Star } from 'lucide-react';

const categories = ['All', 'Shirts', 'T-Shirts', 'Trousers', 'Jeans', 'Shoes', 'Accessories', 'Ethnic Wear'];

const Shop = () => {
  const { products, loading, searchProducts } = useContext(ProductContext);
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const keywordParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';
  const sortParam = searchParams.get('sort') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const ratingParam = searchParams.get('rating') || '';

  const [keyword, setKeyword] = useState(keywordParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'All');
  const [sort, setSort] = useState(sortParam);
  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);
  const [minRating, setMinRating] = useState(ratingParam);

  useEffect(() => {
    searchProducts(
      keywordParam, 
      categoryParam === 'All' ? '' : categoryParam, 
      sortParam,
      minPriceParam,
      maxPriceParam,
      ratingParam
    );
    setKeyword(keywordParam);
    setSelectedCategory(categoryParam || 'All');
    setSort(sortParam);
    setMinPrice(minPriceParam);
    setMaxPrice(maxPriceParam);
    setMinRating(ratingParam);
    // eslint-disable-next-line
  }, [keywordParam, categoryParam, sortParam, minPriceParam, maxPriceParam, ratingParam]);

  const handleSearch = (e) => {
    e.preventDefault();
    updateUrl(keyword, selectedCategory, sort, minPrice, maxPrice, minRating);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    updateUrl(keyword, category, sort, minPrice, maxPrice, minRating);
  };
  
  const handleSortChange = (e) => {
    setSort(e.target.value);
    updateUrl(keyword, selectedCategory, e.target.value, minPrice, maxPrice, minRating);
  };

  const updateUrl = (kw, cat, s, min, max, rat) => {
    let url = '/shop?';
    if (kw) url += `search=${encodeURIComponent(kw)}&`;
    if (cat && cat !== 'All') url += `category=${encodeURIComponent(cat)}&`;
    if (s) url += `sort=${s}&`;
    if (min) url += `minPrice=${min}&`;
    if (max) url += `maxPrice=${max}&`;
    if (rat) url += `rating=${rat}`;
    navigate(url);
  };

  const applyFilters = (e) => {
    e.preventDefault();
    updateUrl(keyword, selectedCategory, sort, minPrice, maxPrice, minRating);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary-600" />
              Filters
            </h3>
            
            <form onSubmit={handleSearch} className="mb-6 relative">
              <input
                type="text"
                placeholder="Search products..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </form>

            <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">Categories</h4>
            <div className="space-y-1 mb-6">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => handleCategoryClick(c)}
                  className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${selectedCategory.toLowerCase() === c.toLowerCase() ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {c}
                </button>
              ))}
            </div>

            <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">Price Range</h4>
            <div className="grid grid-cols-2 gap-2 mb-6">
               <input 
                 type="number" 
                 placeholder="Min" 
                 value={minPrice} 
                 onChange={(e) => setMinPrice(e.target.value)}
                 className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 outline-none"
               />
               <input 
                 type="number" 
                 placeholder="Max" 
                 value={maxPrice} 
                 onChange={(e) => setMaxPrice(e.target.value)}
                 className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 outline-none"
               />
            </div>

            <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">Rating</h4>
            <div className="space-y-1 mb-6">
              {[4, 3, 2, 1].map((r) => (
                <button
                  key={r}
                  onClick={() => { setMinRating(r); updateUrl(keyword, selectedCategory, sort, minPrice, maxPrice, r); }}
                  className={`flex items-center gap-1.5 w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${Number(minRating) === r ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <span className="flex text-yellow-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </span>
                  {r} Stars & Up
                </button>
              ))}
            </div>

            <button 
              onClick={applyFilters}
              className="w-full bg-primary-600 text-white font-bold py-2 rounded-xl text-sm hover:bg-primary-700 transition-all shadow-sm"
            >
              Apply Filters
            </button>
            <button 
              onClick={() => {
                setKeyword(''); setSelectedCategory('All'); setSort(''); setMinPrice(''); setMaxPrice(''); setMinRating('');
                navigate('/shop');
              }}
              className="w-full text-gray-500 text-xs mt-3 hover:underline"
            >
              Reset All
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="mb-6 flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {keywordParam ? `Search results for "${keywordParam}"` : selectedCategory !== 'All' ? selectedCategory : 'All Products'}
              </h2>
              <p className="text-gray-500 text-sm">{products.length} products found</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 font-medium">Sort by:</span>
              <select 
                value={sort} 
                onChange={handleSortChange}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
              >
                <option value="">New Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popularity">Popularity</option>
              </select>
            </div>
          </div>

          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1, 2, 3, 4, 5, 6].map(n => (
                 <div key={n} className="animate-pulse bg-gray-200 rounded-2xl h-80 w-full" />
               ))}
             </div>
          ) : (
            <>
              {products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                  <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
                  <button onClick={() => updateUrl('', 'All')} className="mt-4 text-primary-600 font-medium hover:underline">Clear all filters</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default Shop;
