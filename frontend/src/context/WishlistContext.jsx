import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';
import API_URL from '../utils/api';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchWishlist = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`${API_URL}/api/wishlist`, config);
      setWishlist(data.products || []);
    } catch (error) {
      console.error('Error fetching wishlist', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [user]);

  const addToWishlist = async (productId) => {
    if (!user) {
      toast.info('Please login to add items to wishlist');
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.post(`${API_URL}/api/wishlist/${productId}`, {}, config);
      fetchWishlist();
      toast.success('Added to wishlist');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to wishlist');
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.delete(`${API_URL}/api/wishlist/${productId}`, config);
      setWishlist(wishlist.filter(p => p._id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(p => p._id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, loading, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
