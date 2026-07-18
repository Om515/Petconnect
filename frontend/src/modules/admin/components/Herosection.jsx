import React from "react";
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-b from-blue-50 to-cyan-50 min-h-screen flex items-center justify-center p-6">
      <div className="max-w-4xl text-center">
        <h2 className="text-4xl font-bold text-teal-700 mb-6">
          Welcome to the PetConnect Admin Panel
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Manage pet listings, users, and service requests efficiently. Keep track of platform activity and ensure a smooth experience for all users.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-700 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 border-l-4 border-teal-500">
            <div className="text-teal-500 text-3xl mb-2">📋</div>
            <h3 className="text-xl font-semibold mb-2">Manage Listings</h3>
            <p className="text-gray-600">Approve, edit, or remove pet listings easily.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 border-l-4 border-teal-500">
            <div className="text-teal-500 text-3xl mb-2">👥</div>
            <h3 className="text-xl font-semibold mb-2">User Management</h3>
            <p className="text-gray-600">Monitor and assist users efficiently.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 border-l-4 border-teal-500">
            <div className="text-teal-500 text-3xl mb-2">🔧</div>
            <h3 className="text-xl font-semibold mb-2">Support & Feedback</h3>
            <p className="text-gray-600">Address user concerns and improve services.</p>
          </div>
        </div>

        <button 
          className="mt-6 bg-gradient-to-r from-cyan-500 to-teal-500 text-white px-8 py-3 rounded-full text-lg font-medium hover:from-teal-500 hover:to-cyan-600 transition duration-300 shadow-md"
          onClick={() => navigate("/admin/options")}
        >
          Get Started
        </button>
      </div>
    </section>
  );
};

export default HeroSection;