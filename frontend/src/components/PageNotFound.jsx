import React from "react";
import { motion } from "framer-motion";

const PageNotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200 p-6">
      <motion.div
        className="text-center bg-white rounded-2xl p-10 shadow-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* 404 Animation */}
        <motion.h1
          className="text-8xl lg:text-9xl font-extrabold text-black mb-4"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          404
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-lg lg:text-xl text-black/80 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Oops! The page you are looking for does not exist.
        </motion.p>

        {/* Go Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-black text-white font-semibold rounded-lg shadow-lg hover:bg-gray-800 transition"
          onClick={() => window.history.back()}
        >
          Go Back
        </motion.button>
      </motion.div>
    </div>
  );
};

export default PageNotFound;
