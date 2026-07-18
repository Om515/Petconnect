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
} from "lucide-react";
import { UserData } from "../context/UserContext";

const PetDetails = () => {
  const { petId } = useParams();
  const [petDetails, setPetDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { bookPet } = UserData();

  const navigate = useNavigate();

  const handleBookPet = () => {
    if (!petId) {
      toast.error("Invalid pet ID");
      return;
    }
    bookPet(petId, navigate); // Pass petId and navigate
  };
  

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Left side - Image positioned in the middle */}
          <div className="md:w-2/5 relative flex items-center justify-center bg-gray-100">
            <div className="absolute top-4 left-4 z-10 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {petDetails.breed}
            </div>
            <div className="absolute top-4 right-4 z-10 flex space-x-2">
              <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50">
                <Heart className="w-5 h-5 text-red-500" />
              </button>
              <button
                className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  const shareUrl =
                    window.location.origin + `/pet/${petDetails._id}`;

                  if (navigator.share) {
                    navigator
                      .share({
                        title: petDetails.type || "Check out this pet!",
                        text: `Check out this ${petDetails.breed} available for adoption!`,
                        url: shareUrl,
                      })
                      .then(() => console.log("Shared successfully"))
                      .catch((error) => console.error("Error sharing:", error));
                  } else {
                    navigator.clipboard
                      .writeText(shareUrl)
                      .then(() => alert("Pet link copied to clipboard!"))
                      .catch((err) => console.error("Clipboard error:", err));
                  }
                }}
              >
                <Share2 size={20} className="text-gray-800" />
              </button>
            </div>
            <div className="h-full flex items-center">
              <img
                src={petDetails.image.url}
                alt={petDetails.breed}
                className="w-full h-80 md:h-96 object-contain"
              />
            </div>
          </div>

          {/* Right side - Pet Info */}
          <div className="md:w-3/5 p-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {petDetails.type}
                </h1>
                <p className="text-gray-500 italic">{petDetails.breed}</p>
              </div>
              <span className="bg-green-100 text-green-800 text-lg font-medium px-4 py-2 rounded-lg flex items-center">
                <IndianRupee className="w-5 h-5 mr-1" />
                {petDetails.price.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-3 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500">Age</p>
                  <p className="font-medium">{petDetails.age} years</p>
                </div>
              </div>

              {/* You can add more pet attributes here in similar styled boxes */}
              <div className="bg-purple-50 rounded-lg p-3 flex items-center">
                <div className="w-5 h-5 mr-2 text-purple-500 flex items-center justify-center">
                  <span className="font-bold">♂♀</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Gender</p>
                  <p className="font-medium">
                    {petDetails.gender || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {petDetails.description}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Owner Details
              </h2>
              <div className="flex items-start mb-4">
                <div className="bg-blue-100 h-12 w-12 rounded-full p-2 mr-3 flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-lg">
                    {petDetails.owner.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {petDetails.owner.name}
                  </p>
                  <p className="text-sm text-gray-500">Pet Owner</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                <div className="flex items-center text-gray-700 bg-gray-50 p-3 rounded-lg">
                  <Mail className="w-5 h-5 mr-2 text-blue-500" />
                  <span className="text-sm truncate">
                    {petDetails.owner.email}
                  </span>
                </div>

                <div className="flex items-center text-gray-700 bg-gray-50 p-3 rounded-lg">
                  <Phone className="w-5 h-5 mr-2 text-blue-500" />
                  <span className="text-sm">{petDetails.owner.mobile}</span>
                </div>
              </div>

              <div className="flex items-start text-gray-700 bg-gray-50 p-3 rounded-lg mb-6">
                <MapPin className="w-5 h-5 mr-2 mt-1 text-blue-500 flex-shrink-0" />
                <span className="text-sm">{petDetails.owner.address}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center">
                <a
                  href={`tel:${petDetails.owner.mobile}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Message Owner
                </a>
              </button>
              <button 
              onClick={ handleBookPet }
              className="flex-1 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center">
                Book Pet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDetails;
