import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { Trash2, ArrowRight } from 'lucide-react';

const Cart = () => {
  const { cartItems, addToCart, removeFromCart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/shop" className="bg-primary-600 text-white px-8 py-3 rounded-full font-medium shadow-md hover:bg-primary-700 transition">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <li key={item.product} className="p-6 flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-full sm:w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                    <img src={item.image && item.image.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${item.image}`} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left">
                    <Link to={`/product/${item.product}`} className="text-lg font-semibold text-gray-900 hover:text-primary-600">
                      {item.name}
                    </Link>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                      <p className="text-gray-900 font-bold">₹{item.price.toFixed(2)}</p>
                      {item.originalPrice > item.price && (
                        <p className="text-sm font-medium text-gray-400 line-through">₹{item.originalPrice.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                       <button onClick={() => addToCart(item, Math.max(1, item.qty - 1))} className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors">-</button>
                       <div className="w-10 text-center font-medium bg-white py-1">{item.qty}</div>
                       <button onClick={() => addToCart(item, item.qty + 1)} className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors">+</button>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.product)}
                      className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4 mb-4">Order Summary</h2>
            
            <div className="flex justify-between items-center text-gray-600 mb-2">
              <span>Subtotal</span>
              <span className="font-medium">₹{calculateTotal()}</span>
            </div>
            
            <div className="flex justify-between items-center text-gray-600 border-b border-gray-100 pb-4 mb-4">
              <span>Shipping</span>
              <span className="font-medium text-green-600">Free</span>
            </div>
            
            <div className="flex justify-between items-center text-lg font-bold text-gray-900 mb-8">
              <span>Total</span>
              <span>₹{calculateTotal()}</span>
            </div>
            
            <button 
              onClick={handleCheckout}
              className="w-full bg-primary-600 text-white rounded-xl py-4 flex items-center justify-center gap-2 font-medium hover:bg-primary-700 shadow-md hover:shadow-lg transition-all"
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
