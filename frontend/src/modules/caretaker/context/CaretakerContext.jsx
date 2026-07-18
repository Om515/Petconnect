import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const CaretakerContext = createContext();

export const CaretakerProvider = ({ children }) => {
  const [user, setUser] = useState([]);
  const [isAuth, setIsAuth] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function loginUser(email, password, navigate) {
    setBtnLoading(true);
    try {
      const { data } = await axios.post("/api/caretaker/login", { email, password });
      if (data.success === true) {
        toast.success(data.message);
        setUser(data.user);
        setIsAuth(true);
        setBtnLoading(false);
        navigate("/caretaker");
      } else {
        toast.error(data.message);
        setUser([]);
        setIsAuth(false);
        setBtnLoading(false);
        navigate("/caretaker/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      setBtnLoading(false);
    }
  }

  async function registerUser(name, email, password, navigate) {
    setBtnLoading(true);
    console.log("Registering user:", { name, email, password });
    try {
      const { data } = await axios.post("/api/caretaker/signup", { name, email, password });
      console.log("API response:", data);
      if (data.success === true) {
        toast.success(data.message);
        setUser(data.user);
        setIsAuth(true);
        setBtnLoading(false);
        console.log("Navigating to /");
        navigate("/caretaker");
        return true; // Return success for Signup.jsx
      } else {
        toast.error(data.message);
        setUser([]);
        setIsAuth(false);
        setBtnLoading(false);
        console.log("Staying on /signup due to failure");
        navigate("/caretaker/signup");
        return false; // Return failure
      }
    } catch (error) {
      console.error("Signup error:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Registration failed");
      setBtnLoading(false);
      navigate("/caretaker/signup");
      throw error; // Throw error for Signup.jsx to catch
    }
  }

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const logoutHandler = async () => {
    try {
      setIsLoggingOut(true);
      const { data } = await axios.get("/api/caretaker/logout");
      toast.success(data.message);
      setIsAuth(false);
      setUser([]);
      navigate("/caretaker");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Logout failed");
    } finally {
      setIsLoggingOut(false);
    }
  };

  async function fetchUser() {
    try {
      const { data } = await axios.get("/api/caretaker/myinfo");
      setBtnLoading(true);
      if (data.success === true) {
        setUser(data.user);
        setIsAuth(true);
        setBtnLoading(false);
      } else {
        setUser([]);
        setIsAuth(false);
        setBtnLoading(false);
      }
    } catch (error) {
      setBtnLoading(false);
      setIsAuth(false);
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <CaretakerContext.Provider
      value={{
        loginUser,
        btnLoading,
        isAuth,
        user,
        loading,
        setIsAuth,
        setUser,
        registerUser,
        fetchUser,
        logoutHandler,
      }}
    >
      {children}
    </CaretakerContext.Provider>
  );
};

export const CaretakerData = () => useContext(CaretakerContext);