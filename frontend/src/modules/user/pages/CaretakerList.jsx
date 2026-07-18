import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

const CaretakerList = () => {
  const [caretakers, setCaretakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ 
    availability: "", 
    rateRange: "",
    experience: ""
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
          setCaretakers(data.CaretakerContent);
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
    // Filter by availability
    if (filter.availability && caretaker.availability !== filter.availability) {
      return false;
    }

    // Filter by rate range
    if (filter.rateRange) {
      const rate = Number(caretaker.hourlyRate);
      if (filter.rateRange === "0-100" && (rate < 0 || rate > 100)) return false;
      if (filter.rateRange === "101-200" && (rate < 101 || rate > 200)) return false;
      if (filter.rateRange === "201+" && rate < 201) return false;
    }

    // Filter by experience
    if (filter.experience) {
      const exp = Number(caretaker.experience);
      if (filter.experience === "0-2" && (exp < 0 || exp > 2)) return false;
      if (filter.experience === "3-5" && (exp < 3 || exp > 5)) return false;
      if (filter.experience === "5+" && exp < 5) return false;
    }

    return true;
  });

  // Get unique availability options
  const availabilityOptions = [...new Set(caretakers.map(c => c.availability))];

  return (
    <div className="min-h-screen bg-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-center text-cyan-800 mb-2">
            Available Caretakers
          </h1>
          <p className="text-center text-cyan-600 max-w-2xl mx-auto">
            Browse our selection of professional pet caretakers with various skills and experience levels.
          </p>
        </header>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8 border border-cyan-100">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h2 className="text-lg font-medium text-cyan-700">Filters</h2>
            <div className="flex flex-wrap gap-4">
              <select
                value={filter.availability}
                onChange={(e) => setFilter({ ...filter, availability: e.target.value })}
                className="border border-cyan-200 rounded-md px-3 py-2 text-cyan-700 bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                className="border border-cyan-200 rounded-md px-3 py-2 text-cyan-700 bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">All Rate Ranges</option>
                <option value="0-100">₹0 - ₹100/hour</option>
                <option value="101-200">₹101 - ₹200/hour</option>
                <option value="201+">₹201+/hour</option>
              </select>

              <select
                value={filter.experience}
                onChange={(e) => setFilter({ ...filter, experience: e.target.value })}
                className="border border-cyan-200 rounded-md px-3 py-2 text-cyan-700 bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">All Experience Levels</option>
                <option value="0-2">0-2 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5+">5+ years</option>
              </select>

              <button
                onClick={() => setFilter({ availability: "", rateRange: "", experience: "" })}
                className="px-4 py-2 bg-cyan-100 hover:bg-cyan-200 text-cyan-700 rounded-md transition"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-cyan-600">Loading available caretakers...</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p>Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredCaretakers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md border border-cyan-100">
            <svg
              className="w-12 h-12 text-cyan-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <h3 className="text-lg font-medium text-cyan-700 mb-1">No caretakers found</h3>
            <p className="text-cyan-500">
              {caretakers.length > 0
                ? "Try adjusting your filters to see more results."
                : "Check back later for available caretakers."}
            </p>
          </div>
        )}

        {/* Caretaker grid */}
        {!loading && !error && caretakers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCaretakers.map((caretaker) => (
              <div
                key={caretaker._id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-cyan-100"
              >
                <div className="p-5">
                  <h2 className="text-xl font-semibold text-cyan-800 mb-3">{caretaker.fullName}</h2>
                  
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">Experience:</span> {caretaker.experience} years
                  </p>
                  
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">Availability:</span> {caretaker.availability}
                  </p>
                  
                  <p className="text-2xl font-bold text-cyan-600 mb-3">
                    ₹{caretaker.hourlyRate}/hour
                  </p>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-1">Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {caretaker.skills.map((skill, index) => (
                        <span 
                          key={index}
                          className="bg-cyan-100 text-cyan-800 text-xs px-2 py-1 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {caretaker.description}
                  </p>
                  
                  <button
                    onClick={() => navigate(`/caretakers/${caretaker._id}`)}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CaretakerList;
