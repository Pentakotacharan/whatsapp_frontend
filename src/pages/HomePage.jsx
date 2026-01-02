import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";

const HomePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login"); // 'login' or 'signup'

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) navigate("/chats");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 bg-[url('/background.png')]"> 
      <div className="w-full max-w-xl">
        {/* Header Box */}
        <div className="bg-white flex justify-center p-4 w-full mb-4 rounded-lg border border-gray-200 shadow-sm">
          <h1 className="text-3xl font-light font-sans text-gray-800">WhatsApp Clone</h1>
        </div>

        {/* Auth Box */}
        <div className="bg-white w-full p-6 rounded-lg border border-gray-200 shadow-sm">
          {/* Tabs */}
          <div className="flex mb-6 bg-gray-100 p-1 rounded-full">
            <button
              onClick={() => setActiveTab("login")}
              className={`w-1/2 py-2 text-center rounded-full text-sm font-medium transition-all ${
                activeTab === "login" 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`w-1/2 py-2 text-center rounded-full text-sm font-medium transition-all ${
                activeTab === "signup" 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-4">
            {activeTab === "login" ? <Login /> : <Signup />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;