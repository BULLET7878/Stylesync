import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import API_URL from '../utils/api';

export const CartContext = createContext({});

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (user) {
      // Sync any local cart items to server on login
      const syncLocalCart = async () => {
        const localCart = localStorage.getItem('cartItems');
        if (localCart) {
          const localItems = JSON.parse(localCart);
          if (Array.isArray(localItems) && localItems.length > 0) {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            for (const item of localItems) {
              try {
                await axios.post(`${API_URL}/api/cart`, item, config);
              } catch (e) { /* ignore individual item errors */ }
            }
            localStorage.removeItem('cartItems');
          }
        }
        fetchCart();
      };
      syncLocalCart();
    } else {
      const localCart = localStorage.getItem('cartItems');
      if (localCart) {
        const parsed = JSON.parse(localCart);
        setCartItems(Array.isArray(parsed) ? parsed : []);
      } else {
        setCartItems([]);
      }
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API_URL}/api/cart`, config);
      setCartItems(data.cartItems || []);
    } catch (error) {
      console.error(error);
    }
  };

  const addToCart = async (product, qty) => {
    let pId = product.product || product._id;
    if (typeof pId === 'object' && pId !== null) pId = pId._id || pId;
    const productIdStr = String(pId);

    const item = { 
      product: productIdStr, 
      name: product.title || product.name, 
      image: product.images && product.images.length > 0 ? product.images[0] : product.image || '/assets/fallback.png',
      price: product.discountPrice > 0 ? product.discountPrice : (product.price || 0), 
      originalPrice: product.originalPrice || product.price || 0,
      qty 
    };

    if (product.countInStock !== undefined && qty > product.countInStock) {
      throw new Error(`Only ${product.countInStock} items available in stock`);
    }
    
    if (user) {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${API_URL}/api/cart`, item, config); // let errors propagate
      await fetchCart();
    } else {
      const existItem = cartItems.find(x => x.product === item.product);
      let newCart;
      if (existItem) {
        newCart = cartItems.map(x => x.product === existItem.product ? { ...x, qty } : x);
      } else {
        newCart = [...cartItems, item];
      }
      setCartItems(newCart);
      localStorage.setItem('cartItems', JSON.stringify(newCart));
    }
  };

  const removeFromCart = async (id) => {
    if (user) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`${API_URL}/api/cart/${id}`, config);
        fetchCart();
      } catch (error) { console.error(error); }
    } else {
      const newCart = cartItems.filter(x => x.product !== id);
      setCartItems(newCart);
      localStorage.setItem('cartItems', JSON.stringify(newCart));
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`${API_URL}/api/cart`, config);
        setCartItems([]);
      } catch (error) { console.error(error); }
    } else {
      setCartItems([]);
      localStorage.removeItem('cartItems');
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
