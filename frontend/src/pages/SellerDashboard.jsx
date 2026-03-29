import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Package, Plus, Edit, Trash2, ShoppingBag, Truck, AlertCircle, Users, BarChart3, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [stats, setStats] = useState({ 
    topProducts: [], 
    topCategories: [], 
    totalRevenue: 0, 
    totalOrders: 0, 
    totalProducts: 0,
    revenueTrends: [],
    mostViewedProducts: []
  });
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const hasFetched = React.useRef(false);
  
  useEffect(() => {
    if (authLoading) return;

    if (!user || user.role !== 'seller') {
      navigate('/login');
      return;
    }

    if (hasFetched.current) return;

    const fetchData = async () => {
      hasFetched.current = true;
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      try {
        // Fetch each source independently — one failure won't kill the whole dashboard
        const [productsResult, ordersResult, statsResult] = await Promise.allSettled([
          axios.get(`${API_URL}/api/products/seller`, config),
          axios.get(`${API_URL}/api/orders/seller`, config),
          axios.get(`${API_URL}/api/orders/stats`, config),
        ]);

        if (productsResult.status === 'fulfilled') setProducts(productsResult.value.data);
        else if (productsResult.reason?.response?.status === 401) toast.error('Account upgrade required to access products');
        else toast.error('Could not load your products');

        if (ordersResult.status === 'fulfilled') setOrders(ordersResult.value.data);
        else if (ordersResult.reason?.response?.status !== 401) toast.warn('Could not load orders');

        if (statsResult.status === 'fulfilled') setStats(statsResult.value.data);
        else if (statsResult.reason?.response?.status !== 401) toast.warn('Dashboard stats unavailable — DB may be reconnecting');

      } catch (err) {
        console.error('Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate, authLoading]);

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`${API_URL}/api/products/${id}`, config);
        setProducts(products.filter(p => p._id !== id));
        toast.success('Product deleted successfully');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const deliverHandler = async (id) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${API_URL}/api/orders/${id}/deliver`, {}, config);
      setOrders(orders.map(o => o._id === id ? { ...o, isDelivered: true, status: 'Delivered' } : o));
      toast.success('Order marked as delivered');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your products and track your sales</p>
        </div>
        <Link 
          to="/seller/product/new" 
          className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-all shadow-md"
        >
          <Plus className="w-5 h-5" /> Add New Product
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium mb-1 uppercase tracking-wider">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900">₹{(stats.totalRevenue || 0).toLocaleString()}</p>
          <div className="mt-2 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-md inline-block">
            Gross Sales
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium mb-1 uppercase tracking-wider">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalOrders || 0}</p>
          <div className="mt-2 text-blue-600 text-xs font-bold bg-blue-50 px-2 py-1 rounded-md inline-block">
            {orders.length} Processed
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium mb-1 uppercase tracking-wider">Total Products</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalProducts || 0}</p>
          <Link to="/seller/product/new" className="mt-2 text-primary-600 text-xs font-bold hover:underline inline-block">
            Manage Inventory
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Revenue Trends */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-50 pb-4">Revenue Trend (Last 7 Days)</h3>
          <div className="h-64 flex items-end justify-between gap-2 px-2">
            {stats.revenueTrends && stats.revenueTrends.length > 0 ? stats.revenueTrends.map((t, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div 
                  className="w-full bg-primary-100 group-hover:bg-primary-500 transition-all rounded-t-lg shadow-sm" 
                  style={{ height: `${(t.amount / Math.max(...stats.revenueTrends.map(x => x.amount), 1)) * 100}%`, minHeight: '8px' }}
                />
                <span className="text-[10px] text-gray-400 font-bold mt-2">{t.date.split('-').slice(1).join('/')}</span>
              </div>
            )) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium italic">No sales trend available yet</div>
            )}
          </div>
        </div>

        {/* Most Viewed */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-50 pb-4">Popular Items</h3>
          <div className="space-y-6">
            {stats.mostViewedProducts && stats.mostViewedProducts.length > 0 ? stats.mostViewedProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100 group-hover:border-primary-200 transition-colors">
                  <img src={p.image || (p.images && p.images[0])} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors">{p.title}</p>
                  <p className="text-xs text-gray-500 font-medium">{p.views} views</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-extrabold text-gray-900">₹{p.price}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-gray-400 font-medium italic">No view data collected</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary-500" /> Top Selling Products
          </h3>
          <div className="space-y-4">
            {stats.topProducts.map((p, idx) => {
              const product = products.find(prod => prod._id === p.id);
              return (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-lg font-bold text-gray-300">#{idx + 1}</span>
                    <span className="font-medium text-gray-900 truncate max-w-[150px]">{product?.title || 'Unknown Product'}</span>
                  </div>
                  <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-bold">{p.qty} Sold</span>
                </div>
              );
            })}
            {stats.topProducts.length === 0 && <p className="text-gray-500 text-center py-4">No sales data yet.</p>}
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" /> Trending Categories
          </h3>
          <div className="space-y-4">
            {stats.topCategories.map((c, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <span className="font-medium text-gray-900 capitalize">{c.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 rounded-full" 
                      style={{ width: `${(c.qty / Math.max(...stats.topCategories.map(cat => cat.qty))) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-500">{c.qty}</span>
                </div>
              </div>
            ))}
            {stats.topCategories.length === 0 && <p className="text-gray-500 text-center py-4">No trends detected yet.</p>}
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {/* Products Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Package className="w-6 h-6 text-primary-500" /> My Products
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Product</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Category</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Price</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Stock</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-gray-500">No products found. Start by adding one!</td>
                    </tr>
                  ) : (
                    products.map(product => (
                      <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={product.images[0] && product.images[0].startsWith('http') ? product.images[0] : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${product.images[0]}`} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-100" />
                            <span className="font-medium text-gray-900">{product.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 capitalize">{product.category}</td>
                        <td className="px-6 py-4 font-bold text-gray-900">₹{product.price.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.countInStock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {product.countInStock > 0 ? `${product.countInStock} in stock` : 'Out of stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link to={`/seller/product/edit/${product._id}`} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                              <Edit className="w-5 h-5" />
                            </Link>
                            <button onClick={() => deleteHandler(product._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Orders Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary-500" /> Recent Sales
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Order ID</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Buyer</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Shipping Address</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Payment</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Total</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-10 text-center text-gray-500">No orders received yet.</td>
                    </tr>
                  ) : (
                    orders.map(order => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-sm text-gray-500">{order._id.substring(0, 10).toUpperCase()}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col text-sm">
                            <span className="font-bold text-gray-900">{order.user?.name}</span>
                            <span className="text-gray-500">{order.user?.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col text-sm text-gray-600">
                            <span>{order.shippingAddress?.address}</span>
                            <span>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</span>
                            <span>{order.shippingAddress?.country}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {order.isPaid ? 'PAID' : 'UNPAID'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">₹{order.totalPrice.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.isDelivered ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {order.isDelivered ? 'Delivered' : 'Pending Delivery'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {!order.isDelivered && (
                            <button 
                              onClick={() => deliverHandler(order._id)}
                              className="text-xs font-bold bg-gray-900 text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1"
                            >
                              <Truck className="w-3 h-3" /> Mark Delivered
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SellerDashboard;
