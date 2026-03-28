import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Info = () => {
  const location = useLocation();
  const path = location.pathname.replace('/', '').replace(/-/g, ' ');
  const title = path.charAt(0).toUpperCase() + path.slice(1);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 px-4 py-16">
      <div className="max-w-2xl w-full text-center bg-white p-12 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 capitalize">{title || 'Information'}</h1>
        <p className="text-lg text-gray-500 mb-8">
          This is a placeholder for the <strong>{title}</strong> page. We are continuously updating StyleSync to provide you with the best experience.
        </p>
        <Link to="/shop" className="inline-flex items-center justify-center px-8 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition">
          Return to Shop
        </Link>
      </div>
    </div>
  );
};

export default Info;
