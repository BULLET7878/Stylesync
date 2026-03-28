import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext({});

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      const localCart = localStorage.getItem('cartItems');
      if (localCart) setCartItems(JSON.parse(localCart));
    }
  }, [user]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

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
    const item = { 
      product: product._id || product.product, 
      name: product.title || product.name, 
      image: product.images && product.images.length > 0 ? product.images[0] : product.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80', 
      price: product.price, 
      qty 
    };
    
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
