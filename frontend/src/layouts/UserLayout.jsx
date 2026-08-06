import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Navbar from '../modules/user/components/Navbar';
import ScrollToTop from '../modules/user/components/ScrollToTop';
import { PawPrint, Bot, Sparkles } from 'lucide-react';

const UserLayout = () => {
  const location = useLocation();
  const isDiscoverPage = location.pathname === '/discover';

  return (
    <div className="user-layout relative min-h-screen">
      <ScrollToTop />
      <Navbar />
      <Outlet />
      
      {/* Cool AI Sticker / Floating Action Button */}
      {!isDiscoverPage && (
        <Link 
          to="/discover" 
          className="fixed bottom-8 right-8 z-[9999] group flex flex-col items-center hover:scale-110 active:scale-95 transition-all duration-300 animate-[bounce_3s_infinite] hover:animate-none"
          title="Try AI Pet Scanner"
        >
          {/* Tooltip / Label */}
          <div className="opacity-0 group-hover:opacity-100 absolute -top-10 right-0 bg-gray-900 text-white text-xs font-bold py-1.5 px-3 rounded-xl whitespace-nowrap transition-opacity shadow-lg">
            AI Pet Scanner
          </div>
          
          {/* Main Button (Cooler Design) */}
          <div className="relative flex items-center justify-center w-[72px] h-[72px] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.5)] group-hover:shadow-[0_0_35px_rgba(236,72,153,0.8)] transition-all overflow-hidden border-2 border-white/50">
            {/* Background elements */}
            <div className="absolute inset-0 bg-white/20 animate-pulse mix-blend-overlay"></div>
            
            {/* Big muted paw print in the background */}
            <PawPrint className="text-white/20 absolute w-14 h-14 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
            
            {/* Robotic AI override */}
            <Bot className="text-white z-10 w-8 h-8 group-hover:text-pink-100 transition-colors animate-[spin_10s_linear_infinite] group-hover:animate-none" />
            
            {/* Sparkles Decoration */}
            <div className="absolute top-1 right-2 w-5 h-5 flex items-center justify-center shadow-md animate-spin-slow">
              <Sparkles size={16} className="text-yellow-300" />
            </div>
          </div>
        </Link>
      )}
    </div>
  );
};

export default UserLayout;
