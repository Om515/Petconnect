import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { AuthData } from "../../../context/AuthContext";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Heart } from "lucide-react";

const BuyPets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ type: "", priceRange: "" });
  const { user, setUser } = AuthData();
  const wishlistIds = user?.wishlist || [];

  const navigate = useNavigate();

  const handleToggleWishlist = async (petId, e) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to save pets to your wishlist");
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
      toast.error("Error updating wishlist");
    }
  };

  useEffect(() => {
    setLoading(true);
    fetch("/api/user/buy-pet")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch pets");
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setPets(data.petContent);
        } else {
          throw new Error(data.message || "Failed to load pets");
        }
      })
      .catch((error) => {
        console.error("Error fetching pets:", error);
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredPets = pets.filter((pet) => {
    // Filter by pet type if a type filter is selected
    if (filter.type && pet.type !== filter.type) {
      return false;
    }

    // Filter by price range if selected
    if (filter.priceRange) {
      const price = Number(pet.price);
      if (filter.priceRange === "0-5000" && (price < 0 || price > 5000)) return false;
      if (filter.priceRange === "5001-10000" && (price < 5001 || price > 10000)) return false;
      if (filter.priceRange === "10001+" && price < 10001) return false;
    }

    return true;
  });

  // Get unique pet types for the filter dropdown
  const petTypes = [...new Set(pets.map((pet) => pet.type))];

  return (
    <div className="min-h-screen bg-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-center text-cyan-800 mb-2">
            Find Your Perfect Pet
          </h1>
          <p className="text-center text-cyan-600 max-w-2xl mx-auto">
            Browse our selection of available pets from trusted owners and breeders.
          </p>
        </header>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8 border border-cyan-100">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h2 className="text-lg font-medium text-cyan-700">Filters</h2>
            <div className="flex flex-wrap gap-4">
              <select
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                className="border border-cyan-200 rounded-md px-3 py-2 text-cyan-700 bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">All Pet Types</option>
                {petTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <select
                value={filter.priceRange}
                onChange={(e) => setFilter({ ...filter, priceRange: e.target.value })}
                className="border border-cyan-200 rounded-md px-3 py-2 text-cyan-700 bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">All Price Ranges</option>
                <option value="0-5000">₹0 - ₹5,000</option>
                <option value="5001-10000">₹5,001 - ₹10,000</option>
                <option value="10001+">₹10,001+</option>
              </select>

              <button
                onClick={() => setFilter({ type: "", priceRange: "" })}
                className="px-4 py-2 bg-cyan-100 hover:bg-cyan-200 text-cyan-700 rounded-md transition"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-cyan-600">Loading available pets...</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p>Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredPets.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md border border-cyan-100">
            <svg
              className="w-12 h-12 text-cyan-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <h3 className="text-lg font-medium text-cyan-700 mb-1">No pets found</h3>
            <p className="text-cyan-500">
              {pets.length > 0
                ? "Try adjusting your filters to see more results."
                : "Check back later for available pets."}
            </p>
          </div>
        )}

        {/* Pet grid */}
        {!loading && !error && pets.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPets.map((pet) => (
              <div
                key={pet._id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-cyan-100"
              >
                <div className="relative">
                  <img
                    src={pet.image.url}
                    alt={pet.breed}
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute top-0 right-0 m-3 px-2 py-1 flex space-x-2">
                    <span className="bg-cyan-500 text-white text-xs font-bold rounded px-2 py-1 h-fit">
                      {pet.breed}
                    </span>
                    <button
                      onClick={(e) => handleToggleWishlist(pet._id, e)}
                      className="p-1.5 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
                    >
                      <Heart filling={wishlistIds.includes(pet._id) ? "solid" : "none"} className={`w-4 h-4 ${wishlistIds.includes(pet._id) ? "text-red-500 fill-red-500" : "text-gray-400"}`} />
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-cyan-800 mb-1">{pet.basicInfo?.name || pet.type}</h2>
                    {pet.basicInfo?.listingType === "Adoption" && (
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                        Adoption
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-cyan-600">
                    {pet.basicInfo?.listingType === "Adoption"
                      ? (pet.basicInfo?.adoptionFee > 0 ? `₹${Number(pet.basicInfo.adoptionFee).toLocaleString()} (Fee)` : "Free Adoption")
                      : `₹${Number(pet.price).toLocaleString()}`}
                  </p>
                  
                  <button
                    onClick={() => navigate(`/pet-details/${pet._id}`)} // Navigate with pet ID
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 mt-4"
                  >
                    View Pet Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyPets;