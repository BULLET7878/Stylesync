import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Copy, Check, Info, Smartphone, QrCode, 
  ChevronRight, ArrowLeft, Loader2, ShieldCheck,
  CreditCard, SmartphoneIcon
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-toastify';

const UPIPaymentModal = ({ isOpen, onClose, totalAmount, onPaymentSubmit, sellerUpiId }) => {
  const [step, setStep] = useState('select'); // select, qr, utr, processing
  const [copied, setCopied] = useState(false);
  const [utr, setUtr] = useState('');
  
  const upiLink = `upi://pay?pa=${sellerUpiId}&pn=StyleSync&am=${totalAmount}&cu=INR&tn=StyleSync_Order`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sellerUpiId);
    setCopied(true);
    toast.success('UPI ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleIHavePaid = () => {
    setStep('utr');
  };

  const handleFinalSubmit = () => {
    if (utr.length < 12) {
      toast.error('Please enter a valid 12-digit UTR number');
      return;
    }
    onPaymentSubmit(utr);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-white w-full max-w-[440px] rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gray-900 px-8 py-6 text-white flex justify-between items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-400 mb-1">StyleSync Checkout</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black">₹{totalAmount.toLocaleString()}</span>
                <span className="text-xs font-bold text-gray-400">Total Amount</span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="relative z-10 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8">
            <AnimatePresence mode="wait">
              {step === 'select' && (
                <motion.div 
                  key="select"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Choose Payment Method</p>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={() => setStep('qr')}
                      className="w-full flex items-center justify-between p-5 rounded-2xl bg-gray-50 hover:bg-primary-50 border border-gray-100 hover:border-primary-200 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                          <QrCode className="w-6 h-6 text-primary-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-black text-gray-900">Show QR Code</p>
                          <p className="text-xs text-gray-500">Scan and pay with any app</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-600" />
                    </button>

                    <a 
                      href={upiLink}
                      className="w-full flex items-center justify-between p-5 rounded-2xl bg-gray-50 hover:bg-primary-50 border border-gray-100 hover:border-primary-200 transition-all group lg:hidden"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <SmartphoneIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-black text-gray-900">Pay via UPI App</p>
                          <p className="text-xs text-gray-500">Auto-open GPay, PhonePe, etc.</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-600" />
                    </a>
                  </div>

                  <div className="pt-4 border-t border-dotted border-gray-200">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">Or Copy UPI ID</p>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <code className="flex-1 text-sm font-mono font-bold text-gray-600">
                        {sellerUpiId}
                      </code>
                      <button 
                        onClick={copyToClipboard}
                        className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 'qr' && (
                <motion.div 
                  key="qr"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col items-center text-center space-y-6"
                >
                  <button 
                    onClick={() => setStep('select')}
                    className="self-start flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>

                  <div className="p-6 bg-white rounded-3xl shadow-xl border border-gray-100 relative group">
                    <QRCodeSVG 
                      value={upiLink}
                      size={200}
                      level="H"
                      includeMargin={false}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-white/10 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-opacity rounded-3xl pointer-events-none">
                       <p className="bg-gray-900 text-white text-[10px] font-black px-4 py-2 rounded-full shadow-lg">SCAN TO PAY</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-gray-900 mb-2">Scan & Pay ₹{totalAmount}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed px-4">
                      Use GPay, PhonePe, Paytm or any other UPI app to complete the transaction.
                    </p>
                  </div>

                  <button 
                    onClick={handleIHavePaid}
                    className="w-full bg-gray-900 text-white p-5 rounded-2xl font-black shadow-xl shadow-gray-200 active:scale-95 transition-all text-sm"
                  >
                    I Have Paid
                  </button>
                </motion.div>
              )}

              {step === 'utr' && (
                <motion.div 
                  key="utr"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <button 
                    onClick={() => setStep('qr')}
                    className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>

                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">Verify Payment</h3>
                    <p className="text-sm text-gray-500">Please enter the 12-digit UTR / Transaction ID from your UPI app.</p>
                  </div>

                  <div className="space-y-4">
                    <input 
                      type="text"
                      maxLength="12"
                      placeholder="e.g. 412345678901"
                      value={utr}
                      onChange={(e) => setUtr(e.target.value)}
                      className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-center font-mono text-xl font-black focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-gray-200"
                    />
                    
                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3 items-start">
                      <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                        Incorrect UTR submission may lead to order cancellation. Ensure you check your payment app history for the correct ID.
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={handleFinalSubmit}
                    className="w-full bg-primary-600 text-white p-5 rounded-2xl font-black shadow-xl shadow-primary-200 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    Verify & Finish Order
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Branding */}
          <div className="px-8 py-4 bg-gray-50 flex items-center justify-center gap-2 border-t border-gray-100">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Secured by StyleSync Pay</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UPIPaymentModal;
