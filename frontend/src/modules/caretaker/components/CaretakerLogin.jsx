import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { AuthData } from "../../../context/AuthContext";
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [user, setUser] = useState({
    email: "",
    password: ""
  });

  const navigate = useNavigate();
  const { login, loginWithGoogle, btnLoading } = AuthData();

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
    login(user.email, user.password);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 border border-teal-100">
        <h2 className="text-2xl font-bold text-center text-teal-700 mb-6">Login to PetConnect</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-teal-600 mb-2 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            />
          </div>
          <div className="mb-6 relative">
            <label className="block text-teal-600 mb-2 font-medium">Password</label>
            <div className="relative">
              <input
                type={isPasswordVisible ? "text" : "password"}
                name="password"
                value={user.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 pr-10"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600"
              >
                {isPasswordVisible ? (
                  <EyeOff size={20} className="text-teal-600" />
                ) : (
                  <Eye size={20} className="text-teal-600" />
                )}
              </button>
            </div>
            <div className="flex justify-end mt-2">
              <Link to="/forgot-password" state={{ defaultRole: 'caretaker' }} className="text-sm text-teal-600 hover:text-teal-800 transition-colors hover:underline">Forgot Password?</Link>
            </div>
          </div>
          <button
            type="submit"
            disabled={btnLoading}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 rounded-lg hover:from-teal-600 hover:to-cyan-600 transition flex items-center justify-center font-semibold shadow-md"
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
          
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-teal-200"></div>
            <span className="px-3 text-sm text-gray-500">or</span>
            <div className="flex-grow border-t border-teal-200"></div>
          </div>
          
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={credentialResponse => {
                loginWithGoogle(credentialResponse.credential);
              }}
              onError={() => {
                console.log('Login Failed');
              }}
              theme="outline"
              size="large"
              shape="pill"
            />
          </div>

        </form>
        <p className="text-center text-gray-600 mt-6">
          Don't have an account? <a href="/caretaker/signup" className="text-teal-500 hover:underline font-medium">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;