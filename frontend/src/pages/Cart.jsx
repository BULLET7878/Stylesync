import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Trash2, ArrowRight, ShoppingBag, Plus, Minus, Truck, Tag, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';

const Cart = () => {
  const { cartItems, addToCart, removeFromCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const itemsPrice    = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice >= 999 ? 0 : 99;
  const taxPrice      = Number((0.18 * itemsPrice).toFixed(2));
  const totalPrice    = itemsPrice + shippingPrice + taxPrice;
  const savings       = cartItems.reduce((acc, item) => acc + ((item.originalPrice || item.price) - item.price) * item.qty, 0);
  const totalQty      = cartItems.reduce((acc, item) => acc + item.qty, 0);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 bg-gray-50">
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 max-w-md w-full">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8 text-sm">Looks like you haven't added anything yet.</p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-md">
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black text-gray-900">Shopping Cart</h1>
          <span className="text-sm text-gray-500 font-medium">{totalQty} item{totalQty !== 1 ? 's' : ''}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Items */}
          <div className="flex-1 space-y-3">
            {cartItems.map((item) => (
              <div key={item.product} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 hover:shadow-sm transition-shadow">
                <Link to={`/product/${item.product}`} className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={item.image?.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${item.image}`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/assets/fallback.png'; }}
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.product}`} className="font-bold text-gray-900 hover:text-primary-600 transition-colors text-sm line-clamp-2">
                    {item.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-base font-black text-gray-900">₹{item.price.toLocaleString()}</span>
                    {item.originalPrice > item.price && (
                      <>
                        <span className="text-xs text-gray-400 line-through">₹{item.originalPrice.toLocaleString()}</span>
                        <span className="text-[10px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                          -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => addToCart(item, Math.max(1, item.qty - 1))}
                        className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-gray-900">{item.qty}</span>
                      <button
                        onClick={() => addToCart(item, item.qty + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-gray-900">₹{(item.price * item.qty).toLocaleString()}</span>
                      <button
                        onClick={() => removeFromCart(item.product)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Link to="/shop" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors pt-2">
              ← Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-28">
              <h2 className="text-lg font-black text-gray-900 mb-5 pb-4 border-b border-gray-100">Order Summary</h2>

              <div className="space-y-3 mb-5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalQty} items)</span>
                  <span className="font-bold text-gray-900">₹{itemsPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={`font-bold ${shippingPrice === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%)</span>
                  <span className="font-bold text-gray-900">₹{taxPrice.toLocaleString()}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-green-600 bg-green-50 rounded-xl px-3 py-2 font-bold">
                    <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> You Save</span>
                    <span>₹{savings.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-lg font-black text-gray-900 border-t border-gray-100 pt-4 mb-5">
                <span>Total</span>
                <span className="text-primary-600">₹{totalPrice.toLocaleString()}</span>
              </div>

              {shippingPrice > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4 text-xs text-amber-700 font-medium flex items-center gap-2">
                  <Truck className="w-4 h-4 flex-shrink-0" />
                  Add ₹{(999 - itemsPrice).toLocaleString()} more for FREE shipping
                </div>
              )}

              <button
                onClick={() => {
                  if (!user) { toast.info('Please sign in to checkout'); navigate('/login?redirect=/checkout'); return; }
                  navigate('/checkout');
                }}
                className="w-full bg-primary-600 text-white rounded-xl py-4 font-black text-base hover:bg-primary-700 transition-all shadow-md flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                Secure & encrypted checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
