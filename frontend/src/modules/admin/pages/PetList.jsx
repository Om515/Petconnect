import { useEffect, useState } from "react";
import axios from "axios";
import {
  CheckIcon,
  XIcon,
  IndianRupee,
  PawPrint,
  Heart,
  Activity,
  Home,
  History,
  Image as ImageIcon,
  FileCheck,
  UserCheck,
  Eye,
  ShieldAlert,
  X,
  ExternalLink,
} from "lucide-react";
import { AdminData } from "../context/AdminContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

const PetList = () => {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [activeDocModal, setActiveDocModal] = useState(null);
  const { petApprove, petReject } = AdminData();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/api/admin/get-pet-list")
      .then((res) => {
        if (res.data.success) {
          setPets(res.data.petContent);
        }
      })
      .catch((err) => console.error("Error fetching pets for admin review:", err));
  }, []);

  const handleApprove = (id) => {
    petApprove(id, navigate);
    setSelectedPet(null);
    window.location.reload();
  };

  const handleReject = (id) => {
    petReject(id, navigate);
    setSelectedPet(null);
    window.location.reload();
  };

  const getDocUrl = (doc) => {
    if (!doc) return null;
    if (typeof doc === "string") return doc;
    return doc.url || doc.secure_url || null;
  };

  return (
    <>
      <Sidebar />
      <div className="p-6 bg-gradient-to-b from-blue-50 to-cyan-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6 border-b-2 border-teal-500 pb-3">
            <div>
              <h1 className="text-3xl font-extrabold text-teal-800">
                Admin Pet Verification Dashboard
              </h1>
              <p className="text-teal-600 text-sm mt-1">
                Audit complete Professional Pet Profiles before approving for public marketplace listing.
              </p>
            </div>
            <span className="bg-teal-100 text-teal-800 text-xs font-extrabold px-3 py-1.5 rounded-full border border-teal-300">
              {pets.length} Pending Approval
            </span>
          </div>

          {pets.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-teal-100">
              <div className="text-teal-500 text-6xl mb-4">🐾</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Pet Profiles Waiting for Approval</h2>
              <p className="text-gray-500 text-sm">All submitted pet listings have been audited and processed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pets.map((pet) => {
                const basic = pet.basicInfo || {};
                const media = pet.media || {};
                const owner = pet.owner || {};
                const isAdoption = basic.listingType === "Adoption";
                const petName = basic.name || pet.breed;
                const coverImg = media.coverPhoto?.url || pet.image?.url;

                return (
                  <div
                    key={pet._id}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Header */}
                      <div className="relative">
                        <img
                          src={coverImg}
                          alt={petName}
                          className="w-full h-52 object-cover"
                        />
                        <div className="absolute top-3 left-3 bg-teal-600/90 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-md">
                          {pet.breed}
                        </div>
                        <div className="absolute top-3 right-3 bg-black/70 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold">
                          {isAdoption ? "Adoption" : "For Sale"}
                        </div>
                      </div>

                      {/* Content Card */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-extrabold text-gray-900 truncate">{petName}</h2>
                          <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded font-bold">
                            {pet.type}
                          </span>
                        </div>

                        <div className="flex items-center text-teal-700 font-black text-lg">
                          <IndianRupee className="h-5 w-5 mr-0.5 text-teal-600" />
                          {isAdoption
                            ? basic.adoptionFee > 0 ? `${basic.adoptionFee} (Fee)` : "Free Adoption"
                            : `${pet.price}`}
                        </div>

                        <div className="text-xs text-gray-500 space-y-1 pt-1 border-t border-gray-100">
                          <div><span className="font-semibold text-gray-700">Seller:</span> {owner.name || "Owner Profile"}</div>
                          <div><span className="font-semibold text-gray-700">Category:</span> {basic.category || pet.category}</div>
                          <div><span className="font-semibold text-gray-700">Age:</span> {basic.age || pet.age} Yrs</div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-2">
                      <button
                        onClick={() => setSelectedPet(pet)}
                        className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition duration-200 flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Eye className="w-4 h-4" /> Audit Complete Profile
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(pet._id)}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition duration-200 flex items-center justify-center gap-1 shadow-sm"
                        >
                          <CheckIcon className="h-4 w-4" /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(pet._id)}
                          className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition duration-200 flex items-center justify-center gap-1 shadow-sm"
                        >
                          <XIcon className="h-4 w-4" /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* FULL PROFESSIONAL PET PROFILE REVIEW MODAL */}
      {selectedPet && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 relative animate-fadeIn p-6 md:p-8 space-y-6">
            
            {/* Modal Close Button */}
            <button
              onClick={() => setSelectedPet(null)}
              className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-full transition-colors shadow-md"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Title */}
            <div className="border-b pb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-800 rounded-full text-xs font-bold uppercase tracking-wider mb-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Admin Audit Mode
              </span>
              <h2 className="text-2xl font-extrabold text-gray-900">
                {selectedPet.basicInfo?.name ? `${selectedPet.basicInfo.name} (${selectedPet.breed})` : selectedPet.breed}
              </h2>
              <p className="text-xs text-gray-500">
                Submitted on {new Date(selectedPet.createdAt).toLocaleDateString()} by {selectedPet.owner?.name || "Seller"}
              </p>
            </div>

            {/* 1. Basic Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-teal-800 uppercase tracking-wider flex items-center gap-2 border-b pb-1">
                <PawPrint className="w-4 h-4 text-teal-600" /> 1. Basic Information
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div><span className="text-gray-400 block">Name</span><span className="font-bold text-gray-800">{selectedPet.basicInfo?.name || "N/A"}</span></div>
                <div><span className="text-gray-400 block">Category</span><span className="font-bold text-gray-800">{selectedPet.basicInfo?.category || selectedPet.category}</span></div>
                <div><span className="text-gray-400 block">Type / Species</span><span className="font-bold text-gray-800">{selectedPet.type}</span></div>
                <div><span className="text-gray-400 block">Breed</span><span className="font-bold text-gray-800">{selectedPet.breed}</span></div>
                <div><span className="text-gray-400 block">Gender</span><span className="font-bold text-gray-800">{selectedPet.gender}</span></div>
                <div><span className="text-gray-400 block">Age</span><span className="font-bold text-gray-800">{selectedPet.age} Yrs</span></div>
                <div><span className="text-gray-400 block">Color</span><span className="font-bold text-gray-800">{selectedPet.basicInfo?.color || "N/A"}</span></div>
                <div><span className="text-gray-400 block">Weight</span><span className="font-bold text-gray-800">{selectedPet.weight}</span></div>
                <div><span className="text-gray-400 block">Listing Type</span><span className="font-bold text-gray-800">{selectedPet.basicInfo?.listingType || "Sale"}</span></div>
                <div><span className="text-gray-400 block">Price / Fee</span><span className="font-bold text-teal-700">₹{selectedPet.price}</span></div>
                <div><span className="text-gray-400 block">City</span><span className="font-bold text-gray-800">{selectedPet.basicInfo?.city || "N/A"}</span></div>
                <div><span className="text-gray-400 block">State</span><span className="font-bold text-gray-800">{selectedPet.basicInfo?.state || "N/A"}</span></div>
              </div>
            </div>

            {/* 2. Personality */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-teal-800 uppercase tracking-wider flex items-center gap-2 border-b pb-1">
                <Heart className="w-4 h-4 text-teal-600" /> 2. Personality & Behavioral Traits
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-bold text-gray-500">Temperament:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedPet.personality?.temperament?.length ? (
                      selectedPet.personality.temperament.map((t, i) => <span key={i} className="px-2 py-0.5 bg-cyan-50 text-cyan-800 rounded font-semibold">✨ {t}</span>)
                    ) : <span className="text-gray-400">None specified</span>}
                  </div>
                </div>
                <div>
                  <span className="font-bold text-gray-500">Good With:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedPet.personality?.goodWith?.length ? (
                      selectedPet.personality.goodWith.map((g, i) => <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-semibold">💚 {g}</span>)
                    ) : <span className="text-gray-400">None specified</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Health */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-teal-800 uppercase tracking-wider flex items-center gap-2 border-b pb-1">
                <Activity className="w-4 h-4 text-teal-600" /> 3. Health Information
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-emerald-50 rounded-lg"><span className="text-gray-400 block">Vaccinated</span><span className="font-bold text-emerald-900">{selectedPet.health?.vaccinationStatus || selectedPet.vaccinated}</span></div>
                <div className="p-2.5 bg-blue-50 rounded-lg"><span className="text-gray-400 block">Dewormed</span><span className="font-bold text-blue-900">{selectedPet.health?.dewormed || "N/A"}</span></div>
                <div className="p-2.5 bg-purple-50 rounded-lg"><span className="text-gray-400 block">Microchipped</span><span className="font-bold text-purple-900">{selectedPet.health?.microchipped || "N/A"}</span></div>
                <div className="p-2.5 bg-pink-50 rounded-lg"><span className="text-gray-400 block">Neutered</span><span className="font-bold text-pink-900">{selectedPet.health?.neutered || selectedPet.neutered}</span></div>
              </div>
            </div>

            {/* 4. Lifestyle */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-teal-800 uppercase tracking-wider flex items-center gap-2 border-b pb-1">
                <Home className="w-4 h-4 text-teal-600" /> 4. Lifestyle & Care Requirements
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded-xl">
                <div><span className="text-gray-400 block">Living Environment</span><span className="font-bold text-gray-800">{selectedPet.lifestyle?.livingStyle || "House with Yard"}</span></div>
                <div><span className="text-gray-400 block">Exercise Need</span><span className="font-bold text-gray-800">{selectedPet.lifestyle?.exerciseRequirement || "Moderate"}</span></div>
                <div><span className="text-gray-400 block">Diet</span><span className="font-bold text-gray-800">{selectedPet.lifestyle?.diet || "Standard"}</span></div>
                <div><span className="text-gray-400 block">Grooming Needs</span><span className="font-bold text-gray-800">{selectedPet.lifestyle?.groomingNeeds || "Moderate"}</span></div>
              </div>
            </div>

            {/* 5. History */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-teal-800 uppercase tracking-wider flex items-center gap-2 border-b pb-1">
                <History className="w-4 h-4 text-teal-600" /> 5. Background Story & Rehoming Reason
              </h3>
              <div className="text-xs space-y-2 text-gray-700 bg-gray-50 p-3 rounded-xl">
                <div><span className="font-bold text-gray-500">Reason for Rehoming:</span> {selectedPet.history?.reasonForRehoming || "N/A"}</div>
                <div><span className="font-bold text-gray-500">Pet Description / Story:</span> {selectedPet.description}</div>
              </div>
            </div>

            {/* 6 & 7. Media Gallery & Videos */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-teal-800 uppercase tracking-wider flex items-center gap-2 border-b pb-1">
                <ImageIcon className="w-4 h-4 text-teal-600" /> 6 & 7. Media Gallery & Videos
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {selectedPet.media?.coverPhoto?.url && (
                  <a href={selectedPet.media.coverPhoto.url} target="_blank" rel="noreferrer" className="relative group">
                    <img src={selectedPet.media.coverPhoto.url} alt="Cover" className="h-20 w-full object-cover rounded-lg border shadow-sm" />
                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1 rounded">Cover</span>
                  </a>
                )}
                {selectedPet.media?.gallery?.map((img, idx) => (
                  <a key={idx} href={img.url} target="_blank" rel="noreferrer">
                    <img src={img.url} alt={`Gallery ${idx}`} className="h-20 w-full object-cover rounded-lg border shadow-sm hover:opacity-80" />
                  </a>
                ))}
              </div>

              {/* Videos */}
              {selectedPet.media?.videos?.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {selectedPet.media.videos.map((vid, idx) => (
                    <video key={idx} src={vid.url} controls className="w-full h-36 object-contain bg-black rounded-xl" />
                  ))}
                </div>
              )}
            </div>

            {/* 8. Documents */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-teal-800 uppercase tracking-wider flex items-center gap-2 border-b pb-1">
                <FileCheck className="w-4 h-4 text-teal-600" /> 8. Certificates & Documents
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { label: "Vaccination Cert", doc: selectedPet.documents?.vaccinationCertificate },
                  { label: "Medical Record", doc: selectedPet.documents?.medicalRecord },
                  { label: "Registration Cert", doc: selectedPet.documents?.registrationCertificate },
                  { label: "Pedigree Cert", doc: selectedPet.documents?.pedigreeCertificate },
                  { label: "Ownership Proof", doc: selectedPet.documents?.ownershipProof },
                ].map((item, idx) => {
                  const docUrl = getDocUrl(item.doc);
                  return (
                    <div key={idx} className="p-3 bg-gray-50 rounded-xl border flex items-center justify-between">
                      <span className="font-semibold text-gray-800">{item.label}</span>
                      {docUrl ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveDocModal({ title: item.label, url: docUrl })}
                            className="px-3 py-1 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 transition-colors shadow-sm"
                          >
                            View Certificate
                          </button>
                          <a
                            href={docUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-gray-500 hover:text-teal-700 transition-colors"
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-gray-400 font-medium">Not Uploaded</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 9. Seller Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-teal-800 uppercase tracking-wider flex items-center gap-2 border-b pb-1">
                <UserCheck className="w-4 h-4 text-teal-600" /> 9. Seller Information (System Populated)
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs bg-teal-50/60 p-4 rounded-xl border border-teal-100">
                <div><span className="text-gray-500 block">Seller Name</span><span className="font-bold text-gray-900">{selectedPet.owner?.name || "N/A"}</span></div>
                <div><span className="text-gray-500 block">Email Address</span><span className="font-bold text-gray-900">{selectedPet.owner?.email || "N/A"}</span></div>
                <div><span className="text-gray-500 block">Mobile Contact</span><span className="font-bold text-gray-900">{selectedPet.owner?.mobile || "N/A"}</span></div>
                <div><span className="text-gray-500 block">Address</span><span className="font-bold text-gray-900">{selectedPet.owner?.address || "N/A"}</span></div>
              </div>
            </div>

            {/* Modal Approval Actions */}
            <div className="flex gap-4 pt-4 border-t sticky bottom-0 bg-white">
              <button
                onClick={() => handleApprove(selectedPet._id)}
                className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-sm transition shadow-lg flex items-center justify-center gap-2"
              >
                <CheckIcon className="w-5 h-5" /> Approve Listing
              </button>
              <button
                onClick={() => handleReject(selectedPet._id)}
                className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-extrabold text-sm transition shadow-lg flex items-center justify-center gap-2"
              >
                <XIcon className="w-5 h-5" /> Reject Listing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT CERTIFICATE LIGHTBOX PREVIEW MODAL */}
      {activeDocModal && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl relative space-y-4 animate-fadeIn">
            <button
              onClick={() => setActiveDocModal(null)}
              className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-full transition-colors shadow-md"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between pr-10">
              <h3 className="text-xl font-extrabold text-gray-900">{activeDocModal.title}</h3>
              <a
                href={activeDocModal.url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 transition-colors flex items-center gap-1"
              >
                Open Original <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="w-full bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center min-h-[400px]">
              {activeDocModal.url?.endsWith(".pdf") || activeDocModal.url?.includes("/pdf/") ? (
                <iframe src={activeDocModal.url} className="w-full h-[500px] border-0" title="Document Preview" />
              ) : (
                <img
                  src={activeDocModal.url}
                  alt={activeDocModal.title}
                  className="max-h-[500px] w-auto object-contain mx-auto"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PetList;