import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Checkout = () => {
  const { cartItems, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user && user.role === 'seller') {
      toast.error('Sellers cannot purchase products. Please log in with a buyer account.');
      navigate('/dashboard');
    }
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [user, navigate, cartItems]);

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  const placeOrderHandler = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const order = {
        orderItems: cartItems,
        shippingAddress: { address, city, postalCode, country },
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      };

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      await axios.post(`${API_URL}/api/orders`, order, config);
      await clearCart();
      toast.success('Order placed successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to place order');
    }
    setIsProcessing(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="w-full lg:w-2/3">
          <form onSubmit={placeOrderHandler} id="checkout-form" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Shipping Address</h2>
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="123 Main St" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="New York" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input type="text" required value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="10001" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input type="text" required value={country} onChange={(e) => setCountry(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="United States" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Payment Method</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:border-primary-500 transition-colors">
                <input type="radio" value="Credit Card" checked={paymentMethod === 'Credit Card'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-primary-600 focus:ring-primary-500" />
                <span className="font-medium text-gray-900">Credit Card or Debit Card</span>
              </label>
              <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:border-primary-500 transition-colors">
                <input type="radio" value="PayPal" checked={paymentMethod === 'PayPal'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-primary-600 focus:ring-primary-500" />
                <span className="font-medium text-gray-900">PayPal</span>
              </label>
            </div>
          </form>
        </div>

        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-gray-600 text-sm">
                <span>Items</span>
                <span className="font-medium">₹{itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600 text-sm">
                <span>Shipping</span>
                <span className="font-medium">₹{shippingPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600 text-sm">
                <span>Tax</span>
                <span className="font-medium">₹{taxPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-lg font-bold text-gray-900 border-t border-gray-100 pt-4 mb-8">
              <span>Total</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
            
            <button 
              type="submit"
              form="checkout-form"
              disabled={isProcessing}
              className="w-full bg-primary-600 text-white rounded-xl py-4 font-medium hover:bg-primary-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
