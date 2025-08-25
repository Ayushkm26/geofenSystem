import { useState } from "react";
import { Edit, Trash2, AlertCircle } from "lucide-react";

const AdminGeofenceCard = ({ geofence, onEdit, onDelete }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ ...geofence });

  const handleDelete = () => {
    onDelete(geofence.id);
    setShowConfirm(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    onEdit(editForm); // send updated data back to parent
    setShowEdit(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{geofence.name}</h3>
          <p className="text-gray-600 text-sm">
            Created: {new Date(geofence.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditForm({ ...geofence });
              setShowEdit(true);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Geofence Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Latitude</p>
          <p className="font-medium">{geofence.latitude}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Longitude</p>
          <p className="font-medium">{geofence.longitude}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Radius</p>
          <p className="font-medium">{geofence.radius}m</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Active Users</p>
          <p className="font-medium">{geofence.UserGeofence?.length || 0}</p>
        </div>
      </div>

      {/* Assigned Users */}
      {(geofence.UserGeofence?.length || 0) > 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-2">Assigned Users:</p>
          <div className="flex flex-wrap gap-2">
            {geofence.UserGeofence?.slice(0, 3).map((userGeo) => (
              <span
                key={userGeo.id}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
              >
                {userGeo.user.name}
              </span>
            ))}
            {geofence.UserGeofence.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                +{geofence.UserGeofence.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Popup */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                Confirm Delete
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <b>{geofence.name}</b>? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Popup */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Edit Geofence
            </h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Latitude</label>
                  <input
                    type="number"
                    value={editForm.latitude}
                    onChange={(e) =>
                      setEditForm({ ...editForm, latitude: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Longitude</label>
                  <input
                    type="number"
                    value={editForm.longitude}
                    onChange={(e) =>
                      setEditForm({ ...editForm, longitude: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Radius (m)</label>
                <input
                  type="number"
                  value={editForm.radius}
                  onChange={(e) =>
                    setEditForm({ ...editForm, radius: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGeofenceCard;
