import React, { useState } from "react";

function Cards() {
  const [isSharing, setIsSharing] = useState(false);

  return (
    <div className="custom-rectangle-card w-full sm:w-[500px] h-[220px] p-6 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700 flex flex-col justify-between">
      <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
        Start sharing your live location
      </h5>
      <p className="mb-3 text-sm text-gray-700 dark:text-gray-400">
        Share your live location with your friends and family. They can track you in real-time on the map.
      </p>

      <div className="flex justify-center items-center mt-3">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-green-500 rounded-lg hover:bg-green-600 focus:ring-4 focus:outline-none mr-3 disabled:opacity-50"
          onClick={() => setIsSharing(true)}
          disabled={isSharing}
        >
          Start sharing
        </button>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-red-500 rounded-lg hover:bg-red-600 focus:ring-4 focus:outline-none ml-3 disabled:opacity-50"
          onClick={() => setIsSharing(false)}
          disabled={!isSharing}
        >
          Stop sharing
        </button>
      </div>
    </div>
  );
}

export default Cards;
