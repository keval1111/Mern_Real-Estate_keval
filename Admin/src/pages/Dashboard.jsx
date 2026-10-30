import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  MessageSquare,
  DollarSign,
  ShoppingCart,
  Plus,
  ArrowUpRight,
  Clock,
  Inbox,
  RotateCcw,
  Sparkles,
  TrendingUp,
  MapPin,
  BarChart3,
  Table as TableIcon,
  Calendar,
  Layers,
  Activity
} from 'lucide-react';
import { defaultProperties, getInitialProperties } from '../data/defaultProperties';
import { useTheme } from '../context/ThemeContext';
import { propertyApi, inquiryApi, orderApi } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [properties, setProperties] = useState(() => getInitialProperties());
  const [inquiries, setInquiries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [hoveredBar, setHoveredBar] = useState(null);

  // Load live data from Backend API on mount
  useEffect(() => {
    propertyApi.getAll().then((data) => {
      if (data && data.length > 0) setProperties(data);
    });
    inquiryApi.getAll().then((data) => {
      if (data) setInquiries(data);
    });
    orderApi.getAll().then((data) => {
      if (data) setOrders(data);
    });
  }, []);

  // Reset/seed 12 properties into Backend and localStorage
  const handleResetDefaults = async () => {
    const data = await propertyApi.resetDefaults();
    setProperties(data);
  };

  // Calculate live revenue from orders or sold properties
  const calculateRevenue = () => {
    let sum = 0;
    if (orders && orders.length > 0) {
      orders.forEach((o) => {
        const num = parseFloat(String(o.total || o.totalAmount || o.price || '').replace(/[^0-9.]/g, ''));
        if (!isNaN(num)) sum += num;
      });
    } else if (properties && properties.length > 0) {
      properties.filter((p) => p.status === 'Sold').forEach((p) => {
        const num = parseFloat(String(p.price || '').replace(/[^0-9.]/g, ''));
        if (!isNaN(num)) sum += num;
      });
    }
    if (sum === 0) return '$0';
    if (sum >= 1000000) return `$${(sum / 1000000).toFixed(1)}M`;
    if (sum >= 1000) return `$${(sum / 1000).toFixed(0)}k`;
    return `$${sum.toLocaleString()}`;
  };

  // Calculate total portfolio asset value from active catalog listings
  const calculatePortfolioValue = () => {
    if (!properties || properties.length === 0) return '$0';
    let sum = 0;
    properties.forEach((p) => {
      const num = parseFloat(String(p.price || '').replace(/[^0-9.]/g, ''));
      if (!isNaN(num)) sum += num;
    });
    if (sum === 0) return '$0';
    if (sum >= 1000000) return `$${(sum / 1000000).toFixed(1)}M`;
    if (sum >= 1000) return `$${(sum / 1000).toFixed(0)}k`;
    return `$${sum.toLocaleString()}`;
  };

  const dynamicStats = [
    {
      title: 'Portfolio Valuation',
      value: calculatePortfolioValue(),
      subtext: `${properties.length} total properties valued`,
      icon: TrendingUp,
      iconBg: isDark ? 'bg-[#243140] text-brand' : 'bg-amber-50 text-amber-700'
    },
    {
      title: 'Platform Revenue',
      value: calculateRevenue(),
      subtext: orders.length === 0 ? 'From closed transactions' : `${orders.length} order(s) processed`,
      icon: DollarSign,
      iconBg: isDark ? 'bg-[#243140] text-emerald-400' : 'bg-emerald-50 text-emerald-700'
    },
    {
      title: 'Catalog Listings',
      value: properties.length.toString(),
      subtext: `${properties.filter(p => p.status === 'Active').length} currently active for sale`,
      icon: Building2,
      iconBg: isDark ? 'bg-[#243140] text-blue-400' : 'bg-blue-50 text-blue-700'
    },
    {
      title: 'Active Inquiries',
      value: inquiries.length.toString(),
      subtext: inquiries.length === 0 ? 'No new client leads' : `${inquiries.length} pending lead(s)`,
      icon: MessageSquare,
      iconBg: isDark ? 'bg-[#243140] text-purple-400' : 'bg-purple-50 text-purple-700'
    }
  ];

  const categories = ['All', 'Royal House', 'Farm Villa', 'Properties', 'Bestseller'];

  const filteredProperties = properties.filter((p) => {
    if (selectedFilter === 'All') return true;
    return p.category === selectedFilter;
  });

  const togglePropertyStatus = async (id) => {
    const updated = properties.map((p) => {
      const pid = p._id || p.id;
      if (pid === id) {
        const nextStatus =
          p.status === 'Active'
            ? 'Pending'
            : p.status === 'Pending'
            ? 'Sold'
            : 'Active';
        return { ...p, status: nextStatus };
      }
      return p;
    });
    setProperties(updated);
    if (typeof id === 'string' && id.length === 24) {
      await propertyApi.toggleStatus(id);
    } else {
      localStorage.setItem('admin_properties', JSON.stringify(updated));
    }
  };

  // Simple Monthly Revenue Dataset for the Bar Chart
  const monthlyRevenue = [
    { month: 'Jan', value: 2.4, label: '$2.4M' },
    { month: 'Feb', value: 3.1, label: '$3.1M' },
    { month: 'Mar', value: 4.2, label: '$4.2M' },
    { month: 'Apr', value: 3.8, label: '$3.8M' },
    { month: 'May', value: 4.9, label: '$4.9M' },
    { month: 'Jun', value: 5.6, label: '$5.6M' },
    { month: 'Jul', value: 4.5, label: '$4.5M' },
    { month: 'Aug', value: 5.2, label: '$5.2M' },
    { month: 'Sep', value: 6.1, label: '$6.1M', isPeak: true },
    { month: 'Oct', value: 5.8, label: '$5.8M' },
    { month: 'Nov', value: 4.7, label: '$4.7M' },
    { month: 'Dec', value: 5.4, label: '$5.4M' },
  ];
  const maxBarValue = 7.0;

  return (
    <div
      className="space-y-8 max-w-7xl mx-auto transition-colors duration-200"
      style={{ color: isDark ? '#e8ddd4' : '#1a232c' }}
    >
      {/* Top Banner / Welcome Bar */}
      <div
        className="rounded-3xl p-6 sm:p-8 border shadow-xs relative overflow-hidden transition-all"
        style={{ backgroundColor: isDark ? '#1a232c' : '#ffffff', borderColor: isDark ? '#2d3d4e' : '#ede5da', color: isDark ? '#e8ddd4' : '#1a232c' }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs mb-1">
              <Sparkles size={14} className="text-brand animate-pulse" />
              <span>Real Estate Executive Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Platform Overview & Performance
            </h1>
            <p className={`text-xs sm:text-sm font-medium ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
              Monitor property valuations, client inquiry leads, and real-time revenue analytics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              style={{ backgroundColor: isDark ? '#243140' : '#f5f0eb', borderColor: isDark ? '#2d3d4e' : '#ede5da', border: '1px solid', color: isDark ? '#e8ddd4' : '#1a232c' }}
              title="Reset catalog to initial 12 luxury properties"
            >
              <RotateCcw size={15} />
              <span>Reset 12 Defaults</span>
            </button>
            <button
              onClick={() => navigate('/add-property')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border shadow-xs transition-all cursor-pointer bg-brand hover:bg-brand-dark text-white border-brand"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Add Property</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {dynamicStats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl p-5 border shadow-xs transition-all hover:shadow-md hover:brightness-105"
              style={{ backgroundColor: '#d9baa9', borderColor: '#cbb09f' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-black">
                  {s.title}
                </span>
                <div className="p-2.5 rounded-xl border shadow-2xs bg-black/10 text-black border-black/15 backdrop-blur-xs">
                  <Icon size={18} />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black">
                  {s.value}
                </div>
                <div className="mt-2 text-xs font-semibold text-black/80">
                  {s.subtext}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Bar Chart & Inquiries Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Simple Bar Chart (2 cols) */}
        <div
          className="lg:col-span-2 rounded-2xl border shadow-xs overflow-hidden flex flex-col transition-colors"
          style={{ backgroundColor: isDark ? '#1a232c' : '#ffffff', borderColor: isDark ? '#2d3d4e' : '#ede5da' }}
        >
          {/* Simple Header */}
          <div
            className="p-5 sm:p-6 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${isDark ? '#2d3d4e' : '#ede5da'}` }}
          >
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight" style={{ color: isDark ? '#e8ddd4' : '#1a232c' }}>
                    Revenue Overview
                  </h2>
                  <p className="text-xs font-medium mt-0.5" style={{ color: isDark ? '#a09484' : '#6b7280' }}>
                    Monthly sales & performance (Jan – Dec)
                  </p>
                </div>
              </div>
            </div>

            <div
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ backgroundColor: isDark ? '#243140' : '#f5f0eb', border: `1px solid ${isDark ? '#2d3d4e' : '#ede5da'}`, color: isDark ? '#e8ddd4' : '#1a232c' }}
            >
              Year 2026
            </div>
          </div>

          {/* Simple Bar Chart Canvas */}
          <div className="p-6 flex-1 flex flex-col justify-end">
            <div className="relative h-64 pt-6">
              {/* Horizontal Gridlines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7">
                {['$6M', '$4M', '$2M', '$0'].map((label, idx) => (
                  <div key={idx} className="flex items-center gap-3 w-full">
                    <span className="text-[11px] font-semibold w-8 text-right select-none" style={{ color: isDark ? '#7a6e66' : '#9ca3af' }}>
                      {label}
                    </span>
                    <div className="w-full border-b border-dashed" style={{ borderColor: isDark ? '#243140' : '#ede5da' }} />
                  </div>
                ))}
              </div>

              {/* Bars */}
              <div className="relative z-10 pl-9 sm:pl-11 pr-1 sm:pr-2 h-full flex items-end justify-between gap-1 sm:gap-2.5 md:gap-3">
                {monthlyRevenue.map((item, idx) => {
                  const heightPercent = Math.round((item.value / maxBarValue) * 100);
                  const isHovered = hoveredBar === idx;

                  return (
                    <div
                      key={item.month}
                      onMouseEnter={() => setHoveredBar(idx)}
                      onMouseLeave={() => setHoveredBar(null)}
                      className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                    >
                      {/* Hover Tooltip Value */}
                      <div className={`text-[8px] sm:text-[10px] font-bold mb-1 px-1 py-0.5 rounded transition-all whitespace-nowrap ${
                        isHovered
                          ? 'opacity-100 bg-brand text-white shadow-xs'
                          : item.isPeak
                          ? 'opacity-100 text-brand font-extrabold'
                          : 'opacity-0'
                      }`}>
                        {item.label}
                      </div>

                      {/* Bar Track & Fill */}
                      <div className="w-full max-w-[36px] h-full flex items-end">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-lg transition-all duration-300 ${
                            isHovered
                              ? 'bg-brand shadow-md shadow-brand/20'
                              : item.isPeak
                              ? isDark ? 'bg-amber-500' : 'bg-brand'
                              : isDark ? 'bg-[#2d3d4e] hover:bg-[#3a4f62]' : 'bg-[#1a232c] hover:bg-[#243140]'
                          }`}
                        />
                      </div>

                      {/* Month label */}
                      <span className={`text-[9px] sm:text-[11px] font-bold mt-2 transition-colors ${
                        isHovered
                          ? 'text-brand'
                          : isDark ? 'text-gray-400' : 'text-slate-600'
                      }`}>
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Simple Clean Footer */}
          <div
            className="px-6 py-3.5 flex items-center justify-between text-xs font-semibold"
            style={{ borderTop: `1px solid ${isDark ? '#2d3d4e' : '#ede5da'}`, color: isDark ? '#a09484' : '#6b7280' }}
          >
            <span>Total Annual Revenue: <strong style={{ color: isDark ? '#e8ddd4' : '#1a232c' }}>$55.7M</strong></span>
            <button
              onClick={() => navigate('/properties')}
              className="flex items-center gap-1 cursor-pointer transition-colors font-bold hover:text-brand"
              style={{ color: isDark ? '#e8ddd4' : '#1a232c' }}
            >
              View Properties Catalog →
            </button>
          </div>
        </div>

        {/* Live Inquiries & Portfolio Quick Stats (1 col) */}
        <div className="space-y-6">
          {/* Portfolio Status Summary */}
          <div className={`rounded-2xl p-5 border shadow-xs space-y-4 transition-colors ${
            isDark
              ? 'bg-black border-white'
              : 'bg-white border-slate-200'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${
              isDark ? 'border-white' : 'border-slate-200'
            }`}>
              <h3 className={`text-sm font-bold tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Portfolio Summary
              </h3>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                isDark
                  ? 'bg-emerald-950 text-emerald-300 border-white'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                Live
              </span>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-gray-400 font-medium' : 'text-slate-500 font-medium'}>
                  Active For Sale
                </span>
                <span className={`font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {properties.filter((p) => p.status === 'Active').length} properties
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-gray-400 font-medium' : 'text-slate-500 font-medium'}>
                  Pending Contracts
                </span>
                <span className="font-extrabold text-amber-500">
                  {properties.filter((p) => p.status === 'Pending').length} properties
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-gray-400 font-medium' : 'text-slate-500 font-medium'}>
                  Sold / Transacted
                </span>
                <span className="font-extrabold text-emerald-500">
                  {properties.filter((p) => p.status === 'Sold').length} properties
                </span>
              </div>
              <div className={`pt-2 border-t flex items-center justify-between ${
                isDark ? 'border-white/20' : 'border-slate-100'
              }`}>
                <span className={isDark ? 'text-gray-300 font-bold' : 'text-slate-700 font-bold'}>
                  Total Portfolio Asset
                </span>
                <span className="font-extrabold text-brand text-sm">{calculatePortfolioValue()}</span>
              </div>
            </div>
          </div>

          {/* Recent Inquiries Lead Box */}
          <div
            className="rounded-2xl border shadow-xs overflow-hidden flex flex-col transition-colors"
            style={{ backgroundColor: isDark ? '#1a232c' : '#ffffff', borderColor: isDark ? '#2d3d4e' : '#ede5da' }}
          >
            <div
              className="p-5 flex items-center justify-between"
              style={{ borderBottom: `1px solid ${isDark ? '#2d3d4e' : '#ede5da'}`, backgroundColor: isDark ? '#1a232c' : '#ffffff' }}
            >
              <div>
                <h2 className="text-sm font-bold tracking-tight" style={{ color: isDark ? '#e8ddd4' : '#1a232c' }}>
                  Recent Inquiries
                </h2>
                <p className="text-[11px] font-medium" style={{ color: isDark ? '#a09484' : '#6b7280' }}>
                  Buyer leads & tour bookings
                </p>
              </div>
              <button
                onClick={() => navigate('/inquiries')}
                className="text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors hover:text-brand"
                style={{ color: isDark ? '#e8ddd4' : '#1a232c' }}
              >
                View all <ArrowUpRight size={13} />
              </button>
            </div>

            <div className="p-5">
              {inquiries.length > 0 ? (
                <div className="space-y-3">
                  {inquiries.slice(0, 4).map((inq, idx) => (
                    <div
                      key={inq._id || inq.id || idx}
                      className="p-3.5 rounded-xl border transition-all space-y-1.5"
                      style={{ backgroundColor: isDark ? '#243140' : '#faf8f5', borderColor: isDark ? '#2d3d4e' : '#ede5da' }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs" style={{ color: isDark ? '#e8ddd4' : '#1a232c' }}>
                          {inq.client}
                        </span>
                        <span className="text-[10px] font-medium flex items-center gap-1" style={{ color: isDark ? '#a09484' : '#6b7280' }}>
                          <Clock size={11} /> {inq.date}
                        </span>
                      </div>
                      <div className="text-xs font-medium truncate" style={{ color: isDark ? '#c4b8ae' : '#4b5563' }}>
                        Interested in: <span className="font-bold" style={{ color: isDark ? '#e8ddd4' : '#1a232c' }}>{inq.property}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center flex flex-col items-center justify-center">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-2.5 shadow-2xs ${
                    isDark
                      ? 'bg-neutral-900 border-white text-gray-400'
                      : 'bg-slate-100 border-slate-200 text-slate-500'
                  }`}>
                    <Inbox size={20} />
                  </div>
                  <h4 className={`text-xs font-bold mb-1 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    No Inquiries Yet
                  </h4>
                  <p className={`text-[11px] max-w-xs ${
                    isDark ? 'text-gray-400' : 'text-slate-500'
                  }`}>
                    Buyer leads requesting property showings will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
