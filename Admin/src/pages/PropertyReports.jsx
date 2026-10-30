import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Building2,
  User,
  Mail,
  Phone,
  Clock,
  ArrowUpRight,
  Trash2,
  RotateCcw,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Shield,
  X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { propertyReportApi } from '../services/api';

const PREDEFINED_REASONS = [
  'All Reasons',
  'Misleading or Inaccurate Information',
  'Fraudulent Listing / Fake Ownership',
  'Incorrect Pricing / Hidden Charges',
  'Duplicate Listing',
  'Property Already Sold / Unavailable',
  'Inappropriate Images or Content',
  'Other Policy Violation'
];

const PropertyReports = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();

  const isSuperAdmin = user?.role === 'Super Admin' || user?.role === 'Main Admin' || user?.role === 'Admin';
  const isSubAdmin = user?.role === 'Sub-Admin';

  const [reports, setReports] = useState([]);
  const [metrics, setMetrics] = useState({
    totalReports: 0,
    pendingCount: 0,
    investigatingCount: 0,
    resolvedCount: 0,
    dismissedCount: 0,
    multipleReportsCount: 0,
    highRiskProperties: []
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReason, setSelectedReason] = useState('All Reasons');
  const [activeTab, setActiveTab] = useState('All');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Modals state
  const [selectedReport, setSelectedReport] = useState(null);
  const [takeDownModal, setTakeDownModal] = useState({ isOpen: false, propertyId: '', propertyTitle: '', reason: '' });
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await propertyReportApi.getAll();
      if (res && res.success) {
        setReports(res.data || []);
        if (res.metrics) {
          setMetrics(res.metrics);
        }
      }
    } catch (err) {
      console.error('Failed to load property reports:', err);
      triggerToast(err.message || 'Error loading reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      // Tab filter
      if (activeTab === 'Pending' && rep.status !== 'Pending Review') return false;
      if (activeTab === 'Investigating' && rep.status !== 'Under Investigation') return false;
      if (activeTab === 'HighRisk') {
        const isHighRisk = metrics.highRiskProperties?.includes(String(rep.propertyId));
        if (!isHighRisk) return false;
      }
      if (activeTab === 'Resolved' && rep.status !== 'Resolved' && rep.status !== 'Dismissed') return false;

      // Reason filter
      if (selectedReason !== 'All Reasons' && rep.reason !== selectedReason) return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const pTitle = (rep.propertyTitle || '').toLowerCase();
        const pOwner = (rep.propertyOwnerName || '').toLowerCase();
        const rName = (rep.reporterName || '').toLowerCase();
        const rEmail = (rep.reporterEmail || '').toLowerCase();
        const desc = (rep.description || '').toLowerCase();
        const rReason = (rep.reason || '').toLowerCase();

        if (
          !pTitle.includes(q) &&
          !pOwner.includes(q) &&
          !rName.includes(q) &&
          !rEmail.includes(q) &&
          !desc.includes(q) &&
          !rReason.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [reports, activeTab, selectedReason, searchTerm, metrics.highRiskProperties]);

  // Open Details Modal
  const handleOpenDetails = (report) => {
    setSelectedReport(report);
    setAdminNotes(report.adminNotes || '');
    setNewStatus(report.status || 'Pending Review');
  };

  // Update Status handler
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;
    setIsSubmittingAction(true);
    try {
      const res = await propertyReportApi.updateStatus(selectedReport._id, {
        status: newStatus,
        adminNotes: adminNotes.trim(),
        actionTaken: newStatus === 'Resolved' ? 'Investigation Complete & Resolved' : selectedReport.actionTaken
      });
      if (res && res.success) {
        triggerToast('Report status updated successfully.');
        setSelectedReport(null);
        loadReports();
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to update report status.', 'error');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Open Take Down Modal (Super Admin authority)
  const handleOpenTakeDown = (propertyId, propertyTitle) => {
    setTakeDownModal({
      isOpen: true,
      propertyId,
      propertyTitle,
      reason: 'Violated marketplace compliance and verified fraud/misleading listing guidelines after multiple reports.'
    });
  };

  // Execute Take Down
  const handleExecuteTakeDown = async (e) => {
    e.preventDefault();
    if (!takeDownModal.propertyId) return;
    setIsSubmittingAction(true);
    try {
      const res = await propertyReportApi.takeDownProperty(takeDownModal.propertyId, {
        delistReason: takeDownModal.reason.trim()
      });
      if (res && res.success) {
        triggerToast(
          `Property "${takeDownModal.propertyTitle}" was removed from the portal and all associated reports marked resolved.`
        );
        setTakeDownModal({ isOpen: false, propertyId: '', propertyTitle: '', reason: '' });
        if (selectedReport && String(selectedReport.propertyId) === String(takeDownModal.propertyId)) {
          setSelectedReport(null);
        }
        loadReports();
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to take down property.', 'error');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-500 border border-amber-500/20">
            <Clock size={11} /> Pending Review
          </span>
        );
      case 'Under Investigation':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
            <AlertCircle size={11} /> Under Investigation
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={11} /> Resolved
          </span>
        );
      case 'Dismissed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-500/15 text-gray-400 border border-gray-500/20">
            <XCircle size={11} /> Dismissed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-500/15 text-gray-400">
            {status}
          </span>
        );
    }
  };

  const getReasonColor = (reason) => {
    if (reason.includes('Fraudulent') || reason.includes('Inappropriate')) {
      return 'bg-rose-500/15 text-rose-400 border-rose-500/25';
    }
    if (reason.includes('Misleading') || reason.includes('Pricing')) {
      return 'bg-amber-500/15 text-amber-400 border-amber-500/25';
    }
    return 'bg-blue-500/15 text-blue-400 border-blue-500/25';
  };

  return (
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 transition-colors ${isDark ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-semibold transition-all animate-bounce ${
            toastType === 'error'
              ? 'bg-rose-500 text-white border-rose-600'
              : 'bg-emerald-600 text-white border-emerald-700'
          }`}
        >
          {toastType === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <ShieldAlert size={26} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Property Reports & Safety</h1>
              <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                {isSuperAdmin
                  ? 'Super Admin Portal: Review compliance reports across all properties and exercise listing take-down authority.'
                  : 'Sub-Admin Portal: Monitor compliance reports submitted on your listed properties.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadReports}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
              isDark
                ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-gray-200'
                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-xs'
            }`}
          >
            <RotateCcw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* High-Risk Alert Notice (If any property has multiple reports) */}
      {metrics.highRiskProperties?.length > 0 && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500 text-white shrink-0 mt-0.5">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-500 flex items-center gap-2">
                <span>Attention Required: {metrics.highRiskProperties.length} Property(s) Received Multiple Valid Reports</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-400 font-extrabold">
                  High Risk
                </span>
              </h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                {isSuperAdmin
                  ? 'Properties with multiple confirmed user reports are flagged for priority investigation. As Super Admin, you have the authority to review and permanently remove reported properties from the portal.'
                  : 'One or more of your properties has received multiple reports. Please review the details below immediately to prevent portal delisting.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('HighRisk')}
            className="self-start sm:self-center px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm shrink-0"
          >
            Filter High-Risk ({metrics.highRiskProperties.length})
          </button>
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Total Reports</span>
            <AlertCircle size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold">{metrics.totalReports}</div>
          <div className="text-[11px] text-gray-500 mt-1">Marketplace submissions</div>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Pending Review</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">{metrics.pendingCount}</div>
          <div className="text-[11px] text-gray-500 mt-1">Awaiting owner / admin action</div>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Under Investigation</span>
            <AlertCircle size={16} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-400">{metrics.investigatingCount}</div>
          <div className="text-[11px] text-gray-500 mt-1">Verification in progress</div>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            metrics.multipleReportsCount > 0
              ? 'bg-rose-500/10 border-rose-500/30'
              : isDark
              ? 'bg-neutral-900/60 border-neutral-800'
              : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-400">Multiple Reports</span>
            <AlertTriangle size={16} className="text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-500">{metrics.multipleReportsCount}</div>
          <div className="text-[11px] text-rose-400/80 mt-1">
            {metrics.highRiskProperties?.length || 0} high-risk properties
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Resolved</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">{metrics.resolvedCount}</div>
          <div className="text-[11px] text-gray-500 mt-1">Remediated or delisted</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div
        className={`p-4 rounded-2xl border mb-6 transition-colors ${
          isDark ? 'bg-neutral-900/70 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {[
              { id: 'All', label: 'All Reports', count: reports.length },
              { id: 'Pending', label: 'Pending Review', count: metrics.pendingCount },
              { id: 'Investigating', label: 'Investigating', count: metrics.investigatingCount },
              { id: 'HighRisk', label: 'High Risk (>=2 Reports)', count: metrics.highRiskProperties?.length || 0 },
              { id: 'Resolved', label: 'Resolved / Dismissed', count: metrics.resolvedCount + metrics.dismissedCount }
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    active
                      ? 'bg-rose-500 text-white shadow-sm'
                      : isDark
                      ? 'bg-neutral-800/80 text-gray-300 hover:bg-neutral-800'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      active ? 'bg-white/20 text-white' : isDark ? 'bg-neutral-700 text-gray-300' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Reason dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative min-w-[220px]">
              <Search
                size={14}
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-slate-400'}`}
              />
              <input
                type="text"
                placeholder="Search property, reporter, owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 ${
                  isDark ? 'bg-black border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className={`px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer ${
                isDark ? 'bg-black border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              {PREDEFINED_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table / Card Container */}
      <div
        className={`rounded-2xl border overflow-hidden transition-colors ${
          isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        {loading ? (
          <div className="p-12 text-center">
            <RotateCcw size={28} className="animate-spin mx-auto text-rose-500 mb-3" />
            <p className="text-sm font-semibold">Loading property reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldCheck size={36} className="mx-auto text-emerald-400 mb-3 opacity-80" />
            <h4 className="text-base font-bold">No Property Reports Found</h4>
            <p className={`text-xs mt-1 max-w-md mx-auto ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
              {searchTerm || selectedReason !== 'All Reasons' || activeTab !== 'All'
                ? 'Try adjusting your search criteria or filter tabs.'
                : 'All listed properties currently meet community standards with zero active safety reports.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b text-[11px] uppercase tracking-wider font-bold ${
                  isDark ? 'border-neutral-800 text-gray-400 bg-black/40' : 'border-slate-200 text-slate-500 bg-slate-50'
                }`}>
                  <th className="py-3.5 px-4">Property</th>
                  <th className="py-3.5 px-4">Owner & Role</th>
                  <th className="py-3.5 px-4">Reporter</th>
                  <th className="py-3.5 px-4">Predefined Reason</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Action Taken</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-neutral-800/40' : 'divide-slate-200'}`}>
                {filteredReports.map((rep) => {
                  const isHighRisk = metrics.highRiskProperties?.includes(String(rep.propertyId));
                  return (
                    <tr
                      key={rep._id}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-neutral-800/30' : 'hover:bg-slate-50'
                      } ${
                        isHighRisk ? (isDark ? 'bg-rose-950/15' : 'bg-rose-50/60') : ''
                      }`}
                    >
                      {/* Property Thumbnail & Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <img
                            src={rep.propertyImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80'}
                            alt={rep.propertyTitle}
                            className={`w-12 h-10 object-cover rounded-xl border shrink-0 ${
                              isDark ? 'border-neutral-700/50' : 'border-slate-200'
                            }`}
                          />
                          <div className="min-w-0">
                            <div className={`font-bold truncate max-w-[170px] ${isDark ? 'text-white' : 'text-slate-900'}`} title={rep.propertyTitle}>
                              {rep.propertyTitle}
                            </div>
                            <div className={`text-[11px] truncate max-w-[170px] ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                              {rep.propertyLocation || rep.propertyPrice}
                            </div>
                            {isHighRisk && (
                              <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-500 border border-rose-500/30">
                                <AlertTriangle size={9} /> High Risk (Multiple Reports)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Owner & Role */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className={`font-semibold ${isDark ? 'text-gray-200' : 'text-slate-900'}`}>
                          {rep.propertyOwnerName || 'Estate Administrator'}
                        </div>
                        <div className={`text-[11px] ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                          {rep.propertyOwnerEmail || 'admin@realestate.com'}
                        </div>
                        <span
                          className={`inline-block mt-0.5 px-2 py-0.2 rounded-full text-[10px] font-bold ${
                            rep.propertyOwnerRole === 'Super Admin' || rep.propertyOwnerRole === 'Main Admin'
                              ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                              : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          }`}
                        >
                          {rep.propertyOwnerRole || 'Super Admin'}
                        </span>
                      </td>

                      {/* Reporter Info */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{rep.reporterName}</div>
                        <div className={`text-[11px] ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{rep.reporterEmail}</div>
                        {rep.reporterPhone && (
                          <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{rep.reporterPhone}</div>
                        )}
                        <div className={`text-[10px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
                          {new Date(rep.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-xl text-[11px] font-semibold border ${getReasonColor(
                            rep.reason
                          )}`}
                        >
                          {rep.reason}
                        </span>
                        <p className={`text-[11px] mt-1 line-clamp-2 max-w-[220px] ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                          "{rep.description}"
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(rep.status)}
                      </td>

                      {/* Action Taken */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`text-[11px] font-medium ${
                          rep.actionTaken?.includes('Removed')
                            ? 'text-rose-500 font-bold'
                            : isDark ? 'text-gray-300' : 'text-slate-600'
                        }`}>
                          {rep.actionTaken || 'None'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetails(rep)}
                            className={`p-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                              isDark
                                ? 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-gray-200'
                                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                            }`}
                            title="Review Details"
                          >
                            <Eye size={14} />
                          </button>

                          {/* Super Admin Take-Down Authority Button */}
                          {isSuperAdmin && rep.actionTaken !== 'Property Removed from Portal' && (
                            <button
                              onClick={() => handleOpenTakeDown(rep.propertyId, rep.propertyTitle)}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                              title="Super Admin Take Down Authority"
                            >
                              <Trash2 size={12} />
                              <span>Take Down</span>
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
        )}
      </div>

      {/* Report Details & Review Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div
            className={`w-full max-w-2xl rounded-3xl border shadow-2xl p-6 sm:p-8 animate-fade-in max-h-[90vh] overflow-y-auto ${
              isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div className={`flex items-center justify-between pb-4 border-b ${isDark ? 'border-neutral-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  <ShieldAlert size={22} />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Property Compliance Report</h3>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>ID: {selectedReport._id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-neutral-800 text-gray-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Property Summary Card */}
            <div className={`mt-5 p-4 rounded-2xl border flex items-center gap-4 ${
              isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <img
                src={selectedReport.propertyImage}
                alt={selectedReport.propertyTitle}
                className={`w-16 h-14 object-cover rounded-xl border shrink-0 ${
                  isDark ? 'border-neutral-700/60' : 'border-slate-200'
                }`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`font-extrabold text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {selectedReport.propertyTitle}
                  </h4>
                  <span className="text-xs font-bold text-amber-500">{selectedReport.propertyPrice}</span>
                </div>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{selectedReport.propertyLocation}</p>
                <div className={`flex items-center gap-2 mt-1.5 text-[11px] ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                  <span className={`flex items-center gap-1 font-semibold ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                    <User size={12} /> {selectedReport.propertyOwnerName} ({selectedReport.propertyOwnerRole})
                  </span>
                  <span>•</span>
                  <span>{selectedReport.propertyOwnerEmail}</span>
                </div>
              </div>
            </div>

            {/* Reporter Information & Predefined Reason */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[11px] uppercase tracking-wider font-bold block mb-2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                  Reporter Details
                </span>
                <div className="space-y-1 text-xs">
                  <div className={`font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <User size={13} className="text-rose-500" /> {selectedReport.reporterName}
                  </div>
                  <div className={`flex items-center gap-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                    <Mail size={13} className="text-blue-500" /> {selectedReport.reporterEmail}
                  </div>
                  {selectedReport.reporterPhone && (
                    <div className={`flex items-center gap-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      <Phone size={13} className="text-emerald-500" /> {selectedReport.reporterPhone}
                    </div>
                  )}
                  <div className={`text-[11px] pt-1 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
                    Submitted: {new Date(selectedReport.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[11px] uppercase tracking-wider font-bold block mb-2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                  Predefined Reason
                </span>
                <span
                  className={`inline-block px-3 py-1 rounded-xl text-xs font-bold border ${getReasonColor(
                    selectedReport.reason
                  )}`}
                >
                  {selectedReport.reason}
                </span>
                <div className={`mt-3 text-xs ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                  <span>Current Status: </span>
                  {getStatusBadge(selectedReport.status)}
                </div>
                {selectedReport.reviewedByName && (
                  <div className={`text-[11px] mt-2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    Last reviewed by <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedReport.reviewedByName}</span> on{' '}
                    {new Date(selectedReport.reviewedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Description */}
            <div className="mt-5">
              <span className={`text-xs font-bold uppercase tracking-wider block mb-2 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                Detailed Report Description
              </span>
              <div className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                isDark ? 'bg-neutral-900/70 border-neutral-800 text-gray-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                {selectedReport.description}
              </div>
            </div>

            {/* Evidence URL if provided */}
            {selectedReport.evidenceUrl && (
              <div className="mt-4 flex items-center gap-2 text-xs">
                <span className={`font-semibold ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Supporting Evidence:</span>
                <a
                  href={selectedReport.evidenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-500 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>View Evidence Link</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            )}

            {/* Action / Status Update Form */}
            <form onSubmit={handleUpdateStatus} className={`mt-6 pt-5 border-t space-y-4 ${
              isDark ? 'border-neutral-800' : 'border-slate-200'
            }`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                    isDark ? 'text-gray-400' : 'text-slate-600'
                  }`}>
                    Update Report Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer ${
                      isDark
                        ? 'border-neutral-800 bg-neutral-900 text-white'
                        : 'border-slate-200 bg-white text-slate-900 shadow-xs'
                    }`}
                  >
                    <option value="Pending Review" className={isDark ? 'bg-neutral-900 text-white' : 'bg-white text-slate-900'}>Pending Review</option>
                    <option value="Under Investigation" className={isDark ? 'bg-neutral-900 text-white' : 'bg-white text-slate-900'}>Under Investigation</option>
                    <option value="Resolved" className={isDark ? 'bg-neutral-900 text-white' : 'bg-white text-slate-900'}>Resolved</option>
                    <option value="Dismissed" className={isDark ? 'bg-neutral-900 text-white' : 'bg-white text-slate-900'}>Dismissed</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                    isDark ? 'text-gray-400' : 'text-slate-600'
                  }`}>
                    Action Taken
                  </label>
                  <input
                    type="text"
                    disabled
                    value={selectedReport.actionTaken || 'None'}
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold ${
                      isDark
                        ? 'border-neutral-800 bg-neutral-900/50 text-gray-400'
                        : 'border-slate-200 bg-slate-100 text-slate-600'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? 'text-gray-400' : 'text-slate-600'
                }`}>
                  Internal Compliance / Investigation Notes
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes for property owner and compliance records..."
                  className={`w-full p-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none ${
                    isDark
                      ? 'border-neutral-800 bg-neutral-900 text-white placeholder-gray-500'
                      : 'border-slate-200 bg-white text-slate-900 placeholder-slate-400 shadow-xs'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {/* Super Admin Take-Down option inside modal */}
                {isSuperAdmin && selectedReport.actionTaken !== 'Property Removed from Portal' ? (
                  <button
                    type="button"
                    onClick={() => handleOpenTakeDown(selectedReport.propertyId, selectedReport.propertyTitle)}
                    className="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Trash2 size={13} />
                    <span>Take Down Property</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedReport(null)}
                    className={`px-5 py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                      isDark
                        ? 'border-neutral-800 hover:bg-neutral-800 text-gray-300'
                        : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    Close
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingAction}
                    className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    {isSubmittingAction ? 'Saving...' : 'Save Updates'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Super Admin Take Down Confirmation Modal */}
      {takeDownModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div
            className={`w-full max-w-lg rounded-3xl border border-rose-500/40 shadow-2xl p-6 sm:p-8 animate-fade-in ${
              isDark ? 'bg-neutral-950 text-white' : 'bg-white text-slate-900'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-rose-500 text-white shrink-0">
                <AlertTriangle size={28} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-rose-600">Super Admin Take-Down Authority</h3>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                  Remove reported property from public marketplace
                </p>
              </div>
            </div>

            <div className={`mt-5 p-4 rounded-2xl border text-xs leading-relaxed ${
              isDark
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <strong>Caution:</strong> You are taking down listing{' '}
              <span className={`font-bold underline ${isDark ? 'text-white' : 'text-slate-900'}`}>"{takeDownModal.propertyTitle}"</span>.
              This will set available units to 0, mark the property status as <strong>"Delisted"</strong>, remove it from the
              portal, and resolve all pending safety reports.
            </div>

            <form onSubmit={handleExecuteTakeDown} className="mt-5 space-y-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? 'text-gray-400' : 'text-slate-600'
                }`}>
                  Delisting Reason & Notice to Owner
                </label>
                <textarea
                  rows={3}
                  required
                  value={takeDownModal.reason}
                  onChange={(e) => setTakeDownModal({ ...takeDownModal, reason: e.target.value })}
                  placeholder="Specify violation reasons..."
                  className={`w-full p-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none ${
                    isDark
                      ? 'border-neutral-800 bg-neutral-900 text-white placeholder-gray-500'
                      : 'border-slate-200 bg-white text-slate-900 placeholder-slate-400 shadow-xs'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setTakeDownModal({ isOpen: false, propertyId: '', propertyTitle: '', reason: '' })}
                  className={`px-5 py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                    isDark
                      ? 'border-neutral-800 hover:bg-neutral-800 text-gray-300'
                      : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingAction}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  <span>{isSubmittingAction ? 'Delisting Property...' : 'Confirm & Remove Property'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PropertyReports;
