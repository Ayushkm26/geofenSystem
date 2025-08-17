import React, { useContext } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import Footer from '../components/Footers';
import Cards from '../components/Cards';
import { UserDataContext } from "../Context/UserContext";
import GeofenceCard from '../components/GeofenceCard';
import LocationHistoryCard from '../components/LocationHistoryCard';
import StatsCard from '../components/Statscard';
import { motion } from 'framer-motion';
import { LocationContext } from '../Context/UserContext';

function Dashboard() {
  const { user } = useContext(UserDataContext);
  const { isShared, setIsShared } = useContext(LocationContext);

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader type="user" />

      {/* Dashboard heading */}
      <div className="container mx-auto px-4 py-8 text-left">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p className="text-gray-700 font-bold mb-1">Welcome {user.name}!</p>
      </div>

      {/* Cards Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 place-items-center">
          <Cards isShared={isShared} setIsShared={setIsShared} />
          <GeofenceCard />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 place-items-center">
          <LocationHistoryCard />
          <StatsCard />
        </div>
      </div>

      {/* Animated dashboard info with delay */}
      <div>
        <motion.p
          className="text-center text-gray-500 mt-3 mb-1"
          initial={{ opacity: 0, y: 20 }}   // Start invisible & slightly down
          animate={{ opacity: 1, y: 0 }}    // Animate to visible & centered
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }} // Delay added
        >
          This is your live dashboard. All data is fetched from the server and
          displayed here in real-time.
        </motion.p>
      </div>

      <Footer />
    </div>
  );
}

export default Dashboard;
