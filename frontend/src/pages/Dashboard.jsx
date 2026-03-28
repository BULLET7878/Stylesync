import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { User, Package, Clock, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${API_URL}/api/orders/myorders`, config);
        setOrders(data);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Profile Sidebar */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-4xl font-bold">
                {user.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-500">{user.email}</p>
              </div>
              <span className="bg-primary-50 text-primary-700 font-medium px-4 py-1 rounded-full text-sm capitalize">
                {user.role}
              </span>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-100 space-y-3">
              {user.role === 'buyer' && (
                <button 
                  onClick={async () => {
                    try {
                      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
                      const config = { headers: { Authorization: `Bearer ${user.token}` } };
                      const { data } = await axios.put(`${API_URL}/api/users/upgrade`, {}, config);
                      localStorage.setItem('userInfo', JSON.stringify(data));
                      window.location.reload();
                      toast.success('You are now a Seller!');
                    } catch (err) {
                      toast.error('Failed to upgrade account');
                    }
                  }}
                  className="w-full bg-green-600 text-white hover:bg-green-700 py-3 rounded-xl font-bold transition-all shadow-md"
                >
                  Become a Seller
                </button>
              )}
              <button 
                onClick={logout}
                className="w-full bg-red-50 text-red-600 hover:bg-red-100 py-3 rounded-xl font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Orders Listing */}
        <div className="w-full md:w-2/3 lg:w-3/4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Package className="w-6 h-6 text-primary-600" />
              Order History
            </h2>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(n => (
                  <div key={n} className="animate-pulse bg-gray-100 rounded-xl h-32 w-full" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
                <p className="text-gray-500 mt-1">When you place an order, it will appear here.</p>
              </div>
            ) : (
               <div className="space-y-6">
                 {orders.map(order => (
                   <div key={order._id} className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                     <div className="flex flex-wrap justify-between items-center border-b border-gray-100 pb-4 mb-4 gap-4">
                       <div>
                         <p className="text-sm text-gray-500">Order ID</p>
                         <p className="font-mono font-medium text-gray-900">{order._id}</p>
                       </div>
                       <div>
                         <p className="text-sm text-gray-500">Date</p>
                         <p className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                       </div>
                       <div>
                         <p className="text-sm text-gray-500">Total</p>
                         <p className="font-bold text-gray-900">₹{order.totalPrice.toFixed(2)}</p>
                       </div>
                       <div>
                         <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${order.isDelivered ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                           {order.isDelivered ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                           {order.isDelivered ? 'Delivered' : order.status}
                         </span>
                       </div>
                     </div>

                     <div className="space-y-3">
                       {order.orderItems.map((item, index) => (
                         <div key={index} className="flex items-center gap-4">
                           <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover bg-gray-100" />
                           <div className="flex-1">
                             <p className="font-medium text-gray-900">{item.name}</p>
                             <p className="text-sm text-gray-500">Qty: {item.qty} &times; ₹{item.price.toFixed(2)}</p>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
