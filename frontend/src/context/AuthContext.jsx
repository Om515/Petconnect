import axios from "axios";
import { createContext, useContext, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  const login = async (email, password) => {
    setBtnLoading(true);
    try {
      // Call the existing unified login endpoint routing via user
      const { data } = await axios.post("/api/user/login", { email, password });
      
      if (data.success === true) {
        toast.success(data.message);
        setUser(data.user);
        setRole(data.role || (data.user && data.user.role));
        setIsAuthenticated(true);
        setBtnLoading(false);
        
        if (data.role === "caretaker") {
          navigate("/caretaker");
        } else if (data.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        toast.error(data.message);
        setUser(null);
        setRole(null);
        setIsAuthenticated(false);
        setBtnLoading(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      setUser(null);
      setRole(null);
      setIsAuthenticated(false);
      setBtnLoading(false);
    }
  };

  const register = async (name, mobile, address, email, password, role) => {
    setBtnLoading(true);
    try {
      const { data } = await axios.post("/api/auth/signup", { name, mobile, address, email, password, role });
      if (data.success === true) {
        toast.success(data.message);
        setUser(data.user);
        setRole(data.user?.role || data.role);
        setIsAuthenticated(true);
        setBtnLoading(false);
        if (data.user?.role === "caretaker" || data.role === "caretaker") {
          navigate("/caretaker");
        } else {
          navigate("/");
        }
      } else {
        toast.error(data.message);
        setUser(null);
        setRole(null);
        setIsAuthenticated(false);
        setBtnLoading(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
      setBtnLoading(false);
    }
  };

  const logout = async () => {
    try {
      const endpoint = role === "caretaker" ? "/api/caretaker/logout" : "/api/user/logout";
      const { data } = await axios.get(endpoint);
      toast.success(data.message || "Logged out");
      setIsAuthenticated(false);
      setUser(null);
      setRole(null);
      navigate("/");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Logout failed");
    }
  };

  const fetchCurrentUser = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/user/myinfo");
      if (data.success === true) {
        setUser(data.user); setRole(data.user.role); setIsAuthenticated(true);
        setLoading(false);
        return;
      }
    } catch (_) {}

    try {
      const { data } = await axios.get("/api/caretaker/myinfo");
      if (data.success === true) {
        setUser(data.user); setRole("caretaker"); setIsAuthenticated(true);
        setLoading(false);
        return;
      }
    } catch (_) {}

    setUser(null); setRole(null); setIsAuthenticated(false);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        loading,
        btnLoading,
        login,
        register,
        logout,
        fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const AuthData = () => useContext(AuthContext);
