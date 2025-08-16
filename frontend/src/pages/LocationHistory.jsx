import React from "react";

// Utility: Format date nicely
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString();
};

const VisitTable = ({ visits }) => {
  return (
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
          {visits.map((visit, idx) => (
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Example usage
export default function LocationHistory() {
  const data = [
    {
      id: "e0379971-9e72-437a-ac2a-d5de05dc23d5",
      userId: "b84a6945-9787-4fc0-bf37-a54a37da55cf",
      areaId: "90e77884-67a3-4dd7-814c-1a8ed3e3f019",
      areaName: "school",
      inTime: "2025-08-16T09:20:47.952Z",
      inLongitude: 33.54545,
      inLatitude: 73.345455,
      outTime: null,
      outLongitude: 0,
      outLatitude: 0,
      totalTime: null,
      currentStatus: true,
      isDisconnected: false,
      locationSharingTime: "2025-08-16T09:20:47.954Z",
      isSwitched: false,
    },
    {
      id: "f044df4a-0173-47b6-8f1e-8bf42171c00e",
      userId: "b84a6945-9787-4fc0-bf37-a54a37da55cf",
      areaId: "90e77884-67a3-4dd7-814c-1a8ed3e3f019",
      areaName: "school",
      inTime: "2025-08-14T09:21:32.223Z",
      inLongitude: 33.54545,
      inLatitude: 73.345455,
      outTime: "2025-08-16T09:20:18.965Z",
      outLongitude: 33.54545,
      outLatitude: 80.345455,
      totalTime: null,
      currentStatus: true,
      isDisconnected: true,
      locationSharingTime: "2025-08-14T09:21:32.224Z",
      isSwitched: false,
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Visit Logs</h2>
      <VisitTable visits={data} />
    </div>
  );
}
