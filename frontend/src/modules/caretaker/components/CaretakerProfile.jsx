import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CaretakerData } from "../context/CaretakerContext";
import {
  User,
  Mail,
  Phone,
  Clock,
  DollarSign,
  Award,
  PlusCircle,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

const CaretakerProfile = () => {
  const { user, isAuth } = CaretakerData();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingRequest, setUpdatingRequest] = useState(null); // Track which request is being updated

  useEffect(() => {
    if (!isAuth) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/caretaker/myinfo", {
          withCredentials: true,
        });

        if (response.data.success) {
          setProfile(response.data.user);
        } else {
          toast.error("Failed to load profile");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Error loading profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuth, navigate]);

  const handleRequestAction = async (requestId, status) => {
    try {
      setUpdatingRequest(requestId); // Show loading state for this request
      const response = await axios.post(
        "/api/caretaker/booking-request/status",
        { requestId, status },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        // Refresh profile data
        const updatedProfile = await axios.get("/api/caretaker/myinfo", {
          withCredentials: true,
        });
        if (updatedProfile.data.success) {
          setProfile(updatedProfile.data.user);
        }
      } else {
        toast.error("Failed to update request");
      }
    } catch (error) {
      console.error("Error updating request:", error);
      toast.error("Error updating request");
    } finally {
      setUpdatingRequest(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-teal-50 to-cyan-100 min-h-screen">
        <h3 className="text-xl font-medium text-teal-700">Profile not found</h3>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 shadow-md"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 py-6 bg-gradient-to-br from-teal-50 to-cyan-100 min-h-screen">
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-teal-100">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-2 rounded-full shadow-md">
                <User className="w-8 h-8 text-teal-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <p className="text-teal-50">{profile.email}</p>
              </div>
            </div>
            {!profile.hasApplication && (
              <button
                onClick={() => navigate("/apply")}
                className="flex items-center space-x-2 bg-white text-teal-600 px-4 py-2 rounded-lg hover:bg-teal-50 shadow-md font-medium transition"
              >
                <PlusCircle size={18} />
                <span>Apply as Caretaker</span>
              </button>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b border-teal-100 pb-2 text-teal-700">
              Personal Information
            </h2>
            <InfoItem icon={<User className="text-teal-500" />} label="Full Name" value={profile.name} />
            <InfoItem icon={<Mail className="text-teal-500" />} label="Email" value={profile.email} />
            <InfoItem icon={<Phone className="text-teal-500" />} label="Mobile" value={profile.mobile} />
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b border-teal-100 pb-2 text-teal-700">
              Professional Information
            </h2>
            <InfoItem
              icon={<Award className="text-teal-500" />}
              label="Experience"
              value={profile.experience ? `${profile.experience} years` : "Not provided"}
            />
            <InfoItem
              icon={<Clock className="text-teal-500" />}
              label="Availability"
              value={profile.availability}
            />
            <InfoItem
              icon={<DollarSign className="text-teal-500" />}
              label="Hourly Rate"
              value={profile.hourlyRate ? `$${profile.hourlyRate}/hr` : "Not provided"}
            />
            {profile.skills?.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-teal-700">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm border border-teal-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {profile.description && (
          <div className="px-6 pb-6">
            <h3 className="font-semibold mb-2 text-teal-700">About Me</h3>
            <p className="text-gray-700 whitespace-pre-line bg-teal-50 p-4 rounded-lg border border-teal-100">{profile.description}</p>
          </div>
        )}

        {/* Booking Requests */}
        <div className="px-6 pb-6">
          <h3 className="font-semibold mb-4 text-xl text-teal-700">Booking Requests</h3>
          {profile.bookingRequests?.length > 0 ? (
            <div className="space-y-4">
              {profile.bookingRequests.map((request) => (
                <div
                  key={request._id}
                  className="bg-teal-50 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border border-teal-100 shadow-sm"
                >
                  <div className="mb-4 sm:mb-0">
                    <p className="font-medium text-teal-700">
                      {request.user?.name || "Unknown User"} - {request.service}
                    </p>
                    <p className="text-gray-600">
                      Date: {new Date(request.date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">Hours: {request.hours}</p>
                    <p className="text-gray-600">Total: ${request.totalCost}</p>
                    <p
                      className={`capitalize font-medium ${
                        request.status === "pending"
                          ? "text-yellow-600"
                          : request.status === "accepted"
                          ? "text-green-600"
                          : request.status === "rejected"
                          ? "text-red-600"
                          : "text-blue-600"
                      }`}
                    >
                      Status: {request.status}
                    </p>
                  </div>
                  {request.status === "pending" && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRequestAction(request._id, "accepted")}
                        disabled={updatingRequest === request._id}
                        className={`px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-teal-300 disabled:cursor-not-allowed shadow-sm transition`}
                      >
                        {updatingRequest === request._id ? "Processing..." : "Accept"}
                      </button>
                      <button
                        onClick={() => handleRequestAction(request._id, "rejected")}
                        disabled={updatingRequest === request._id}
                        className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed shadow-sm transition`}
                      >
                        {updatingRequest === request._id ? "Processing..." : "Reject"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 bg-teal-50 p-4 rounded-lg border border-teal-100">No booking requests yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start space-x-3">
    <div className="mt-1">{icon}</div>
    <div>
      <h3 className="text-sm text-teal-600">{label}</h3>
      <p className="text-gray-800 font-medium">{value || "Not provided"}</p>
    </div>
  </div>
);

export default CaretakerProfile;