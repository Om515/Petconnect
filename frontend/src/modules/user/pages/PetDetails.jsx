import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  MapPin,
  Mail,
  Phone,
  Clock,
  IndianRupee,
  Info,
  Heart,
  Share2,
  PawPrint,
  Calendar,
  MessageCircle,
  FileCheck,
  CheckCircle,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { AuthData } from "../../../context/AuthContext";

const PetDetails = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [petDetails, setPetDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);
  
  const { user, setUser } = AuthData();
  const isWishlisted = user?.wishlist?.includes(petId) || false;

  const handleToggleWishlist = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to save to wishlist");
      return;
    }
    try {
      const { data } = await axios.post("/api/user/wishlist/toggle", { petId });
      if (data.success) {
        toast.success(data.message);
        setUser({ ...user, wishlist: data.wishlist });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error saving to wishlist");
    }
  };

  const handleMessageOwner = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to message the owner");
      return;
    }
    if (requestStatus === 'pending') {
      toast.info("Request already sent and is pending");
      return;
    }
    if (requestStatus === 'accepted') {
      navigate('/chat');
      return;
    }

    setIsRequesting(true);
    try {
      const { data } = await axios.post("/api/chat/requests", { petId });
      if (data.success) {
        toast.success("Request sent to owner!");
        setRequestStatus(data.request.status);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending request");
    } finally {
      setIsRequesting(false);
    }
  };

  const handleBookPet = async () => {
    if (!petId) {
      toast.error("Invalid pet ID");
      return;
    }
    try {
        const { data } = await axios.post("/api/user/book-pet",{petId});
        if(data.success === true){
            toast.success(data.message);
            navigate("/buy-pet");
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error("An error occurred. Please try again.");
    }
  };
  

  useEffect(() => {
    if (user) {
      axios.get("/api/chat/requests/sent").then((res) => {
        if (res.data.success) {
          const req = res.data.requests.find(r => (r.pet?._id || r.pet) === petId);
          if (req) setRequestStatus(req.status);
        }
      }).catch(err => console.error(err));
    }
  }, [petId, user]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/user/pet-info?id=${petId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch pet details");
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setPetDetails(data.petDetails);
        } else {
          throw new Error(data.message || "Failed to load pet details");
        }
      })
      .catch((error) => {
        console.error("Error fetching pet details:", error);
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [petId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading pet details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-12 px-4">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            <p className="font-medium">Error: {error}</p>
          </div>
          <p className="mt-2 text-sm">
            Please try again or contact support if the problem persists.
          </p>
        </div>
      </div>
    );
  }

  if (!petDetails) {
    return (
      <div className="max-w-3xl mx-auto mt-12 px-4 text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600 font-medium">No pet details found.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans cursor-default">
      <div className="bg-white rounded-[24px] shadow-xl border border-gray-100 overflow-hidden max-w-[1000px] mx-auto flex flex-col md:flex-row">
        
        {/* Left Side (Image Area) */}
        <div className="w-full md:w-1/2 relative bg-gray-50 flex items-center justify-center p-6 min-h-[400px]">
          <div className="absolute top-5 left-5 z-10 flex items-center bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-md">
            <PawPrint className="w-4 h-4 mr-2" />
            {petDetails.breed}
          </div>
          
          <div className="absolute top-5 right-5 z-10 flex space-x-3">
            <button 
              onClick={handleToggleWishlist}
              className="bg-white p-2.5 rounded-full shadow-md hover:scale-105 transition-transform"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? "text-red-500 fill-red-500" : "text-gray-400"}`} />
            </button>
            <button
              className="bg-white p-2.5 rounded-full shadow-md hover:scale-105 transition-transform"
              onClick={(e) => {
                e.stopPropagation();
                const shareUrl = window.location.origin + `/pet/${petDetails._id}`;
                if (navigator.share) {
                  navigator.share({ title: petDetails.type, url: shareUrl });
                } else {
                  navigator.clipboard.writeText(shareUrl);
                  toast.success("Link copied!");
                }
              }}
            >
              <Share2 size={20} className="text-gray-600" />
            </button>
          </div>

          <img
            src={petDetails.image.url}
            alt={petDetails.breed}
            className="w-[85%] max-h-[400px] object-contain drop-shadow-xl"
          />

          <div className="absolute bottom-5 left-5 z-10 bg-white px-3 py-1.5 rounded-md text-xs font-medium text-gray-500 shadow-sm border border-gray-100 flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" />
            Listed just now
          </div>
        </div>

        {/* Right Side (Details Area) */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col bg-white">
          
          {/* Header Row */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-serif font-medium text-gray-900 mb-1">{petDetails.type}</h1>
              <p className="text-gray-400 text-[17px] italic">{petDetails.breed}</p>
            </div>
            <div className="bg-green-100/80 text-emerald-600 text-lg font-bold px-4 py-1.5 rounded-lg shadow-sm border border-green-200">
              ₹ {petDetails.price.toLocaleString("en-IN")}
            </div>
          </div>

          {/* 5 Grid Attribute Section */}
          <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
            <div className="bg-blue-50 p-3 rounded-xl">
              <div className="flex items-center text-blue-500 text-xs font-medium mb-1.5">
                <Clock className="w-3.5 h-3.5 mr-1" /> Age
              </div>
              <p className="font-bold text-gray-900 ml-1">{petDetails.age} years</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-xl">
              <div className="flex items-center text-purple-500 text-xs font-medium mb-1.5">
                <span className="font-bold text-sm leading-none mr-1">♂♀</span> Gender
              </div>
              <p className="font-bold text-gray-900 ml-1">{petDetails.gender || "Not specified"}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
               <div className="flex items-center text-gray-400 text-xs font-medium mb-1.5">
                <Info className="w-3.5 h-3.5 mr-1" /> Weight
              </div>
              <p className="font-bold text-gray-900 ml-1">{petDetails.weight || "Not specified"}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-xl">
               <div className="flex items-center text-emerald-500 text-xs font-medium mb-1.5">
                <FileCheck className="w-3.5 h-3.5 mr-1" /> Vaccinated
              </div>
              <p className="font-bold text-gray-900 ml-1">{petDetails.vaccinated || "Unknown"}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl col-span-2 sm:col-span-1">
               <div className="flex items-center text-gray-400 text-xs font-medium mb-1.5">
                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Neutered
              </div>
              <p className="font-bold text-gray-900 ml-1">{petDetails.neutered || "Unknown"}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 text-[15px] mb-2">Description</h3>
            <p className="text-gray-500 text-sm leading-[1.6]">
              {petDetails.description}
            </p>
          </div>

          <hr className="border-gray-100 mb-6" />

          {/* Owner Box */}
          <div className="bg-gray-50 rounded-xl p-5 mb-7 border border-gray-100 relative">
            <div className="flex items-center mb-4">
              <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 font-bold text-lg flex items-center justify-center mr-3 shadow-sm">
                {petDetails.owner.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center mb-0.5">
                  <h4 className="font-bold text-gray-900 mr-2 text-[15px]">{petDetails.owner.name}</h4>
                  <span className="bg-blue-100 text-blue-600 text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                    OWNER
                  </span>
                </div>
                <p className="text-gray-400 text-xs">{petDetails.owner.address}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm min-w-0">
                <Mail className="w-3.5 h-3.5 text-gray-400 mr-2 flex-shrink-0" />
                <span className="text-xs font-medium text-gray-600 truncate">{petDetails.owner.email}</span>
              </div>
              <div className="flex-1 flex items-center bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm min-w-0">
                <Phone className="w-3.5 h-3.5 text-gray-400 mr-2 flex-shrink-0" />
                <span className="text-xs font-medium text-gray-600 truncate">{petDetails.owner.mobile}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-auto">
            <button 
              onClick={handleMessageOwner}
              disabled={isRequesting || requestStatus === 'pending'}
              className={`flex-1 w-full flex items-center justify-center text-sm font-semibold py-3.5 px-4 rounded-xl shadow-md transition-all ${
                requestStatus === 'pending' ? 'bg-gray-400 text-white cursor-not-allowed' :
                requestStatus === 'accepted' ? 'bg-green-600 hover:bg-green-700 text-white' :
                'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <MessageCircle className="w-4 h-4 mr-2" /> 
              {isRequesting ? 'Sending...' : 
               requestStatus === 'pending' ? 'Request Pending' : 
               requestStatus === 'accepted' ? 'Open Chat' : 'Message owner'}
            </button>
            <button 
              onClick={handleBookPet} 
              className="flex-1 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:scale-95 font-semibold py-3.5 px-4 rounded-xl shadow-sm transition-all text-sm"
            >
               Request to adopt
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PetDetails;
