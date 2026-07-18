import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState([]);
    const [isAuth, setIsAuth] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    async function loginUser(email, password, navigate) {
        setBtnLoading(true);
        try {
            const { data } = await axios.post("/api/user/login", { email, password });
            if(data.success === true){
                toast.success(data.message);
                setUser(data.user);
                setIsAuth(true);
                setBtnLoading(false);
                navigate("/");
            }
            else{
                toast.error(data.message);
                setUser([]);
                setIsAuth(false);
                setBtnLoading(false);
                navigate("/login");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
            setBtnLoading(false);
        }
    }

    async function registerUser(name, mobile, address, email, password, navigate) {
        setBtnLoading(true);
        try {
            const { data } = await axios.post("/api/user/signup", { name, mobile, address, email, password, navigate });
            if(data.success === true){
                toast.success(data.message);
                setUser(data.user);
                setIsAuth(true);
                setBtnLoading(false);
                navigate("/");
            }
            else{
                toast.error(data.message);
                setUser([]);
                setIsAuth(false);
                setBtnLoading(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed");
            setBtnLoading(false);
        }
    }

    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const logoutHandler = async () => {
      try {
        setIsLoggingOut(true);
        const { data } = await axios.get("/api/user/logout");
        toast.success(data.message);
        setIsAuth(false);
        setUser([]);
        navigate("/")
      } catch (error) {
        toast.error(error?.response?.data?.message || "Logout failed");
      } finally {
        setIsLoggingOut(false);
      }
    };
  


    async function fetchUser() {
        try {
            const { data } = await axios.get("/api/user/myinfo");
            setBtnLoading(true);
            if(data.success === true){
                setUser(data.user);
                setIsAuth(true);
                setBtnLoading(false);
            }
            else{
                setUser([]);
                setIsAuth(false);
                setBtnLoading(false);
            }
        } catch (error) {
            setBtnLoading(false)
            setIsAuth(false);
            console.log(error);
        } finally {
            setLoading(false);
        }
    }


    async function bookPet (petId, navigate){
        setBtnLoading(true);
        try {
            const { data } = await axios.post("/api/user/book-pet",{petId});
            if(data.success === true){
                toast.success(data.message);
                navigate("/buy-pet")
            }
            else{
                toast.error(data.message);
            }
        } catch (error) {
            console.log("Error in bookPet: ",error);
            toast.error("An error occurred. Please try again.");
        }
        finally{
            setBtnLoading(false);
        }
    }


    return (
        <UserContext.Provider
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
                bookPet
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const UserData = () => useContext(UserContext);
