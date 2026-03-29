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
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
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
        
        // Fetch AI Outfits and 'Also Bought' independently
        const [outfitRes, alsoBoughtRes] = await Promise.allSettled([
          axios.get(`${API_URL}/api/ai/outfit/${id}`),
          axios.get(`${API_URL}/api/products?category=${encodeURIComponent(data.category)}`)
        ]);

        if (outfitRes.status === 'fulfilled') {
          setOutfits(outfitRes.value.data);
        }
        if (alsoBoughtRes.status === 'fulfilled') {
          setAlsoBought(alsoBoughtRes.value.data.filter(p => p._id !== id).slice(0, 4));
        }

        // Track Recently Viewed
        const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        if (!recentlyViewed.includes(id)) {
          const updated = [id, ...recentlyViewed].slice(0, 4);
          localStorage.setItem('recentlyViewed', JSON.stringify(updated));
        }
      } catch (error) {
        console.error('Core Product Load Error:', error);
        toast.error('Product details unavailable');
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

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    setSubmittingReview(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${API_URL}/api/products/${id}/reviews`, { rating, comment }, config);
      toast.success('Review submitted successfully');
      setRating(0);
      setComment('');
      // Refresh product to show new review
      const { data } = await axios.get(`${API_URL}/api/products/${id}`);
      setProduct(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
    setSubmittingReview(false);
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
                src={product.images && product.images[0] ? (product.images[0].startsWith('http') ? product.images[0] : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${product.images[0]}`) : 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80'} 
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

            <div className="flex items-center gap-4 mb-6">
              {product.discountPrice > 0 && product.discountPrice < product.price ? (
                <>
                  <p className="text-4xl font-extrabold text-red-600">₹{product.discountPrice.toFixed(0)}</p>
                  <div className="flex flex-col">
                    <p className="text-lg font-medium text-gray-400 line-through">₹{product.price.toFixed(0)}</p>
                    <span className="text-xs font-black text-red-600 bg-red-50 px-3 py-1.5 rounded-full uppercase tracking-widest w-fit border border-red-100">
                      SAVE ₹{(product.price - product.discountPrice).toFixed(0)} ({Math.round((1 - (product.discountPrice / product.price)) * 100)}% OFF)
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-4xl font-extrabold text-gray-900">₹{(product.price || 0).toFixed(0)}</p>
              )}
            </div>
            
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

        {/* Reviews Section */}
        <div className="mt-24 pt-16 border-t border-gray-200">
          <div className="flex flex-col lg:flex-row gap-16">
             <div className="w-full lg:w-1/3">
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-6">Customer Reviews</h2>
                <div className="flex items-center gap-4 mb-8">
                  <div className="text-5xl font-extrabold text-gray-900">{product.rating.toFixed(1)}</div>
                  <div className="flex flex-col">
                    <div className="flex text-yellow-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-5 h-5 ${s <= product.rating ? 'fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-gray-500 text-sm font-medium mt-1">Based on {product.numReviews} reviews</span>
                  </div>
                </div>

                {/* Review Form */}
                {user && user.role === 'buyer' ? (
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">Write a Review</h3>
                    <form onSubmit={submitReviewHandler} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button 
                              key={s} 
                              type="button" 
                              onClick={() => setRating(s)} 
                              className={`p-1 transition-colors ${s <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                            >
                              <Star className={`w-8 h-8 ${s <= rating ? 'fill-current' : ''}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                        <textarea 
                          rows="4" 
                          value={comment} 
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                          placeholder="Share your thoughts about this product..."
                        ></textarea>
                      </div>
                      <button 
                        type="submit" 
                        disabled={submittingReview}
                        className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-sm"
                      >
                        {submittingReview ? 'Submitting...' : 'Post Review'}
                      </button>
                    </form>
                  </div>
                ) : !user ? (
                  <div className="p-6 rounded-2xl border border-dashed border-gray-200 text-center">
                    <p className="text-gray-500 text-sm mb-4">You must be logged in to write a review.</p>
                    <Link to="/login" className="text-primary-600 font-bold hover:underline">Sign In Now</Link>
                  </div>
                ) : null}
             </div>

             <div className="w-full lg:w-2/3">
                <div className="space-y-8">
                  {product.reviews.length === 0 ? (
                    <p className="text-gray-500 italic py-8 border-b border-gray-50 font-medium">No reviews yet. Be the first to share your experience!</p>
                  ) : (
                    product.reviews.map((rev, idx) => (
                      <div key={idx} className="border-b border-gray-100 pb-8 last:border-0 group">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
                              {rev.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{rev.name}</p>
                              <div className="flex text-yellow-500 scale-75 origin-left mt-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} className={`w-4 h-4 ${s <= rev.rating ? 'fill-current' : 'text-gray-300'}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-widest">{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-600 leading-relaxed font-medium pl-13">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>
             </div>
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
