import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Package, Clock, CheckCircle, XCircle, Truck, ShoppingBag, Store, ChevronRight, User, Mail, Shield } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    const fetchOrders = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const { data } = await axios.get(`${API_URL}/api/orders/myorders`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setOrders(data);
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

  if (!user) return null;

  const totalSpent = orders.filter(o => o.isPaid).reduce((a, o) => a + o.totalPrice, 0);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-black text-gray-900 mb-8">My Account</h1>

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
                <span className="text-gray-500">Total Orders</span>
                <span className="font-black text-gray-900">{orders.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Total Spent</span>
                <span className="font-black text-gray-900">₹{totalSpent.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Delivered</span>
                <span className="font-black text-green-600">{orders.filter(o => o.isDelivered).length}</span>
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
              <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary-600" /> Order History
              </h2>

              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(n => <div key={n} className="skeleton rounded-xl h-28" />)}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-2xl">
                  <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-900 mb-1">No orders yet</h3>
                  <p className="text-gray-500 text-sm mb-5">Your orders will appear here once you shop.</p>
                  <Link to="/shop" className="bg-primary-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 transition-all">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => {
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
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80'; }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                <p className="text-xs text-gray-500">Qty: {item.qty} × ₹{item.price.toLocaleString()}</p>
                              </div>
                              <p className="text-sm font-bold text-gray-900 flex-shrink-0">₹{(item.qty * item.price).toLocaleString()}</p>
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
