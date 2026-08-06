import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthData } from '../context/AuthContext';
import { AdminData } from '../modules/admin/context/AdminContext';
import { PawPrint } from 'lucide-react';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import UserLayout from '../layouts/UserLayout';
import CaretakerLayout from '../layouts/CaretakerLayout';
import AdminLayout from '../layouts/AdminLayout';

// Migrated User Modules
import Home from '../modules/user/pages/Home';
import Login from '../modules/user/components/Login';
import Signup from '../modules/user/components/Signup';
import SellPets from '../modules/user/components/SellPets';
import BuyPets from '../modules/user/pages/BuyPets';
import PetDetails from '../modules/user/pages/PetDetails';
import UserProfile from '../modules/user/pages/UserProfile';
import AboutUs from '../modules/user/components/AboutUs';
import Contact from '../modules/user/components/Contact';
import PrivacyPolicy from '../modules/user/components/PrivacyPolicy';
import TermsOfService from '../modules/user/components/TermsOfService';
import CaretakerList from '../modules/user/pages/CaretakerList';
import UserCaretakerProfile from '../modules/user/components/UserCaretakerProfile';
import UserBookings from '../modules/user/components/UserBookings';
import ForgotPassword from '../modules/user/components/ForgotPassword';
import Wishlist from '../modules/user/pages/Wishlist';
import Chat from '../modules/user/pages/Chat';
import Notifications from '../modules/user/pages/Notifications';
import PetScanner from '../modules/user/pages/PetScanner';

// Migrated Caretaker Modules
import CaretakerHome from '../modules/caretaker/pages/Home';
import CaretakerLogin from '../modules/caretaker/components/CaretakerLogin';
import CaretakerApplicationForm from '../modules/caretaker/components/CaretakerApplicationForm';
import CaretakerProfile from '../modules/caretaker/components/CaretakerProfile';
import CompleteProfessionalProfile from '../modules/caretaker/pages/CompleteProfessionalProfile';
import CaretakerAboutUs from '../modules/caretaker/components/AboutUs';
import CaretakerContact from '../modules/caretaker/components/Contact';
import CaretakerPrivacyPolicy from '../modules/caretaker/components/PrivacyPolicy';
import CaretakerTermsOfService from '../modules/caretaker/components/TermsOfService';

// Migrated Admin Modules
import AdminHome from '../modules/admin/pages/Home';
import AdminLogin from '../modules/admin/components/LoginAdmin';
import ManageUsers from '../modules/admin/pages/ManageUsers';
import Sidebar from '../modules/admin/pages/Sidebar';
import PetList from '../modules/admin/pages/PetList';
import CaretakerListAdmin from '../modules/admin/pages/CaretakerListAdmin';
import AdminProfileReview from '../modules/admin/pages/AdminProfileReview';

const AppRoutes = () => {
  const { isAuthenticated, role, loading } = AuthData();
  const { isAuthAdmin } = AdminData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-teal-100 flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center w-28 h-28 bg-white rounded-full shadow-[0_0_40px_rgba(20,184,166,0.3)] animate-bounce duration-1000">
          <PawPrint className="text-teal-500 w-14 h-14" />
          {/* Pulsing ring effect */}
          <div className="absolute inset-0 border-4 border-teal-300 rounded-full animate-ping opacity-60"></div>
        </div>
        <h2 className="mt-8 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 tracking-wide animate-pulse">
          Loading PetConnect
        </h2>
        <p className="mt-2 text-teal-700/80 font-medium tracking-wider">Unleashing the best furry friends...</p>
      </div>
    );
  }

  const roleHome = role === "caretaker" ? "/caretaker" : role === "admin" ? "/admin" : "/";

  return (
    <Routes>
      {/* Old Frontend Routes attached to UserLayout */}
      <Route element={<UserLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to={roleHome} /> : <Login />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to={roleHome} /> : <Signup />} />
        <Route path="/forgot-password" element={isAuthenticated ? <Navigate to={roleHome} /> : <ForgotPassword />} />
        <Route path="/apply-caretaker" element={(isAuthenticated && role === "user") ? <CaretakerApplicationForm /> : <Navigate to="/login" />} />
        <Route path="/sell-pet" element={(isAuthenticated && role === "user") ? <SellPets /> : <Navigate to="/login" />} />
        <Route path="/buy-pet" element={(isAuthenticated && role === "user") ? <BuyPets /> : <Navigate to="/login" />} />
        <Route path="/pet-details/:petId" element={<PetDetails />} />
        <Route path="/discover" element={<PetScanner />} />
        <Route path="/profile" element={(isAuthenticated && role === "user") ? <UserProfile /> : <Navigate to="/login" />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/caretakers" element={(isAuthenticated && role === "user") ? <CaretakerList /> : <Navigate to="/login" />} />
        <Route path="/caretakers/:id" element={(isAuthenticated && role === "user") ? <UserCaretakerProfile /> : <Navigate to="/login" />} />
        <Route path="/user/bookings" element={<UserBookings />} />
        <Route path="/wishlist" element={(isAuthenticated && role === "user") ? <Wishlist /> : <Navigate to="/login" />} />
        <Route path="/chat" element={(isAuthenticated && role === "user") ? <Chat /> : <Navigate to="/login" />} />
        <Route path="/notifications" element={(isAuthenticated && role === "user") ? <Notifications /> : <Navigate to="/login" />} />
      </Route>

      {/* Caretaker Routes */}
      <Route path="/caretaker" element={<CaretakerLayout />}>
        <Route index element={<CaretakerHome />} />
        <Route path="login" element={isAuthenticated ? <Navigate to={roleHome} /> : <CaretakerLogin />} />
        <Route path="signup" element={isAuthenticated ? <Navigate to={roleHome} /> : <Signup />} />
        <Route path="apply" element={(isAuthenticated && role === "caretaker") ? <CaretakerApplicationForm /> : <Navigate to="/caretaker/login" />} />
        <Route path="profile" element={(isAuthenticated && role === "caretaker") ? <CaretakerProfile /> : <Navigate to="/caretaker/login" />} />
        <Route path="professional-profile" element={(isAuthenticated && role === "caretaker") ? <CompleteProfessionalProfile /> : <Navigate to="/caretaker/login" />} />
        <Route path="about" element={<CaretakerAboutUs />} />
        <Route path="contact" element={<CaretakerContact />} />
        <Route path="privacy" element={<CaretakerPrivacyPolicy />} />
        <Route path="terms" element={<CaretakerTermsOfService />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminHome />} />
        <Route path="login" element={<AdminLogin />} />
        <Route path="manage-users" element={<ManageUsers />} />
        <Route path="pet-list" element={<PetList />} />
        <Route path="caretaker-list" element={<CaretakerListAdmin />} />
        <Route path="profile-reviews" element={<AdminProfileReview />} />
        <Route path="options" element={
          <>
            {isAuthAdmin ? (
              <>
                <Sidebar />
                <div className="p-6">
                  <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-8 text-center">
                    <div className="text-teal-500 text-5xl mb-4">🐾</div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Welcome to PetConnect Admin Dashboard</h2>
                    <p className="text-gray-600 mb-6">Select an option from the menu above to manage your pet platform.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                      <button onClick={() => window.location.href = '/admin/pet-list'} 
                        className="p-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg hover:from-teal-500 hover:to-cyan-600 transition duration-300">
                        View Pet List
                      </button>
                      <button
                        onClick={() => window.location.href = '/admin/manage-users'} 
                        className="p-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg hover:from-teal-500 hover:to-cyan-600 transition duration-300">
                        Manage Users
                      </button>
                      <button 
                        className="p-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg hover:from-teal-500 hover:to-cyan-600 transition duration-300">
                        Pets Sold
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <AdminLogin />
            )}
          </>
        } />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
