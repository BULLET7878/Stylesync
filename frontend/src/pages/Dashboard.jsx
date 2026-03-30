import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Package, Clock, CheckCircle, XCircle, Truck, ShoppingBag, Store, ChevronRight, User, LogOut, Heart, Edit2, Loader2, Save, X } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { toast } from 'react-toastify';

const STATUS_CONFIG = {
  Pending:    { color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3.5 h-3.5" /> },
  Processing: { color: 'bg-blue-100 text-blue-700',   icon: <Package className="w-3.5 h-3.5" /> },
  Shipped:    { color: 'bg-purple-100 text-purple-700', icon: <Truck className="w-3.5 h-3.5" /> },
  Delivered:  { color: 'bg-green-100 text-green-700',  icon: <CheckCircle className="w-3.5 h-3.5" /> },
  Cancelled:  { color: 'bg-red-100 text-red-700',     icon: <XCircle className="w-3.5 h-3.5" /> },
};

const PAYMENT_CONFIG = {
  pending:              { color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
  pending_verification: { color: 'bg-blue-100 text-blue-700',    label: 'Verifying' },
  paid:                 { color: 'bg-green-100 text-green-700',   label: 'Paid' },
  failed:               { color: 'bg-red-100 text-red-700',      label: 'Failed' },
};

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('purchases');
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const { updateProfile } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  const [addressForm, setAddressForm] = useState({
    houseNumber: '', address: '', city: '', state: '', postalCode: '', country: 'India', phone: ''
  });

  useEffect(() => {
    if (user && user.shippingAddress) {
      setAddressForm({
        houseNumber: user.shippingAddress.houseNumber || '',
        address: user.shippingAddress.address || '',
        city: user.shippingAddress.city || '',
        state: user.shippingAddress.state || '',
        postalCode: user.shippingAddress.postalCode || '',
        country: user.shippingAddress.country || 'India',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setIsSavingAddress(true);
    try {
      await updateProfile({
        phone: addressForm.phone,
        shippingAddress: {
          houseNumber: addressForm.houseNumber,
          address: addressForm.address,
          city: addressForm.city,
          state: addressForm.state,
          postalCode: addressForm.postalCode,
          country: addressForm.country,
        }
      });
      toast.success('Address updated successfully');
      setIsEditingAddress(false);
    } catch (error) {
      toast.error('Failed to update address');
    }
    setIsSavingAddress(false);
  };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    const fetchOrders = async () => {
      try {
        const { data: myOrders } = await axios.get(`${API_URL}/api/orders/myorders`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setOrders(myOrders);

        if (user.role === 'seller') {
          const { data: sOrders } = await axios.get(`${API_URL}/api/orders/seller`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setSellerOrders(sOrders);
          if (myOrders.length === 0 && sOrders.length > 0) setActiveTab('sales');
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchOrders();
  }, [user, navigate]);

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const { data } = await axios.put(`${API_URL}/api/users/upgrade`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('You are now a Seller! Redirecting...');
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upgrade failed');
    }
    setUpgrading(false);
  };

  const handleReorder = async (item) => {
    try {
      // Create a mock product object that addToCart expects
      const productObj = {
        _id: item.product,
        name: item.name,
        image: item.image,
        price: item.price,
        countInStock: 99 // Assume stock is available, backend will verify
      };
      await addToCart(productObj, 1);
      toast.success(`${item.name} added to cart!`);
      navigate('/checkout');
    } catch (error) {
      toast.error(error.message || 'Failed to reorder');
    }
  };

  if (!user) return null;

  const totalSpent = orders.filter(o => o.isPaid).reduce((a, o) => a + o.totalPrice, 0);

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-black text-gray-900 mb-6">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-4 shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="font-black text-gray-900 text-lg">{user.name}</h2>
              <p className="text-gray-500 text-sm mt-0.5 truncate">{user.email}</p>
              <span className={`inline-block mt-2 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${user.role === 'seller' ? 'bg-amber-100 text-amber-700' : 'bg-primary-100 text-primary-700'}`}>
                {user.role}
              </span>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{user.role === 'seller' ? 'My Purchases' : 'Total Orders'}</span>
                <span className="font-black text-gray-900">{orders.length}</span>
              </div>
              {user.role === 'seller' && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total Sales</span>
                  <span className="font-black text-indigo-600">{sellerOrders.length}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Total Spent</span>
                <span className="font-black text-gray-900">₹{totalSpent.toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
              <Link to="/wishlist" className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                <span>My Wishlist</span><ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link to="/shop" className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                <span>Browse Shop</span><ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              {user.email === 'rahuldhakarmm@gmail.com' && (
                <Link to="/seller/dashboard" className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors text-sm font-bold text-amber-700">
                  <span className="flex items-center gap-2"><Store className="w-4 h-4" /> Seller Panel</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {/* Saved Address */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary-600" /> Shipping Address
                </h3>
                {!isEditingAddress && (
                  <button onClick={() => setIsEditingAddress(true)} className="text-primary-600 hover:text-primary-700 bg-primary-50 p-1.5 rounded-lg transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {isEditingAddress ? (
                <form onSubmit={handleAddressSubmit} className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100 mt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input required value={addressForm.houseNumber} onChange={(e) => setAddressForm({...addressForm, houseNumber: e.target.value})} placeholder="House/Flat No" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-primary-500" />
                    <input required value={addressForm.address} onChange={(e) => setAddressForm({...addressForm, address: e.target.value})} placeholder="Street/Locality" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-primary-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input required value={addressForm.city} onChange={(e) => setAddressForm({...addressForm, city: e.target.value})} placeholder="City" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-primary-500" />
                    <input required value={addressForm.postalCode} onChange={(e) => setAddressForm({...addressForm, postalCode: e.target.value})} placeholder="Pincode" maxLength={6} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-primary-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input required value={addressForm.state} onChange={(e) => setAddressForm({...addressForm, state: e.target.value})} placeholder="State" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-primary-500" />
                    <input required type="tel" value={addressForm.phone} onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})} placeholder="Phone" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-primary-500" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setIsEditingAddress(false)} className="flex-1 px-3 py-2 rounded-lg text-sm font-bold text-gray-500 border border-gray-200 hover:bg-white transition-colors">Cancel</button>
                    <button type="submit" disabled={isSavingAddress} className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
                      {isSavingAddress ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save'}
                    </button>
                  </div>
                </form>
              ) : user.shippingAddress?.address ? (
                <div className="text-sm text-gray-600 font-medium leading-relaxed bg-gray-50 p-3 rounded-xl">
                  <p>{user.shippingAddress.houseNumber}, {user.shippingAddress.address}</p>
                  <p>{user.shippingAddress.city}, {user.shippingAddress.state}</p>
                  <p>{user.shippingAddress.postalCode}</p>
                  <p>{user.shippingAddress.country}</p>
                  <p className="mt-2 text-primary-600">Ph: {user.phone}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-xl border border-dashed border-gray-300">No address saved yet. Add one here or at checkout.</p>
              )}
            </div>

            <button
               onClick={logout}
               className="w-full py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-bold hover:bg-red-50 transition-colors"
             >
               Sign Out
             </button>
          </div>

          {/* Orders */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-primary-600" /> 
                  {user.role === 'seller' ? 'Order Management' : 'Order History'}
                </h2>
                {user.role === 'seller' && (
                  <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button 
                      onClick={() => setActiveTab('purchases')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'purchases' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                    >
                      My Purchases
                    </button>
                    <button 
                      onClick={() => setActiveTab('sales')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'sales' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
                    >
                      Recent Sales
                    </button>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(n => <div key={n} className="skeleton rounded-xl h-28" />)}
                </div>
              ) : (activeTab === 'purchases' ? orders : sellerOrders).length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-2xl">
                  <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-900 mb-1">
                    {activeTab === 'purchases' ? 'No purchases yet' : 'No sales yet'}
                  </h3>
                  <p className="text-gray-500 text-sm mb-5">
                    {activeTab === 'purchases' 
                      ? 'Your orders will appear here once you shop.' 
                      : 'Received orders will appear here once customers buy your products.'}
                  </p>
                  <Link 
                    to={activeTab === 'purchases' ? "/shop" : "/seller/dashboard"} 
                    className="bg-primary-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 transition-all"
                  >
                    {activeTab === 'purchases' ? 'Start Shopping' : 'Manage Inventory'}
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {(activeTab === 'purchases' ? orders : sellerOrders).map(order => {
                    const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['Pending'];
                    const paymentCfg = PAYMENT_CONFIG[order.paymentStatus] || PAYMENT_CONFIG['pending'];
                    return (
                      <div key={order._id} className="border border-gray-100 rounded-2xl p-5 hover:border-primary-200 hover:shadow-sm transition-all">
                        {/* Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-50">
                          <div>
                            <p className="text-xs text-gray-400 font-medium mb-0.5">Order ID</p>
                            <p className="font-mono text-xs font-bold text-gray-700">{order._id.slice(-10).toUpperCase()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-medium mb-0.5">Date</p>
                            <p className="text-sm font-bold text-gray-700">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-medium mb-0.5">Total</p>
                            <p className="text-sm font-black text-gray-900">₹{order.totalPrice.toLocaleString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${statusCfg.color}`}>
                              {statusCfg.icon} {order.status}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${paymentCfg.color}`}>
                              {paymentCfg.label}
                            </span>
                          </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-2">
                          {order.orderItems.map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <img
                                src={item.image?.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${item.image}`}
                                alt={item.name}
                                className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                                onError={(e) => { e.target.src = '/assets/fallback.png'; }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                <p className="text-xs text-gray-500">Qty: {item.qty} × ₹{item.price.toLocaleString()}</p>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <p className="text-sm font-bold text-gray-900 flex-shrink-0">₹{(item.qty * item.price).toLocaleString()}</p>
                                <button 
                                  onClick={() => handleReorder(item)}
                                  className="text-[10px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1 rounded-lg transition-all"
                                >
                                  Buy Again
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Shipping */}
                        <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-500">
                          <span className="font-medium">Ship to:</span> {order.shippingAddress?.address}, {order.shippingAddress?.city} — {order.shippingAddress?.postalCode}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
