import { useEffect, useState } from "react";
import axios from "axios";
import {
  User,
  CircleDollarSign,
  ShoppingBag,
  Edit,
  DollarSign,
  Calendar,
  Tag,
  Check,
  Eye,
  MessageCircle,
  MapPin,
  FileText,
  Inbox,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import EditProfileModal from "./EditProfileModal";
import EditAddressModal from "./EditAddressModal";
import SetPasswordModal from "./SetPasswordModal";
import OwnerPetRequestsManager from "../components/OwnerPetRequestsManager";
import UserPetRequests from "./UserPetRequests";
import toast from "react-hot-toast";

export default function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [userReviews, setUserReviews] = useState({
    averageRating: 0,
    totalCount: 0,
    reviews: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData?._id) {
      axios
        .get(`/api/user/reviews/owner/${userData._id}`)
        .then((res) => {
          if (res.data.success && res.data.totalCount > 0) {
            setUserReviews({
              averageRating: res.data.averageRating,
              totalCount: res.data.totalCount,
              reviews: res.data.reviews,
            });
          } else {
            axios.get(`/api/user/reviews/buyer/${userData._id}`).then((bRes) => {
              if (bRes.data.success) {
                setUserReviews({
                  averageRating: bRes.data.averageRating,
                  totalCount: bRes.data.totalCount,
                  reviews: bRes.data.reviews,
                });
              }
            });
          }
        })
        .catch((e) => console.error(e));
    }
  }, [userData]);

  const fetchUserData = () => {
    setLoading(true);
    Promise.all([
      axios.get("/api/user/user-profile"),
      axios.get("/api/caretaker/my-applications").catch(() => ({ data: { success: false, applications: [] } }))
    ])
      .then(([profileRes, appRes]) => {
        setUserData(profileRes.data);
        if (appRes.data?.success && appRes.data.applications?.length > 0) {
          // Get the latest application status
          const latest = appRes.data.applications[appRes.data.applications.length - 1];
          setApplicationStatus(latest.status); // "pending", "approved", or "rejected"
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        setLoading(false);
      });
  };

  const handleProfileUpdate = (updatedUser) => {
    setUserData(prev => ({
      ...prev,
      user: updatedUser
    }));
  };

  const handleAddressUpdate = (newAddress) => {
    setUserData(prev => ({
      ...prev,
      user: {
        ...prev.user,
        address: newAddress
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-cyan-300 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-cyan-300 rounded mb-2"></div>
          <div className="h-4 w-24 bg-cyan-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (!userData?.success) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600">
          Unable to load your profile. Please try again later.
        </p>
        <button
          onClick={fetchUserData}
          className="mt-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const { user, myPetDetails, buyPetDetails } = userData;

  return (
    <div className="container mx-auto my-10 p-4 max-w-6xl">
      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleProfileUpdate}
        />
      )}

      {showAddressModal && (
        <EditAddressModal
          address={user.address}
          onClose={() => setShowAddressModal(false)}
          onUpdate={handleAddressUpdate}
        />
      )}

      {showSetPasswordModal && (
        <SetPasswordModal
          onClose={() => setShowSetPasswordModal(false)}
        />
      )}

      <div className="bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-t-lg p-6 text-white">
        <h1 className="text-3xl font-bold">Welcome, {user.name}!</h1>
        <p className="opacity-80">Manage your profile and pets</p>
      </div>

      <div className="bg-white rounded-b-lg shadow-lg">
        {/* Tab Navigation */}
        <div className="flex border-b overflow-x-auto">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center px-6 py-4 border-b-2 font-medium ${activeTab === "profile"
                ? "border-cyan-500 text-cyan-500"
                : "border-transparent hover:text-gray-700"
              }`}
          >
            <User className="mr-2 h-5 w-5" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab("selling")}
            className={`flex items-center px-6 py-4 border-b-2 font-medium ${activeTab === "selling"
                ? "border-cyan-500 text-cyan-500"
                : "border-transparent hover:text-gray-700"
              }`}
          >
            <CircleDollarSign className="mr-2 h-5 w-5" />
            My Listings
            <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {myPetDetails.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("purchased")}
            className={`flex items-center px-6 py-4 border-b-2 font-medium ${activeTab === "purchased"
                ? "border-cyan-500 text-cyan-500"
                : "border-transparent hover:text-gray-700"
              }`}
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            Purchased
            <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {buyPetDetails.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex items-center px-6 py-4 border-b-2 font-medium ${activeTab === "requests"
                ? "border-cyan-500 text-cyan-500"
                : "border-transparent hover:text-gray-700"
              }`}
          >
            <Inbox className="mr-2 h-5 w-5 text-cyan-500" />
            Incoming Requests
          </button>
          <button
            onClick={() => setActiveTab("my-requests")}
            className={`flex items-center px-6 py-4 border-b-2 font-medium ${activeTab === "my-requests"
                ? "border-cyan-500 text-cyan-500"
                : "border-transparent hover:text-gray-700"
              }`}
          >
            <FileText className="mr-2 h-5 w-5 text-cyan-500" />
            My Pet Requests
          </button>
        </div>

        {/* Content based on active tab */}
        <div className="p-6 bg-cyan-50">
          {activeTab === "requests" && (
            <OwnerPetRequestsManager />
          )}

          {activeTab === "my-requests" && (
            <UserPetRequests />
          )}

          {activeTab === "profile" && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-cyan-100">
                <h2 className="text-xl font-semibold mb-4 text-cyan-800">
                  Personal Information
                </h2>
                <div className="space-y-3">
                  <div className="flex">
                    <span className="font-medium w-24 text-cyan-700">
                      Name:
                    </span>
                    <span>{user.name}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-24 text-cyan-700">
                      Email:
                    </span>
                    <span>{user.email}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-24 text-cyan-700">
                      Mobile:
                    </span>
                    <span>{user.mobile || "Not specified."}</span>
                  </div>
                </div>

                {user.authProvider === 'google' && (
                  <button
                    onClick={() => setShowSetPasswordModal(true)}
                    className="mt-6 w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 text-sm font-medium transition duration-200 shadow-md flex items-center justify-center cursor-pointer"
                  >
                    Create Email Password
                  </button>
                )}
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-cyan-100">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-cyan-800">
                    Address
                  </h2>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-lg hover:bg-cyan-200 text-sm flex items-center"
                  >
                    <MapPin className="w-4 h-4 mr-1" /> Edit
                  </button>
                </div>
                <p className="whitespace-pre-line">
                  {user.address || "No address added yet."}
                </p>
              </div>

              {/* User Reputation & Verified Reviews Card */}
              <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-cyan-100 space-y-4">
                <div className="flex items-center justify-between border-b border-cyan-100 pb-3">
                  <h2 className="text-xl font-semibold text-cyan-800 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Platform Reputation & Reviews
                  </h2>
                  {userReviews.totalCount > 0 ? (
                    <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full text-xs font-bold">
                      ⭐ {userReviews.averageRating} ({userReviews.totalCount} {userReviews.totalCount === 1 ? "review" : "reviews"})
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                      No reviews yet
                    </span>
                  )}
                </div>

                {userReviews.totalCount > 0 ? (
                  <div className="space-y-3">
                    {userReviews.reviews.map((rev) => (
                      <div key={rev._id} className="p-4 bg-cyan-50/40 rounded-xl border border-cyan-100 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${s <= rev.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
                              />
                            ))}
                            <span className="text-xs font-bold text-gray-800 ml-1">{rev.rating}.0</span>
                          </div>
                          <span className="text-[11px] text-gray-400 font-medium">
                            {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 font-medium italic">
                          "{rev.comment || "Great experience!"}"
                        </p>
                        <div className="text-[11px] text-gray-500 font-bold flex justify-between items-center pt-1 border-t border-cyan-100/60">
                          <span>— {rev.reviewerId?.name || "PetConnect User"}</span>
                          {rev.petId?.breed && <span className="text-cyan-700">{rev.petId.breed}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">
                    Complete transaction pet requests on PetConnect to receive verified reviews from buyers and owners!
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-6 py-3 w-full justify-center bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition duration-200 flex items-center shadow-sm"
                >
                  <Edit className="w-5 h-5 mr-2" /> Edit Profile
                </button>
              </div>

              {/* Promotional Box for Caretaker Upgrade */}
              {user.role === 'user' && (
                <div className="md:col-span-2 mt-4 bg-gradient-to-r from-orange-400 to-amber-500 p-6 rounded-lg shadow-md text-white flex flex-col md:flex-row items-center justify-between transition-transform transform">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Become a Caretaker!</h3>
                    <p className="opacity-90">Start earning by helping pet owners in your area with their furry friends.</p>
                  </div>
                  <div className="mt-4 md:mt-0 flex-shrink-0">
                    {!applicationStatus ? (
                      <button onClick={() => navigate("/apply-caretaker")} className="px-6 py-2 bg-white text-orange-600 font-bold rounded-full shadow hover:bg-orange-50 transition cursor-pointer">
                        Apply Now
                      </button>
                    ) : applicationStatus === "pending" ? (
                      <span className="px-6 py-2 bg-white/20 border border-white font-bold rounded-full text-white cursor-not-allowed">
                        Application Pending
                      </span>
                    ) : applicationStatus === "rejected" ? (
                      <button onClick={() => navigate("/apply-caretaker")} className="px-6 py-2 bg-red-600 border border-white text-white font-bold rounded-full shadow hover:bg-red-700 transition cursor-pointer">
                        Rejected - Apply Again
                      </button>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "selling" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-cyan-800">
                  My Pets for Sale
                </h2>
                <button
                  onClick={() => navigate("/sell-pet")}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition duration-200 flex items-center"
                >
                  <span className="mr-1">+</span> Add New Pet
                </button>
              </div>

              {myPetDetails.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-cyan-100 shadow-sm">
                  <ShoppingBag className="mx-auto h-12 w-12 text-cyan-400" />
                  <h3 className="mt-4 text-lg font-medium text-cyan-800">
                    No Pets Listed
                  </h3>
                  <p className="mt-2 text-gray-500">
                    Get started by adding a pet for sale.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myPetDetails.map((pet) => (
                    <div
                      key={pet._id}
                      className="bg-white border border-cyan-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="relative">
                        <img
                          src={pet.image.url}
                          alt={pet.breed}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-0 left-0 m-3 bg-cyan-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                          {pet.type}
                        </div>
                        {pet.soldBool && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="px-3 py-1 bg-red-500 text-white font-medium rounded-lg flex items-center">
                              <Check className="w-4 h-4 mr-1" /> Sold
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-bold text-cyan-800">
                            {pet.breed}
                          </h3>
                          <span className="bg-green-50 text-green-700 px-2 py-1 rounded-lg flex items-center text-sm font-semibold">
                            <DollarSign className="w-4 h-4 mr-1" />₹
                            {pet.price.toLocaleString()}
                          </span>
                        </div>

                        <div className="mt-3 space-y-2">
                          <div className="flex items-center text-gray-700">
                            <Calendar className="w-4 h-4 mr-2 text-cyan-500" />
                            <span className="text-sm">{pet.age} years old</span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <Tag className="w-4 h-4 mr-2 text-cyan-500" />
                            <span className="text-sm">Status: </span>
                            <span
                              className={`ml-1 text-sm font-medium ${pet.soldBool ? "text-red-600" : "text-green-600"
                                }`}
                            >
                              {pet.soldBool ? "Sold" : "Available"}
                            </span>
                          </div>
                        </div>

                        <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                          {pet.description || "No description available."}
                        </p>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <button
                            onClick={async () => {
                              try {
                                const response = await axios.delete(
                                  "/api/user/delete-pet",
                                  {
                                    data: { id: pet._id },
                                  }
                                );

                                if (response.data.success) {
                                  toast.success(response.data.message);
                                  setTimeout(() => {
                                    window.location.reload();
                                  }, 1000); // add 1s delay before reload
                                } else {
                                  toast.error(
                                    response.data.message ||
                                    "Failed to delete pet."
                                  );
                                }
                              } catch (error) {
                                console.error("Error deleting pet:", error);
                                toast.error("Something went wrong!");
                              }
                            }}
                            className="px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium flex items-center justify-center"
                          >
                            <Edit className="w-4 h-4 mr-1" /> Delete
                          </button>

                          <button
                            onClick={() => navigate(`/view-pet/${pet._id}`)}
                            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium flex items-center justify-center"
                          >
                            <Eye className="w-4 h-4 mr-1" /> View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "purchased" && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-cyan-800">
                Pets I Purchased
              </h2>

              {buyPetDetails.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-cyan-100 shadow-sm">
                  <ShoppingBag className="mx-auto h-12 w-12 text-cyan-400" />
                  <h3 className="mt-4 text-lg font-medium text-cyan-800">
                    No purchases yet
                  </h3>
                  <p className="mt-2 text-gray-500">
                    Find your perfect pet from our marketplace.
                  </p>
                  <button
                    onClick={() => navigate("/buy-pet")}
                    className="mt-4 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition duration-200"
                  >
                    Browse Pets
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {buyPetDetails.map((pet) => (
                    <div
                      key={pet._id}
                      className="bg-white border border-cyan-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="relative">
                        <img
                          src={pet.image.url}
                          alt={pet.breed}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-0 left-0 m-3 bg-cyan-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                          {pet.type}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-bold text-cyan-800">
                            {pet.breed}
                          </h3>
                          <span className="bg-green-50 text-green-700 px-2 py-1 rounded-lg flex items-center text-sm font-semibold">
                            <DollarSign className="w-4 h-4 mr-1" />₹
                            {pet.price.toLocaleString()}
                          </span>
                        </div>

                        <div className="mt-3 space-y-2">
                          <div className="flex items-center text-gray-700">
                            <Calendar className="w-4 h-4 mr-2 text-cyan-500" />
                            <span className="text-sm">{pet.age} years old</span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <Tag className="w-4 h-4 mr-2 text-cyan-500" />
                            <span className="text-sm">Status: </span>
                            <span className="ml-1 text-sm font-medium text-cyan-600">
                              Purchased
                            </span>
                          </div>
                        </div>

                        <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                          {pet.description || "No description available."}
                        </p>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <button
                            onClick={() => navigate(`/view-pet/${pet._id}`)}
                            className="px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium flex items-center justify-center"
                          >
                            <Eye className="w-4 h-4 mr-1" /> View Details
                          </button>
                          <button className="px-3 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium flex items-center justify-center">
                            <MessageCircle className="w-4 h-4 mr-1" /> Contact
                            Seller
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}