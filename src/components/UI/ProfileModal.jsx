import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IoClose, IoCamera, IoImage, IoLink } from "react-icons/io5"; // Added IoLink
import Webcam from "react-webcam"; 
import { ChatState } from "../../context/ChatProvider";
import api from "../../config/api";
import { toast } from "react-toastify";

const ProfileModal = ({ user, onClose }) => {
  const { setUser } = ChatState();
  const fileInputRef = useRef(null);
  const webcamRef = useRef(null); 
  
  const [editMode, setEditMode] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false); // <--- NEW STATE FOR URL INPUT
  
  const [name, setName] = useState(user.name);
  const [pic, setPic] = useState(user.pic);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    setName(user.name);
    setPic(user.pic);
  }, [user]);

  // --- HELPER: Convert Webcam Base64 to File ---
  const dataURLtoFile = (dataurl, filename) => {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
  }

  // --- 1. CAPTURE PHOTO ---
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    const file = dataURLtoFile(imageSrc, "webcam_photo.jpg");
    setShowWebcam(false);
    postDetails(file); 
  }, [webcamRef]);

  // --- 2. UPLOAD TO CLOUDINARY ---
  const postDetails = (pics) => {
    setImageLoading(true);
    if (pics === undefined) {
      toast.warning("Please Select an Image!");
      return;
    }

    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "YOUR_UPLOAD_PRESET_HERE"); 
      data.append("cloud_name", "YOUR_CLOUD_NAME_HERE");

      fetch("https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME_HERE/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());
          setImageLoading(false);
          toast.success("Image Uploaded!");
        })
        .catch((err) => {
          console.log(err);
          setImageLoading(false);
          toast.error("Error Uploading Image");
        });
    } else {
      toast.warning("Please Select an Image (jpeg/png)");
      setImageLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await api.put("/user/profile", { name, pic }, config);
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      setEditMode(false);
      setShowUrlInput(false);
      toast.success("Profile Updated!");
    } catch (error) {
      setLoading(false);
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100]">
      <div className="bg-white p-6 rounded-lg w-full max-w-sm text-center relative shadow-xl">
        
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition">
            <IoClose size={24} />
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {editMode ? "Edit Profile" : "My Profile"}
        </h2>

        {/* --- IMAGE DISPLAY AREA --- */}
        <div className="relative w-40 h-40 mx-auto mb-4 group flex justify-center items-center bg-gray-100 rounded-full overflow-hidden border-4 border-teal-500">
            {imageLoading ? (
               <span className="text-xs text-teal-600 font-bold">Uploading...</span>
            ) : showWebcam ? (
               <Webcam
                 audio={false}
                 ref={webcamRef}
                 screenshotFormat="image/jpeg"
                 className="w-full h-full object-cover"
               />
            ) : (
               <img 
                 className="w-full h-full object-cover"
                 src={pic} 
                 alt={name} 
                 onError={(e) => { e.target.src = "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"; }} // Fallback if URL is broken
               />
            )}
        </div>

        {/* --- CONTROLS (Edit Mode Only) --- */}
        {editMode && (
           <div className="flex flex-col items-center gap-3 mb-4">
              
              {/* Button Row */}
              <div className="flex gap-2">
                  {showWebcam ? (
                     <button 
                        onClick={capture}
                        className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm hover:bg-red-600"
                     >
                        <IoCamera /> Snap
                     </button>
                  ) : (
                     <>
                        <button 
                           onClick={() => { setShowWebcam(true); setShowUrlInput(false); }}
                           className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-300 flex items-center gap-1"
                           title="Take Photo"
                        >
                           <IoCamera /> Camera
                        </button>

                        <button 
                           onClick={() => fileInputRef.current.click()}
                           className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-300 flex items-center gap-1"
                           title="Upload File"
                        >
                           <IoImage /> Gallery
                        </button>

                        {/* NEW: URL Button */}
                        <button 
                           onClick={() => { setShowUrlInput(!showUrlInput); setShowWebcam(false); }}
                           className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 transition ${showUrlInput ? "bg-teal-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                           title="Paste URL"
                        >
                           <IoLink /> Link
                        </button>
                     </>
                  )}
              </div>

              {/* NEW: URL Input Field */}
              {showUrlInput && (
                  <input 
                    type="text"
                    placeholder="Paste Image URL here..."
                    className="w-full border p-2 rounded text-sm focus:border-teal-500 outline-none animate-fade-in"
                    onChange={(e) => setPic(e.target.value)} // Update preview instantly
                  />
              )}
           </div>
        )}
            
        {/* Hidden File Input */}
        <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={(e) => postDetails(e.target.files[0])}
        />

        {/* --- NAME INPUT --- */}
        <div className="text-left mb-6">
            <label className="text-xs text-gray-500 font-bold uppercase tracking-wide">Name</label>
            {editMode ? (
                <input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border-b-2 border-teal-500 text-lg py-1 focus:outline-none bg-gray-50 px-2"
                />
            ) : (
                <p className="text-xl font-medium text-gray-800 border-b border-gray-200 py-1">
                    {user.name}
                </p>
            )}
        </div>

        {/* --- SAVE / CANCEL BUTTONS --- */}
        <div className="flex gap-3 justify-center">
            {editMode ? (
                <>
                    <button 
                        onClick={() => { 
                            setEditMode(false); 
                            setShowWebcam(false); 
                            setShowUrlInput(false);
                            setName(user.name); 
                            setPic(user.pic); 
                        }} 
                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleUpdate}
                        disabled={loading || imageLoading}
                        className="px-6 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </>
            ) : (
                <button 
                    onClick={() => setEditMode(true)}
                    className="w-full py-2 rounded-lg bg-teal-500 text-white font-semibold hover:bg-teal-600 transition shadow-md"
                >
                    Edit Profile
                </button>
            )}
        </div>

      </div>
    </div>
  );
};

export default ProfileModal;