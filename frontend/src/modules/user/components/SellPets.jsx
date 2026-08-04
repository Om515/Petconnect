import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  PawPrint,
  Heart,
  Activity,
  Home,
  History,
  Image as ImageIcon,
  FileCheck,
  Upload,
  X,
  CheckCircle,
  Sparkles,
  Play,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { AuthData } from "../../../context/AuthContext";
import StepProgress from "./createPetProfile/StepProgress";
import PetProfilePreviewCard from "./createPetProfile/PetProfilePreviewCard";

const SellPets = () => {
  const { user } = AuthData();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    name: "",
    category: "Animal",
    type: "",
    breed: "",
    gender: "Not specified",
    age: "",
    dob: "",
    color: "",
    weight: "",
    listingType: "Sale",
    price: "",
    adoptionFee: "",
    city: "",
    state: "",

    // Step 2: Personality
    temperament: [],
    goodWith: [],
    training: [],

    // Step 3: Health Information
    vaccinationStatus: "Up to date",
    dewormed: "Yes",
    microchipped: "No",
    neutered: "No",
    medicalConditions: "",
    currentMedications: "",
    allergies: "",

    // Step 4: Lifestyle
    livingStyle: "House with Yard",
    exerciseRequirement: "Moderate",
    diet: "",
    groomingNeeds: "Moderate",
    energyLevel: "Moderate",

    // Step 5: History & Story
    reasonForRehoming: "",
    birthDate: "",
    adoptionDate: "",
    previousOwner: "",
    petStory: "",

    // Step 6: Media Files
    coverPhoto: null,
    gallery: [],
    videos: [],

    // Step 7: Documents
    vaccinationCertificate: null,
    medicalRecord: null,
    registrationCertificate: null,
    pedigreeCertificate: null,
    ownershipProof: null,
  });

  // Previews State
  const [coverPreview, setCoverPreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);

  // Multi-select options
  const temperamentOptions = ["Friendly", "Playful", "Calm", "Energetic", "Protective", "Shy", "Social", "Intelligent"];
  const goodWithOptions = ["Dogs", "Cats", "Children", "Elderly", "Other Pets"];
  const trainingOptions = ["House Trained", "Leash Trained", "Obedience Trained", "Crate Trained"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectToggle = (field, option) => {
    setFormData((prev) => {
      const list = prev[field] || [];
      if (list.includes(option)) {
        return { ...prev, [field]: list.filter((item) => item !== option) };
      } else {
        return { ...prev, [field]: [...list, option] };
      }
    });
  };

  // Media Handlers
  const handleCoverPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, coverPhoto: file }));
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveCover = () => {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setFormData((prev) => ({ ...prev, coverPhoto: null }));
    setCoverPreview(null);
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 10);
    setFormData((prev) => ({ ...prev, gallery: files }));
    setGalleryPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleRemoveGalleryImage = (index) => {
    if (galleryPreviews[index]) URL.revokeObjectURL(galleryPreviews[index]);
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 2);
    setFormData((prev) => ({ ...prev, videos: files }));
    setVideoPreviews(
      files.map((file) => ({
        url: URL.createObjectURL(file),
        name: file.name,
      }))
    );
  };

  const handleRemoveVideo = (index) => {
    if (videoPreviews[index]?.url) URL.revokeObjectURL(videoPreviews[index].url);
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }));
    setVideoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDocChange = (field, e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [field]: file }));
    }
  };

  // Validation before going to Next step
  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.name.trim()) {
        toast.error("Please enter pet name.");
        return false;
      }
      if (!formData.type.trim()) {
        toast.error("Please enter pet type/species.");
        return false;
      }
      if (!formData.breed.trim()) {
        toast.error("Please enter pet breed.");
        return false;
      }
      if (!formData.age || Number(formData.age) <= 0) {
        toast.error("Please enter a valid age.");
        return false;
      }
      if (formData.listingType === "Sale" && (!formData.price || Number(formData.price) <= 0)) {
        toast.error("Price is required for Sale listings.");
        return false;
      }
    }

    if (step === 6) {
      if (!formData.coverPhoto) {
        toast.error("Please upload a cover photo before proceeding.");
        return false;
      }
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 8));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Final Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.coverPhoto) {
      toast.error("Please upload a cover photo.");
      setCurrentStep(6);
      return;
    }

    setLoading(true);
    const data = new FormData();

    // 1. Basic Info JSON
    const basicInfo = {
      name: formData.name,
      category: formData.category,
      type: formData.type,
      breed: formData.breed,
      gender: formData.gender,
      age: Number(formData.age),
      dob: formData.dob,
      color: formData.color,
      weight: formData.weight,
      listingType: formData.listingType,
      price: Number(formData.price) || 0,
      adoptionFee: Number(formData.adoptionFee) || 0,
      city: formData.city,
      state: formData.state,
    };
    data.append("basicInfo", JSON.stringify(basicInfo));

    // 2. Personality JSON
    const personality = {
      temperament: formData.temperament,
      goodWith: formData.goodWith,
      training: formData.training,
    };
    data.append("personality", JSON.stringify(personality));

    // 3. Health JSON
    const health = {
      vaccinationStatus: formData.vaccinationStatus,
      dewormed: formData.dewormed,
      microchipped: formData.microchipped,
      neutered: formData.neutered,
      medicalConditions: formData.medicalConditions ? [formData.medicalConditions] : [],
      currentMedications: formData.currentMedications ? [formData.currentMedications] : [],
      allergies: formData.allergies ? [formData.allergies] : [],
    };
    data.append("health", JSON.stringify(health));

    // 4. Lifestyle JSON
    const lifestyle = {
      livingStyle: formData.livingStyle,
      exerciseRequirement: formData.exerciseRequirement,
      diet: formData.diet,
      groomingNeeds: formData.groomingNeeds,
      energyLevel: formData.energyLevel,
    };
    data.append("lifestyle", JSON.stringify(lifestyle));

    // 5. History JSON
    const history = {
      reasonForRehoming: formData.reasonForRehoming,
      birthDate: formData.birthDate || formData.dob,
      adoptionDate: formData.adoptionDate,
      previousOwner: formData.previousOwner,
      petStory: formData.petStory,
    };
    data.append("history", JSON.stringify(history));

    // Top-level legacy fields for backward compatibility
    data.append("name", formData.name);
    data.append("category", formData.category);
    data.append("type", formData.type);
    data.append("breed", formData.breed);
    data.append("age", formData.age);
    data.append("price", formData.price || 0);
    data.append("gender", formData.gender);
    data.append("weight", formData.weight);
    data.append("description", formData.petStory);

    // 6. Media Files
    if (formData.coverPhoto) {
      data.append("coverPhoto", formData.coverPhoto);
      data.append("file", formData.coverPhoto);
    }
    formData.gallery.forEach((file) => data.append("gallery", file));
    formData.videos.forEach((file) => data.append("videos", file));

    // 7. Documents
    if (formData.vaccinationCertificate) data.append("vaccinationCertificate", formData.vaccinationCertificate);
    if (formData.medicalRecord) data.append("medicalRecord", formData.medicalRecord);
    if (formData.registrationCertificate) data.append("registrationCertificate", formData.registrationCertificate);
    if (formData.pedigreeCertificate) data.append("pedigreeCertificate", formData.pedigreeCertificate);
    if (formData.ownershipProof) data.append("ownershipProof", formData.ownershipProof);

    try {
      const response = await axios.post("/api/user/sell-pet", data, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 180000,
      });

      if (response.data.success || response.data.product) {
        toast.success("Professional Pet Profile submitted successfully! Awaiting admin verification.");
        // Reset form & progress
        setCurrentStep(1);
        setCoverPreview(null);
        setGalleryPreviews([]);
        setVideoPreviews([]);
      } else {
        toast.error(response.data.message || "Error submitting pet profile.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.response?.data?.message || "Error creating pet profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto my-8 p-4 md:p-8 bg-gray-50/50 min-h-screen">
      {/* Title */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Professional Pet Listing System
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-cyan-950">Create Pet Profile</h1>
        <p className="text-cyan-700 mt-1 text-sm md:text-base">
          Build a comprehensive, verified pet listing to find a loving home.
        </p>
      </div>

      {/* Progress Indicator */}
      <StepProgress currentStep={currentStep} onStepClick={(step) => setCurrentStep(step)} />

      {/* Main Form Content */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-10 transition-all duration-300">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* STEP 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-cyan-900 border-b pb-2 flex items-center gap-2">
                <PawPrint className="text-cyan-600" /> Step 1: Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-1">Pet Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Max, Bella"
                    required
                    className="w-full p-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-1">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 font-medium"
                  >
                    <option value="Animal">Animal</option>
                    <option value="Bird">Bird</option>
                    <option value="Reptile">Reptile</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-1">Type / Species *</label>
                  <input
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    placeholder="e.g. Dog, Cat, Macaw"
                    required
                    className="w-full p-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-1">Breed *</label>
                  <input
                    type="text"
                    name="breed"
                    value={formData.breed}
                    onChange={handleInputChange}
                    placeholder="e.g. Labrador Retriever, Persian"
                    required
                    className="w-full p-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 font-medium"
                  >
                    <option value="Not specified">Not specified</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-1">Age (Years) *</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="e.g. 2"
                    step="0.1"
                    min="0"
                    required
                    className="w-full p-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-1">Date of Birth (Optional)</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-1">Color</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    placeholder="e.g. Black & Tan, White"
                    className="w-full p-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-1">Weight (e.g. 22 kg)</label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="e.g. 22 kg"
                    className="w-full p-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-1">Listing Type</label>
                  <select
                    name="listingType"
                    value={formData.listingType}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 font-medium"
                  >
                    <option value="Sale">For Sale</option>
                    <option value="Adoption">For Adoption</option>
                  </select>
                </div>

                {formData.listingType === "Sale" ? (
                  <div>
                    <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="e.g. 20000"
                      required
                      min="0"
                      className="w-full p-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 font-medium"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-1">Adoption Fee (₹, Optional)</label>
                    <input
                      type="number"
                      name="adoptionFee"
                      value={formData.adoptionFee}
                      onChange={handleInputChange}
                      placeholder="e.g. 0"
                      min="0"
                      className="w-full p-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 font-medium"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Bengaluru, Delhi"
                    className="w-full p-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="e.g. Karnataka"
                    className="w-full p-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Personality */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-cyan-900 border-b pb-2 flex items-center gap-2">
                <Heart className="text-cyan-600" /> Step 2: Personality & Behavioral Traits
              </h2>

              <div>
                <label className="block text-sm font-bold text-cyan-800 mb-2">Temperament Traits</label>
                <div className="flex flex-wrap gap-2">
                  {temperamentOptions.map((opt) => {
                    const active = formData.temperament.includes(opt);
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => handleMultiSelectToggle("temperament", opt)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
                          active
                            ? "bg-cyan-600 text-white shadow-md scale-105"
                            : "bg-cyan-50 text-cyan-800 border border-cyan-200 hover:bg-cyan-100"
                        }`}
                      >
                        {active ? "✓ " : "+ "} {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-cyan-800 mb-2">Good With</label>
                <div className="flex flex-wrap gap-2">
                  {goodWithOptions.map((opt) => {
                    const active = formData.goodWith.includes(opt);
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => handleMultiSelectToggle("goodWith", opt)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
                          active
                            ? "bg-emerald-600 text-white shadow-md scale-105"
                            : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                        }`}
                      >
                        {active ? "✓ " : "+ "} {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-cyan-800 mb-2">Completed Training</label>
                <div className="flex flex-wrap gap-2">
                  {trainingOptions.map((opt) => {
                    const active = formData.training.includes(opt);
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => handleMultiSelectToggle("training", opt)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
                          active
                            ? "bg-blue-600 text-white shadow-md scale-105"
                            : "bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100"
                        }`}
                      >
                        {active ? "✓ " : "+ "} {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Health */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-cyan-900 border-b pb-2 flex items-center gap-2">
                <Activity className="text-cyan-600" /> Step 3: Health Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-1">Vaccination Status</label>
                  <select
                    name="vaccinationStatus"
                    value={formData.vaccinationStatus}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 font-medium"
                  >
                    <option value="Up to date">Up to date</option>
                    <option value="Partially Vaccinated">Partially Vaccinated</option>
                    <option value="Not Vaccinated">Not Vaccinated</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-1">Dewormed</label>
                  <select
                    name="dewormed"
                    value={formData.dewormed}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 font-medium"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-1">Microchipped</label>
                  <select
                    name="microchipped"
                    value={formData.microchipped}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 font-medium"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-1">Neutered / Spayed</label>
                  <select
                    name="neutered"
                    value={formData.neutered}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 font-medium"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-1">Medical Conditions (If any)</label>
                  <input
                    type="text"
                    name="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={handleInputChange}
                    placeholder="e.g. Sensitive stomach, None"
                    className="w-full p-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-1">Current Medications</label>
                  <input
                    type="text"
                    name="currentMedications"
                    value={formData.currentMedications}
                    onChange={handleInputChange}
                    placeholder="e.g. None"
                    className="w-full p-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-1">Allergies</label>
                  <input
                    type="text"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    placeholder="e.g. None"
                    className="w-full p-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Lifestyle */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-cyan-900 border-b pb-2 flex items-center gap-2">
                <Home className="text-cyan-600" /> Step 4: Lifestyle & Care Requirements
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-1">Ideal Living Environment</label>
                  <select
                    name="livingStyle"
                    value={formData.livingStyle}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 font-medium"
                  >
                    <option value="Apartment Friendly">Apartment Friendly</option>
                    <option value="House with Yard">House with Yard</option>
                    <option value="Farm / Rural">Farm / Rural</option>
                    <option value="Any Environment">Any Environment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-1">Exercise Requirement</label>
                  <select
                    name="exerciseRequirement"
                    value={formData.exerciseRequirement}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 font-medium"
                  >
                    <option value="High (2+ hours/day)">High (2+ hours/day)</option>
                    <option value="Moderate (1 hour/day)">Moderate (1 hour/day)</option>
                    <option value="Low (Short walks)">Low (Short walks)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-1">Diet & Nutrition</label>
                  <input
                    type="text"
                    name="diet"
                    value={formData.diet}
                    onChange={handleInputChange}
                    placeholder="e.g. Dry kibble twice daily"
                    className="w-full p-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-1">Grooming Needs</label>
                  <select
                    name="groomingNeeds"
                    value={formData.groomingNeeds}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 font-medium"
                  >
                    <option value="High (Daily brushing)">High (Daily brushing)</option>
                    <option value="Moderate (Weekly grooming)">Moderate (Weekly grooming)</option>
                    <option value="Low (Minimal grooming)">Low (Minimal grooming)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-1">Energy Level</label>
                  <select
                    name="energyLevel"
                    value={formData.energyLevel}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 font-medium"
                  >
                    <option value="High">High</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Low / Calm">Low / Calm</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: History */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-cyan-900 border-b pb-2 flex items-center gap-2">
                <History className="text-cyan-600" /> Step 5: History & Background Story
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-1">Reason for Rehoming</label>
                  <input
                    type="text"
                    name="reasonForRehoming"
                    value={formData.reasonForRehoming}
                    onChange={handleInputChange}
                    placeholder="e.g. Relocating abroad, life changes"
                    className="w-full p-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-1">Birth Date</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-1">Adoption Date (If adopted previously)</label>
                  <input
                    type="date"
                    name="adoptionDate"
                    value={formData.adoptionDate}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 font-medium"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-1">Previous Owner Notes</label>
                  <input
                    type="text"
                    name="previousOwner"
                    value={formData.previousOwner}
                    onChange={handleInputChange}
                    placeholder="e.g. Single owner since puppyhood"
                    className="w-full p-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 font-medium"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-1">Pet Story & Detailed Description</label>
                  <textarea
                    name="petStory"
                    value={formData.petStory}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Describe your pet's life, favorite activities, personality quirks, and habits..."
                    className="w-full p-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-cyan-50/30 font-medium"
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Media Gallery */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-cyan-900 border-b pb-2 flex items-center gap-2">
                <ImageIcon className="text-cyan-600" /> Step 6: Cover Photo, Gallery & Video Previews
              </h2>

              {/* Cover Photo Drag & Drop */}
              <div>
                <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-2">Cover Photo * (Main Image)</label>
                <div className="border-2 border-dashed border-cyan-300 rounded-2xl p-6 text-center hover:bg-cyan-50/50 transition-all">
                  {coverPreview ? (
                    <div className="relative inline-block">
                      <img src={coverPreview} alt="Cover Preview" className="h-52 rounded-xl object-cover shadow-lg border" />
                      <button
                        type="button"
                        onClick={handleRemoveCover}
                        className="absolute -top-3 -right-3 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:scale-110 transition-transform"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center py-4">
                      <Upload size={44} className="text-cyan-500 mb-2 animate-bounce" />
                      <span className="text-sm font-bold text-cyan-800">Upload Cover Image</span>
                      <span className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 10MB</span>
                      <input type="file" accept="image/*" onChange={handleCoverPhotoChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* Photo Gallery (up to 10) */}
              <div>
                <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-2">Photo Gallery (Up to 10 images)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryChange}
                  className="w-full p-3 border border-cyan-200 rounded-xl text-xs bg-cyan-50/30"
                />
                {galleryPreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3">
                    {galleryPreviews.map((src, idx) => (
                      <div key={idx} className="relative group">
                        <img src={src} alt={`Gallery ${idx}`} className="h-24 w-full object-cover rounded-xl border shadow-sm" />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video Upload & HTML5 Player Previews (up to 2) */}
              <div>
                <label className="block text-xs font-bold text-cyan-800 uppercase tracking-wider mb-2">Optional Video Clips (Up to 2 short videos)</label>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoChange}
                  className="w-full p-3 border border-cyan-200 rounded-xl text-xs bg-cyan-50/30"
                />
                {videoPreviews.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                    {videoPreviews.map((vid, idx) => (
                      <div key={idx} className="relative bg-black rounded-xl overflow-hidden shadow-md">
                        <video src={vid.url} controls className="w-full h-40 object-contain" />
                        <button
                          type="button"
                          onClick={() => handleRemoveVideo(idx)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg z-10"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 7: Documents */}
          {currentStep === 7 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-cyan-900 border-b pb-2 flex items-center gap-2">
                <FileCheck className="text-cyan-600" /> Step 7: Documents & Certificates
              </h2>
              <p className="text-xs text-cyan-700">
                Verified certificate uploads speed up admin verification and build buyer confidence.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Vaccination Certificate", field: "vaccinationCertificate" },
                  { label: "Medical Record", field: "medicalRecord" },
                  { label: "Registration Certificate", field: "registrationCertificate" },
                  { label: "Pedigree Certificate", field: "pedigreeCertificate" },
                  { label: "Ownership Proof", field: "ownershipProof" },
                ].map((doc) => (
                  <div key={doc.field} className="p-4 border border-cyan-200 rounded-2xl bg-cyan-50/20">
                    <label className="block text-xs font-bold text-cyan-900 mb-1">{doc.label}</label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleDocChange(doc.field, e)}
                      className="w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700 cursor-pointer"
                    />
                    {formData[doc.field] && (
                      <div className="flex items-center text-xs text-emerald-600 mt-2 font-bold">
                        <CheckCircle size={14} className="mr-1" /> {formData[doc.field].name} selected
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 8: Preview Before Submission */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <PetProfilePreviewCard
                formData={formData}
                coverPreview={coverPreview}
                galleryPreviews={galleryPreviews}
                videoPreviews={videoPreviews}
                user={user}
              />

              <div className="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl font-black text-lg hover:from-cyan-700 hover:to-blue-700 transition-all shadow-xl flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading Profile Media...
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" /> Submit Professional Pet Profile
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Wizard Step Navigation Footer */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-100">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Previous Step
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < 8 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-cyan-600 text-white rounded-xl text-xs font-bold hover:bg-cyan-700 transition-all shadow-md flex items-center gap-1"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellPets;