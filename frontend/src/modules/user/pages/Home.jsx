import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Header from '../components/Header'
import FAQs from '../components/FAQs'
import Products from '../components/Products'
import { AuthData } from '../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const { user, role, isAuthenticated } = AuthData();
  const [applicationStatus, setApplicationStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && role === 'user') {
      axios.get("/api/caretaker/my-applications")
        .then((appRes) => {
          if (appRes.data?.success && appRes.data.applications?.length > 0) {
            const latest = appRes.data.applications[appRes.data.applications.length - 1];
            setApplicationStatus(latest.status);
          }
        })
        .catch(err => console.error("Error fetching applications:", err));
    }
  }, [isAuthenticated, role]);

  return (
    <div>
      <Header/>
      
      {isAuthenticated && role === 'user' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-4">
          <div className="bg-gradient-to-r from-orange-400 to-amber-500 p-8 rounded-2xl shadow-lg text-white flex flex-col md:flex-row items-center justify-between transform transition hover:scale-[1.01] duration-300">
            <div className="mb-6 md:mb-0">
              <h2 className="text-3xl font-extrabold mb-2 text-white">Become a Pet Caretaker! 🐾</h2>
              <p className="text-orange-50 text-lg max-w-2xl">
                Turn your passion for pets into a rewarding experience. Connect with local pet owners, offer your caretaking services, and start earning on your own schedule.
              </p>
            </div>
            <div className="flex-shrink-0 w-full md:w-auto">
              {!applicationStatus ? (
                <button onClick={() => navigate("/apply-caretaker")} className="w-full md:w-auto px-8 py-4 bg-white text-orange-600 font-bold text-lg rounded-full shadow-lg hover:bg-orange-50 transition cursor-pointer hover:shadow-xl">
                  Apply Now
                </button>
              ) : applicationStatus === "pending" ? (
                <span className="w-full md:w-auto inline-block text-center px-8 py-4 bg-white/20 border-2 border-white font-bold text-lg rounded-full text-white cursor-not-allowed">
                  Application Pending
                </span>
              ) : applicationStatus === "rejected" ? (
                <button onClick={() => navigate("/apply-caretaker")} className="w-full md:w-auto px-8 py-4 bg-red-600 border-2 border-white text-white font-bold text-lg rounded-full shadow hover:bg-red-700 transition cursor-pointer">
                  Rejected - Re-Apply
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <Products></Products>
      <FAQs></FAQs>
      <Footer/>
    </div>
  )
}

export default Home
