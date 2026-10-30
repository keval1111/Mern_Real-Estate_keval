import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ShieldCheck,
  MapPin,
  DollarSign,
  User,
  Phone,
  Mail,
  FileText,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const API_BASE = 'http://localhost:5000/api/properties';
const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80';

const resolveImageUrl = (img) => {
  if (!img || typeof img !== 'string') return DEFAULT_FALLBACK_IMAGE;
  const trimmed = img.trim();
  if (!trimmed) return DEFAULT_FALLBACK_IMAGE;
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `http://localhost:5000${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
};

const SellerRequests = () => {
  const { isDark } = useTheme();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Review modal state
  const [adminValuation, setAdminValuation] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${API_BASE}/seller-requests`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRequests(json.data);
      }
    } catch (err) {
      console.error('Failed to load seller requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (propId) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${API_BASE}/${propId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          adminValuation: adminValuation || undefined,
          verificationNotes: verificationNotes || 'Property title deed verified. Approved for public marketplace listing.',
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('🎉 Property listing approved & published! Confirmation email dispatched to seller.');
        setSelectedRequest(null);
        setAdminValuation('');
        setVerificationNotes('');
        await fetchRequests();
      } else {
        alert(json.message || 'Approval failed');
      }
    } catch (err) {
      console.error('Approve failed:', err);
      alert('Error approving property');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (propId) => {
    const reason = prompt('Please enter the reason for rejection:', verificationNotes || 'Deed documentation unclear or property valuation criteria not met.');
    if (reason === null) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${API_BASE}/${propId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ reason }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('⚠️ Property rejected. Feedback notification email sent to seller.');
        setSelectedRequest(null);
        await fetchRequests();
      } else {
        alert(json.message || 'Rejection failed');
      }
    } catch (err) {
      console.error('Reject failed:', err);
      alert('Error rejecting property');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = requests.filter((r) => {
    const matchesSearch =
      (r.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.sellerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.sellerEmail || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.location || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      filter === 'All'
        ? true
        : filter === 'Approved'
        ? r.status === 'Active' || r.status === 'Approved'
        : r.status === filter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter((r) => r.status === 'Pending Verification' || r.status === 'Pending').length;
  const approvedCount = requests.filter((r) => r.status === 'Active' || r.status === 'Approved').length;
  const rejectedCount = requests.filter((r) => r.status === 'Rejected').length;

  return (
    <div className={`space-y-6 max-w-7xl mx-auto transition-colors duration-200 ${
      isDark ? 'bg-black text-white' : 'text-slate-900'
    }`}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-sm animate-bounce">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className={`text-2xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Seller Property Requests
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Workflow Stage 2
            </span>
          </div>
          <p className={`text-xs font-medium mt-1 ${
            isDark ? 'text-gray-400' : 'text-slate-500'
          }`}>
            Review customer submitted properties, check valuation certificates, and approve them to go live on the public marketplace.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-2 ${
            isDark
              ? 'bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-700'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
          }`}
        >
          <Sparkles size={14} className="text-amber-500" />
          Refresh Requests
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border transition-all ${
          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Submissions</span>
            <Building2 size={18} className="text-blue-500" />
          </div>
          <p className="text-2xl font-black mt-2">{requests.length}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Submitted via Customer Portal</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          isDark ? 'bg-neutral-950 border-amber-500/30' : 'bg-amber-50/50 border-amber-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending Audit</span>
            <Clock size={18} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-500 mt-2">{pendingCount}</p>
          <p className="text-[11px] text-amber-600/80 mt-0.5">Awaiting physical valuation & title check</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          isDark ? 'bg-neutral-950 border-emerald-500/30' : 'bg-emerald-50/50 border-emerald-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Approved & Live</span>
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-500 mt-2">{approvedCount}</p>
          <p className="text-[11px] text-emerald-600/80 mt-0.5">Live on buyer marketplace</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          isDark ? 'bg-neutral-950 border-rose-500/30' : 'bg-rose-50/50 border-rose-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Rejected</span>
            <XCircle size={18} className="text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-500 mt-2">{rejectedCount}</p>
          <p className="text-[11px] text-rose-600/80 mt-0.5">Failed documentation criteria</p>
        </div>
      </div>

      {/* Controls & Filter */}
      <div className={`rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 border shadow-xs transition-colors ${
        isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-slate-200'
      }`}>
        <div className="relative w-full md:w-80">
          <Search size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
            isDark ? 'text-gray-400' : 'text-slate-400'
          }`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by property, seller, location..."
            className={`w-full text-xs font-medium rounded-xl pl-10 pr-4 py-2.5 border transition-all focus:outline-none ${
              isDark
                ? 'bg-neutral-900 text-white placeholder-gray-500 border-neutral-700 focus:border-amber-500'
                : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-amber-500'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['All', 'Pending Verification', 'Approved', 'Rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer whitespace-nowrap transition-colors ${
                filter === st
                  ? isDark
                    ? 'bg-white text-black border-white shadow-xs'
                    : 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : isDark
                  ? 'bg-neutral-900 text-gray-300 hover:text-white border-neutral-800'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Table / Cards */}
      <div className={`rounded-2xl overflow-hidden border shadow-xs transition-colors ${
        isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-slate-200'
      }`}>
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold mt-3 text-gray-400">Loading seller requests...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b font-extrabold uppercase tracking-wider text-[11px] ${
                  isDark ? 'border-neutral-800 text-gray-400 bg-neutral-900/50' : 'border-slate-200 text-slate-500 bg-slate-50'
                }`}>
                  <th className="py-3.5 px-4">Property</th>
                  <th className="py-3.5 px-4">Category & Location</th>
                  <th className="py-3.5 px-4">Asking Price</th>
                  <th className="py-3.5 px-4">Seller Contact</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-neutral-800' : 'divide-slate-100'}`}>
                {filtered.map((prop) => {
                  const isPending = prop.status === 'Pending Verification' || prop.status === 'Pending';
                  const isApproved = prop.status === 'Active' || prop.status === 'Approved';
                  const isRejected = prop.status === 'Rejected';

                  return (
                    <tr
                      key={prop._id}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-neutral-900/50' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Property Thumbnail & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={resolveImageUrl(prop.image)}
                            alt={prop.title}
                            onError={(e) => {
                              if (e.currentTarget.src !== DEFAULT_FALLBACK_IMAGE) {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                              }
                            }}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-700/20 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-sm block leading-snug">{prop.title}</span>
                            <span className="text-[11px] text-gray-400">
                              {prop.beds || 3} Beds • {prop.baths || 2} Baths • {prop.sqft || '1,800 sq ft'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category & Location */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-500/10 text-blue-500 border border-blue-500/20 mb-1">
                          {prop.category || 'Properties'}
                        </span>
                        <div className="flex items-center gap-1 text-gray-400 text-[11px]">
                          <MapPin size={12} className="shrink-0" />
                          <span>{prop.location}</span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-sm text-emerald-500 block">
                          {prop.price}
                        </span>
                        {prop.adminValuation ? (
                          <span className="text-[10px] text-gray-400">
                            Val: {prop.adminValuation}
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-500/80">
                            Valuation Pending
                          </span>
                        )}
                      </td>

                      {/* Seller */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-xs">{prop.sellerName || 'Anonymous Seller'}</span>
                          <span className="text-[11px] text-gray-400">{prop.sellerEmail || 'No email provided'}</span>
                          {prop.sellerPhone && (
                            <span className="text-[11px] text-gray-400">{prop.sellerPhone}</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            isPending
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                              : isApproved
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                          }`}
                        >
                          {isPending && <Clock size={12} />}
                          {isApproved && <CheckCircle2 size={12} />}
                          {isRejected && <XCircle size={12} />}
                          {prop.status}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedRequest(prop);
                              setAdminValuation(prop.adminValuation || prop.price || '');
                              setVerificationNotes(prop.verificationNotes || '');
                            }}
                            className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                              isDark
                                ? 'bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-700'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                            }`}
                            title="Inspect Details & Valuation"
                          >
                            <Eye size={13} />
                            <span>Review</span>
                          </button>

                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApprove(prop._id)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                                title="1-Click Approve to Marketplace"
                              >
                                <Check size={13} />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleReject(prop._id)}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 border border-rose-500/30 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                                title="Reject Request"
                              >
                                <X size={13} />
                                <span>Reject</span>
                              </button>
                            </>
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
          <div className="py-16 text-center">
            <Building2 size={36} className="mx-auto text-gray-500/50 mb-3" />
            <h3 className="font-extrabold text-sm">No seller submissions found</h3>
            <p className="text-xs text-gray-400 mt-1">
              New property listings submitted by customers will show up here for valuation & verification.
            </p>
          </div>
        )}
      </div>

      {/* Review & Audit Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className={`w-full max-w-2xl rounded-3xl p-6 border shadow-2xl overflow-y-auto max-h-[90vh] transition-all ${
            isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-gray-700/30">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-amber-500" />
                <h2 className="text-lg font-black">Property Valuation & Audit Review</h2>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1 rounded-xl hover:bg-gray-700/20 cursor-pointer text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5 mt-5">
              {/* Image & Title Card */}
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <img
                  src={resolveImageUrl(selectedRequest.image)}
                  alt={selectedRequest.title}
                  onError={(e) => {
                    if (e.currentTarget.src !== DEFAULT_FALLBACK_IMAGE) {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                    }
                  }}
                  className="w-full sm:w-44 h-32 rounded-2xl object-cover border border-slate-700/20"
                />
                <div className="space-y-1.5 flex-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    Status: {selectedRequest.status}
                  </span>
                  <h3 className="text-base font-extrabold leading-snug">{selectedRequest.title}</h3>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <MapPin size={12} /> {selectedRequest.location}, {selectedRequest.city || 'Mumbai'}
                  </p>
                  <p className="text-xs font-bold text-emerald-500">
                    Asking Price: <span className="text-base font-extrabold">{selectedRequest.price}</span>
                  </p>
                </div>
              </div>

              {/* Property Specs */}
              <div className={`p-4 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-center border ${
                isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400">Bedrooms</span>
                  <p className="font-extrabold text-sm">{selectedRequest.beds || 3} BHK</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400">Bathrooms</span>
                  <p className="font-extrabold text-sm">{selectedRequest.baths || 2} Baths</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400">Total Area</span>
                  <p className="font-extrabold text-sm">{selectedRequest.sqft || '1,800 sq ft'}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400">Year Built</span>
                  <p className="font-extrabold text-sm">{selectedRequest.yearBuilt || '2024'}</p>
                </div>
              </div>

              {/* Seller Information */}
              <div className={`p-4 rounded-2xl border space-y-2 ${
                isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Seller Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <User size={14} className="text-gray-400" />
                    <span className="font-bold">{selectedRequest.sellerName || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail size={14} className="text-gray-400" />
                    <span>{selectedRequest.sellerEmail || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone size={14} className="text-gray-400" />
                    <span>{selectedRequest.sellerPhone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Description & Amenities */}
              <div>
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-1">Description</h4>
                <p className="text-xs leading-relaxed text-gray-300">
                  {selectedRequest.description || 'No description provided.'}
                </p>
              </div>

              {/* Valuation & Approval Inputs */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold mb-1">
                    Certified Valuation Assessment (Optional)
                  </label>
                  <input
                    type="text"
                    value={adminValuation}
                    onChange={(e) => setAdminValuation(e.target.value)}
                    placeholder="e.g. $1,250,000 (Fair Market Value)"
                    className={`w-full text-xs font-medium rounded-xl px-3.5 py-2.5 border transition-all focus:outline-none ${
                      isDark
                        ? 'bg-neutral-900 text-white border-neutral-700 focus:border-amber-500'
                        : 'bg-white text-slate-900 border-slate-200 focus:border-amber-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">
                    Verification Notes & Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="e.g. Title deed verified with land registry office. Ready for buyer marketplace."
                    className={`w-full text-xs font-medium rounded-xl px-3.5 py-2.5 border transition-all focus:outline-none ${
                      isDark
                        ? 'bg-neutral-900 text-white border-neutral-700 focus:border-amber-500'
                        : 'bg-white text-slate-900 border-slate-200 focus:border-amber-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-5 mt-6 border-t border-gray-700/30">
              <button
                onClick={() => setSelectedRequest(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                  isDark ? 'border-neutral-700 hover:bg-neutral-900' : 'border-slate-200 hover:bg-slate-100'
                }`}
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  disabled={actionLoading}
                  onClick={() => handleReject(selectedRequest._id)}
                  className="px-4 py-2 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <X size={14} />
                  <span>Reject</span>
                </button>

                <button
                  disabled={actionLoading}
                  onClick={() => handleApprove(selectedRequest._id)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <CheckCircle2 size={14} />
                  <span>Approve & Publish to Marketplace</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerRequests;
