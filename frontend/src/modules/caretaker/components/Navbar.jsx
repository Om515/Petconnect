import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, PawPrint } from "lucide-react";
import { AuthData } from "../../../context/AuthContext";
import assests from "../assets/assests";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { fetchCurrentUser } = AuthData();
  const { isAuthenticated, logout } = AuthData();

  useEffect(() => {
    fetchCurrentUser();
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <nav
      className={`top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${
        scrolled 
          ? "bg-cyan-500 shadow-xl py-2 backdrop-blur-sm bg-opacity-90 border-b border-cyan-400" 
          : "bg-cyan-500 py-4"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo */}
        <Link 
          to="/caretaker" 
          className="flex items-center space-x-3 group transform transition-all duration-300 hover:scale-105"
        >
          <img
            src={assests.logo_img}
            alt="Logo"
            className="w-12 h-12 rounded-full shadow-lg transform group-hover:rotate-12 transition duration-500 border-2 border-white"
          />
          <span className="text-3xl font-bold text-white tracking-tight">
            PetConnect
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 items-center">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              {/* Apply as Caretaker Button */}
              <Link
                to="/caretaker/apply"
                className="relative flex items-center space-x-2 bg-white text-cyan-500 px-6 py-2.5 rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl group"
              >
                <PawPrint size={18} />
                <span>Apply as Caretaker</span>
              </Link>

              {/* Profile Button */}
              <Link
                to="/caretaker/profile"
                className="relative text-white font-medium transition-all duration-300 group"
              >
                <span className="flex items-center px-3 py-2">
                  <User className="w-6 h-6" />
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-3/4"></span>
                </span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="relative overflow-hidden bg-white text-cyan-500 px-6 py-2.5 rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 group"
              >
                <span className="relative z-10">Logout</span>
                <span className="absolute inset-0 bg-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></span>
              </button>
            </div>
          ) : (
            <div className="flex space-x-4">
              <button
                onClick={() => navigate("/login")}
                className="relative overflow-hidden px-6 py-2.5 rounded-full border-2 border-white text-white hover:bg-white hover:text-cyan-500 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 group"
              >
                <span className="relative z-10">Login</span>
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="relative overflow-hidden bg-white text-cyan-500 px-6 py-2.5 rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 group"
              >
                <span className="relative z-10">Sign Up</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all duration-300 hover:bg-cyan-400"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X size={28} className="text-white transform transition-transform duration-300 hover:rotate-90" />
          ) : (
            <Menu size={28} className="text-white transform transition-transform duration-300 hover:rotate-90" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col space-y-4 p-6 bg-cyan-600 bg-opacity-95 backdrop-blur-sm rounded-b-xl shadow-xl">
          {isAuthenticated && (
            <>
              {/* Apply as Caretaker (Mobile) */}
              <Link
                to="/caretaker/apply"
                className="flex items-center text-white py-3 px-4 hover:bg-cyan-500 rounded-lg transition-all duration-300 hover:pl-6 hover:text-white font-medium"
                onClick={() => setIsOpen(false)}
              >
                <PawPrint className="w-5 h-5 mr-2" />
                Apply as Caretaker
              </Link>

              {/* Profile (Mobile) */}
              <Link
                to="/caretaker/profile"
                className="text-white py-3 px-4 hover:bg-cyan-500 rounded-lg transition-all duration-300 hover:pl-6 hover:text-white font-medium flex items-center"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-5 h-5 mr-2" />
                Profile
              </Link>

              {/* Logout (Mobile) */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="w-full bg-white text-cyan-500 px-5 py-3 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-0.5 mt-4"
              >
                Logout
              </button>
            </>
          )}

          {!isAuthenticated && (
            <div className="flex flex-col space-y-3 pt-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/login");
                }}
                className="w-full bg-white text-cyan-500 px-5 py-3 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/signup");
                }}
                className="w-full bg-cyan-700 text-white px-5 py-3 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;