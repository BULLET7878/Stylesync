import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

const OrderSuccess = () => {
  useEffect(() => {
    // Celebrate!
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#0ea5e9', '#6366f1', '#22c55e']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#0ea5e9', '#6366f1', '#22c55e']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center scale-up-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">Payment Successful!</h1>
        <p className="text-gray-600 mb-10 leading-relaxed font-medium">
          Your transaction has been verified. Thank you for choosing StyleSync. Your order is being processed by our sellers.
        </p>

        <div className="space-y-4">
          <Link 
            to="/dashboard" 
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-md"
          >
            <ShoppingBag className="w-5 h-5" /> View Order History
          </Link>
          
          <Link 
            to="/shop" 
            className="w-full bg-white text-gray-900 border border-gray-200 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
          >
            Continue Shopping <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-400 font-medium italic">
          A confirmation email will be sent shortly.
        </p>
      </div>
    </div>
  );
};

export default OrderSuccess;
