import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../utils/api';

export const ProductContext = createContext({});

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [curatedProducts, setCuratedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchProducts = async (keyword = '', category = '', sort = '', minPrice = '', maxPrice = '', rating = '', section = '') => {
    setLoading(true);
    try {
      let query = `?keyword=${keyword}`;
      if (category) query += `&category=${category}`;
      if (section) query += `&section=${section}`;
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

  const fetchCuratedList = async (token) => {
    try {
      if (token) {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(`${API_URL}/api/featured/curated`, config);
        setCuratedProducts(data);
      } else {
        const { data } = await axios.get(`${API_URL}/api/products`);
        setCuratedProducts(data.slice(0, 8));
      }
    } catch (error) {
       console.error(error);
    }
  };

  useEffect(() => {
    searchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading, searchProducts, curatedProducts, fetchCuratedList }}>
      {children}
    </ProductContext.Provider>
  );
};
