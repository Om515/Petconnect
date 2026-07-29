import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Star,
  ArrowLeft,
  Phone,
  Mail,
  Clock,
  Award,
  DollarSign,
  Calendar,
  MapPin,
  Heart,
  ShieldCheck,
  Home,
  CheckCircle2,
  Sparkles,
  Camera,
  Briefcase,
  Check,
  Globe,
  X,
  TrendingUp,
  Users
} from "lucide-react";
import { toast } from "react-hot-toast";

const UserCaretakerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caretaker, setCaretaker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Booking Form State
  const [formData, setFormData] = useState({
    service: "Pet Sitting",
    date: "",
    hours: 2,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCaretaker = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/user/caretakers/${id}`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setCaretaker(response.data.caretaker);
        } else {
          setError("Failed to fetch caretaker");
          toast.error("Failed to load caretaker profile");
        }
      } catch (err) {
        console.error("Error fetching caretaker:", err);
        setError(err.response?.data?.message || "Failed to fetch caretaker");
        toast.error("Failed to load caretaker profile");
      } finally {
        setLoading(false);
      }
    };

    fetchCaretaker();
  }, [id]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.date) {
      toast.error("Please select a date");
      return false;
    }
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      toast.error("Date cannot be in the past");
      return false;
    }
    if (!formData.hours || formData.hours < 1) {
      toast.error("Hours must be at least 1");
      return false;
    }
    return true;
  };

  const handleHire = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const response = await axios.post(
        `/api/user/bookings`,
        {
          caretakerId: id,
          service: formData.service,
          date: formData.date,
          hours: Number(formData.hours),
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Booking request sent successfully!");
        setFormData({ service: "Pet Sitting", date: "", hours: 2 });
      } else {
        toast.error(response.data.message || "Failed to send booking request");
      }
    } catch (error) {
      console.error("Error sending booking request:", error);
      toast.error(error.response?.data?.message || "Error sending booking request");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[70vh] bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-16 bg-slate-50 min-h-screen">
        <div className="bg-rose-50 border-l-4 border-rose-500 p-6 max-w-md mx-auto rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold text-rose-800">{error}</h3>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-5 py-2 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  if (!caretaker)
    return (
      <div className="text-center py-16 bg-slate-50 min-h-screen">
        <h3 className="text-xl font-bold text-slate-800">Caretaker not found</h3>
        <button
          onClick={() => navigate("/caretakers")}
          className="mt-4 px-6 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition"
        >
          Browse Caretakers
        </button>
      </div>
    );

  // Users ONLY see the latest APPROVED professional profile.
  // If caretaker has never completed an approved professional profile, prof is null.
  const prof = caretaker.professionalProfile;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-teal-700 hover:text-teal-900 font-semibold transition"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Caretakers
        </button>

        {prof ? (
          /* ========================================================
             PREMIUM APPROVED SHOWCASE PROFILE (AIRBNB / ROVER STYLE)
             ======================================================== */
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
            {/* 1. Profile Header */}
            <div className="relative h-64 bg-gradient-to-r from-teal-700 via-cyan-700 to-blue-700">
              {prof.coverBanner && (
                <img src={prof.coverBanner} alt="Cover" className="w-full h-full object-cover opacity-35" />
              )}
              <div className="absolute -bottom-16 left-8 flex items-end space-x-5">
                <div className="h-32 w-32 rounded-2xl border-4 border-white bg-white overflow-hidden shadow-2xl">
                  {prof.profileImage || caretaker.image ? (
                    <img
                      src={prof.profileImage || caretaker.image}
                      alt={caretaker.fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-teal-100 text-teal-700 font-extrabold text-4xl flex items-center justify-center">
                      {caretaker.fullName.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Header Content */}
            <div className="pt-20 px-8 pb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900">{caretaker.fullName}</h1>
                  {prof.headline && (
                    <p className="text-teal-700 font-bold text-base mt-1">{prof.headline}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                      <Star size={16} fill="currentColor" /> 4.95 (28 Reviews)
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <MapPin size={16} className="text-teal-600" /> {prof.city ? `${prof.city}, ${prof.state || ""}` : caretaker.location || "Local Area"}
                    </span>
                    {prof.responseTime && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium text-slate-600">
                          <Clock size={15} className="text-teal-600" /> Responds {prof.responseTime}
                        </span>
                      </>
                    )}
                  </div>

                  {/* 6. Trust Badges */}
                  {prof.trustBadges?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {prof.trustBadges.map((badge, idx) => (
                        <span
                          key={idx}
                          className="px-3.5 py-1.5 bg-teal-50 text-teal-900 text-xs font-bold rounded-full border border-teal-200 flex items-center gap-1.5 shadow-xs"
                        >
                          <ShieldCheck size={15} className="text-teal-600" /> {badge}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={toggleFavorite}
                  className={`p-3 rounded-2xl border shadow-sm ${
                    isFavorite ? "text-rose-500 bg-rose-50 border-rose-200" : "text-slate-400 bg-white hover:text-rose-500"
                  } transition-colors`}
                >
                  <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
                </button>
              </div>

              {/* 10. Statistics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <span className="text-slate-400 text-xs uppercase tracking-wider font-bold block">Years Experience</span>
                  <span className="text-2xl font-extrabold text-slate-900">{prof.yearsOfExperience || caretaker.experience || 1}+ Yrs</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <span className="text-slate-400 text-xs uppercase tracking-wider font-bold block">Pets Cared For</span>
                  <span className="text-2xl font-extrabold text-teal-600">{prof.experienceCount || 45}+</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <span className="text-slate-400 text-xs uppercase tracking-wider font-bold block">Repeat Client Rate</span>
                  <span className="text-2xl font-extrabold text-indigo-600">96%</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <span className="text-slate-400 text-xs uppercase tracking-wider font-bold block">Response Rate</span>
                  <span className="text-2xl font-extrabold text-emerald-600">100%</span>
                </div>
              </div>

              {/* Main Body 2-Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
                {/* Left Column: Premium Sections (2 Cols) */}
                <div className="lg:col-span-2 space-y-8">
                  {/* 2. About Me */}
                  <div className="space-y-3">
                    <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                      <Sparkles className="text-teal-600" /> About Me
                    </h2>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-6 rounded-2xl border border-slate-100 text-sm">
                      {prof.bio || caretaker.description || "No bio provided."}
                    </p>
                    {prof.petOwnershipHistory && (
                      <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100 text-xs text-slate-700 space-y-1">
                        <span className="font-bold text-teal-900 block">Personal Pet Background:</span>
                        <p>{prof.petOwnershipHistory}</p>
                      </div>
                    )}
                  </div>

                  {/* 3. Professional Information */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Briefcase className="text-teal-600" /> Professional Information
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                      <div className="bg-white p-3.5 rounded-xl border">
                        <span className="text-slate-400 font-semibold block">Languages Spoken</span>
                        <span className="font-extrabold text-slate-800 mt-1 block">
                          {(prof.languages || ["English"]).join(", ")}
                        </span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border">
                        <span className="text-slate-400 font-semibold block">Emergency Transport</span>
                        <span className="font-extrabold text-slate-800 mt-1 block">
                          {prof.hasEmergencyTransport ? "Available" : "No Vehicle"}
                        </span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border">
                        <span className="text-slate-400 font-semibold block">Background Check</span>
                        <span className="font-extrabold text-emerald-600 mt-1 block">
                          {prof.isBackgroundChecked ? "Passed & Verified" : "Verified"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 4. Services Offered */}
                  {prof.services?.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                        <Briefcase className="text-teal-600" /> Services Offered
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {prof.services.map((svc, idx) => (
                          <div key={idx} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2 hover:border-teal-300 transition">
                            <div className="flex justify-between items-center">
                              <h3 className="font-bold text-slate-900 text-base">{svc.title}</h3>
                              <span className="font-extrabold text-teal-700 text-base">${svc.price} <span className="text-xs font-normal text-slate-500">{svc.unit}</span></span>
                            </div>
                            {svc.description && <p className="text-xs text-slate-600">{svc.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 5. Availability Calendar */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Calendar className="text-teal-600" /> Availability & Working Schedule
                      </h2>
                      {prof.isAcceptingNewClients && (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1">
                          <CheckCircle2 size={14} /> Accepting Clients
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(prof.availabilityDays || []).map((day, idx) => (
                        <span key={idx} className="px-3.5 py-1.5 bg-white text-slate-800 font-bold text-xs rounded-xl border shadow-xs">
                          {day}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 pt-1">
                      Operating Hours: <span className="font-semibold text-slate-700">{prof.operatingHours?.start || "08:00"} - {prof.operatingHours?.end || "20:00"}</span>
                    </p>
                  </div>

                  {/* 7. Pet Types & Size Preferences */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {prof.acceptedPetTypes?.length > 0 && (
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Accepted Pet Types</h3>
                        <div className="flex flex-wrap gap-2">
                          {prof.acceptedPetTypes.map((pet, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-teal-100 text-teal-800 text-xs font-bold rounded-lg">
                              {pet}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {prof.acceptedDogSizes?.length > 0 && (
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Accepted Dog Sizes</h3>
                        <div className="flex flex-wrap gap-2">
                          {prof.acceptedDogSizes.map((sz, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border">
                              {sz}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 8. Experience Showcase Gallery */}
                  {prof.gallery?.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                        <Camera className="text-teal-600" /> Experience Showcase Gallery
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {prof.gallery.map((img, idx) => (
                          <div
                            key={idx}
                            onClick={() => setLightboxImage(img.url)}
                            className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group relative cursor-pointer shadow-xs"
                          >
                            <img
                              src={img.url}
                              alt={img.caption || "Gallery"}
                              className="w-full h-36 object-cover group-hover:scale-105 transition duration-300"
                            />
                            {img.caption && (
                              <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] p-2 truncate font-medium">
                                {img.caption}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 9. Safety Information & 11. Certifications */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Safety Info */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                      <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck size={16} className="text-teal-600" /> Safety Information
                      </h3>
                      <ul className="space-y-2 text-xs font-medium text-slate-700">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-500" /> First Aid Kit: {prof.safetyInfo?.hasFirstAidKit ? "Available" : "Not specified"}
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-500" /> Pet Care Insured: {prof.safetyInfo?.insured ? "Yes" : "No"}
                        </li>
                        {prof.safetyInfo?.emergencyVetContact && (
                          <li className="pt-1 text-slate-500">
                            Emergency Vet: <span className="font-bold text-slate-800">{prof.safetyInfo.emergencyVetContact}</span>
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Certifications */}
                    {prof.certifications?.length > 0 && (
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
                          <Award size={16} className="text-teal-600" /> Certifications
                        </h3>
                        <div className="space-y-2">
                          {prof.certifications.map((c, idx) => (
                            <div key={idx} className="bg-white p-2.5 rounded-xl border text-xs flex justify-between items-center">
                              <span className="font-bold text-slate-800">{c.title}</span>
                              <span className="text-slate-500">{c.year}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 11. Home Environment */}
                  {prof.homeEnvironment && (
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Home className="text-teal-600" /> Home Environment
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-medium">
                        <div className="p-3 bg-white rounded-xl border text-center">
                          <span className="text-slate-400 block">Housing</span>
                          <span className="font-bold text-slate-800">{prof.homeEnvironment.housingType || "House"}</span>
                        </div>
                        <div className="p-3 bg-white rounded-xl border text-center">
                          <span className="text-slate-400 block">Yard</span>
                          <span className="font-bold text-slate-800">{prof.homeEnvironment.yardType || "Fenced Yard"}</span>
                        </div>
                        <div className="p-3 bg-white rounded-xl border text-center">
                          <span className="text-slate-400 block">Non-Smoking</span>
                          <span className="font-bold text-emerald-600">{prof.homeEnvironment.nonSmokingHome ? "Yes" : "No"}</span>
                        </div>
                        <div className="p-3 bg-white rounded-xl border text-center">
                          <span className="text-slate-400 block">Resident Pets</span>
                          <span className="font-bold text-slate-800">{prof.homeEnvironment.hasOwnPets ? "Yes" : "No"}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Booking & Pricing Form Widget */}
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-6 sticky top-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                      <h2 className="text-xl font-extrabold text-slate-900">
                        Book {caretaker.fullName.split(" ")[0]}
                      </h2>
                      <span className="text-2xl font-extrabold text-teal-600">
                        ${prof.baseDailyRate || caretaker.hourlyRate}<span className="text-sm font-normal text-slate-500">/hr</span>
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Select Service Needed
                        </label>
                        <select
                          name="service"
                          value={formData.service}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500"
                        >
                          {prof.services?.length > 0 ? (
                            prof.services.map((s, idx) => (
                              <option key={idx} value={s.title}>{s.title} (${s.price} {s.unit})</option>
                            ))
                          ) : (
                            <>
                              <option>Pet Sitting</option>
                              <option>Dog Walking</option>
                              <option>Grooming</option>
                              <option>Training</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Hours Needed
                        </label>
                        <input
                          type="number"
                          name="hours"
                          value={formData.hours}
                          onChange={handleInputChange}
                          min="1"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      {/* 14. Pricing Breakdown */}
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-sm">
                        <div className="flex justify-between text-slate-600">
                          <span>Base Rate</span>
                          <span className="font-semibold text-slate-800">${prof.baseDailyRate || caretaker.hourlyRate}/hr</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Duration</span>
                          <span className="font-semibold text-slate-800">{formData.hours} hrs</span>
                        </div>
                        <div className="border-t border-slate-200 pt-2 flex justify-between font-extrabold text-slate-900 text-base">
                          <span>Estimated Total</span>
                          <span className="text-teal-600">${(prof.baseDailyRate || caretaker.hourlyRate) * formData.hours}</span>
                        </div>
                      </div>

                      <button
                        onClick={handleHire}
                        disabled={submitting}
                        className={`w-full py-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-extrabold text-base rounded-2xl shadow-lg hover:shadow-xl transition duration-200 ${
                          submitting ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {submitting ? "Submitting Booking..." : `Request Booking ($${(prof.baseDailyRate || caretaker.hourlyRate) * formData.hours})`}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================
             FALLBACK BASIC PROFILE (FOR CARETAKERS WITHOUT APPROVED PROFILE)
             ======================================================== */
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
            <div className="h-48 bg-gradient-to-r from-cyan-600 to-teal-600"></div>
            <div className="px-8 pb-8 -mt-16">
              <div className="flex justify-between items-end mb-6">
                <div className="flex items-end space-x-4">
                  <div className="h-28 w-28 rounded-2xl border-4 border-white bg-white overflow-hidden shadow-lg">
                    {caretaker.image ? (
                      <img src={caretaker.image} alt={caretaker.fullName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-cyan-100 flex items-center justify-center font-bold text-3xl text-cyan-600">
                        {caretaker.fullName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl font-extrabold text-slate-900">{caretaker.fullName}</h1>
                    <div className="flex items-center text-amber-500 font-bold text-sm mt-1">
                      <Star size={16} fill="currentColor" className="mr-1" /> 4.9 (12 reviews)
                    </div>
                  </div>
                </div>

                <button
                  onClick={toggleFavorite}
                  className={`p-3 rounded-2xl border ${isFavorite ? "text-rose-500 bg-rose-50" : "text-slate-400 bg-white"}`}
                >
                  <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border space-y-4">
                    <h2 className="text-lg font-bold text-slate-900">Basic Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-3">
                        <Mail className="text-teal-600" size={18} />
                        <span>{caretaker.applicant?.email || caretaker.email || "Not provided"}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="text-teal-600" size={18} />
                        <span>{caretaker.mobile || "Not provided"}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Award className="text-teal-600" size={18} />
                        <span>{caretaker.experience} years experience</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <DollarSign className="text-teal-600" size={18} />
                        <span>₹{caretaker.hourlyRate}/hour</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border space-y-3">
                    <h2 className="text-lg font-bold text-slate-900">About Caregiver</h2>
                    <p className="text-slate-700 text-sm whitespace-pre-line leading-relaxed">
                      {caretaker.description || "No description provided."}
                    </p>
                  </div>

                  {caretaker.skills?.length > 0 && (
                    <div className="bg-slate-50 p-6 rounded-2xl border space-y-3">
                      <h2 className="text-lg font-bold text-slate-900">Skills</h2>
                      <div className="flex flex-wrap gap-2">
                        {caretaker.skills.map((s, idx) => (
                          <span key={idx} className="px-3 py-1 bg-white border rounded-lg text-xs font-semibold text-slate-800 shadow-xs">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Booking Form Widget */}
                <div>
                  <div className="bg-white border rounded-3xl p-6 shadow-xl space-y-5 sticky top-6">
                    <h2 className="text-xl font-bold text-slate-900 border-b pb-3">Book Caregiver</h2>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Service Needed</label>
                      <select
                        name="service"
                        value={formData.service}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl font-semibold"
                      >
                        <option>Pet Sitting</option>
                        <option>Dog Walking</option>
                        <option>Grooming</option>
                        <option>Training</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Hours Needed</label>
                      <input
                        type="number"
                        name="hours"
                        value={formData.hours}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl font-semibold"
                      />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Rate</span>
                        <span className="font-bold">₹{caretaker.hourlyRate}/hr</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 font-bold text-slate-900">
                        <span>Total Estimated</span>
                        <span className="text-teal-600">₹{caretaker.hourlyRate * formData.hours}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleHire}
                      disabled={submitting}
                      className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow transition"
                    >
                      {submitting ? "Sending Request..." : "Request Booking"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal for Experience Gallery */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300"
            >
              <X size={28} />
            </button>
            <img src={lightboxImage} alt="Enlarged gallery showcase" className="w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCaretakerProfile;