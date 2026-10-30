import React, { useState } from 'react';
import {
  Ticket,
  Plus,
  Copy,
  Check,
  Trash2,
  Inbox,
  Edit2,
  Calendar,
  Power,
  CheckCircle2,
  XCircle,
  X,
  Sparkles,
  Search,
  Filter,
  ShieldCheck,
  DollarSign,
  Gift,
  Building2,
  Tag,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const defaultRealEstateOffers = [
  {
    id: 1,
    code: 'LUXURY2026',
    title: 'Rs. 25,000 Off Booking Advance',
    discount: 'Rs. 25,000 OFF',
    discountType: 'flat',
    discountValue: 25000,
    category: 'Booking Advance',
    description: 'Instant token fee reduction on booking any verified residential villa or apartment.',
    usageCount: 34,
    expiry: 'Ongoing',
    status: 'Active'
  },
  {
    id: 2,
    code: 'STAMPFREE',
    title: '100% Legal & Stamp Duty Guidance Waiver',
    discount: 'Legal Fee Waived',
    discountType: 'waiver',
    discountValue: 15000,
    category: 'Legal & Title Waiver',
    description: 'Title clearance, legal search audit, and conveyancing documentation charges 100% free.',
    usageCount: 48,
    expiry: 'Ongoing',
    status: 'Active'
  },
  {
    id: 3,
    code: 'FIRSTTOUR',
    title: 'Complimentary VIP Chauffeur Tour',
    discount: 'VIP Chauffeur Tour',
    discountType: 'perk',
    discountValue: 5000,
    category: 'Site Visit Perk',
    description: 'Free luxury car pick & drop for customer site visits across prime locations.',
    usageCount: 82,
    expiry: '2026-12-31',
    status: 'Active'
  },
  {
    id: 4,
    code: 'MODULAR50',
    title: 'Rs. 50,000 Modular Kitchen Credit',
    discount: 'Rs. 50,000 Credit',
    discountType: 'credit',
    discountValue: 50000,
    category: 'Interior Fit-Out',
    description: 'Post-registration complimentary voucher for modular kitchen styling & Italian fittings.',
    usageCount: 16,
    expiry: '2026-12-31',
    status: 'Active'
  },
  {
    id: 5,
    code: 'FESTIVE5',
    title: '5% Festive Special Privilege Discount',
    discount: '5% OFF Token',
    discountType: 'percentage',
    discountValue: 5,
    category: 'Festive Special',
    description: 'Festive season direct 5% discount on the token advance payment.',
    usageCount: 22,
    expiry: 'Ongoing',
    status: 'Active'
  }
];

const PRESET_TEMPLATES = [
  {
    name: 'Token Advance Discount',
    code: 'TOKEN10K',
    title: 'Rs. 10,000 Flat Off Token Fee',
    discount: 'Rs. 10,000 OFF',
    discountType: 'flat',
    discountValue: 10000,
    category: 'Booking Advance',
    description: 'Flat Rs. 10,000 discount applied directly to token advance locking deposit.'
  },
  {
    name: 'Stamp Duty Subsidy',
    code: 'SUBSIDY2',
    title: '2% Stamp Duty Cashback Subsidy',
    discount: '2% Stamp Subsidy',
    discountType: 'waiver',
    discountValue: 20000,
    category: 'Legal & Title Waiver',
    description: 'Government stamp duty incentive refunded back upon final registry deed execution.'
  },
  {
    name: 'Smart Home Automation Voucher',
    code: 'SMARTHOME',
    title: 'Free IoT Home Automation Kit',
    discount: 'Free IoT Automation Kit',
    discountType: 'credit',
    discountValue: 35000,
    category: 'Interior Fit-Out',
    description: 'Smart switches, digital locks, and voice-assisted controls included with purchase.'
  }
];

const Coupons = () => {
  const { isDark } = useTheme();

  const [coupons, setCoupons] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_coupons');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    localStorage.setItem('admin_coupons', JSON.stringify(defaultRealEstateOffers));
    return defaultRealEstateOffers;
  });

  const [copiedId, setCopiedId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Form Fields
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [discount, setDiscount] = useState('');
  const [discountType, setDiscountType] = useState('flat');
  const [discountValue, setDiscountValue] = useState(25000);
  const [category, setCategory] = useState('Booking Advance');
  const [description, setDescription] = useState('');
  const [expiry, setExpiry] = useState('');
  const [status, setStatus] = useState('Active');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleCopy = (id, couponCode) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedId(id);
    showToast(`Code "${couponCode}" copied to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isDateExpired = (expDate) => {
    if (!expDate || expDate === 'Ongoing') return false;
    const exp = new Date(expDate);
    if (isNaN(exp.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return exp < today;
  };

  const resetForm = () => {
    setCode('');
    setTitle('');
    setDiscount('');
    setDiscountType('flat');
    setDiscountValue(25000);
    setCategory('Booking Advance');
    setDescription('');
    setExpiry('');
    setStatus('Active');
    setEditingId(null);
    setShowAdd(false);
  };

  const handleApplyTemplate = (tmpl) => {
    setCode(tmpl.code);
    setTitle(tmpl.title);
    setDiscount(tmpl.discount);
    setDiscountType(tmpl.discountType);
    setDiscountValue(tmpl.discountValue);
    setCategory(tmpl.category);
    setDescription(tmpl.description);
    setStatus('Active');
    setShowAdd(true);
    showToast(`Template "${tmpl.name}" loaded!`);
  };

  const handleStartEdit = (coupon) => {
    setEditingId(coupon.id);
    setCode(coupon.code || '');
    setTitle(coupon.title || '');
    setDiscount(coupon.discount || '');
    setDiscountType(coupon.discountType || 'flat');
    setDiscountValue(coupon.discountValue || 10000);
    setCategory(coupon.category || 'Booking Advance');
    setDescription(coupon.description || '');
    setExpiry(coupon.expiry && coupon.expiry !== 'Ongoing' ? coupon.expiry : '');
    setStatus(coupon.status || 'Active');
    setShowAdd(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim() || !discount.trim()) return;

    const formattedCode = code.trim().toUpperCase().replace(/\s+/g, '');
    const finalExpiry = expiry.trim() ? expiry.trim() : 'Ongoing';
    const computedStatus = isDateExpired(finalExpiry) ? 'Expired' : status;

    let updated;
    if (editingId) {
      updated = coupons.map((c) => {
        if (c.id === editingId) {
          return {
            ...c,
            code: formattedCode,
            title: title.trim() || formattedCode,
            discount: discount.trim(),
            discountType,
            discountValue: Number(discountValue) || 0,
            category,
            description: description.trim(),
            expiry: finalExpiry,
            status: computedStatus,
          };
        }
        return c;
      });
      showToast(`Offer "${formattedCode}" updated successfully!`);
    } else {
      const newOffer = {
        id: Date.now(),
        code: formattedCode,
        title: title.trim() || formattedCode,
        discount: discount.trim(),
        discountType,
        discountValue: Number(discountValue) || 0,
        category,
        description: description.trim() || 'Verified promotional incentive for luxury property buyers.',
        usageCount: 0,
        expiry: finalExpiry,
        status: computedStatus,
      };
      updated = [newOffer, ...coupons];
      showToast(`Offer "${formattedCode}" published & live on storefront!`);
    }

    setCoupons(updated);
    localStorage.setItem('admin_coupons', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    resetForm();
  };

  const handleToggleStatus = (id) => {
    const updated = coupons.map((c) => {
      if (c.id === id) {
        const nextStatus = c.status === 'Active' ? 'Expired' : 'Active';
        showToast(`Offer "${c.code}" marked as ${nextStatus}!`);
        return { ...c, status: nextStatus };
      }
      return c;
    });
    setCoupons(updated);
    localStorage.setItem('admin_coupons', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const handleDelete = (id) => {
    const toDelete = coupons.find((c) => c.id === id);
    if (!window.confirm(`Delete offer code "${toDelete?.code}"?`)) return;
    const updated = coupons.filter((c) => c.id !== id);
    setCoupons(updated);
    localStorage.setItem('admin_coupons', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    showToast(`Offer "${toDelete?.code || ''}" removed.`);
    if (editingId === id) resetForm();
  };

  const handleResetDefaults = () => {
    if (!window.confirm('Reset all offers back to standard real estate promotional defaults?')) return;
    setCoupons(defaultRealEstateOffers);
    localStorage.setItem('admin_coupons', JSON.stringify(defaultRealEstateOffers));
    window.dispatchEvent(new Event('storage'));
    showToast('Reset to default real estate offers successfully!');
  };

  // Filtered coupons
  const filteredCoupons = coupons.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.category || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === 'All' || c.category === filterCategory;
    const isExp = isDateExpired(c.expiry) || c.status === 'Expired';
    const matchesStatus =
      filterStatus === 'All'
        ? true
        : filterStatus === 'Active'
        ? !isExp
        : isExp;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className={`space-y-6 max-w-7xl mx-auto transition-colors duration-200 ${
      isDark ? 'bg-black text-white' : 'text-slate-900'
    }`}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 flex items-center gap-2.5 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-xs animate-bounce border border-emerald-400/40">
          <CheckCircle2 size={18} className="shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className={`text-2xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Offers & Coupon Codes
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Buyer Perks & Waivers
            </span>
          </div>
          <p className={`text-xs font-medium mt-1 ${
            isDark ? 'text-gray-400' : 'text-slate-500'
          }`}>
            Manage booking token fee discounts, stamp duty subsidies, VIP tour perks, and festive promos for buyers.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleResetDefaults}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isDark
                ? 'border-neutral-800 hover:bg-neutral-900 text-gray-300'
                : 'border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
            title="Reset to verified standard real estate offers"
          >
            <RotateCcw size={14} />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={() => {
              if (showAdd) {
                resetForm();
              } else {
                setShowAdd(true);
              }
            }}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border shadow-xs cursor-pointer transition-all ${
              isDark
                ? 'bg-white hover:bg-neutral-200 text-black border-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
            }`}
          >
            {showAdd ? <X size={16} /> : <Plus size={16} />}
            <span>{showAdd ? 'Close Form' : 'Create New Offer'}</span>
          </button>
        </div>
      </div>

      {/* Quick 1-Click Templates */}
      {!showAdd && (
        <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
          isDark ? 'bg-neutral-950/70 border-neutral-800' : 'bg-amber-50/50 border-amber-200/60'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Sparkles size={16} />
            </span>
            <div>
              <p className="text-xs font-bold">1-Click Real Estate Offer Templates</p>
              <p className="text-[11px] text-gray-500">Pick a pre-configured property perk to quickly launch an offer</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.code}
                onClick={() => handleApplyTemplate(tmpl)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isDark
                    ? 'bg-neutral-900 border-neutral-700 hover:border-amber-400 text-gray-200'
                    : 'bg-white border-amber-200 hover:border-amber-500 text-slate-800 shadow-2xs'
                }`}
              >
                <span>{tmpl.name}</span>
                <ArrowRight size={12} className="text-amber-500" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create / Edit Form */}
      {showAdd && (
        <form
          onSubmit={handleSubmit}
          className={`p-6 rounded-2xl border space-y-4 shadow-lg transition-colors ${
            isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-gray-700/20">
            <div className="flex items-center gap-2">
              <Ticket size={20} className="text-amber-500" />
              <h3 className="text-sm font-extrabold">
                {editingId ? `Edit Offer Code: ${code}` : 'Create New Real Estate Offer / Coupon'}
              </h3>
            </div>
            {editingId && (
              <span className="text-xs px-2.5 py-0.5 rounded-md font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                Editing Mode
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Promo Code */}
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Promo / Coupon Code *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. LUXURY2026"
                className={`w-full rounded-xl px-4 py-2.5 border text-xs font-mono font-bold uppercase transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-900 text-white border-neutral-700 focus:border-amber-500'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-amber-500'
                }`}
              />
            </div>

            {/* Offer Title */}
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Offer Title / Headline *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Rs. 25,000 Off Booking Advance"
                className={`w-full rounded-xl px-4 py-2.5 border text-xs font-bold transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-900 text-white border-neutral-700 focus:border-amber-500'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-amber-500'
                }`}
              />
            </div>

            {/* Badge Text */}
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Discount Badge Display *
              </label>
              <input
                type="text"
                required
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="e.g. Rs. 25,000 OFF or 100% Free"
                className={`w-full rounded-xl px-4 py-2.5 border text-xs font-bold transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-900 text-white border-neutral-700 focus:border-amber-500'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-amber-500'
                }`}
              />
            </div>

            {/* Category */}
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Offer Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full rounded-xl px-4 py-2.5 border text-xs font-bold transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-900 text-white border-neutral-700 focus:border-amber-500'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-amber-500'
                }`}
              >
                <option value="Booking Advance">🏷️ Booking Advance Discount</option>
                <option value="Legal & Title Waiver">📜 Legal & Title Audit Waiver</option>
                <option value="Site Visit Perk">🚗 Site Visit VIP Perk</option>
                <option value="Interior Fit-Out">🛋️ Interior & Modular Kitchen</option>
                <option value="Festive Special">🎆 Festive / Limited Event</option>
              </select>
            </div>

            {/* Discount Type */}
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Discount Calculation Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className={`w-full rounded-xl px-4 py-2.5 border text-xs font-bold transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-900 text-white border-neutral-700 focus:border-amber-500'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-amber-500'
                }`}
              >
                <option value="flat">Flat Amount (Deducted from Token / Total)</option>
                <option value="percentage">Percentage (%) Discount</option>
                <option value="waiver">Fee Waiver (Legal, Title, Registration)</option>
                <option value="credit">Store / Interior Credit</option>
                <option value="perk">Free Service / Perk</option>
              </select>
            </div>

            {/* Numeric Discount Value */}
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                {discountType === 'percentage' ? 'Percentage Value (%)' : 'Numeric Value in INR (Rs.)'}
              </label>
              <input
                type="number"
                min="0"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'percentage' ? '5' : '25000'}
                className={`w-full rounded-xl px-4 py-2.5 border text-xs font-bold transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-900 text-white border-neutral-700 focus:border-amber-500'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-amber-500'
                }`}
              />
            </div>

            {/* Expiry Date */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`block text-xs font-bold ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Expiry Date
                </label>
                {expiry && (
                  <button
                    type="button"
                    onClick={() => setExpiry('')}
                    className="text-[10px] text-amber-500 font-bold hover:underline cursor-pointer"
                  >
                    Set Ongoing
                  </button>
                )}
              </div>
              <input
                type="date"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full rounded-xl px-4 py-2.5 border text-xs font-medium transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-900 text-white border-neutral-700 focus:border-amber-500 [color-scheme:dark]'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-amber-500'
                }`}
              />
              <span className="text-[10px] text-gray-400 block mt-1">
                {expiry ? `Valid until: ${new Date(expiry).toLocaleDateString()}` : 'Leave empty for Ongoing'}
              </span>
            </div>

            {/* Status */}
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`w-full rounded-xl px-4 py-2.5 border text-xs font-bold transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-900 text-white border-neutral-700 focus:border-amber-500'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-amber-500'
                }`}
              >
                <option value="Active">🟢 Active (Live on Storefront)</option>
                <option value="Expired">🔴 Inactive / Expired</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
              Offer Description & Terms
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Valid on all Luxury Villas and Farmhouses. Auto-credited on checkout."
              className={`w-full rounded-xl px-4 py-2.5 border text-xs transition-all focus:outline-none ${
                isDark
                  ? 'bg-neutral-900 text-white border-neutral-700 focus:border-amber-500'
                  : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-amber-500'
              }`}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-700/20">
            <button
              type="button"
              onClick={resetForm}
              className={`px-4 py-2 rounded-xl font-bold text-xs border cursor-pointer transition-all ${
                isDark ? 'border-neutral-700 hover:bg-neutral-900 text-gray-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl font-extrabold text-xs bg-amber-500 hover:bg-amber-600 text-black border border-amber-400 shadow-md shadow-amber-500/20 cursor-pointer transition-all"
            >
              {editingId ? 'Update Offer' : 'Publish Offer'}
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-3 ${
        isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-slate-200'
      }`}>
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code, title, or description..."
            className={`w-full pl-10 pr-4 py-2 rounded-xl border text-xs font-medium focus:outline-none transition-all ${
              isDark
                ? 'bg-neutral-900 text-white border-neutral-800 focus:border-amber-500'
                : 'bg-slate-50 text-slate-900 border-slate-200 focus:border-amber-500 focus:bg-white'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none cursor-pointer ${
              isDark
                ? 'bg-neutral-900 text-white border-neutral-800'
                : 'bg-slate-50 text-slate-900 border-slate-200'
            }`}
          >
            <option value="All">All Categories</option>
            <option value="Booking Advance">Booking Advance</option>
            <option value="Legal & Title Waiver">Legal & Title Waiver</option>
            <option value="Site Visit Perk">Site Visit Perk</option>
            <option value="Interior Fit-Out">Interior Fit-Out</option>
            <option value="Festive Special">Festive Special</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none cursor-pointer ${
              isDark
                ? 'bg-neutral-900 text-white border-neutral-800'
                : 'bg-slate-50 text-slate-900 border-slate-200'
            }`}
          >
            <option value="All">All Status</option>
            <option value="Active">Active Only</option>
            <option value="Expired">Expired Only</option>
          </select>
        </div>
      </div>

      {/* Offers Grid */}
      {filteredCoupons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCoupons.map((c) => {
            const hasPassed = isDateExpired(c.expiry);
            const isEffectivelyExpired = c.status === 'Expired' || hasPassed;

            return (
              <div
                key={c.id}
                className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between space-y-4 transition-all relative overflow-hidden ${
                  editingId === c.id
                    ? 'ring-2 ring-amber-500'
                    : ''
                } ${
                  isDark
                    ? 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {/* Expired Watermark */}
                {isEffectivelyExpired && (
                  <div className="absolute -right-12 top-6 bg-red-600/90 text-white font-extrabold text-[9px] uppercase tracking-wider px-12 py-1 rotate-45 shadow-sm pointer-events-none z-10">
                    Expired
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <span className={`p-2.5 rounded-xl border shadow-2xs ${
                      isDark ? 'bg-neutral-900 border-neutral-700 text-amber-400' : 'bg-amber-50 border-amber-100 text-amber-600'
                    }`}>
                      <Ticket size={18} />
                    </span>

                    {/* Interactive Active / Expired Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(c.id)}
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                        isEffectivelyExpired
                          ? isDark
                            ? 'border-red-500/30 bg-red-950/60 text-red-400 hover:bg-red-900/60'
                            : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                          : isDark
                          ? 'border-emerald-500/30 bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900/60'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                      title="Click to Toggle Active / Expired"
                    >
                      <Power size={11} />
                      <span>{isEffectivelyExpired ? 'Expired' : 'Active'}</span>
                    </button>
                  </div>

                  {/* Promo Code & Quick Action Icons */}
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span className={`text-sm font-mono font-black tracking-wider px-3 py-1.5 rounded-xl border ${
                      isDark
                        ? 'text-white bg-neutral-900 border-neutral-700'
                        : 'text-slate-900 bg-slate-100 border-slate-200'
                    }`}>
                      {c.code}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Copy Button */}
                      <button
                        onClick={() => handleCopy(c.id, c.code)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer shadow-2xs ${
                          isDark
                            ? 'border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-gray-300'
                            : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                        }`}
                        title="Copy Code"
                      >
                        {copiedId === c.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleStartEdit(c)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer shadow-2xs ${
                          isDark
                            ? 'border-neutral-700 bg-neutral-900 hover:border-amber-500 text-amber-400 hover:bg-neutral-800'
                            : 'border-slate-200 bg-white hover:border-amber-500 text-amber-600 hover:bg-amber-50'
                        }`}
                        title="Edit Offer"
                      >
                        <Edit2 size={14} />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(c.id)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer shadow-2xs ${
                          isDark
                            ? 'border-neutral-700 bg-neutral-900 hover:border-red-500 text-red-400 hover:bg-neutral-800'
                            : 'border-slate-200 bg-white hover:border-red-500 text-red-500 hover:bg-red-50'
                        }`}
                        title="Delete Offer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Badge */}
                  <h4 className="font-extrabold text-sm mt-3 line-clamp-1">{c.title || c.code}</h4>

                  {/* Discount Value */}
                  <div className={`text-xl font-black mt-1 ${
                    isEffectivelyExpired ? 'text-gray-400 line-through' : 'text-amber-500'
                  }`}>
                    {c.discount}
                  </div>

                  <p className={`text-xs mt-2 font-medium line-clamp-2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    {c.description || `${c.category} incentive for verified property buyers.`}
                  </p>

                  <div className="mt-3 inline-block">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      {c.category || 'Special Offer'}
                    </span>
                  </div>
                </div>

                {/* Footer details */}
                <div className={`pt-3 border-t flex justify-between items-center text-xs font-semibold ${
                  isDark ? 'border-neutral-800 text-gray-400' : 'border-slate-100 text-slate-500'
                }`}>
                  <span>Used {c.usageCount || 0} times</span>
                  <span className={`flex items-center gap-1 ${
                    hasPassed ? 'text-red-400 font-bold' : ''
                  }`}>
                    <Calendar size={12} />
                    {c.expiry === 'Ongoing' || !c.expiry
                      ? 'Ongoing (No expiry)'
                      : hasPassed
                      ? `Expired (${c.expiry})`
                      : `Expires: ${c.expiry}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`py-16 px-6 text-center flex flex-col items-center justify-center border rounded-2xl shadow-xs transition-colors ${
          isDark ? 'border-neutral-800 bg-neutral-950 text-white' : 'border-slate-200 bg-white text-slate-900'
        }`}>
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-3 shadow-2xs ${
            isDark ? 'bg-neutral-900 border-neutral-700 text-gray-400' : 'bg-slate-100 border-slate-200 text-slate-500'
          }`}>
            <Ticket size={24} />
          </div>
          <h3 className="text-sm font-bold mb-1">
            No Offers Found
          </h3>
          <p className="text-xs max-w-sm text-gray-400 mb-4">
            No real estate coupon codes match your current search or filter criteria.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterCategory('All');
              setFilterStatus('All');
            }}
            className="text-xs font-bold text-amber-500 hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Coupons;
