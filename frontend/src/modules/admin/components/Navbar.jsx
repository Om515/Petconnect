import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { AdminData } from "../context/AdminContext";
import { useEffect } from "react";


const NavbarAdmin = () => {
  const navigate = useNavigate();

  const { isAuthAdmin, fetchAdmin, adminLogoutHandler } = AdminData();

  useEffect(() => {
    fetchAdmin();
  }, []);

  const handleLogoutAdmin = (e) => {
    adminLogoutHandler();
  };

  return (
    <nav className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/admin" className="text-2xl font-bold flex items-center">
          <svg 
            className="w-8 h-8 mr-2" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M12 13.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" />
            <path fillRule="evenodd" d="M5 7a4 4 0 114.9 3.9C11.8 12.9 13 15.1 13 17.5c0 2.8-2 3.5-5 3.5s-5-.7-5-3.5c0-2.4 1.2-4.6 3.1-6.6A4 4 0 015 7zm9 0a4 4 0 118.9 2.3c1.9 2 3.1 4.2 3.1 6.6 0 2.8-2 3.5-5 3.5s-5-.7-5-3.5c0-2.4 1.2-4.6 3.1-6.6A4 4 0 0114 7z" clipRule="evenodd" />
          </svg>
          PetConnect Admin
        </Link>
        {isAuthAdmin ? (
          <button
            onClick={handleLogoutAdmin}
            className="bg-white text-teal-600 px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition duration-300 shadow-sm"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-white text-teal-600 px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition duration-300 shadow-sm"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavbarAdmin;