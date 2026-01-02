import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import api from "../../config/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toast.warning("Please Fill all the Fields");
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.post("/user/login", { email, password });
      toast.success("Login Successful");
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate("/chats");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login Failed");
      setLoading(false);
    }
  };

  // Pre-fill generic credentials for testing
  const setGuestCredentials = () => {
    setEmail("guest@example.com");
    setPassword("123456");
  };

  return (
    <div className="flex flex-col gap-4">
      <ToastContainer />
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700">Email Address <span className="text-red-500">*</span></label>
        <input 
          value={email}
          type="email"
          placeholder="Enter Your Email"
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
          onChange={(e) => setEmail(e.target.value)} 
        />
      </div>
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700">Password <span className="text-red-500">*</span></label>
        <input 
          value={password}
          type="password" 
          placeholder="Enter Password" 
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
          onChange={(e) => setPassword(e.target.value)} 
        />
      </div>
      
      <button 
        onClick={submitHandler} 
        disabled={loading}
        className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition disabled:bg-blue-300 mt-2"
      >
        {loading ? "Loading..." : "Login"}
      </button>

      <button 
        onClick={setGuestCredentials}
        className="w-full bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition mt-2"
      >
        Get Guest Credentials
      </button>
    </div>
  );
};

export default Login;