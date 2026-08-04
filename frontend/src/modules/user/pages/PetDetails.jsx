import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  MapPin,
  Mail,
  Phone,
  IndianRupee,
  Info,
  Heart,
  Share2,
  PawPrint,
  Calendar,
  MessageCircle,
  FileCheck,
  CheckCircle,
  Activity,
  Home as HomeIcon,
  History as HistoryIcon,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Play,
  Clock,
  Tag,
  Smile,
  FileText,
  ExternalLink,
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
  const [activeMedia, setActiveMedia] = useState(null);
  const [docModal, setDocModal] = useState(null);

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
    if (requestStatus === "pending") {
      toast.info("Request already sent and is pending");
      return;
    }
    if (requestStatus === "accepted") {
      navigate("/chat");
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
      const { data } = await axios.post("/api/user/book-pet", { petId });
      if (data.success === true) {
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
      axios
        .get("/api/chat/requests/sent")
        .then((res) => {
          if (res.data.success) {
            const req = res.data.requests.find((r) => (r.pet?._id || r.pet) === petId);
            if (req) setRequestStatus(req.status);
          }
        })
        .catch((err) => console.error(err));
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
          const cover = data.petDetails?.media?.coverPhoto?.url || data.petDetails?.image?.url;
          setActiveMedia(cover);
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
        <div className="w-16 h-16 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading Professional Pet Profile...</p>
      </div>
    );
  }

  if (error || !petDetails) {
    return (
      <div className="max-w-3xl mx-auto mt-12 px-4">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            <p className="font-medium">Error: {error || "Pet listing not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  // Verification Check: Only show approved listings (unless user is owner or admin)
  const isOwner = user && (petDetails.owner?._id === user._id || petDetails.owner === user._id);
  const isAdmin = user && user.role === "admin";
  if ((!petDetails.isApproved || !petDetails.isVerified) && !isOwner && !isAdmin) {
    return (
      <div className="max-w-3xl mx-auto mt-16 px-4 text-center py-12 bg-amber-50 rounded-3xl border border-amber-200 shadow-md">
        <ShieldCheck className="w-14 h-14 text-amber-600 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-amber-900">Profile Awaiting Admin Verification</h2>
        <p className="text-sm text-amber-700 mt-2 max-w-md mx-auto">
          This pet profile has been submitted and is currently undergoing administrative review. Please check back soon!
        </p>
        <button
          onClick={() => navigate("/buy-pet")}
          className="mt-6 px-6 py-2.5 bg-amber-600 text-white font-bold rounded-xl text-sm hover:bg-amber-700 transition-all"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  // Safe normalized variables for legacy & new profiles
  const basic = petDetails.basicInfo || {};
  const personality = petDetails.personality || {};
  const health = petDetails.health || {};
  const lifestyle = petDetails.lifestyle || {};
  const history = petDetails.history || {};
  const media = petDetails.media || {};
  const docs = petDetails.documents || {};
  const owner = petDetails.owner || {};

  const petName = basic.name || petDetails.breed || petDetails.type;
  const listingType = basic.listingType || (petDetails.price > 0 ? "Sale" : "Adoption");
  const price = basic.price || petDetails.price || 0;
  const adoptionFee = basic.adoptionFee || 0;
  const galleryPhotos = media.gallery || [];
  const videos = media.videos || [];

  const getDocUrl = (doc) => {
    if (!doc) return null;
    if (typeof doc === "string") return doc;
    return doc.url || doc.secure_url || null;
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* SECTION 1: HERO BANNER & MEDIA GALLERY */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
          
          {/* Media Viewport */}
          <div className="w-full md:w-1/2 bg-gray-950 relative min-h-[440px] flex flex-col justify-between p-4">
            <div className="relative w-full h-[380px] flex items-center justify-center overflow-hidden rounded-2xl bg-black">
              {activeMedia?.endsWith(".mp4") || activeMedia?.includes("video") ? (
                <video src={activeMedia} controls className="w-full h-full object-contain" />
              ) : (
                <img
                  src={activeMedia || petDetails.image?.url}
                  alt={petName}
                  className="w-full h-full object-contain transition-all duration-300"
                />
              )}

              {/* Top Badges */}
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <span className="bg-cyan-600/90 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                  <PawPrint className="w-3.5 h-3.5" /> {petDetails.breed}
                </span>
                <span className="bg-emerald-600/90 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  {listingType === "Sale" ? "For Sale" : "For Adoption"}
                </span>
              </div>

              {/* Wishlist & Share Buttons */}
              <div className="absolute top-4 right-4 z-10 flex space-x-2">
                <button
                  onClick={handleToggleWishlist}
                  className="bg-white/90 p-2.5 rounded-full shadow-md hover:scale-105 transition-transform backdrop-blur-sm"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? "text-red-500 fill-red-500" : "text-gray-600"}`} />
                </button>
                <button
                  onClick={() => {
                    const shareUrl = window.location.origin + `/pet/${petDetails._id}`;
                    if (navigator.share) navigator.share({ title: petName, url: shareUrl });
                    else {
                      navigator.clipboard.writeText(shareUrl);
                      toast.success("Link copied!");
                    }
                  }}
                  className="bg-white/90 p-2.5 rounded-full shadow-md hover:scale-105 transition-transform backdrop-blur-sm"
                >
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Media Gallery & Video Thumbnails Carousel */}
            {(galleryPhotos.length > 0 || videos.length > 0) && (
              <div className="flex gap-2 overflow-x-auto pt-3 no-scrollbar">
                {/* Cover thumbnail */}
                <img
                  src={media.coverPhoto?.url || petDetails.image?.url}
                  alt="Cover"
                  onClick={() => setActiveMedia(media.coverPhoto?.url || petDetails.image?.url)}
                  className={`w-14 h-14 object-cover rounded-xl cursor-pointer border-2 transition-all ${
                    activeMedia === (media.coverPhoto?.url || petDetails.image?.url) ? "border-cyan-400 scale-105" : "border-transparent opacity-70"
                  }`}
                />
                {/* Gallery thumbnails */}
                {galleryPhotos.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.url}
                    alt={`Gallery ${idx}`}
                    onClick={() => setActiveMedia(img.url)}
                    className={`w-14 h-14 object-cover rounded-xl cursor-pointer border-2 transition-all ${
                      activeMedia === img.url ? "border-cyan-400 scale-105" : "border-transparent opacity-70"
                    }`}
                  />
                ))}
                {/* Video thumbnails */}
                {videos.map((vid, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveMedia(vid.url)}
                    className={`w-14 h-14 bg-gray-800 rounded-xl flex items-center justify-center cursor-pointer border-2 transition-all ${
                      activeMedia === vid.url ? "border-cyan-400 scale-105" : "border-transparent opacity-70"
                    }`}
                  >
                    <Play className="w-5 h-5 text-white" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Hero Summary Column */}
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-cyan-600 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-cyan-500" /> Verified Pet Profile
                </span>
                <span className="flex items-center text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Admin Verified
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">{petName}</h1>
              <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-cyan-500" />
                {basic.city ? `${basic.city}, ${basic.state}` : owner.address || "Location Verified"}
              </p>

              {/* Price / Adoption Fee Display */}
              <div className="mt-5 p-5 bg-cyan-50/70 rounded-2xl border border-cyan-100 flex items-baseline justify-between shadow-sm">
                <div>
                  <span className="text-xs font-bold text-cyan-700 uppercase tracking-wider">
                    {listingType === "Sale" ? "Asking Price" : "Adoption Fee"}
                  </span>
                  <div className="text-3xl font-black text-cyan-900 flex items-center mt-0.5">
                    <IndianRupee className="w-6 h-6 mr-0.5" />
                    {listingType === "Sale" ? price.toLocaleString("en-IN") : adoptionFee.toLocaleString("en-IN")}
                  </div>
                </div>
                {petDetails.soldBool ? (
                  <span className="bg-red-500 text-white px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-md">
                    Adopted / Sold
                  </span>
                ) : (
                  <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-md">
                    Available Now
                  </span>
                )}
              </div>
            </div>

            {/* Quick Specs Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 p-3 rounded-2xl text-center border border-gray-100">
                <span className="block text-xs text-gray-400 font-semibold uppercase">Age</span>
                <span className="text-base font-black text-gray-800 mt-0.5 block">{basic.age || petDetails.age} Yrs</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-2xl text-center border border-gray-100">
                <span className="block text-xs text-gray-400 font-semibold uppercase">Gender</span>
                <span className="text-base font-black text-gray-800 mt-0.5 block">{basic.gender || petDetails.gender}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-2xl text-center border border-gray-100">
                <span className="block text-xs text-gray-400 font-semibold uppercase">Weight</span>
                <span className="text-base font-black text-gray-800 mt-0.5 block">{basic.weight || petDetails.weight}</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            {!petDetails.soldBool && (
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleBookPet}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-extrabold py-4 rounded-2xl hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg text-center text-lg flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" /> Adopt / Buy Pet Now
                </button>
                <button
                  onClick={handleMessageOwner}
                  disabled={isRequesting}
                  className="w-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold py-3.5 rounded-2xl hover:bg-emerald-100 transition-all text-center flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                  {requestStatus === "pending"
                    ? "Connection Request Pending"
                    : requestStatus === "accepted"
                    ? "Open Chat with Seller"
                    : "Send Chat Request to Owner"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: BASIC INFORMATION CARD */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 space-y-4">
          <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2 border-b pb-3">
            <PawPrint className="w-5 h-5 text-cyan-600" /> Basic Information
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-400 block font-semibold uppercase">Pet Name</span>
              <span className="font-bold text-gray-800 mt-0.5 block">{petName}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-400 block font-semibold uppercase">Category</span>
              <span className="font-bold text-gray-800 mt-0.5 block">{basic.category || petDetails.category}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-400 block font-semibold uppercase">Type / Species</span>
              <span className="font-bold text-gray-800 mt-0.5 block">{basic.type || petDetails.type}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-400 block font-semibold uppercase">Breed</span>
              <span className="font-bold text-gray-800 mt-0.5 block">{basic.breed || petDetails.breed}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-400 block font-semibold uppercase">Gender</span>
              <span className="font-bold text-gray-800 mt-0.5 block">{basic.gender || petDetails.gender}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-400 block font-semibold uppercase">Age</span>
              <span className="font-bold text-gray-800 mt-0.5 block">{basic.age || petDetails.age} Yrs</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-400 block font-semibold uppercase">Color</span>
              <span className="font-bold text-gray-800 mt-0.5 block">{basic.color || "Not specified"}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-400 block font-semibold uppercase">Weight</span>
              <span className="font-bold text-gray-800 mt-0.5 block">{basic.weight || petDetails.weight}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-400 block font-semibold uppercase">Date of Birth</span>
              <span className="font-bold text-gray-800 mt-0.5 block">{basic.dob || history.birthDate || "N/A"}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-400 block font-semibold uppercase">Listing Type</span>
              <span className="font-bold text-gray-800 mt-0.5 block">{listingType}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-400 block font-semibold uppercase">City</span>
              <span className="font-bold text-gray-800 mt-0.5 block">{basic.city || "Verified"}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-400 block font-semibold uppercase">State</span>
              <span className="font-bold text-gray-800 mt-0.5 block">{basic.state || "Verified"}</span>
            </div>
          </div>
        </div>

        {/* SECTION 3: PERSONALITY & BEHAVIOR */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 space-y-6">
          <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2 border-b pb-3">
            <Heart className="w-5 h-5 text-cyan-600" /> Personality & Behavioral Traits
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block mb-2">Temperament</span>
              <div className="flex flex-wrap gap-2">
                {(personality.temperament?.length ? personality.temperament : ["Friendly", "Playful", "Calm"]).map((trait, idx) => (
                  <span key={idx} className="px-3.5 py-1.5 bg-cyan-50 text-cyan-800 rounded-full text-xs font-bold border border-cyan-200">
                    ✨ {trait}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block mb-2">Good With</span>
              <div className="flex flex-wrap gap-2">
                {(personality.goodWith?.length ? personality.goodWith : ["Dogs", "Children"]).map((item, idx) => (
                  <span key={idx} className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
                    💚 {item}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block mb-2">Completed Training</span>
              <div className="flex flex-wrap gap-2">
                {(personality.training?.length ? personality.training : ["House Trained"]).map((train, idx) => (
                  <span key={idx} className="px-3.5 py-1.5 bg-blue-50 text-blue-800 rounded-full text-xs font-bold border border-blue-200">
                    🎓 {train}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: HEALTH & MEDICAL RECORDS */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 space-y-6">
          <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2 border-b pb-3">
            <Activity className="w-5 h-5 text-cyan-600" /> Health Information & Status
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 text-center">
              <span className="text-xs text-emerald-700 block font-bold uppercase">Vaccinations</span>
              <span className="text-base font-black text-emerald-950 mt-1 block">
                {health.vaccinationStatus || petDetails.vaccinated}
              </span>
            </div>
            <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100 text-center">
              <span className="text-xs text-blue-700 block font-bold uppercase">Dewormed</span>
              <span className="text-base font-black text-blue-950 mt-1 block">{health.dewormed || "Yes"}</span>
            </div>
            <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-100 text-center">
              <span className="text-xs text-purple-700 block font-bold uppercase">Microchipped</span>
              <span className="text-base font-black text-purple-950 mt-1 block">{health.microchipped || "No"}</span>
            </div>
            <div className="p-4 bg-pink-50/70 rounded-2xl border border-pink-100 text-center">
              <span className="text-xs text-pink-700 block font-bold uppercase">Neutered / Spayed</span>
              <span className="text-base font-black text-pink-950 mt-1 block">
                {health.neutered || petDetails.neutered}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase block">Medical Conditions</span>
              <p className="text-sm font-bold text-gray-800 mt-1">
                {health.medicalConditions?.length ? health.medicalConditions.join(", ") : "None reported"}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase block">Current Medications</span>
              <p className="text-sm font-bold text-gray-800 mt-1">
                {health.currentMedications?.length ? health.currentMedications.join(", ") : "None required"}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase block">Allergies</span>
              <p className="text-sm font-bold text-gray-800 mt-1">
                {health.allergies?.length ? health.allergies.join(", ") : "None reported"}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 5: LIFESTYLE & CARE REQUIREMENTS */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 space-y-6">
          <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2 border-b pb-3">
            <HomeIcon className="w-5 h-5 text-cyan-600" /> Lifestyle & Daily Care Requirements
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase block">Ideal Living Style</span>
              <p className="text-base font-extrabold text-gray-900 mt-1">{lifestyle.livingStyle || "House with Yard"}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase block">Exercise Requirement</span>
              <p className="text-base font-extrabold text-gray-900 mt-1">{lifestyle.exerciseRequirement || "Moderate"}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase block">Energy Level</span>
              <p className="text-base font-extrabold text-gray-900 mt-1">{lifestyle.energyLevel || "Moderate"}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase block">Diet & Feeding</span>
              <p className="text-base font-extrabold text-gray-900 mt-1">{lifestyle.diet || "Standard Quality Pet Food"}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase block">Grooming Needs</span>
              <p className="text-base font-extrabold text-gray-900 mt-1">{lifestyle.groomingNeeds || "Moderate"}</p>
            </div>
          </div>
        </div>

        {/* SECTION 6: PET STORY & BACKGROUND */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 space-y-4">
          <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2 border-b pb-3">
            <HistoryIcon className="w-5 h-5 text-cyan-600" /> Background Story & Rehoming Reason
          </h2>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            {history.reasonForRehoming && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-sm">
                <span className="font-bold">Reason for Rehoming: </span> {history.reasonForRehoming}
              </div>
            )}

            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase block mb-2">Pet Description & Story</span>
              <p className="text-base text-gray-800 whitespace-pre-line leading-relaxed font-medium">
                {history.petStory || petDetails.description || "No detailed description provided."}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 7: DOCUMENTS & CERTIFICATES */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 space-y-4">
          <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2 border-b pb-3">
            <FileCheck className="w-5 h-5 text-cyan-600" /> Verified Health & Registration Certificates
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Vaccination Certificate", doc: docs.vaccinationCertificate },
              { label: "Medical Record", doc: docs.medicalRecord },
              { label: "Registration Certificate", doc: docs.registrationCertificate },
              { label: "Pedigree Certificate", doc: docs.pedigreeCertificate },
              { label: "Ownership Proof", doc: docs.ownershipProof },
            ].map((item, idx) => {
              const docUrl = getDocUrl(item.doc);
              return (
                <div key={idx} className="p-4 border rounded-2xl flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-6 h-6 text-cyan-600" />
                    <div>
                      <div className="text-sm font-bold text-gray-900">{item.label}</div>
                      <div className="text-xs text-gray-500">
                        {docUrl ? "Verified & Uploaded" : "Not Provided"}
                      </div>
                    </div>
                  </div>
                  {docUrl ? (
                    <button
                      type="button"
                      onClick={() => setDocModal({ title: item.label, url: docUrl })}
                      className="px-4 py-2 bg-cyan-600 text-white rounded-xl text-xs font-bold hover:bg-cyan-700 transition-colors shadow-sm"
                    >
                      View Certificate
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400 font-medium">N/A</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 8: SELLER INFORMATION CARD */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-cyan-600" /> Verified Seller Profile
            </h2>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
              System Verified
            </span>
          </div>

          <div className="p-6 bg-cyan-50/60 rounded-2xl border border-cyan-100 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase">Seller Name</span>
              <div className="text-lg font-black text-gray-900 mt-1">{owner.name || "Pet Owner Profile"}</div>
            </div>
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase">Email Contact</span>
              <div className="text-sm font-bold text-gray-800 mt-1 flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-600" /> {owner.email || "Contact Verified"}
              </div>
            </div>
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase">Mobile Contact</span>
              <div className="text-sm font-bold text-gray-800 mt-1 flex items-center gap-2">
                <Phone className="w-4 h-4 text-cyan-600" /> {owner.mobile || "Contact Verified"}
              </div>
            </div>
            <div className="md:col-span-3 pt-2 border-t border-cyan-100/80">
              <span className="text-xs font-bold text-gray-400 uppercase">Registered Address</span>
              <div className="text-sm font-bold text-gray-800 mt-1 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-600" /> {owner.address || "Address Verified"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DOCUMENT CERTIFICATE LIGHTBOX PREVIEW MODAL */}
      {docModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl relative space-y-4 animate-fadeIn">
            <button
              onClick={() => setDocModal(null)}
              className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-full transition-colors shadow-md"
            >
              <Info className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between pr-10">
              <h3 className="text-xl font-extrabold text-gray-900">{docModal.title}</h3>
              <a
                href={docModal.url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-cyan-600 text-white rounded-lg text-xs font-bold hover:bg-cyan-700 transition-colors flex items-center gap-1"
              >
                Open Original <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="w-full bg-gray-950 rounded-2xl overflow-hidden flex items-center justify-center min-h-[400px]">
              {docModal.url?.endsWith(".pdf") || docModal.url?.includes("/pdf/") ? (
                <iframe src={docModal.url} className="w-full h-[500px] border-0" title="Document Preview" />
              ) : (
                <img
                  src={docModal.url}
                  alt={docModal.title}
                  className="max-h-[500px] w-auto object-contain mx-auto"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetDetails;
