import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserData } from '../modules/user/context/UserContext';
import { AdminData } from '../modules/admin/context/AdminContext';

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

// Migrated Caretaker Modules
import CaretakerHome from '../modules/caretaker/pages/Home';
import CaretakerLogin from '../modules/caretaker/components/CaretakerLogin';
import CaretakerSignUp from '../modules/caretaker/components/CaretakerSignUp';
import CaretakerApplicationForm from '../modules/caretaker/components/CaretakerApplicationForm';
import CaretakerProfile from '../modules/caretaker/components/CaretakerProfile';
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

const AppRoutes = () => {
  const { isAuth } = UserData();
  const { isAuthAdmin } = AdminData();

  return (
    <Routes>
      {/* Old Frontend Routes attached to UserLayout */}
      <Route element={<UserLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/sell-pet" element={isAuth ? <SellPets /> : <Navigate to="/login" />} />
        <Route path="/buy-pet" element={isAuth ? <BuyPets /> : <Navigate to="/login" />} />
        <Route path="/pet-details/:petId" element={<PetDetails />} />
        <Route path="/profile" element={isAuth ? <UserProfile /> : <Navigate to="/login" />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/caretakers" element={isAuth ? <CaretakerList /> : <Navigate to="/login" />} />
        <Route path="/caretakers/:id" element={isAuth ? <UserCaretakerProfile /> : <Navigate to="/login" />} />
        <Route path="/user/bookings" element={<UserBookings />} />
      </Route>

      {/* Caretaker Routes */}
      <Route path="/caretaker" element={<CaretakerLayout />}>
        <Route index element={<CaretakerHome />} />
        <Route path="login" element={<CaretakerLogin />} />
        <Route path="signup" element={<CaretakerSignUp />} />
        <Route path="apply" element={<CaretakerApplicationForm />} />
        <Route path="profile" element={<CaretakerProfile />} />
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
