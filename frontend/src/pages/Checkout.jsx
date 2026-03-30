import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldCheck, Loader2, CheckCircle2, Smartphone } from 'lucide-react';
import UPIPaymentModal from '../components/UPIPaymentModal';

const Checkout = () => {
  const { cartItems, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI_DIRECT'); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipLoading, setIsZipLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, verification, success
  const [orderDetails, setOrderDetails] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const { updateProfile } = useContext(AuthContext);

  const fetchLocationData = async (zip) => {
    if (zip.length === 6) {
      setIsZipLoading(true);
      try {
        const { data } = await axios.get(`https://api.postalpincode.in/pincode/${zip}`);
        if (data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
          const postOffice = data[0].PostOffice[0];
          setCity(postOffice.District);
          setState(postOffice.State);
          setCountry('India');
          toast.success(`Located: ${postOffice.District}, ${postOffice.State}`);
        } else {
          toast.error('Location details not found for this pincode.');
        }
      } catch (error) {
        console.error('Pincode lookup failed', error);
        toast.error('Could not auto-fetch address details.');
      } finally {
        setIsZipLoading(false);
      }
    }
  };

  const handleZipChange = (e) => {
    const zip = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPostalCode(zip);
    if (zip.length === 6) {
      fetchLocationData(zip);
    }
  };

  useEffect(() => {
    if (user && user.role === 'seller') {
      toast.error('Sellers cannot purchase products.');
      navigate('/dashboard');
      return;
    }
    if (cartItems.length === 0 && paymentStatus === 'idle') {
      navigate('/cart');
    }
    
    // Pre-fill address if available in user profile
    if (user && user.shippingAddress && !address && !houseNumber && !postalCode) {
      setAddress(user.shippingAddress.address || '');
      setHouseNumber(user.shippingAddress.houseNumber || '');
      setCity(user.shippingAddress.city || '');
      setState(user.shippingAddress.state || '');
      setPostalCode(user.shippingAddress.postalCode || '');
      setCountry(user.shippingAddress.country || 'India');
      setPhone(user.phone || '');
    }
  }, [user, navigate, cartItems, paymentStatus]);

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const taxPrice = Number((0.18 * itemsPrice).toFixed(2));
  const shippingPrice = itemsPrice >= 999 ? 0 : 99;
  const totalPrice = itemsPrice + taxPrice + shippingPrice - discountAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      toast.error('Please enter a coupon code');
      return;
    }
    setIsCouponLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5001');
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`${API_URL}/api/coupons/validate`, { 
        code: couponCode,
        totalAmount: itemsPrice 
      }, config);
      
      let discount = 0;
      if (data.discountType === 'percentage') {
        discount = (data.discountAmount / 100) * itemsPrice;
      } else {
        discount = data.discountAmount;
      }
      
      setDiscountAmount(discount);
      setCouponApplied(true);
      toast.success(`Coupon applied! You saved ₹${discount.toFixed(2)}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon code');
      setDiscountAmount(0);
      setCouponApplied(false);
    } finally {
      setIsCouponLoading(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address || !houseNumber || !city || !state || !postalCode || !country) {
      toast.error('Please fill in all shipping details');
      return;
    }
    
    if (paymentMethod === 'UPI_DIRECT') {
      setIsModalOpen(true);
    } else {
      // Razorpay logic (placeholder)
      toast.info('Razorpay is currently in test mode. Please use Direct UPI for zero fees.');
    }
  };

  const submitUPIPayment = async (utr) => {
    setIsProcessing(true);
    setIsModalOpen(false);
    setPaymentStatus('verification');

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5001');
      
      // 1. Create Order
      const { data: order } = await axios.post(`${API_URL}/api/orders`, {
        orderItems: cartItems,
        shippingAddress: { address, houseNumber, city, state, postalCode, country, phone },
        paymentMethod: 'UPI',
        itemsPrice, 
        taxPrice, 
        shippingPrice, 
        totalPrice,
        discount: discountAmount,
        couponCode: couponApplied ? couponCode : '',
      }, config);

      // 1.5 Update User Profile if "Save Address" is checked
      if (saveAddress) {
        try {
          await updateProfile({
            phone,
            shippingAddress: { address, houseNumber, city, state, postalCode, country }
          });
        } catch (profileError) {
          console.error('Failed to save profile address', profileError);
        }
      }

      setOrderDetails(order);

      // 2. Submit Payment Details (UTR)
      await axios.put(`${API_URL}/api/orders/${order._id}/submit-payment`, { transactionId: utr }, config);
      
      // Simulate verification delay for "Real Web" feel
      setTimeout(async () => {
        setPaymentStatus('success');
        await clearCart();
        toast.success('UTR submitted for verification!');
        setTimeout(() => navigate('/order-success', { state: { orderId: order._id } }), 2500);
      }, 3000);

    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment submission failed');
      setPaymentStatus('idle');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tighter">Secure Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3">
          <form id="checkout-form" onSubmit={handlePlaceOrder} className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 md:p-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs">1</div>
                Shipping Destination
              </h2>
              {user?.shippingAddress?.address && (
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => {
                      setAddress(user.shippingAddress.address || '');
                      setHouseNumber(user.shippingAddress.houseNumber || '');
                      setCity(user.shippingAddress.city || '');
                      setState(user.shippingAddress.state || '');
                      setPostalCode(user.shippingAddress.postalCode || '');
                      setCountry(user.shippingAddress.country || 'India');
                      setPhone(user.phone || '');
                      toast.success('Saved address applied!');
                    }}
                    className="text-xs font-bold bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg border border-primary-200 hover:bg-primary-100 transition-colors"
                  >
                    Use Saved
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setAddress(''); setHouseNumber(''); setCity(''); setState(''); setPostalCode(''); setPhone('');
                    }}
                    className="text-xs font-bold bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-white transition-colors"
                  >
                    Clear Form
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-6 mb-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 relative group">
                  <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl outline-none transition-all font-bold group-focus-within:bg-white" placeholder="Street Name / Colony" />
                  <label className="absolute left-6 -top-2.5 px-2 bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest transition-all group-focus-within:text-black">Street Address</label>
                </div>
                <div className="relative group">
                  <input type="text" required value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl outline-none transition-all font-bold group-focus-within:bg-white" placeholder="No. 123 / A-1" />
                  <label className="absolute left-6 -top-2.5 px-2 bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest transition-all group-focus-within:text-black">House/Flat No.</label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group">
                  <input 
                    type="text" 
                    required 
                    value={postalCode} 
                    onChange={handleZipChange}
                    className={`w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl outline-none transition-all font-bold group-focus-within:bg-white ${isZipLoading ? 'pr-12' : ''}`} 
                    placeholder="Zip Code" 
                  />
                  <label className="absolute left-6 -top-2.5 px-2 bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest transition-all group-focus-within:text-black">Zip Code</label>
                  {isZipLoading && (
                    <div className="absolute right-6 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
                    </div>
                  )}
                </div>
                <div className="relative group">
                  <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl outline-none transition-all font-bold group-focus-within:bg-white" placeholder="City" />
                  <label className="absolute left-6 -top-2.5 px-2 bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest transition-all group-focus-within:text-black">City</label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group">
                  <input type="text" required value={state} onChange={(e) => setState(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl outline-none transition-all font-bold group-focus-within:bg-white" placeholder="State/Union Territory" />
                  <label className="absolute left-6 -top-2.5 px-2 bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest transition-all group-focus-within:text-black">State</label>
                </div>
                <div className="relative group">
                  <input type="text" required value={country} onChange={(e) => setCountry(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl outline-none transition-all font-bold group-focus-within:bg-white" placeholder="Country" />
                  <label className="absolute left-6 -top-2.5 px-2 bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest transition-all group-focus-within:text-black">Country</label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group">
                  <input 
                    type="tel" 
                    required 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl outline-none transition-all font-bold group-focus-within:bg-white" 
                    placeholder="Mobile Number" 
                  />
                  <label className="absolute left-6 -top-2.5 px-2 bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest transition-all group-focus-within:text-black">Mobile Number</label>
                </div>
                <div className="flex items-center gap-3 px-2">
                  <input 
                    type="checkbox" 
                    id="save-address"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="w-5 h-5 rounded-md border-gray-300 text-primary-600 focus:ring-primary-600 cursor-pointer"
                  />
                  <label htmlFor="save-address" className="text-sm font-bold text-gray-600 cursor-pointer">Save this address for future use</label>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs">2</div>
              Payment Method
            </h2>
            <div className="space-y-4">
              <label 
                className={`flex items-center gap-4 p-6 border-2 rounded-3xl cursor-pointer transition-all ${paymentMethod === 'UPI_DIRECT' ? 'border-primary-600 bg-primary-50/20 shadow-lg shadow-primary-500/5' : 'border-gray-100 hover:border-gray-200 bg-white opacity-60 hover:opacity-100'}`}
                onClick={() => setPaymentMethod('UPI_DIRECT')}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'UPI_DIRECT' ? 'border-primary-600' : 'border-gray-300'}`}>
                  {paymentMethod === 'UPI_DIRECT' && <div className="w-3 h-3 bg-primary-600 rounded-full" />}
                </div>
                <div className="flex-1">
                  <span className="font-black text-gray-900 block">Direct UPI Transfer (Zero Fee)</span>
                  <span className="text-xs text-gray-500">Scan & Submit UTR for fastest delivery</span>
                </div>
                <div className="bg-primary-100 text-primary-700 text-[10px] font-black px-2 py-1 rounded-md">SAVE 2%</div>
              </label>

              <label 
                className={`flex items-center gap-4 p-6 border-2 rounded-3xl cursor-pointer transition-all ${paymentMethod === 'Credit Card' ? 'border-primary-600 bg-primary-50/20 shadow-lg shadow-primary-500/5' : 'border-gray-100 hover:border-gray-200 bg-white opacity-30 cursor-not-allowed'}`}
                onClick={() => {}}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'Credit Card' ? 'border-primary-600' : 'border-gray-300'}`}>
                  {paymentMethod === 'Credit Card' && <div className="w-3 h-3 bg-primary-600 rounded-full" />}
                </div>
                <div className="flex-1">
                  <span className="font-black text-gray-900 block flex items-center gap-2">Razorpay Gateway <Lock className="w-3 h-3" /></span>
                  <span className="text-xs text-gray-500 italic">Maintenance mode...</span>
                </div>
              </label>
            </div>
          </form>
        </div>

        {/* Order Summary Sticky */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 p-8 md:p-10 sticky top-24">
            <h2 className="text-xl font-black text-gray-900 mb-8 pb-4 border-b border-gray-50">Summary</h2>

            {/* Items preview */}
            <div className="space-y-3 mb-6 max-h-48 overflow-y-auto scrollbar-hide">
              {cartItems.map((item) => (
                <div key={item.product} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                    <img
                      src={item.image?.startsWith('http') ? item.image : `${(import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5001')).replace(/\/$/, '')}/${item.image?.replace(/^\//, '')}`}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/assets/fallback.png'; }}
                    />
                    <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                      {item.qty}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{item.name}</p>
                  </div>
                  <span className="text-xs font-black text-gray-900 flex-shrink-0">₹{(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-50 pt-4 mb-6" />
            
            <div className="space-y-4 mb-10">
              <div className="flex justify-between items-center text-gray-500 font-bold">
                <span>Subtotal</span>
                <span className="text-gray-900">₹{itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-500 font-bold">
                <span>Shipping</span>
                <span className={shippingPrice === 0 ? 'text-green-600 font-black' : 'text-gray-900'}>
                  {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-500 font-bold">
                <span>Tax (GST)</span>
                <span className="text-gray-900">₹{taxPrice.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-green-600 font-black">
                  <span>Discount ({couponCode})</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Coupon Input */}
            <div className="mb-8">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={couponApplied}
                  className="flex-1 px-4 py-2 border-2 border-gray-100 rounded-xl outline-none focus:border-black font-bold text-sm"
                />
                <button
                  type="button"
                  onClick={couponApplied ? () => { setCouponApplied(false); setDiscountAmount(0); setCouponCode(''); } : handleApplyCoupon}
                  disabled={isCouponLoading}
                  className={`px-4 py-2 rounded-xl font-black text-xs transition-all ${couponApplied ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-gray-100 text-gray-900 hover:bg-black hover:text-white'}`}
                >
                  {isCouponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : couponApplied ? 'REMOVE' : 'APPLY'}
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-3xl font-black text-gray-900 mb-10">
              <span className="tracking-tighter">Total</span>
              <span className="text-primary-600">₹{totalPrice.toFixed(2)}</span>
            </div>
            
            <button 
              type="submit"
              form="checkout-form"
              disabled={isProcessing}
              className="w-full bg-gray-900 text-white rounded-[20px] py-6 font-black text-lg hover:bg-primary-600 shadow-2xl shadow-gray-200 transition-all flex items-center justify-center gap-4 group"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                  Place Secure Order
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-gray-400 mt-8 flex items-center justify-center gap-1 font-bold">
              <ShieldCheck className="w-3 h-3 text-green-500" /> Authorized & Secure StyleSync Gateway
            </p>
          </div>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      <UPIPaymentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        totalAmount={totalPrice}
        sellerUpiId={import.meta.env.VITE_SELLER_UPI_ID || '9024850689@axl'}
        onPaymentSubmit={submitUPIPayment}
      />

      {/* Verification Overlay */}
      <AnimatePresence>
        {paymentStatus !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-gray-900/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[48px] shadow-2xl max-w-md w-full p-16 text-center"
            >
              <div className="relative w-24 h-24 mx-auto mb-10">
                 <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-0 border-[6px] border-gray-50 border-t-primary-600 rounded-full"
                 />
                 <div className="absolute inset-2 bg-primary-50 rounded-full flex items-center justify-center">
                    <Smartphone className="w-10 h-10 text-primary-600" />
                 </div>
              </div>

              {paymentStatus === 'verification' ? (
                <>
                  <h3 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Verifying payment...</h3>
                  <p className="text-gray-500 font-bold mb-8 leading-relaxed px-4">
                    Please do not close this window or use the browser back button.
                  </p>
                  <div className="flex items-center justify-center gap-2">
                     <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce" />
                     <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                     <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8"
                >
                  <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-50/50">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Success!</h3>
                    <p className="text-gray-500 font-bold">UTR received. Order verification in progress.</p>
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
