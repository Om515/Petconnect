import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CaretakerData } from "../context/CaretakerContext";

const Signup = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { registerUser, btnLoading } = CaretakerData();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!user.name.trim()) newErrors.name = "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(user.email)) newErrors.email = "Invalid email address";
    if (user.password.length < 6) newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const success = await registerUser(user.name, user.email, user.password, navigate);
        if (success) {
          navigate("/"); // Redundant but kept for clarity; context already navigates
        }
      } catch (error) {
        console.error("Signup error:", error);
        setErrors({
          ...errors,
          form: error.response?.data?.message || "Registration failed. Please try again.",
        });
      }
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-teal-100">
        <h2 className="text-2xl font-bold text-center text-teal-700 mb-6">
          Sign Up for PetConnect
        </h2>

        {errors.form && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label className="block text-teal-600 mb-2 font-medium">Full Name</label>
            <input
              type="text"
              name="name"
              value={user.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.name ? "border-red-300 focus:ring-red-200" : "border-teal-200 focus:ring-teal-400"
              }`}
              required
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-teal-600 mb-2 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.email ? "border-red-300 focus:ring-red-200" : "border-teal-200 focus:ring-teal-400"
              }`}
              required
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div className="mb-6 relative">
            <label className="block text-teal-600 mb-2 font-medium">Password</label>
            <div className="relative">
              <input
                type={isPasswordVisible ? "text" : "password"}
                name="password"
                value={user.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 pr-10 ${
                  errors.password ? "border-red-300 focus:ring-red-200" : "border-teal-200 focus:ring-teal-400"
                }`}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-teal-600"
              >
                {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            <div className="mt-2 text-xs text-gray-500">
              Password must be at least 6 characters
            </div>
          </div>

          <button
            type="submit"
            disabled={btnLoading}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 rounded-lg hover:from-teal-600 hover:to-cyan-600 transition flex items-center justify-center font-semibold shadow-md disabled:opacity-70"
          >
            {btnLoading ? (
              <>
                <Loader2 size={20} className="mr-2 animate-spin" />
                <span>Signing up...</span>
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <a href="/caretaker/login" className="text-teal-500 hover:underline font-medium">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;