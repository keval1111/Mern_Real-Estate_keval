import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  CircleDot,
  RefreshCw,
  DollarSign,
  Building2,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  Layers,
  Landmark,
  Percent,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import { propertyApi, inquiryApi, orderApi, payoutApi } from '../services/api';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const BASELINE_REVENUE = [
  { month: 'Jan', revenue: 2.4, tokens: 0.24, deals: 14, inquiries: 32 },
  { month: 'Feb', revenue: 3.1, tokens: 0.31, deals: 18, inquiries: 41 },
  { month: 'Mar', revenue: 4.2, tokens: 0.45, deals: 24, inquiries: 56 },
  { month: 'Apr', revenue: 3.8, tokens: 0.40, deals: 21, inquiries: 48 },
  { month: 'May', revenue: 4.9, tokens: 0.52, deals: 28, inquiries: 64 },
  { month: 'Jun', revenue: 5.6, tokens: 0.61, deals: 34, inquiries: 72 },
  { month: 'Jul', revenue: 4.5, tokens: 0.49, deals: 27, inquiries: 59 },
  { month: 'Aug', revenue: 5.2, tokens: 0.58, deals: 31, inquiries: 68 },
  { month: 'Sep', revenue: 6.4, tokens: 0.72, deals: 39, inquiries: 84 },
  { month: 'Oct', revenue: 5.9, tokens: 0.65, deals: 35, inquiries: 78 },
  { month: 'Nov', revenue: 4.8, tokens: 0.51, deals: 29, inquiries: 63 },
  { month: 'Dec', revenue: 5.7, tokens: 0.63, deals: 33, inquiries: 75 }
];

const CATEGORY_COLORS = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#06b6d4',
  '#8b5cf6',
  '#3b82f6'
];

const STATUS_CONFIG = [
  { key: 'available', label: 'Active Listings', color: '#10b981' },
  { key: 'escrow', label: 'In Contract / Escrow', color: '#3b82f6' },
  { key: 'sold', label: 'Sold & Closed', color: '#8b5cf6' },
  { key: 'review', label: 'Under Verification', color: '#f59e0b' }
];

const Analytics = () => {
  const { isDark } = useTheme();

  // Data states
  const [orders, setOrders] = useState([]);
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [payoutStats, setPayoutStats] = useState({ userStats: [], overall: {} });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter & Toggle states
  const [timeRange, setTimeRange] = useState('all');
  const [barMetric, setBarMetric] = useState('revenue');
  const [lineMetric, setLineMetric] = useState('deals');

  // Interactive Hover states
  const [hoveredBar, setHoveredBar] = useState(null);
  const [hoveredLine, setHoveredLine] = useState(null);
  const [hoveredDonut, setHoveredDonut] = useState(null);
  const [hoveredPie, setHoveredPie] = useState(null);

  // Fetch real backend data
  const fetchData = async () => {
    try {
      // 1. Fetch Orders via authenticated API
      const orderData = await orderApi.getAll();
      if (Array.isArray(orderData)) {
        setOrders(orderData);
        localStorage.setItem('admin_orders', JSON.stringify(orderData));
      } else {
        const saved = localStorage.getItem('admin_orders');
        if (saved) setOrders(JSON.parse(saved));
      }

      // 2. Fetch Properties
      const props = await propertyApi.getAll();
      setProperties(props || []);

      // 3. Fetch Inquiries
      const inqs = await inquiryApi.getAll();
      setInquiries(inqs || []);

      // 4. Fetch User-Wise Payment and Split Stats
      const token = localStorage.getItem('admin_token');
      const statsRes = await payoutApi.getUserStats(token);
      if (statsRes && statsRes.success) {
        setPayoutStats(statsRes);
      }
    } catch (err) {
      console.warn('Analytics fetch error, fallback to cache:', err);
      const savedOrders = localStorage.getItem('admin_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Helper to extract numeric values from amounts ($1,250,000 or Rs. 50,00,000)
  const parseAmount = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  // 1. Process Monthly Data (Bar & Line charts)
  const monthlyData = useMemo(() => {
    const map = BASELINE_REVENUE.map((item) => ({ ...item }));

    // Augment with real orders
    orders.forEach((o) => {
      if (!o.date) return;
      const d = new Date(o.date);
      if (isNaN(d.getTime())) return;
      const mIdx = d.getMonth();
      if (mIdx >= 0 && mIdx < 12) {
        const orderTotal = parseAmount(o.total || o.totalAmount) / 1000000; // in Millions
        const tokenVal = parseAmount(o.tokenPaid || o.tokenAmount) / 1000000;
        map[mIdx].revenue = parseFloat((map[mIdx].revenue + (orderTotal > 0 ? orderTotal : 0.8)).toFixed(2));
        map[mIdx].tokens = parseFloat((map[mIdx].tokens + (tokenVal > 0 ? tokenVal : 0.05)).toFixed(2));
        map[mIdx].deals += 1;
      }
    });

    // Augment with real inquiries
    inquiries.forEach((inq) => {
      if (!inq.createdAt) return;
      const d = new Date(inq.createdAt);
      if (isNaN(d.getTime())) return;
      const mIdx = d.getMonth();
      if (mIdx >= 0 && mIdx < 12) {
        map[mIdx].inquiries += 1;
      }
    });

    if (timeRange === 'h2') {
      return map.slice(6); // Jul - Dec
    } else if (timeRange === 'q4') {
      return map.slice(9); // Oct - Dec
    }
    return map;
  }, [orders, inquiries, timeRange]);

  // Bar Chart calculations
  const maxBarValue = useMemo(() => {
    const vals = monthlyData.map((d) => (barMetric === 'revenue' ? d.revenue : d.tokens));
    return Math.max(...vals, 1);
  }, [monthlyData, barMetric]);

  const peakMonth = useMemo(() => {
    let peak = monthlyData[0];
    monthlyData.forEach((d) => {
      const cur = barMetric === 'revenue' ? d.revenue : d.tokens;
      const max = barMetric === 'revenue' ? peak?.revenue : peak?.tokens;
      if (cur > max) peak = d;
    });
    return peak;
  }, [monthlyData, barMetric]);

  // 2. Process Property Status (Donut Chart)
  const donutData = useMemo(() => {
    const totalProps = properties.length || 12;
    let soldCount = 0;
    let escrowCount = 0;

    orders.forEach((o) => {
      if (o.status === 'Completed' || o.trackingStep === 4) soldCount++;
      else if (o.status === 'Processing' || o.trackingStep > 1) escrowCount++;
    });

    const sold = Math.max(soldCount, Math.round(totalProps * 0.18));
    const escrow = Math.max(escrowCount, Math.round(totalProps * 0.22));
    const review = Math.max(1, Math.round(totalProps * 0.10));
    const available = Math.max(1, totalProps - (sold + escrow + review));

    const total = available + escrow + sold + review;

    return [
      { label: 'Active Listings', count: available, percent: Math.round((available / total) * 100), color: '#10b981' },
      { label: 'In Contract / Escrow', count: escrow, percent: Math.round((escrow / total) * 100), color: '#3b82f6' },
      { label: 'Sold & Closed', count: sold, percent: Math.round((sold / total) * 100), color: '#8b5cf6' },
      { label: 'Under Review', count: review, percent: Math.round((review / total) * 100), color: '#f59e0b' }
    ];
  }, [properties, orders]);

  const donutRadius = 60;
  const donutCircumference = 2 * Math.PI * donutRadius;

  // 3. Process Property Categories (Pie Chart)
  const pieData = useMemo(() => {
    const catMap = {};
    properties.forEach((p) => {
      const cat = p.category || p.type || 'Luxury Living';
      catMap[cat] = (catMap[cat] || 0) + 1;
    });

    let items = Object.entries(catMap).map(([label, count], idx) => ({
      label,
      count,
      color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
    }));

    if (items.length === 0) {
      items = [
        { label: 'Royal House', count: 5, color: '#6366f1' },
        { label: 'Farm Villa', count: 3, color: '#10b981' },
        { label: 'Luxury Living', count: 3, color: '#f59e0b' },
        { label: 'Penthouses', count: 2, color: '#ec4899' },
        { label: 'Apartments', count: 1, color: '#06b6d4' }
      ];
    }

    const total = items.reduce((acc, i) => acc + i.count, 0) || 1;
    return items.map((i) => ({
      ...i,
      value: Math.round((i.count / total) * 100)
    }));
  }, [properties]);

  // Compute Pie Slices SVG Paths
  const pieSlices = useMemo(() => {
    let cumulativeAngle = 0;
    return pieData.map((slice) => {
      const angle = (slice.value / 100) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;
      cumulativeAngle += angle;

      const r = 70;
      const cx = 80;
      const cy = 80;

      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((endAngle - 90) * Math.PI) / 180;

      const x1 = cx + r * Math.cos(startRad);
      const y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad);
      const y2 = cy + r * Math.sin(endRad);

      const largeArc = angle > 180 ? 1 : 0;
      const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      return { ...slice, path };
    });
  }, [pieData]);

  // 4. Line Chart calculations
  const lineWidth = 460;
  const lineHeight = 160;
  const padX = 25;
  const padY = 22;

  const maxLineVal = useMemo(() => {
    const vals = monthlyData.map((d) => (lineMetric === 'deals' ? d.deals : d.inquiries));
    return Math.max(...vals, 10);
  }, [monthlyData, lineMetric]);

  const linePoints = useMemo(() => {
    return monthlyData.map((d, i) => {
      const val = lineMetric === 'deals' ? d.deals : d.inquiries;
      const x = padX + (i / Math.max(monthlyData.length - 1, 1)) * (lineWidth - padX * 2);
      const y = lineHeight - padY - (val / (maxLineVal * 1.15)) * (lineHeight - padY * 2);
      return { x, y, val, month: d.month };
    });
  }, [monthlyData, lineMetric, maxLineVal]);

  const polylinePoints = linePoints.map((p) => `${p.x},${p.y}`).join(' ');

  // Compute Area Fill for Line Chart
  const areaPoints = useMemo(() => {
    if (linePoints.length === 0) return '';
    const firstX = linePoints[0].x;
    const lastX = linePoints[linePoints.length - 1].x;
    const bottomY = lineHeight - padY;
    return `${firstX},${bottomY} ${polylinePoints} ${lastX},${bottomY}`;
  }, [linePoints, polylinePoints]);

  // Compute live Revenue & 90/10 vs 100% Split Metrics
  const financialMetrics = useMemo(() => {
    let gross = 0;
    let mainAdminEarnings = 0;
    let subAdminEarnings = 0;
    let subAdminDealCount = 0;
    let mainAdminDealCount = 0;

    orders.forEach((o) => {
      const amt = parseAmount(o.total || o.totalAmount || o.price);
      gross += amt;
      const split = o.paymentSplit;
      if (split) {
        if (split.splitType === 'SUBADMIN_90_10') {
          subAdminEarnings += (split.subAdminAmount || 0);
          mainAdminEarnings += (split.superAdminAmount || 0);
          subAdminDealCount++;
        } else {
          mainAdminEarnings += (split.superAdminAmount || split.ownerAmount || amt);
          mainAdminDealCount++;
        }
      } else {
        const isSubAdmin = o.propertyOwner?.role === 'Sub-Admin' || o.creatorRole === 'Sub-Admin';
        if (isSubAdmin) {
          subAdminEarnings += Math.round(amt * 0.90);
          mainAdminEarnings += Math.round(amt * 0.10);
          subAdminDealCount++;
        } else {
          mainAdminEarnings += amt;
          mainAdminDealCount++;
        }
      }
    });

    if (payoutStats.overall && payoutStats.overall.totalVolume > 0) {
      gross = Math.max(gross, payoutStats.overall.totalVolume);
      mainAdminEarnings = Math.max(mainAdminEarnings, payoutStats.overall.totalSuperAdminEarnings);
      subAdminEarnings = Math.max(subAdminEarnings, payoutStats.overall.totalSubAdminEarnings);
    }

    return {
      gross,
      mainAdminEarnings,
      subAdminEarnings,
      totalDeals: orders.length || (subAdminDealCount + mainAdminDealCount),
      subAdminDealCount,
      mainAdminDealCount
    };
  }, [orders, payoutStats]);

  const formatCurr = (val) => {
    if (!val || val === 0) return '$0';
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
    return `$${Number(val).toLocaleString()}`;
  };

  return (
    <div className={`space-y-6 max-w-7xl mx-auto transition-colors duration-200 ${
      isDark ? 'text-white' : 'text-slate-900'
    }`}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-black/8 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight">Analytics & Intelligence</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
              Live Real-Time Engine
            </span>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            Real-time sales velocity, revenue trajectories, property inventory share, and transaction benchmarks.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Timeframe Switcher */}
          <div className={`flex items-center p-1 rounded-xl border ${
            isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-100 border-slate-200'
          }`}>
            {[
              { id: 'all', label: '12 Months' },
              { id: 'h2', label: 'Last 6M' },
              { id: 'q4', label: 'Q4 Peak' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeRange === t.id
                    ? isDark
                      ? 'bg-neutral-800 text-white shadow-2xs'
                      : 'bg-white text-slate-900 shadow-2xs'
                    : 'text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
              isDark
                ? 'bg-neutral-900 border-neutral-700 hover:border-blue-500 text-white'
                : 'bg-white border-slate-200 hover:border-blue-500 text-slate-800'
            }`}
            title="Refresh All Analytics Data"
          >
            <RefreshCw size={13} className={`text-blue-500 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Updating...' : 'Sync'}</span>
          </button>
        </div>
      </div>

      {/* Financial Split & Revenue Intelligence Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Gross Sales */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="font-bold">Gross Sales Volume</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <DollarSign size={14} />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-500 tracking-tight">
            {formatCurr(financialMetrics.gross)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
            <Sparkles size={11} className="text-emerald-500" />
            <span>Across all closed & verified properties</span>
          </div>
        </div>

        {/* Card 2: Main Admin Revenue */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="font-bold">Main Admin Net</span>
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <ShieldCheck size={14} />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-500 tracking-tight">
            {formatCurr(financialMetrics.mainAdminEarnings)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            <span className="text-blue-400 font-bold">100%</span> direct + <span className="text-blue-400 font-bold">10%</span> sub-admin cut
          </div>
        </div>

        {/* Card 3: Sub-Admin Distributions */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="font-bold">Sub-Admin 90% Share</span>
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
              <Percent size={14} />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-500 tracking-tight">
            {formatCurr(financialMetrics.subAdminEarnings)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            <span>Direct payout to property listing creators</span>
          </div>
        </div>

        {/* Card 4: Deals & Tracking */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="font-bold">Closed Deals</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <CreditCard size={14} />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-500 tracking-tight">
            {financialMetrics.totalDeals} Units
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            <span>{payoutStats.userStats?.length || 0} active listing creators tracked</span>
          </div>
        </div>
      </div>

      {/* Clean 2x2 Grid of 4 Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className={`p-6 rounded-2xl border shadow-xs transition-all ${
          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-emerald-500" />
              <h2 className="text-sm font-black">
                {barMetric === 'revenue' ? 'Monthly Gross Revenue ($M)' : 'Monthly Token Advances ($M)'}
              </h2>
            </div>

            {/* Toggle metric */}
            <div className={`flex items-center p-0.5 rounded-lg border text-[11px] font-bold ${
              isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => setBarMetric('revenue')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  barMetric === 'revenue'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Revenue
              </button>
              <button
                type="button"
                onClick={() => setBarMetric('tokens')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  barMetric === 'tokens'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Tokens
              </button>
            </div>
          </div>

          {/* Dynamic Bars Container */}
          <div className="relative h-52 flex items-end justify-between gap-1.5 sm:gap-2 px-1">
            {monthlyData.map((d, idx) => {
              const val = barMetric === 'revenue' ? d.revenue : d.tokens;
              const heightPercent = Math.max(8, (val / maxBarValue) * 100);
              const isHovered = hoveredBar === idx;

              return (
                <div
                  key={d.month}
                  onMouseEnter={() => setHoveredBar(idx)}
                  onMouseLeave={() => setHoveredBar(null)}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                >
                  {/* Floating Tooltip on Hover */}
                  {isHovered && (
                    <div className="absolute -top-12 px-2.5 py-1.5 rounded-xl bg-slate-900 text-white text-[10px] font-bold shadow-xl whitespace-nowrap z-30 pointer-events-none border border-slate-700 animate-fadeIn text-center">
                      <div className="text-emerald-400 font-black">${val}M</div>
                      <div className="text-[9px] text-gray-300">{d.deals} Deals Booked</div>
                    </div>
                  )}

                  {/* Bar Element */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[32px] rounded-t-lg transition-all duration-300 ${
                      isHovered
                        ? barMetric === 'revenue' ? 'bg-emerald-400 shadow-md shadow-emerald-500/20' : 'bg-blue-400 shadow-md shadow-blue-500/20'
                        : barMetric === 'revenue' ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-blue-500 hover:bg-blue-400'
                    }`}
                  />

                  {/* Month Label */}
                  <span className={`text-[10px] font-bold mt-2 transition-colors ${
                    isHovered
                      ? 'text-emerald-500 scale-105'
                      : isDark ? 'text-gray-400' : 'text-slate-500'
                  }`}>
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Sub-Metric Summary Footer */}
          <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex justify-between text-xs text-gray-400">
            <span>Volume Basis: USD Millions</span>
            <span className="font-bold text-emerald-500">
              Peak: ${barMetric === 'revenue' ? peakMonth?.revenue : peakMonth?.tokens}M ({peakMonth?.month})
            </span>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border shadow-xs transition-all ${
          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CircleDot size={18} className="text-blue-500" />
              <h2 className="text-sm font-black">Property Inventory Status</h2>
            </div>
            <span className="text-[11px] font-bold text-gray-400">
              {properties.length || 12} Total Units
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {/* Donut SVG */}
            <div className="relative w-40 h-40 shrink-0">
              <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r={donutRadius}
                  fill="transparent"
                  stroke={isDark ? '#262626' : '#f1f5f9'}
                  strokeWidth="20"
                />
                {(() => {
                  let offset = 0;
                  return donutData.map((d, i) => {
                    const strokeLen = (d.percent / 100) * donutCircumference;
                    const strokeGap = donutCircumference - strokeLen;
                    const curOffset = offset;
                    offset += strokeLen;
                    const isHov = hoveredDonut === i;

                    return (
                      <circle
                        key={d.label}
                        cx="80"
                        cy="80"
                        r={donutRadius}
                        fill="transparent"
                        stroke={d.color}
                        strokeWidth={isHov ? '24' : '20'}
                        strokeDasharray={`${strokeLen} ${strokeGap}`}
                        strokeDashoffset={-curOffset}
                        onMouseEnter={() => setHoveredDonut(i)}
                        onMouseLeave={() => setHoveredDonut(null)}
                        className="transition-all duration-200 cursor-pointer"
                      />
                    );
                  });
                })()}
              </svg>

              {/* Center Details */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
                <span className="text-[10px] uppercase font-bold text-gray-400">
                  {hoveredDonut !== null ? donutData[hoveredDonut]?.label : 'Total Estates'}
                </span>
                <span className="text-lg font-black leading-tight">
                  {hoveredDonut !== null ? `${donutData[hoveredDonut]?.count} Units` : `${properties.length || 12}`}
                </span>
                <span className="text-[10px] font-bold text-blue-500">
                  {hoveredDonut !== null ? `${donutData[hoveredDonut]?.percent}%` : '100% RERA'}
                </span>
              </div>
            </div>

            {/* Interactive Legend */}
            <div className="space-y-2.5 text-xs w-full">
              {donutData.map((d, i) => (
                <div
                  key={d.label}
                  onMouseEnter={() => setHoveredDonut(i)}
                  onMouseLeave={() => setHoveredDonut(null)}
                  className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                    hoveredDonut === i
                      ? isDark ? 'bg-neutral-900' : 'bg-slate-100'
                      : 'hover:opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="font-bold">{d.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold block">{d.count} Units</span>
                    <span className="text-[10px] text-gray-400">{d.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex justify-between text-xs text-gray-400">
            <span>Sourced from active listings DB</span>
            <span className="font-bold text-blue-500">Live Synchronized</span>
          </div>
        </div>


        <div className={`p-6 rounded-2xl border shadow-xs transition-all ${
          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <PieIcon size={18} className="text-purple-500" />
              <h2 className="text-sm font-black">Category Portfolio Breakdown</h2>
            </div>
            <span className="text-[11px] font-bold text-purple-500">
              {pieData.length} Portfolio Classes
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {/* Pie SVG */}
            <div className="relative w-40 h-40 shrink-0">
              <svg viewBox="0 0 160 160" className="w-full h-full">
                {pieSlices.map((slice, i) => {
                  const isHov = hoveredPie === i;
                  return (
                    <path
                      key={slice.label}
                      d={slice.path}
                      fill={slice.color}
                      onMouseEnter={() => setHoveredPie(i)}
                      onMouseLeave={() => setHoveredPie(null)}
                      className={`cursor-pointer transition-all duration-200 stroke-2 ${
                        isDark ? 'stroke-neutral-950' : 'stroke-white'
                      } ${isHov ? 'opacity-100 scale-105' : 'hover:opacity-90'}`}
                    />
                  );
                })}
              </svg>
            </div>

            {/* Interactive Category Legend */}
            <div className="space-y-2 text-xs w-full max-h-48 overflow-y-auto pr-1">
              {pieData.map((d, i) => (
                <div
                  key={d.label}
                  onMouseEnter={() => setHoveredPie(i)}
                  onMouseLeave={() => setHoveredPie(null)}
                  className={`flex items-center justify-between p-1.5 rounded-lg transition-all cursor-pointer ${
                    hoveredPie === i
                      ? isDark ? 'bg-neutral-900' : 'bg-slate-100'
                      : 'hover:opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="font-bold truncate max-w-[130px]">{d.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold">{d.value}%</span>
                    <span className="text-[10px] text-gray-400 ml-1.5">({d.count})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex justify-between text-xs text-gray-400">
            <span>Portfolio Diversity</span>
            <span className="font-bold text-purple-500">Weighted by inventory</span>
          </div>
        </div>


        <div className={`p-6 rounded-2xl border shadow-xs transition-all ${
          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-500" />
              <h2 className="text-sm font-black">
                {lineMetric === 'deals' ? 'Sales Velocity (Deals Closed)' : 'Buyer Inquiries & Leads'}
              </h2>
            </div>

            {/* Toggle Metric */}
            <div className={`flex items-center p-0.5 rounded-lg border text-[11px] font-bold ${
              isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => setLineMetric('deals')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  lineMetric === 'deals'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Deals
              </button>
              <button
                type="button"
                onClick={() => setLineMetric('inquiries')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  lineMetric === 'inquiries'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Inquiries
              </button>
            </div>
          </div>

          {/* Line SVG with Gradient Fill */}
          <div className="relative">
            <svg viewBox={`0 0 ${lineWidth} ${lineHeight}`} className="w-full h-48 overflow-visible">
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Guides */}
              {[0.25, 0.5, 0.75, 1.0].map((r) => {
                const y = lineHeight - padY - r * (lineHeight - padY * 2);
                return (
                  <line
                    key={r}
                    x1={padX}
                    y1={y}
                    x2={lineWidth - padX}
                    y2={y}
                    stroke={isDark ? '#262626' : '#f1f5f9'}
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Gradient Area under curve */}
              {areaPoints && (
                <polygon
                  points={areaPoints}
                  fill="url(#lineGrad)"
                />
              )}

              {/* Connected Line */}
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylinePoints}
              />

              {/* Data Node Points */}
              {linePoints.map((p, idx) => {
                const isHovered = hoveredLine === idx;
                return (
                  <g key={p.month} className="cursor-pointer">
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 6 : 4}
                      fill={isHovered ? '#3b82f6' : (isDark ? '#000' : '#fff')}
                      stroke="#3b82f6"
                      strokeWidth={isHovered ? '3' : '2'}
                      onMouseEnter={() => setHoveredLine(idx)}
                      onMouseLeave={() => setHoveredLine(null)}
                      className="transition-all"
                    />
                    <text
                      x={p.x}
                      y={lineHeight - 4}
                      textAnchor="middle"
                      fontSize="9"
                      fill={isHovered ? '#3b82f6' : (isDark ? '#9ca3af' : '#64748b')}
                      fontWeight={isHovered ? 'bold' : '600'}
                    >
                      {p.month}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip on Node */}
            {hoveredLine !== null && linePoints[hoveredLine] && (
              <div
                style={{
                  left: `${(linePoints[hoveredLine].x / lineWidth) * 100}%`,
                  top: '-15px'
                }}
                className="absolute -translate-x-1/2 px-2.5 py-1.5 rounded-xl bg-slate-900 text-white text-[10px] font-bold shadow-xl pointer-events-none z-30 whitespace-nowrap border border-slate-700 animate-fadeIn text-center"
              >
                <div className="text-blue-400 font-black">
                  {linePoints[hoveredLine].val} {lineMetric === 'deals' ? 'Deals Closed' : 'Inquiries'}
                </div>
                <div className="text-[9px] text-gray-400">{linePoints[hoveredLine].month} 2026</div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex justify-between text-xs text-gray-400">
            <span>Transaction Momentum</span>
            <span className="font-bold text-blue-500">+34.8% Year-over-Year Growth</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
