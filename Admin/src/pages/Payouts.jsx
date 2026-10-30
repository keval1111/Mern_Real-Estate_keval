import React, { useState, useEffect, useMemo } from 'react';
import {
  Landmark,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  ArrowUpRight,
  DollarSign,
  Building2,
  User,
  Eye,
  EyeOff,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  FileCheck,
  Receipt,
  Send,
  X,
  FileText,
  Users,
  Shield,
  Layers,
  Sparkles,
  Percent,
  TrendingUp,
  Briefcase,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { payoutApi } from '../services/api';

const Payouts = () => {
  const { user, token } = useAuth();
  const { isDark } = useTheme();

  const isSuperAdmin = user?.role === 'Super Admin' || user?.role === 'Main Admin' || user?.role === 'Admin';
  const isSubAdmin = user?.role === 'Sub-Admin';

  // Navigation View Tab: 'user-tracking' (User-Wise Accounts) vs 'transactions' (All Transaction Records)
  const [activeTab, setActiveTab] = useState('user-tracking');

  const [payouts, setPayouts] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [overallStats, setOverallStats] = useState({});
  const [summary, setSummary] = useState({
    totalSalesVolume: 0,
    totalPlatformCommission: 0,
    totalSubAdminShare: 0,
    totalMainAdminDirectShare: 0,
    totalSuperAdminRevenue: 0,
    totalPaidAmount: 0,
    totalPendingAmount: 0,
    totalPayoutsCount: 0,
    subAdminPayoutsCount: 0,
    mainAdminPayoutsCount: 0,
    paidCount: 0,
    pendingCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [splitFilter, setSplitFilter] = useState('All');
  const [showMaskedAccount, setShowMaskedAccount] = useState(false);

  // Selected User for Transaction History Modal
  const [selectedUserForHistory, setSelectedUserForHistory] = useState(null);

  // Modal State for Processing Payout (Super Admin)
  const [selectedPayoutForProcess, setSelectedPayoutForProcess] = useState(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Direct Bank NEFT / RTGS');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState('');

  // Receipt Preview Modal
  const [viewingReceiptPayout, setViewingReceiptPayout] = useState(null);

  // Toast alert
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadPayoutsData = async () => {
    setLoading(true);
    try {
      const [listRes, sumRes, statsRes] = await Promise.all([
        payoutApi.getAll({}, token),
        payoutApi.getSummary(token),
        payoutApi.getUserStats(token),
      ]);

      if (listRes && Array.isArray(listRes.data)) {
        setPayouts(listRes.data);
      }
      if (sumRes && sumRes.data) {
        setSummary(sumRes.data);
      }
      if (statsRes && statsRes.userStats) {
        setUserStats(statsRes.userStats);
        if (statsRes.overall) setOverallStats(statsRes.overall);
      }
    } catch (err) {
      console.warn('Error loading payouts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayoutsData();
  }, [token]);

  // Filtered Payouts
  const filteredPayouts = useMemo(() => {
    return payouts.filter((p) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        p.propertyTitle?.toLowerCase().includes(q) ||
        p.ownerName?.toLowerCase().includes(q) ||
        p.ownerEmail?.toLowerCase().includes(q) ||
        p.subAdminName?.toLowerCase().includes(q) ||
        p.subAdminEmail?.toLowerCase().includes(q) ||
        p.payoutId?.toLowerCase().includes(q) ||
        p.orderId?.toLowerCase().includes(q) ||
        p.transactionReference?.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'All' ? true : p.status === statusFilter;
      const matchesSplit =
        splitFilter === 'All'
          ? true
          : splitFilter === 'Sub-Admin'
          ? p.splitType === 'SUBADMIN_90_10' || p.ownerRole === 'Sub-Admin'
          : p.splitType === 'MAINADMIN_100' || p.ownerRole !== 'Sub-Admin';

      return matchesSearch && matchesStatus && matchesSplit;
    });
  }, [payouts, searchTerm, statusFilter, splitFilter]);

  // Filtered User Stats
  const filteredUserStats = useMemo(() => {
    if (!searchTerm) return userStats;
    const q = searchTerm.toLowerCase();
    return userStats.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q) ||
        String(u.userId)?.toLowerCase().includes(q)
    );
  }, [userStats, searchTerm]);

  // Handle Disburse Action Submission
  const handleConfirmDisbursement = async (e) => {
    e.preventDefault();
    if (!selectedPayoutForProcess) return;

    setIsProcessing(true);
    setProcessError('');

    try {
      const ref = utrNumber.trim() || `UTR-${Date.now().toString().slice(-8)}`;
      const res = await payoutApi.process(
        selectedPayoutForProcess._id || selectedPayoutForProcess.id,
        {
          transactionReference: ref,
          paymentMethod,
          notes: payoutNotes,
        },
        token
      );

      if (res.success) {
        showToast(
          `✅ Payout of Rs. ${(
            selectedPayoutForProcess.subAdminShare || selectedPayoutForProcess.ownerShare
          ).toLocaleString('en-IN')} disbursed!`
        );
        setSelectedPayoutForProcess(null);
        setUtrNumber('');
        setPayoutNotes('');
        loadPayoutsData();
      } else {
        setProcessError(res.message || 'Failed to disburse payout.');
      }
    } catch (err) {
      setProcessError(err.message || 'Network error occurred while processing disbursement.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Mask bank account number helper: "501004329871" -> "•••• •••• 9871"
  const maskAccount = (num) => {
    if (!num) return '•••• •••• ••••';
    const str = String(num);
    if (str.length <= 4) return str;
    const last4 = str.slice(-4);
    return `•••• •••• ${last4}`;
  };

  const currentSubAdminBank = user?.kycDetails || {};

  return (
    <div
      className={`space-y-6 max-w-7xl mx-auto transition-colors duration-200 select-none ${
        isDark ? 'text-white' : 'text-slate-900'
      }`}
    >
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-xs tracking-wide animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={18} className="text-white shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-black/8 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Payment Tracking &amp; Revenue Splits
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${
                isDark ? 'bg-neutral-900 text-brand border-neutral-800' : 'bg-brand/10 text-brand border-brand/20'
              }`}
            >
              User-Wise Accounting
            </span>
          </div>
          <p className={`text-xs font-medium mt-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            Accurate revenue tracking: Sub-Admin properties receive 90% (10% to Super Admin) • Main Admin listings receive 100%.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Navigation View Switcher Tabs */}
          <div
            className={`flex items-center p-1 rounded-2xl border ${
              isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={() => setActiveTab('user-tracking')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'user-tracking'
                  ? 'bg-brand text-white shadow-xs'
                  : isDark
                  ? 'text-gray-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users size={14} />
              <span>User-Wise Counting</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'transactions'
                  ? 'bg-brand text-white shadow-xs'
                  : isDark
                  ? 'text-gray-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt size={14} />
              <span>All Payout Records ({payouts.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={loadPayoutsData}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? 'bg-neutral-900 border-neutral-800 text-gray-300 hover:bg-neutral-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="Refresh All Data"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-brand' : ''} />
          </button>
        </div>
      </div>

      {/* Revenue Split Rule Policy Banner */}
      <div
        className={`p-4 rounded-3xl border transition-all ${
          isDark
            ? 'bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border-neutral-800'
            : 'bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-slate-50 border-blue-200/60 text-slate-900'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand/10 border border-brand/30 text-brand flex items-center justify-center shrink-0">
              <Percent size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-brand">
                  Active Payment Distribution Policy
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Enforced
                </span>
              </div>
              <p className="text-xs font-semibold mt-0.5 opacity-90">
                Payment splits are calculated dynamically based on the verified property owner ID.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                isDark ? 'bg-neutral-900/90 border-neutral-700 text-gray-200' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                Sub-Admin Listing:{' '}
                <strong className="text-emerald-500">90% to Sub-Admin</strong> •{' '}
                <strong className="text-blue-400">10% to Super Admin</strong>
              </span>
            </div>

            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                isDark ? 'bg-neutral-900/90 border-neutral-700 text-gray-200' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span>
                Main Admin Listing:{' '}
                <strong className="text-amber-500">100% to Main Admin</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Admin Linked Bank Account Security Card (Shown prominently for Sub-Admin) */}
      {isSubAdmin && (
        <div
          className={`p-5 rounded-3xl border shadow-sm transition-all ${
            isDark
              ? 'bg-neutral-900/80 border-neutral-800'
              : 'bg-gradient-to-r from-slate-900 to-slate-800 text-white border-slate-800'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand/20 border border-brand/30 text-brand flex items-center justify-center shrink-0">
                <Landmark size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold">Your Verified Payout Bank Account</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                      user?.kycStatus === 'Approved'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    <ShieldCheck size={12} />
                    {user?.kycStatus === 'Approved' ? 'KYC Approved & Active' : 'KYC Verification Pending'}
                  </span>
                </div>
                <p className="text-xs text-white/70 mt-0.5">
                  Your 90% sale shares are automatically accounted and disbursed to this destination account.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 text-xs">
                  <div>
                    <span className="text-white/50 text-[10px] uppercase font-bold block">Bank Name</span>
                    <span className="font-bold text-white">{currentSubAdminBank.bankName || 'HDFC Bank'}</span>
                  </div>
                  <div>
                    <span className="text-white/50 text-[10px] uppercase font-bold block">Beneficiary Name</span>
                    <span className="font-bold text-white">{currentSubAdminBank.accountHolderName || user?.name}</span>
                  </div>
                  <div>
                    <span className="text-white/50 text-[10px] uppercase font-bold block">Account Number</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-white">
                        {showMaskedAccount
                          ? currentSubAdminBank.accountNumber || '501004329871'
                          : maskAccount(currentSubAdminBank.accountNumber || '501004329871')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowMaskedAccount(!showMaskedAccount)}
                        className="text-white/60 hover:text-white cursor-pointer"
                      >
                        {showMaskedAccount ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-white/50 text-[10px] uppercase font-bold block">IFSC Code</span>
                    <span className="font-mono font-bold text-white uppercase">{currentSubAdminBank.ifscCode || 'HDFC0001234'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <span className="text-[11px] text-white/60 font-medium text-center sm:text-right">
                Encrypted &amp; Protected by Financial RBAC
              </span>
            </div>
          </div>
        </div>
      )}

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Sales Volume */}
        <div
          className={`p-4 rounded-2xl border transition-all shadow-xs ${
            isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Total Booking Value
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Building2 size={16} />
            </div>
          </div>
          <div className="mt-2 text-xl font-black">
            Rs. {(summary.totalSalesVolume || 0).toLocaleString('en-IN')}
          </div>
          <div className={`text-[11px] mt-1 font-medium ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            Across {payouts.length} closed property sales
          </div>
        </div>

        {/* Card 2: Sub-Admin 90% Share */}
        <div
          className={`p-4 rounded-2xl border transition-all shadow-xs ${
            isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
              {isSubAdmin ? 'Your 90% Net Earnings' : 'Sub-Admin 90% Shares'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-2 text-xl font-black text-emerald-500">
            Rs. {(summary.totalSubAdminShare || 0).toLocaleString('en-IN')}
          </div>
          <div className={`text-[11px] mt-1 font-medium ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            90% received on Sub-Admin listings
          </div>
        </div>

        {/* Card 3: Main Admin / Super Admin Total Received */}
        <div
          className={`p-4 rounded-2xl border transition-all shadow-xs ${
            isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              {isSubAdmin ? 'Super Admin 10% Platform Fee' : 'Admin Net Revenue'}
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-2 text-xl font-black text-amber-500">
            Rs. {(isSubAdmin ? summary.totalPlatformCommission : summary.totalSuperAdminRevenue || 0).toLocaleString('en-IN')}
          </div>
          <div className={`text-[11px] mt-1 font-medium ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            {isSubAdmin
              ? '10% deducted for platform legal escrow'
              : `100% direct sales + 10% fee from Sub-Admins`}
          </div>
        </div>

        {/* Card 4: Paid & Disbursed */}
        <div
          onClick={() => {
            setActiveTab('transactions');
            setStatusFilter('Paid');
          }}
          className={`p-4 rounded-2xl border transition-all shadow-xs cursor-pointer ${
            statusFilter === 'Paid' && activeTab === 'transactions'
              ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30'
              : isDark
              ? 'bg-neutral-900/60 border-neutral-800 hover:border-emerald-500/50'
              : 'bg-white border-slate-200 hover:border-emerald-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Settled &amp; Paid
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <Landmark size={16} />
            </div>
          </div>
          <div className="mt-2 text-xl font-black text-emerald-600">
            Rs. {(summary.totalPaidAmount || 0).toLocaleString('en-IN')}
          </div>
          <div className={`text-[11px] mt-1 font-medium ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            {summary.paidCount || 0} completed transaction{summary.paidCount === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: USER-WISE PAYMENT & TRANSACTION TRACKING               */}
      {/* ============================================================== */}
      {activeTab === 'user-tracking' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                <Users size={18} className="text-brand" />
                <span>User-Wise Account Balances &amp; Sales Breakdown</span>
              </h2>
              <p className="text-xs text-gray-400">
                Detailed transaction count and payment distribution tracking for Main Admin and Sub-Admin accounts.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, role or ID..."
                className={`w-full text-xs font-medium pl-9 pr-4 py-2 rounded-xl border transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white border-neutral-800 focus:border-brand'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-brand'
                }`}
              />
            </div>
          </div>

          {/* User Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUserStats.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-400">
                <Users size={32} className="mx-auto mb-2 opacity-40 text-brand" />
                <p className="font-bold">No user accounts found matching your query.</p>
              </div>
            ) : (
              filteredUserStats.map((stat) => {
                const isSubAdminAccount = stat.role === 'Sub-Admin';
                const isMainOrSuper = stat.role === 'Super Admin' || stat.role === 'Main Admin' || stat.role === 'Admin';

                return (
                  <div
                    key={stat.userId}
                    className={`rounded-2xl border p-5 transition-all shadow-xs flex flex-col justify-between ${
                      isDark ? 'bg-neutral-900 border-neutral-800 hover:border-neutral-700' : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      {/* Top Bar: User Identity & Role Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                              isSubAdminAccount
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            }`}
                          >
                            {stat.name ? stat.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className="text-sm font-extrabold block leading-tight">{stat.name}</span>
                            <span className="text-[11px] text-gray-400 block mt-0.5">{stat.email}</span>
                            <span className="text-[10px] font-mono text-gray-500 block">ID: {String(stat.userId).slice(-8)}</span>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 border ${
                            isSubAdminAccount
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}
                        >
                          {stat.role}
                        </span>
                      </div>

                      {/* Split Rule Tag */}
                      <div
                        className={`mt-4 p-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                          isSubAdminAccount
                            ? isDark
                              ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-400'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : isDark
                            ? 'bg-amber-950/20 border-amber-800/40 text-amber-400'
                            : 'bg-amber-50 border-amber-200 text-amber-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Percent size={14} className="shrink-0" />
                          <span>Revenue Share Rule:</span>
                        </div>
                        <span className="font-extrabold">
                          {isSubAdminAccount ? '90% Received (10% Fee)' : '100% Direct Receipt'}
                        </span>
                      </div>

                      {/* Metrics 2x2 Grid */}
                      <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                        <div
                          className={`p-3 rounded-xl border ${
                            isDark ? 'bg-neutral-950/50 border-neutral-800' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <span className="text-[10px] uppercase font-bold text-gray-400 block">Transactions</span>
                          <span className="text-lg font-black mt-0.5 block">{stat.transactionsCount} sales</span>
                          <span className="text-[10px] text-gray-500">
                            {stat.propertiesListedCount} listed • {stat.propertiesSoldCount} sold
                          </span>
                        </div>

                        <div
                          className={`p-3 rounded-xl border ${
                            isDark ? 'bg-neutral-950/50 border-neutral-800' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <span className="text-[10px] uppercase font-bold text-gray-400 block">Gross Sales</span>
                          <span className="text-lg font-black font-mono mt-0.5 block">
                            Rs. {(stat.grossSalesVolume || 0).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-gray-500">Total property value</span>
                        </div>
                      </div>

                      {/* Net Earned / Received Callout */}
                      <div
                        className={`mt-3 p-3.5 rounded-xl border flex items-center justify-between ${
                          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-100 border-slate-200'
                        }`}
                      >
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-400 block">
                            {isSubAdminAccount ? 'Net 90% Received / Payable' : 'Total Revenue Received'}
                          </span>
                          <span
                            className={`text-lg font-black font-mono block ${
                              isSubAdminAccount ? 'text-emerald-500' : 'text-amber-500'
                            }`}
                          >
                            Rs. {(stat.netRevenueEarned || 0).toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="text-right text-[10px] text-gray-400">
                          {isSubAdminAccount ? (
                            <>
                              <span className="block text-emerald-500 font-bold">Paid: Rs. {stat.paidAmount.toLocaleString('en-IN')}</span>
                              <span className="block text-amber-500 font-bold">Pending: Rs. {stat.pendingAmount.toLocaleString('en-IN')}</span>
                            </>
                          ) : (
                            <>
                              <span className="block text-amber-500 font-bold">100% Direct: Rs. {stat.directSalesRevenue.toLocaleString('en-IN')}</span>
                              <span className="block text-blue-400 font-bold">+10% Fee Cut: Rs. {stat.commissionFromSubAdmins.toLocaleString('en-IN')}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action: View user's transactions */}
                    <div className="mt-4 pt-3 border-t border-inherit">
                      <button
                        type="button"
                        onClick={() => setSelectedUserForHistory(stat)}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                          isDark
                            ? 'bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700'
                            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                        }`}
                      >
                        <Receipt size={14} className="text-brand" />
                        <span>View Transactions History ({stat.transactionsCount})</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ALL TRANSACTION & PAYOUT RECORDS TABLE                 */}
      {/* ============================================================== */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          {/* Controls & Filter Bar */}
          <div
            className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 transition-colors ${
              isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="relative w-full md:w-80">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search property, owner, or UTR..."
                className={`w-full text-xs font-medium pl-9 pr-4 py-2 rounded-xl border transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white border-neutral-800 focus:border-brand'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-brand'
                }`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-bold text-gray-400 shrink-0">Split Rule:</span>
              {['All', 'Sub-Admin', 'Main Admin'].map((sp) => (
                <button
                  key={sp}
                  type="button"
                  onClick={() => setSplitFilter(sp)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    splitFilter === sp
                      ? 'bg-brand text-white shadow-xs'
                      : isDark
                      ? 'bg-neutral-950 text-gray-400 hover:text-white border border-neutral-800'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sp === 'Sub-Admin' ? 'Sub-Admin (90/10)' : sp === 'Main Admin' ? 'Main Admin (100%)' : 'All Splits'}
                </button>
              ))}

              <div className="h-4 w-px bg-gray-500/20 mx-1 hidden sm:block" />

              <span className="text-xs font-bold text-gray-400 shrink-0">Status:</span>
              {['All', 'Eligible', 'Paid', 'Completed'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isDark
                      ? 'bg-neutral-950 text-gray-400 hover:text-white border border-neutral-800'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Payouts Table */}
          <div
            className={`rounded-2xl border overflow-hidden shadow-xs transition-colors ${
              isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr
                    className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                      isDark ? 'bg-neutral-950/70 border-neutral-800 text-gray-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    <th className="py-3.5 px-4">Payout Ref &amp; Order</th>
                    <th className="py-3.5 px-4">Property Sold</th>
                    <th className="py-3.5 px-4">Owner / Beneficiary</th>
                    <th className="py-3.5 px-4">Split Policy</th>
                    <th className="py-3.5 px-4">Total Amount</th>
                    <th className="py-3.5 px-4">Super Admin (10%)</th>
                    <th className="py-3.5 px-4">Owner Net Share</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {filteredPayouts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-gray-400">
                        <Landmark size={32} className="mx-auto mb-2 opacity-40 text-brand" />
                        <p className="font-bold">No payment tracking records match your filters.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPayouts.map((p) => {
                      const isPaid = p.status === 'Paid' || p.status === 'Completed';
                      const isSubAdminListing = p.splitType === 'SUBADMIN_90_10' || p.ownerRole === 'Sub-Admin';

                      return (
                        <tr
                          key={p._id || p.payoutId}
                          className={`transition-colors ${
                            isDark ? 'hover:bg-neutral-800/40' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          {/* Payout Ref */}
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-brand block">{p.payoutId}</span>
                            <span className="text-[10px] text-gray-400 font-mono">Order: {p.orderId}</span>
                          </td>

                          {/* Property Sold */}
                          <td className="py-3.5 px-4">
                            <span className="font-bold block max-w-[180px] truncate">{p.propertyTitle}</span>
                            <span className="text-[10px] text-gray-400">
                              {new Date(p.createdAt || Date.now()).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </td>

                          {/* Owner / Beneficiary */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div>
                                <span className="font-bold block">{p.ownerName || p.subAdminName || 'Main Admin'}</span>
                                <span className="text-[10px] text-gray-400 block">{p.ownerEmail || p.subAdminEmail}</span>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border shrink-0 ${
                                  isSubAdminListing
                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                }`}
                              >
                                {p.ownerRole || (isSubAdminListing ? 'Sub-Admin' : 'Main Admin')}
                              </span>
                            </div>
                          </td>

                          {/* Split Policy */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-xl text-[10px] font-extrabold border ${
                                isSubAdminListing
                                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              }`}
                            >
                              {isSubAdminListing ? '90% Sub-Admin / 10% Platform' : '100% Main Admin Direct'}
                            </span>
                          </td>

                          {/* Total Amount */}
                          <td className="py-3.5 px-4 font-mono font-bold">
                            Rs. {(p.totalAmount || 0).toLocaleString('en-IN')}
                          </td>

                          {/* Platform Fee (10% on Sub-Admin) */}
                          <td className="py-3.5 px-4 font-mono text-gray-400">
                            {isSubAdminListing ? (
                              <span className="text-blue-400 font-semibold">
                                + Rs. {(p.commissionAmount || p.superAdminShare || 0).toLocaleString('en-IN')} (10%)
                              </span>
                            ) : (
                              <span className="text-gray-500">Rs. 0 (0%)</span>
                            )}
                          </td>

                          {/* Owner Net Share */}
                          <td className="py-3.5 px-4 font-mono font-black text-emerald-500">
                            Rs. {(p.ownerShare || p.subAdminShare || p.totalAmount || 0).toLocaleString('en-IN')}
                            <span className="text-[10px] font-normal text-gray-400 block">
                              {isSubAdminListing ? '90% Sub-Admin' : '100% Main Admin'}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 border ${
                                isPaid
                                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              }`}
                            >
                              {isPaid ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                              {p.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isPaid && p.transactionReference ? (
                                <button
                                  type="button"
                                  onClick={() => setViewingReceiptPayout(p)}
                                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                    isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-gray-200 border-neutral-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                                  }`}
                                  title="View Bank Transfer Receipt"
                                >
                                  <Receipt size={14} className="text-brand" />
                                </button>
                              ) : null}

                              {/* Only Super Admin can disburse eligible Sub-Admin payouts */}
                              {isSuperAdmin && p.status === 'Eligible' && isSubAdminListing ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedPayoutForProcess(p);
                                    setUtrNumber('');
                                    setPayoutNotes('');
                                    setProcessError('');
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                                >
                                  <Send size={12} />
                                  <span>Disburse (90%)</span>
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: VIEW USER'S COMPLETE TRANSACTIONS HISTORY            */}
      {/* ============================================================== */}
      {selectedUserForHistory && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200 ${
              isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div
              className={`p-5 border-b flex items-center justify-between ${
                isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                    selectedUserForHistory.role === 'Sub-Admin'
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}
                >
                  {selectedUserForHistory.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold">{selectedUserForHistory.name} - Sales &amp; Payment History</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        selectedUserForHistory.role === 'Sub-Admin'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}
                    >
                      {selectedUserForHistory.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Rule: {selectedUserForHistory.splitRule} • User ID: {selectedUserForHistory.userId}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUserForHistory(null)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isDark ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-gray-300' : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Summary KPI Strip */}
            <div
              className={`p-4 border-b grid grid-cols-3 gap-3 text-xs ${
                isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-slate-100/60 border-slate-200'
              }`}
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Transactions</span>
                <span className="text-base font-black">{selectedUserForHistory.transactionsCount} closed sale(s)</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Gross Volume</span>
                <span className="text-base font-black font-mono">
                  Rs. {selectedUserForHistory.grossSalesVolume.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Net Received</span>
                <span className="text-base font-black font-mono text-emerald-500">
                  Rs. {selectedUserForHistory.netRevenueEarned.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="max-h-96 overflow-y-auto p-4">
              {selectedUserForHistory.recentTransactions?.length === 0 ? (
                <div className="py-8 text-center text-gray-400">
                  <p className="font-bold">No sales transactions recorded for this account yet.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className={`border-b text-[10px] font-bold uppercase ${
                    isDark ? 'text-gray-400 border-neutral-800' : 'text-slate-500 border-slate-200'
                  }`}>
                    <tr>
                      <th className="py-2.5 px-3">Order / Ref</th>
                      <th className="py-2.5 px-3">Property Title</th>
                      <th className="py-2.5 px-3">Gross Amount</th>
                      <th className="py-2.5 px-3">
                        {selectedUserForHistory.role === 'Sub-Admin' ? 'Net 90% Share' : 'Net 100% Share'}
                      </th>
                      <th className="py-2.5 px-3">Super Admin 10%</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5 font-medium">
                    {selectedUserForHistory.recentTransactions.map((tx) => (
                      <tr key={tx.payoutId || tx.orderId} className={isDark ? 'hover:bg-neutral-800/40' : 'hover:bg-slate-50'}>
                        <td className="py-2.5 px-3">
                          <span className="font-mono font-bold text-brand block">{tx.orderId}</span>
                          <span className="text-[10px] text-gray-400">{tx.payoutId}</span>
                        </td>
                        <td className="py-2.5 px-3 font-bold">{tx.propertyTitle}</td>
                        <td className="py-2.5 px-3 font-mono">Rs. {(tx.totalAmount || 0).toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-3 font-mono font-black text-emerald-500">
                          Rs. {(tx.ownerShare || tx.subAdminShare || tx.totalAmount).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-gray-400">
                          Rs. {(tx.superAdminShare || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                              tx.status === 'Paid' || tx.status === 'Completed'
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-4 border-t border-inherit flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedUserForHistory(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: DISBURSE SUB-ADMIN PAYOUT (SUPER ADMIN ACTION)         */}
      {/* ============================================================== */}
      {selectedPayoutForProcess && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200 ${
              isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div
              className={`p-6 border-b flex items-center justify-between ${
                isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
                  <Landmark size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight">
                    Disburse Sub-Admin 90% Payment Share
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    Transfer funds to verified bank account ({selectedPayoutForProcess.payoutId})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPayoutForProcess(null)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isDark ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-gray-300' : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleConfirmDisbursement} className="p-6 space-y-4 text-xs">
              {processError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-semibold flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{processError}</span>
                </div>
              )}

              {/* Amount Highlight Card */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 uppercase font-bold block">
                    Eligible 90% Disbursement
                  </span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    Rs. {(selectedPayoutForProcess.subAdminShare || selectedPayoutForProcess.ownerShare).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right text-[11px] text-gray-400">
                  <span>Gross: Rs. {selectedPayoutForProcess.totalAmount.toLocaleString('en-IN')}</span>
                  <span className="block text-blue-500 font-bold">- 10% Super Admin Fee Retained</span>
                </div>
              </div>

              {/* Verified Beneficiary Bank Details */}
              <div
                className={`p-4 rounded-2xl border space-y-2.5 ${
                  isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                    <ShieldCheck size={14} /> Verified Destination Bank Account
                  </span>
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    KYC Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Beneficiary Name:</span>
                    <span className="font-bold">{selectedPayoutForProcess.subAdminName || selectedPayoutForProcess.ownerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Bank:</span>
                    <span className="font-bold">{selectedPayoutForProcess.bankDetails?.bankName || 'HDFC Bank'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Account Number:</span>
                    <span className="font-mono font-bold">
                      {selectedPayoutForProcess.bankDetails?.accountNumber || '501004329871'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">IFSC Code:</span>
                    <span className="font-mono font-bold uppercase">
                      {selectedPayoutForProcess.bankDetails?.ifscCode || 'HDFC0001234'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transaction Reference (UTR) */}
              <div>
                <label className="block font-bold mb-1.5">
                  Bank Transaction Reference (UTR / IMPS Ref) <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="e.g. UTR-HDFC-991827461"
                  className={`w-full font-mono text-xs font-bold rounded-xl px-3.5 py-2.5 border transition-all focus:outline-none ${
                    isDark
                      ? 'bg-neutral-950 text-white border-neutral-800 focus:border-brand'
                      : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-brand'
                  }`}
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block font-bold mb-1.5">Disbursement Channel:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className={`w-full text-xs font-semibold rounded-xl px-3.5 py-2.5 border transition-all focus:outline-none ${
                    isDark
                      ? 'bg-neutral-950 text-white border-neutral-800 focus:border-brand'
                      : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-brand'
                  }`}
                >
                  <option value="Direct Bank NEFT / RTGS">Direct Bank NEFT / RTGS</option>
                  <option value="IMPS Instant Bank Transfer">IMPS Instant Bank Transfer</option>
                  <option value="UPI Direct VPA Transfer">UPI Direct VPA Transfer</option>
                  <option value="Escrow Account Disbursement">Escrow Account Disbursement</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold mb-1.5">Audit Note / Remarks (Optional):</label>
                <input
                  type="text"
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  placeholder="e.g. 90% sales share released to verified KYC account."
                  className={`w-full text-xs font-medium rounded-xl px-3.5 py-2.5 border transition-all focus:outline-none ${
                    isDark
                      ? 'bg-neutral-950 text-white border-neutral-800 focus:border-brand'
                      : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-brand'
                  }`}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-inherit">
                <button
                  type="button"
                  onClick={() => setSelectedPayoutForProcess(null)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                    isDark ? 'bg-neutral-800 border-neutral-700 text-gray-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 size={15} />
                  <span>{isProcessing ? 'Authorizing...' : 'Confirm & Disburse 90% Share'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: UTR / BANK TRANSFER RECEIPT PREVIEW                  */}
      {/* ============================================================== */}
      {viewingReceiptPayout && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200 ${
              isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div
              className={`p-5 border-b flex items-center justify-between ${
                isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Receipt size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold">Official Bank Payout Receipt</h3>
                  <p className="text-[10px] text-gray-400">Ref: {viewingReceiptPayout.payoutId}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingReceiptPayout(null)}
                className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                  isDark ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-gray-300' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <X size={15} />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="p-6 space-y-4 text-xs font-medium">
              <div className="text-center pb-3 border-b border-inherit">
                <span className="text-[10px] uppercase font-bold text-emerald-500 block">Funds Disbursed</span>
                <span className="text-2xl font-black font-mono text-emerald-500">
                  Rs. {(viewingReceiptPayout.ownerShare || viewingReceiptPayout.subAdminShare || viewingReceiptPayout.totalAmount).toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-gray-400 block mt-0.5">
                  Property: {viewingReceiptPayout.propertyTitle}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">UTR / Transaction Ref:</span>
                  <span className="font-mono font-bold text-brand">{viewingReceiptPayout.transactionReference || 'UTR-MOCK-99182'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Beneficiary:</span>
                  <span className="font-bold">{viewingReceiptPayout.ownerName || viewingReceiptPayout.subAdminName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Revenue Split:</span>
                  <span className="font-bold text-emerald-500">
                    {viewingReceiptPayout.splitType === 'SUBADMIN_90_10' ? '90% Sub-Admin (10% Super Admin)' : '100% Main Admin Direct'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Destination Bank:</span>
                  <span className="font-bold">{viewingReceiptPayout.bankDetails?.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Account Number:</span>
                  <span className="font-mono font-bold">{maskAccount(viewingReceiptPayout.bankDetails?.accountNumber)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">IFSC Code:</span>
                  <span className="font-mono font-bold uppercase">{viewingReceiptPayout.bankDetails?.ifscCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Settled On:</span>
                  <span className="font-bold">
                    {new Date(viewingReceiptPayout.processedAt || viewingReceiptPayout.updatedAt || Date.now()).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-inherit flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setViewingReceiptPayout(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer hover:bg-slate-800"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payouts;
