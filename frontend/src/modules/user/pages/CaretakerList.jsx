import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, ShieldCheck, MapPin, Award, Clock } from "lucide-react";

const CaretakerList = () => {
  const [caretakers, setCaretakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    availability: "",
    rateRange: "",
    experience: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch("/api/user/caretakers")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch caretakers");
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setCaretakers(data.CaretakerContent || []);
        } else {
          throw new Error(data.message || "Failed to load caretakers");
        }
      })
      .catch((error) => {
        console.error("Error fetching caretakers:", error);
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredCaretakers = caretakers.filter((caretaker) => {
    const prof = caretaker.professionalProfile;
    const rate = Number(prof?.baseDailyRate || caretaker.hourlyRate || 0);
    const exp = Number(prof?.yearsOfExperience || caretaker.experience || 0);

    // Filter by availability
    if (filter.availability && caretaker.availability !== filter.availability) {
      return false;
    }

    // Filter by rate range
    if (filter.rateRange) {
      if (filter.rateRange === "0-50" && rate > 50) return false;
      if (filter.rateRange === "51-100" && (rate < 51 || rate > 100)) return false;
      if (filter.rateRange === "101+" && rate < 101) return false;
    }

    // Filter by experience
    if (filter.experience) {
      if (filter.experience === "0-2" && exp > 2) return false;
      if (filter.experience === "3-5" && (exp < 3 || exp > 5)) return false;
      if (filter.experience === "5+" && exp < 5) return false;
    }

    return true;
  });

  const availabilityOptions = [...new Set(caretakers.map((c) => c.availability).filter(Boolean))];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center space-y-3">
          <span className="px-4 py-1.5 bg-teal-100 text-teal-800 font-extrabold text-xs uppercase tracking-wider rounded-full">
            Verified Pet Caregivers
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900">
            Find Trusted Local Caretakers
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-base">
            Browse verified, experienced pet sitters, dog walkers, and caregivers in your area.
          </p>
        </header>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-200">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Filter Caretakers</h2>
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <select
                value={filter.availability}
                onChange={(e) => setFilter({ ...filter, availability: e.target.value })}
                className="border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-700 bg-slate-50 focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Availability</option>
                {availabilityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <select
                value={filter.rateRange}
                onChange={(e) => setFilter({ ...filter, rateRange: e.target.value })}
                className="border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-700 bg-slate-50 focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Rates</option>
                <option value="0-50">$0 - $50/day</option>
                <option value="51-100">$51 - $100/day</option>
                <option value="101+">$101+/day</option>
              </select>

              <select
                value={filter.experience}
                onChange={(e) => setFilter({ ...filter, experience: e.target.value })}
                className="border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-700 bg-slate-50 focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Experience</option>
                <option value="0-2">0-2 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5+">5+ years</option>
              </select>

              <button
                onClick={() => setFilter({ availability: "", rateRange: "", experience: "" })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading verified caregivers...</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl text-center max-w-md mx-auto space-y-3">
            <p className="font-bold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-rose-600 text-white font-bold text-sm rounded-xl"
            >
              Try again
            </button>
          </div>
        )}

        {/* Caretaker Grid */}
        {!loading && !error && filteredCaretakers.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border shadow-sm space-y-3">
            <h3 className="text-xl font-bold text-slate-800">No Caretakers Match Filters</h3>
            <p className="text-slate-500 text-sm">Try resetting filters to view all available caregivers.</p>
          </div>
        )}

        {!loading && !error && filteredCaretakers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCaretakers.map((caretaker) => {
              const prof = caretaker.professionalProfile;

              return (
                <div
                  key={caretaker._id}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 border border-slate-200 flex flex-col justify-between group"
                >
                  <div className="p-6 space-y-4">
                    {/* Header info */}
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                        {prof?.profileImage || caretaker.image ? (
                          <img
                            src={prof?.profileImage || caretaker.image}
                            alt={caretaker.fullName}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-teal-600 text-white font-extrabold flex items-center justify-center text-2xl">
                            {caretaker.fullName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-extrabold text-slate-900 text-lg truncate">{caretaker.fullName}</h3>
                        <p className="text-xs font-semibold text-teal-700 truncate">{prof?.headline || "Caregiver Professional"}</p>
                        <div className="flex items-center space-x-1 text-xs text-amber-500 font-bold mt-1">
                          <Star size={14} fill="currentColor" />
                          <span>4.9 (24)</span>
                          <span className="text-slate-400 mx-1">•</span>
                          <span className="text-slate-500 font-normal">
                            {prof?.city || caretaker.location || "Local Area"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description / Headline */}
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {prof?.bio || caretaker.description || "Experienced pet caregiver dedicated to providing attentive, safe care for your animals."}
                    </p>

                    {/* Trust Badges */}
                    {prof?.trustBadges?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {prof.trustBadges.slice(0, 3).map((badge, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 bg-teal-50 text-teal-800 font-bold text-[10px] rounded-full border border-teal-200 flex items-center gap-1">
                            <ShieldCheck size={12} className="text-teal-600" /> {badge}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Skills pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {(prof?.skills || caretaker.skills || []).slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-md border">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer & Rate */}
                  <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Daily Rate</span>
                      <span className="text-xl font-extrabold text-teal-700">
                        ${prof?.baseDailyRate || caretaker.hourlyRate} <span className="text-xs font-normal text-slate-500">/day</span>
                      </span>
                    </div>

                    <button
                      onClick={() => navigate(`/caretakers/${caretaker._id}`)}
                      className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition"
                    >
                      View Showcase Profile
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CaretakerList;
