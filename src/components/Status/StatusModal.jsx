import { useEffect, useState, useCallback } from "react";
import { IoClose, IoChevronBack, IoChevronForward } from "react-icons/io5";

const StatusModal = ({ statusList, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const currentStatus = statusList[currentIndex];

  // --- 1. NAVIGATION LOGIC (Memoized to prevent bugs) ---
  const handleNext = useCallback(() => {
    if (currentIndex < statusList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0); // Reset bar immediately
    } else {
      onClose(); // Close if it's the last one
    }
  }, [currentIndex, statusList.length, onClose]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  }, [currentIndex]);

  // --- 2. TIMER LOGIC ---
  useEffect(() => {
    setProgress(0); // Reset progress whenever slide changes

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 100; // Just stop at 100, let the next effect handle the switch
        }
        return prev + 1; // Speed: Increase this number to make it faster (e.g., +2)
      });
    }, 40); // 40ms * 100 ticks = 4 seconds total

    return () => clearInterval(timer);
  }, [currentIndex]); 

  // --- 3. WATCH FOR COMPLETION ---
  useEffect(() => {
    if (progress >= 100) {
      handleNext();
    }
  }, [progress, handleNext]);

  // Safety Crash Prevention
  if (!currentStatus) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex justify-center items-center z-[200]">
      
      {/* Close Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); onClose(); }} 
        className="absolute top-5 right-5 text-white z-50 hover:text-gray-300 bg-black bg-opacity-20 rounded-full p-2"
      >
        <IoClose size={24} />
      </button>

      {/* --- CLICK ZONES FOR NAVIGATION --- */}
      {/* Left Click (Previous) */}
      <div 
        className="absolute inset-y-0 left-0 w-1/3 z-20 cursor-pointer" 
        onClick={handlePrev} 
        title="Previous"
      ></div>
      
      {/* Right Click (Next) */}
      <div 
        className="absolute inset-y-0 right-0 w-1/3 z-20 cursor-pointer" 
        onClick={handleNext} 
        title="Next"
      ></div>

      <div className="relative w-full max-w-md h-full md:h-[90vh] flex flex-col justify-center pointer-events-none">
        
        {/* --- PROGRESS BARS --- */}
        <div className="absolute top-4 left-0 w-full px-2 z-30 flex gap-1">
            {statusList.map((_, idx) => (
                <div key={idx} className="h-1 bg-gray-600 rounded-full flex-1 overflow-hidden">
                    <div 
                        className={`h-full bg-white transition-all duration-100 ease-linear ${
                            idx < currentIndex ? "w-full" : 
                            idx === currentIndex ? "" : "w-0"
                        }`}
                        style={{ width: idx === currentIndex ? `${progress}%` : undefined }}
                    ></div>
                </div>
            ))}
        </div>

        {/* --- USER HEADER --- */}
        <div className="absolute top-8 left-4 flex items-center gap-3 z-30">
            <img 
                src={currentStatus.user?.pic} 
                alt={currentStatus.user?.name} 
                className="w-10 h-10 rounded-full border border-white"
            />
            <div className="flex flex-col">
                <span className="text-white font-semibold text-sm drop-shadow-md">
                    {currentStatus.user?.name}
                </span>
                <span className="text-gray-200 text-xs drop-shadow-md">
                    {new Date(currentStatus.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
            </div>
        </div>

        {/* --- MAIN IMAGE --- */}
        <div className="flex-1 flex items-center justify-center p-2">
            <img 
                src={currentStatus.mediaUrl} 
                alt="Status" 
                className="max-h-full max-w-full object-contain"
            />
        </div>

        {/* --- CAPTION --- */}
        {currentStatus.caption && (
            <div className="absolute bottom-10 w-full text-center px-4 z-30">
                <p className="text-white text-lg font-medium bg-black bg-opacity-50 p-2 rounded-lg inline-block">
                    {currentStatus.caption}
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default StatusModal;