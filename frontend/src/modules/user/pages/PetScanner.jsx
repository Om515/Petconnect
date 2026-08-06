import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Image as ImageIcon, X, AlertCircle, CheckCircle2, DollarSign, Activity, Zap, Dog } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { AuthData } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PetScanner = () => {
  const { isAuthenticated } = AuthData();
  const navigate = useNavigate();
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [rateLimitHit, setRateLimitHit] = useState(false);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null); // Clear previous results
      setRateLimitHit(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1
  });

  const clearSelection = (e) => {
    e.stopPropagation();
    setSelectedImage(null);
    setPreviewUrl('');
    setResult(null);
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setResult(null);
    setRateLimitHit(false);

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const endpoint = isAuthenticated ? '/api/ai/scan-auth' : '/api/ai/scan-guest';
      const response = await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      if (response.data.success) {
        setResult(response.data.data);
        toast.success("Analysis Complete!");
      }

    } catch (error) {
      if (error.response && error.response.status === 429) {
        setRateLimitHit(true);
        toast.error("Daily scan limit reached!");
      } else if (error.response && error.response.status === 400) {
         toast.error(error.response.data.message || "Invalid image. Is this a pet?");
      } else {
        toast.error("Failed to analyze image. Please try again.");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Helper for rendering boolean features
  const FeatureBadge = ({ active, label }) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {active ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {label}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-600 mb-4">
            Discover Any Pet
          </h1>
          <p className="text-lg text-gray-600">
            Upload a photo to instantly identify the breed, traits, and care needs using our advanced AI.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT SIDE: Upload Zone & Preview */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden p-8 border border-gray-100 h-fit sticky top-24">
            {!selectedImage ? (
              <div 
                {...getRootProps()} 
                className={`border-4 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[400px]
                  ${isDragActive ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-teal-400 hover:bg-gray-50'}`}
              >
                <input {...getInputProps()} />
                <div className={`p-4 rounded-full mb-4 ${isDragActive ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-500'}`}>
                  <UploadCloud size={48} />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {isDragActive ? 'Drop your photo here!' : 'Drag & drop a pet photo'}
                </h3>
                <p className="text-gray-500">or click to browse from your device</p>
              </div>
            ) : (
              <AnimatePresence>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-teal-100 bg-gray-100 flex flex-col items-center justify-center min-h-[400px]"
                >
                  <img src={previewUrl} alt="Pet Preview" className="w-full h-auto max-h-[500px] object-cover" />
                  
                  <button onClick={clearSelection} className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-lg transition-transform hover:scale-110">
                    <X size={20} />
                  </button>

                  {!result && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6 text-center pt-24">
                       <button 
                         onClick={analyzeImage}
                         disabled={loading || rateLimitHit}
                         className={`font-bold py-3 px-8 rounded-full shadow-xl transition-all w-full max-w-sm mx-auto flex items-center justify-center gap-2
                           ${loading ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:shadow-2xl hover:scale-105'}`}
                       >
                         {loading ? (
                           <>
                             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                             Scanning AI Core...
                           </>
                         ) : (
                           <>
                             <ImageIcon size={20} />
                             Analyze Pet Now
                           </>
                         )}
                       </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* RIGHT SIDE: Results Zone */}
          <div className="h-full">
            {/* Rate Limit Modal / Warning */}
            {rateLimitHit && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl shadow-md h-full flex flex-col justify-center items-center text-center">
                <AlertCircle className="text-red-500 mb-4" size={48} />
                <h3 className="text-2xl font-bold text-red-700 mb-2">Daily Limit Reached</h3>
                <p className="text-red-600 mb-6 font-medium">You've used your 2 free anonymous scans for today.</p>
                <a href="/login" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all hover:scale-105 w-full max-w-xs block text-center">
                  Log in to continue
                </a>
              </motion.div>
            )}

            {/* Empty State before result */}
            {!result && !rateLimitHit && (
              <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 h-full flex flex-col items-center justify-center text-center opacity-70">
                <Dog size={64} className="text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-400">Awaiting Pet Scan</h3>
                <p className="text-gray-400 max-w-xs mx-auto mt-2">Upload a photo and click analyze to see breed, pricing, and health insights here.</p>
              </div>
            )}

            {/* Populated Result Data */}
            {result && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pb-20">
                
                {/* Thumbnail Context (Sticky) */}
                <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-sm border border-gray-100 sticky top-20 z-10">
                  <img src={previewUrl} alt="Analyzed Pet" className="w-14 h-14 rounded-full object-cover border-2 border-teal-500 shadow-sm" />
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 leading-tight">AI Analysis Complete</h3>
                    <p className="text-xs text-gray-500">Based on your uploaded photo</p>
                  </div>
                </div>

                {/* Hero / Identification (Elevated visual weight) */}
                <div className="bg-gradient-to-br from-teal-500 to-cyan-700 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 opacity-10 pointer-events-none -mt-4 -mr-4 transform rotate-12">
                    <Dog size={140} />
                  </div>
                  
                  <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                      <h2 className="text-4xl sm:text-5xl font-black mb-2 drop-shadow-md">{result.identification.primaryBreed}</h2>
                      {result.identification.possibleMix && result.identification.possibleMix.toLowerCase() !== "none" && (
                        <p className="text-teal-100 font-medium italic opacity-90">{result.identification.possibleMix}</p>
                      )}
                    </div>

                    {/* Circular Progress Bar for Confidence */}
                    <div className="flex items-center gap-3 bg-white/20 px-4 py-3 rounded-2xl backdrop-blur-sm border border-white/30 whitespace-nowrap shrink-0">
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="24" cy="24" r="20" fill="none" className="stroke-white/30" strokeWidth="4"></circle>
                          <circle cx="24" cy="24" r="20" fill="none" className="stroke-white drop-shadow-md" strokeWidth="4" strokeDasharray={`${(result.identification.confidenceScore / 100) * 125.6} 125.6`}></circle>
                        </svg>
                        <span className="absolute text-sm font-black">{result.identification.confidenceScore}%</span>
                      </div>
                      <div className="text-sm font-bold leading-tight">
                        Match<br />Confidence
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid stats (Slightly less visual weight) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Age Stage</p>
                    <p className="text-gray-700 font-semibold">{result.physicalTraits.estimatedAgeStage}</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Size & Weight</p>
                    <p className="text-gray-700 font-semibold">{result.physicalTraits.sizeCategory} ({result.physicalTraits.weightRange})</p>
                  </div>
                </div>

                {/* Compatibility Badges */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-md font-bold text-gray-700 mb-4 flex items-center gap-2"><Activity size={18} className="text-cyan-500"/> Compatibility & Traits</h3>
                  <div className="flex flex-wrap gap-3 mb-4">
                    <FeatureBadge active={result.compatibility.goodWithKids} label="Good with Kids" />
                    <FeatureBadge active={result.compatibility.goodWithOtherPets} label="Good with Pets" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4 bg-gray-50 p-4 rounded-xl">
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold mb-1">Energy</p>
                      <p className="font-medium text-gray-700 text-sm">{result.compatibility.energyLevel}</p>
                    </div>
                    <div>
                       <p className="text-xs text-gray-400 uppercase font-bold mb-1">Trainability</p>
                       <p className="font-medium text-gray-700 text-sm">{result.compatibility.trainability}</p>
                    </div>
                  </div>
                </div>

                {/* Market & Financials */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-md font-bold text-gray-700 mb-3 flex items-center gap-2"><DollarSign size={18} className="text-green-500"/> Financial Insights</h3>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-2xl font-black text-gray-800">
                      ₹{result.marketInsights.estimatedPriceRange.min.toLocaleString()} - ₹{result.marketInsights.estimatedPriceRange.max.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 italic mb-4">{result.marketInsights.estimatedPriceRange.disclaimer}</p>
                  
                  <div className="bg-green-50 border border-green-100 p-3 rounded-xl">
                    <p className="text-sm text-green-800 font-medium"><strong>Est. Monthly Care:</strong> {result.marketInsights.maintenanceCostMonthly}</p>
                  </div>
                </div>

                {/* Fun Fact (Restyled to Cyan/Teal) */}
                <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-5 shadow-sm">
                  <p className="text-sm text-cyan-800 font-medium flex gap-2">
                    <Zap className="text-cyan-500 shrink-0" size={18} />
                    {result.funFact}
                  </p>
                </div>

                {/* Call To Action */}
                <button 
                  onClick={() => navigate('/sell-pet', { state: { autoFillBreed: result.identification.primaryBreed } })}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 mt-4"
                >
                  <UploadCloud size={22} />
                  List a {result.identification.primaryBreed} for sale
                </button>

              </motion.div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PetScanner;
