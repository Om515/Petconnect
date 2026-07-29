import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  CheckCircle2,
  XCircle,
  Clock,
  User,
  ShieldAlert,
  Briefcase,
  Home,
  Award,
  Sparkles,
  MapPin,
  Calendar,
  Eye,
  ArrowLeft,
  Camera,
  Globe,
  DollarSign,
  ShieldCheck,
  Check
} from "lucide-react";

const AdminProfileReview = () => {
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null); // Selected caretaker profile for detailed preview
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectionModal, setRejectionModal] = useState({ open: false, profileId: null, reason: "" });
  const [activePreviewTab, setActivePreviewTab] = useState("pending"); // "pending" | "approved"

  useEffect(() => {
    fetchPendingProfiles();
  }, []);

  const fetchPendingProfiles = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/caretaker-profiles/pending", { withCredentials: true });
      if (res.data.success) {
        setPendingList(res.data.pendingProfiles || []);
        // Automatically select first pending item if available and none selected
        if (res.data.pendingProfiles?.length > 0 && !selectedItem) {
          setSelectedItem(res.data.pendingProfiles[0]);
        }
      } else {
        toast.error("Failed to load pending profile submissions");
      }
    } catch (err) {
      console.error("Error fetching pending profile applications:", err);
      toast.error("Error loading pending profile submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (profileId) => {
    try {
      setActionLoading(profileId);
      const res = await axios.post(
        "/api/admin/caretaker-profiles/approve",
        { profileId },
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success("Caretaker profile approved! Changes are now live for public users.");
        setSelectedItem(null);
        fetchPendingProfiles();
      } else {
        toast.error(res.data.message || "Approval failed");
      }
    } catch (err) {
      console.error("Error approving profile:", err);
      toast.error("Error approving profile");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectionModal.profileId) return;
    try {
      setActionLoading(rejectionModal.profileId);
      const res = await axios.post(
        "/api/admin/caretaker-profiles/reject",
        {
          profileId: rejectionModal.profileId,
          rejectionReason: rejectionModal.reason
        },
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success("Profile update rejected and feedback sent to caretaker.");
        setRejectionModal({ open: false, profileId: null, reason: "" });
        setSelectedItem(null);
        fetchPendingProfiles();
      } else {
        toast.error(res.data.message || "Rejection failed");
      }
    } catch (err) {
      console.error("Error rejecting profile:", err);
      toast.error("Error rejecting profile");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200 gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="text-amber-500" /> Caretaker Professional Profile Reviews
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Review and verify submitted caretaker profiles. Approving replaces the live public profile; rejecting requests edits while preserving live profiles.
            </p>
          </div>
          <span className="px-4 py-2 bg-amber-100 text-amber-900 font-extrabold rounded-full text-xs uppercase tracking-wider border border-amber-300">
            {pendingList.length} Pending Review
          </span>
        </div>

        {pendingList.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border shadow-sm space-y-3">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            <h3 className="text-xl font-bold text-slate-800">All Submissions Reviewed</h3>
            <p className="text-slate-500 max-w-md mx-auto text-sm">
              There are currently no caretaker professional profile submissions waiting for admin review.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Sidebar: Pending List Table/Cards (4 Cols) */}
            <div className="lg:col-span-4 bg-white rounded-2xl border shadow-sm p-4 space-y-3">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-2">
                Submissions Queue ({pendingList.length})
              </h2>

              <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
                {pendingList.map((item) => {
                  const isSelected = selectedItem?.pending?._id === item.pending._id;
                  const profile = item.pending;
                  const caretaker = item.caretaker;

                  return (
                    <div
                      key={profile._id}
                      onClick={() => setSelectedItem(item)}
                      className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-teal-50 border-teal-500 ring-2 ring-teal-500/20 shadow-sm"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-11 h-11 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden border">
                          {profile.profileImage ? (
                            <img src={profile.profileImage} alt={caretaker?.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-teal-600 text-white font-bold flex items-center justify-center text-lg">
                              {caretaker?.name?.[0] || "C"}
                            </div>
                          )}
                        </div>
                        <div className="truncate">
                          <h3 className="font-bold text-slate-900 text-sm truncate">{caretaker?.name}</h3>
                          <p className="text-xs text-slate-500 truncate">{profile.headline || profile.city || caretaker?.email}</p>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Submitted: {new Date(profile.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <Eye size={18} className={isSelected ? "text-teal-600" : "text-slate-400"} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Main Area: Full Exact Showcase Preview (8 Cols) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border shadow-xl overflow-hidden space-y-6">
              {selectedItem ? (
                <>
                  {/* Action Bar Header */}
                  <div className="bg-slate-900 text-white p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider rounded-full">
                          Pending Review
                        </span>
                        <span className="text-xs text-slate-400">Version {selectedItem.pending.version}</span>
                      </div>
                      <h2 className="text-xl font-bold mt-1">{selectedItem.caretaker?.name}</h2>
                      <p className="text-xs text-slate-400">
                        {selectedItem.caretaker?.email} • {selectedItem.caretaker?.mobile}
                      </p>
                    </div>

                    {/* Admin Action Buttons */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleApprove(selectedItem.pending._id)}
                        disabled={actionLoading === selectedItem.pending._id}
                        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow transition flex items-center gap-1.5 text-sm"
                      >
                        <CheckCircle2 size={18} />
                        <span>{actionLoading === selectedItem.pending._id ? "Approving..." : "Approve Profile"}</span>
                      </button>
                      <button
                        onClick={() => setRejectionModal({ open: true, profileId: selectedItem.pending._id, reason: "" })}
                        disabled={actionLoading === selectedItem.pending._id}
                        className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow transition flex items-center gap-1.5 text-sm"
                      >
                        <XCircle size={18} />
                        <span>Reject / Request Edits</span>
                      </button>
                    </div>
                  </div>

                  {/* Toggle View: Pending Submission vs Currently Live Approved Profile */}
                  {selectedItem.approved && (
                    <div className="px-6 flex border-b">
                      <button
                        onClick={() => setActivePreviewTab("pending")}
                        className={`px-4 py-2.5 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
                          activePreviewTab === "pending"
                            ? "border-amber-500 text-amber-700 bg-amber-50/50"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <Clock size={16} /> <span>Submitted Pending Changes</span>
                      </button>
                      <button
                        onClick={() => setActivePreviewTab("approved")}
                        className={`px-4 py-2.5 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
                          activePreviewTab === "approved"
                            ? "border-emerald-500 text-emerald-700 bg-emerald-50/50"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <CheckCircle2 size={16} /> <span>Currently Approved Profile</span>
                      </button>
                    </div>
                  )}

                  {/* EXACT Showcase Profile Display */}
                  <div className="px-6 pb-8">
                    <UserShowcaseView
                      profile={activePreviewTab === "approved" && selectedItem.approved ? selectedItem.approved : selectedItem.pending}
                      caretaker={selectedItem.caretaker}
                    />
                  </div>
                </>
              ) : (
                <div className="p-12 text-center text-slate-400">Select a caretaker profile from the list to preview.</div>
              )}
            </div>
          </div>
        )}

        {/* Rejection Feedback Modal */}
        {rejectionModal.open && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <ShieldAlert className="text-rose-600" /> Reject / Request Profile Edits
              </h3>
              <p className="text-slate-600 text-sm">
                State the reason for rejection. This feedback will be displayed on the caretaker's dashboard so they can revise and resubmit.
              </p>
              <textarea
                rows={4}
                placeholder="Specify what details need correction or enhancement..."
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 text-sm"
                value={rejectionModal.reason}
                onChange={(e) => setRejectionModal((prev) => ({ ...prev, reason: e.target.value }))}
              />
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setRejectionModal({ open: false, profileId: null, reason: "" })}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmit}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow text-sm"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Component that renders EVERY section EXACTLY how users will see it
const UserShowcaseView = ({ profile, caretaker }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden space-y-6">
      {/* Section 1: Banner & Profile Header */}
      <div className="relative h-48 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600">
        {profile.coverBanner && (
          <img src={profile.coverBanner} alt="Cover" className="w-full h-full object-cover opacity-40" />
        )}
        <div className="absolute -bottom-14 left-6 flex items-end space-x-4">
          <div className="h-28 w-28 rounded-2xl border-4 border-white bg-white overflow-hidden shadow-lg">
            {profile.profileImage ? (
              <img src={profile.profileImage} alt={caretaker?.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-teal-100 text-teal-700 font-bold text-3xl flex items-center justify-center">
                {caretaker?.name?.[0] || "C"}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-16 px-6 pb-6 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-2xl font-bold text-slate-900">{caretaker?.name}</h1>
          <p className="text-teal-700 font-semibold text-sm mt-0.5">{profile.headline || "Caregiver Professional Showcase"}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
            <span className="flex items-center gap-1 font-bold text-slate-700">
              <MapPin size={14} className="text-teal-600" /> {profile.city ? `${profile.city}, ${profile.state || ""}` : "Location"}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock size={14} className="text-teal-600" /> Responds {profile.responseTime || "Within 1 hour"}
            </span>
          </div>

          {/* Section 6: Trust Badges */}
          {profile.trustBadges?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {profile.trustBadges.map((badge, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-teal-50 text-teal-800 text-xs font-bold rounded-full border border-teal-200 flex items-center gap-1"
                >
                  <ShieldCheck size={14} className="text-teal-600" /> {badge}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: About Me */}
        <div className="space-y-2">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
            <Sparkles size={16} className="text-teal-600" /> Section 2: About Me
          </h3>
          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
            {profile.bio || "No detailed bio provided."}
          </p>
        </div>

        {/* Section 3: Professional Information */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Section 3: Professional Information</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-2.5 rounded-lg border">
              <span className="text-slate-400 block">Experience</span>
              <span className="font-bold text-slate-800">{profile.yearsOfExperience || 0} Years</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border">
              <span className="text-slate-400 block">Experience Count</span>
              <span className="font-bold text-slate-800">{profile.experienceCount || 0} Pets Cared For</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border">
              <span className="text-slate-400 block">Base Rate</span>
              <span className="font-bold text-teal-700">${profile.baseDailyRate || 0}/day</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border">
              <span className="text-slate-400 block">Languages</span>
              <span className="font-bold text-slate-800">{(profile.languages || ["English"]).join(", ")}</span>
            </div>
          </div>
        </div>

        {/* Section 4 & 12: Services Offered & Pricing */}
        {profile.services?.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
              <Briefcase size={16} className="text-teal-600" /> Sections 4 & 12: Services Offered & Pricing
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.services.map((svc, idx) => (
                <div key={idx} className="p-3.5 bg-teal-50/50 border border-teal-100 rounded-xl space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-sm">{svc.title}</span>
                    <span className="font-extrabold text-teal-700 text-sm">${svc.price} {svc.unit}</span>
                  </div>
                  {svc.description && <p className="text-xs text-slate-600">{svc.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 5: Availability Calendar */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1">
            <Calendar size={14} className="text-teal-600" /> Section 5: Availability Calendar & Schedule
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {(profile.availabilityDays || []).map((day, idx) => (
              <span key={idx} className="px-2.5 py-1 bg-white text-slate-700 font-semibold text-xs rounded-lg border shadow-sm">
                {day}
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-500 pt-1">
            Operating Hours: {profile.operatingHours?.start || "08:00"} - {profile.operatingHours?.end || "20:00"}
          </p>
        </div>

        {/* Section 6 & 7: Skills & Pet Types */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {profile.skills?.length > 0 && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Section 6: Caregiver Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((sk, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-white text-slate-800 text-xs rounded-md border">
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.acceptedPetTypes?.length > 0 && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Section 7: Accepted Pet Types</h4>
              <div className="flex flex-wrap gap-1.5">
                {profile.acceptedPetTypes.map((pt, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-teal-100 text-teal-800 font-bold text-xs rounded-md">
                    {pt}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 8: Experience Gallery */}
        {profile.gallery?.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
              <Camera size={16} className="text-teal-600" /> Section 8: Experience Showcase Gallery
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {profile.gallery.map((img, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden border bg-slate-100 relative group">
                  <img src={img.url} alt={img.caption || "Gallery"} className="w-full h-28 object-cover" />
                  {img.caption && (
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] p-1 truncate">
                      {img.caption}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 9 & 10: Safety Info & Home Environment */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1">
            <Home size={14} className="text-teal-600" /> Sections 9 & 10: Safety & Home Environment
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-white p-2.5 rounded-lg border text-center">
              <span className="text-slate-400 block">Housing</span>
              <span className="font-bold text-slate-800">{profile.homeEnvironment?.housingType || "House"}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border text-center">
              <span className="text-slate-400 block">Yard</span>
              <span className="font-bold text-slate-800">{profile.homeEnvironment?.yardType || "Fenced Yard"}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border text-center">
              <span className="text-slate-400 block">First Aid Kit</span>
              <span className="font-bold text-emerald-600">{profile.safetyInfo?.hasFirstAidKit ? "Yes" : "No"}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border text-center">
              <span className="text-slate-400 block">Non-Smoking</span>
              <span className="font-bold text-emerald-600">{profile.homeEnvironment?.nonSmokingHome ? "Yes" : "No"}</span>
            </div>
          </div>
        </div>

        {/* Section 11: Certifications */}
        {profile.certifications?.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
              <Award size={16} className="text-teal-600" /> Section 11: Certifications & Credentials
            </h3>
            <div className="space-y-1.5">
              {profile.certifications.map((c, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 border rounded-lg flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">{c.title} ({c.issuer || "Accredited"})</span>
                  <span className="text-slate-500">{c.year}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfileReview;
