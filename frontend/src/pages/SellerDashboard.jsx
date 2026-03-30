import { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import {
  Package, Plus, Edit, Trash2, ShoppingBag, Truck,
  AlertCircle, BarChart3, TrendingUp, IndianRupee,
  CheckCircle, XCircle, Clock, Eye, MapPin,
  ChevronDown, ChevronUp, Search, X
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const StatCard = ({ label, value, sub, icon, color = 'primary' }) => {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    green:   'bg-green-50 text-green-600',
    amber:   'bg-amber-50 text-amber-600',
    blue:    'bg-blue-50 text-blue-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>{icon}</div>
      </div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      <p className="text-sm font-medium text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
};

const ShipModal = ({ order, onClose, onShipped }) => {
  const { user } = useContext(AuthContext);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courier, setCourier] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await axios.put(`${API_URL}/api/orders/${order._id}/ship`,
        { trackingNumber, courier },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      toast.success('Order marked as shipped!');
      onShipped(order._id, trackingNumber, courier);
      onClose();
    } catch (e) { toast.error('Failed to update shipment'); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary-600" /> Mark as Shipped
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5 text-sm">
          <p className="font-black text-blue-900 mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> Delivery Address
          </p>
          <p className="text-gray-800 font-bold">{order.user?.name}</p>
          <p className="text-gray-700">{order.shippingAddress?.houseNumber}, {order.shippingAddress?.address}</p>
          <p className="text-gray-700">{order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.postalCode}</p>
          <p className="text-gray-700">{order.shippingAddress?.country}</p>
          {order.shippingAddress?.phone && (
            <p className="text-primary-700 font-black mt-2">📞 {order.shippingAddress.phone}</p>
          )}
        </div>
        <div className="space-y-3 mb-5">
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Courier / Service</label>
            <select value={courier} onChange={e => setCourier(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary-400">
              <option value="">Select courier</option>
              {['Delhivery','BlueDart','DTDC','Ekart','India Post','Xpressbees','Shadowfax','Other'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Tracking Number (optional)</label>
            <input type="text" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)}
              placeholder="e.g. DL1234567890IN"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={submit} disabled={loading}
            className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2">
            <Truck className="w-4 h-4" /> {loading ? 'Updating...' : 'Confirm Shipment'}
          </button>
        </div>
      </div>
    </div>
  );
};

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ topProducts: [], topCategories: [], totalRevenue: 0, totalOrders: 0, totalProducts: 0, revenueTrends: [], mostViewedProducts: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [shipModalOrder, setShipModalOrder] = useState(null);
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'seller') { navigate('/login'); return; }
    if (hasFetched.current) return;
    const fetchData = async () => {
      hasFetched.current = true;
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      try {
        const [pRes, oRes, sRes] = await Promise.allSettled([
          axios.get(`${API_URL}/api/products/seller`, config),
          axios.get(`${API_URL}/api/orders/seller`, config),
          axios.get(`${API_URL}/api/orders/stats`, config),
        ]);
        if (pRes.status === 'fulfilled') setProducts(pRes.value.data);
        if (oRes.status === 'fulfilled') {
          const newOrders = oRes.value.data;
          const lastCount = parseInt(localStorage.getItem(`lastOrderCount_${user._id}`) || '0');
          if (newOrders.length > lastCount && lastCount !== 0) toast.info('New Order Arrived! Check your orders tab.');
          localStorage.setItem(`lastOrderCount_${user._id}`, newOrders.length.toString());
          setOrders(newOrders);
        }
        if (sRes.status === 'fulfilled') setStats(sRes.value.data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();
  }, [user, navigate, authLoading]);

  const deleteHandler = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`${API_URL}/api/products/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
      setProducts(products.filter(p => p._id !== id));
      toast.success('Product deleted');
    } catch (e) { toast.error('Failed to delete'); }
  };

  const confirmPayment = async (id) => {
    if (!window.confirm('Confirm you have received this payment?')) return;
    try {
      await axios.put(`${API_URL}/api/orders/${id}/confirm-payment`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
      setOrders(orders.map(o => o._id === id ? { ...o, isPaid: true, paymentStatus: 'paid', status: 'Processing' } : o));
      toast.success('Payment confirmed!');
    } catch (e) { toast.error('Failed to confirm payment'); }
  };

  const rejectPayment = async (id) => {
    if (!window.confirm('Reject this payment? Order will be cancelled.')) return;
    try {
      await axios.put(`${API_URL}/api/orders/${id}/reject-payment`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
      setOrders(orders.map(o => o._id === id ? { ...o, status: 'Cancelled', paymentStatus: 'failed' } : o));
      toast.success('Payment rejected');
    } catch (e) { toast.error('Failed to reject payment'); }
  };

  const markDelivered = async (id) => {
    try {
      await axios.put(`${API_URL}/api/orders/${id}/deliver`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
      setOrders(orders.map(o => o._id === id ? { ...o, isDelivered: true, status: 'Delivered' } : o));
      toast.success('Marked as delivered');
    } catch (e) { toast.error('Failed to update'); }
  };

  const handleShipped = (id, trackingNumber, courier) => {
    setOrders(orders.map(o => o._id === id ? { ...o, status: 'Shipped', trackingNumber, courier } : o));
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Loading dashboard...</p>
      </div>
    </div>
  );

  const pendingOrders = orders.filter(o => !o.isPaid && o.paymentResult?.transactionId);
  const maxRevenue = Math.max(...(stats.revenueTrends?.map(t => t.amount) || [1]), 1);

  const filteredOrders = orders.filter(o => {
    const matchFilter =
      orderFilter === 'all' ||
      (orderFilter === 'pending' && !o.isPaid && o.paymentResult?.transactionId) ||
      (orderFilter === 'paid' && o.isPaid && o.status !== 'Shipped' && o.status !== 'Delivered') ||
      (orderFilter === 'shipped' && o.status === 'Shipped') ||
      (orderFilter === 'delivered' && o.status === 'Delivered') ||
      (orderFilter === 'cancelled' && o.status === 'Cancelled');
    const matchSearch = !orderSearch ||
      o._id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.shippingAddress?.city?.toLowerCase().includes(orderSearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="bg-gray-50">
      {shipModalOrder && (
        <ShipModal order={shipModalOrder} onClose={() => setShipModalOrder(null)} onShipped={handleShipped} />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Seller Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">Welcome back, {user.name.split(' ')[0]}</p>
          </div>
          <Link to="/seller/product/new"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-700 transition-all shadow-md">
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>

        {pendingOrders.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm font-bold text-amber-800">
              {pendingOrders.length} order{pendingOrders.length > 1 ? 's' : ''} awaiting payment verification
            </p>
            <button onClick={() => { setActiveTab('orders'); setOrderFilter('pending'); }} className="ml-auto text-xs font-black text-amber-700 underline">
              Review Now
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Revenue" value={`₹${(stats.totalRevenue || 0).toLocaleString()}`} icon={<IndianRupee className="w-5 h-5" />} color="green" />
          <StatCard label="Total Orders" value={stats.totalOrders || 0} sub={`${orders.filter(o => o.isPaid).length} paid`} icon={<ShoppingBag className="w-5 h-5" />} color="primary" />
          <StatCard label="Products Listed" value={stats.totalProducts || 0} sub={`${products.filter(p => p.countInStock === 0).length} out of stock`} icon={<Package className="w-5 h-5" />} color="amber" />
          <StatCard label="Pending Verification" value={pendingOrders.length} sub="Need your action" icon={<Clock className="w-5 h-5" />} color="blue" />
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          {['overview', 'products', 'orders'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary-600" /> Revenue (Last 7 Days)
              </h3>
              {stats.revenueTrends?.length > 0 ? (
                <div className="flex items-end gap-2 h-40">
                  {stats.revenueTrends.map((t, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                      <span className="text-[10px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">₹{t.amount.toLocaleString()}</span>
                      <div className="w-full bg-primary-100 hover:bg-primary-500 transition-colors rounded-t-lg"
                        style={{ height: `${Math.max((t.amount / maxRevenue) * 100, 4)}%` }} />
                      <span className="text-[9px] text-gray-400 font-bold">{t.date.slice(5)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No sales data yet</div>
              )}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-500" /> Most Viewed
              </h3>
              <div className="space-y-3">
                {stats.mostViewedProducts?.length > 0 ? stats.mostViewedProducts.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-black text-gray-300 w-4">#{i+1}</span>
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={p.images?.[0]?.startsWith('http') ? p.images[0] : `${API_URL}${p.images?.[0]}`}
                        alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = '/assets/fallback.png'; }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{p.title}</p>
                      <p className="text-[10px] text-gray-400">{p.views} views</p>
                    </div>
                  </div>
                )) : <p className="text-sm text-gray-400 text-center py-4">No data yet</p>}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary-600" /> Top Categories
              </h3>
              <div className="space-y-3">
                {stats.topCategories?.length > 0 ? stats.topCategories.map((c, i) => {
                  const maxQty = Math.max(...stats.topCategories.map(x => x.qty), 1);
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                        <span className="capitalize">{c.name}</span><span>{c.qty} sold</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(c.qty / maxQty) * 100}%` }} />
                      </div>
                    </div>
                  );
                }) : <p className="text-sm text-gray-400 text-center py-4">No sales yet</p>}
              </div>
            </div>
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" /> Top Selling Products
              </h3>
              <div className="space-y-2">
                {stats.topProducts?.length > 0 ? stats.topProducts.map((p, i) => {
                  const prod = products.find(x => x._id === p.id);
                  return (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-gray-300 w-5">#{i+1}</span>
                        <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{prod?.title || 'Unknown'}</span>
                      </div>
                      <span className="bg-green-100 text-green-700 text-xs font-black px-2.5 py-1 rounded-full">{p.qty} sold</span>
                    </div>
                  );
                }) : <p className="text-sm text-gray-400 text-center py-4">No sales data yet</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-black text-gray-900">My Products ({products.length})</h3>
              <Link to="/seller/product/new" className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add New
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-3 text-xs font-black text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-5 py-3 text-xs font-black text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-5 py-3 text-xs font-black text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-5 py-3 text-xs font-black text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-5 py-3 text-xs font-black text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.length === 0 ? (
                    <tr><td colSpan="5" className="px-5 py-12 text-center text-gray-400 text-sm">No products yet. <Link to="/seller/product/new" className="text-primary-600 font-bold">Add your first product →</Link></td></tr>
                  ) : products.map(p => (
                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img src={p.images?.[0]?.startsWith('http') ? p.images[0] : `${API_URL}${p.images?.[0]}`}
                              alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = '/assets/fallback.png'; }} />
                          </div>
                          <span className="text-sm font-bold text-gray-900 max-w-[180px] truncate">{p.title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 capitalize">{p.category}</td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-black text-gray-900">₹{(p.discountPrice || p.price).toLocaleString()}</span>
                        {p.discountPrice > 0 && p.discountPrice < p.price && (
                          <span className="text-xs text-gray-400 line-through ml-1">₹{p.price.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          p.countInStock === 0 ? 'bg-red-100 text-red-700' :
                          p.countInStock <= 5 ? 'bg-amber-100 text-amber-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {p.countInStock === 0 ? 'Out of Stock' : p.countInStock <= 5 ? `Low: ${p.countInStock}` : `${p.countInStock} in stock`}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <Link to={`/seller/product/edit/${p._id}`} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button onClick={() => deleteHandler(p._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <h3 className="font-black text-gray-900">Orders ({filteredOrders.length})</h3>
              <div className="flex flex-wrap gap-2 items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input type="text" placeholder="Search orders..." value={orderSearch}
                    onChange={e => setOrderSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-400 w-44" />
                </div>
                <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                  {[{key:'all',label:'All'},{key:'pending',label:'Verify'},{key:'paid',label:'To Ship'},{key:'shipped',label:'Shipped'},{key:'delivered',label:'Done'},{key:'cancelled',label:'Cancelled'}].map(f => (
                    <button key={f.key} onClick={() => setOrderFilter(f.key)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${orderFilter === f.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {filteredOrders.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-sm">No orders found</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredOrders.map(order => {
                  const isExpanded = expandedOrder === order._id;
                  const statusColor =
                    order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'Shipped'   ? 'bg-purple-100 text-purple-700' :
                    order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                    order.status === 'Processing'? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700';
                  return (
                    <div key={order._id}>
                      <div className="px-5 py-4 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="w-28 flex-shrink-0">
                            <p className="font-mono text-xs font-bold text-gray-700">{order._id.slice(-8).toUpperCase()}</p>
                            <p className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                          </div>
                          <div className="flex-1 min-w-[120px]">
                            <p className="text-sm font-bold text-gray-900">{order.user?.name}</p>
                            <p className="text-[11px] text-gray-500">{order.user?.email}</p>
                          </div>
                          <div className="flex -space-x-2 flex-shrink-0">
                            {order.orderItems.slice(0, 3).map((item, i) => (
                              <div key={i} title={item.name} className="w-8 h-8 rounded-lg border-2 border-white bg-gray-100 overflow-hidden ring-1 ring-gray-100">
                                <img src={item.image?.startsWith('http') ? item.image : `${API_URL}${item.image}`}
                                  alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = '/assets/fallback.png'; }} />
                              </div>
                            ))}
                            {order.orderItems.length > 3 && (
                              <div className="w-8 h-8 rounded-lg border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-black text-gray-600">
                                +{order.orderItems.length - 3}
                              </div>
                            )}
                          </div>
                          <span className="text-sm font-black text-gray-900 flex-shrink-0">₹{order.totalPrice.toLocaleString()}</span>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex-shrink-0 ${
                            order.isPaid ? 'bg-green-100 text-green-700' :
                            order.paymentStatus === 'pending_verification' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {order.isPaid ? 'Paid' : order.paymentStatus === 'pending_verification' ? 'Verifying' : 'Unpaid'}
                          </span>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex-shrink-0 ${statusColor}`}>
                            {order.status}
                          </span>
                          <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
                            {!order.isPaid && order.paymentResult?.transactionId && order.status !== 'Cancelled' && (
                              <>
                                <button onClick={() => confirmPayment(order._id)}
                                  className="flex items-center gap-1 text-[10px] font-black bg-green-600 text-white px-2 py-1.5 rounded-lg hover:bg-green-700 transition-colors">
                                  <CheckCircle className="w-3 h-3" /> Confirm
                                </button>
                                <button onClick={() => rejectPayment(order._id)}
                                  className="flex items-center gap-1 text-[10px] font-black bg-red-500 text-white px-2 py-1.5 rounded-lg hover:bg-red-600 transition-colors">
                                  <XCircle className="w-3 h-3" /> Reject
                                </button>
                              </>
                            )}
                            {order.isPaid && order.status === 'Processing' && (
                              <button onClick={() => setShipModalOrder(order)}
                                className="flex items-center gap-1 text-[10px] font-black bg-primary-600 text-white px-2 py-1.5 rounded-lg hover:bg-primary-700 transition-colors">
                                <Truck className="w-3 h-3" /> Ship
                              </button>
                            )}
                            {order.status === 'Shipped' && (
                              <button onClick={() => markDelivered(order._id)}
                                className="flex items-center gap-1 text-[10px] font-black bg-gray-900 text-white px-2 py-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                                <CheckCircle className="w-3 h-3" /> Delivered
                              </button>
                            )}
                            <button onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="px-5 pb-5 bg-gray-50 border-t border-gray-100">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            <div className="bg-white rounded-xl border border-gray-100 p-4">
                              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-primary-600" /> Delivery Address
                              </p>
                              <p className="font-bold text-gray-900">{order.user?.name}</p>
                              <p className="text-sm text-gray-700 mt-1">{order.shippingAddress?.houseNumber}, {order.shippingAddress?.address}</p>
                              <p className="text-sm text-gray-700">{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                              <p className="text-sm text-gray-700">PIN: <span className="font-bold">{order.shippingAddress?.postalCode}</span></p>
                              <p className="text-sm text-gray-700">{order.shippingAddress?.country}</p>
                              {order.shippingAddress?.phone && <p className="text-sm font-black text-primary-600 mt-2">📞 {order.shippingAddress.phone}</p>}
                              {order.user?.email && <p className="text-xs text-gray-400 mt-1">✉ {order.user.email}</p>}
                            </div>
                            <div className="bg-white rounded-xl border border-gray-100 p-4">
                              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Order Items</p>
                              <div className="space-y-2 mb-3">
                                {order.orderItems.map((item, i) => (
                                  <div key={i} className="flex items-center gap-2">
                                    <img src={item.image?.startsWith('http') ? item.image : `${API_URL}${item.image}`}
                                      alt="" className="w-8 h-8 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                                      onError={(e) => { e.target.src = '/assets/fallback.png'; }} />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-bold text-gray-900 truncate">{item.name}</p>
                                      <p className="text-[10px] text-gray-500">Qty: {item.qty} × ₹{item.price.toLocaleString()}</p>
                                    </div>
                                    <span className="text-xs font-black text-gray-900">₹{(item.qty * item.price).toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                              {order.paymentResult?.transactionId && (
                                <div className="pt-2 border-t border-gray-50">
                                  <p className="text-[10px] text-gray-400 font-medium">UTR / Transaction ID</p>
                                  <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700 select-all block mt-1">{order.paymentResult.transactionId}</code>
                                </div>
                              )}
                              {order.trackingNumber && (
                                <div className="pt-2 border-t border-gray-50 mt-2">
                                  <p className="text-[10px] text-gray-400 font-medium">Tracking</p>
                                  <p className="text-xs font-bold text-gray-700">{order.courier} — <code className="select-all">{order.trackingNumber}</code></p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
