import React, { useState } from "react";
import {
  List,
  ShoppingCart,
  Clock,
  UserCheck,
  Menu,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-20 right-4 z-50 bg-teal-500 p-2 rounded-full text-white shadow-md"
        onClick={toggleSidebar}
      >
        {isOpen ? (
          <X className="text-white" size={20} />
        ) : (
          <Menu className="text-white" size={20} />
        )}
      </button>

      {/* Horizontal Sidebar */}
      <div
        className={`
        w-full bg-white shadow-md py-2 border-b border-gray-200
        transition-all duration-300 ease-in-out
        ${isOpen ? "max-h-60" : "max-h-0 md:max-h-60"}
        overflow-hidden md:overflow-visible
        z-40
      `}
      >
        <nav className="container mx-auto">
          <ul className="flex flex-col md:flex-row md:justify-center">
            <li className="hover:bg-gray-100 rounded-lg transition duration-300">
              <Link to="/admin/pet-list" className="flex px-5 py-3 items-center">
                <List className="mr-3 text-teal-600" size={20} />
                <span className="text-gray-700 font-medium">Pet List</span>
              </Link>
            </li>

            <li className="hover:bg-gray-100 rounded-lg transition duration-300">
              <Link to="/admin/caretaker-list" className="flex px-5 py-3 items-center">
                <UserCheck className="mr-3 text-teal-600" size={20} />
                <span className="text-gray-700 font-medium">Pending Caretakers</span>
              </Link>
            </li>

            <li className="hover:bg-gray-100 rounded-lg transition duration-300">
              <Link to="/admin/profile-reviews" className="flex px-5 py-3 items-center">
                <Clock className="mr-3 text-amber-600" size={20} />
                <span className="text-gray-700 font-medium">Profile Showcase Reviews</span>
              </Link>
            </li>

            <li className="hover:bg-gray-100 rounded-lg transition duration-300">
              <Link to="/admin" className="flex px-5 py-3 items-center">
                <ShoppingCart className="mr-3 text-teal-600" size={20} />
                <span className="text-gray-700 font-medium">Pets Sold</span>
              </Link>
            </li>

            <li className="hover:bg-gray-100 rounded-lg transition duration-300">
              <Link to="/admin" className="flex px-5 py-3 items-center">
                <Clock className="mr-3 text-teal-600" size={20} />
                <span className="text-gray-700 font-medium">Pending Pets</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;