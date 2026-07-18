// src/components/User/UserBookings.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserData } from "../context/UserContext";
import { Calendar, Clock, CheckCircle2, XCircle, Clock4 } from "lucide-react";

const UserBookings = () => {
  const { isAuth } = UserData();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("/api/user/bookings", {
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          setBookings(data.data?.bookingRequests || []);
        } else {
          setError(data.message || "Failed to fetch bookings");
        }
      } catch (err) {
        setError("Error fetching bookings");
      } finally {
        setLoading(false);
      }
    };

    if (isAuth) {
      fetchBookings();
    }
  }, [isAuth]);

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock4 className="w-4 h-4 text-yellow-500" />;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!isAuth) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Please login to view your bookings
          </h2>
          <Link
            to="/login"
            className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-full font-medium transition-all"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Loading your bookings...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Error loading bookings
          </h2>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-full font-medium transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-500 to-teal-500 p-4 text-white">
          <h1 className="text-2xl font-bold">My Bookings</h1>
          <p className="text-sm opacity-90">
            View and manage your pet care service bookings
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="p-6 text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-500 mb-4">
              You haven't made any booking requests yet.
            </p>
            <Link
              to="/caretakers"
              className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-full font-medium transition-all"
            >
              Find Caretakers
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {bookings.map((booking) => (
              <div key={booking._id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(booking.status)}
                      <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {booking.service}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(booking.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Clock className="w-4 h-4" />
                      <span>{booking.hours} hours</span>
                      <span className="ml-2 font-medium">
                        ${booking.totalCost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm font-medium mt-1">
                      Caretaker: {booking.caretaker?.name || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBookings;