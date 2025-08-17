import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardHeader from "../components/DashboardHeader";
import { Spinner } from "../components/Spinner";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString();
};

const VisitTable = ({ visits }) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const safeVisits = Array.isArray(visits) ? visits : [];

  const filtered = safeVisits.filter((v) =>
    v.areaName.toLowerCase().includes(search.toLowerCase())
  );

  const startIndex = (page - 1) * rowsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + rowsPerPage);
  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;

  return (
    <div className="max-w mx-auto p-4 bg-white shadow-md rounded-lg">
      <div className="flex justify-center mb-4">
        <input
          type="text"
          placeholder="Search by area..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-lg shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">Area</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">In Time</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">Out Time</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">Current Status</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">Disconnected</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length > 0 ? (
              paginated.map((visit, idx) => (
                <tr key={visit.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-2 text-sm text-gray-800 border-b">{visit.areaName}</td>
                  <td className="px-4 py-2 text-sm text-gray-600 border-b">{formatDate(visit.inTime)}</td>
                  <td className="px-4 py-2 text-sm text-gray-600 border-b">{formatDate(visit.outTime)}</td>
                  <td className="px-4 py-2 text-sm border-b">
                    {visit.currentStatus ? (
                      <span className="px-2 py-1 text-green-700 bg-green-100 rounded-full text-xs">Active</span>
                    ) : (
                      <span className="px-2 py-1 text-red-700 bg-red-100 rounded-full text-xs">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm border-b">
                    {visit.isDisconnected ? (
                      <span className="px-2 py-1 text-yellow-700 bg-yellow-100 rounded-full text-xs">Yes</span>
                    ) : (
                      <span className="px-2 py-1 text-gray-700 bg-gray-100 rounded-full text-xs">No</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default function LocationHistory() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/users/locationHistory", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setVisits(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error fetching location history:", error);
        setVisits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVisits();
    const interval = setInterval(fetchVisits, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* ✅ Moved header here */}
      <DashboardHeader type="user" />

      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Visit Logs</h2>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner />
          </div>
        ) : (
          <VisitTable visits={visits} />
        )}
      </div>
    </>
  );
}
