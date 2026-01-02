import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import api from "../../config/api";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pic, setPic] = useState(""); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submitHandler = async () => {
    setLoading(true);
    if (!name || !email || !password) {
      toast.warning("Please fill all the fields");
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.post("/user", { name, email, password, pic });
      toast.success("Registration Successful");
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate("/chats");
    } catch (error) {
      toast.error(error.response?.data.message || "Error Occurred");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <ToastContainer />
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
        <input 
          placeholder="Enter Your Name" 
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
          onChange={(e) => setName(e.target.value)} 
        />
      </div>
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700">Email Address <span className="text-red-500">*</span></label>
        <input 
          placeholder="Enter Your Email" 
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
          onChange={(e) => setEmail(e.target.value)} 
        />
      </div>
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700">Password <span className="text-red-500">*</span></label>
        <input 
          type="password" 
          placeholder="Enter Password" 
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
          onChange={(e) => setPassword(e.target.value)} 
        />
      </div>
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700">Profile Picture URL (Optional)</label>
        <input 
          placeholder="https://example.com/avatar.png" 
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
          onChange={(e) => setPic(e.target.value)} 
        />
      </div>
      <button 
        onClick={submitHandler} 
        disabled={loading}
        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition disabled:bg-blue-300 mt-4"
      >
        {loading ? "Loading..." : "Sign Up"}
      </button>
    </div>
  );
};

export default Signup;