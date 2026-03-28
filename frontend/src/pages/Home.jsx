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
          const promises = ids.map(id => axios.get(`/api/products/${id}`));
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
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Trend Spotlight</h2>
          <p className="mt-2 text-lg text-gray-500">The pieces everyone's talking about this season.</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products && products
              .filter(p => p.tags && (p.tags.includes('premium') || p.tags.includes('streetwear')))
              .slice(0, 8)
              .map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
          </div>
        </div>
      </section>

      {/* Recently Viewed */}
      {recentlyViewedProducts.length > 0 && (
        <section className="bg-gray-50 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-10">
              <Clock className="w-8 h-8 text-primary-500" />
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Recently Viewed</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
