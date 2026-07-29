import React, { useState } from "react";
import { Loader2, Eye, EyeOff, LayoutDashboard, User, ShieldCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import {
  requestPasswordResetOTP,
  verifyPasswordResetOTP,
  resetPasswordWithOTP,
} from "../../../shared/api/authApi";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // If we came from a specific login page, default to that role, else user
  const defaultRole = location.state?.defaultRole || "user";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    role: defaultRole,
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!formData.email) return toast.error("Email is required");

    setLoading(true);
    try {
      const res = await requestPasswordResetOTP(formData.email, formData.role);
      if (res.success) {
        toast.success(res.message);
        setStep(2);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!formData.otp) return toast.error("OTP is required");

    setLoading(true);
    try {
      const res = await verifyPasswordResetOTP(formData.email, formData.role, formData.otp);
      if (res.success) {
        toast.success("OTP Verified! Please enter your new password.");
        setStep(3);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("Passwords do not match!");
    }
    if (formData.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters long.");
    }

    setLoading(true);
    try {
      const res = await resetPasswordWithOTP(
        formData.email,
        formData.role,
        formData.otp,
        formData.newPassword
      );
      if (res.success) {
        toast.success(res.message);
        navigate("/login");
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-cyan-50 py-10 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-cyan-500">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-cyan-800">
            {step === 1 && "Forgot Password"}
            {step === 2 && "Enter OTP"}
            {step === 3 && "Secure Account"}
          </h2>
          <p className="text-cyan-600 mt-2 text-sm">
            {step === 1 && "Select your role and enter your email address to receive an OTP."}
            {step === 2 && `We sent a 6-digit code to ${formData.email}.`}
            {step === 3 && "Create a new strong password for your account."}
          </p>
        </div>

        {/* STEP 1: Email and Role */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <label className="block text-cyan-800 font-medium mb-2">Account Type</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "user" })}
                  className={`flex flex-col items-center justify-center py-3 rounded-lg border-2 transition-all ${
                    formData.role === "user" ? "border-cyan-500 bg-cyan-50 text-cyan-700" : "border-gray-200 text-gray-500 hover:border-cyan-300"
                  }`}
                >
                  <User size={20} className="mb-1" />
                  <span className="text-xs font-semibold">User</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "caretaker" })}
                  className={`flex flex-col items-center justify-center py-3 rounded-lg border-2 transition-all ${
                    formData.role === "caretaker" ? "border-cyan-500 bg-cyan-50 text-cyan-700" : "border-gray-200 text-gray-500 hover:border-cyan-300"
                  }`}
                >
                  <LayoutDashboard size={20} className="mb-1" />
                  <span className="text-xs font-semibold">Caretaker</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "admin" })}
                  className={`flex flex-col items-center justify-center py-3 rounded-lg border-2 transition-all ${
                    formData.role === "admin" ? "border-cyan-500 bg-cyan-50 text-cyan-700" : "border-gray-200 text-gray-500 hover:border-cyan-300"
                  }`}
                >
                  <ShieldCheck size={20} className="mb-1" />
                  <span className="text-xs font-semibold">Admin</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-cyan-800 font-medium mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your registered email"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold py-3 rounded-xl hover:from-cyan-600 hover:to-teal-600 transition-all flex items-center justify-center shadow-lg transform hover:-translate-y-0.5"
            >
              {loading ? <Loader2 size={22} className="animate-spin" /> : "Send OTP"}
            </button>
          </form>
        )}

        {/* STEP 2: Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-500">
            <div>
              <label className="block text-cyan-800 font-medium mb-2 text-center">6-Digit OTP</label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                maxLength="6"
                placeholder="• • • • • •"
                className="w-full px-4 py-4 text-center text-3xl tracking-[1em] font-bold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold py-3 rounded-xl hover:from-cyan-600 hover:to-teal-600 transition-all flex items-center justify-center shadow-lg transform hover:-translate-y-0.5"
            >
              {loading ? <Loader2 size={22} className="animate-spin" /> : "Verify OTP"}
            </button>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-cyan-600 hover:text-cyan-800 font-medium transition-colors"
              >
                ← Edit Email Address
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Reset Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="relative">
              <label className="block text-cyan-800 font-medium mb-2">New Password</label>
              <input
                type={isPasswordVisible ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="absolute right-4 top-11 text-gray-400 hover:text-cyan-600 transition-colors"
              >
                {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div>
              <label className="block text-cyan-800 font-medium mb-2">Confirm Password</label>
              <input
                type={isPasswordVisible ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter new password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center shadow-lg transform hover:-translate-y-0.5"
            >
              {loading ? <Loader2 size={22} className="animate-spin" /> : "Reset securely & Login"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
