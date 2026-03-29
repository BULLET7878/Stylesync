import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Heart, AlertCircle } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const FALLBACK = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80';

const ProductCard = ({ product }) => {
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);

  if (!product) return null;

  const isWishlisted = isInWishlist(product._id);
  const isSeller = user?.role === 'seller';
  const isOutOfStock = product.countInStock === 0;
  const isLowStock = product.countInStock > 0 && product.countInStock <= 5;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const discountPct = hasDiscount ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;
  const isNew = product.createdAt && (Date.now() - new Date(product.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;

  const imgSrc = product.images?.[0]
    ? (product.images[0].startsWith('http') ? product.images[0] : `${API}${product.images[0]}`)
    : FALLBACK;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    toast.success(`${product.title.slice(0, 20)}... added to cart`);
  };

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) removeFromWishlist(product._id);
    else addToWishlist(product._id);
  };

  return (
    <Link
      to={`/product/${product._id}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 card-lift"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={imgSrc}
          alt={product.title}
          onError={(e) => { e.target.src = FALLBACK; }}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {isNew && !hasDiscount && !isOutOfStock && (
            <span className="bg-primary-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
              New
            </span>
          )}
          {hasDiscount && (
            <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
              -{discountPct}%
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-gray-800 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
              Sold Out
            </span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
              <AlertCircle className="w-2.5 h-2.5" /> Only {product.countInStock} left
            </span>
          )}
        </div>

        {/* Wishlist */}
        {!isSeller && (
          <button
            onClick={toggleWishlist}
            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all z-10 ${
              isWishlisted
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Add to Cart overlay */}
        {!isSeller && !isOutOfStock && (
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              className="w-full bg-gray-900 text-white py-3 text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary-600 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" /> Add to Cart
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider">{product.category}</span>
          {product.numReviews > 0 && (
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-[11px] font-bold text-gray-600">{Number(product.rating).toFixed(1)}</span>
              <span className="text-[10px] text-gray-400">({product.numReviews})</span>
            </div>
          )}
        </div>

        <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 mb-2">{product.title}</h3>

        <div className="flex items-center gap-2">
          <span className={`text-base font-black ${hasDiscount ? 'text-red-600' : 'text-gray-900'}`}>
            ₹{displayPrice.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
          )}
        </div>

        {product.user?.name && (
          <p className="text-[10px] text-gray-400 mt-1 truncate">by {product.user.name}</p>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
