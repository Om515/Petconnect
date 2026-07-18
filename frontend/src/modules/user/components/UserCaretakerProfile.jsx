// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { Star, ArrowLeft, Phone, Mail, Clock, Award, DollarSign, Calendar, MapPin, Heart } from 'lucide-react';
// import { toast } from 'react-hot-toast';

// const CaretakerProfile = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [caretaker, setCaretaker] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [isFavorite, setIsFavorite] = useState(false);

//   useEffect(() => {
//     const fetchCaretaker = async () => {
//       try {
//         const response = await axios.get(`/api/user/caretakers/${id}`);
//         setCaretaker(response.data.caretaker);
//         // Check if favorite (you'll need to implement this logic)
//         setIsFavorite(false); // Temporary - replace with actual check
//       } catch (err) {
//         setError(err.response?.data?.message || 'Failed to fetch caretaker');
//         toast.error('Failed to load caretaker profile');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCaretaker();
//   }, [id]);

//   const handleHire = () => {
//     toast.success('Hire request sent! We will contact you shortly.');
//     // Implement actual hire functionality
//   };

//   const toggleFavorite = () => {
//     setIsFavorite(!isFavorite);
//     toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
//     // Implement actual favorite functionality
//   };

//   if (loading) return (
//     <div className="flex justify-center items-center min-h-[60vh]">
//       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
//     </div>
//   );

//   if (error) return (
//     <div className="text-center py-12">
//       <div className="bg-red-50 border-l-4 border-red-500 p-4 max-w-md mx-auto">
//         <h3 className="text-lg font-medium text-red-800">{error}</h3>
//         <button
//           onClick={() => window.location.reload()}
//           className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
//         >
//           Try Again
//         </button>
//       </div>
//     </div>
//   );

//   if (!caretaker) return (
//     <div className="text-center py-12">
//       <h3 className="text-xl font-medium text-gray-700">Caretaker not found</h3>
//       <button
//         onClick={() => navigate('/caretakers')}
//         className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
//       >
//         Browse Caretakers
//       </button>
//     </div>
//   );

//   return (
//     <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       <button 
//         onClick={() => navigate(-1)}
//         className="flex items-center text-cyan-600 hover:text-cyan-800 mb-6 transition-colors"
//       >
//         <ArrowLeft className="mr-2" size={20} />
//         Back to Caretakers
//       </button>
      
