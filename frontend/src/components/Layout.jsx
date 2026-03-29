import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import StyleAssistant from './StyleAssistant';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <StyleAssistant />
      <Footer />
    </div>
  );
};

export default Layout;
