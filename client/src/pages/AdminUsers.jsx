import React, { useState, useEffect } from "react";
import {
  Search,
  Trash2,
  Edit3,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { adminAPI } from "../services/api/adminAPI";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState("");

  async function fetchUsers() {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers(
        currentPage,
        10,
        roleFilter || null,
        search,
      );
      setUsers(response.data.data.users);
      setTotalPages(response.data.data.pagination.pages);
      setLoading(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch users");
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getAllUsers(
          currentPage,
          10,
          roleFilter || null,
          search,
        );

        if (cancelled) return;

        setUsers(response.data.data.users);
        setTotalPages(response.data.data.pagination.pages);
        setLoading(false);
      } catch (error) {
        if (!cancelled) {
          toast.error(error?.response?.data?.message || "Failed to fetch users");
          setLoading(false);
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [currentPage, search, roleFilter]);

  const handleUpdateRole = async (userId) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      toast.success("User role updated successfully");
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update user role");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await adminAPI.deleteUser(userId);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete user");
    }
  };

  const handleSuspendUser = async (userId) => {
    try {
      await adminAPI.suspendUser(userId, "Suspended by admin");
      toast.success("User suspended successfully");
      fetchUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to suspend user");
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      await adminAPI.activateUser(userId);
      toast.success("User activated successfully");
      fetchUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to activate user");
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
        <p className="text-slate-400">Manage all system users</p>
      </div>

      {/* Filters */}
      <div className="bg-slate-700 rounded-lg p-6 mb-6 ring-1 ring-slate-600">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-600 text-white rounded border border-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-slate-600 text-white rounded border border-slate-500 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="traveller">Traveller</option>
            <option value="verifier">Verifier</option>
          </select>

          <button
            onClick={() => fetchUsers()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-700 rounded-lg overflow-hidden ring-1 ring-slate-600">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-600">
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-slate-600 transition"
                    >
                      <td className="px-6 py-4 text-sm text-white">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        {editingUser === user._id ? (
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="px-2 py-1 bg-slate-600 text-white rounded text-sm"
                          >
                            <option>admin</option>
                            <option>traveller</option>
                            <option>verifier</option>
                          </select>
                        ) : (
                          <span
                            className={`px-3 py-1 rounded text-xs font-semibold ${
                              user.role === "admin"
                                ? "bg-amber-500 text-white"
                                : user.role === "verifier"
                                  ? "bg-purple-500 text-white"
                                  : "bg-blue-500 text-white"
                            }`}
                          >
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {user.phone}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {editingUser === user._id ? (
                            <>
                              <button
                                onClick={() => handleUpdateRole(user._id)}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold transition"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingUser(null)}
                                className="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white rounded text-xs font-semibold transition"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingUser(user._id);
                                  setNewRole(user.role);
                                }}
                                className="p-1 text-blue-400 hover:text-blue-300 transition"
                                title="Edit role"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              {user.suspended ? (
                                <button
                                  onClick={() => handleActivateUser(user._id)}
                                  className="p-1 text-green-400 hover:text-green-300 transition"
                                  title="Activate"
                                >
                                  <Unlock className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleSuspendUser(user._id)}
                                  className="p-1 text-yellow-400 hover:text-yellow-300 transition"
                                  title="Suspend"
                                >
                                  <Lock className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                                className="p-1 text-red-400 hover:text-red-300 transition"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-600 border-t border-slate-500">
              <p className="text-sm text-slate-300">
                Page{" "}
                <span className="font-semibold text-white">{currentPage}</span>{" "}
                of{" "}
                <span className="font-semibold text-white">{totalPages}</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-slate-300 hover:text-white disabled:opacity-50 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 text-slate-300 hover:text-white disabled:opacity-50 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
