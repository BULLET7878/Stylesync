import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, ShieldCheck, Mail, MapPin, Globe, Award, 
  Users, Leaf, HelpCircle, FileText, ChevronRight 
} from 'lucide-react';

const Info = () => {
  const location = useLocation();
  const path = location.pathname.replace('/', '').toLowerCase() || 'about';
  
  const sections = {
    'about': {
      title: "Our Story",
      icon: <Globe className="w-12 h-12 text-primary-600" />,
      content: (
        <div className="space-y-8">
          <p className="text-xl leading-relaxed text-gray-700 font-medium">StyleSync was born from a simple observation: fashion is personal, but finding the right fit shouldn't be a struggle.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-2xl">
              <h3 className="text-lg font-bold mb-3">AI Discovery</h3>
              <p className="text-gray-600">We utilize cutting-edge AI to understand your unique measurements and style preferences, connecting you with products that truly fit.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl">
              <h3 className="text-lg font-bold mb-3">Direct-to-Buyer</h3>
              <p className="text-gray-600">By empowering independent sellers and top-tier brands, we create a direct line from the creator to your wardrobe.</p>
            </div>
          </div>
        </div>
      )
    },
    'careers': {
      title: "Join the Future",
      icon: <Users className="w-12 h-12 text-blue-600" />,
      content: (
        <div className="space-y-6 text-gray-600">
          <p className="text-lg">We're always looking for visionaries at the intersection of fashion, technology, and sustainability.</p>
          <div className="border-t border-gray-100 pt-6 space-y-4">
            {['AI / ML Engineer', 'Senior UI/UX Designer', 'Growth Marketing Lead', 'Supply Chain Specialist'].map(job => (
              <div key={job} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl hover:border-primary-500 hover:bg-primary-50/30 transition-all cursor-pointer group">
                <span className="font-bold text-gray-900">{job}</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      )
    },
    'sustainability': {
      title: "Planet First",
      icon: <Leaf className="w-12 h-12 text-green-600" />,
      content: (
        <div className="space-y-6 text-gray-600">
          <p className="text-lg">Our goal is to reach zero-waste fashion by 2030. We audit every seller on our platform for ethical labor and sustainable sourcing.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-100 rounded-xl text-center">
              <p className="text-2xl font-black text-green-700 mb-1">94%</p>
              <p className="text-[10px] font-bold uppercase tracking-wider">Recyclable Packaging</p>
            </div>
            <div className="p-4 border border-gray-100 rounded-xl text-center">
              <p className="text-2xl font-black text-green-700 mb-1">100k+</p>
              <p className="text-[10px] font-bold uppercase tracking-wider">Trees Planted</p>
            </div>
            <div className="p-4 border border-gray-100 rounded-xl text-center">
              <p className="text-2xl font-black text-green-700 mb-1">Net Zero</p>
              <p className="text-[10px] font-bold uppercase tracking-wider">Logistics Goal</p>
            </div>
          </div>
        </div>
      )
    },
    'help': {
      title: "Support Center",
      icon: <HelpCircle className="w-12 h-12 text-amber-600" />,
      content: (
        <div className="space-y-6 text-gray-600">
          <p className="text-lg">Need help with an order? Our support team is available 24/7.</p>
          <div className="space-y-4">
            {['How do I track my order?', 'Can I change my shipping address?', 'What is the refund process?', 'How to become a verified seller?'].map(q => (
              <details key={q} className="group bg-gray-50 rounded-2xl">
                <summary className="p-5 font-bold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                  {q}
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center border border-gray-200">
                    <span className="text-lg font-black leading-none">+</span>
                  </div>
                </summary>
                <div className="px-5 pb-5 text-sm">
                  Please visit your dashboard or contact support@stylesync.com with your Order ID for a quick resolution.
                </div>
              </details>
            ))}
          </div>
        </div>
      )
    },
    'shipping': {
      title: "Logistics & Delivery",
      icon: <Truck className="w-12 h-12 text-primary-600" />,
      content: (
        <div className="space-y-6 text-gray-600">
          <p className="text-lg">We partner with global logistics leaders to ensure your parcels arrive safely and on time.</p>
          <div className="bg-gray-100/50 p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <span className="font-bold">Standard Delivery</span>
              <span className="text-xs uppercase font-black text-gray-400">3-5 Days</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <span className="font-bold">Express Xpress</span>
              <span className="text-xs uppercase font-black text-primary-600">Next Day</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold">StyleSync Elite</span>
              <span className="text-xs uppercase font-black text-amber-600">Free Always</span>
            </div>
          </div>
        </div>
      )
    },
    'contact': {
      title: "Connect With Us",
      icon: <Mail className="w-12 h-12 text-purple-600" />,
      content: (
        <div className="space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-gray-50 rounded-2xl flex items-start gap-4">
                 <div className="p-3 bg-white rounded-xl"><Mail className="w-5 h-5 text-gray-600" /></div>
                 <div>
                    <p className="text-xs font-black uppercase text-gray-400">Email us</p>
                    <p className="font-bold text-gray-900">support@stylesync.com</p>
                 </div>
              </div>
              <div className="p-6 bg-gray-50 rounded-2xl flex items-start gap-4">
                 <div className="p-3 bg-white rounded-xl"><MapPin className="w-5 h-5 text-gray-600" /></div>
                 <div>
                    <p className="text-xs font-black uppercase text-gray-400">Visit HQ</p>
                    <p className="font-bold text-gray-900">Indiranagar, Bangalore, IN</p>
                 </div>
              </div>
           </div>
           <form className="space-y-4 pt-4 border-t border-gray-100">
              <input type="text" placeholder="Your Name" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary-600 transition-all font-bold placeholder:text-gray-400 border border-transparent focus:border-white" />
              <textarea rows="4" placeholder="How can we help?" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary-600 transition-all font-bold placeholder:text-gray-400 border border-transparent focus:border-white"></textarea>
              <button disabled className="w-full p-4 bg-gray-900 text-white rounded-2xl font-black shadow-lg opacity-50 cursor-not-allowed">Send Message</button>
           </form>
        </div>
      )
    },
    'privacy': {
      title: "Your Privacy",
      icon: <ShieldCheck className="w-12 h-12 text-blue-600" />,
      content: (
        <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
           <p className="font-bold text-gray-900 text-lg mb-2 underline decoration-blue-200">Data Security Pledge</p>
           <p>At StyleSync, your privacy is our baseline. We implement SHA-256 encryption and industry-standard SSL to ensure that your financial data and identity information never touch our databases directly.</p>
           <p>We do not sell your style preferences to third-party advertisers. Your StyleProfile is used exclusively to improve your shopping recommendations on our platform.</p>
        </div>
      )
    },
    'size': {
      title: "Perfect Fit Guide",
      icon: <FileText className="w-12 h-12 text-indigo-600" />,
      content: (
        <div className="space-y-8">
           <p className="text-gray-600">Standardized measurements across all StyleSync verified brands. Use these as a global reference.</p>
           <div className="overflow-hidden border border-gray-100 rounded-2xl shadow-sm">
             <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-black">Size</th>
                    <th className="px-6 py-4 font-black">Chest (in)</th>
                    <th className="px-6 py-4 font-black">Waist (in)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {[ ['S', '36-38', '30-32'], ['M', '38-40', '32-34'], ['L', '40-42', '34-36'], ['XL', '42-44', '36-38'] ].map(row => (
                      <tr key={row[0]}>
                        <td className="px-6 py-4 font-bold text-primary-600">{row[0]}</td>
                        <td className="px-6 py-4 text-gray-500 font-medium">{row[1]}</td>
                        <td className="px-6 py-4 text-gray-500 font-medium">{row[2]}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
           </div>
           <p className="text-xs text-amber-600 font-bold bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-center gap-2">
             <Info className="w-4 h-4" /> Tip: Many of our brands use 'Oversized' silhouettes. We recommend checking specific product tags for fit style.
           </p>
        </div>
      )
    }
  };

  const current = sections[path] || sections['about'];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header Splash */}
      <div className="h-[30vh] bg-gray-900 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <p className="text-primary-400 font-black text-xs uppercase tracking-[0.3em] mb-4">StyleSync Platform</p>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter capitalize">{current.title}</h1>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-12 mb-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-2">
            {[
              { id: 'about', label: 'About Us' },
              { id: 'careers', label: 'Careers' },
              { id: 'contact', label: 'Contact' },
              { id: 'help', label: 'Help & FAQ' },
              { id: 'shipping', label: 'Shipping' },
              { id: 'size', label: 'Size Guide' },
              { id: 'privacy', label: 'Privacy' }
            ].map(link => (
              <Link 
                key={link.id}
                to={`/${link.id}`}
                className={`flex items-center gap-3 p-4 rounded-2xl font-bold transition-all ${path === link.id ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20 translate-x-2' : 'bg-white text-gray-500 hover:bg-gray-50 shadow-sm border border-gray-100/50'}`}
              >
                <div className={`w-2 h-2 rounded-full ${path === link.id ? 'bg-white' : 'bg-transparent'}`} />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Main Content Pane */}
          <div className="lg:col-span-3">
             <AnimatePresence mode="wait">
               <motion.div 
                 key={path}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 transition={{ duration: 0.3 }}
                 className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 md:p-16 min-h-[60vh]"
               >
                 <div className="mb-12 flex items-center justify-between">
                    <div>
                       <h2 className="text-4xl font-black text-gray-900 tracking-tight">{current.title}</h2>
                       <div className="w-16 h-1 bg-primary-600 mt-4 rounded-full" />
                    </div>
                    {current.icon}
                 </div>

                 {current.content}

                 <div className="mt-16 pt-8 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4">
                    <p className="text-gray-400 font-bold text-sm italic">Last updated: Oct 2026</p>
                    <div className="flex gap-4">
                       <Link to="/shop" className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-primary-600 transition-all shadow-lg shadow-gray-200">Return To Shop</Link>
                    </div>
                 </div>
               </motion.div>
             </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Info;
