import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Bell, MessageCircle } from "lucide-react";
import { AuthData } from "../../../context/AuthContext";
import assests from "../assets/assests";
import { MdPerson } from "react-icons/md";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { fetchCurrentUser } = AuthData();
  const { isAuthenticated, logout, role } = AuthData();
  const [bookingCount, setBookingCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch("/api/chat/notifications", { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        const unread = data.notifications?.filter(n => !n.read && n.type !== 'new_message').length || 0;
        const unreadMsg = data.notifications?.filter(n => !n.read && n.type === 'new_message').length || 0;
        setNotificationCount(unread);
        setMessageCount(unreadMsg);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch booking count when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fetchBookingCount = async () => {
        try {
          const response = await fetch("/api/user/bookings", {
            credentials: "include",
          });
          const data = await response.json();
          if (response.ok) {
            setBookingCount(data.data?.bookingRequests?.length || 0);
          }
        } catch (err) {
          console.error("Error fetching booking count:", err);
        }
      };
      fetchBookingCount();
      fetchNotifications();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    window.addEventListener('messages_read', fetchNotifications);
    return () => window.removeEventListener('messages_read', fetchNotifications);
  }, [isAuthenticated]);

  // Global socket listener for background real-time messaging
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const globalSocket = io("http://localhost:7001", { withCredentials: true });
    
    globalSocket.on("incoming_message", (data) => {
        setMessageCount(prev => prev + 1);
        
        // Suppress popup if they are currently inside the chat module
        if (!window.location.pathname.includes('/chat')) {
            toast.success(`You have a new message!`, {
                icon: '💬',
                duration: 4000,
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                }
            });
        }
    });

    globalSocket.on("notification", (notif) => {
        setNotificationCount(prev => prev + 1);
        if (notif.type === "request_accepted") {
            toast.success("🎉 Your pet request was accepted!", { duration: 5000 });
        } else if (notif.type === "request_rejected") {
            toast.error("Your pet request was declined.", { duration: 5000 });
        } else if (notif.type === "request_received") {
            toast.success("🐾 New request received for your pet!", { duration: 5000 });
        }
    });

    return () => globalSocket.disconnect();
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    setBookingCount(0);
  };

  const menuItems = [
    { id: 1, name: "Home", link: "/" },
    { id: 2, name: "Sell Pet", link: "/sell-pet" },
    { id: 3, name: "Buy Pet", link: "/buy-pet" },
    ...(isAuthenticated && role === "user"
      ? [
          { id: 8, name: "My Requests", link: "/my-pet-requests" },
          { id: 9, name: "Incoming Requests", link: "/owner-pet-requests" },
        ]
      : []),
    { id: 4, name: "Pet Care", link: "/caretakers" },
    { id: 5, name: "Contacts", link: "/contact" },
    { 
      id: 6, 
      name: "My Bookings", 
      link: "/user/bookings",
      badge: bookingCount > 0 ? bookingCount : null
    },
    { id: 7, name: "Wishlist", link: "/wishlist" }
  ];

  return (
    <div className={`shadow-md bg-white duration-200 sticky top-0 z-50 ${scrolled ? 'py-0' : 'py-0'}`}>
      {/* Top Bar with Logo and Auth Buttons */}
      <div className="bg-gradient-to-r from-cyan-500 to-teal-500 p-4">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="font-bold text-2xl flex items-center gap-3 text-white">
            <img
              src={assests.logo_img}
              alt="Logo"
              className="w-12 h-12 rounded-full border-2 border-white"
            />
            Pet Connect
          </Link>

          {/* Desktop Auth Buttons */}
          <div className="hidden sm:flex items-center gap-4">
            {isAuthenticated && role === "user" ? (
              <>
                <button
                  onClick={() => navigate("/notifications")}
                  className="relative text-white hover:text-cyan-200 transition-colors p-2 rounded-full border-2 border-transparent hover:border-white"
                >
                  <Bell size={22} />
                  {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => navigate("/chat")}
                  className="relative text-white hover:text-cyan-200 transition-colors p-2 rounded-full border-2 border-transparent hover:border-white mr-2"
                >
                  <MessageCircle size={22} />
                  {messageCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {messageCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => navigate("/profile")}
                  className="bg-gradient-to-r from-teal-500 to-cyan-400 text-white p-2 rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-300 border-2 border-white"
                >
                  <MdPerson size={20} />
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-medium transition-all duration-300 border-2 border-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-full font-medium transition-all duration-300 border-2 border-white"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-full font-medium transition-all duration-300 border-2 border-white"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="sm:hidden p-2 text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Desktop Navigation Links */}
      <div className="hidden sm:flex justify-center bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-8 py-3">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.link}
                className="text-gray-700 font-medium px-3 py-1 hover:text-cyan-500 transition-colors duration-300 relative group"
              >
                {item.name}
                {item.badge && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`sm:hidden bg-white shadow-lg overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-screen" : "max-h-0"
        }`}
      >
        <div className="flex flex-col">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.link}
              onClick={() => setIsOpen(false)}
              className="px-6 py-3 text-gray-700 hover:bg-gray-100 font-medium border-b border-gray-100 flex justify-between items-center"
            >
              <span>{item.name}</span>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
          
          {isAuthenticated && role === "user" ? (
            <>
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="px-6 py-3 text-gray-700 hover:bg-gray-100 font-medium border-b border-gray-100 flex items-center gap-2"
              >
                <MdPerson size={18} />
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="px-6 py-3 text-left text-red-500 hover:bg-red-50 font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/login");
                }}
                className="px-6 py-3 text-left text-gray-700 hover:bg-gray-100 font-medium border-b border-gray-100"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/signup");
                }}
                className="px-6 py-3 text-left text-gray-700 hover:bg-gray-100 font-medium"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;