//       <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//         {/* Profile Header */}
//         <div className="relative">
//           <div className="h-48 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
//           <div className="absolute -bottom-16 left-6">
//             <div className="h-32 w-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
//               {caretaker.image ? (
//                 <img src={caretaker.image} alt={caretaker.fullName} className="h-full w-full object-cover" />
//               ) : (
//                 <div className="h-full w-full bg-cyan-100 flex items-center justify-center">
//                   <span className="text-4xl font-bold text-cyan-600">
//                     {caretaker.fullName.charAt(0)}
//                   </span>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Profile Content */}
//         <div className="pt-20 px-6 pb-6">
//           <div className="flex justify-between items-start mb-6">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-800">{caretaker.fullName}</h1>
//               <div className="flex items-center mt-2">
//                 <div className="flex text-amber-400">
//                   {[...Array(5)].map((_, i) => (
//                     <Star 
//                       key={i} 
//                       size={18} 
//                       fill={i < (caretaker.rating || 4) ? 'currentColor' : 'none'} 
//                     />
//                   ))}
//                 </div>
//                 <span className="ml-2 text-gray-600">({caretaker.reviews || 12} reviews)</span>
//               </div>
//             </div>
//             <button 
//               onClick={toggleFavorite}
//               className={`p-2 rounded-full ${isFavorite ? 'text-red-500' : 'text-gray-400'} hover:text-red-500 transition-colors`}
//             >
//               <Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} />
//             </button>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             {/* Left Column */}
//             <div className="space-y-6">
//               <div className="bg-gray-50 rounded-lg p-6">
//                 <h2 className="text-xl font-semibold mb-4 text-gray-800">Contact Info</h2>
//                 <div className="space-y-4">
//                   <div className="flex items-start">
//                     <Mail className="text-cyan-600 mt-1 mr-3 flex-shrink-0" size={18} />
//                     <div>
//                       <p className="text-sm text-gray-500">Email</p>
//                       <p className="text-gray-800">{caretaker.applicant?.email || 'Not provided'}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-start">
//                     <Phone className="text-cyan-600 mt-1 mr-3 flex-shrink-0" size={18} />
//                     <div>
//                       <p className="text-sm text-gray-500">Phone</p>
//                       <p className="text-gray-800">{caretaker.mobile || 'Not provided'}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-start">
//                     <MapPin className="text-cyan-600 mt-1 mr-3 flex-shrink-0" size={18} />
//                     <div>
//                       <p className="text-sm text-gray-500">Location</p>
//                       <p className="text-gray-800">{caretaker.location || 'Not specified'}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-gray-50 rounded-lg p-6">
//                 <h2 className="text-xl font-semibold mb-4 text-gray-800">Service Details</h2>
//                 <div className="space-y-4">
//                   <div className="flex items-start">
//                     <DollarSign className="text-cyan-600 mt-1 mr-3 flex-shrink-0" size={18} />
//                     <div>
//                       <p className="text-sm text-gray-500">Hourly Rate</p>
//                       <p className="text-gray-800">₹{caretaker.hourlyRate}/hour</p>
//                     </div>
//                   </div>
//                   <div className="flex items-start">
//                     <Clock className="text-cyan-600 mt-1 mr-3 flex-shrink-0" size={18} />
//                     <div>
//                       <p className="text-sm text-gray-500">Availability</p>
//                       <p className="text-gray-800 capitalize">{caretaker.availability.toLowerCase()}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-start">
//                     <Award className="text-cyan-600 mt-1 mr-3 flex-shrink-0" size={18} />
//                     <div>
//                       <p className="text-sm text-gray-500">Experience</p>
//                       <p className="text-gray-800">{caretaker.experience} years</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Middle Column */}
//             <div className="space-y-6">
//               <div className="bg-gray-50 rounded-lg p-6">
//                 <h2 className="text-xl font-semibold mb-4 text-gray-800">About</h2>
//                 <p className="text-gray-700 whitespace-pre-line">
//                   {caretaker.description || 'No description provided'}
//                 </p>
//               </div>

//               <div className="bg-gray-50 rounded-lg p-6">
//                 <h2 className="text-xl font-semibold mb-4 text-gray-800">Skills</h2>
//                 <div className="flex flex-wrap gap-2">
//                   {caretaker.skills.map((skill, index) => (
//                     <span 
//                       key={index} 
//                       className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm font-medium"
//                     >
//                       {skill}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Right Column */}
//             <div className="space-y-6">
//               <div className="bg-gray-50 rounded-lg p-6">
//                 <h2 className="text-xl font-semibold mb-4 text-gray-800">Hire {caretaker.fullName.split(' ')[0]}</h2>
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Service Needed</label>
//                     <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
//                       <option>Pet Sitting</option>
//                       <option>Dog Walking</option>
//                       <option>Grooming</option>
//                       <option>Training</option>
//                       <option>Other</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
//                     <div className="relative">
//                       <input 
//                         type="date" 
//                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" 
//                       />
//                       <Calendar className="absolute right-3 top-3 text-gray-400" size={18} />
//                     </div>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Hours Needed</label>
//                     <input 
//                       type="number" 
//                       min="1" 
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" 
//                       placeholder="2" 
//                     />
//                   </div>
//                   <button
//                     onClick={handleHire}
//                     className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
//                   >
//                     Request Booking (₹{caretaker.hourlyRate}/hr)
//                   </button>
//                 </div>
//               </div>

//               <div className="bg-gray-50 rounded-lg p-6">
//                 <h2 className="text-xl font-semibold mb-4 text-gray-800">Pricing</h2>
//                 <div className="space-y-3">
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Hourly Rate</span>
//                     <span className="font-medium">₹{caretaker.hourlyRate}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Estimated 2 hours</span>
//                     <span className="font-medium">₹{caretaker.hourlyRate * 2}</span>
//                   </div>
//                   <div className="border-t border-gray-200 pt-2 flex justify-between">
//                     <span className="text-gray-800 font-medium">Total</span>
//                     <span className="text-cyan-600 font-bold">₹{caretaker.hourlyRate * 2}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CaretakerProfile;


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
} from "lucide-react";
import { toast } from "react-hot-toast";

const UserCaretakerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caretaker, setCaretaker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [formData, setFormData] = useState({
    service: "Pet Sitting",
    date: "",
    hours: 2,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCaretaker = async () => {
      try {
        console.log("Fetching caretaker profile for ID:", id);
        const response = await axios.get(`/api/user/caretakers/${id}`, {
          withCredentials: true,
        });
        console.log("Caretaker profile response:", response.data);
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
        toast.success(response.data.message);
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
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-red-800">{error}</h3>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  if (!caretaker)
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-700">Caretaker not found</h3>
        <button
          onClick={() => navigate("/caretakers")}
          className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
        >
          Browse Caretakers
        </button>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-cyan-600 hover:text-cyan-800 mb-6 transition-colors"
      >
        <ArrowLeft className="mr-2" size={20} />
        Back to Caretakers
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="relative">
          <div className="h-48 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
          <div className="absolute -bottom-16 left-6">
            <div className="h-32 w-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
              {caretaker.image ? (
                <img
                  src={caretaker.image}
                  alt={caretaker.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-cyan-100 flex items-center justify-center">
                  <span className="text-4xl font-bold text-cyan-600">
                    {caretaker.fullName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-20 px-6 pb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{caretaker.fullName}</h1>
              <div className="flex items-center mt-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      fill={i < (caretaker.rating || 4) ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <span className="ml-2 text-gray-600">
                  ({caretaker.reviews || 12} reviews)
                </span>
              </div>
            </div>
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-full ${
                isFavorite ? "text-red-500" : "text-gray-400"
              } hover:text-red-500 transition-colors`}
            >
              <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Contact Info</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Mail className="text-cyan-600 mt-1 mr-3 flex-shrink-0" size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-800">{caretaker.email || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="text-cyan-600 mt-1 mr-3 flex-shrink-0" size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-800">{caretaker.mobile || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="text-cyan-600 mt-1 mr-3 flex-shrink-0" size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-gray-800">{caretaker.location || "Not specified"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Service Details</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <DollarSign className="text-cyan-600 mt-1 mr-3 flex-shrink-0" size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Hourly Rate</p>
                      <p className="text-gray-800">₹{caretaker.hourlyRate}/hour</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="text-cyan-600 mt-1 mr-3 flex-shrink-0" size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Availability</p>
                      <p className="text-gray-800 capitalize">{caretaker.availability.toLowerCase()}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Award className="text-cyan-600 mt-1 mr-3 flex-shrink-0" size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Experience</p>
                      <p className="text-gray-800">{caretaker.experience} years</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">About</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {caretaker.description || "No description provided"}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {caretaker.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Hire {caretaker.fullName.split(" ")[0]}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Needed
                    </label>
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    >
                      <option>Pet Sitting</option>
                      <option>Dog Walking</option>
                      <option>Grooming</option>
                      <option>Training</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      />
                      <Calendar className="absolute right-3 top-3 text-gray-400" size={18} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hours Needed
                    </label>
                    <input
                      type="number"
                      name="hours"
                      value={formData.hours}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder="2"
                    />
                  </div>
                  <button
                    onClick={handleHire}
                    disabled={submitting}
                    className={`w-full py-3 bg-cyan-600 text-white font-medium rounded-lg transition-colors ${
                      submitting ? "bg-cyan-400 cursor-not-allowed" : "hover:bg-cyan-700"
                    }`}
                  >
                    {submitting ? "Sending Request..." : `Request Booking (₹${caretaker.hourlyRate}/hr)`}
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Pricing</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hourly Rate</span>
                    <span className="font-medium">₹{caretaker.hourlyRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated {formData.hours} hours</span>
                    <span className="font-medium">₹{caretaker.hourlyRate * formData.hours}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                    <span className="text-gray-800 font-medium">Total</span>
                    <span className="text-cyan-600 font-bold">₹{caretaker.hourlyRate * formData.hours}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCaretakerProfile;