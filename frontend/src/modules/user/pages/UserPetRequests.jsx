import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Sparkles,
  IndianRupee,
  Calendar,
  User,
  CreditCard,
  PawPrint,
  AlertTriangle,
  RefreshCw,
  Eye,
  Slash,
  MessageCircle,
  RotateCcw,
  Star,
} from "lucide-react";
import { toast } from "react-hot-toast";
import ReviewModal from "../components/ReviewModal";

const UserPetRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const [reviewModalReq, setReviewModalReq] = useState(null);
  const [reviewedMap, setReviewedMap] = useState({});
  const navigate = useNavigate();

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get("/api/user/pet-requests");
      if (data.success) {
        const fetchedReqs = data.petRequests || [];
        setRequests(fetchedReqs);

        // Check review eligibility for Completed requests
        const completedReqs = fetchedReqs.filter((r) => r.requestStatus === "Completed");
        if (completedReqs.length > 0) {
          const map = {};
          await Promise.all(
            completedReqs.map(async (r) => {
              try {
                const statusRes = await axios.get(`/api/user/pet-request/${r._id}/review-status`);
                if (statusRes.data.success) {
                  map[r._id] = statusRes.data.alreadyReviewed;
                }
              } catch (e) {}
            })
          );
          setReviewedMap(map);
        }
      } else {
        setError(data.message || "Failed to fetch pet requests");
      }
    } catch (err) {
      console.error("Error fetching pet requests:", err);
      setError(err.response?.data?.message || "An error occurred while loading your requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filterTabs = ["All", "Pending", "Accepted", "Refunds & Rejections", "Completed"];

  const getFilteredRequests = () => {
    if (activeTab === "All") return requests;
    if (activeTab === "Refunds & Rejections") {
      return requests.filter((r) => r.requestStatus === "Rejected" || r.paymentStatus === "Refunded");
    }
    return requests.filter((r) => r.requestStatus === activeTab);
  };

  const filteredRequests = getFilteredRequests();

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return (
          <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-sm">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
      case "Accepted":
        return (
          <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-sm">
            <CheckCircle className="w-3.5 h-3.5" /> Accepted
          </span>
        );
      case "Rejected":
        return (
          <span className="px-3 py-1 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-sm">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      case "Completed":
        return (
          <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case "Withdrawn":
        return (
          <span className="px-3 py-1 bg-gray-500 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-sm">
            <Slash className="w-3.5 h-3.5" /> Withdrawn
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-600 text-white text-xs font-bold rounded-full">
            {status}
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (req) => {
    const paymentStatus = req.paymentStatus;
    const requestStatus = req.requestStatus;
    const isVerified = req.paymentVerified;
    const isFake = req.fakePayment;

    if (requestStatus === "Rejected" || paymentStatus === "Refunded") {
      if (paymentStatus === "RefundPending") {
        return (
          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-md">
            Refund Pending
          </span>
        );
      }
      return (
        <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-md">
          Refunded
        </span>
      );
    }
    if (paymentStatus === "Paid") {
      return (
        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-md flex items-center gap-1">
          {isVerified ? "Fee Paid (Razorpay Verified)" : isFake ? "Paid (Test Mode)" : "Request Fee Paid"}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 bg-gray-50 text-gray-700 border border-gray-200 text-xs font-bold rounded-md">
        {paymentStatus}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-cyan-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-black tracking-tight">My Pet Requests</h1>
            </div>
            <p className="text-cyan-100 text-sm mt-2 max-w-xl font-medium">
              Track and manage all your purchase and adoption requests submitted across the PetConnect marketplace.
            </p>
          </div>
          <button
            onClick={fetchRequests}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-2xl text-xs font-bold backdrop-blur-md transition-all flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        {/* Navigation / Filter Tabs */}
        <div className="bg-white rounded-2xl p-2 shadow-md border border-cyan-100 flex overflow-x-auto gap-2 no-scrollbar">
          {filterTabs.map((tab) => {
            const count =
              tab === "All"
                ? requests.length
                : requests.filter((r) => r.requestStatus === tab).length;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === tab
                    ? "bg-cyan-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-cyan-50 hover:text-cyan-700"
                }`}
              >
                {tab}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-black ${
                    activeTab === tab
                      ? "bg-white/25 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-cyan-100">
            <div className="w-14 h-14 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-cyan-800 font-bold text-lg">Loading your pet requests...</p>
            <p className="text-cyan-600 text-xs mt-1">Fetching your request details</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-3xl shadow-sm flex flex-col items-center text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-red-500" />
            <h3 className="text-lg font-bold text-red-900">Failed to Load Requests</h3>
            <p className="text-sm text-red-700 max-w-md">{error}</p>
            <button
              onClick={fetchRequests}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredRequests.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl shadow-md border border-cyan-100 px-4 space-y-4">
            <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center mx-auto text-cyan-500">
              <PawPrint className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-cyan-900">No {activeTab !== "All" ? activeTab : ""} Requests Found</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              {activeTab === "All"
                ? "You haven't submitted any pet purchase or adoption requests yet. Browse the marketplace to find your next companion!"
                : `You currently have no requests matching the '${activeTab}' filter.`}
            </p>
            {activeTab === "All" && (
              <button
                onClick={() => navigate("/buy-pet")}
                className="mt-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-2xl text-sm transition-all shadow-md"
              >
                Browse Marketplace
              </button>
            )}
          </div>
        )}

        {/* Request Cards Grid */}
        {!loading && !error && filteredRequests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRequests.map((req) => {
              const pet = req.petId;
              const owner = req.ownerId;
              const isPetAvailable = pet && typeof pet === "object";

              const petName = isPetAvailable
                ? pet.basicInfo?.name || pet.breed || pet.type || "Pet"
                : "Unavailable Pet";

              const petImage = isPetAvailable
                ? pet.media?.coverPhoto?.url || pet.image?.url
                : null;

              const listingType = req.listingType || (pet?.price > 0 ? "Sale" : "Adoption");
              const price = isPetAvailable ? pet.basicInfo?.price || pet.price || 0 : 0;
              const adoptionFee = isPetAvailable ? pet.basicInfo?.adoptionFee || 0 : 0;

              return (
                <div
                  key={req._id}
                  className="bg-white rounded-3xl border border-cyan-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  {/* Card Header & Badges */}
                  <div>
                    <div className="p-5 bg-gradient-to-r from-cyan-50/50 to-teal-50/50 border-b border-cyan-100/60 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          listingType === "Sale" ? "bg-cyan-100 text-cyan-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {listingType === "Sale" ? "For Sale" : "For Adoption"}
                        </span>
                        {getPaymentStatusBadge(req)}
                      </div>
                      {getStatusBadge(req.requestStatus)}
                    </div>

                    {/* Main Pet Info & Image Body */}
                    <div className="p-5 flex gap-4 items-start">
                      {petImage ? (
                        <img
                          src={petImage}
                          alt={petName}
                          className="w-24 h-24 object-cover rounded-2xl border border-gray-100 flex-shrink-0 shadow-sm"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400 flex-shrink-0">
                          <PawPrint className="w-8 h-8" />
                          <span className="text-[10px] font-bold mt-1">No Image</span>
                        </div>
                      )}

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <h3 className="text-xl font-black text-gray-900 truncate">{petName}</h3>

                        {isPetAvailable ? (
                          <>
                            <p className="text-xs text-gray-500 font-semibold truncate">
                              Breed: <span className="text-gray-800">{pet.breed || "Specified Breed"}</span>
                            </p>
                            <p className="text-sm font-black text-cyan-700 flex items-center">
                              <IndianRupee className="w-4 h-4 mr-0.5" />
                              {listingType === "Sale"
                                ? price.toLocaleString("en-IN")
                                : (adoptionFee > 0 ? `${adoptionFee.toLocaleString("en-IN")} (Fee)` : "Free Adoption")}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-rose-600 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Pet listing is no longer active
                          </p>
                        )}

                        {/* Owner Info */}
                        {owner && (
                          <div className="pt-1 text-xs text-gray-600 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
                            <span className="truncate">
                              Owner: <strong className="text-gray-900">{owner.name || "Seller"}</strong>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {(req.requestStatus === "Rejected" || req.paymentStatus === "Refunded") && (
                      <div className="mx-5 mb-4 p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs font-semibold space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-bold">
                            <RotateCcw className="w-4 h-4 text-amber-600 flex-shrink-0" /> Request Fee Refunded
                          </span>
                          <span className="text-[10px] bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full font-extrabold">
                            ₹{req.requestFee} Credited
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-800 font-medium pl-5">
                          {req.createdAt && (Date.now() - new Date(req.createdAt).getTime() > 48 * 60 * 60 * 1000)
                            ? "Auto-refunded due to seller response timeout (48h limit)."
                            : "Declined by pet owner. Fee has been refunded to your account."}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Footer Details & Actions */}
                  <div className="p-5 bg-gray-50/80 border-t border-gray-100 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center text-gray-600">
                        <CreditCard className="w-3.5 h-3.5 text-cyan-600 mr-1.5" />
                        <span>Request Fee: <strong>₹{req.requestFee}</strong></span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-3.5 h-3.5 text-cyan-600 mr-1.5" />
                        <span>
                          {new Date(req.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {req.requestStatus === "Completed" && (
                      reviewedMap[req._id] ? (
                        <div className="w-full py-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm">
                          <CheckCircle className="w-4 h-4 text-emerald-600" /> Review Submitted
                        </div>
                      ) : (
                        <button
                          onClick={() => setReviewModalReq(req)}
                          className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Star className="w-4 h-4 fill-white" /> Rate Owner
                        </button>
                      )
                    )}

                    {req.requestStatus === "Accepted" && (
                      <button
                        onClick={() => navigate("/chat", { state: { conversationId: req.conversationId } })}
                        className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" /> Chat with Owner
                      </button>
                    )}

                    {isPetAvailable && (
                      <button
                        onClick={() => navigate(`/pet-details/${pet._id}`)}
                        className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Eye className="w-4 h-4" /> View Pet Profile
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* REVIEW MODAL FOR RATING OWNER */}
      <ReviewModal
        isOpen={Boolean(reviewModalReq)}
        onClose={() => setReviewModalReq(null)}
        petRequest={reviewModalReq}
        onSuccess={() => {
          if (reviewModalReq) {
            setReviewedMap((prev) => ({ ...prev, [reviewModalReq._id]: true }));
          }
        }}
      />
    </div>
  );
};

export default UserPetRequests;
