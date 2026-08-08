import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Inbox,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Sparkles,
  IndianRupee,
  CreditCard,
  PawPrint,
  AlertCircle,
  RefreshCw,
  Check,
  X,
  Eye,
  ShieldCheck,
  MessageCircle,
  Star,
} from "lucide-react";
import { toast } from "react-hot-toast";
import ReviewModal from "./ReviewModal";

const OwnerPetRequestsManager = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [selectedRequester, setSelectedRequester] = useState(null);
  const [confirmModalReq, setConfirmModalReq] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const [reviewModalReq, setReviewModalReq] = useState(null);
  const [ownerReviewedMap, setOwnerReviewedMap] = useState({});
  const [buyerReputationMap, setBuyerReputationMap] = useState({});
  const [viewingBuyerReviews, setViewingBuyerReviews] = useState(null);
  const navigate = useNavigate();

  const handleComplete = async (requestId) => {
    if (processingId) return;
    setProcessingId(requestId);
    try {
      const { data } = await axios.patch(`/api/user/pet-request/${requestId}/complete`);
      if (data.success) {
        toast.success(data.message || "Transaction completed successfully!");
        setConfirmModalReq(null);
        await fetchOwnerRequests();
      } else {
        toast.error(data.message || "Failed to complete transaction.");
      }
    } catch (err) {
      console.error("Error completing transaction:", err);
      toast.error(err.response?.data?.message || "Error completing transaction.");
    } finally {
      setProcessingId(null);
    }
  };

  const fetchOwnerRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get("/api/user/owner-pet-requests");
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
          setOwnerReviewedMap(map);
        }

        // Fetch Buyer Reputation for unique buyers
        const uniqueBuyerIds = [
          ...new Set(
            fetchedReqs
              .map((r) => r.requesterId?._id || r.requesterId)
              .filter(Boolean)
          ),
        ];

        if (uniqueBuyerIds.length > 0) {
          const bMap = {};
          await Promise.all(
            uniqueBuyerIds.map(async (bId) => {
              try {
                const bRes = await axios.get(`/api/user/reviews/buyer/${bId}`);
                if (bRes.data.success) {
                  bMap[bId] = {
                    averageRating: bRes.data.averageRating || 0,
                    totalCount: bRes.data.totalCount || 0,
                    reviews: bRes.data.reviews || [],
                  };
                }
              } catch (e) {}
            })
          );
          setBuyerReputationMap(bMap);
        }
      } else {
        setError(data.message || "Failed to fetch pet requests");
      }
    } catch (err) {
      console.error("Error fetching owner pet requests:", err);
      setError(err.response?.data?.message || "An error occurred while loading pet requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerRequests();
  }, []);

  // Group requests by pet ID
  const groupRequestsByPet = (requestList) => {
    const map = {};
    requestList.forEach((req) => {
      const pet = req.petId;
      const petIdStr = pet?._id || req.petId || "unknown";
      if (!map[petIdStr]) {
        map[petIdStr] = {
          pet,
          requests: [],
        };
      }
      map[petIdStr].requests.push(req);
    });
    return Object.values(map);
  };

  const handleAccept = async (requestId) => {
    if (processingId) return; // Prevent double clicks
    setProcessingId(requestId);
    try {
      const { data } = await axios.patch(`/api/user/pet-request/${requestId}/accept`);
      if (data.success) {
        toast.success("Pet request accepted! Competing pending requests rejected.");
        await fetchOwnerRequests();
      } else {
        toast.error(data.message || "Failed to accept request.");
      }
    } catch (err) {
      console.error("Error accepting request:", err);
      const msg = err.response?.data?.message || "An error occurred while accepting the request.";
      toast.error(msg);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    if (processingId) return; // Prevent double clicks
    setProcessingId(requestId);
    try {
      const { data } = await axios.patch(`/api/user/pet-request/${requestId}/reject`);
      if (data.success) {
        toast.success("Pet request rejected. Fee refunded to buyer.");
        await fetchOwnerRequests();
      } else {
        toast.error(data.message || "Failed to reject request.");
      }
    } catch (err) {
      console.error("Error rejecting request:", err);
      const msg = err.response?.data?.message || "An error occurred while rejecting the request.";
      toast.error(msg);
    } finally {
      setProcessingId(null);
    }
  };

  const filterTabs = ["All", "Pending", "Accepted", "Refunded & Rejected", "Completed"];

  const getFilteredRequests = (requestList) => {
    if (activeTab === "All") return requestList;
    if (activeTab === "Refunded & Rejected") {
      return requestList.filter((r) => r.requestStatus === "Rejected" || r.paymentStatus === "Refunded");
    }
    return requestList.filter((r) => r.requestStatus === activeTab);
  };

  const petGroups = groupRequestsByPet(getFilteredRequests(requests));

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full flex items-center gap-1 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" /> Pending
          </span>
        );
      case "Accepted":
        return (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" /> Accepted
          </span>
        );
      case "Rejected":
        return (
          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full flex items-center gap-1 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded-full border border-gray-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-cyan-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-cyan-900 flex items-center gap-2">
            <Inbox className="w-5 h-5 text-cyan-600" /> Incoming Pet Requests
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Review and respond to purchase and adoption requests grouped by pet listing
          </p>
        </div>
        <button
          onClick={fetchOwnerRequests}
          disabled={loading}
          className="px-3.5 py-2 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-cyan-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Filter Tabs Bar */}
      <div className="bg-white rounded-2xl p-2 shadow-sm border border-cyan-100 flex overflow-x-auto gap-2 no-scrollbar">
        {filterTabs.map((tab) => {
          const count =
            tab === "All"
              ? requests.length
              : tab === "Refunded & Rejected"
              ? requests.filter((r) => r.requestStatus === "Rejected" || r.paymentStatus === "Refunded").length
              : requests.filter((r) => r.requestStatus === tab).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-teal-50 hover:text-teal-700"
              }`}
            >
              {tab}
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
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
        <div className="text-center py-12 bg-white rounded-2xl border border-cyan-100 shadow-sm">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-cyan-800 text-sm font-semibold">Loading pet requests...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-2xl text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-sm font-bold">{error}</p>
          <button
            onClick={fetchOwnerRequests}
            className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && petGroups.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-cyan-100 shadow-sm space-y-3">
          <Inbox className="mx-auto h-12 w-12 text-cyan-400" />
          <h3 className="text-lg font-bold text-cyan-800">No Requests Received</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            You haven't received any purchase or adoption requests for your pets yet.
          </p>
        </div>
      )}

      {/* Grouped Pet Requests List */}
      {!loading && !error && petGroups.length > 0 && (
        <div className="space-y-8">
          {petGroups.map((group, idx) => {
            const pet = group.pet;
            const isPetAvailable = pet && typeof pet === "object";
            const petName = isPetAvailable
              ? pet.basicInfo?.name || pet.breed || pet.type || "Pet"
              : "Listed Pet";
            const petImage = isPetAvailable
              ? pet.media?.coverPhoto?.url || pet.image?.url
              : null;
            const price = isPetAvailable ? pet.basicInfo?.price || pet.price || 0 : 0;
            const listingType = isPetAvailable
              ? pet.basicInfo?.listingType || (price > 0 ? "Sale" : "Adoption")
              : "Sale";

            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-cyan-100 shadow-md overflow-hidden space-y-4 p-5"
              >
                {/* Pet Header Section (Group Header: Bruno - ₹25,000 - 3 Requests) */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
                  <div className="flex items-center gap-3">
                    {petImage ? (
                      <img
                        src={petImage}
                        alt={petName}
                        className="w-14 h-14 object-cover rounded-xl border border-gray-200 shadow-sm"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                        <PawPrint className="w-7 h-7" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-extrabold text-cyan-950 flex items-center gap-2">
                        {petName}
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          listingType === "Sale" ? "bg-cyan-100 text-cyan-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {listingType === "Sale" ? "For Sale" : "For Adoption"}
                        </span>
                      </h3>
                      <p className="text-sm font-bold text-cyan-700 flex items-center mt-0.5">
                        <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                        {price.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="bg-cyan-50 px-3.5 py-1.5 rounded-xl border border-cyan-100 text-cyan-800 text-xs font-black flex items-center gap-1.5">
                    <Inbox className="w-4 h-4 text-cyan-600" />
                    {group.requests.length} {group.requests.length === 1 ? "Request" : "Requests"}
                  </div>
                </div>

                {/* Requester Cards List for this Pet */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  {group.requests.map((req) => {
                    const requester = req.requesterId || {};
                    const isProcessing = processingId === req._id;
                    const displayPaymentStatus =
                      req.requestStatus === "Rejected" ? "Refunded" : req.paymentStatus || "Paid";

                    return (
                      <div
                        key={req._id}
                        className="bg-gray-50/90 rounded-2xl border border-gray-200/80 p-4 space-y-3 flex flex-col justify-between hover:shadow-sm transition-shadow"
                      >
                        {/* Requester Summary */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-9 h-9 rounded-full bg-cyan-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                                {requester.name ? requester.name.charAt(0).toUpperCase() : "U"}
                              </div>
                              <div>
                                <h4 className="font-extrabold text-gray-900 text-sm leading-tight">
                                  {requester.name || "Anonymous User"}
                                </h4>
                                <span className="text-[10px] text-gray-400 font-semibold block">
                                  {new Date(req.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                            {getStatusBadge(req.requestStatus)}
                          </div>

                          {/* Payment & Fee Status */}
                          <div className="flex items-center justify-between text-xs pt-1 px-1">
                            <span className="text-gray-500 font-medium">Request Fee:</span>
                            <span className={`font-extrabold px-2 py-0.5 rounded text-[11px] ${
                              displayPaymentStatus === "Refunded"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}>
                              {displayPaymentStatus === "Refunded"
                                ? "Refunded"
                                : req.paymentVerified
                                ? "Fee Paid (Razorpay)"
                                : req.fakePayment
                                ? "Fee Paid (Test Mode)"
                                : "Fee Paid"}
                            </span>
                          </div>

                          {/* Buyer Reputation Badge */}
                          <div className="flex items-center justify-between text-xs px-1">
                            <span className="text-gray-500 font-medium">Buyer Rating:</span>
                            {(() => {
                              const buyerIdStr = requester._id || req.requesterId;
                              const buyerRep = buyerReputationMap[buyerIdStr];
                              return buyerRep && buyerRep.totalCount > 0 ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setViewingBuyerReviews({
                                      buyerName: requester.name || "Buyer",
                                      ...buyerRep,
                                    })
                                  }
                                  className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded text-[11px] font-black flex items-center gap-1 cursor-pointer transition"
                                >
                                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                  <span>{buyerRep.averageRating}</span>
                                  <span className="text-gray-500 font-semibold">
                                    ({buyerRep.totalCount} {buyerRep.totalCount === 1 ? "review" : "reviews"})
                                  </span>
                                </button>
                              ) : (
                                <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                  New Buyer — No reviews yet
                                </span>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Action Buttons: [View Profile] [Accept] [Reject] */}
                        <div className="space-y-2 pt-2 border-t border-gray-200/60">
                          <button
                            type="button"
                            onClick={() => setSelectedRequester(requester)}
                            className="w-full py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-gray-500" /> View Profile
                          </button>

                          {req.requestStatus === "Accepted" && (
                            <div className="space-y-2">
                              <button
                                type="button"
                                onClick={() => navigate("/chat", { state: { conversationId: req.conversationId } })}
                                className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                              >
                                <MessageCircle className="w-4 h-4" /> Chat with Buyer
                              </button>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleReject(req._id)}
                                  disabled={isProcessing}
                                  className="w-1/2 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5 text-rose-600" /> Reject & Refund
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmModalReq(req)}
                                  className="w-1/2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                                >
                                  <Sparkles className="w-3.5 h-3.5" /> {listingType === "Sale" ? "Mark Sold" : "Mark Adopted"}
                                </button>
                              </div>
                            </div>
                          )}

                          {req.requestStatus === "Completed" && (
                            ownerReviewedMap[req._id] ? (
                              <div className="w-full py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Review Submitted
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setReviewModalReq(req)}
                                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                              >
                                <Star className="w-3.5 h-3.5 fill-white" /> Rate Buyer
                              </button>
                            )
                          )}

                          {req.requestStatus === "Pending" && (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleReject(req._id)}
                                disabled={isProcessing}
                                className="w-1/2 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5 text-rose-600" /> Reject & Refund
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAccept(req._id)}
                                disabled={isProcessing}
                                className="w-1/2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 shadow-sm disabled:opacity-50 cursor-pointer"
                              >
                                {isProcessing ? (
                                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <>
                                    <Check className="w-3.5 h-3.5" /> Accept Request
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REQUESTER PROFILE MODAL */}
      {selectedRequester && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative border border-gray-100 animate-fadeIn">
            <button
              onClick={() => setSelectedRequester(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b pb-4">
              <div className="w-12 h-12 rounded-full bg-cyan-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                {selectedRequester.name ? selectedRequester.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">{selectedRequester.name || "Requester Profile"}</h3>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified User
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <span className="text-gray-400 font-bold uppercase text-[10px]">Email Contact</span>
                <p className="font-extrabold text-gray-800 flex items-center gap-1.5 text-sm">
                  <Mail className="w-4 h-4 text-cyan-600" /> {selectedRequester.email || "Email Verified"}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <span className="text-gray-400 font-bold uppercase text-[10px]">Mobile Contact</span>
                <p className="font-extrabold text-gray-800 flex items-center gap-1.5 text-sm">
                  <Phone className="w-4 h-4 text-cyan-600" /> {selectedRequester.mobile || "Not specified"}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <span className="text-gray-400 font-bold uppercase text-[10px]">Registered Address</span>
                <p className="font-extrabold text-gray-800 flex items-center gap-1.5 text-sm">
                  <MapPin className="w-4 h-4 text-cyan-600" /> {selectedRequester.address || "Address Verified"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedRequester(null)}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold rounded-xl text-xs transition"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR MARKING AS SOLD / ADOPTED */}
      {confirmModalReq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative border border-gray-100 animate-fadeIn text-center">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-gray-900">
                Mark as {confirmModalReq.listingType === "Sale" ? "Sold" : "Adopted"}?
              </h3>
              <p className="text-xs text-gray-600 font-medium leading-relaxed">
                Are you sure you want to mark this pet as <strong>{confirmModalReq.listingType === "Sale" ? "sold" : "adopted"}</strong>?
                <br />
                This will remove the listing from the active marketplace.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalReq(null)}
                disabled={processingId === confirmModalReq._id}
                className="w-1/2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleComplete(confirmModalReq._id)}
                disabled={processingId === confirmModalReq._id}
                className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs transition flex items-center justify-center gap-1 shadow-md cursor-pointer disabled:opacity-50"
              >
                {processingId === confirmModalReq._id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW MODAL FOR RATING BUYER */}
      <ReviewModal
        isOpen={Boolean(reviewModalReq)}
        onClose={() => setReviewModalReq(null)}
        petRequest={reviewModalReq}
        targetRole="Buyer"
        onSuccess={() => {
          if (reviewModalReq) {
            setOwnerReviewedMap((prev) => ({ ...prev, [reviewModalReq._id]: true }));
          }
        }}
      />

      {/* BUYER REVIEWS LIGHTBOX MODAL */}
      {viewingBuyerReviews && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative border border-gray-100 animate-fadeIn max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-xl font-black text-gray-900">
                  Buyer Reviews — {viewingBuyerReviews.buyerName}
                </h3>
                <p className="text-xs text-gray-500 font-semibold">
                  Overall Rating: <strong className="text-amber-600">⭐ {viewingBuyerReviews.averageRating} / 5.0</strong> ({viewingBuyerReviews.totalCount} Verified Owner Reviews)
                </p>
              </div>
              <button
                onClick={() => setViewingBuyerReviews(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {viewingBuyerReviews.reviews?.map((rev) => (
                <div key={rev._id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${s <= rev.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
                        />
                      ))}
                      <span className="text-xs font-black text-gray-800 ml-1">{rev.rating}.0</span>
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-gray-700 font-medium italic leading-relaxed">
                    "{rev.comment || "Responsible and reliable buyer!"}"
                  </p>

                  <div className="text-[11px] text-gray-500 font-bold flex items-center justify-between pt-1 border-t border-gray-200/60">
                    <span>— {rev.reviewerId?.name || "Verified Pet Owner"}</span>
                    {rev.petId?.breed && <span className="text-cyan-700">{rev.petId.breed}</span>}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setViewingBuyerReviews(null)}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold rounded-xl text-xs transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerPetRequestsManager;
