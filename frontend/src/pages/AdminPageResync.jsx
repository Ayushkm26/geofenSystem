import { useEffect, useState } from "react";
import axios from "axios";
import AdminHeader from "../components/AdminHeader";
import Footer from "../components/Footers";

export default function AdminPageResync() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Axios instance with default headers
  const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL, // <-- no quotes, no template string
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  },
});
  // Fetch requests from backend
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get(`/api/rsync/admin`);
        setRequests(res.data);
        console.log(res.data);
      } catch (error) {
        console.error("Failed to fetch resync requests", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // Approve request
  const handleApprove = async (id) => {
    try {
      const res = await api.put(`/api/rsync/${id}/approve`, {});
      setRequests((prev) => prev.map((r) => (r.id === id ? res.data : r)));
    } catch (err) {
      console.error("Approve failed", err);
      alert("❌ Failed to approve request");
    }
  };

  // Reject request
  const handleReject = async (id) => {
    try {
      const res = await api.put(`/api/rsync/${id}/reject`, {});
      setRequests((prev) => prev.map((r) => (r.id === id ? res.data : r)));
    } catch (err) {
      console.error("Reject failed", err);
      alert("❌ Failed to reject request");
    }
  };

  // Filtered requests
  const getFilteredRequests = () => {
    if (filter === "all") return requests;
    return requests.filter((req) => req.status.toLowerCase() === filter);
  };

  // Helpers
  const getStatusBadge = (status) => {
    const s = status.toLowerCase();
    const badges = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    };
    return badges[s] || badges.pending;
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Counts
  const pendingCount = requests.filter((r) => r.status === "PENDING").length;
  const approvedCount = requests.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = requests.filter((r) => r.status === "REJECTED").length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-slate-600">Loading requests...</p>
      </div>
    );
  }

  return (
    <>
    <AdminHeader />
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">Admin Dashboard</h1>
          <p className="text-slate-600 text-lg">Manage resync requests and system updates</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Requests" value={requests.length} color="blue" />
          <StatCard title="Pending" value={pendingCount} color="yellow" />
          <StatCard title="Approved" value={approvedCount} color="green" />
          <StatCard title="Rejected" value={rejectedCount} color="red" />
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {["all", "pending", "approved", "rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-3 rounded-xl font-medium transition-colors duration-200 ${
                  filter === status
                    ? status === "all"
                      ? "bg-blue-100 text-blue-800 border-2 border-blue-200"
                      : status === "pending"
                      ? "bg-yellow-100 text-yellow-800 border-2 border-yellow-200"
                      : status === "approved"
                      ? "bg-green-100 text-green-800 border-2 border-green-200"
                      : "bg-red-100 text-red-800 border-2 border-red-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} (
                {status === "all"
                  ? requests.length
                  : requests.filter((r) => r.status.toLowerCase() === status).length}
                )
              </button>
            ))}
          </div>
        </div>

        {/* Requests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {getFilteredRequests().map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-2xl shadow-lg border-2 p-6 transition-all duration-200 hover:shadow-xl"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">{request.type}</h3>
                  <p className="text-sm text-slate-500">#{request.id}</p>
                </div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(
                    request.status
                  )}`}
                >
                  {request.status}
                </span>
              </div>

              {/* Request Details */}
              <div className="space-y-3 mb-6">
                <p><strong>Email:</strong> {request.user?.email || "N/A"}</p>
                <p><strong>Fence:</strong> {request.geofence?.name || request.fenceId}</p>
                <p><strong>Reason:</strong> {request.requestReason}</p>
                <p><strong>Submitted:</strong> {formatDateTime(request.createdAt)}</p>
              </div>

              {/* Actions */}
              {request.status === "PENDING" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReject(request.id)}
                    className="flex-1 py-3 px-4 rounded-xl border-2 border-red-200 text-red-700 font-semibold hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(request.id)}
                    className="flex-1 py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors duration-200"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {getFilteredRequests().length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No requests found.
          </div>
        )}
      </div>
    </div>
     <Footer />
    
    </>
  );
}

// Small StatCard component
function StatCard({ title, value, color }) {
  const bgColors = {
    blue: "bg-blue-500 text-blue-600",
    yellow: "bg-yellow-500 text-yellow-600",
    green: "bg-green-500 text-green-600",
    red: "bg-red-500 text-red-600",
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className={`text-3xl font-bold ${bgColors[color].split(" ")[1]}`}>{value}</p>
        </div>
        <div className={`w-12 h-12 ${bgColors[color].split(" ")[0]} rounded-lg flex items-center justify-center`}>
          <span className="text-white font-bold">{value}</span>
        </div>
      </div>
    </div>
  );
}
