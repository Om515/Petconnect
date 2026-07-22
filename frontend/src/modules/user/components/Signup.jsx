import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthData } from "../../../context/AuthContext";

const Signup = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    address: "",
    role: "user",
  });

  const navigate = useNavigate();
  const { register, btnLoading } = AuthData();

  const handleChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    setUser({
      ...user,
      [name]: value,
    });
  };

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    register(user.name, user.mobile, user.address, user.email, user.password, user.role);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-cyan-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 border-2 border-cyan-500">
        <h2 className="text-2xl font-bold text-center text-cyan-700 mb-6">
          Sign Up for PetConnect
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-cyan-600 mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={user.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-cyan-600 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-cyan-600 mb-2">Mobile</label>
            <input
              type="text"
              name="mobile"
              value={user.mobile}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-cyan-600 mb-2">Address</label>
            <textarea
              name="address"
              value={user.address}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 h-24"
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-cyan-600 mb-2">Role</label>
            <select
              name="role"
              value={user.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white"
            >
              <option value="user">User</option>
              <option value="caretaker">Caretaker</option>
            </select>
          </div>
          <div className="mb-4 relative">
            <label className="block text-cyan-600 mb-2">Password</label>
            <div className="relative">
              <input
                type={isPasswordVisible ? "text" : "password"}
                name="password"
                value={user.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 pr-10"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-cyan-600"
              >
                {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={btnLoading}
            className="w-full bg-cyan-500 text-white py-2 rounded-lg hover:bg-cyan-600 transition flex items-center justify-center shadow-md"
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
        <p className="text-center text-cyan-600 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-cyan-500 font-semibold hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;