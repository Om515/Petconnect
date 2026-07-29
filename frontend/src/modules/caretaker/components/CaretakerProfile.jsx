import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthData } from "../../../context/AuthContext";
import {
  User,
  Mail,
  Phone,
  Clock,
  DollarSign,
  Award,
  PlusCircle,
  BarChart3,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Users,
  Star,
  Lock,
  RefreshCw
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

const CaretakerProfile = () => {
  const { user, isAuthenticated: isAuth } = AuthData();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingRequest, setUpdatingRequest] = useState(null);

  useEffect(() => {
    if (!isAuth) {
      navigate("/login");
      return;
    }

    fetchProfile();
  }, [isAuth, navigate]);

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

  const handleRequestAction = async (requestId, status) => {
    try {
      setUpdatingRequest(requestId);
      const response = await axios.post(
        "/api/caretaker/booking-request/status",
        { requestId, status },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchProfile(); // Refresh profile & automatic statistics
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
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12 bg-slate-50 min-h-screen">
        <h3 className="text-xl font-medium text-teal-700">Profile not found</h3>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-md font-bold"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const stats = profile.stats || {};

  return (
    <div className="max-w-5xl mx-auto p-4 py-8 bg-slate-50 min-h-screen space-y-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-2xl shadow-md">
                <User className="w-8 h-8 text-teal-600" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold">{profile.name}</h1>
                <p className="text-teal-100 text-sm">{profile.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate("/caretaker/professional-profile")}
                className="flex items-center space-x-2 bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2.5 rounded-xl shadow-md font-extrabold transition text-sm"
              >
                <PlusCircle size={18} />
                <span>Complete Professional Showcase Profile</span>
              </button>
              {!profile.hasApplication && (
                <button
                  onClick={() => navigate("/apply")}
                  className="flex items-center space-x-2 bg-white text-teal-700 hover:bg-teal-50 px-4 py-2.5 rounded-xl shadow-md font-bold transition text-sm"
                >
                  <PlusCircle size={18} />
                  <span>Apply as Caretaker</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Read-Only Automatic Statistics Section */}
        <div className="p-6 bg-slate-50/70 border-b border-slate-200 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <BarChart3 className="text-teal-600" size={20} />
              <h2 className="text-lg font-extrabold text-slate-900">Automatic Performance Statistics</h2>
              <span className="px-2.5 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-extrabold uppercase rounded-full flex items-center gap-1">
                <Lock size={10} /> Auto-Generated / Read-Only
              </span>
            </div>
            <button
              onClick={fetchProfile}
              className="text-xs text-teal-700 font-bold hover:text-teal-900 flex items-center gap-1"
            >
              <RefreshCw size={12} /> Sync Live Data
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <StatCard label="Completed Bookings" value={stats.completedBookings || 0} icon={<CheckCircle2 className="text-emerald-500" size={18} />} />
            <StatCard label="Pending Bookings" value={stats.pendingBookings || 0} icon={<Clock className="text-amber-500" size={18} />} />
            <StatCard label="Accepted Bookings" value={stats.acceptedBookings || 0} icon={<CheckCircle2 className="text-teal-500" size={18} />} />
            <StatCard label="Cancelled Bookings" value={stats.cancelledBookings || 0} icon={<XCircle className="text-rose-500" size={18} />} />
            <StatCard label="Response Rate" value={stats.responseRate || "100%"} icon={<TrendingUp className="text-indigo-500" size={18} />} highlight />
            <StatCard label="Acceptance Rate" value={stats.acceptanceRate || "100%"} icon={<TrendingUp className="text-cyan-500" size={18} />} highlight />
            <StatCard label="Average Rating" value={`★ ${stats.averageRating || 4.9}`} icon={<Star className="text-amber-400" size={18} />} />
            <StatCard label="Total Reviews" value={stats.totalReviews || 12} icon={<Award className="text-purple-500" size={18} />} />
            <StatCard label="Repeat Customers" value={stats.repeatCustomers || 0} icon={<Users className="text-blue-500" size={18} />} />
            <StatCard label="Users Helped" value={stats.usersHelped || 0} icon={<Users className="text-teal-600" size={18} />} />
            <StatCard label="Years Active" value={stats.yearsActive || "1 Year"} icon={<Award className="text-emerald-600" size={18} />} />
          </div>
        </div>

        {/* Profile Details Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold border-b pb-2 text-slate-800">Personal Information</h2>
            <InfoItem icon={<User className="text-teal-600" />} label="Full Name" value={profile.name} />
            <InfoItem icon={<Mail className="text-teal-600" />} label="Email" value={profile.email} />
            <InfoItem icon={<Phone className="text-teal-600" />} label="Mobile" value={profile.mobile} />
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold border-b pb-2 text-slate-800">Professional Information</h2>
            <InfoItem
              icon={<Award className="text-teal-600" />}
              label="Experience"
              value={profile.experience ? `${profile.experience} years` : "Not provided"}
            />
            <InfoItem
              icon={<Clock className="text-teal-600" />}
              label="Availability"
              value={profile.availability}
            />
            <InfoItem
              icon={<DollarSign className="text-teal-600" />}
              label="Base Hourly Rate"
              value={profile.hourlyRate ? `$${profile.hourlyRate}/hr` : "Not provided"}
            />
            {profile.skills?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-slate-100 text-slate-800 font-semibold px-3 py-1 rounded-lg text-xs border"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Booking Requests Management */}
        <div className="px-6 pb-6">
          <h3 className="font-extrabold mb-4 text-xl text-slate-900">Manage Booking Requests</h3>
          {profile.bookingRequests?.length > 0 ? (
            <div className="space-y-4">
              {profile.bookingRequests.map((request) => (
                <div
                  key={request._id}
                  className="bg-slate-50 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border border-slate-200 shadow-xs"
                >
                  <div className="mb-4 sm:mb-0 space-y-1">
                    <p className="font-bold text-slate-900 text-base">
                      {request.user?.name || "Pet Owner"} — <span className="text-teal-700">{request.service}</span>
                    </p>
                    <p className="text-xs text-slate-600">
                      Date: <span className="font-semibold text-slate-800">{new Date(request.date).toLocaleDateString()}</span> • Hours: {request.hours}
                    </p>
                    <p className="text-xs font-extrabold text-teal-700">Total: ${request.totalCost}</p>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold capitalize ${
                        request.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : request.status === "accepted"
                          ? "bg-emerald-100 text-emerald-800"
                          : request.status === "rejected"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      Status: {request.status}
                    </span>
                  </div>
                  {request.status === "pending" && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRequestAction(request._id, "accepted")}
                        disabled={updatingRequest === request._id}
                        className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition"
                      >
                        {updatingRequest === request._id ? "Processing..." : "Accept Request"}
                      </button>
                      <button
                        onClick={() => handleRequestAction(request._id, "rejected")}
                        disabled={updatingRequest === request._id}
                        className="px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-700 disabled:opacity-50 transition"
                      >
                        {updatingRequest === request._id ? "Processing..." : "Reject"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm bg-slate-50 p-4 rounded-xl border">No booking requests received yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, highlight }) => (
  <div className={`p-3.5 rounded-xl border ${highlight ? "bg-teal-50/70 border-teal-200" : "bg-white border-slate-200"} flex items-center space-x-3`}>
    <div className="p-2 bg-slate-100 rounded-lg">{icon}</div>
    <div>
      <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">{label}</span>
      <span className="text-base font-extrabold text-slate-900 block leading-tight">{value}</span>
    </div>
  </div>
);

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start space-x-3">
    <div className="mt-1">{icon}</div>
    <div>
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</h3>
      <p className="text-slate-800 font-semibold text-sm">{value || "Not provided"}</p>
    </div>
  </div>
);

export default CaretakerProfile;