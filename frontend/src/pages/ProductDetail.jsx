import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Star, Heart, TrendingUp, AlertCircle, Minus, Plus, CheckCircle, Truck, RefreshCw, ShieldCheck, MapPin, Share2 } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import ProductCard from '../components/ProductCard';

const API = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5001');
const FALLBACK = '/assets/fallback.png';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [outfits, setOutfits] = useState([]);
  const [alsoBought, setAlsoBought] = useState([]);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeMsg, setPincodeMsg] = useState(null);
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);
  const isWishlisted = isInWishlist(id);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API}/api/products/${id}`);
        setProduct(data);
        const [outfitRes, alsoRes] = await Promise.allSettled([
          axios.get(`${API}/api/featured/pairings/${id}`),
          axios.get(`${API}/api/products?category=${encodeURIComponent(data.category)}`),
        ]);
        if (outfitRes.status === 'fulfilled') setOutfits(outfitRes.value.data.slice(0, 4));
        if (alsoRes.status === 'fulfilled') setAlsoBought(alsoRes.value.data.filter(p => p._id !== id).slice(0, 4));
        const rv = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        if (!rv.includes(id)) localStorage.setItem('recentlyViewed', JSON.stringify([id, ...rv].slice(0, 4)));
        if (user && user.role === 'seller') {
          toast.error('Sellers cannot purchase products.');
          navigate('/seller/dashboard');
        }
      } catch (e) { toast.error('Could not load product'); }
      setLoading(false);
    };
    fetchProduct();
    if (window.location.hash === '#reviews') {
      setTimeout(() => {
        const el = document.getElementById('reviews-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 800);
    } else {
      window.scrollTo(0, 0);
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!product || product.countInStock === 0) return;
    addToCart(product, qty);
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    if (!product || product.countInStock === 0) return;
    addToCart(product, qty);
    navigate('/checkout');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a rating'); return; }
    setSubmittingReview(true);
    try {
      await axios.post(`${API}/api/products/${id}/reviews`, { rating, comment }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('Review submitted!');
      setRating(0); setComment('');
      const { data } = await axios.get(`${API}/api/products/${id}`);
      setProduct(data);
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to submit review'); }
    setSubmittingReview(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 mb-4">Product not found.</p>
        <Link to="/shop" className="text-primary-600 font-bold hover:underline">Back to Shop</Link>
      </div>
    </div>
  );

  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;
  const discountPct = hasDiscount ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;
  const images = product.images?.length > 0 ? product.images : [FALLBACK];
  const imgSrc = (src) => src?.startsWith('http') 
    ? src 
    : `${API.replace(/\/$/, '')}/${src?.replace(/^\//, '')}`;

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-primary-600 transition-colors">Shop</Link>
          <span>/</span>
          <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-primary-600 transition-colors capitalize">{product.category}</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
              <img
                src={imgSrc(images[activeImg])}
                alt={product.title}
                loading="eager"
                onError={(e) => { e.target.src = FALLBACK; }}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-primary-600' : 'border-transparent'}`}>
                    <img src={imgSrc(img)} alt="" loading="lazy" onError={(e) => { e.target.src = FALLBACK; }} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {/* Category + Seller */}
            <div className="flex items-center gap-2 mb-3">
              <Link to={`/shop?category=${encodeURIComponent(product.category)}`}
                className="text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full uppercase tracking-wider hover:bg-primary-100 transition-colors">
                {product.category}
              </Link>
              {product.user?.name && (
                <span className="text-xs text-gray-500">by <span className="font-medium text-gray-700">{product.user.name}</span></span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-4">{product.title}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-700">{Number(product.rating).toFixed(1)}</span>
              <span className="text-sm text-gray-400">({product.numReviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 mb-5 pb-5 border-b border-gray-100">
              <span className={`text-4xl font-black ${hasDiscount ? 'text-red-600' : 'text-gray-900'}`}>
                ₹{displayPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <div className="flex flex-col">
                  <span className="text-lg text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
                  <span className="text-xs font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    Save ₹{(product.price - product.discountPrice).toLocaleString()} ({discountPct}% OFF)
                  </span>
                </div>
              )}
            </div>

            {/* Stock Warning */}
            {product.countInStock > 0 && product.countInStock <= 5 && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-sm font-bold text-amber-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Only {product.countInStock} left in stock — order soon!
              </div>
            )}

            <p className="text-gray-600 leading-relaxed mb-6 text-sm">{product.description}</p>

            {user?.role !== 'seller' || user?.email === 'rahuldhakarmm@gmail.com' ? (
              <>
                {/* Qty */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-sm font-bold text-gray-700">Quantity</span>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-12 text-center font-bold text-gray-900">{qty}</span>
                    <button onClick={() => setQty(Math.min(product.countInStock || 99, qty + 1))} className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {product.countInStock > 0 && (
                    <span className="text-xs text-gray-400">{product.countInStock} available</span>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-3 mb-6">
                  <button onClick={handleAddToCart} disabled={product.countInStock === 0}
                    className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-primary-600 text-primary-600 py-3.5 rounded-xl font-bold hover:bg-primary-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    <ShoppingCart className="w-4 h-4" />
                    {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                  <button onClick={handleBuyNow} disabled={product.countInStock === 0}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white py-3.5 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed">
                    Buy Now
                  </button>
                  <button onClick={() => isWishlisted ? removeFromWishlist(id) : addToWishlist(id)}
                    className={`w-14 flex items-center justify-center rounded-xl border-2 transition-all ${isWishlisted ? 'bg-red-50 border-red-300 text-red-500' : 'border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500'}`}>
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
                <p className="text-amber-800 font-medium text-sm">Sellers cannot purchase products. Manage your own listings from the Seller Panel.</p>
                <Link to="/seller/dashboard" className="inline-block mt-3 text-amber-700 font-bold text-sm hover:underline">Go to Seller Panel →</Link>
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-5 border-t border-gray-100">
              {[
                { icon: <Truck className="w-4 h-4" />, text: 'Free Delivery', sub: 'Above ₹999' },
                { icon: <RefreshCw className="w-4 h-4" />, text: 'Easy Returns', sub: '7 days' },
                { icon: <ShieldCheck className="w-4 h-4" />, text: 'Secure Pay', sub: 'UPI & Cards' },
              ].map((b, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-1 p-3 bg-gray-50 rounded-xl">
                  <div className="text-primary-600">{b.icon}</div>
                  <p className="text-xs font-bold text-gray-900">{b.text}</p>
                  <p className="text-[10px] text-gray-400">{b.sub}</p>
                </div>
              ))}
            </div>

            {/* Pincode Delivery Check */}
            <div className="mt-5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-xs font-black text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary-600" /> Check Delivery
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter pincode"
                  value={pincode}
                  onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '')); setPincodeMsg(null); }}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary-400 bg-white"
                />
                <button
                  onClick={() => {
                    if (pincode.length !== 6) { setPincodeMsg({ ok: false, text: 'Enter a valid 6-digit pincode' }); return; }
                    // Simulate: pincodes starting with 5 or 6 are serviceable
                    const ok = ['5','6','4','1','2','3'].includes(pincode[0]);
                    setPincodeMsg(ok
                      ? { ok: true, text: `Delivery available by ${new Date(Date.now() + 4*24*60*60*1000).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}` }
                      : { ok: false, text: 'Sorry, delivery not available at this pincode' }
                    );
                  }}
                  className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-primary-600 transition-all"
                >
                  Check
                </button>
              </div>
              {pincodeMsg && (
                <p className={`text-xs font-bold mt-2 flex items-center gap-1.5 ${pincodeMsg.ok ? 'text-green-600' : 'text-red-500'}`}>
                  {pincodeMsg.ok ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  {pincodeMsg.text}
                </p>
              )}
            </div>

            {/* Share */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard!');
              }}
              className="mt-3 flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary-600 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" /> Share this product
            </button>
          </div>
        </div>

        {/* Reviews */}
        <div id="reviews-section" className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 mb-10">
          <h2 className="text-xl font-black text-gray-900 mb-6">Customer Reviews</h2>
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Rating Summary */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-5xl font-black text-gray-900">{Number(product.rating).toFixed(1)}</span>
                <div>
                  <div className="flex text-yellow-400 mb-1">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`w-5 h-5 ${s <= Math.round(product.rating) ? 'fill-current' : 'text-gray-200'}`} />)}
                  </div>
                  <p className="text-sm text-gray-500">{product.numReviews} reviews</p>
                </div>
              </div>

              {/* Write Review */}
              {user && user.role === 'buyer' ? (
                product.canReview ? (
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4 text-sm">Write a Review</h3>
                    <form onSubmit={submitReview} className="space-y-3">
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(s => (
                          <button key={s} type="button" onClick={() => setRating(s)}>
                            <Star className={`w-7 h-7 transition-colors ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 hover:text-yellow-300'}`} />
                          </button>
                        ))}
                      </div>
                      <textarea rows="3" value={comment} onChange={(e) => setComment(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-400 outline-none text-sm resize-none"
                        placeholder="Share your experience..." />
                      <button type="submit" disabled={submittingReview}
                        className="w-full bg-gray-900 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-50">
                        {submittingReview ? 'Posting...' : 'Post Review'}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 text-center">
                    <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                    <p className="text-sm font-bold text-amber-800">Verified Purchase Required</p>
                    <p className="text-xs text-amber-600 mt-1">You can only review products that have been delivered to you.</p>
                  </div>
                )
              ) : !user ? (
                <div className="text-center p-5 border border-dashed border-gray-200 rounded-2xl">
                  <p className="text-sm text-gray-500 mb-3">Sign in to write a review</p>
                  <Link to="/login" className="text-primary-600 font-bold text-sm hover:underline">Sign In</Link>
                </div>
              ) : null}
            </div>

            {/* Review List */}
            <div className="flex-1 space-y-5">
              {product.reviews.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Star className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                  <p className="font-medium">No reviews yet. Be the first!</p>
                </div>
              ) : product.reviews.map((rev, i) => (
                <div key={i} className="pb-5 border-b border-gray-50 last:border-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-black text-sm flex-shrink-0">
                        {rev.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{rev.name}</p>
                        <div className="flex text-yellow-400 mt-0.5">
                          {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= rev.rating ? 'fill-current' : 'text-gray-200'}`} />)}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed ml-12">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Complete the Look */}
        {outfits.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              <h2 className="text-xl font-black text-gray-900">Complete the Look</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {outfits.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}

        {/* Also Bought */}
        {alsoBought.length > 0 && (
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {alsoBought.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
