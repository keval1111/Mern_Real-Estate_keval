import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Building2,
  Upload,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  ImagePlus,
  Loader2,
  Save,
  ShieldAlert,
  Clock,
  Lock,
  ArrowRight,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { propertyApi, uploadApi } from '../services/api';

const initialBlankForm = {
  title: '',
  category: 'Royal House',
  price: '',
  discountPrice: '',
  totalUnits: '1',
  availableUnits: '1',
  location: '',
  city: '',
  bedrooms: '4',
  bathrooms: '3',
  sqft: '',
  garage: '2',
  yearBuilt: '2024',
  imageUrl: '',
  description: '',
  featured: false,
  amenities: []
};

const AddProperty = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { isDark } = useTheme();
  const { user } = useAuth();

  const isSubAdminRestricted =
    user?.role === 'Sub-Admin' && user?.kycStatus !== 'Approved';

  const availableCategories = useMemo(() => {
    try {
      const saved = localStorage.getItem('admin_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c) => c.name);
        }
      }
    } catch {}
    return ['Royal House', 'Farm Villa', 'Properties', 'Bestseller'];
  }, []);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [formData, setFormData] = useState(() => ({
    ...initialBlankForm,
    category: availableCategories[0] || 'Royal House'
  }));
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Load property data if editing
  useEffect(() => {
    if (id) {
      propertyApi.getById(id).then((p) => {
        if (p) {
          setFormData({
            title: p.title || '',
            category: p.category || availableCategories[0] || 'Royal House',
            price: p.price || '',
            discountPrice: p.discountPrice || '',
            totalUnits: String(p.totalUnits ?? 1),
            availableUnits: String(p.availableUnits ?? p.totalUnits ?? 1),
            location: p.location || '',
            city: p.city || '',
            bedrooms: String(p.beds || p.bedrooms || '3'),
            bathrooms: String(p.baths || p.bathrooms || '2'),
            sqft: String(p.sqft || ''),
            garage: String(p.garage || '2'),
            yearBuilt: String(p.yearBuilt || '2024'),
            imageUrl: p.image || p.imageUrl || '',
            description: p.description || '',
            featured: Boolean(p.featured),
            amenities: Array.isArray(p.amenities) ? p.amenities : []
          });
        }
      });
    }
  }, [id, availableCategories]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');
    try {
      const res = await uploadApi.uploadImage(file);
      if (res && res.fileUrl) {
        setFormData((prev) => ({ ...prev, imageUrl: res.fileUrl }));
      }
    } catch (err) {
      console.error('File upload failed:', err);
      setUploadError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetForm = () => {
    if (window.confirm('Clear all form fields and reset to blank?')) {
      setFormData(initialBlankForm);
    }
  };

  const availableAmenities = [
    'Swimming Pool',
    'Garden',
    'Smart Home',
    'Security 24/7',
    'Solar Powered',
    'Private Gym',
    'Balcony / Terrace',
    'Wine Cellar'
  ];

  const handleAmenityToggle = (amenity) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      category: formData.category,
      price: formData.price.startsWith('$') ? formData.price : `$${formData.price}`,
      totalUnits: Math.max(1, parseInt(formData.totalUnits, 10) || 1),
      availableUnits:
        formData.availableUnits !== '' && formData.availableUnits !== null
          ? Math.max(0, parseInt(formData.availableUnits, 10))
          : Math.max(1, parseInt(formData.totalUnits, 10) || 1),
      location: formData.location || (formData.city || 'California, CA'),
      city: formData.city || '',
      beds: Number(formData.bedrooms) || 3,
      baths: Number(formData.bathrooms) || 2,
      sqft: formData.sqft || '1,500',
      featured: formData.featured,
      image: formData.imageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      description: formData.description,
      amenities: formData.amenities,
      yearBuilt: formData.yearBuilt,
      createdBy: user?._id || user?.id || null,
      createdByName: user?.name || (user?.role === 'Sub-Admin' ? 'Sub-Admin' : 'Super Admin'),
      createdByEmail: user?.email || '',
      creatorRole: user?.role || 'Super Admin'
    };

    try {
      if (isEdit) {
        await propertyApi.update(id, payload);
      } else {
        await propertyApi.create(payload);
      }
    } catch (err) {
      console.error('Failed to save property:', err);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      navigate('/properties');
    }, 1200);
  };

  // Strict KYC Block for Sub-Admin: Do NOT render form at all if KYC is not Approved!
  if (isSubAdminRestricted) {
    return (
      <div className={`max-w-2xl mx-auto py-12 px-4 transition-colors duration-200 ${
        isDark ? 'text-white' : 'text-slate-900'
      }`}>
        <div className={`w-full rounded-3xl border p-8 shadow-2xl transition-all ${
          isDark ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-slate-200'
        }`}>
          <div className="flex flex-col items-center text-center">
            {user?.kycStatus === 'Pending' ? (
              <>
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/10">
                  <Clock size={32} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 px-3 py-1 rounded-full bg-amber-500/10 mb-2">
                  Verification In Progress
                </span>
                <h2 className="text-xl font-extrabold tracking-tight">
                  KYC Verification Under Review
                </h2>
                <p className={`text-xs mt-2 max-w-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                  Your KYC identity proof and bank payout details have been submitted and are currently awaiting Super Admin review. You will be able to add and publish properties once approved.
                </p>
                <div className={`w-full mt-5 p-3 rounded-2xl border text-xs text-left ${
                  isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-semibold text-gray-400">Sub-Admin:</span>
                    <span className="font-bold">{user?.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-gray-400">KYC Status:</span>
                    <span className="font-bold text-amber-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Pending Approval
                    </span>
                  </div>
                </div>
              </>
            ) : user?.kycStatus === 'Rejected' ? (
              <>
                <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mb-4 shadow-lg shadow-rose-500/10">
                  <AlertTriangle size={32} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 px-3 py-1 rounded-full bg-rose-500/10 mb-2">
                  Correction Required
                </span>
                <h2 className="text-xl font-extrabold tracking-tight">
                  KYC Verification Rejected
                </h2>
                <p className={`text-xs mt-2 max-w-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                  {user?.kycDetails?.rejectionReason || 'The Super Admin requested revisions to your submitted documents. Please review and re-submit your KYC form.'}
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-3xl bg-brand/10 text-brand border border-brand/20 flex items-center justify-center mb-4 shadow-lg shadow-brand/10">
                  <ShieldAlert size={32} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand px-3 py-1 rounded-full bg-brand/10 mb-2">
                  Sub-Admin Requirement
                </span>
                <h2 className="text-xl font-extrabold tracking-tight">
                  KYC Verification Required
                </h2>
                <p className={`text-xs mt-2 max-w-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                  Before you can add or publish properties to the platform, you must complete your KYC verification including personal identification and bank payout details for payment processing.
                </p>
              </>
            )}

            {/* Action Buttons */}
            <div className="w-full mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className={`flex-1 py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isDark
                    ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-gray-200'
                    : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Return to Dashboard
              </button>
              <button
                type="button"
                onClick={() => navigate('/kyc-verification')}
                className="flex-1 py-3 px-4 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {user?.kycStatus === 'Pending'
                    ? 'View KYC Details'
                    : user?.kycStatus === 'Rejected'
                    ? 'Re-Submit KYC'
                    : 'Submit KYC Form'}
                </span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto space-y-6 transition-colors duration-200 ${
      isDark ? 'bg-black text-white' : 'text-slate-900'
    }`}>
      {/* Account Info Badge */}
      <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs shadow-2xs ${
        user?.role === 'Super Admin'
          ? isDark ? 'bg-purple-950/20 border-purple-800/40 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-900'
          : isDark ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
      }`}>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-400">Active User:</span>
          <span className="font-extrabold">{user?.name || 'Administrator'}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase border border-current">
            {user?.role || 'Super Admin'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] opacity-75">KYC Status:</span>
          <span className="font-extrabold text-emerald-500 flex items-center gap-1">
            <CheckCircle2 size={12} />
            {user?.kycStatus || 'Approved'}
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/properties')}
            className={`p-2 rounded-xl border transition-colors cursor-pointer shadow-2xs ${
              isDark
                ? 'bg-black border-white hover:bg-neutral-900 text-white'
                : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className={`text-2xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {isEdit ? 'Edit Property Listing' : 'Add New Property'}
            </h1>
            <p className={`text-xs font-medium mt-0.5 ${
              isDark ? 'text-gray-400' : 'text-slate-500'
            }`}>
              {isEdit
                ? `Update details and specifications for ${formData.title || 'listing'}.`
                : 'Create a new listing for the Real Estate catalog.'}
            </p>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-sm font-bold shadow-xs ${
          isDark
            ? 'bg-emerald-950 border-white text-emerald-300'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <CheckCircle2 size={20} className="text-emerald-500" />
          {isEdit
            ? 'Property successfully updated! Redirecting to properties list...'
            : 'Property successfully added! Redirecting to properties list...'}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className={`rounded-2xl p-6 border shadow-xs space-y-4 transition-colors ${
          isDark ? 'bg-black border-white' : 'bg-white border-slate-200'
        }`}>
          <h2 className={`text-base font-bold flex items-center gap-2 pb-3 border-b ${
            isDark ? 'text-white border-white' : 'text-slate-900 border-slate-200'
          }`}>
            <Building2 size={18} className="text-brand" /> Basic Listing Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={`block text-xs font-bold mb-1.5 ${
                isDark ? 'text-gray-300' : 'text-slate-700'
              }`}>
                Property Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. The Royal Grand Horizon Villa"
                className={`w-full text-sm font-medium rounded-xl px-4 py-2.5 border transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white placeholder-gray-500 border-white focus:border-brand'
                    : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-brand'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1.5 ${
                isDark ? 'text-gray-300' : 'text-slate-700'
              }`}>
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={`w-full text-sm font-medium rounded-xl px-4 py-2.5 border cursor-pointer focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white border-white'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white'
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
              <label className={`block text-xs font-bold mb-1.5 ${
                isDark ? 'text-gray-300' : 'text-slate-700'
              }`}>
                Listing Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g. $4,250,000"
                className={`w-full text-sm font-medium rounded-xl px-4 py-2.5 border transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white placeholder-gray-500 border-white focus:border-brand'
                    : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-brand'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1.5 ${
                isDark ? 'text-gray-300' : 'text-slate-700'
              }`}>
                Total Units / Apartments <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.totalUnits}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    totalUnits: val,
                    availableUnits: isEdit ? prev.availableUnits : val,
                  }));
                }}
                placeholder="e.g. 2"
                className={`w-full text-sm font-medium rounded-xl px-4 py-2.5 border transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white placeholder-gray-500 border-white focus:border-brand'
                    : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-brand'
                }`}
              />
              <span className="text-[10px] text-gray-400 mt-1 block">Total quantity of apartments/units in this property</span>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1.5 ${
                isDark ? 'text-gray-300' : 'text-slate-700'
              }`}>
                Currently Available Units <span className="text-emerald-500 font-semibold">(Live Stock)</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.availableUnits}
                onChange={(e) => setFormData({ ...formData, availableUnits: e.target.value })}
                placeholder="e.g. 2"
                className={`w-full text-sm font-medium rounded-xl px-4 py-2.5 border transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white placeholder-gray-500 border-white focus:border-brand'
                    : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-brand'
                }`}
              />
              <span className="text-[10px] text-emerald-500/90 mt-1 block">Decreases automatically when a user books or purchases a unit</span>
            </div>
          </div>
        </div>

        {/* Location & Specs */}
        <div className={`rounded-2xl p-6 border shadow-xs space-y-4 transition-colors ${
          isDark ? 'bg-black border-white' : 'bg-white border-slate-200'
        }`}>
          <h2 className={`text-base font-bold flex items-center gap-2 pb-3 border-b ${
            isDark ? 'text-white border-white' : 'text-slate-900 border-slate-200'
          }`}>
            <MapPin size={18} className="text-brand" /> Location & Dimensions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className={`block text-xs font-bold mb-1.5 ${
                isDark ? 'text-gray-300' : 'text-slate-700'
              }`}>
                Address / Neighborhood
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. 104 Ocean View Drive"
                className={`w-full text-sm font-medium rounded-xl px-4 py-2.5 border transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white placeholder-gray-500 border-white focus:border-brand'
                    : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-brand'
                }`}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={`block text-xs font-bold mb-1.5 ${
                isDark ? 'text-gray-300' : 'text-slate-700'
              }`}>
                City & State
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Beverly Hills, CA"
                className={`w-full text-sm font-medium rounded-xl px-4 py-2.5 border transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white placeholder-gray-500 border-white focus:border-brand'
                    : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-brand'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1.5 ${
                isDark ? 'text-gray-300' : 'text-slate-700'
              }`}>
                Bedrooms
              </label>
              <input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                className={`w-full text-sm font-medium rounded-xl px-4 py-2.5 border focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white border-white'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1.5 ${
                isDark ? 'text-gray-300' : 'text-slate-700'
              }`}>
                Bathrooms
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                className={`w-full text-sm font-medium rounded-xl px-4 py-2.5 border focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white border-white'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1.5 ${
                isDark ? 'text-gray-300' : 'text-slate-700'
              }`}>
                Area (Sq Ft)
              </label>
              <input
                type="text"
                value={formData.sqft}
                onChange={(e) => setFormData({ ...formData, sqft: e.target.value })}
                placeholder="e.g. 6,800"
                className={`w-full text-sm font-medium rounded-xl px-4 py-2.5 border transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white placeholder-gray-500 border-white focus:border-brand'
                    : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-brand'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1.5 ${
                isDark ? 'text-gray-300' : 'text-slate-700'
              }`}>
                Year Built
              </label>
              <input
                type="text"
                value={formData.yearBuilt}
                onChange={(e) => setFormData({ ...formData, yearBuilt: e.target.value })}
                className={`w-full text-sm font-medium rounded-xl px-4 py-2.5 border transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white placeholder-gray-500 border-white focus:border-brand'
                    : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-brand'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Media Preview & File Upload */}
        <div className={`rounded-2xl p-6 border shadow-xs space-y-4 transition-colors ${
          isDark ? 'bg-black border-white' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-inherit">
            <h2 className={`text-base font-bold flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <Upload size={18} className="text-brand" /> Media & Photos
            </h2>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
              Upload from computer or paste web URL
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Direct File Upload Dropzone */}
            <div>
              <label className={`block text-xs font-bold mb-2 ${
                isDark ? 'text-gray-300' : 'text-slate-700'
              }`}>
                Upload from Computer
              </label>
              <label className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDark
                  ? 'border-neutral-700 hover:border-brand bg-neutral-950/60'
                  : 'border-slate-300 hover:border-brand bg-slate-50/70 hover:bg-white'
              }`}>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
                {isUploading ? (
                  <div className="py-4 flex flex-col items-center">
                    <Loader2 size={32} className="animate-spin text-brand mb-2" />
                    <p className={`text-xs font-bold ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      Uploading to server...
                    </p>
                  </div>
                ) : (
                  <div className="py-2 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-2">
                      <ImagePlus size={24} />
                    </div>
                    <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Click to browse image
                    </p>
                    <p className={`text-[11px] mt-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                      Supports PNG, JPG, WEBP (Max 10MB)
                    </p>
                  </div>
                )}
              </label>
              {uploadError && (
                <p className="text-xs text-red-500 mt-1 font-semibold">{uploadError}</p>
              )}
            </div>

            {/* Direct URL Input & Preview */}
            <div className="space-y-3">
              <div>
                <label className={`block text-xs font-bold mb-2 ${
                  isDark ? 'text-gray-300' : 'text-slate-700'
                }`}>
                  Or Image Web URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className={`w-full text-sm font-medium rounded-xl px-4 py-2.5 border transition-all focus:outline-none ${
                    isDark
                      ? 'bg-neutral-950 text-white placeholder-gray-500 border-white focus:border-brand'
                      : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-brand'
                  }`}
                />
              </div>

              {formData.imageUrl ? (
                <div className={`relative rounded-xl overflow-hidden border h-36 w-full shadow-2xs ${
                  isDark ? 'border-white' : 'border-slate-200'
                }`}>
                  <img
                    src={formData.imageUrl}
                    alt="Listing preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    Active Photo Preview
                  </div>
                </div>
              ) : (
                <div className={`h-36 rounded-xl border border-dashed flex items-center justify-center text-xs font-medium ${
                  isDark ? 'border-neutral-800 text-neutral-600' : 'border-slate-200 text-slate-400'
                }`}>
                  No image selected yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Amenities Selection */}
        <div className={`rounded-2xl p-6 border shadow-xs space-y-4 transition-colors ${
          isDark ? 'bg-black border-white' : 'bg-white border-slate-200'
        }`}>
          <h2 className={`text-base font-bold flex items-center gap-2 pb-3 border-b ${
            isDark ? 'text-white border-white' : 'text-slate-900 border-slate-200'
          }`}>
            <Sparkles size={18} className="text-brand" /> Amenities & Features
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {availableAmenities.map((amenity) => {
              const isChecked = formData.amenities.includes(amenity);
              return (
                <button
                  type="button"
                  key={amenity}
                  onClick={() => handleAmenityToggle(amenity)}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 text-left transition-all cursor-pointer shadow-2xs ${
                    isChecked
                      ? isDark
                        ? 'bg-white text-black border-white'
                        : 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : isDark
                      ? 'bg-black text-white hover:bg-neutral-900 border-white'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-sm flex items-center justify-center text-[10px] border ${
                      isChecked
                        ? 'bg-brand text-white font-extrabold border-brand'
                        : isDark ? 'bg-black border-white' : 'bg-white border-slate-300'
                    }`}
                  >
                    {isChecked ? '✓' : ''}
                  </span>
                  <span>{amenity}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleResetForm}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer shadow-2xs ${
              isDark
                ? 'bg-black border-white hover:bg-neutral-900 text-white'
                : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
            title="Reset form to blank"
          >
            <RotateCcw size={14} />
            <span>Reset Form</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/properties')}
            className={`px-5 py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer shadow-2xs ${
              isDark
                ? 'bg-black border-white hover:bg-neutral-900 text-white'
                : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-6 py-2.5 rounded-xl text-xs font-bold border shadow-xs transition-all cursor-pointer ${
              isDark
                ? 'bg-white hover:bg-neutral-200 text-black border-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
            }`}
          >
            {isEdit ? 'Save Changes' : 'Publish Property'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProperty;
