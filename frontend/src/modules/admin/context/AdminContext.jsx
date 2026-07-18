import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

// Create a context
const AdminContext = createContext(); 

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState([]);
  const [isAuthAdmin, setIsAuthAdmin] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);


  // Function to handle user login
  async function loginAdmin(email, password, navigate) {
    setBtnLoading(true);
    try {
      const { data } = await axios.post("/api/admin/login", { email, password });
      
      if(data.success === true){
        setAdmin(data.admin);
        setIsAuthAdmin(true);
        setBtnLoading(false);
        toast.success(data.message);
        navigate("/admin");
      }
      else{
        toast.error("Login Failed");
        setBtnLoading(false);
      }
    
    } 
    catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong!");
      setBtnLoading(false);
    }
  }
  

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const adminLogoutHandler = async () => {
    try {
      setIsLoggingOut(true);
      const { data } = await axios.get("/api/admin/logout");
      toast.success(data.message);
      setIsAuthAdmin(false);
      setAdmin([]);
      
    } catch (error) {
      toast.error(error?.response?.data?.message || "Logout failed");
    } finally {
      setIsLoggingOut(false);
    }
  };

  //function to fetch user on load 
  async function fetchAdmin(){
    try {
      const {data} = await axios.get("/api/admin/myinfo");
      
      if(data.success === true){
        setIsAuthAdmin(true);
        setAdmin(data);
      }
      else{
        setIsAuthAdmin(false);
      }

    } catch (error) {
      console.log("Error in fetchAdmin",error);
    }
  }

  async function petApprove(id,navigate) {
    try {
      const { data } = await axios.post("/api/admin/approve-pet",{id});
  
      if(data.success === true){
        toast.success(data.message);
        navigate("/admin/pet-list")
      }
      
    } catch (error) {
      toast.error("Error");
      console.log("Error in petApprove",error);
    }
  }


  async function petReject(id,navigate) {
    try {
      const { data } = await axios.post("/api/admin/reject-pet",{id});
  
      if(data.success === true){
        toast.success(data.message);
        navigate("/admin/pet-list")
      }
      
    } catch (error) {
      toast.error("Error");
      console.log("Error in petApprove",error);
    }
  }


  //useEffect to load the data
  useEffect(() => {
    fetchAdmin();
  }, []);

  // Return the context provider with value
  return (
    <AdminContext.Provider
      value={{
        loginAdmin,
        btnLoading,  // Include btnLoading in the context
        admin,
        isAuthAdmin,
        adminLogoutHandler,
        fetchAdmin,
        setIsAuthAdmin,
        petApprove,
        petReject
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

// Custom hook to access the context
export const AdminData = () => useContext(AdminContext);