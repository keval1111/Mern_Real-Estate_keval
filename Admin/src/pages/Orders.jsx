import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  Eye,
  Inbox,
  CheckCircle2,
  Clock,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Building,
  Sparkles,
  Phone,
  Mail,
  X,
  Check,
  ChevronRight,
  User,
  MapPin,
  Calendar,
  FileText,
  FileCheck,
  XCircle,
  AlertCircle,
  Shield,
  Percent
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000/api/orders';

const PRESET_ADVISORS = [
  {
    name: 'Vikram Malhotra',
    role: 'Senior Property Advisor & Legal Officer',
    phone: '+91 98200 11223',
    email: 'vikram.advisor@modernrealestate.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  },
  {
    name: 'Rajesh Singhania',
    role: 'Chief Sales Director & Luxury Escrow Officer',
    phone: '+91 98330 99887',
    email: 'rajesh.singhania@modernrealestate.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  },
  {
    name: 'Ananya Deshmukh',
    role: 'Head of Title Audit & Legal Conveyancing',
    phone: '+91 98110 55443',
    email: 'ananya.legal@modernrealestate.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
  },
  {
    name: 'Rohan Kapoor',
    role: 'Senior Property Appraiser & Verification Specialist',
    phone: '+91 98440 22331',
    email: 'rohan.appraisal@modernrealestate.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  },
];

const STEP_DEFINITIONS = [
  { step: 1, title: 'Booking Request Received', desc: 'Order details and initial token payment recorded' },
  { step: 2, title: 'KYC & Title Deed Verification', desc: 'Title deed, KYC and buyer background check' },
  { step: 3, title: 'Site Inspection & Legal Clearance', desc: 'Physical appraisal & municipal approvals' },
  { step: 4, title: 'Ownership Transfer & Key Handover', desc: 'Possession handover & key collection' },
];

const Orders = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  // Milestone Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeStep, setActiveStep] = useState(2);
  const [selectedAdvisor, setSelectedAdvisor] = useState(PRESET_ADVISORS[0]);
  const [milestoneNotes, setMilestoneNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // KYC Review State
  const [kycReason, setKycReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [kycProcessing, setKycProcessing] = useState(false);

  const resolveDocUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleUpdateKycStatus = async (status, reason = '') => {
    if (!selectedOrder) return;
    setKycProcessing(true);
    const orderKey = selectedOrder._id || selectedOrder.orderId || selectedOrder.id;

    try {
      const res = await fetch(`${API_BASE}/${orderKey}/kyc-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          verifiedBy: 'Senior Legal & Escrow Officer',
          rejectionReason: reason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`KYC ${status === 'Verified' ? 'Approved & Certified' : 'Marked as ' + status}!`);
        await fetchOrders();

        setSelectedOrder((prev) => ({
          ...prev,
          kycDocuments: {
            ...(prev?.kycDocuments || {}),
            status,
            verifiedBy: 'Senior Legal & Escrow Officer',
            verifiedAt: status === 'Verified' ? new Date().toISOString() : prev?.kycDocuments?.verifiedAt,
            rejectionReason: reason,
          },
          trackingStep: status === 'Verified' && (!prev?.trackingStep || prev.trackingStep < 2) ? 2 : prev?.trackingStep,
        }));

        if (status === 'Verified' && activeStep < 2) {
          setActiveStep(2);
        }
        setShowRejectModal(false);
        setKycReason('');
      } else {
        alert(data.message || 'Error updating KYC status');
      }
    } catch (err) {
      console.error('KYC update error:', err);
      alert('Error communicating with server for KYC update');
    } finally {
      setKycProcessing(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleResendEmail = async (order) => {
    try {
      showToast(`📧 Dispatching confirmation deed email to ${order.email}...`);
      const res = await fetch(`http://localhost:5000/api/notifications/resend-order/${order.orderId || order.id}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Email successfully delivered to ${order.email}!`);
      } else {
        showToast(`⚠️ ${data.message || 'Email delivery skipped/fallback'}`);
      }
    } catch (err) {
      showToast('❌ Error dispatching notification email');
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(API_BASE, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        // Map backend orders
        const mapped = json.data.map((o) => ({
          ...o,
          id: o.orderId || o.id || o._id,
          orderId: o.orderId || o.id || o._id,
        }));
        setOrders(mapped);
        localStorage.setItem('admin_orders', JSON.stringify(mapped));
      } else {
        const saved = localStorage.getItem('admin_orders');
        if (saved) setOrders(JSON.parse(saved));
      }
    } catch (err) {
      console.warn('Backend fetch failed, using localStorage:', err);
      const saved = localStorage.getItem('admin_orders');
      if (saved) setOrders(JSON.parse(saved));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openMilestoneModal = (order) => {
    setSelectedOrder(order);
    setActiveStep(order.trackingStep || 2);
    setMilestoneNotes(order.milestoneNotes || '');
    if (order.assignedAgent) {
      const found = PRESET_ADVISORS.find((a) => a.name === order.assignedAgent.name);
      setSelectedAdvisor(found || {
        ...order.assignedAgent,
        role: order.assignedAgent.role || 'Senior Property Advisor',
      });
    } else {
      setSelectedAdvisor(PRESET_ADVISORS[0]);
    }
  };

  // Advance or set milestone step
  const handleSaveMilestone = async (targetStep = activeStep) => {
    if (!selectedOrder) return;
    setActionLoading(true);
    const orderKey = selectedOrder._id || selectedOrder.orderId || selectedOrder.id;

    try {
      // 1. Advance step
      const stepRes = await fetch(`${API_BASE}/${orderKey}/advance-step`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: targetStep,
          milestoneNotes,
        }),
      });
      const stepJson = await stepRes.json();

      // 2. Assign agent
      if (selectedAdvisor) {
        await fetch(`${API_BASE}/${orderKey}/assign-agent`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selectedAdvisor),
        });
      }

      if (stepJson.success) {
        showToast(`Milestone updated to Step ${targetStep}: ${STEP_DEFINITIONS[targetStep - 1]?.title}!`);
        await fetchOrders();
        // Update currently opened modal state
        setActiveStep(targetStep);
        if (selectedOrder) {
          setSelectedOrder((prev) => ({
            ...prev,
            trackingStep: targetStep,
            status: targetStep === 4 ? 'Completed' : prev.status,
            assignedAgent: selectedAdvisor,
            milestoneNotes,
          }));
        }
      } else {
        alert(stepJson.message || 'Error updating milestone');
      }
    } catch (err) {
      console.error('Milestone save failed:', err);
      alert('Error updating milestone on server');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = orders.filter((o) => {
    const matchesSearch =
      (o.id || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.orderId || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.customer || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.item || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filter === 'All'
        ? true
        : filter === 'Completed'
        ? o.status === 'Completed' || o.status === 'Delivered'
        : o.status === filter;
    return matchesSearch && matchesStatus;
  });

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
              Property Bookings & Milestones
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
              Workflow Stage 3
            </span>
          </div>
          <p className={`text-xs font-medium mt-1 ${
            isDark ? 'text-gray-400' : 'text-slate-500'
          }`}>
            Track token transactions, advance buyer title verification milestones, and assign legal conveyancing officers.
          </p>
        </div>

        {/* Sub-Admin Payment Scoping Banner */}
        {user?.role === 'Sub-Admin' && (
          <div className={`w-full p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs shadow-xs ${
            user?.accessPermissions?.canViewAllOrders
              ? isDark
                ? 'bg-blue-950/30 border-blue-800/60 text-blue-300'
                : 'bg-blue-50/80 border-blue-200 text-blue-900'
              : isDark
              ? 'bg-purple-950/30 border-purple-800/60 text-purple-300'
              : 'bg-purple-50/80 border-purple-200 text-purple-900'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                user?.accessPermissions?.canViewAllOrders
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
              }`}>
                <Shield size={16} />
              </div>
              <div>
                <span className="font-extrabold uppercase tracking-wider text-[11px] block">
                  {user?.accessPermissions?.canViewAllOrders
                    ? 'Global Payment Access Granted'
                    : 'Sub-Admin Payment & Escrow Isolation Active'}
                </span>
                <span className="text-[11px] opacity-85 font-medium">
                  {user?.accessPermissions?.canViewAllOrders
                    ? 'Super Admin has granted you elevated permission to view all bookings & token payments platform-wide.'
                    : 'Restricted View: You are currently viewing booking payments and buyer milestones exclusively for properties listed by you.'}
                </span>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 border ${
              user?.accessPermissions?.canViewAllOrders
                ? 'bg-blue-500/20 text-blue-400 border-blue-400/40'
                : 'bg-purple-500/20 text-purple-400 border-purple-400/40'
            }`}>
              {user?.accessPermissions?.canViewAllOrders ? 'Global Records' : 'Ownership Scoped'}
            </span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
            isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}>
            Total Bookings: {orders.length}
          </div>

          <button
            onClick={fetchOrders}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
              isDark ? 'bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-700' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <Sparkles size={13} className="text-blue-500" />
            Refresh
          </button>
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
            placeholder="Search by Booking ID, customer, property..."
            className={`w-full text-xs font-medium rounded-xl pl-10 pr-4 py-2.5 border transition-all focus:outline-none ${
              isDark
                ? 'bg-neutral-900 text-white placeholder-gray-500 border-neutral-700 focus:border-blue-500'
                : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-blue-500'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['All', 'Processing', 'Completed', 'Pending'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer whitespace-nowrap transition-colors ${
                filter === st
                  ? isDark
                    ? 'bg-white text-black border-white shadow-2xs'
                    : 'bg-slate-900 text-white border-slate-900 shadow-2xs'
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

      {/* Orders Table */}
      <div className={`rounded-2xl overflow-hidden border shadow-xs transition-colors ${
        isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-slate-200'
      }`}>
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold mt-3 text-gray-400">Loading orders & tracking status...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b uppercase tracking-wider text-[11px] font-bold ${
                isDark ? 'bg-neutral-900 text-white border-neutral-800' : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}>
                <tr>
                  <th className="py-3.5 px-5">Booking ID</th>
                  <th className="py-3.5 px-4">Customer & Contact</th>
                  <th className="py-3.5 px-4">Purchased Property</th>
                  <th className="py-3.5 px-4">Milestone Progress</th>
                  <th className="py-3.5 px-4">Assigned Legal Advisor</th>
                  <th className="py-3.5 px-4">Total & Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y font-medium ${
                isDark ? 'divide-neutral-800 text-gray-300' : 'divide-slate-100 text-slate-700'
              }`}>
                {filtered.map((o) => {
                  const stepNum = o.trackingStep || 2;
                  const stepTitle = STEP_DEFINITIONS[stepNum - 1]?.title || 'Verification';
                  const agent = o.assignedAgent || PRESET_ADVISORS[0];

                  return (
                    <tr
                      key={o.id}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-neutral-900/60' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Order ID */}
                      <td className="py-4 px-5">
                        <span className={`font-mono font-bold text-xs ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {o.orderId || o.id}
                        </span>
                        <span className="block text-[10px] text-gray-400 mt-0.5">{o.date || 'Recent'}</span>
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {o.customer}
                          </span>
                          {o.kycDocuments?.status === 'Verified' ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" title="KYC Documents Verified">
                              <CheckCircle2 size={10} /> KYC Verified
                            </span>
                          ) : o.kycDocuments?.status === 'Rejected' ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20" title="KYC Rejected">
                              <XCircle size={10} /> KYC Rejected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20" title="KYC Under Review / Pending">
                              <Clock size={10} /> KYC Review
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-400 block">{o.email}</span>
                      </td>

                      {/* Purchased Item */}
                      <td className="py-4 px-4">
                        <span className={`font-bold block max-w-xs truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {o.item}
                        </span>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={11} /> {o.city || 'Springfield'}, {o.state || 'Oregon'}
                        </span>
                      </td>

                      {/* Milestone Progress */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((s) => (
                              <div
                                key={s}
                                className={`w-3.5 h-1.5 rounded-full ${
                                  s <= stepNum
                                    ? s === 4
                                      ? 'bg-emerald-500'
                                      : 'bg-blue-500'
                                    : isDark
                                    ? 'bg-neutral-800'
                                    : 'bg-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className={`text-[11px] font-bold ${
                            stepNum === 4 ? 'text-emerald-500' : 'text-blue-500'
                          }`}>
                            Step {stepNum}/4
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 block mt-0.5 truncate max-w-[150px]">
                          {stepTitle}
                        </span>
                      </td>

                      {/* Assigned Advisor */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={agent.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                            alt={agent.name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-700/30 shrink-0"
                          />
                          <div className="overflow-hidden">
                            <span className={`text-xs font-bold block truncate leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {agent.name}
                            </span>
                            <span className="text-[10px] text-gray-400 truncate block">Legal Advisor</span>
                          </div>
                        </div>
                      </td>

                      {/* Total & Status */}
                      <td className="py-4 px-4">
                        <span className={`font-extrabold text-xs block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {o.total}
                        </span>
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
                            o.status === 'Delivered' || o.status === 'Completed'
                              ? isDark ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : o.status === 'Processing'
                              ? isDark ? 'bg-blue-950 text-blue-300 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200'
                              : isDark ? 'bg-amber-950 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {o.status}
                          </span>

                          {/* Revenue Split Pill */}
                          {o.paymentSplit?.splitType === 'SUBADMIN_90_10' || o.propertyOwner?.role === 'Sub-Admin' ? (
                            <span
                              className="px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                              title="Sub-Admin receives 90%, Super Admin receives 10%"
                            >
                              90% Sub-Admin • 10% Admin
                            </span>
                          ) : (
                            <span
                              className="px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-500 border border-amber-500/30"
                              title="Main Admin receives 100%"
                            >
                              100% Main Admin
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Resend Email Button */}
                          <button
                            type="button"
                            onClick={() => handleResendEmail(o)}
                            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                              isDark
                                ? 'bg-neutral-900 border-neutral-700 hover:border-blue-500 text-blue-400 hover:bg-neutral-800'
                                : 'bg-white border-slate-200 hover:border-blue-500 text-blue-600 hover:bg-blue-50'
                            }`}
                            title="Resend Allotment Deed Email via Nodemailer"
                          >
                            <Mail size={13} />
                          </button>

                          {/* Instant WhatsApp Button */}
                          {o.phone && (
                            <a
                              href={`https://api.whatsapp.com/send?phone=${String(o.phone).replace(/[^0-9]/g, '')}&text=${encodeURIComponent(`Hello ${o.customer}, your property booking for "${o.item}" (ID: ${o.orderId || o.id}) is confirmed with Modern Real Estate! Allotment Receipt: ${o.allotmentReceiptId || 'RCPT-RERA'}. Track here: http://localhost:5173/account`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                                isDark
                                  ? 'bg-neutral-900 border-neutral-700 hover:border-emerald-500 text-emerald-400 hover:bg-neutral-800'
                                  : 'bg-white border-slate-200 hover:border-emerald-500 text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title="Send Instant WhatsApp Update to Buyer"
                            >
                              <Phone size={13} />
                            </a>
                          )}

                          {/* Milestones Button */}
                          <button
                            onClick={() => openMilestoneModal(o)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                              isDark
                                ? 'bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-700 hover:border-blue-500'
                                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-blue-500'
                            }`}
                            title="Manage Milestone & Legal Advisor"
                          >
                            <ShieldCheck size={14} className="text-blue-500" />
                            <span>Milestones</span>
                            <ChevronRight size={13} className="text-gray-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center">
            <Inbox size={40} className="mx-auto text-gray-500/40 mb-3" />
            <h3 className="font-extrabold text-sm">No property bookings found</h3>
            <p className="text-xs text-gray-400 mt-1">
              Customer property bookings and token advance transactions will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Milestone & Legal Advisor Management Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className={`w-full max-w-2xl rounded-3xl p-6 border shadow-2xl overflow-y-auto max-h-[92vh] transition-all ${
            isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-700/30">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-blue-500" />
                <div>
                  <h2 className="text-lg font-black leading-tight">Buyer Milestone & Title Stepper</h2>
                  <p className="text-xs text-gray-400">Booking #{selectedOrder.orderId || selectedOrder.id} • {selectedOrder.customer}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-xl hover:bg-gray-700/20 cursor-pointer text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-6 mt-5">
              {/* Property summary card */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Locked Property</span>
                  <h3 className="font-extrabold text-sm mt-0.5">{selectedOrder.item}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{selectedOrder.address}, {selectedOrder.city}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Allotment</span>
                  <p className="font-black text-sm text-emerald-500 mt-0.5">{selectedOrder.total}</p>
                  <span className="text-[10px] font-bold text-gray-400">Token: {selectedOrder.tokenPaid || 'Rs. 1,00,000'}</span>
                </div>
              </div>

              {/* Payment Split & Owner Accounting Card */}
              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Percent size={16} className="text-emerald-500" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
                      Payment Tracking &amp; Revenue Distribution
                    </h4>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    selectedOrder.paymentSplit?.splitType === 'SUBADMIN_90_10' || selectedOrder.propertyOwner?.role === 'Sub-Admin'
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    {selectedOrder.paymentSplit?.splitType === 'SUBADMIN_90_10' || selectedOrder.propertyOwner?.role === 'Sub-Admin'
                      ? '90% Sub-Admin / 10% Super Admin'
                      : '100% Main Admin Direct'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-slate-200'}`}>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Property Owner</span>
                    <span className="font-bold text-xs block mt-0.5">
                      {selectedOrder.propertyOwner?.name || selectedOrder.createdByName || 'Main Admin'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Role: {selectedOrder.propertyOwner?.role || 'Main Admin'}
                    </span>
                  </div>

                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-slate-200'}`}>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      {selectedOrder.propertyOwner?.role === 'Sub-Admin' ? 'Sub-Admin Share (90%)' : 'Main Admin Share (100%)'}
                    </span>
                    <span className="font-mono font-black text-sm text-emerald-500 block mt-0.5">
                      Rs. {(selectedOrder.paymentSplit?.ownerAmount || selectedOrder.paymentSplit?.subAdminAmount || selectedOrder.totalNumber || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {selectedOrder.propertyOwner?.role === 'Sub-Admin' ? 'Credited to Sub-Admin' : 'Retained directly by Main Admin'}
                    </span>
                  </div>

                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-slate-200'}`}>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Super Admin Fee (10%)</span>
                    <span className="font-mono font-black text-sm text-blue-400 block mt-0.5">
                      Rs. {(selectedOrder.paymentSplit?.superAdminAmount || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {selectedOrder.propertyOwner?.role === 'Sub-Admin' ? '10% platform fee cut' : '0% fee (direct listing)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* KYC Compliance & Document Verification Card */}
              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <FileCheck size={16} className="text-blue-500" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
                      RERA & Identity (KYC) Document Compliance
                    </h4>
                  </div>
                  {/* Status Pill */}
                  {selectedOrder.kycDocuments?.status === 'Verified' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                      <CheckCircle2 size={13} /> Certified & Verified
                    </span>
                  ) : selectedOrder.kycDocuments?.status === 'Rejected' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-500 border border-red-500/30">
                      <XCircle size={13} /> Verification Rejected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30 animate-pulse">
                      <Clock size={13} /> Action Needed: Under Review
                    </span>
                  )}
                </div>

                {/* Identity Numbers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-slate-200'}`}>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">PAN Card Number</span>
                    <span className="font-mono font-bold text-xs tracking-wider">
                      {selectedOrder.kycDocuments?.panNumber || selectedOrder.panNumber || 'Provided during Checkout'}
                    </span>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-slate-200'}`}>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Aadhaar / Passport ID</span>
                    <span className="font-mono font-bold text-xs tracking-wider">
                      {selectedOrder.kycDocuments?.aadhaarNumber || selectedOrder.aadhaarNumber || 'Provided during Checkout'}
                    </span>
                  </div>
                </div>

                {/* Uploaded Document Previews / Download links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3.5">
                  {/* PAN Card File */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                    isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={16} className="text-blue-500 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold block truncate">PAN Card Proof</span>
                        <span className="text-[10px] text-gray-400 block truncate">
                          {selectedOrder.kycDocuments?.panCardUrl ? 'Document File Attached' : 'No document file attached'}
                        </span>
                      </div>
                    </div>
                    {selectedOrder.kycDocuments?.panCardUrl ? (
                      <a
                        href={resolveDocUrl(selectedOrder.kycDocuments.panCardUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white border border-blue-500/30 transition-all flex items-center gap-1 shrink-0"
                      >
                        <Eye size={12} /> View File
                      </a>
                    ) : (
                      <span className="text-[10px] text-gray-400 italic">Self Certified</span>
                    )}
                  </div>

                  {/* Aadhaar / Passport File */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                    isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={16} className="text-purple-500 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold block truncate">Aadhaar / ID Proof</span>
                        <span className="text-[10px] text-gray-400 block truncate">
                          {selectedOrder.kycDocuments?.aadhaarDocUrl ? 'Document File Attached' : 'No document file attached'}
                        </span>
                      </div>
                    </div>
                    {selectedOrder.kycDocuments?.aadhaarDocUrl ? (
                      <a
                        href={resolveDocUrl(selectedOrder.kycDocuments.aadhaarDocUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-500/10 hover:bg-purple-500 text-purple-500 hover:text-white border border-purple-500/30 transition-all flex items-center gap-1 shrink-0"
                      >
                        <Eye size={12} /> View File
                      </a>
                    ) : (
                      <span className="text-[10px] text-gray-400 italic">Self Certified</span>
                    )}
                  </div>
                </div>

                {/* Rejection notice if rejected */}
                {selectedOrder.kycDocuments?.status === 'Rejected' && selectedOrder.kycDocuments?.rejectionReason && (
                  <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Rejection Reason:</span>
                      <span>{selectedOrder.kycDocuments.rejectionReason}</span>
                    </div>
                  </div>
                )}

                {/* Audit verification tag */}
                {selectedOrder.kycDocuments?.status === 'Verified' && selectedOrder.kycDocuments?.verifiedAt && (
                  <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mb-3">
                    <ShieldCheck size={13} className="text-emerald-500" />
                    <span>Certified by <strong className="text-gray-300">{selectedOrder.kycDocuments.verifiedBy || 'Admin Legal Desk'}</strong> on {new Date(selectedOrder.kycDocuments.verifiedAt).toLocaleDateString()}</span>
                  </div>
                )}

                {/* Action Buttons for Approving/Rejecting KYC */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-700/20 flex-wrap">
                  <button
                    type="button"
                    disabled={kycProcessing || selectedOrder.kycDocuments?.status === 'Verified'}
                    onClick={() => handleUpdateKycStatus('Verified')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      selectedOrder.kycDocuments?.status === 'Verified'
                        ? 'opacity-50 cursor-not-allowed bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                    }`}
                  >
                    <CheckCircle2 size={14} />
                    <span>{selectedOrder.kycDocuments?.status === 'Verified' ? 'KYC Approved & Certified' : 'Approve & Certify KYC (Advances to Step 2)'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={kycProcessing}
                    onClick={() => setShowRejectModal((prev) => !prev)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-red-500/30 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white"
                  >
                    <XCircle size={14} />
                    <span>Reject / Request Resubmission</span>
                  </button>
                </div>

                {/* Reject Reason Inline Dialog */}
                {showRejectModal && (
                  <div className="mt-3 p-3.5 rounded-xl border border-red-500/30 bg-red-500/5 space-y-2">
                    <label className="block text-xs font-bold text-red-400">
                      Specify Reason for KYC Rejection (sent to buyer):
                    </label>
                    <input
                      type="text"
                      value={kycReason}
                      onChange={(e) => setKycReason(e.target.value)}
                      placeholder="e.g. Blurred PAN card image or mismatched identity details"
                      className={`w-full text-xs rounded-xl px-3 py-2 border transition-all focus:outline-none ${
                        isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => { setShowRejectModal(false); setKycReason(''); }}
                        className="px-3 py-1 rounded-lg text-xs font-bold text-gray-400 hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={kycProcessing || !kycReason.trim()}
                        onClick={() => handleUpdateKycStatus('Rejected', kycReason.trim())}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white cursor-pointer shadow-xs"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 4-Step Interactive Milestone Progression */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
                    Live 4-Stage Conveyancing Milestones
                  </h4>
                  <span className="text-xs font-bold text-blue-500">
                    Current: Step {activeStep} of 4
                  </span>
                </div>

                <div className="space-y-2.5">
                  {STEP_DEFINITIONS.map((def) => {
                    const isPassed = def.step < activeStep;
                    const isCurrent = def.step === activeStep;
                    const isUpcoming = def.step > activeStep;

                    return (
                      <div
                        key={def.step}
                        onClick={() => handleSaveMilestone(def.step)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isCurrent
                            ? isDark
                              ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-500/10'
                              : 'bg-blue-50/80 border-blue-400 shadow-xs'
                            : isPassed
                            ? isDark
                              ? 'bg-neutral-900/40 border-emerald-500/40'
                              : 'bg-emerald-50/50 border-emerald-200'
                            : isDark
                            ? 'bg-neutral-900/20 border-neutral-800 opacity-60 hover:opacity-100'
                            : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isPassed
                              ? 'bg-emerald-500 text-white'
                              : isCurrent
                              ? 'bg-blue-600 text-white ring-4 ring-blue-500/20'
                              : isDark
                              ? 'bg-neutral-800 text-gray-400'
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            {isPassed ? <Check size={14} /> : def.step}
                          </div>
                          <div>
                            <span className="font-bold text-xs block leading-snug">{def.title}</span>
                            <span className="text-[11px] text-gray-400">{def.desc}</span>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          {isPassed && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              Completed
                            </span>
                          )}
                          {isCurrent && (
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-blue-500 text-white animate-pulse">
                              Active Stage
                            </span>
                          )}
                          {isUpcoming && (
                            <span className="text-[11px] text-gray-400">Click to Set</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Assign Legal Advisor / Escrow Officer */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                  Assign Legal Conveyancing Advisor
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PRESET_ADVISORS.map((adv) => {
                    const isSelected = selectedAdvisor?.name === adv.name;
                    return (
                      <div
                        key={adv.name}
                        onClick={() => setSelectedAdvisor(adv)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? isDark
                              ? 'bg-neutral-900 border-blue-500 ring-2 ring-blue-500/20'
                              : 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
                            : isDark
                            ? 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <img
                          src={adv.avatar}
                          alt={adv.name}
                          className="w-10 h-10 rounded-full object-cover shrink-0"
                        />
                        <div className="overflow-hidden flex-1">
                          <span className="text-xs font-bold block truncate">{adv.name}</span>
                          <span className="text-[10px] text-gray-400 block truncate">{adv.role}</span>
                          <span className="text-[10px] text-blue-500 block truncate">{adv.phone}</span>
                        </div>
                        {isSelected && <Check size={16} className="text-blue-500 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Milestone Remarks */}
              <div>
                <label className="block text-xs font-bold mb-1">
                  Milestone Audit Notes / Instructions for Buyer
                </label>
                <textarea
                  rows={2}
                  value={milestoneNotes}
                  onChange={(e) => setMilestoneNotes(e.target.value)}
                  placeholder="e.g. Title deed verified at municipal sub-registrar office. Physical site appraisal scheduled for Wednesday."
                  className={`w-full text-xs font-medium rounded-xl px-3.5 py-2.5 border transition-all focus:outline-none ${
                    isDark
                      ? 'bg-neutral-900 text-white border-neutral-700 focus:border-blue-500'
                      : 'bg-white text-slate-900 border-slate-200 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between gap-3 pt-5 mt-6 border-t border-gray-700/30">
              <button
                onClick={() => setSelectedOrder(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                  isDark ? 'border-neutral-700 hover:bg-neutral-900' : 'border-slate-200 hover:bg-slate-100'
                }`}
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {activeStep < 4 && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleSaveMilestone(activeStep + 1)}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-blue-600/20"
                  >
                    <span>Advance to Next Step ({activeStep + 1}/4)</span>
                    <ArrowRight size={14} />
                  </button>
                )}

                {activeStep === 4 && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleSaveMilestone(4)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    <CheckCircle2 size={15} />
                    <span>Possession Completed</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
