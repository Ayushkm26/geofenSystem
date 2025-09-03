import { useState, useEffect } from "react";
import axios from "axios"; // you can also use fetch()
import DashboardHeader from "../components/DashboardHeader"
import Footer from "../components/Footers";
export default function UserResyncPage() {
  const [activeTab, setActiveTab] = useState("request"); // "request" or "history"
  const [isFormEnabled, setIsFormEnabled] = useState(false);
  const [showDevicePopup, setShowDevicePopup] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [formData, setFormData] = useState({
    fenceId: "",
    timing: "",
    reason: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);


  // Fetch history data
  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/rsync/user`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      setHistoryData(res.data);
      setHistoryLoading(false);
    } catch (err) {
      console.error("Error fetching history:", err);
      alert(err.response?.data?.error || "Failed to fetch request history.");
      
      // Fallback to mock data for demonstration if API fails
      setTimeout(() => {
        setHistoryData(mockHistoryData);
        setHistoryLoading(false);
      }, 500);
    }
  };

  // Load history when switching to history tab
  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab]);

  // ✅ Common request function
  const sendResyncRequest = async (type) => {
    try {
      setLoading(true);
      const payload = {
        fenceId: formData.fenceId,
        timing: formData.timing,
        requestReason: formData.reason,
        type,
      };

      // If you need auth, make sure to attach JWT in headers
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/resync`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // if you're using JWT
        },
      });

      alert("Resync request created successfully!");
      console.log("Resync response:", res.data);

      setFormData({ fenceId: "", timing: "", reason: "", email: "" });
      setShowDevicePopup(false);
      setShowLocationPopup(false);
      
      // Refresh history if on history tab
      if (activeTab === "history") {
        fetchHistory();
      }
    } catch (err) {
      console.error("Error creating resync:", err);
      alert(err.response?.data?.error || "Failed to create resync request.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Custom Form Submit
  const handleFormSubmit = () => {
    sendResyncRequest("CUSTOM");
  };

  // ✅ Popup Submit
  const handlePopupSubmit = (type) => {
    sendResyncRequest(type);
  };

  const handleDeviceSwitchClick = () => {
    setShowDevicePopup(true);
    setShowLocationPopup(false);
    setIsFormEnabled(false);
  };

  const handleLocationHistoryClick = () => {
    setShowLocationPopup(true);
    setShowDevicePopup(false);
    setIsFormEnabled(false);
  };

  const handleOthersClick = () => {
    setIsFormEnabled(true);
    setShowDevicePopup(false);
    setShowLocationPopup(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const closePopups = () => {
    setShowDevicePopup(false);
    setShowLocationPopup(false);
    setFormData({ fenceId: '', timing: '', reason: '', email: '' });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "Device Switch":
        return (
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
        );
      case "Location History Update":
        return (
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </div>
        );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
    <DashboardHeader />
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">Device Resync</h1>
          <p className="text-slate-600 text-lg">Manage device synchronization and location updates</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 mb-8 overflow-hidden">
          <div className="flex">
            <button
              onClick={() => setActiveTab("request")}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-200 ${
                activeTab === "request"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 text-slate-600 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Request
              </div>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-200 ${
                activeTab === "history"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 text-slate-600 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Request History
              </div>
            </button>
          </div>
        </div>

        {/* Request Tab Content */}
        {activeTab === "request" && (
          <>
            {/* Action Buttons Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-6">Quick Actions</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleDeviceSwitchClick}
                  className="group bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-300 rounded-xl p-6 text-left transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <div className="w-5 h-5 text-red-400 group-hover:text-red-500">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Device Switched</h3>
                  <p className="text-sm text-slate-600">Report device switching events</p>
                </button>

                <button
                  onClick={handleLocationHistoryClick}
                  className="group bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 hover:border-emerald-300 rounded-xl p-6 text-left transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="w-5 h-5 text-emerald-400 group-hover:text-emerald-500">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Update Location History</h3>
                  <p className="text-sm text-slate-600">Modify location tracking data</p>
                </button>

                <button
                  onClick={handleOthersClick}
                  className="group bg-violet-50 hover:bg-violet-100 border-2 border-violet-200 hover:border-violet-300 rounded-xl p-6 text-left transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-violet-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                    </div>
                    <div className="w-5 h-5 text-violet-400 group-hover:text-violet-500">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Others</h3>
                  <p className="text-sm text-slate-600">Enable custom request form</p>
                </button>
              </div>
            </div>

            {/* Main Form Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-slate-800">Custom Request Form</h2>
                {isFormEnabled ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    Enabled
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                    Disabled
                  </span>
                )}
              </div>
              
              {!isFormEnabled && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-blue-700 text-sm">Click the "Others" button above to enable this form</p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isFormEnabled}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-colors duration-200 ${
                      isFormEnabled 
                        ? 'border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800' 
                        : 'border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed'
                    }`}
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Fence ID *
                  </label>
                  <input
                    type="text"
                    name="fenceId"
                    value={formData.fenceId}
                    onChange={handleInputChange}
                    disabled={!isFormEnabled}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-colors duration-200 ${
                      isFormEnabled 
                        ? 'border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800' 
                        : 'border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed'
                    }`}
                    placeholder="Enter fence identifier"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Timing *
                  </label>
                  <input
                    type="datetime-local"
                    name="timing"
                    value={formData.timing}
                    onChange={handleInputChange}
                    disabled={!isFormEnabled}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-colors duration-200 ${
                      isFormEnabled 
                        ? 'border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800' 
                        : 'border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Reason *
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    disabled={!isFormEnabled}
                    rows="4"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-colors duration-200 resize-none ${
                      isFormEnabled 
                        ? 'border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800' 
                        : 'border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed'
                    }`}
                    placeholder="Describe the reason for this request..."
                  />
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleFormSubmit}
                    disabled={!isFormEnabled || loading}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-colors duration-200 ${
                      isFormEnabled && !loading
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl' 
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {loading ? "Sending..." : "Send Request"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* History Tab Content */}
        {activeTab === "history" && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-slate-800">Request History</h2>
              <button
                onClick={fetchHistory}
                disabled={historyLoading}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
              >
                <svg className={`w-4 h-4 mr-2 ${historyLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {historyLoading ? "Loading..." : "Refresh"}
              </button>
            </div>

            {historyLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : historyData.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                <p className="text-gray-600">You haven't made any resync requests yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {historyData.map((request) => (
                  <div key={request.id} className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        {getTypeIcon(request.type)}
                        <div className="ml-3">
                          <h3 className="text-lg font-semibold text-slate-800">{request.type}</h3>
                          <p className="text-sm text-slate-600">Fence ID: {request.fenceId}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-slate-700">Admin Id</p>
                        <p className="text-sm text-slate-600">{request.adminId}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Created</p>
                        <p className="text-sm text-slate-600">{formatDate(request.createdAt)}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-slate-700 mb-1">Reason</p>
                      <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{request.requestReason}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>ID: #{request.id}</span>
                      <span>Last updated: {formatDate(request.updatedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Device Switch Popup */}
        {showDevicePopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">Device Switched</h3>
                </div>
                <button
                  onClick={closePopups}
                  className="text-slate-400 hover:text-slate-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Fence ID</label>
                  <input
                    type="text"
                    name="fenceId"
                    value={formData.fenceId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-red-500 focus:ring-0"
                    placeholder="Enter fence ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Timing</label>
                  <input
                    type="datetime-local"
                    name="timing"
                    value={formData.timing}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-red-500 focus:ring-0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Reason</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-red-500 focus:ring-0 resize-none"
                    placeholder="Reason for device switch..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={closePopups}
                    className="flex-1 py-3 px-4 rounded-xl border-2 border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handlePopupSubmit('Device Switch')}
                    disabled={loading}
                    className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors duration-200 disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send Request"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Location History Popup */}
        {showLocationPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">Location History</h3>
                </div>
                <button
                  onClick={closePopups}
                  className="text-slate-400 hover:text-slate-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Fence ID</label>
                  <input
                    type="text"
                    name="fenceId"
                    value={formData.fenceId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-0"
                    placeholder="Enter fence ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Time</label>
                  <input
                    type="datetime-local"
                    name="timing"
                    value={formData.timing}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Reason</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-0 resize-none"
                    placeholder="Reason for location update..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={closePopups}
                    className="flex-1 py-3 px-4 rounded-xl border-2 border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handlePopupSubmit('Location History Update')}
                    disabled={loading}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors duration-200 disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send Request"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
          <Footer />
        </>
  );
}