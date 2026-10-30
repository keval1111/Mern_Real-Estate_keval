import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  Inbox,
  Shield,
  ShieldAlert,
  UserCheck,
  UserCog,
  Plus,
  RefreshCw,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  Building,
  Key,
  BadgePercent
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { userApi } from '../services/api';

const AVAILABLE_ROLES = [
  { value: 'Sub-Admin', label: 'Sub-Admin', badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800' },
  { value: 'Customer', label: 'Customer (Buyer)', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800' },
  { value: 'Super Admin', label: 'Super Admin (Full Access)', badgeColor: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800' },
  { value: 'Staff', label: 'Staff Member', badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800' },
  { value: 'Property Editor', label: 'Property Editor', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' },
  { value: 'Finance Admin', label: 'Finance Admin', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' },
];

const Customers = () => {
  const { isDark } = useTheme();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [toast, setToast] = useState(null);

  // Modal State for adding new user/staff
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    role: 'Customer',
    password: '',
    status: 'Active',
  });
  const [savingUser, setSavingUser] = useState(false);

  // Role Edit Modal / Quick Select State
  const [roleEditUser, setRoleEditUser] = useState(null);
  const [selectedNewRole, setSelectedNewRole] = useState('');
  const [changingRoleId, setChangingRoleId] = useState(null);

  // Notification Toast Helper
  const showNotification = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch users from MongoDB
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userApi.getAll();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load users:', err);
      showNotification('Failed to fetch users from database', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle Role Change
  const handleRoleChange = async (userId, newRole) => {
    if (!userId || !newRole) return;
    setChangingRoleId(userId);
    try {
      const res = await userApi.updateRole(userId, newRole);
      if (res) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole, permissions: res.permissions } : u))
        );
        showNotification(`Role successfully changed to "${newRole}"!`);
      } else {
        showNotification('Could not update role', 'error');
      }
    } catch (err) {
      showNotification(err.message || 'Error updating role', 'error');
    } finally {
      setChangingRoleId(null);
      setRoleEditUser(null);
    }
  };

  // Handle Status Toggle (Active / Inactive)
  const handleStatusToggle = async (user) => {
    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await userApi.updateStatus(user._id, nextStatus);
      if (res) {
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, status: nextStatus } : u))
        );
        showNotification(`User account marked as ${nextStatus}!`);
      }
    } catch (err) {
      showNotification('Failed to update status', 'error');
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (user) => {
    if (user.email === 'admin@realestate.com') {
      showNotification('Primary Super Admin cannot be deleted', 'error');
      return;
    }
    const targetId = user._id || user.id;
    if (!targetId) {
      showNotification('User ID not found', 'error');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ${user.name} (${user.email})?`)) return;

    try {
      const ok = await userApi.delete(targetId);
      if (ok) {
        setUsers((prev) => prev.filter((u) => (u._id || u.id) !== targetId));
        showNotification(`User "${user.name}" has been deleted.`);
      } else {
        showNotification('Failed to delete user', 'error');
      }
    } catch (err) {
      showNotification('Error deleting user', 'error');
    }
  };

  // Handle Add New User/Staff Submit
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.email) {
      showNotification('Please enter full name and email', 'error');
      return;
    }

    setSavingUser(true);
    try {
      const res = await userApi.create(newUserData);
      if (res) {
        await fetchUsers();
        showNotification(`User "${newUserData.name}" added as ${newUserData.role}!`);
        setShowAddModal(false);
        setNewUserData({
          name: '',
          email: '',
          phone: '',
          city: '',
          role: 'Customer',
          password: '',
          status: 'Active',
        });
      } else {
        showNotification('Failed to create user', 'error');
      }
    } catch (err) {
      showNotification(err.message || 'Error creating user', 'error');
    } finally {
      setSavingUser(false);
    }
  };

  // Metrics calculation
  const totalUsers = users.length;
  const customerCount = users.filter((u) => u.role === 'Customer').length;
  const adminStaffCount = users.filter((u) => u.role !== 'Customer').length;
  const activeCount = users.filter((u) => u.status === 'Active').length;

  // Filtered List
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.role || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.addresses?.[0]?.city || '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'Customers') return u.role === 'Customer';
    if (activeFilter === 'Admins') return u.role !== 'Customer';
    if (activeFilter === 'Super Admin') return u.role === 'Super Admin';
    return true;
  });

  const getRoleBadgeStyle = (role) => {
    const found = AVAILABLE_ROLES.find((r) => r.value === role);
    return found ? found.badgeColor : 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div
      className={`space-y-6 max-w-7xl mx-auto transition-colors duration-200 ${
        isDark ? 'bg-black text-white' : 'text-slate-900'
      }`}
    >
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toast.type === 'error'
              ? 'bg-rose-950 text-rose-200 border-rose-800'
              : 'bg-emerald-950 text-emerald-200 border-emerald-800'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1
              className={`text-2xl font-extrabold tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Users & Customer Management
            </h1>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-brand/30 bg-brand/10 text-brand">
              Role Changer Active
            </span>
          </div>
          <p
            className={`text-xs font-medium mt-1 ${
              isDark ? 'text-gray-400' : 'text-slate-500'
            }`}
          >
            Manage both buyers and admin staff members. Change roles and toggle platform access in real time.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isDark
                ? 'bg-neutral-900 hover:bg-neutral-800 text-gray-300 border-white/20'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="Refresh database"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-brand' : ''} />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border shadow-xs cursor-pointer transition-all ${
              isDark
                ? 'bg-white hover:bg-neutral-200 text-black border-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
            }`}
          >
            <Plus size={16} /> Add User / Staff
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className={`p-4 rounded-2xl border transition-colors ${
            isDark ? 'bg-neutral-950 border-white/20' : 'bg-white border-slate-200 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
              Total Accounts
            </span>
            <Users size={16} className="text-brand" />
          </div>
          <p className="text-2xl font-black">{totalUsers}</p>
          <span className="text-[11px] text-gray-400">Database Registered</span>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-colors ${
            isDark ? 'bg-neutral-950 border-white/20' : 'bg-white border-slate-200 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
              Customers (Buyers)
            </span>
            <UserCheck size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-black text-blue-500">{customerCount}</p>
          <span className="text-[11px] text-gray-400">Storefront Clients</span>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-colors ${
            isDark ? 'bg-neutral-950 border-white/20' : 'bg-white border-slate-200 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
              Admins & Staff
            </span>
            <Shield size={16} className="text-purple-500" />
          </div>
          <p className="text-2xl font-black text-purple-500">{adminStaffCount}</p>
          <span className="text-[11px] text-gray-400">With Portal Access</span>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-colors ${
            isDark ? 'bg-neutral-950 border-white/20' : 'bg-white border-slate-200 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
              Active Status
            </span>
            <CheckCircle size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-500">{activeCount}</p>
          <span className="text-[11px] text-gray-400">Healthy & Verified</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className={`p-3.5 rounded-2xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 ${
          isDark ? 'bg-neutral-950 border-white/20' : 'bg-white border-slate-200 shadow-2xs'
        }`}
      >
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
              isDark ? 'text-gray-400' : 'text-slate-400'
            }`}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, city, or role..."
            className={`w-full text-xs font-medium rounded-xl pl-10 pr-4 py-2 border transition-all focus:outline-none ${
              isDark
                ? 'bg-neutral-900 text-white placeholder-gray-500 border-white/20 focus:border-brand'
                : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-brand'
            }`}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {['All', 'Customers', 'Admins', 'Super Admin'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === tab
                  ? isDark
                    ? 'bg-white text-black border-white shadow-xs'
                    : 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : isDark
                  ? 'bg-neutral-900 text-gray-300 border-white/10 hover:border-white/30'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {tab === 'All' && `All (${totalUsers})`}
              {tab === 'Customers' && `Customers (${customerCount})`}
              {tab === 'Admins' && `Admins/Staff (${adminStaffCount})`}
              {tab === 'Super Admin' && `Super Admin`}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div
        className={`rounded-2xl overflow-hidden border shadow-xs transition-colors ${
          isDark ? 'bg-black border-white/20' : 'bg-white border-slate-200'
        }`}
      >
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <RefreshCw size={28} className="animate-spin text-brand mb-3" />
            <p className="text-xs font-bold text-gray-400">Loading users from MongoDB database...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead
                className={`border-b uppercase tracking-wider text-[11px] font-bold ${
                  isDark
                    ? 'bg-neutral-900 text-white border-white/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <tr>
                  <th className="py-3.5 px-5">User Account</th>
                  <th className="py-3.5 px-4">Contact & Location</th>
                  <th className="py-3.5 px-4">Role (Changeable)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Orders / Spent</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y font-medium ${
                  isDark ? 'divide-white/10 text-gray-300' : 'divide-slate-100 text-slate-700'
                }`}
              >
                {filteredUsers.map((user) => {
                  const city = user.addresses?.[0]?.city || 'N/A';
                  const isPrimaryAdmin = user.email === 'admin@realestate.com';
                  const isChangingThis = changingRoleId === user._id;

                  return (
                    <tr
                      key={user._id}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-neutral-900/60' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Name & Email */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full border flex items-center justify-center font-extrabold text-xs shrink-0 ${
                              user.role === 'Super Admin'
                                ? 'bg-purple-950 text-purple-300 border-purple-500'
                                : user.role === 'Customer'
                                ? 'bg-blue-950 text-blue-300 border-blue-500'
                                : 'bg-amber-950 text-amber-300 border-amber-500'
                            }`}
                          >
                            {(user.name || 'U').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-bold ${
                                  isDark ? 'text-white' : 'text-slate-900'
                                }`}
                              >
                                {user.name}
                              </span>
                              {isPrimaryAdmin && (
                                <span className="text-[10px] bg-purple-500 text-white font-black px-1.5 py-0.2 rounded">
                                  PRIMARY
                                </span>
                              )}
                            </div>
                            <div
                              className={`text-[11px] ${
                                isDark ? 'text-gray-400' : 'text-slate-500'
                              }`}
                            >
                              {user.email}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              Joined: {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact & Location */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <Phone size={12} className="text-gray-400 shrink-0" />
                          <span>{user.phone || 'No phone'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-400">
                          <MapPin size={12} className="shrink-0" />
                          <span>{city}</span>
                        </div>
                      </td>

                      {/* Role Selector */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <select
                              value={user.role}
                              disabled={isChangingThis || isPrimaryAdmin}
                              onChange={(e) => handleRoleChange(user._id, e.target.value)}
                              className={`text-xs font-bold py-1.5 px-2.5 rounded-lg border cursor-pointer transition-all focus:outline-none ${getRoleBadgeStyle(
                                user.role
                              )} ${
                                isChangingThis ? 'opacity-50 pointer-events-none' : ''
                              } ${
                                isPrimaryAdmin ? 'cursor-not-allowed opacity-90' : 'hover:ring-2 hover:ring-brand/30'
                              }`}
                              title={
                                isPrimaryAdmin
                                  ? 'Primary Super Admin role cannot be changed'
                                  : 'Click to change user role in database'
                              }
                            >
                              {AVAILABLE_ROLES.map((r) => (
                                <option
                                  key={r.value}
                                  value={r.value}
                                  className={isDark ? 'bg-neutral-900 text-white' : 'bg-white text-slate-900'}
                                >
                                  {r.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          {isChangingThis && (
                            <RefreshCw size={13} className="animate-spin text-brand shrink-0" />
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1">
                          Perms: {user.permissions || 'Default'}
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleStatusToggle(user)}
                          disabled={isPrimaryAdmin}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border cursor-pointer transition-all ${
                            user.status === 'Active'
                              ? isDark
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : isDark
                              ? 'bg-rose-950 text-rose-300 border-rose-800 hover:bg-rose-900'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          } ${isPrimaryAdmin ? 'cursor-not-allowed opacity-80' : ''}`}
                          title="Click to toggle Active/Inactive"
                        >
                          {user.status || 'Active'}
                        </button>
                      </td>

                      {/* Orders / Total Spent */}
                      <td className="py-4 px-4">
                        <div className="font-bold">
                          {user.ordersCount || 0} Bookings
                        </div>
                        <div className="text-[11px] text-gray-400">
                          Spent: ₹{user.totalSpent ? Number(user.totalSpent).toLocaleString() : '0'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {user.email && (
                            <a
                              href={`mailto:${user.email}`}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isDark
                                  ? 'border-white/10 hover:border-white text-gray-300 hover:text-white'
                                  : 'border-slate-200 hover:border-slate-400 text-slate-600 hover:text-slate-900'
                              }`}
                              title={`Email ${user.name}`}
                            >
                              <Mail size={13} />
                            </a>
                          )}

                          {user.phone && (
                            <a
                              href={`tel:${user.phone}`}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isDark
                                  ? 'border-white/10 hover:border-white text-gray-300 hover:text-white'
                                  : 'border-slate-200 hover:border-slate-400 text-slate-600 hover:text-slate-900'
                              }`}
                              title={`Call ${user.name}`}
                            >
                              <Phone size={13} />
                            </a>
                          )}

                          {!isPrimaryAdmin && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-1.5 rounded-lg border border-red-500/30 hover:border-red-500 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 px-6 text-center flex flex-col items-center justify-center">
            <div
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-3 shadow-2xs ${
                isDark
                  ? 'bg-neutral-900 border-white/20 text-gray-400'
                  : 'bg-slate-100 border-slate-200 text-slate-500'
              }`}
            >
              <Inbox size={24} />
            </div>
            <h3
              className={`text-sm font-bold mb-1 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              No Users Match Your Filter
            </h3>
            <p
              className={`text-xs max-w-sm mb-4 ${
                isDark ? 'text-gray-400' : 'text-slate-500'
              }`}
            >
              Try clearing search parameters or add a new customer / staff account.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setActiveFilter('All');
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-brand text-white hover:opacity-90 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Add User / Staff Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${
              isDark ? 'bg-neutral-950 border-white/30 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/30 flex items-center justify-center text-brand">
                  <UserCog size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Add New User or Admin</h3>
                  <p className="text-[11px] text-gray-400">
                    Create profile with specified role in MongoDB database.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg border border-transparent hover:border-white/20 text-gray-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sameer Kapoor"
                    value={newUserData.name}
                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark
                        ? 'bg-neutral-900 border-white/20 text-white focus:border-brand'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-brand'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. sameer@gmail.com"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark
                        ? 'bg-neutral-900 border-white/20 text-white focus:border-brand'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-brand'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={newUserData.phone}
                    onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark
                        ? 'bg-neutral-900 border-white/20 text-white focus:border-brand'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-brand'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">City / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, Maharashtra"
                    value={newUserData.city}
                    onChange={(e) => setNewUserData({ ...newUserData, city: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark
                        ? 'bg-neutral-900 border-white/20 text-white focus:border-brand'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-brand'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Assign Role *</label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none cursor-pointer ${
                      isDark
                        ? 'bg-neutral-900 border-white/20 text-white focus:border-brand'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-brand'
                    }`}
                  >
                    {AVAILABLE_ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Password</label>
                  <input
                    type="password"
                    placeholder="Default: Welcome@123"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark
                        ? 'bg-neutral-900 border-white/20 text-white focus:border-brand'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-brand'
                    }`}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    isDark
                      ? 'border-white/20 hover:bg-neutral-900 text-gray-300'
                      : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand text-white hover:opacity-90 cursor-pointer flex items-center gap-2"
                >
                  {savingUser ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
                  <span>{savingUser ? 'Saving...' : 'Create Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
