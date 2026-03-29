import React, { useContext, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Clock } from 'lucide-react';
import { ProductContext } from '../context/ProductContext';
import { AuthContext } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import axios from 'axios';

const Home = () => {
  const { products, loading, searchProducts, fetchRecommendations } = useContext(ProductContext);
  const { user } = useContext(AuthContext);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = React.useState([]);

  useEffect(() => {
    fetchRecommendations(user?.token);
    searchProducts('', '');

    const fetchRecentlyViewed = async () => {
      const ids = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      if (ids.length > 0) {
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
          const promises = ids.map(id => axios.get(`${API_URL}/api/products/${id}`));
          const responses = await Promise.all(promises);
          setRecentlyViewedProducts(responses.map(res => res.data));
        } catch (error) {
          console.error('Error fetching recently viewed', error);
        }
      }
    };
    fetchRecentlyViewed();
    // eslint-disable-next-line
  }, [user]);

  return (
    <div className="min-h-screen bg-white">
      {/* Promotional Banner */}
      <section className="bg-primary-900 border-b border-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
          <div>
            <span className="bg-primary-800 text-primary-200 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4 inline-block">
              New Collection
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              Discover Your Style
            </h1>
            <p className="text-lg text-primary-200 max-w-xl">
              Elevate your everyday look with our curated, high-quality fashion pieces.
            </p>
          </div>
          <Link to="/shop" className="bg-white text-primary-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center gap-2 flex-shrink-0">
            Shop All <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Trend Spotlight — Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            <span className="text-sm font-bold text-amber-600 uppercase tracking-widest">Editor's Choice</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Trend Spotlight</h2>
          <p className="mt-2 text-lg text-gray-500">The pieces everyone's talking about this season.</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products && products
              .filter(p => !p.tags || p.tags.length === 0 || p.tags.includes('premium') || p.tags.includes('streetwear') || p.tags.includes('trending'))
              .slice(0, 4)
              .map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
          </div>
        </div>
      </section>

      {/* New Arrivals — Grid */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-6 h-6 text-primary-500" />
            <span className="text-sm font-bold text-primary-600 uppercase tracking-widest">Just In</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">New Arrivals</h2>
          <p className="mt-2 text-lg text-gray-500">Fresh styles just landed in our shop.</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products && products
              .slice(0, 8)
              .map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
          </div>
          <div className="mt-12 text-center">
            <Link to="/shop" className="inline-flex items-center gap-2 text-primary-600 font-bold hover:text-primary-700 transition-colors">
              View All Products <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Recently Viewed */}
      {recentlyViewedProducts.length > 0 && (
        <section className="bg-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-10 text-gray-400">
              <Clock className="w-6 h-6" />
              <h2 className="text-2xl font-bold tracking-tight">Recently Viewed</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 opacity-75 grayscale-[0.5] hover:grayscale-0 transition-all duration-500">
              {recentlyViewedProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
