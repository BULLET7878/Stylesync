import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);
  
  const isWishlisted = isInWishlist(product?._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
    toast.success('Added to cart!');
  };

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product._id);
    }
  };

  return (
    <Link to={`/product/${product._id}`} className="group block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
        <img 
          src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80'} 
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80'; }}
          alt={product.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <button 
          onClick={toggleWishlist}
          className={`absolute top-4 right-4 p-2 rounded-full shadow-md transition-all z-10 ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-900 hover:bg-white'}`}
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        <button 
          onClick={handleAddToCart}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 bg-white text-gray-900 px-6 py-3 rounded-full font-medium shadow-lg hover:bg-primary-50 hover:text-primary-600 transition-all duration-300 flex items-center gap-2 w-[calc(100%-2rem)] justify-center"
        >
          <ShoppingCart className="w-5 h-5" />
          Add to Cart
        </button>
      </div>
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1 sm:gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-primary-600 uppercase tracking-wider">{product.category}</span>
            {product.user && product.user.name && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-xs text-gray-500 capitalize leading-none">Sold by {product.user.name}</span>
              </>
            )}
          </div>
          <div className="flex items-center text-yellow-500 text-sm">
            <Star className="w-4 h-4 fill-current" />
            <span className="ml-1 text-gray-600 font-medium">{product.rating}</span>
            <span className="text-gray-400 ml-1">({product.numReviews})</span>
          </div>
        </div>
        <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">{product.title}</h3>
        <p className="text-xl font-bold text-gray-900">₹{(product.price || 0).toFixed(2)}</p>
      </div>
    </Link>
  );
};

export default ProductCard;
