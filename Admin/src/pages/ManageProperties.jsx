import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Trash2,
  Edit,
  RotateCcw,
  CheckCircle2,
  Building2,
  MapPin,
  X,
  Check,
  Upload,
  ExternalLink,
  ImagePlus,
  Loader2,
  ShieldAlert,
  Clock,
  Lock,
  Shield
} from 'lucide-react';
import { defaultProperties, getInitialProperties } from '../data/defaultProperties';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { propertyApi, uploadApi } from '../services/api';

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80';

const resolveImageUrl = (img) => {
  if (!img || typeof img !== 'string') return DEFAULT_FALLBACK_IMAGE;
  const trimmed = img.trim();
  if (!trimmed) return DEFAULT_FALLBACK_IMAGE;
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `http://localhost:5000${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
};

const ManageProperties = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user } = useAuth();

  const [properties, setProperties] = useState(() => getInitialProperties());
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Edit Modal State
  const [editingProperty, setEditingProperty] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  useEffect(() => {
    propertyApi.getAll().then((data) => {
      if (data && data.length > 0) setProperties(data);
    });
  }, []);

  const categories = useMemo(() => {
    try {
      const saved = localStorage.getItem('admin_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return ['All', ...parsed.map((c) => c.name)];
        }
      }
    } catch {}
    return ['All', 'Royal House', 'Farm Villa', 'Properties', 'Bestseller'];
  }, []);

  const availableCategories = useMemo(() => {
    return categories.filter((c) => c !== 'All');
  }, [categories]);

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.location || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id) => {
    const target = properties.find((p) => (p._id || p.id) === id);
    const title = target?.title || 'this listing';
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      const updated = properties.filter((p) => (p._id || p.id) !== id);
      setProperties(updated);
      if (typeof id === 'string' && id.length === 24) {
        await propertyApi.delete(id);
      } else {
        localStorage.setItem('admin_properties', JSON.stringify(updated));
      }
      triggerToast(`Property "${title}" deleted.`);
    }
  };

  const handleResetDefaults = async () => {
    if (window.confirm('Reset catalog back to the 12 default real estate listings?')) {
      const data = await propertyApi.resetDefaults();
      setProperties(data);
      triggerToast('Catalog reset to 12 default properties.');
    }
  };

  const toggleStatus = async (id) => {
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

  // Start editing a property
  const handleStartEdit = (p) => {
    setEditingProperty(p);
    setUploadError('');
    setEditForm({
      id: p._id || p.id,
      title: p.title || '',
      category: p.category || availableCategories[0] || 'Royal House',
      price: p.price || '',
      status: p.status || 'Active',
      location: p.location || '',
      city: p.city || '',
      beds: p.beds ?? p.bedrooms ?? 3,
      baths: p.baths ?? p.bathrooms ?? 2,
      sqft: p.sqft || '',
      totalUnits: p.totalUnits ?? 1,
      availableUnits: p.availableUnits ?? p.totalUnits ?? 1,
      yearBuilt: p.yearBuilt || '2024',
      featured: Boolean(p.featured),
      image: p.image || p.imageUrl || '',
      description: p.description || ''
    });
  };

  // Handle image upload inside edit modal
  const handleEditImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');
    try {
      const res = await uploadApi.uploadImage(file);
      if (res && res.fileUrl) {
        setEditForm((prev) => ({ ...prev, image: res.fileUrl }));
      }
    } catch (err) {
      console.error('File upload failed:', err);
      setUploadError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Save changes from edit modal
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm || !editingProperty) return;

    const pId = editingProperty._id || editingProperty.id;
    const formattedPrice = editForm.price.startsWith('$') ? editForm.price : `$${editForm.price}`;

    const payload = {
      ...editingProperty,
      ...editForm,
      price: formattedPrice,
      totalUnits: Math.max(1, parseInt(editForm.totalUnits, 10) || 1),
      availableUnits:
        editForm.availableUnits !== '' && editForm.availableUnits !== null
          ? Math.max(0, parseInt(editForm.availableUnits, 10))
          : Math.max(1, parseInt(editForm.totalUnits, 10) || 1),
      beds: Number(editForm.beds) || 3,
      baths: Number(editForm.baths) || 2,
      sqft: editForm.sqft || '1,500'
    };

    try {
      await propertyApi.update(pId, payload);
      // Update local state
      setProperties((prev) =>
        prev.map((item) => ((item._id || item.id) === pId ? { ...item, ...payload } : item))
      );
      triggerToast(`Property "${editForm.title}" updated successfully!`);
      setEditingProperty(null);
    } catch (err) {
      console.error('Error saving property edit:', err);
      triggerToast('Error saving changes. Please try again.');
    }
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

      {/* KYC RBAC Restriction Banner for Sub-Admins */}
      {user?.role === 'Sub-Admin' && user?.kycStatus !== 'Approved' && (
        <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm ${
          user?.kycStatus === 'Pending'
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
            : user?.kycStatus === 'Rejected'
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
            : 'bg-brand/10 border-brand/30 text-brand'
        }`}>
          <div className="flex items-center gap-3">
            {user?.kycStatus === 'Pending' ? (
              <Clock size={22} className="shrink-0 text-amber-500" />
            ) : (
              <ShieldAlert size={22} className="shrink-0" />
            )}
            <div>
              <div className="text-xs font-black">
                {user?.kycStatus === 'Pending'
                  ? 'KYC Verification Under Review by Super Admin'
                  : user?.kycStatus === 'Rejected'
                  ? 'KYC Verification Rejected by Super Admin'
                  : 'KYC Verification Required to Add Properties'}
              </div>
              <div className={`text-[11px] mt-0.5 ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                {user?.kycStatus === 'Pending'
                  ? 'Your KYC credentials are being reviewed. Property creation is locked until Super Admin approves.'
                  : user?.kycStatus === 'Rejected'
                  ? `Reason: ${user?.kycDetails?.rejectionReason || 'Please review and re-submit your KYC credentials.'}`
                  : 'As an authorized Sub-Admin, you must complete your identity & bank verification to unlock property listings.'}
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/kyc-verification')}
            className={`px-4 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer whitespace-nowrap self-start sm:self-auto ${
              user?.kycStatus === 'Pending'
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : user?.kycStatus === 'Rejected'
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-brand hover:bg-brand-dark text-white'
            }`}
          >
            {user?.kycStatus === 'Pending' ? 'View KYC Status' : 'Complete KYC Verification'}
          </button>
        </div>
      )}

      {/* Sub-Admin Role & Ownership Scope Banner */}
      {user?.role === 'Sub-Admin' && (
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs transition-all ${
          user?.accessPermissions?.canViewAllProperties
            ? isDark
              ? 'bg-blue-950/30 border-blue-800/60 text-blue-300'
              : 'bg-blue-50/80 border-blue-200 text-blue-900'
            : isDark
            ? 'bg-purple-950/30 border-purple-800/60 text-purple-300'
            : 'bg-purple-50/80 border-purple-200 text-purple-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
              user?.accessPermissions?.canViewAllProperties
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
            }`}>
              <Shield size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold uppercase tracking-wider text-[11px]">
                  {user?.accessPermissions?.canViewAllProperties
                    ? 'Extended Permission: All Properties View'
                    : 'Ownership Scoped: Self-Added Properties Only'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                  user?.accessPermissions?.canViewAllProperties
                    ? 'bg-blue-500/20 text-blue-400 border-blue-400/40'
                    : 'bg-purple-500/20 text-purple-400 border-purple-400/40'
                }`}>
                  {user?.accessPermissions?.canViewAllProperties ? 'Super Admin Granted' : 'Default RBAC'}
                </span>
              </div>
              <p className="text-[11px] opacity-85 mt-0.5 font-medium leading-relaxed">
                {user?.accessPermissions?.canViewAllProperties
                  ? 'Super Admin has granted you elevated permission to view all properties across the platform.'
                  : 'By default, you can only see and manage properties listed by yourself. Properties added by other Sub-Admins remain hidden.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className={`text-2xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Manage Properties
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
              isDark
                ? 'bg-neutral-900 text-brand border-white'
                : 'bg-brand/10 text-brand border-brand/30'
            }`}>
              {properties.length} Properties
            </span>
          </div>
          <p className={`text-xs font-medium mt-0.5 ${
            isDark ? 'text-gray-400' : 'text-slate-500'
          }`}>
            View, edit, toggle availability, or add new real estate listings.
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
            title="Reset to 12 default properties"
          >
            <RotateCcw size={14} />
            <span>Reset 12 Properties</span>
          </button>

          <button
            onClick={() => {
              if (user?.role === 'Sub-Admin' && user?.kycStatus !== 'Approved') {
                alert(
                  `KYC Verification Required: Your current KYC status is "${user?.kycStatus || 'Not Submitted'}". Super Admin approval is required before you can add properties.`
                );
                navigate('/kyc-verification');
                return;
              }
              navigate('/add-property');
            }}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border shadow-xs cursor-pointer transition-all ${
              isDark
                ? 'bg-white hover:bg-neutral-200 text-black border-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
            }`}
          >
            <Plus size={16} /> Add New Property
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={`p-4 rounded-2xl border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
        isDark ? 'bg-black border-white' : 'bg-white border-slate-200'
      }`}>
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className={`absolute left-3.5 top-3 ${
            isDark ? 'text-gray-400' : 'text-slate-400'
          }`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or city..."
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs font-medium border transition-all focus:outline-none ${
              isDark
                ? 'bg-neutral-950 text-white placeholder-gray-500 border-white focus:border-brand'
                : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-brand'
            }`}
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                selectedCategory === cat
                  ? isDark
                    ? 'bg-white text-black border-white'
                    : 'bg-slate-900 text-white border-slate-900'
                  : isDark
                  ? 'bg-black text-gray-300 border-white hover:bg-neutral-900'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Properties Table */}
      <div className={`rounded-2xl border shadow-xs overflow-hidden transition-colors ${
        isDark ? 'bg-black border-white' : 'bg-white border-slate-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b font-extrabold tracking-wider uppercase text-[10px] ${
                isDark
                  ? 'border-neutral-800 bg-neutral-950 text-gray-400'
                  : 'border-slate-100 bg-slate-50/75 text-slate-500'
              }`}>
                <th className="py-3.5 px-5">Listing</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Specs</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Available Units</th>
                <th className="py-3.5 px-4">Status (Click to toggle)</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-neutral-900' : 'divide-slate-100'}`}>
              {filteredProperties.length > 0 ? (
                filteredProperties.map((p) => (
                  <tr
                    key={p._id || p.id}
                    className={`transition-colors ${
                      isDark ? 'hover:bg-neutral-950' : 'hover:bg-slate-50/50'
                    }`}
                  >
                    {/* Listing Info */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={resolveImageUrl(p.image || p.imageUrl)}
                          alt={p.title}
                          onError={(e) => {
                            if (e.currentTarget.src !== DEFAULT_FALLBACK_IMAGE) {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                            }
                          }}
                          className={`w-12 h-12 rounded-xl object-cover border shadow-2xs shrink-0 ${
                            isDark ? 'border-neutral-800' : 'border-slate-200'
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`font-bold text-sm truncate max-w-xs ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}>
                              {p.title}
                            </span>
                            {p.featured && (
                              <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                Featured
                              </span>
                            )}
                          </div>
                          <div className={`flex items-center gap-1 text-[11px] mt-0.5 ${
                            isDark ? 'text-gray-400' : 'text-slate-500'
                          }`}>
                            <MapPin size={11} className="shrink-0" />
                            <span className="truncate max-w-xs">{p.location || 'Location Not Specified'}</span>
                          </div>
                          {/* Owner / Creator Badge */}
                          {(p.createdByName || p.creatorRole || p.createdBy) && (
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border inline-flex items-center gap-1 ${
                                p.createdBy && String(p.createdBy) === String(user?._id || user?.id)
                                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                  : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  p.createdBy && String(p.createdBy) === String(user?._id || user?.id)
                                    ? 'bg-emerald-500'
                                    : 'bg-purple-400'
                                }`} />
                                {p.createdBy && String(p.createdBy) === String(user?._id || user?.id)
                                  ? 'Listed by You (Owner)'
                                  : `Listed by: ${p.createdByName || p.createdByEmail || p.creatorRole || 'Staff'}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 font-semibold whitespace-nowrap">
                      <span className={`inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-lg border text-[11px] ${
                        isDark
                          ? 'bg-neutral-900 border-neutral-800 text-gray-300'
                          : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}>
                        {p.category || 'Properties'}
                      </span>
                    </td>

                    {/* Specs */}
                    <td className={`py-4 px-4 text-[11px] font-medium whitespace-nowrap ${
                      isDark ? 'text-gray-300' : 'text-slate-600'
                    }`}>
                      {p.beds || p.bedrooms || 3} Beds • {p.baths || p.bathrooms || 2} Baths • {p.sqft || '1,500'} sqft
                    </td>

                    {/* Price */}
                    <td className={`py-4 px-4 font-extrabold text-sm whitespace-nowrap ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {p.price}
                    </td>

                    {/* Available Units */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-black text-[11px] border w-fit ${
                          (p.availableUnits ?? p.totalUnits ?? 1) > 0
                            ? isDark
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isDark
                            ? 'bg-rose-950/60 text-rose-300 border-rose-800/50'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            (p.availableUnits ?? p.totalUnits ?? 1) > 0 ? 'bg-emerald-400' : 'bg-rose-500'
                          }`} />
                          {p.availableUnits ?? p.totalUnits ?? 1} / {p.totalUnits ?? 1} Units
                        </span>
                        {(p.availableUnits ?? p.totalUnits ?? 1) === 0 && (
                          <span className="text-[10px] text-rose-500 font-bold tracking-tight">Sold Out</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleStatus(p._id || p.id)}
                        className={`inline-flex items-center whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border transition-all cursor-pointer ${
                          p.status === 'Active'
                            ? isDark
                              ? 'bg-emerald-950 text-emerald-300 border-white hover:bg-emerald-900'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : p.status === 'Pending'
                            ? isDark
                              ? 'bg-amber-950 text-amber-300 border-white hover:bg-amber-900'
                              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            : isDark
                            ? 'bg-neutral-900 text-gray-300 border-white hover:bg-neutral-800'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {p.status}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      {(() => {
                        const isOwner = !p.createdBy || String(p.createdBy) === String(user?._id || user?.id);
                        const canManage = user?.role === 'Super Admin' || user?.accessPermissions?.canManageAllProperties || isOwner;

                        if (!canManage) {
                          return (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-400 italic bg-gray-500/10 px-2 py-1 rounded-lg border border-gray-500/20">
                              <Lock size={11} /> View Only
                            </span>
                          );
                        }

                        return (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleStartEdit(p)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer shadow-2xs ${
                                isDark
                                  ? 'bg-black border-white hover:bg-white hover:text-black text-white'
                                  : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                              }`}
                              title="Edit Property"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(p._id || p.id)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer shadow-2xs"
                              title="Delete Property"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className={`py-12 text-center font-medium ${
                    isDark ? 'text-gray-400' : 'text-slate-500'
                  }`}>
                    No properties match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* EDIT PROPERTY MODAL */}
      {/* ======================================================== */}
      {editingProperty && editForm && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingProperty(null);
          }}
        >
          <div
            className={`rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border space-y-5 my-auto max-h-[92vh] flex flex-col transition-all ${
              isDark ? 'bg-neutral-950 border-white text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-xs ${
                    isDark ? 'bg-neutral-900 border-white text-white' : 'bg-blue-50 border-blue-200 text-blue-600'
                  }`}
                >
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-snug">
                    Edit Property Listing
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    Update listing details, category, pricing, and specs.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    navigate(`/edit-property/${editingProperty._id || editingProperty.id}`);
                  }}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-colors cursor-pointer ${
                    isDark
                      ? 'border-neutral-800 hover:bg-neutral-900 text-gray-300'
                      : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                  }`}
                  title="Open full-page editor"
                >
                  <ExternalLink size={12} />
                  <span>Full Editor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProperty(null)}
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
            </div>

            {/* Modal Body / Form */}
            <form id="editPropertyForm" onSubmit={handleSaveEdit} className="flex flex-col flex-1 min-h-0">
              <div className="space-y-4 overflow-y-auto pr-2 max-h-[58vh] flex-1">
                {/* Title */}
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                    Property Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Sea Face Royal Mansion"
                    className={`w-full text-xs font-medium rounded-xl px-4 py-2.5 border transition-all focus:outline-none ${
                      isDark
                        ? 'bg-neutral-900 text-white placeholder-gray-500 border-neutral-700 focus:border-white'
                        : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-slate-900'
                    }`}
                  />
                </div>

                {/* 2-Column: Category & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                      className={`w-full text-xs font-medium rounded-xl px-4 py-2.5 border cursor-pointer focus:outline-none ${
                        isDark
                          ? 'bg-neutral-900 text-white border-neutral-700 focus:border-white'
                          : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-slate-900'
                      }`}
                    >
                      {availableCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      Status
                    </label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                      className={`w-full text-xs font-medium rounded-xl px-4 py-2.5 border cursor-pointer focus:outline-none ${
                        isDark
                          ? 'bg-neutral-900 text-white border-neutral-700 focus:border-white'
                          : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-slate-900'
                      }`}
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Sold">Sold</option>
                    </select>
                  </div>
                </div>

                {/* 2-Column: Price & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      Price ($ or Rs.) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.price}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, price: e.target.value }))}
                      placeholder="e.g. $5,400,000 or Rs. 2500000"
                      className={`w-full text-xs font-medium rounded-xl px-4 py-2.5 border transition-all focus:outline-none ${
                        isDark
                          ? 'bg-neutral-900 text-white placeholder-gray-500 border-neutral-700 focus:border-white'
                          : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      City
                    </label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, city: e.target.value }))}
                      placeholder="e.g. Mumbai, New York"
                      className={`w-full text-xs font-medium rounded-xl px-4 py-2.5 border transition-all focus:outline-none ${
                        isDark
                          ? 'bg-neutral-900 text-white placeholder-gray-500 border-neutral-700 focus:border-white'
                          : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-slate-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Full Address / Location */}
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                    Location / Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.location}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. Bandra West, Mumbai"
                    className={`w-full text-xs font-medium rounded-xl px-4 py-2.5 border transition-all focus:outline-none ${
                      isDark
                        ? 'bg-neutral-900 text-white placeholder-gray-500 border-neutral-700 focus:border-white'
                        : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-slate-900'
                    }`}
                  />
                </div>

                {/* Specs: Beds, Baths, Sqft, YearBuilt */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editForm.beds}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, beds: e.target.value }))}
                      className={`w-full text-xs font-medium rounded-xl px-3 py-2 border transition-all focus:outline-none ${
                        isDark
                          ? 'bg-neutral-900 text-white border-neutral-700 focus:border-white'
                          : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editForm.baths}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, baths: e.target.value }))}
                      className={`w-full text-xs font-medium rounded-xl px-3 py-2 border transition-all focus:outline-none ${
                        isDark
                          ? 'bg-neutral-900 text-white border-neutral-700 focus:border-white'
                          : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      Area (sqft)
                    </label>
                    <input
                      type="text"
                      value={editForm.sqft}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, sqft: e.target.value }))}
                      placeholder="3,100"
                      className={`w-full text-xs font-medium rounded-xl px-3 py-2 border transition-all focus:outline-none ${
                        isDark
                          ? 'bg-neutral-900 text-white border-neutral-700 focus:border-white'
                          : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      Year Built
                    </label>
                    <input
                      type="text"
                      value={editForm.yearBuilt}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, yearBuilt: e.target.value }))}
                      placeholder="2024"
                      className={`w-full text-xs font-medium rounded-xl px-3 py-2 border transition-all focus:outline-none ${
                        isDark
                          ? 'bg-neutral-900 text-white border-neutral-700 focus:border-white'
                          : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-slate-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Units & Availability */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl border border-dashed border-gray-300 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-950/40">
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      Total Units / Apartments <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={editForm.totalUnits}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, totalUnits: e.target.value }))}
                      className={`w-full text-xs font-medium rounded-xl px-3 py-2 border transition-all focus:outline-none ${
                        isDark
                          ? 'bg-neutral-900 text-white border-neutral-700 focus:border-white'
                          : 'bg-white text-slate-900 border-slate-200 focus:border-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      Available Units <span className="text-emerald-500 font-semibold">(Live Stock)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.availableUnits}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, availableUnits: e.target.value }))}
                      className={`w-full text-xs font-medium rounded-xl px-3 py-2 border transition-all focus:outline-none ${
                        isDark
                          ? 'bg-neutral-900 text-white border-neutral-700 focus:border-white'
                          : 'bg-white text-slate-900 border-slate-200 focus:border-slate-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Image Preview & URL / Upload */}
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                    Property Image
                  </label>
                  <div className="flex items-center gap-3">
                    <img
                      src={resolveImageUrl(editForm.image)}
                      alt="Preview"
                      onError={(e) => {
                        if (e.currentTarget.src !== DEFAULT_FALLBACK_IMAGE) {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                        }
                      }}
                      className={`w-14 h-14 rounded-xl object-cover border shadow-2xs shrink-0 ${
                        isDark ? 'border-neutral-700' : 'border-slate-200'
                      }`}
                    />
                    <div className="flex-1 space-y-2">
                      <input
                        type="url"
                        value={editForm.image}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, image: e.target.value }))}
                        placeholder="Paste Image URL..."
                        className={`w-full text-xs font-medium rounded-xl px-3.5 py-2 border transition-all focus:outline-none ${
                          isDark
                            ? 'bg-neutral-900 text-white placeholder-gray-500 border-neutral-700 focus:border-white'
                            : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-slate-900'
                        }`}
                      />
                      <div className="flex items-center gap-2">
                        <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                          isDark
                            ? 'bg-neutral-900 border-neutral-700 text-gray-300 hover:bg-neutral-800'
                            : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        }`}>
                          <Upload size={12} />
                          <span>{isUploading ? 'Uploading...' : 'Upload New Photo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleEditImageUpload}
                            disabled={isUploading}
                            className="hidden"
                          />
                        </label>
                        {uploadError && (
                          <span className="text-red-500 text-[11px]">{uploadError}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Featured Checkbox */}
                <div className="flex items-center gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="editFeatured"
                    checked={editForm.featured}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, featured: e.target.checked }))}
                    className="w-4 h-4 rounded-md border-slate-300 text-brand focus:ring-brand cursor-pointer"
                  />
                  <label
                    htmlFor="editFeatured"
                    className={`text-xs font-bold cursor-pointer ${isDark ? 'text-gray-200' : 'text-slate-800'}`}
                  >
                    Mark as Featured Listing (Displays prominent badge)
                  </label>
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Comprehensive description of property features, architectural details..."
                    className={`w-full text-xs font-medium rounded-xl px-4 py-2.5 border transition-all resize-none focus:outline-none ${
                      isDark
                        ? 'bg-neutral-900 text-white placeholder-gray-500 border-neutral-700 focus:border-white'
                        : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Modal Footer / Actions (Sticky at bottom) */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10 shrink-0 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingProperty(null)}
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
                  <Check size={15} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProperties;
