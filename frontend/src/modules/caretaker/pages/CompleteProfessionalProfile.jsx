import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  User,
  Sparkles,
  ShieldCheck,
  Calendar,
  Clock,
  DollarSign,
  Briefcase,
  Home,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Plus,
  Trash2,
  ArrowLeft,
  Camera,
  Award,
  Globe,
  Lock,
  Save,
  Send,
  Upload
} from "lucide-react";

const CompleteProfessionalProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("header");

  const [approvedProfile, setApprovedProfile] = useState(null);
  const [pendingProfile, setPendingProfile] = useState(null);
  const [draftProfile, setDraftProfile] = useState(null);
  const [rejectedProfile, setRejectedProfile] = useState(null);
  const [isLocked, setIsLocked] = useState(false);

  // Form State initialized with rich defaults
  const [formData, setFormData] = useState({
    headline: "",
    profileImage: "",
    coverBanner: "",
    city: "",
    state: "",
    zipCode: "",
    bio: "",
    petOwnershipHistory: "",
    yearsOfExperience: 1,
    experienceCount: 15,
    languages: ["English"],
    responseTime: "Within 1 hour",
    hasEmergencyTransport: false,
    isBackgroundChecked: false,
    services: [
      { title: "Dog Walking", description: "30-minute energetic neighborhood walk", price: 20, unit: "per walk" },
      { title: "Pet Sitting", description: "Full-day dedicated care at home", price: 45, unit: "per day" }
    ],
    baseDailyRate: 40,
    additionalPetRate: 15,
    holidayRate: 60,
    availabilityDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    operatingHours: { start: "08:00", end: "20:00" },
    isAcceptingNewClients: true,
    trustBadges: ["Identity Verified", "Pet CPR Certified"],
    skills: ["Oral Medication", "Senior Dog Care", "Puppy Training Support", "Daily Photo Updates"],
    acceptedPetTypes: ["Dogs", "Cats"],
    acceptedDogSizes: ["Small (0-15 lbs)", "Medium (16-40 lbs)", "Large (41-100 lbs)"],
    gallery: [],
    homeEnvironment: {
      housingType: "House",
      yardType: "Fenced Yard",
      hasOwnPets: false,
      hasChildren: false,
      nonSmokingHome: true
    },
    safetyInfo: {
      emergencyVetContact: "",
      hasFirstAidKit: true,
      insured: false
    },
    certifications: [
      { title: "Pet First Aid & CPR", issuer: "Red Cross", year: 2024, credentialUrl: "" }
    ]
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/caretaker/professional-profile", { withCredentials: true });
      if (res.data.success) {
        setApprovedProfile(res.data.approvedProfile);
        setPendingProfile(res.data.pendingProfile);
        setDraftProfile(res.data.draftProfile);
        setRejectedProfile(res.data.rejectedProfile);
        setIsLocked(res.data.isLocked || false);

        // Pre-fill form state prioritizing pending edit draft, then draft, then approved profile, then baseline
        const activeData = res.data.pendingProfile || res.data.draftProfile || res.data.approvedProfile;
        if (activeData) {
          setFormData((prev) => ({
            ...prev,
            ...activeData,
            languages: activeData.languages?.length ? activeData.languages : prev.languages,
            operatingHours: activeData.operatingHours || prev.operatingHours,
            homeEnvironment: activeData.homeEnvironment || prev.homeEnvironment,
            safetyInfo: activeData.safetyInfo || prev.safetyInfo,
            services: activeData.services?.length ? activeData.services : prev.services,
            availabilityDays: activeData.availabilityDays?.length ? activeData.availabilityDays : prev.availabilityDays,
            trustBadges: activeData.trustBadges?.length ? activeData.trustBadges : prev.trustBadges,
            skills: activeData.skills?.length ? activeData.skills : prev.skills,
            acceptedPetTypes: activeData.acceptedPetTypes?.length ? activeData.acceptedPetTypes : prev.acceptedPetTypes,
            acceptedDogSizes: activeData.acceptedDogSizes?.length ? activeData.acceptedDogSizes : prev.acceptedDogSizes,
            gallery: activeData.gallery || [],
            certifications: activeData.certifications || []
          }));
        } else if (res.data.baseApplication) {
          const base = res.data.baseApplication;
          setFormData((prev) => ({
            ...prev,
            headline: `${base.fullName} - Professional Caregiver`,
            bio: base.description || "",
            yearsOfExperience: base.experience || 1,
            skills: base.skills?.length ? base.skills : prev.skills,
            baseDailyRate: base.hourlyRate ? base.hourlyRate * 8 : 40
          }));
        }
      }
    } catch (err) {
      console.error("Error fetching professional profile:", err);
      toast.error("Failed to load professional profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (isLocked) return;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    if (isLocked) return;
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  // Helper handlers for dynamic arrays
  const addService = () => {
    if (isLocked) return;
    setFormData((prev) => ({
      ...prev,
      services: [...prev.services, { title: "", description: "", price: 20, unit: "per hour" }]
    }));
  };

  const updateService = (index, field, value) => {
    if (isLocked) return;
    const updated = [...formData.services];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, services: updated }));
  };

  const removeService = (index) => {
    if (isLocked) return;
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const addCertification = () => {
    if (isLocked) return;
    setFormData((prev) => ({
      ...prev,
      certifications: [...prev.certifications, { title: "", issuer: "", year: new Date().getFullYear(), credentialUrl: "" }]
    }));
  };

  const updateCertification = (index, field, value) => {
    if (isLocked) return;
    const updated = [...formData.certifications];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, certifications: updated }));
  };

  const removeCertification = (index) => {
    if (isLocked) return;
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const addGalleryItem = () => {
    if (isLocked) return;
    setFormData((prev) => ({
      ...prev,
      gallery: [...prev.gallery, { url: "", caption: "", publicId: "" }]
    }));
  };

  const updateGalleryItem = (index, field, value) => {
    if (isLocked) return;
    const updated = [...formData.gallery];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, gallery: updated }));
  };

  const removeGalleryItem = (index) => {
    if (isLocked) return;
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  // Image Upload Handler (Converts file to compressed Data URI / Preview)
  const handleImageFileUpload = (e, index) => {
    if (isLocked) return;
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Compress image to JPEG at 80% quality
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        if (index !== undefined) {
          updateGalleryItem(index, "url", dataUrl);
        } else {
          handleInputChange("profileImage", dataUrl);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const toggleArrayItem = (field, item) => {
    if (isLocked) return;
    setFormData((prev) => {
      const arr = prev[field] || [];
      if (arr.includes(item)) {
        return { ...prev, [field]: arr.filter((i) => i !== item) };
      } else {
        return { ...prev, [field]: [...arr, item] };
      }
    });
  };

  // Client-side Validation
  const validateForm = () => {
    if (!formData.headline.trim()) {
      toast.error("Profile tagline/headline is required");
      setActiveTab("header");
      return false;
    }
    if (!formData.city.trim()) {
      toast.error("City location is required");
      setActiveTab("header");
      return false;
    }
    if (!formData.bio.trim() || formData.bio.length < 15) {
      toast.error("About Me bio must be at least 15 characters long");
      setActiveTab("header");
      return false;
    }
    if (formData.yearsOfExperience < 0) {
      toast.error("Years of experience cannot be negative");
      setActiveTab("skills");
      return false;
    }
    if (formData.services.length === 0 || !formData.services[0].title.trim()) {
      toast.error("Please add at least one valid service offered");
      setActiveTab("services");
      return false;
    }
    if (!formData.baseDailyRate || formData.baseDailyRate <= 0) {
      toast.error("Base daily rate must be greater than 0");
      setActiveTab("services");
      return false;
    }
    return true;
  };

  const handleSave = async (actionType) => {
    if (isLocked) {
      toast.error("Profile editing is locked while pending admin review");
      return;
    }

    if (actionType === "submit" && !validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const res = await axios.post(
        "/api/caretaker/professional-profile",
        { ...formData, action: actionType },
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        fetchProfile();
      } else {
        toast.error(res.data.message || "Error saving profile");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.response?.data?.message || "Failed to process request");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Determine current display badge
  let statusBadge = { label: "Draft", color: "bg-slate-100 text-slate-700 border-slate-300" };
  if (pendingProfile) {
    statusBadge = { label: "Pending Admin Approval", color: "bg-amber-100 text-amber-900 border-amber-400" };
  } else if (approvedProfile) {
    statusBadge = { label: "Approved (Live)", color: "bg-emerald-100 text-emerald-900 border-emerald-400" };
  } else if (rejectedProfile) {
    statusBadge = { label: "Rejected (Revisions Needed)", color: "bg-rose-100 text-rose-900 border-rose-400" };
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Bar Navigation & Status Badges */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border shadow-sm">
          <button
            onClick={() => navigate("/caretaker/profile")}
            className="flex items-center space-x-2 text-teal-700 hover:text-teal-900 font-medium transition"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Status:</span>
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${statusBadge.color}`}>
              {statusBadge.label}
            </span>
          </div>
        </div>

        {/* Lock Notice Banner if Pending */}
        {isLocked && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-2xl shadow-sm flex items-start space-x-4">
            <Lock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900 text-lg">Editing Disabled (Under Admin Review)</h3>
              <p className="text-amber-800 text-sm mt-1">
                Your professional profile submission is currently pending review by our administration team.
                Editing has been locked to preserve review integrity. Once an admin approves or rejects your submission, editing will automatically re-enable.
              </p>
            </div>
          </div>
        )}

        {/* Rejection Notice Banner */}
        {!isLocked && rejectedProfile && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-5 rounded-2xl shadow-sm flex items-start space-x-4">
            <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-rose-900 text-lg">Action Needed (Revisions Requested)</h3>
              <p className="text-rose-800 text-sm mt-1">
                Feedback from Admin: <span className="font-semibold">{rejectedProfile.rejectionReason || "Please update your profile details and resubmit."}</span>
              </p>
            </div>
          </div>
        )}

        {/* Form Container */}
        <fieldset disabled={isLocked} className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden disabled:opacity-85">
          {/* Section Tabs */}
          <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-100/70 p-1">
            <TabButton active={activeTab === "header"} icon={<User size={18} />} label="1-3. Header & Info" onClick={() => setActiveTab("header")} />
            <TabButton active={activeTab === "services"} icon={<Briefcase size={18} />} label="4, 12. Services & Pricing" onClick={() => setActiveTab("services")} />
            <TabButton active={activeTab === "availability"} icon={<Calendar size={18} />} label="5. Availability" onClick={() => setActiveTab("availability")} />
            <TabButton active={activeTab === "skills"} icon={<Sparkles size={18} />} label="6-7. Skills & Pet Types" onClick={() => setActiveTab("skills")} />
            <TabButton active={activeTab === "safety"} icon={<Home size={18} />} label="9-10. Safety & Home" onClick={() => setActiveTab("safety")} />
            <TabButton active={activeTab === "certifications"} icon={<Award size={18} />} label="8, 11. Gallery & Certs" onClick={() => setActiveTab("certifications")} />
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* TAB 1: SECTIONS 1, 2, 3 (Header, About Me, Professional Information) */}
            {activeTab === "header" && (
              <div className="space-y-8 animate-fadeIn">
                {/* Section 1: Profile Header */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                    <User className="text-teal-600" /> Section 1: Profile Header
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Tagline / Headline *</label>
                      <input
                        type="text"
                        placeholder="e.g. Certified Vet Assistant & 5-Star Dog Sitter"
                        className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-teal-500"
                        value={formData.headline}
                        onChange={(e) => handleInputChange("headline", e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Location / City *</label>
                      <input
                        type="text"
                        placeholder="e.g. San Francisco, CA"
                        className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-teal-500"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Profile Photo (URL or File Upload)</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="https://..."
                          className="flex-1 px-3 py-2 border rounded-lg"
                          value={formData.profileImage}
                          onChange={(e) => handleInputChange("profileImage", e.target.value)}
                        />
                        <label className="px-3 py-2 bg-slate-100 text-slate-700 border rounded-lg cursor-pointer hover:bg-slate-200 flex items-center gap-1 text-sm font-semibold">
                          <Upload size={16} /> <span>Upload</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFileUpload(e)} />
                        </label>
                      </div>
                      {formData.profileImage && (
                        <img src={formData.profileImage} alt="Preview" className="w-14 h-14 rounded-full object-cover mt-2 border shadow-sm" />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Cover Banner Image URL</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-teal-500"
                        value={formData.coverBanner}
                        onChange={(e) => handleInputChange("coverBanner", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: About Me */}
                <div className="space-y-4 pt-4 border-t">
                  <h2 className="text-xl font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                    <Sparkles className="text-teal-600" /> Section 2: About Me
                  </h2>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Detailed Bio *</label>
                    <textarea
                      rows={4}
                      placeholder="Share your story, passion for pets, daily routine, and what makes your care exceptional..."
                      className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-teal-500"
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Pet Ownership & Experience Background</label>
                    <textarea
                      rows={3}
                      placeholder="Describe the pets you have owned or cared for over your lifetime..."
                      className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-teal-500"
                      value={formData.petOwnershipHistory}
                      onChange={(e) => handleInputChange("petOwnershipHistory", e.target.value)}
                    />
                  </div>
                </div>

                {/* Section 3: Professional Information */}
                <div className="space-y-4 pt-4 border-t">
                  <h2 className="text-xl font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                    <Briefcase className="text-teal-600" /> Section 3: Professional Information
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Years Experience</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-4 py-2.5 rounded-lg border"
                        value={formData.yearsOfExperience}
                        onChange={(e) => handleInputChange("yearsOfExperience", Number(e.target.value))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Experience Count (Pets Cared For / Bookings)</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-4 py-2.5 rounded-lg border"
                        value={formData.experienceCount}
                        onChange={(e) => handleInputChange("experienceCount", Number(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* Languages Spoken */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Languages Spoken</label>
                    <div className="flex flex-wrap gap-2">
                      {["English", "Spanish", "French", "German", "Hindi", "Mandarin", "Japanese"].map((lang) => {
                        const isSelected = formData.languages?.includes(lang);
                        return (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => toggleArrayItem("languages", lang)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                              isSelected ? "bg-teal-700 text-white border-teal-700" : "bg-slate-100 text-slate-600 border-slate-300"
                            }`}
                          >
                            {lang}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preferred Pet Size */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Preferred Pet Size Brackets</label>
                    <div className="flex flex-wrap gap-2">
                      {["Small (0-15 lbs)", "Medium (16-40 lbs)", "Large (41-100 lbs)", "Giant (100+ lbs)"].map((sz) => {
                        const isSelected = formData.acceptedDogSizes?.includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => toggleArrayItem("acceptedDogSizes", sz)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border ${
                              isSelected ? "bg-cyan-600 text-white border-cyan-600" : "bg-slate-100 text-slate-600 border-slate-300"
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SECTIONS 4 & 12 (Services Offered & Pricing) */}
            {activeTab === "services" && (
              <div className="space-y-8 animate-fadeIn">
                {/* Section 4: Services Offered */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <Briefcase className="text-teal-600" /> Section 4: Services Offered
                    </h2>
                    <button
                      type="button"
                      onClick={addService}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium"
                    >
                      <Plus size={16} /> <span>Add Service</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.services.map((svc, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder="Service Title (e.g. Dog Walking)"
                            className="px-3 py-2 border rounded-lg"
                            value={svc.title}
                            onChange={(e) => updateService(idx, "title", e.target.value)}
                          />
                          <input
                            type="number"
                            placeholder="Price ($)"
                            className="px-3 py-2 border rounded-lg"
                            value={svc.price}
                            onChange={(e) => updateService(idx, "price", Number(e.target.value))}
                          />
                          <select
                            className="px-3 py-2 border rounded-lg bg-white"
                            value={svc.unit}
                            onChange={(e) => updateService(idx, "unit", e.target.value)}
                          >
                            <option value="per hour">per hour</option>
                            <option value="per day">per day</option>
                            <option value="per visit">per visit</option>
                            <option value="per walk">per walk</option>
                          </select>
                        </div>
                        <input
                          type="text"
                          placeholder="Service Description"
                          className="w-full px-3 py-2 border rounded-lg"
                          value={svc.description}
                          onChange={(e) => updateService(idx, "description", e.target.value)}
                        />
                        {formData.services.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeService(idx)}
                            className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 12: Pricing */}
                <div className="space-y-4 pt-4 border-t">
                  <h2 className="text-xl font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                    <DollarSign className="text-teal-600" /> Section 12: Pricing Overview
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Base Daily Rate ($/day) *</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full px-4 py-2 rounded-lg border"
                        value={formData.baseDailyRate}
                        onChange={(e) => handleInputChange("baseDailyRate", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Additional Pet Rate ($)</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-4 py-2 rounded-lg border"
                        value={formData.additionalPetRate}
                        onChange={(e) => handleInputChange("additionalPetRate", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Holiday Surcharge Rate ($)</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-4 py-2 rounded-lg border"
                        value={formData.holidayRate}
                        onChange={(e) => handleInputChange("holidayRate", Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SECTION 5 (Availability Calendar) */}
            {activeTab === "availability" && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-xl font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                  <Calendar className="text-teal-600" /> Section 5: Availability Calendar & Schedule
                </h2>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Operating Days Available for Booking</label>
                  <div className="flex flex-wrap gap-2">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                      const isSelected = formData.availabilityDays?.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleArrayItem("availabilityDays", day)}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition border ${
                            isSelected
                              ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                              : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Operating Hours Start</label>
                    <input
                      type="time"
                      className="w-full px-4 py-2.5 rounded-lg border"
                      value={formData.operatingHours?.start || "08:00"}
                      onChange={(e) => handleNestedChange("operatingHours", "start", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Operating Hours End</label>
                    <input
                      type="time"
                      className="w-full px-4 py-2.5 rounded-lg border"
                      value={formData.operatingHours?.end || "20:00"}
                      onChange={(e) => handleNestedChange("operatingHours", "end", e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-4 border-t">
                  <input
                    type="checkbox"
                    id="acceptingClients"
                    className="w-5 h-5 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                    checked={formData.isAcceptingNewClients}
                    onChange={(e) => handleInputChange("isAcceptingNewClients", e.target.checked)}
                  />
                  <label htmlFor="acceptingClients" className="font-semibold text-slate-800">
                    Currently Accepting New Clients & Bookings
                  </label>
                </div>
              </div>
            )}

            {/* TAB 4: SECTIONS 6 & 7 (Skills & Pet Types) */}
            {activeTab === "skills" && (
              <div className="space-y-8 animate-fadeIn">
                {/* Section 6: Skills */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                    <Sparkles className="text-teal-600" /> Section 6: Caregiver Skills & Highlights
                  </h2>

                  <div className="flex flex-wrap gap-2">
                    {[
                      "Oral Medication",
                      "Injected Medication",
                      "Senior Dog Care",
                      "Puppy Training Support",
                      "Special Needs Care",
                      "Daily Photo Updates",
                      "Cat Grooming",
                      "Behavioral Management"
                    ].map((skill) => {
                      const isSelected = formData.skills?.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleArrayItem("skills", skill)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                            isSelected ? "bg-cyan-600 text-white border-cyan-600" : "bg-slate-50 text-slate-600 border-slate-300"
                          }`}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 7: Pet Types */}
                <div className="space-y-4 pt-4 border-t">
                  <h2 className="text-xl font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                    <User className="text-teal-600" /> Section 7: Accepted Pet Types
                  </h2>

                  <div className="flex flex-wrap gap-2">
                    {["Dogs", "Cats", "Birds", "Small Animals (Rabbits/Hamsters)", "Reptiles", "Fish"].map((pet) => {
                      const isSelected = formData.acceptedPetTypes?.includes(pet);
                      return (
                        <button
                          key={pet}
                          type="button"
                          onClick={() => toggleArrayItem("acceptedPetTypes", pet)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border ${
                            isSelected ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-100 text-slate-600 border-slate-300"
                          }`}
                        >
                          {pet}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: SECTIONS 9 & 10 (Safety Information & Home Environment) */}
            {activeTab === "safety" && (
              <div className="space-y-8 animate-fadeIn">
                {/* Section 9: Safety Information */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                    <ShieldCheck className="text-teal-600" /> Section 9: Safety Information & Emergency Contacts
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Emergency Vet Clinic Contact</label>
                      <input
                        type="text"
                        placeholder="e.g. Metro Emergency Vet Clinic (555-0199)"
                        className="w-full px-4 py-2 rounded-lg border"
                        value={formData.safetyInfo?.emergencyVetContact}
                        onChange={(e) => handleNestedChange("safetyInfo", "emergencyVetContact", e.target.value)}
                      />
                    </div>

                    <div className="flex items-center space-x-4 pt-6">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.safetyInfo?.hasFirstAidKit}
                          onChange={(e) => handleNestedChange("safetyInfo", "hasFirstAidKit", e.target.checked)}
                        />
                        <span className="text-sm font-semibold text-slate-700">Has Pet First Aid Kit</span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.safetyInfo?.insured}
                          onChange={(e) => handleNestedChange("safetyInfo", "insured", e.target.checked)}
                        />
                        <span className="text-sm font-semibold text-slate-700">Pet Care Insured</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Section 10: Home Environment */}
                <div className="space-y-4 pt-4 border-t">
                  <h2 className="text-xl font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                    <Home className="text-teal-600" /> Section 10: Home Environment
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Housing Type</label>
                      <select
                        className="w-full px-4 py-2.5 rounded-lg border bg-white"
                        value={formData.homeEnvironment?.housingType}
                        onChange={(e) => handleNestedChange("homeEnvironment", "housingType", e.target.value)}
                      >
                        <option value="House">House</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Townhouse">Townhouse</option>
                        <option value="Condo">Condo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Yard Type</label>
                      <select
                        className="w-full px-4 py-2.5 rounded-lg border bg-white"
                        value={formData.homeEnvironment?.yardType}
                        onChange={(e) => handleNestedChange("homeEnvironment", "yardType", e.target.value)}
                      >
                        <option value="Fenced Yard">Fenced Yard</option>
                        <option value="Unfenced Yard">Unfenced Yard</option>
                        <option value="No Yard">No Yard</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <label className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg border">
                      <input
                        type="checkbox"
                        checked={formData.homeEnvironment?.hasOwnPets}
                        onChange={(e) => handleNestedChange("homeEnvironment", "hasOwnPets", e.target.checked)}
                      />
                      <span className="text-sm font-medium text-slate-700">Has Resident Pets</span>
                    </label>

                    <label className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg border">
                      <input
                        type="checkbox"
                        checked={formData.homeEnvironment?.hasChildren}
                        onChange={(e) => handleNestedChange("homeEnvironment", "hasChildren", e.target.checked)}
                      />
                      <span className="text-sm font-medium text-slate-700">Has Children</span>
                    </label>

                    <label className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg border">
                      <input
                        type="checkbox"
                        checked={formData.homeEnvironment?.nonSmokingHome}
                        onChange={(e) => handleNestedChange("homeEnvironment", "nonSmokingHome", e.target.checked)}
                      />
                      <span className="text-sm font-medium text-slate-700">Non-Smoking Home</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: SECTIONS 8 & 11 (Experience Gallery & Certifications) */}
            {activeTab === "certifications" && (
              <div className="space-y-8 animate-fadeIn">
                {/* Section 8: Experience Gallery */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <Camera className="text-teal-600" /> Section 8: Experience Gallery (Multiple Images)
                    </h2>
                    <button
                      type="button"
                      onClick={addGalleryItem}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium"
                    >
                      <Plus size={16} /> <span>Add Photo</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {formData.gallery.map((img, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border rounded-lg space-y-2 relative">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Image URL (https://...)"
                            className="flex-1 px-3 py-1.5 border rounded-lg text-sm"
                            value={img.url}
                            onChange={(e) => updateGalleryItem(idx, "url", e.target.value)}
                          />
                          <label className="px-2.5 py-1.5 bg-white border rounded-lg cursor-pointer hover:bg-slate-100 flex items-center gap-1 text-xs font-semibold">
                            <Upload size={14} />
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFileUpload(e, idx)} />
                          </label>
                        </div>
                        <input
                          type="text"
                          placeholder="Caption (e.g. Spacious backyard play area)"
                          className="w-full px-3 py-1.5 border rounded-lg text-sm"
                          value={img.caption}
                          onChange={(e) => updateGalleryItem(idx, "caption", e.target.value)}
                        />
                        {img.url && (
                          <img src={img.url} alt="Gallery item" className="w-full h-24 object-cover rounded-lg border mt-1" />
                        )}
                        <button
                          type="button"
                          onClick={() => removeGalleryItem(idx)}
                          className="absolute top-2 right-2 text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 11: Certifications */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <Award className="text-teal-600" /> Section 11: Certifications
                    </h2>
                    <button
                      type="button"
                      onClick={addCertification}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium"
                    >
                      <Plus size={16} /> <span>Add Certificate</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.certifications.map((cert, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border rounded-lg flex items-center gap-3">
                        <input
                          type="text"
                          placeholder="Certificate Title"
                          className="flex-1 px-3 py-1.5 border rounded-lg text-sm"
                          value={cert.title}
                          onChange={(e) => updateCertification(idx, "title", e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Issuer"
                          className="flex-1 px-3 py-1.5 border rounded-lg text-sm"
                          value={cert.issuer}
                          onChange={(e) => updateCertification(idx, "issuer", e.target.value)}
                        />
                        <input
                          type="number"
                          placeholder="Year"
                          className="w-20 px-3 py-1.5 border rounded-lg text-sm"
                          value={cert.year}
                          onChange={(e) => updateCertification(idx, "year", Number(e.target.value))}
                        />
                        <button
                          type="button"
                          onClick={() => removeCertification(idx)}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer: Save as Draft vs Submit for Approval */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500">
              {isLocked
                ? "Profile editing is locked while pending admin review."
                : "Saving as Draft lets you continue editing anytime. Submitting locks editing and sends your profile for Admin Approval."}
            </p>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                type="button"
                disabled={isLocked || saving}
                onClick={() => handleSave("draft")}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={18} />
                <span>Save as Draft</span>
              </button>

              <button
                type="button"
                disabled={isLocked || saving}
                onClick={() => handleSave("submit")}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send size={18} />
                <span>{saving ? "Submitting..." : "Submit for Approval"}</span>
              </button>
            </div>
          </div>
        </fieldset>
      </div>
    </div>
  );
};

const TabButton = ({ active, icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm transition flex-shrink-0 ${
      active
        ? "bg-white text-teal-700 shadow-sm border border-slate-200"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default CompleteProfessionalProfile;
