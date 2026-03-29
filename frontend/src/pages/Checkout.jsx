import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldCheck, CreditCard, Loader2, CheckCircle2 } from 'lucide-react';

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
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    if (user && user.role === 'seller') {
      toast.error('Sellers cannot purchase products. Please log in with a buyer account.');
      navigate('/dashboard');
    }
    if (cartItems.length === 0 && paymentStatus !== 'success') {
      navigate('/cart');
    }
  }, [user, navigate, cartItems, paymentStatus]);

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
      const { data } = await axios.post(`${API_URL}/api/orders`, order, config);
      setOrderDetails(data);
      
      // Start Payment Simulation
      setPaymentStatus('processing');
      
      // Simulate Payment Processing Latency
      setTimeout(async () => {
        try {
          await axios.put(`${API_URL}/api/orders/${data._id}/pay`, {}, config);
          setPaymentStatus('success');
          await clearCart();
          
          setTimeout(() => {
            navigate('/order-success');
          }, 2000);
        } catch (err) {
          toast.error('Payment verification failed. Please check your bank.');
          setPaymentStatus('idle');
          setIsProcessing(false);
        }
      }, 3500);

    } catch (error) {
      toast.error('Failed to initiate checkout');
      setIsProcessing(false);
    }
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
                <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="123 Main St" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="New York" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input type="text" required value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="10001" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input type="text" required value={country} onChange={(e) => setCountry(e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="United States" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-primary-600" />
              Payment Method
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-4 p-5 border rounded-2xl cursor-pointer hover:border-primary-500 hover:bg-primary-50/30 transition-all group">
                <input type="radio" value="Credit Card" checked={paymentMethod === 'Credit Card'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-primary-600 focus:ring-primary-500" />
                <div className="flex-1">
                  <span className="font-bold text-gray-900 block">Credit / Debit Card</span>
                  <span className="text-xs text-gray-500">Secure 256-bit encrypted checkout</span>
                </div>
                <Lock className="w-5 h-5 text-gray-300 group-hover:text-primary-400" />
              </label>
              <label className="flex items-center gap-4 p-5 border rounded-2xl cursor-pointer hover:border-primary-500 hover:bg-primary-50/30 transition-all group">
                <input type="radio" value="UPI" checked={paymentMethod === 'UPI'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-primary-600 focus:ring-primary-500" />
                <div className="flex-1">
                  <span className="font-bold text-gray-900 block">UPI (PhonePe, GPay, Paytm)</span>
                  <span className="text-xs text-gray-500">Fast & instant payments</span>
                </div>
                <span className="text-[10px] font-black bg-gray-100 px-2 py-1 rounded-md text-gray-500">POPULAR</span>
              </label>
            </div>
          </form>
        </div>

        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-gray-600">
                <span>Items Subtotal</span>
                <span className="font-bold text-gray-900">₹{itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Shipping Fee</span>
                <span className={`font-bold ${shippingPrice === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                  {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>GST (15%)</span>
                <span className="font-bold text-gray-900">₹{taxPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-2xl font-black text-gray-900 border-t border-gray-100 pt-6 mb-10">
              <span>Total Pay</span>
              <span className="text-primary-600">₹{totalPrice.toFixed(2)}</span>
            </div>
            
            <button 
              type="submit"
              form="checkout-form"
              disabled={isProcessing}
              className="w-full bg-primary-600 text-white rounded-2xl py-5 font-bold text-lg hover:bg-primary-700 shadow-xl hover:shadow-primary-100 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 text-primary-200" />
                  Pay Now & Secure Order
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-gray-400 mt-6 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-green-500" /> Authorized & Secure StyleSync Checkout
            </p>
          </div>
        </div>
      </div>

      {/* Payment Processing Overlay */}
      <AnimatePresence>
        {paymentStatus !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-gray-900/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[40px] shadow-2xl max-w-sm w-full p-12 text-center relative overflow-hidden"
            >
              {/* Animated Progress Ring Background */}
              <div className="absolute inset-0 opacity-5">
                <div className="w-full h-full bg-[radial-gradient(circle,theme(colors.primary.500)_1px,transparent_1px)] [background-size:20px_20px]" />
              </div>

              {paymentStatus === 'processing' ? (
                <>
                  <div className="relative w-24 h-24 mx-auto mb-10">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-4 border-gray-100 rounded-full border-t-primary-600"
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-4 bg-primary-50 rounded-full flex items-center justify-center"
                    >
                      <Lock className="w-8 h-8 text-primary-600" />
                    </motion.div>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3">Securing Transaction</h3>
                  <p className="text-gray-500 text-sm mb-2 animate-pulse">Contacting your bank...</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Encrypted 256-bit SSL</p>
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-50/50">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-gray-900 mb-2">Payment Verified</h3>
                    <p className="text-gray-500 font-medium">Redirecting to order success...</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;
