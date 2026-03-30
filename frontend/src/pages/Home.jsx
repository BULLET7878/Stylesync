import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Clock, ShieldCheck, Truck, RefreshCw, Star, TrendingUp, Tag } from 'lucide-react';
import { ProductContext } from '../context/ProductContext';
import { AuthContext } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import axios from 'axios';
import { toast } from 'react-toastify';

const CATEGORIES = [
  { label: 'Shirts', value: 'Shirts', emoji: '👔', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
  { label: 'T-Shirts', value: 'T-Shirts', emoji: '👕', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' },
  { label: 'Jeans', value: 'Jeans', emoji: '👖', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100' },
  { label: 'Shoes', value: 'Shoes', emoji: '👟', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100' },
  { label: 'Accessories', value: 'Accessories', emoji: '👜', bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-100' },
  { label: 'Ethnic Wear', value: 'Ethnic Wear', emoji: '🥻', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
];

const TRUST_BADGES = [
  { icon: <Truck className="w-5 h-5" />, title: 'Free Delivery', sub: 'On orders above ₹999' },
  { icon: <RefreshCw className="w-5 h-5" />, title: 'Easy Returns', sub: '7-day hassle-free returns' },
  { icon: <ShieldCheck className="w-5 h-5" />, title: 'Secure Payments', sub: 'UPI, Cards & more' },
  { icon: <Star className="w-5 h-5" />, title: 'Top Rated', sub: '4.8★ from 10k+ buyers' },
];

const MARQUEE_ITEMS = ['New Arrivals', 'Premium Quality', 'Trending Now', 'Exclusive Deals', 'Top Sellers', 'Limited Edition', 'Best Value', 'Handpicked Styles'];

const Home = () => {
  const { products, loading } = useContext(ProductContext);
  const { user } = useContext(AuthContext);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      const ids = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      if (ids.length > 0) {
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
          const results = await Promise.allSettled(ids.map(id => axios.get(`${API_URL}/api/products/${id}`)));
          setRecentlyViewed(results.filter(r => r.status === 'fulfilled').map(r => r.value.data));
        } catch (e) { /* silent */ }
      }
    };
    fetchRecentlyViewed();
  }, []);

  const featuredProducts = products.slice(0, 4);
  const newArrivals = products.slice(0, 8);
  const onSale = products.filter(p => p.discountPrice > 0 && p.discountPrice < p.price).slice(0, 4);

  return (
    <div className="bg-white">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 text-white">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 80% 20%, #f97316 0%, transparent 40%)' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              New Season Collection 2026
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-6">
              Dress Like<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-amber-400">
                You Mean It
              </span>
            </h1>
            <p className="text-lg text-gray-300 max-w-lg mb-8 leading-relaxed">
              Discover curated fashion from independent sellers. Premium quality, real style, delivered to your door.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-black text-base hover:bg-gray-100 transition-all shadow-xl"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              {user?.email === 'rahuldhakarmm@gmail.com' && (
                <Link
                  to="/seller/dashboard"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-white/20 transition-all backdrop-blur-sm"
                >
                  Seller Panel
                </Link>
              )}
            </div>
          </div>

          {/* Hero product grid preview */}
          <div className="flex-1 hidden lg:grid grid-cols-2 gap-3 max-w-sm">
            {featuredProducts.slice(0, 4).map((p, i) => (
              <Link
                key={p._id}
                to={`/product/${p._id}`}
                className={`relative overflow-hidden rounded-2xl aspect-square bg-gray-800 group ${i === 0 ? 'col-span-2 aspect-video' : ''}`}
              >
                <img
                  src={p.images?.[0]?.startsWith('http') ? p.images[0] : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${p.images?.[0]}`}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                  onError={(e) => { e.target.src = '/assets/fallback.png'; }}
                />
                <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-bold truncate">{p.title}</p>
                  <p className="text-primary-300 text-xs font-black">₹{(p.discountPrice || p.price).toFixed(0)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section Grid (Men, Women, Kids) ── */}
      <section className="-mt-12 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { name: 'Men', img: '/assets/men_hero.png', color: 'from-blue-600/40' },
            { name: 'Women', img: '/assets/women_hero.png', color: 'from-pink-600/40' },
            { name: 'Kids', img: '/assets/kids_hero.png', color: 'from-amber-500/40' },
          ].map((sec) => (
            <Link 
              key={sec.name} 
              to={`/shop?section=${sec.name}`}
              className="relative aspect-[4/5] sm:aspect-[3/4] rounded-3xl overflow-hidden group shadow-2xl transition-transform hover:-translate-y-2"
            >
              <img src={sec.img} alt={sec.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className={`absolute inset-0 bg-gradient-to-t ${sec.color} to-transparent opacity-60 group-hover:opacity-80 transition-opacity`} />
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">{sec.name}</h3>
                <div className="flex items-center gap-2 text-white/90 text-sm font-bold bg-white/20 backdrop-blur-md w-fit px-4 py-2 rounded-xl group-hover:bg-white group-hover:text-gray-900 transition-all">
                  Shop Section <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Trust Badges ── */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100">
            {TRUST_BADGES.map((b, i) => (
              <div key={i} className="flex items-center gap-3 px-6 py-4">
                <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  {b.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{b.title}</p>
                  <p className="text-xs text-gray-500">{b.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Tiles ── */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-black text-primary-600 uppercase tracking-widest mb-1">Browse by Category</p>
              <h2 className="text-2xl font-black text-gray-900">Shop the Collection</h2>
            </div>
            <Link to="/shop" className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                to={`/shop?category=${encodeURIComponent(cat.value)}`}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${cat.bg} ${cat.border} hover:shadow-md transition-all group`}
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{cat.emoji}</span>
                <span className={`text-xs font-bold ${cat.text} text-center`}>{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Marquee Banner ── */}
      <div className="bg-primary-600 py-3 overflow-hidden">
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-4 px-8 text-white text-xs font-black uppercase tracking-widest whitespace-nowrap">
              <span className="w-1.5 h-1.5 bg-white/50 rounded-full" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Featured / Trending ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <p className="text-xs font-black text-amber-600 uppercase tracking-widest">Handpicked for You</p>
              </div>
              <h2 className="text-2xl font-black text-gray-900">Trending Right Now</h2>
            </div>
            <Link to="/shop?sort=popularity" className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
              See All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1,2,3,4].map(n => <div key={n} className="skeleton rounded-2xl aspect-[3/4]" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6">
              {featuredProducts.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Sale Banner ── */}
      {onSale.length > 0 && (
        <section className="py-16 bg-gradient-to-r from-red-50 to-orange-50 border-y border-red-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Tag className="w-4 h-4 text-red-500" />
                  <p className="text-xs font-black text-red-600 uppercase tracking-widest">Limited Time</p>
                </div>
                <h2 className="text-2xl font-black text-gray-900">On Sale Now</h2>
              </div>
              <Link to="/shop?sort=price_asc" className="text-sm font-bold text-red-600 hover:text-red-700 flex items-center gap-1">
                All Deals <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6">
              {onSale.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── New Arrivals ── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-primary-500" />
                <p className="text-xs font-black text-primary-600 uppercase tracking-widest">Just Landed</p>
              </div>
              <h2 className="text-2xl font-black text-gray-900">New Arrivals</h2>
            </div>
            <Link to="/shop" className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1,2,3,4,5,6,7,8].map(n => <div key={n} className="skeleton rounded-2xl aspect-[3/4]" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6">
              {newArrivals.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
          <div className="mt-10 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-primary-600 transition-all shadow-md"
            >
              Explore All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-black text-primary-600 uppercase tracking-widest mb-2">Simple & Fast</p>
            <h2 className="text-2xl font-black text-gray-900">How StyleSync Works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Browse & Discover', desc: 'Explore thousands of curated fashion items from verified independent sellers across India.', emoji: '🔍' },
              { step: '02', title: 'Add & Checkout', desc: 'Add your favourites to cart, choose your size, and pay securely via UPI in seconds.', emoji: '🛒' },
              { step: '03', title: 'Delivered to You', desc: 'Your order is packed and shipped directly by the seller. Track it live from your dashboard.', emoji: '📦' },
            ].map((s) => (
              <div key={s.step} className="relative text-center p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all group">
                <div className="text-4xl mb-4">{s.emoji}</div>
                <span className="text-xs font-black text-primary-400 uppercase tracking-widest">{s.step}</span>
                <h3 className="text-lg font-black text-gray-900 mt-1 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Seller CTA ── */}
      {/* Seller CTA - Only visible to owner */}
      {user?.email === 'rahuldhakarmm@gmail.com' && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-10 lg:p-14">
              <span className="text-4xl mb-4 block">🛍️</span>
              <h2 className="text-3xl font-black text-gray-900 mb-3">Seller Controls</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Manage your products, track orders, and view your seller performance details here.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/seller/dashboard"
                  className="inline-flex items-center justify-center gap-2 bg-amber-500 text-white px-8 py-4 rounded-xl font-black hover:bg-amber-600 transition-all shadow-lg"
                >
                  Open Seller Dashboard
                </Link>
                <Link
                  to="/seller/product/new"
                  className="inline-flex items-center justify-center gap-2 border border-amber-300 text-amber-700 px-8 py-4 rounded-xl font-bold hover:bg-amber-50 transition-all"
                >
                  Add New Product
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Newsletter ── */}
      <section className="py-14 bg-primary-600">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-primary-200 text-xs font-black uppercase tracking-widest mb-2">Stay in the loop</p>
          <h2 className="text-2xl font-black text-white mb-3">Get style drops in your inbox</h2>
          <p className="text-primary-200 text-sm mb-6">New arrivals, exclusive deals, and style tips — weekly, no spam.</p>
          <form onSubmit={(e) => { e.preventDefault(); toast.success('Thanks! You are subscribed.'); e.target.reset(); }} className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              required
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-primary-300 outline-none focus:bg-white/20 transition-all text-sm font-medium"
            />
            <button type="submit" className="px-5 py-3 bg-white text-primary-700 font-black rounded-xl hover:bg-primary-50 transition-all text-sm flex-shrink-0">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* ── Recently Viewed ── */}
      {recentlyViewed.length > 0 && (
        <section className="py-14 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-8">
              <Clock className="w-4 h-4 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-700">Recently Viewed</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6">
              {recentlyViewed.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
