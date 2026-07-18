import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserData } from "../context/UserContext";

const Login = () => {
  const [user, setUser] = useState({
    email: "",
    password: ""
  });

  const navigate = useNavigate();
  const { loginUser, btnLoading } = UserData();

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
    loginUser(user.email, user.password, navigate);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-cyan-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 border-2 border-cyan-500">
        <h2 className="text-2xl font-bold text-center text-cyan-700 mb-6">Login to PetConnect</h2>
        <form onSubmit={handleSubmit}>
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
                {isPasswordVisible ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
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
                <span>Logging in...</span>
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
        <p className="text-center text-cyan-600 mt-4">
          Don't have an account? <a href="/signup" className="text-cyan-500 font-semibold hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;