import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Video,
  Building2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  ExternalLink,
  Plus,
  Filter,
  ChevronRight,
  ShieldCheck,
  CalendarCheck,
  CalendarDays,
  X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const API_BASE = 'http://localhost:5000/api/visits';

const SiteVisits = () => {
  const { isDark } = useTheme();

  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const fetchVisits = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}?`;
      if (statusFilter !== 'All') url += `status=${encodeURIComponent(statusFilter)}&`;
      if (dateFilter) url += `date=${encodeURIComponent(dateFilter)}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;

      const token = localStorage.getItem('admin_token');
      const res = await fetch(url, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setVisits(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch visits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [statusFilter, dateFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVisits();
  };

  const handleUpdateStatus = async (visitId, newStatus) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${API_BASE}/${visitId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Visit status updated to "${newStatus}"!`);
        if (selectedVisit && selectedVisit._id === visitId) {
          setSelectedVisit({ ...selectedVisit, status: newStatus });
        }
        await fetchVisits();
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteVisit = async (visitId) => {
    if (!window.confirm('Are you sure you want to cancel and remove this scheduled visit?')) return;
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${API_BASE}/${visitId}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Visit appointment cancelled successfully.');
        setSelectedVisit(null);
        await fetchVisits();
      }
    } catch (err) {
      console.error('Failed to delete visit:', err);
    }
  };

  // Metrics
  const totalVisits = visits.length;
  const inPersonCount = visits.filter((v) => v.visitType?.includes('In-Person')).length;
  const videoTourCount = visits.filter((v) => v.visitType?.includes('Video')).length;
  const confirmedCount = visits.filter((v) => v.status === 'Confirmed').length;

  return (
    <div className={`space-y-6 max-w-7xl mx-auto transition-colors duration-200 ${
      isDark ? 'bg-black text-white' : 'text-slate-900'
    }`}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Site Visits & Tour Calendar
          </h1>
          <p className={`text-xs font-medium mt-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            Manage upcoming in-person property walkthroughs and live 3D video tours.
          </p>
        </div>

        <button
          onClick={fetchVisits}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
            isDark
              ? 'bg-neutral-900 border-white hover:bg-neutral-800 text-white'
              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
          }`}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Visits</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border transition-colors shadow-2xs ${
          isDark ? 'bg-neutral-950 border-white/20' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-blue-500 mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Total Scheduled</span>
            <CalendarCheck size={18} />
          </div>
          <p className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalVisits}</p>
          <span className="text-[10px] text-gray-400 font-semibold mt-1 block">Active appointments</span>
        </div>

        <div className={`p-5 rounded-2xl border transition-colors shadow-2xs ${
          isDark ? 'bg-neutral-950 border-white/20' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-emerald-500 mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Confirmed</span>
            <CheckCircle2 size={18} />
          </div>
          <p className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{confirmedCount}</p>
          <span className="text-[10px] text-emerald-500 font-semibold mt-1 block">Ready for showing</span>
        </div>

        <div className={`p-5 rounded-2xl border transition-colors shadow-2xs ${
          isDark ? 'bg-neutral-950 border-white/20' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-indigo-500 mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400">In-Person Tours</span>
            <Building2 size={18} />
          </div>
          <p className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{inPersonCount}</p>
          <span className="text-[10px] text-gray-400 font-semibold mt-1 block">Physical walkthroughs</span>
        </div>

        <div className={`p-5 rounded-2xl border transition-colors shadow-2xs ${
          isDark ? 'bg-neutral-950 border-white/20' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-purple-500 mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Live 3D Video</span>
            <Video size={18} />
          </div>
          <p className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{videoTourCount}</p>
          <span className="text-[10px] text-purple-400 font-semibold mt-1 block">Virtual video tours</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs ${
        isDark ? 'bg-neutral-950 border-white/20' : 'bg-white border-slate-200'
      }`}>
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
            isDark ? 'text-gray-400' : 'text-slate-400'
          }`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, property, customer..."
            className={`w-full text-xs font-medium rounded-xl pl-10 pr-4 py-2.5 border transition-all focus:outline-none ${
              isDark
                ? 'bg-neutral-900 text-white placeholder-gray-500 border-neutral-700 focus:border-blue-500'
                : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-blue-500'
            }`}
          />
        </form>

        {/* Date & Status Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              isDark ? 'bg-neutral-900 text-white border-neutral-700' : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-[11px] text-rose-500 font-bold hover:underline cursor-pointer"
            >
              Clear Date
            </button>
          )}

          {['All', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? isDark
                    ? 'bg-white text-black border-white shadow-2xs'
                    : 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : isDark
                  ? 'bg-neutral-900 text-gray-300 hover:text-white border-neutral-800'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Visits Table */}
      <div className={`rounded-2xl overflow-hidden border shadow-xs transition-colors ${
        isDark ? 'bg-neutral-950 border-white/20' : 'bg-white border-slate-200'
      }`}>
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-gray-400">Loading scheduled site visits & calendar...</p>
          </div>
        ) : visits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b uppercase tracking-wider text-[11px] font-bold ${
                isDark ? 'bg-neutral-900 text-white border-white/10' : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}>
                <tr>
                  <th className="py-3.5 px-5">Visit ID & Type</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Target Property</th>
                  <th className="py-3.5 px-4">Date & Time Slot</th>
                  <th className="py-3.5 px-4">Assigned Agent</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y font-medium ${
                isDark ? 'divide-neutral-800 text-gray-300' : 'divide-slate-100 text-slate-700'
              }`}>
                {visits.map((v) => (
                  <tr
                    key={v._id || v.visitId}
                    className={`transition-colors ${isDark ? 'hover:bg-neutral-900/60' : 'hover:bg-slate-50'}`}
                  >
                    {/* ID & Format */}
                    <td className="py-4 px-5">
                      <span className={`font-mono font-bold text-xs block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {v.visitId}
                      </span>
                      <span className={`inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border ${
                        v.visitType?.includes('Video')
                          ? isDark
                            ? 'bg-purple-950 text-purple-300 border-purple-800'
                            : 'bg-purple-100 text-purple-900 border-purple-200'
                          : isDark
                          ? 'bg-blue-950 text-blue-300 border-blue-800'
                          : 'bg-blue-100 text-blue-900 border-blue-200'
                      }`}>
                        {v.visitType?.includes('Video') ? <Video size={11} className="text-purple-600" /> : <Building2 size={11} className="text-blue-600" />}
                        <span>{v.visitType}</span>
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-4">
                      <p className={`font-extrabold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {v.customerName}
                      </p>
                      <p className={`text-[11px] mt-0.5 flex items-center gap-1.5 font-medium ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                        <Mail size={12} className={isDark ? 'text-gray-400' : 'text-slate-400'} />
                        <span>{v.customerEmail}</span>
                      </p>
                      <p className={`text-[11px] mt-0.5 flex items-center gap-1.5 font-medium ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                        <Phone size={12} className={isDark ? 'text-gray-400' : 'text-slate-400'} />
                        <span>{v.customerPhone}</span>
                      </p>
                    </td>

                    {/* Property */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={v.propertyImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=150&q=80'}
                          alt={v.propertyTitle}
                          className="w-10 h-10 rounded-xl object-cover shrink-0 border border-black/10"
                        />
                        <div className="min-w-0">
                          <p className={`font-extrabold text-xs truncate max-w-[160px] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {v.propertyTitle}
                          </p>
                          <p className={`text-[10px] flex items-center gap-1 truncate max-w-[160px] mt-0.5 font-medium ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                            <MapPin size={11} className={isDark ? 'text-gray-400' : 'text-slate-400'} />
                            <span>{v.propertyLocation || 'Prime Location'}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Date & Slot */}
                    <td className="py-4 px-4">
                      <div className={`flex items-center gap-1.5 font-extrabold text-xs ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                        <Calendar size={13} className="text-blue-600" />
                        <span>{v.visitDate}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 text-[11px] font-semibold mt-0.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                        <Clock size={12} className={isDark ? 'text-gray-400' : 'text-slate-400'} />
                        <span>{v.timeSlot}</span>
                      </div>
                    </td>

                    {/* Advisor */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={v.assignedAgent?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                          alt="Agent"
                          className="w-8 h-8 rounded-full object-cover shrink-0 border border-black/10"
                        />
                        <div>
                          <p className={`font-extrabold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {v.assignedAgent?.name || 'Assigned Officer'}
                          </p>
                          <span className={`text-[10px] font-medium ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Site Host</span>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <select
                        value={v.status}
                        onChange={(e) => handleUpdateStatus(v._id, e.target.value)}
                        className={`text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-full border cursor-pointer outline-none transition-all shadow-2xs ${
                          v.status === 'Confirmed'
                            ? isDark
                              ? 'bg-blue-950 text-blue-300 border-blue-700'
                              : 'bg-blue-100 text-blue-900 border-blue-300 font-extrabold'
                            : v.status === 'Completed'
                            ? isDark
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold'
                            : v.status === 'Rescheduled'
                            ? isDark
                              ? 'bg-amber-950 text-amber-300 border-amber-700'
                              : 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold'
                            : isDark
                            ? 'bg-rose-950 text-rose-300 border-rose-700'
                            : 'bg-rose-100 text-rose-900 border-rose-300 font-extrabold'
                        }`}
                      >
                        <option value="Confirmed" className="bg-white text-blue-900 font-bold">Confirmed</option>
                        <option value="Completed" className="bg-white text-emerald-900 font-bold">Completed</option>
                        <option value="Rescheduled" className="bg-white text-amber-900 font-bold">Rescheduled</option>
                        <option value="Cancelled" className="bg-white text-rose-900 font-bold">Cancelled</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Google Calendar Link */}
                        {v.googleCalendarUrl && (
                          <a
                            href={v.googleCalendarUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-2 rounded-xl border text-xs font-bold transition-all shadow-2xs ${
                              isDark
                                ? 'bg-neutral-900 border-neutral-700 hover:border-blue-500 text-blue-400'
                                : 'bg-white border-slate-200 hover:border-blue-500 text-blue-600 hover:bg-blue-50'
                            }`}
                            title="Open Google Calendar Event"
                          >
                            <Calendar size={13} />
                          </a>
                        )}

                        {/* WhatsApp direct */}
                        {v.customerPhone && (
                          <a
                            href={`https://api.whatsapp.com/send?phone=${v.customerPhone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(`Hello ${v.customerName}, regarding your ${v.visitType} for "${v.propertyTitle}" scheduled on ${v.visitDate} at ${v.timeSlot}. Modern Real Estate.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-2 rounded-xl border text-xs font-bold transition-all shadow-2xs ${
                              isDark
                                ? 'bg-neutral-900 border-neutral-700 hover:border-emerald-500 text-emerald-400'
                                : 'bg-white border-slate-200 hover:border-emerald-500 text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title="Chat on WhatsApp"
                          >
                            <Phone size={13} />
                          </a>
                        )}

                        {/* Details Modal */}
                        <button
                          onClick={() => setSelectedVisit(v)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
                            isDark
                              ? 'bg-neutral-900 border-neutral-700 hover:bg-neutral-800 text-white'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span>Details</span>
                          <ChevronRight size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center">
            <CalendarDays size={40} className="mx-auto text-gray-500/40 mb-3" />
            <h3 className="font-extrabold text-sm">No scheduled visits found</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              When buyers book an in-person or live 3D walkthrough, their appointments will appear here with calendar links.
            </p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedVisit && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`max-w-lg w-full rounded-3xl p-6 sm:p-7 border shadow-2xl space-y-5 animate-fade-in ${
            isDark ? 'bg-neutral-950 border-neutral-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className={`flex items-start justify-between pb-3 border-b ${
              isDark ? 'border-neutral-800' : 'border-slate-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className={`font-extrabold text-base leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Visit Details #{selectedVisit.visitId}
                  </h3>
                  <span className={`text-[11px] font-semibold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    {selectedVisit.visitType}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVisit(null)}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-neutral-800 text-gray-400 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
                }`}
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Property Card */}
              <div className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-colors ${
                isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}>
                <img
                  src={selectedVisit.propertyImage}
                  alt={selectedVisit.propertyTitle}
                  className="w-14 h-14 rounded-xl object-cover shrink-0 border border-black/10"
                />
                <div className="min-w-0">
                  <h4 className={`font-extrabold text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {selectedVisit.propertyTitle}
                  </h4>
                  <p className={`text-xs mt-0.5 truncate flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    <MapPin size={11} className="shrink-0 text-slate-400" />
                    <span>{selectedVisit.propertyLocation}</span>
                  </p>
                </div>
              </div>

              {/* Date & Time Window */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className={`p-3 rounded-2xl border transition-colors ${
                  isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className={`block text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-gray-400' : 'text-slate-400'}`}>
                    Appointment Date
                  </span>
                  <span className="font-extrabold text-xs text-blue-600 block mt-0.5">
                    {selectedVisit.visitDate}
                  </span>
                </div>
                <div className={`p-3 rounded-2xl border transition-colors ${
                  isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className={`block text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-gray-400' : 'text-slate-400'}`}>
                    Time Window
                  </span>
                  <span className={`font-extrabold text-xs block mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {selectedVisit.timeSlot}
                  </span>
                </div>
              </div>

              {/* Buyer Contact */}
              <div className={`p-3.5 rounded-2xl border space-y-1.5 transition-colors ${
                isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className={`block text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-gray-400' : 'text-slate-400'}`}>
                  Buyer Contact Details
                </span>
                <p className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {selectedVisit.customerName}
                </p>
                <p className={`flex items-center gap-1.5 ${isDark ? 'text-gray-300' : 'text-slate-600'} font-medium`}>
                  <Mail size={12} className="shrink-0 text-slate-400" />
                  <span>Email: {selectedVisit.customerEmail}</span>
                </p>
                <p className={`flex items-center gap-1.5 ${isDark ? 'text-gray-300' : 'text-slate-600'} font-medium`}>
                  <Phone size={12} className="shrink-0 text-slate-400" />
                  <span>Phone: {selectedVisit.customerPhone}</span>
                </p>
              </div>

              {/* Notes */}
              {selectedVisit.notes && (
                <div className={`p-3.5 rounded-2xl border ${
                  isDark ? 'bg-blue-950/40 border-blue-900/50 text-blue-200' : 'bg-blue-50/70 border-blue-200 text-blue-950'
                }`}>
                  <span className="block text-[10px] uppercase font-bold text-blue-600 tracking-wider">
                    Special Notes:
                  </span>
                  <p className="mt-0.5 font-medium leading-relaxed">{selectedVisit.notes}</p>
                </div>
              )}
            </div>

            <div className={`pt-3 border-t flex items-center justify-between ${
              isDark ? 'border-neutral-800' : 'border-slate-100'
            }`}>
              <button
                type="button"
                onClick={() => handleDeleteVisit(selectedVisit._id)}
                className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:underline cursor-pointer"
              >
                Cancel Appointment
              </button>
              <button
                type="button"
                onClick={() => setSelectedVisit(null)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs ${
                  isDark
                    ? 'bg-white hover:bg-neutral-200 text-black'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteVisits;
