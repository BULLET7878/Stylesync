import React, { useState, useEffect, useRef, useContext } from 'react';
import { Sparkles, X, MessageSquare, Send, ShoppingBag } from 'lucide-react';
import { ProductContext } from '../context/ProductContext';
import { Link } from 'react-router-dom';

const StyleAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hello! I'm your StyleSync AI. I can help you find the perfect outfit. What's the occasion?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { products } = useContext(ProductContext);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI logic
    setTimeout(() => {
      let response = "";
      let suggestions = [];

      const query = input.toLowerCase();
      if (query.includes('wedding') || query.includes('formal') || query.includes('party')) {
        response = "For formal occasions, I recommend our elegant shirts and trousers. Here are some sophisticated options:";
        suggestions = products.filter(p => p.category === 'Shirts' || p.category === 'Trousers').slice(0, 2);
      } else if (query.includes('casual') || query.includes('beach') || query.includes('summer')) {
        response = "Keeping it casual? Our T-shirts and shorts are perfect for a relaxed vibe. Check these out:";
        suggestions = products.filter(p => p.category === 'Tshirts' || p.category === 'Shorts').slice(0, 2);
      } else if (query.includes('shoes') || query.includes('footwear')) {
        response = "Step up your style with these trending shoes:";
        suggestions = products.filter(p => p.category === 'Shoes').slice(0, 2);
      } else {
        response = "I've synced with our latest collection and found these items you might love:";
        suggestions = products.slice(0, 2);
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: response, 
        products: suggestions 
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-gray-800 transition-all z-50 group border-2 border-primary-500/20"
      >
        <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl z-[100] border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gray-900 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center border border-primary-500/30">
                <Sparkles className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm">StyleSync AI</h3>
                <p className="text-[10px] text-primary-400 font-bold uppercase tracking-widest">Always Syncing Styles</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 h-96 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${m.role === 'user' ? 'bg-primary-600 text-white' : 'bg-white text-gray-800 shadow-sm border border-gray-100'}`}>
                  {m.text}
                  {m.products && m.products.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {m.products.map(p => (
                        <Link 
                          key={p._id} 
                          to={`/product/${p._id}`} 
                          onClick={() => setIsOpen(false)}
                          className="bg-gray-50 rounded-xl p-2 border border-gray-100 hover:border-primary-500 transition-colors group"
                        >
                          <img src={p.images?.[0]} alt={p.title} className="w-full aspect-square object-cover rounded-lg mb-2" />
                          <p className="text-[10px] font-bold text-gray-900 truncate">{p.title}</p>
                          <p className="text-[10px] text-primary-600 font-extrabold mt-1">₹{p.price}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 italic text-gray-400 text-xs flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-200 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-200 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-200 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-1 border border-gray-100 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
              <input 
                type="text" 
                placeholder="Ask for style advice..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-transparent py-3 text-sm outline-none text-gray-800"
              />
              <button 
                onClick={handleSend}
                className="text-primary-600 hover:text-primary-700 p-2"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StyleAssistant;
