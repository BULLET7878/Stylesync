import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Info = () => {
  const location = useLocation();
  const path = location.pathname.replace('/', '').replace(/-/g, ' ');
  const title = path.charAt(0).toUpperCase() + path.slice(1);

  const getContent = () => {
    switch (path) {
      case 'shipping returns':
        return {
          header: "Shipping & Returns",
          body: (
            <div className="text-left space-y-6 text-gray-600">
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Fast, Secure Shipping</h3>
                <p>Enjoy free standard shipping on all orders over ₹4,999. Orders are processed within 24-48 hours and typically arrive within 3-5 business days across major cities in India.</p>
              </section>
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-2">30-Day Easy Returns</h3>
                <p>Not the perfect fit? No problem. We offer a 30-day return policy for all unworn and unwashed items with original tags attached. Return pickups are complimentary for our StyleSync Elite members.</p>
              </section>
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-2">International Delivery</h3>
                <p>We now ship to 25+ countries. International shipping rates and duties are calculated at checkout based on your destination.</p>
              </section>
            </div>
          )
        };
      case 'privacy policy':
        return {
          header: "Privacy Policy",
          body: (
            <div className="text-left space-y-6 text-gray-600">
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Your Data, Your Choice</h3>
                <p>At StyleSync, your privacy is our priority. We only collect information necessary to process your orders and enhance your shopping experience.</p>
              </section>
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Security Procedures</h3>
                <p>We implement industry-standard SSL encryption and secure payment gateways (Razorpay/Stripe) to ensure your financial data never touches our servers directly.</p>
              </section>
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Cookie Usage</h3>
                <p>We use cookies to remember your preferences (like your local currency) and recently viewed items to provide a personalized experience.</p>
              </section>
            </div>
          )
        };
      case 'size guide':
        return {
          header: "Size Guide",
          body: (
            <div className="text-left space-y-6 text-gray-600">
              <p>Find your perfect fit with our comprehensive StyleSync measurement charts. All measurements are in inches unless specified.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2">Size</th>
                      <th className="border p-2">Chest (in)</th>
                      <th className="border p-2">Waist (in)</th>
                      <th className="border p-2">Hip (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border p-2 font-bold text-center">S</td><td className="border p-2 text-center">36-38</td><td className="border p-2 text-center">30-32</td><td className="border p-2 text-center">37-39</td></tr>
                    <tr><td className="border p-2 font-bold text-center">M</td><td className="border p-2 text-center">38-40</td><td className="border p-2 text-center">32-34</td><td className="border p-2 text-center">39-41</td></tr>
                    <tr><td className="border p-2 font-bold text-center">L</td><td className="border p-2 text-center">40-42</td><td className="border p-2 text-center">34-36</td><td className="border p-2 text-center">41-43</td></tr>
                    <tr><td className="border p-2 font-bold text-center">XL</td><td className="border p-2 text-center">42-44</td><td className="border p-2 text-center">36-38</td><td className="border p-2 text-center">43-45</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="italic text-sm">Note: For an oversized fit (as seen in our Streetwear collection), we recommend sizing up.</p>
            </div>
          )
        };
      default:
        return {
          header: title || "Information Center",
          body: (
            <p className="text-lg text-gray-500 mb-8">
              This is a placeholder for the <strong>{title}</strong> page. We are continuously updating StyleSync to provide you with the best experience.
            </p>
          )
        };
    }
  };

  const content = getContent();

  return (
    <div className="min-h-[80vh] bg-gray-50 px-4 py-16">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-16 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 capitalize border-b pb-4">{content.header}</h1>
        <div className="mb-12">
          {content.body}
        </div>
        <Link to="/shop" className="inline-flex items-center justify-center px-8 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition shadow-lg shadow-gray-200">
          Return to Shop
        </Link>
      </div>
    </div>
  );
};

export default Info;
