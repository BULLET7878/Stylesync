import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const ProductContext = createContext({});

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const searchProducts = async (keyword = '', category = '', sort = '', minPrice = '', maxPrice = '', rating = '') => {
    setLoading(true);
    try {
      let query = `?keyword=${keyword}`;
      if (category) query += `&category=${category}`;
      if (sort) query += `&sort=${sort}`;
      if (minPrice !== '' && minPrice !== null) query += `&minPrice=${minPrice}`;
      if (maxPrice !== '' && maxPrice !== null) query += `&maxPrice=${maxPrice}`;
      if (rating !== '' && rating !== null) query += `&rating=${rating}`;
      const { data } = await axios.get(`${API_URL}/api/products${query}`);
      setProducts(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const fetchRecommendations = async (token) => {
    try {
      if (token) {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(`${API_URL}/api/ai/recommendations`, config);
        setAiRecommendations(data);
      } else {
        const { data } = await axios.get(`${API_URL}/api/products`);
        setAiRecommendations(data.slice(0, 8));
      }
    } catch (error) {
       console.error(error);
    }
  };

  useEffect(() => {
    searchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading, searchProducts, aiRecommendations, fetchRecommendations }}>
      {children}
    </ProductContext.Provider>
  );
};
