import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Star, Heart, ArrowLeft, Sparkles } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import ProductCard from '../components/ProductCard';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [outfits, setOutfits] = useState([]);
  const [alsoBought, setAlsoBought] = useState([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);

  const isWishlisted = isInWishlist(id);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const { data } = await axios.get(`${API_URL}/api/products/${id}`);
        setProduct(data);
        
        // Fetch AI Outfits
        const outfitRes = await axios.get(`${API_URL}/api/ai/outfit/${id}`);
        setOutfits(outfitRes.data);

        // Fetch "Customers also bought" (similar products from same category)
        const alsoBoughtRes = await axios.get(`${API_URL}/api/products?category=${data.category}`);
        setAlsoBought(alsoBoughtRes.data.filter(p => p._id !== id).slice(0, 4));

        // Track Recently Viewed
        const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        if (!recentlyViewed.includes(id)) {
          const updated = [id, ...recentlyViewed].slice(0, 4);
          localStorage.setItem('recentlyViewed', JSON.stringify(updated));
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load product details');
      }
      setLoading(false);
    };

    fetchProductDetails();
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, qty);
    toast.success('Successfully added to cart');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;
  }

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/shop" className="inline-flex items-center text-gray-500 hover:text-primary-600 mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Shop
        </Link>
        
        <div className="flex flex-col md:flex-row gap-12">
          {/* Images */}
          <div className="w-full md:w-1/2">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-gray-100 shadow-sm border border-gray-100">
              <img 
                src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80'} 
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80'; }}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Details */}
          <div className="w-full md:w-1/2 flex flex-col pt-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-semibold text-primary-600 tracking-wider uppercase">{product.category}</span>
              {product.user && product.user.name && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-500 capitalize">Sold by {product.user.name}</span>
                </>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">{product.title}</h1>
            
            <div className="flex items-center mb-6 text-yellow-500">
              <Star className="w-5 h-5 fill-current" />
              <span className="ml-2 text-gray-900 font-medium text-lg">{product.rating}</span>
              <span className="ml-2 text-gray-500">({product.numReviews} reviews)</span>
            </div>

            <p className="text-3xl font-bold text-gray-900 mb-6">₹{(product.price || 0).toFixed(2)}</p>
            
            <p className="text-gray-600 text-lg leading-relaxed mb-8 border-b border-gray-200 pb-8">
              {product.description}
            </p>

            {user?.role !== 'seller' ? (
              <>
                <div className="mb-8 flex items-center gap-4">
                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                       <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors">-</button>
                       <div className="flex-1 text-center font-medium bg-white py-2">{qty}</div>
                       <button onClick={() => setQty(Math.min(product.countInStock || 10, qty + 1))} className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors">+</button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                  <button 
                    onClick={handleAddToCart}
                    disabled={product.countInStock === 0}
                    className="flex-1 bg-primary-600 text-white rounded-xl py-4 flex items-center justify-center gap-2 font-semibold text-lg hover:bg-primary-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                  <button 
                    onClick={() => isWishlisted ? removeFromWishlist(id) : addToWishlist(id)}
                    className={`sm:w-16 h-14 sm:h-auto rounded-xl border flex items-center justify-center transition-all ${isWishlisted ? 'bg-red-50 text-red-500 border-red-200' : 'text-gray-500 border-gray-300 hover:text-red-500 hover:border-red-200 hover:bg-red-50'}`}
                  >
                    <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-primary-50 p-6 rounded-2xl border border-primary-100 mt-auto">
                <p className="text-primary-800 font-medium">As a seller, you can manage your inventory through the Seller Panel. Sellers are restricted from purchasing products on the platform.</p>
                <Link to="/seller/dashboard" className="inline-block mt-4 text-primary-600 font-bold hover:underline">Go to Seller Panel →</Link>
              </div>
            )}
          </div>
        </div>

        {/* AI Outfit Suggestions */}
        {outfits && outfits.length > 0 && (
          <div className="mt-24 pt-16 border-t border-gray-200">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2 mb-2">
              <Sparkles className="w-8 h-8 text-primary-500" />
              Complete the Look
            </h2>
            <p className="text-lg text-gray-500 mb-10">AI-powered outfit suggestions to match your item perfectly.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {outfits.map(outfit => (
                <ProductCard key={outfit._id} product={outfit} />
              ))}
            </div>
          </div>
        )}

        {/* Customers Also Bought */}
        {alsoBought && alsoBought.length > 0 && (
          <div className="mt-24 pt-16 border-t border-gray-200">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">
              Customers Also Bought
            </h2>
            <p className="text-lg text-gray-500 mb-10">Based on what other fashion-forward shoppers are choosing.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {alsoBought.map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
