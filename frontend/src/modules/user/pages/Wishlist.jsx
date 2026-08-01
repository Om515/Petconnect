import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Heart, HeartOff, Share2, Eye, IndianRupee, PawPrint } from "lucide-react";
import { AuthData } from "../../../context/AuthContext";

const Wishlist = () => {
  const [wishlistPets, setWishlistPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, setUser, isAuthenticated } = AuthData();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [isAuthenticated, navigate]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/user/wishlist", { withCredentials: true });
      if (data.success) {
        setWishlistPets(data.wishlist);
      } else {
        throw new Error(data.message || "Failed to load wishlist");
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (petId) => {
    try {
      const { data } = await axios.post("/api/user/wishlist/toggle", { petId });
      if (data.success) {
        toast.success("Removed from wishlist");
        setWishlistPets((prev) => prev.filter((pet) => pet._id !== petId));
        setUser({ ...user, wishlist: data.wishlist });
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Error updating wishlist");
    }
  };

  const handleShare = (petId, petType, petBreed, e) => {
    e.stopPropagation();
    const shareUrl = window.location.origin + `/pet-details/${petId}`;
    if (navigator.share) {
      navigator
        .share({
          title: `Check out this ${petType}!`,
          text: `Check out this ${petBreed} available for adoption!`,
          url: shareUrl,
        })
        .catch((error) => console.error("Error sharing:", error));
    } else {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => toast.success("Pet link copied to clipboard!"))
        .catch(() => toast.error("Clipboard error"));
    }
  };

  const handleBookPet = async (petId, e) => {
    e.stopPropagation();
    try {
      const { data } = await axios.post("/api/user/book-pet", { petId });
      if (data.success) {
        toast.success(data.message);
        navigate("/user/bookings");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("An error occurred while booking. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 mb-4 inline-flex items-center gap-3 justify-center w-full">
            <Heart className="text-red-500 fill-red-500 w-10 h-10 animate-pulse" />
            Your Wishlist
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Review the pets you've fallen in love with. Apply for adoption or share them with friends!
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-teal-700 font-medium tracking-wide animate-pulse">Loading your furry friends...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-6 py-5 rounded-2xl max-w-2xl mx-auto flex items-center justify-between shadow-sm">
            <p className="font-medium">Error: {error}</p>
            <button onClick={fetchWishlist} className="px-4 py-2 bg-white text-red-600 rounded-lg shadow hover:shadow-md transition-shadow font-semibold text-sm">
              Try again
            </button>
          </div>
        ) : wishlistPets.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-16 text-center max-w-3xl mx-auto border border-cyan-100 shadow-xl">
            <div className="w-32 h-32 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <PawPrint className="w-16 h-16 text-cyan-400 rotate-12 opacity-80" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Wishlist is Empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg text-balance">
              It looks like you haven't saved any pets yet. Head over to the marketplace to find your new best friend!
            </p>
            <button
              onClick={() => navigate("/buy-pet")}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold py-4 px-10 rounded-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              Browse Pets
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {wishlistPets.map((pet) => (
              <div
                key={pet._id}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col h-full transform hover:-translate-y-2 relative"
              >
                {/* Header Actions Float */}
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemove(pet._id); }}
                    className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg hover:bg-red-50 group/btn transition-colors"
                    title="Remove from Wishlist"
                  >
                    <HeartOff className="w-5 h-5 text-gray-400 group-hover/btn:text-red-500 transition-colors" />
                  </button>
                </div>

                <div className="relative h-64 overflow-hidden">
                  <img
                    src={pet.image.url}
                    alt={pet.breed}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-80"></div>
                  
                  <div className="absolute bottom-4 left-4 z-10 flex gap-2">
                    <span className="bg-teal-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold shadow tracking-wide uppercase">
                      {pet.type}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow bg-white">
                  <h3 className="text-2xl font-black text-gray-800 mb-1 truncate">{pet.breed}</h3>
                  <div className="flex items-center text-teal-600 font-extrabold text-xl mb-4 bg-teal-50 w-fit px-3 py-1 rounded-xl">
                    <IndianRupee className="w-5 h-5" />
                    <span>{Number(pet.price).toLocaleString()}</span>
                  </div>
                  
                  <p className="text-gray-500 text-sm line-clamp-2 mb-6 flex-grow leading-relaxed">
                    {pet.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <button
                      onClick={() => navigate(`/pet-details/${pet._id}`)}
                      className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-3 px-4 rounded-2xl transition-colors font-semibold shadow-sm border border-gray-100"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={(e) => handleShare(pet._id, pet.type, pet.breed, e)}
                      className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-3 px-4 rounded-2xl transition-colors font-semibold shadow-sm border border-gray-100"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                    <button
                      onClick={(e) => handleBookPet(pet._id, e)}
                      className="col-span-2 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-3.5 px-4 rounded-2xl transition-all font-bold shadow-md hover:shadow-lg mt-1"
                    >
                      <Heart className="w-4 h-4 fill-white" />
                      Apply for Adoption
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
