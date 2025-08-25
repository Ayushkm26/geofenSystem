import { motion } from "framer-motion";
import { UserPlus, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col text-gray-800">
      {/* Main Two-Column Layout */}
      <div
        className="flex-grow grid grid-cols-1 md:grid-cols-[3fr_1fr] min-h-screen gap-0 bg-no-repeat bg-center bg-cover relative"
        style={{
          backgroundImage:
            "url('https://static.vecteezy.com/system/resources/previews/066/509/728/large_2x/urban-landscape-featuring-a-red-location-pin-at-sunset-free-photo.jpeg')",
        }}
      >
        {/* Dark overlay for better contrast */}
        <div className="absolute inset-0  bg-black/40"></div>

        {/* Left Column - Project Info */}
        <div className="relative z-10 flex items-center  justify-center md:justify-start p-4 sm:p-6 md:p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.05 }}
            transition={{ duration: 0.8 }}
            className="bg-black/5 p-6 sm:p-8 rounded-lg shadow-lg max-w-full md:max-w-xl text-center md:text-left mx-auto md:mx-0"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              GeoFence Tracker
            </h2>
            <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">
              Our GeoFence application provides powerful location tracking in real-time,
              enabling you to define boundaries and receive instant alerts when a tracked device enters or leaves. Whether for business logistics, security, or personal use, GeoFence offers unmatched control and safety.
            </p>
          </motion.div>
        </div>

        {/* Right Column - Signup */}
        <motion.div
          className="relative  flex flex-col items-center justify-between h-full w-full text-center p-4 sm:p-6 md:p-8 cursor-pointer group"
          whileHover={{
            scale: 1.01,
            boxShadow: "0px 0px 50px rgba(255,255,255,0.5)",
            backgroundColor: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(8px)",
          }}
          transition={{ type: "spring", stiffness: 200, damping: 12, mass: 0.8 }}
        >
          {/* Text Section */}
          <div
            className="flex flex-col items-center absolute top-[5vh] left-1/2 -translate-x-1/2 
                       opacity-0 translate-y-4 transition-all duration-500 ease-out 
                       group-hover:opacity-100 group-hover:translate-y-0 max-w-[90vw] sm:max-w-[80vw] md:max-w-[60vw] lg:max-w-[50vw]"
          >
            <motion.h2
              whileHover={{ color: "black", scale: 1 }}
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-4 text-[#333333] leading-snug"
            >
              “Empowering Boundaries, Enabling Freedom”
            </motion.h2>

            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 leading-relaxed">
              Our geofence system uses advanced GPS and network technologies to define
              virtual boundaries around real-world locations. When a device enters or
              exits these zones, instant notifications are triggered, ensuring timely
              awareness and response.
            </p>
          </div>

          {/* Buttons Section */}
          <div className="absolute bottom-[5vh] w-full flex flex-col gap-3 sm:gap-4 px-4 sm:px-6 md:px-10">
            <motion.button
              onClick={() => navigate("/usersignup")}
              whileHover={{ scale: 1.05, backgroundColor: "#2563eb" }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center px-4 sm:px-6 md:px-8 py-2 sm:py-3 
                         bg-blue-500 text-white rounded-full font-semibold shadow-lg 
                         text-sm sm:text-base md:text-lg"
            >
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2" />
              Signup as User
            </motion.button>

            <motion.button
              onClick={() => navigate("/adminsignup")}
              whileHover={{ scale: 1.05, backgroundColor: "#16a34a" }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center px-4 sm:px-6 md:px-8 py-2 sm:py-3 
                         bg-green-500 text-white rounded-full font-semibold shadow-lg 
                         text-sm sm:text-base md:text-lg"
            >
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2" />
              Signup as Admin
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="py-4 bg-gray-800 text-gray-300 text-center">
        © {new Date().getFullYear()} GeoFence Tracker. All rights reserved.
      </footer>
    </div>
  );
}
