import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowRight, Truck, Package, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

const OrderSuccess = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;
  const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  useEffect(() => {
    const end = Date.now() + 3000;
    (function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#6366f1', '#f97316', '#22c55e'] });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#6366f1', '#f97316', '#22c55e'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  }, []);

  return (
    <div className="min-h-[85vh] bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center mb-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Your payment is under verification. We will confirm your order shortly.
          </p>
          {orderId && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 mb-6 text-left">
              <p className="text-xs text-gray-400 font-medium mb-0.5">Order ID</p>
              <p className="font-mono font-bold text-gray-900 text-sm">{orderId.slice(-12).toUpperCase()}</p>
            </div>
          )}
          <div className="space-y-3 mb-8 text-left">
            {[
              { icon: <CheckCircle className="w-4 h-4 text-green-500" />, label: 'Order received', done: true },
              { icon: <Clock className="w-4 h-4 text-amber-500" />, label: 'Payment verification in progress', done: false },
              { icon: <Package className="w-4 h-4 text-gray-300" />, label: 'Seller packing your order', done: false },
              { icon: <Truck className="w-4 h-4 text-gray-300" />, label: `Estimated delivery: ${estimatedDelivery}`, done: false },
            ].map((step, i) => (
              <div key={i} className={`flex items-center gap-3 text-sm ${step.done ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                {step.icon}
                <span>{step.label}</span>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <Link to="/dashboard" className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-all shadow-md">
              <ShoppingBag className="w-4 h-4" /> Track My Order
            </Link>
            <Link to="/shop" className="w-full bg-white text-gray-700 border border-gray-200 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400">
          A confirmation will be sent to your registered email.
        </p>
      </div>
    </div>
  );
};

export default OrderSuccess;
