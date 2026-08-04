import React, { useState } from "react";
import {
  PawPrint,
  MapPin,
  IndianRupee,
  ShieldCheck,
  Heart,
  Activity,
  Home,
  FileCheck,
  UserCheck,
  Play,
} from "lucide-react";

const PetProfilePreviewCard = ({
  formData,
  coverPreview,
  galleryPreviews = [],
  videoPreviews = [],
  user,
}) => {
  const [selectedMedia, setSelectedMedia] = useState(coverPreview || null);

  const isAdoption = formData.listingType === "Adoption";
  const price = isAdoption
    ? Number(formData.adoptionFee || 0)
    : Number(formData.price || 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900">
        <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
        <div>
          <h4 className="font-bold text-sm">Step 8: Preview Before Final Submission</h4>
          <p className="text-xs text-emerald-700 mt-0.5">
            Review your Professional Pet Profile below. Potential buyers and adopters will see this exact layout.
          </p>
        </div>
      </div>

      {/* Hero Media & Summary Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* Media Viewport */}
        <div className="w-full md:w-1/2 bg-gray-900 relative min-h-[380px] flex flex-col justify-between p-4">
          <div className="relative w-full h-[320px] flex items-center justify-center overflow-hidden rounded-2xl bg-black">
            {selectedMedia?.isVideo ? (
              <video src={selectedMedia.url} controls className="w-full h-full object-contain" />
            ) : selectedMedia ? (
              <img
                src={typeof selectedMedia === "string" ? selectedMedia : selectedMedia.url}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-gray-400 text-sm flex flex-col items-center">
                <PawPrint className="w-12 h-12 mb-2 text-cyan-500" />
                No Cover Photo Selected
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <span className="bg-cyan-600/90 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                <PawPrint className="w-3.5 h-3.5" /> {formData.breed || "Mixed Breed"}
              </span>
              <span className="bg-emerald-600/90 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                {isAdoption ? "For Adoption" : "For Sale"}
              </span>
            </div>
          </div>

          {/* Thumbnails switcher */}
          {(galleryPreviews.length > 0 || videoPreviews.length > 0) && (
            <div className="flex gap-2 overflow-x-auto pt-3 no-scrollbar">
              {coverPreview && (
                <img
                  src={coverPreview}
                  alt="Cover"
                  onClick={() => setSelectedMedia(coverPreview)}
                  className={`w-12 h-12 object-cover rounded-lg cursor-pointer border-2 transition-all ${
                    selectedMedia === coverPreview ? "border-cyan-400 scale-105" : "border-transparent opacity-70"
                  }`}
                />
              )}
              {galleryPreviews.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`Gallery ${idx}`}
                  onClick={() => setSelectedMedia(src)}
                  className={`w-12 h-12 object-cover rounded-lg cursor-pointer border-2 transition-all ${
                    selectedMedia === src ? "border-cyan-400 scale-105" : "border-transparent opacity-70"
                  }`}
                />
              ))}
              {videoPreviews.map((vid, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedMedia({ url: vid.url, isVideo: true })}
                  className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer border-2 border-cyan-400 relative"
                >
                  <Play className="w-5 h-5 text-white" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-bold text-cyan-600 uppercase tracking-widest">
              Professional Pet Listing Preview
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-1">{formData.name || "Pet Name"}</h2>
            <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
              <MapPin className="w-4 h-4 text-cyan-500" />
              {formData.city ? `${formData.city}, ${formData.state}` : user?.address || "Location Verified"}
            </p>

            <div className="mt-4 p-4 bg-cyan-50/60 rounded-2xl border border-cyan-100 flex items-baseline justify-between">
              <div>
                <span className="text-xs font-semibold text-cyan-700 uppercase">
                  {isAdoption ? "Adoption Fee" : "Price"}
                </span>
                <div className="text-3xl font-black text-cyan-900 flex items-center">
                  <IndianRupee className="w-6 h-6 mr-0.5" />
                  {price.toLocaleString("en-IN")}
                </div>
              </div>
              <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                Available
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-50 p-2.5 rounded-xl text-center border border-gray-100">
              <span className="block text-[11px] text-gray-400 font-medium">Age</span>
              <span className="text-xs font-bold text-gray-800">{formData.age || 0} Yrs</span>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-xl text-center border border-gray-100">
              <span className="block text-[11px] text-gray-400 font-medium">Gender</span>
              <span className="text-xs font-bold text-gray-800">{formData.gender || "Not specified"}</span>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-xl text-center border border-gray-100">
              <span className="block text-[11px] text-gray-400 font-medium">Weight</span>
              <span className="text-xs font-bold text-gray-800">{formData.weight || "N/A"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sections Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Personality & Traits */}
        <div className="p-6 bg-white rounded-2xl shadow-md border border-gray-100 space-y-4">
          <h4 className="font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
            <Heart className="w-5 h-5 text-cyan-500" /> Personality Traits
          </h4>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase">Temperament</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {formData.temperament.length ? (
                formData.temperament.map((t, i) => (
                  <span key={i} className="px-2.5 py-1 bg-cyan-50 text-cyan-700 rounded-full text-xs font-semibold">
                    ✨ {t}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400">None selected</span>
              )}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-gray-400 uppercase">Good With</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {formData.goodWith.length ? (
                formData.goodWith.map((g, i) => (
                  <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
                    💚 {g}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400">None selected</span>
              )}
            </div>
          </div>
        </div>

        {/* Health Summary */}
        <div className="p-6 bg-white rounded-2xl shadow-md border border-gray-100 space-y-4">
          <h4 className="font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
            <Activity className="w-5 h-5 text-cyan-500" /> Health Records
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-gray-50 rounded-lg">
              <span className="text-gray-400 block">Vaccinated</span>
              <span className="font-bold text-gray-800">{formData.vaccinationStatus}</span>
            </div>
            <div className="p-2.5 bg-gray-50 rounded-lg">
              <span className="text-gray-400 block">Dewormed</span>
              <span className="font-bold text-gray-800">{formData.dewormed}</span>
            </div>
            <div className="p-2.5 bg-gray-50 rounded-lg">
              <span className="text-gray-400 block">Microchipped</span>
              <span className="font-bold text-gray-800">{formData.microchipped}</span>
            </div>
            <div className="p-2.5 bg-gray-50 rounded-lg">
              <span className="text-gray-400 block">Neutered / Spayed</span>
              <span className="font-bold text-gray-800">{formData.neutered}</span>
            </div>
          </div>
        </div>

        {/* Lifestyle & History */}
        <div className="p-6 bg-white rounded-2xl shadow-md border border-gray-100 space-y-3">
          <h4 className="font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
            <Home className="w-5 h-5 text-cyan-500" /> Lifestyle & Background
          </h4>
          <div className="text-xs space-y-2 text-gray-700">
            <div><span className="font-bold text-gray-500">Living Style:</span> {formData.livingStyle}</div>
            <div><span className="font-bold text-gray-500">Exercise:</span> {formData.exerciseRequirement}</div>
            <div><span className="font-bold text-gray-500">Diet:</span> {formData.diet || "Standard"}</div>
            {formData.petStory && (
              <div className="pt-2 border-t text-gray-600 italic">
                "{formData.petStory}"
              </div>
            )}
          </div>
        </div>

        {/* Documents & Seller Profile */}
        <div className="p-6 bg-white rounded-2xl shadow-md border border-gray-100 space-y-4">
          <h4 className="font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
            <UserCheck className="w-5 h-5 text-cyan-500" /> Seller & Documents
          </h4>
          <div className="text-xs space-y-1.5 text-gray-700">
            <div><span className="font-bold text-gray-500">Seller:</span> {user?.name || "Verified User"}</div>
            <div><span className="font-bold text-gray-500">Email:</span> {user?.email}</div>
            <div><span className="font-bold text-gray-500">Mobile:</span> {user?.mobile}</div>
          </div>

          <div className="pt-2 border-t flex flex-wrap gap-2 text-[11px]">
            {formData.vaccinationCertificate && <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">✓ Vaccination Cert</span>}
            {formData.medicalRecord && <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">✓ Medical Record</span>}
            {formData.registrationCertificate && <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">✓ Reg Cert</span>}
            {formData.pedigreeCertificate && <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">✓ Pedigree</span>}
            {formData.ownershipProof && <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">✓ Ownership Proof</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetProfilePreviewCard;
