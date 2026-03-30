import { useContext } from 'react';
import { WishlistContext } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const { wishlist, loading } = useContext(WishlistContext);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Wishlist...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4 mb-10">
        <Heart className="w-8 h-8 text-red-500 fill-red-500" />
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Wishlist</h1>
        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-bold">
          {wishlist.length} Items
        </span>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Save items that you love so you can find them easily and purchase them later.
          </p>
          <Link 
            to="/shop" 
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-primary-700 transition-all"
          >
            <ShoppingBag className="w-5 h-5" /> Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {wishlist.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
