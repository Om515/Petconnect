import { useEffect, useState } from "react";
import axios from "axios";
import { CheckIcon, XIcon, IndianRupee, UserCheck, Clock, Award } from "lucide-react";
import { AdminData } from "../context/AdminContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

const CaretakerListAdmin = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { caretakerApprove, caretakerReject } = AdminData();
  const navigate = useNavigate();

  const fetchApplications = () => {
    setLoading(true);
    axios
      .get("/api/admin/get-caretaker-list")
      .then((res) => {
        if (res.data.success) {
          setApplications(res.data.applications);
        }
      })
      .catch((err) => console.error("Error fetching caretaker applications:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (id) => {
    await caretakerApprove(id, navigate);
    fetchApplications();
  };

  const handleReject = async (id) => {
    await caretakerReject(id, navigate);
    fetchApplications();
  };

  return (
    <>
      <Sidebar />
      <div className="p-6 bg-gradient-to-b from-blue-50 to-cyan-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-teal-700 border-b-2 border-teal-500 pb-3">
            Caretaker Approval Dashboard
          </h1>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-teal-600 font-medium">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="text-teal-500 text-5xl mb-4">🐾</div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Caretaker Applications To Approve</h2>
              <p className="text-gray-500">There are currently no caretaker applications waiting for admin approval.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden border border-gray-100 p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h2 className="text-xl font-bold text-gray-800">{app.fullName}</h2>
                      <span className="bg-cyan-100 text-cyan-800 text-xs px-2.5 py-1 rounded-full font-medium">
                        {app.availability}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                      <p className="flex items-center">
                        <Award className="h-4 w-4 mr-2 text-teal-500" />
                        Experience: {app.experience} years
                      </p>
                      <p className="flex items-center">
                        <IndianRupee className="h-4 w-4 mr-2 text-teal-500" />
                        Rate: ₹{app.hourlyRate}/hour
                      </p>
                      <p className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-teal-500" />
                        Mobile: {app.mobile}
                      </p>
                      {app.applicant?.email && (
                        <p className="flex items-center">
                          <UserCheck className="h-4 w-4 mr-2 text-teal-500" />
                          Email: {app.applicant.email}
                        </p>
                      )}
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 text-sm mb-1">Skills:</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {app.skills?.map((skill, idx) => (
                          <span key={idx} className="bg-teal-50 text-teal-700 text-xs px-2 py-0.5 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-3 mb-4 italic">
                      "{app.description}"
                    </p>
                  </div>

                  <div className="flex space-x-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleApprove(app._id)}
                      className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition duration-300 flex items-center justify-center font-medium text-sm"
                    >
                      <CheckIcon className="h-4 w-4 mr-1.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(app._id)}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 flex items-center justify-center font-medium text-sm"
                    >
                      <XIcon className="h-4 w-4 mr-1.5" />
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CaretakerListAdmin;
