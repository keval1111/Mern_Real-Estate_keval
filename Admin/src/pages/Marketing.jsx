import React, { useState, useMemo } from 'react';
import {
  Megaphone,
  Plus,
  Calendar,
  Inbox,
  Edit,
  Trash2,
  Users,
  MousePointerClick,
  Send,
  Check,
  X,
  Upload,
  Play,
  Pause,
  Tag,
  ExternalLink,
  Sparkles,
  RotateCcw,
  Image as ImageIcon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { uploadApi } from '../services/api';

const defaultCampaigns = [
  {
    id: 1,
    title: 'Monsoon Sea-Face Luxury Expo',
    type: 'Storefront Hero Banner',
    audience: 'HNI & Luxury Investors',
    discount: 'Zero Stamp Duty + 2% Gold Coin',
    targetLink: '/royal-house',
    status: 'Active',
    reach: '24,850',
    clicks: '1,840',
    leads: '142',
    date: 'Oct 15 - Nov 15, 2026',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    description: 'Promoting coastal villas and architectural royal homes with exclusive private viewing perks.'
  },
  {
    id: 2,
    title: 'NRI Global Investor Summit 2026',
    type: 'Email Newsletter Blast',
    audience: 'NRI & Overseas Clients',
    discount: 'VIP Virtual Concierge Access',
    targetLink: '/properties',
    status: 'Active',
    reach: '18,200',
    clicks: '980',
    leads: '86',
    date: 'Oct 20 - Dec 10, 2026',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    description: 'Targeted luxury apartment and penthouse email showcase broadcasted to verified global investors.'
  },
  {
    id: 3,
    title: 'Weekend Farm Villa Open-House Tour',
    type: 'WhatsApp & SMS Blast',
    audience: 'Verified Site Visitors',
    discount: 'Free Helicopter Pick-up',
    targetLink: '/farm-villa',
    status: 'Scheduled',
    reach: '6,400',
    clicks: '430',
    leads: '58',
    date: 'Nov 01 - Nov 05, 2026',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    description: 'Private invitation broadcast for weekend tours across expansive countryside farm estates.'
  },
  {
    id: 4,
    title: 'Early Bird Festival Deal',
    type: 'Social Ad Boost',
    audience: 'First-Time Home Buyers',
    discount: '$25,000 Interior Design Credit',
    targetLink: '/bestseller',
    status: 'Paused',
    reach: '32,100',
    clicks: '2,150',
    leads: '190',
    date: 'Sep 01 - Oct 01, 2026',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    description: 'Digital display campaign targeting urban luxury lofts and contemporary apartments.'
  }
];

const blankCampaignForm = {
  title: '',
  type: 'Storefront Hero Banner',
  audience: 'HNI & Luxury Investors',
  discount: '',
  targetLink: '/properties',
  status: 'Active',
  reach: '0',
  clicks: '0',
  leads: '0',
  date: 'Oct 2026 - Nov 2026',
  image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  description: ''
};

const Marketing = () => {
  const { isDark } = useTheme();

  const [campaigns, setCampaigns] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_campaigns');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    try {
      localStorage.setItem('admin_campaigns', JSON.stringify(defaultCampaigns));
    } catch {}
    return defaultCampaigns;
  });

  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [campaignForm, setCampaignForm] = useState(blankCampaignForm);
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const saveCampaignsToStorage = (updated) => {
    setCampaigns(updated);
    try {
      localStorage.setItem('admin_campaigns', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving campaigns:', e);
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const totalCampaigns = campaigns.length;
    const activeCount = campaigns.filter((c) => c.status === 'Active').length;
    let totalReach = 0;
    let totalClicks = 0;
    let totalLeads = 0;

    campaigns.forEach((c) => {
      totalReach += parseInt(String(c.reach || '0').replace(/[^0-9]/g, ''), 10) || 0;
      totalClicks += parseInt(String(c.clicks || '0').replace(/[^0-9]/g, ''), 10) || 0;
      totalLeads += parseInt(String(c.leads || '0').replace(/[^0-9]/g, ''), 10) || 0;
    });

    const avgCtr = totalReach > 0 ? ((totalClicks / totalReach) * 100).toFixed(1) : '0';

    return {
      totalCampaigns,
      activeCount,
      totalReach: totalReach.toLocaleString(),
      totalClicks: totalClicks.toLocaleString(),
      totalLeads: totalLeads.toLocaleString(),
      avgCtr: `${avgCtr}%`
    };
  }, [campaigns]);

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchSearch =
        (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.audience || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [campaigns, statusFilter, searchTerm]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingId(null);
    setCampaignForm(blankCampaignForm);
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (camp) => {
    setEditingId(camp.id);
    setCampaignForm({ ...camp });
    setModalOpen(true);
  };

  // Toggle Status
  const handleToggleStatus = (id) => {
    const updated = campaigns.map((c) => {
      if (c.id === id) {
        const next = c.status === 'Active' ? 'Paused' : 'Active';
        return { ...c, status: next };
      }
      return c;
    });
    saveCampaignsToStorage(updated);
    const target = updated.find((c) => c.id === id);
    triggerToast(`Campaign status changed to ${target?.status}`);
  };

  // Delete Campaign
  const handleDelete = (id) => {
    const target = campaigns.find((c) => c.id === id);
    if (window.confirm(`Are you sure you want to delete "${target?.title || 'this campaign'}"?`)) {
      const updated = campaigns.filter((c) => c.id !== id);
      saveCampaignsToStorage(updated);
      triggerToast('Campaign deleted successfully.');
    }
  };

  // Reset to default sample campaigns
  const handleResetDefaults = () => {
    if (window.confirm('Reset all marketing campaigns to default demonstration data?')) {
      saveCampaignsToStorage(defaultCampaigns);
      triggerToast('Marketing campaigns reset to demo data.');
    }
  };

  // Image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadApi.uploadImage(file);
      if (res && res.fileUrl) {
        setCampaignForm((prev) => ({ ...prev, image: res.fileUrl }));
        triggerToast('Banner image uploaded successfully!');
      }
    } catch (err) {
      console.warn('Upload fallback to mock image:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Save Modal Form
  const handleSaveCampaign = (e) => {
    e.preventDefault();
    if (!campaignForm.title.trim()) return;

    if (editingId) {
      // Edit
      const updated = campaigns.map((c) =>
        c.id === editingId ? { ...c, ...campaignForm } : c
      );
      saveCampaignsToStorage(updated);
      triggerToast(`Campaign "${campaignForm.title}" updated!`);
    } else {
      // Create
      const newCamp = {
        ...campaignForm,
        id: Date.now(),
        reach: '1,200',
        clicks: '94',
        leads: '8'
      };
      const updated = [newCamp, ...campaigns];
      saveCampaignsToStorage(updated);
      triggerToast(`New campaign "${campaignForm.title}" published!`);
    }
    setModalOpen(false);
  };

  return (
    <div className={`space-y-6 max-w-7xl mx-auto transition-colors duration-200 ${
      isDark ? 'bg-black text-white' : 'text-slate-900'
    }`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border bg-emerald-600 text-white border-emerald-500 animate-bounce text-xs font-semibold">
          <Check size={16} />
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
              Marketing & Promotions
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
              isDark
                ? 'bg-neutral-900 text-brand border-white'
                : 'bg-brand/10 text-brand border-brand/30'
            }`}>
              {metrics.activeCount} Active
            </span>
          </div>
          <p className={`text-xs font-medium mt-1 ${
            isDark ? 'text-gray-400' : 'text-slate-500'
          }`}>
            Manage homepage promotional banners, investor newsletters, and client outreach campaigns.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefaults}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer shadow-2xs ${
              isDark
                ? 'bg-black border-white hover:bg-neutral-900 text-white'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
            title="Reset sample campaigns"
          >
            <RotateCcw size={14} />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border shadow-xs cursor-pointer transition-all ${
              isDark
                ? 'bg-white hover:bg-neutral-200 text-black border-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
            }`}
          >
            <Plus size={16} /> Create Campaign
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reach */}
        <div className={`p-5 rounded-2xl border shadow-xs transition-all ${
          isDark ? 'bg-neutral-950 border-white' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`p-2.5 rounded-xl border shadow-2xs ${
              isDark ? 'bg-neutral-900 border-white text-white' : 'bg-blue-50 border-blue-200 text-blue-600'
            }`}>
              <Users size={18} />
            </span>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              +18.4% MoM
            </span>
          </div>
          <div className="mt-3">
            <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
              Audience Reach
            </p>
            <h3 className={`text-xl font-extrabold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {metrics.totalReach}
            </h3>
          </div>
        </div>

        {/* Clicks & CTR */}
        <div className={`p-5 rounded-2xl border shadow-xs transition-all ${
          isDark ? 'bg-neutral-950 border-white' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`p-2.5 rounded-xl border shadow-2xs ${
              isDark ? 'bg-neutral-900 border-white text-white' : 'bg-purple-50 border-purple-200 text-purple-600'
            }`}>
              <MousePointerClick size={18} />
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
              isDark ? 'border-neutral-700 text-gray-300' : 'border-slate-200 text-slate-600'
            }`}>
              {metrics.avgCtr} CTR
            </span>
          </div>
          <div className="mt-3">
            <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
              Total Interactions
            </p>
            <h3 className={`text-xl font-extrabold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {metrics.totalClicks}
            </h3>
          </div>
        </div>

        {/* Leads Generated */}
        <div className={`p-5 rounded-2xl border shadow-xs transition-all ${
          isDark ? 'bg-neutral-950 border-white' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`p-2.5 rounded-xl border shadow-2xs ${
              isDark ? 'bg-neutral-900 border-white text-white' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
            }`}>
              <Send size={18} />
            </span>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              High Intent
            </span>
          </div>
          <div className="mt-3">
            <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
              Buyer Leads Generated
            </p>
            <h3 className={`text-xl font-extrabold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {metrics.totalLeads}
            </h3>
          </div>
        </div>

        {/* Active Campaigns */}
        <div className={`p-5 rounded-2xl border shadow-xs transition-all ${
          isDark ? 'bg-neutral-950 border-white' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`p-2.5 rounded-xl border shadow-2xs ${
              isDark ? 'bg-neutral-900 border-white text-white' : 'bg-amber-50 border-amber-200 text-amber-600'
            }`}>
              <Megaphone size={18} />
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
              isDark ? 'border-neutral-700 text-gray-300' : 'border-slate-200 text-slate-600'
            }`}>
              {metrics.totalCampaigns} Total
            </span>
          </div>
          <div className="mt-3">
            <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
              Active Channels
            </p>
            <h3 className={`text-xl font-extrabold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {metrics.activeCount} Running
            </h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={`p-4 rounded-2xl border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
        isDark ? 'bg-black border-white' : 'bg-white border-slate-200'
      }`}>
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search campaigns by title, channel, or audience..."
            className={`w-full px-4 py-2 rounded-xl text-xs font-medium border transition-all focus:outline-none ${
              isDark
                ? 'bg-neutral-950 text-white placeholder-gray-500 border-white focus:border-brand'
                : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-brand'
            }`}
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {['All', 'Active', 'Scheduled', 'Paused'].map((tab) => {
            const count =
              tab === 'All'
                ? campaigns.length
                : campaigns.filter((c) => c.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                  statusFilter === tab
                    ? isDark
                      ? 'bg-white text-black border-white'
                      : 'bg-slate-900 text-white border-slate-900'
                    : isDark
                    ? 'bg-black text-gray-300 border-white hover:bg-neutral-900'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Campaigns Grid */}
      {filteredCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCampaigns.map((camp) => (
            <div
              key={camp.id}
              className={`rounded-2xl border shadow-xs overflow-hidden flex flex-col justify-between transition-all hover:shadow-lg ${
                isDark
                  ? 'bg-neutral-950 border-white hover:border-brand'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Campaign Banner Header Image */}
              <div className="relative h-44 w-full bg-neutral-900 overflow-hidden">
                <img
                  src={camp.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
                  alt={camp.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shadow-xs ${
                    camp.status === 'Active'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-400'
                      : camp.status === 'Scheduled'
                      ? 'bg-amber-950 text-amber-300 border-amber-400'
                      : 'bg-neutral-900 text-gray-300 border-neutral-600'
                  }`}>
                    {camp.status}
                  </span>
                </div>

                {/* Type Badge */}
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold bg-black/75 backdrop-blur-xs text-white border border-white/20">
                    {camp.type}
                  </span>
                </div>
              </div>

              {/* Campaign Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className={`text-base font-bold leading-snug line-clamp-1 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {camp.title}
                  </h3>
                  <p className={`text-xs mt-1 line-clamp-2 ${
                    isDark ? 'text-gray-400' : 'text-slate-500'
                  }`}>
                    {camp.description || 'Promoting curated real estate catalog portfolio.'}
                  </p>

                  {/* Discount / Tag */}
                  {camp.discount && (
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30">
                      <Tag size={12} className="shrink-0" />
                      <span className="truncate">{camp.discount}</span>
                    </div>
                  )}

                  {/* Target Audience & Target Link */}
                  <div className={`mt-3 pt-3 border-t text-xs space-y-1.5 ${
                    isDark ? 'border-neutral-900' : 'border-slate-100'
                  }`}>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className={isDark ? 'text-gray-400' : 'text-slate-400'}>Target Audience:</span>
                      <span className={`font-semibold ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>
                        {camp.audience}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className={isDark ? 'text-gray-400' : 'text-slate-400'}>Destination:</span>
                      <code className={`font-mono ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                        {camp.targetLink || '/properties'}
                      </code>
                    </div>
                  </div>
                </div>

                {/* Metrics Footer */}
                <div className={`pt-3 border-t grid grid-cols-3 gap-2 text-center text-xs ${
                  isDark ? 'border-neutral-900 bg-neutral-900/40' : 'border-slate-100 bg-slate-50/70'
                } -mx-5 -mb-5 p-4 rounded-b-2xl`}>
                  <div>
                    <span className={`block text-[10px] font-bold uppercase ${
                      isDark ? 'text-gray-400' : 'text-slate-400'
                    }`}>
                      Reach
                    </span>
                    <span className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {camp.reach}
                    </span>
                  </div>
                  <div>
                    <span className={`block text-[10px] font-bold uppercase ${
                      isDark ? 'text-gray-400' : 'text-slate-400'
                    }`}>
                      Clicks
                    </span>
                    <span className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {camp.clicks}
                    </span>
                  </div>
                  <div>
                    <span className={`block text-[10px] font-bold uppercase ${
                      isDark ? 'text-gray-400' : 'text-slate-400'
                    }`}>
                      Leads
                    </span>
                    <span className="font-extrabold text-sm text-emerald-500">
                      {camp.leads}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className={`px-5 py-3 border-t flex items-center justify-between text-xs ${
                isDark ? 'border-neutral-900 bg-neutral-950' : 'border-slate-100 bg-white'
              }`}>
                <span className={`flex items-center gap-1.5 text-[11px] ${
                  isDark ? 'text-gray-400' : 'text-slate-500'
                }`}>
                  <Calendar size={12} />
                  <span>{camp.date}</span>
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Status Toggle Button */}
                  <button
                    onClick={() => handleToggleStatus(camp.id)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer shadow-2xs ${
                      camp.status === 'Active'
                        ? isDark
                          ? 'bg-amber-950/40 text-amber-300 border-amber-800 hover:bg-amber-900/60'
                          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        : isDark
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800 hover:bg-emerald-900/60'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    }`}
                    title={camp.status === 'Active' ? 'Pause Campaign' : 'Activate Campaign'}
                  >
                    {camp.status === 'Active' ? <Pause size={13} /> : <Play size={13} />}
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => handleOpenEdit(camp)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer shadow-2xs ${
                      isDark
                        ? 'bg-neutral-900 border-neutral-700 text-blue-400 hover:text-blue-300 hover:bg-neutral-800'
                        : 'bg-white border-slate-200 text-blue-600 hover:bg-blue-50'
                    }`}
                    title="Edit Campaign"
                  >
                    <Edit size={13} />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(camp.id)}
                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 border border-red-200 dark:border-red-900/50 transition-colors cursor-pointer shadow-2xs"
                    title="Delete Campaign"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`py-16 px-6 text-center flex flex-col items-center justify-center border rounded-2xl shadow-xs transition-colors ${
          isDark ? 'border-white bg-black' : 'border-slate-200 bg-white'
        }`}>
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-3 shadow-2xs ${
            isDark ? 'bg-neutral-900 border-white text-gray-400' : 'bg-slate-100 border-slate-200 text-slate-500'
          }`}>
            <Inbox size={24} />
          </div>
          <h3 className={`text-sm font-bold mb-1 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            No Campaigns Found
          </h3>
          <p className={`text-xs max-w-sm mb-4 ${
            isDark ? 'text-gray-400' : 'text-slate-500'
          }`}>
            No campaigns match your selected filter criteria. Create a new campaign or reset demo data.
          </p>
          <button
            onClick={handleOpenCreate}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border shadow-xs cursor-pointer transition-all ${
              isDark
                ? 'bg-white hover:bg-neutral-200 text-black border-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
            }`}
          >
            <Plus size={15} /> Create Campaign
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* CREATE / EDIT CAMPAIGN MODAL */}
      {/* ======================================================== */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div
            className={`rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border space-y-5 my-auto max-h-[92vh] flex flex-col transition-all ${
              isDark ? 'bg-neutral-950 border-white text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-xs ${
                    isDark ? 'bg-neutral-900 border-white text-white' : 'bg-brand/10 border-brand/20 text-brand'
                  }`}
                >
                  <Megaphone size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-snug">
                    {editingId ? 'Edit Marketing Campaign' : 'Create New Campaign'}
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    Configure promotional banners, target channels, and buyer offers.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className={`p-1.5 rounded-full cursor-pointer transition-colors ${
                  isDark
                    ? 'hover:bg-neutral-800 text-gray-400 hover:text-white'
                    : 'hover:bg-slate-100 text-slate-500'
                }`}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveCampaign} className="flex flex-col flex-1 min-h-0">
              <div className="space-y-4 overflow-y-auto pr-2 max-h-[58vh] flex-1">
                {/* Campaign Title */}
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                    Campaign Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={campaignForm.title}
                    onChange={(e) => setCampaignForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Diwali Luxury Penthouse Showcase"
                    className={`w-full text-xs font-medium rounded-xl px-4 py-2.5 border transition-all focus:outline-none ${
                      isDark
                        ? 'bg-neutral-900 text-white placeholder-gray-500 border-neutral-700 focus:border-white'
                        : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-slate-900'
                    }`}
                  />
                </div>

                {/* 2-Column: Channel Type & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      Marketing Channel <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={campaignForm.type}
                      onChange={(e) => setCampaignForm((prev) => ({ ...prev, type: e.target.value }))}
                      className={`w-full text-xs font-medium rounded-xl px-4 py-2.5 border cursor-pointer focus:outline-none ${
                        isDark
                          ? 'bg-neutral-900 text-white border-neutral-700 focus:border-white'
                          : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-slate-900'
                      }`}
                    >
                      <option value="Storefront Hero Banner">Storefront Hero Banner</option>
                      <option value="Email Newsletter Blast">Email Newsletter Blast</option>
                      <option value="WhatsApp & SMS Blast">WhatsApp & SMS Blast</option>
                      <option value="Social Ad Boost">Social Ad Boost</option>
                      <option value="Featured Property Sponsor">Featured Property Sponsor</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      Campaign Status
                    </label>
                    <select
                      value={campaignForm.status}
                      onChange={(e) => setCampaignForm((prev) => ({ ...prev, status: e.target.value }))}
                      className={`w-full text-xs font-medium rounded-xl px-4 py-2.5 border cursor-pointer focus:outline-none ${
                        isDark
                          ? 'bg-neutral-900 text-white border-neutral-700 focus:border-white'
                          : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-slate-900'
                      }`}
                    >
                      <option value="Active">Active</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Paused">Paused</option>
                    </select>
                  </div>
                </div>

                {/* 2-Column: Target Audience & Promotion / Offer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      Target Audience
                    </label>
                    <input
                      type="text"
                      value={campaignForm.audience}
                      onChange={(e) => setCampaignForm((prev) => ({ ...prev, audience: e.target.value }))}
                      placeholder="e.g. HNI Buyers, NRI Investors"
                      className={`w-full text-xs font-medium rounded-xl px-4 py-2.5 border transition-all focus:outline-none ${
                        isDark
                          ? 'bg-neutral-900 text-white placeholder-gray-500 border-neutral-700 focus:border-white'
                          : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      Special Offer / Perk Tag
                    </label>
                    <input
                      type="text"
                      value={campaignForm.discount}
                      onChange={(e) => setCampaignForm((prev) => ({ ...prev, discount: e.target.value }))}
                      placeholder="e.g. Zero Brokerage, Free Interior Credit"
                      className={`w-full text-xs font-medium rounded-xl px-4 py-2.5 border transition-all focus:outline-none ${
                        isDark
                          ? 'bg-neutral-900 text-white placeholder-gray-500 border-neutral-700 focus:border-white'
                          : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-slate-900'
                      }`}
                    />
                  </div>
                </div>

                {/* 2-Column: Destination Link & Schedule Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      Destination Link
                    </label>
                    <input
                      type="text"
                      value={campaignForm.targetLink}
                      onChange={(e) => setCampaignForm((prev) => ({ ...prev, targetLink: e.target.value }))}
                      placeholder="e.g. /royal-house, /properties"
                      className={`w-full text-xs font-medium rounded-xl px-4 py-2.5 border transition-all focus:outline-none ${
                        isDark
                          ? 'bg-neutral-900 text-white placeholder-gray-500 border-neutral-700 focus:border-white'
                          : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      Duration / Dates
                    </label>
                    <input
                      type="text"
                      value={campaignForm.date}
                      onChange={(e) => setCampaignForm((prev) => ({ ...prev, date: e.target.value }))}
                      placeholder="e.g. Oct 20 - Dec 15, 2026"
                      className={`w-full text-xs font-medium rounded-xl px-4 py-2.5 border transition-all focus:outline-none ${
                        isDark
                          ? 'bg-neutral-900 text-white placeholder-gray-500 border-neutral-700 focus:border-white'
                          : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-slate-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Banner Image */}
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                    Banner Image
                  </label>
                  <div className="flex items-center gap-3">
                    <img
                      src={campaignForm.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80'}
                      alt="Banner Preview"
                      className={`w-16 h-14 rounded-xl object-cover border shadow-2xs shrink-0 ${
                        isDark ? 'border-neutral-700' : 'border-slate-200'
                      }`}
                    />
                    <div className="flex-1 space-y-2">
                      <input
                        type="url"
                        value={campaignForm.image}
                        onChange={(e) => setCampaignForm((prev) => ({ ...prev, image: e.target.value }))}
                        placeholder="Paste image URL..."
                        className={`w-full text-xs font-medium rounded-xl px-3.5 py-2 border transition-all focus:outline-none ${
                          isDark
                            ? 'bg-neutral-900 text-white placeholder-gray-500 border-neutral-700 focus:border-white'
                            : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-slate-900'
                        }`}
                      />
                      <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        isDark
                          ? 'bg-neutral-900 border-neutral-700 text-gray-300 hover:bg-neutral-800'
                          : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                      }`}>
                        <Upload size={12} />
                        <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={isUploading}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                    Campaign Notes & Description
                  </label>
                  <textarea
                    rows={2}
                    value={campaignForm.description}
                    onChange={(e) => setCampaignForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Short summary of this promotion's goals and target audience..."
                    className={`w-full text-xs font-medium rounded-xl px-4 py-2.5 border transition-all resize-none focus:outline-none ${
                      isDark
                        ? 'bg-neutral-900 text-white placeholder-gray-500 border-neutral-700 focus:border-white'
                        : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Modal Footer (Sticky) */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10 shrink-0 mt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    isDark
                      ? 'border-neutral-700 text-gray-300 hover:bg-neutral-900'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border shadow-xs transition-all cursor-pointer ${
                    isDark
                      ? 'bg-white text-black hover:bg-neutral-200 border-white'
                      : 'bg-slate-900 text-white hover:bg-slate-800 border-slate-900'
                  }`}
                >
                  <Check size={15} />
                  <span>{editingId ? 'Save Changes' : 'Launch Campaign'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketing;
