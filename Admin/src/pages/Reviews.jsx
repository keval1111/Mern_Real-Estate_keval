import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  CheckCircle,
  Trash2,
  Inbox,
  Plus,
  Search,
  MessageSquare,
  Sparkles,
  TrendingUp,
  X,
  Check,
  RotateCcw,
  Building2,
  Eye,
  Filter,
  Shield
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { reviewApi, propertyApi } from '../services/api';

const Reviews = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState('');

  // Add Review Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [propertiesList, setPropertiesList] = useState([]);
  const [newReview, setNewReview] = useState({
    propertyId: '1',
    propertyTitle: 'The Imperial Sky Villa Luxury',
    author: '',
    email: '',
    rating: 5,
    title: '',
    comment: '',
    status: 'Approved',
    verifiedBuyer: true
  });

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // Fetch reviews from database
  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await reviewApi.getAll();
      if (Array.isArray(data)) {
        setReviews(data);
      }
    } catch (err) {
      console.error('Error loading reviews from database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
    // Load properties for dropdown
    propertyApi.getAll().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setPropertiesList(data);
        setNewReview((prev) => ({
          ...prev,
          propertyId: String(data[0]._id || data[0].id || '1'),
          propertyTitle: data[0].title || 'The Imperial Sky Villa'
        }));
      }
    });
  }, []);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = reviews.length;
    if (total === 0) {
      return { total: 0, avgRating: '0.0', fiveStars: 0, verifiedPercent: '100%' };
    }
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    const avg = (sum / total).toFixed(1);
    const fiveStars = reviews.filter((r) => Number(r.rating) === 5).length;
    const verifiedCount = reviews.filter((r) => r.verifiedBuyer !== false).length;
    const verifiedPercent = `${Math.round((verifiedCount / total) * 100)}%`;

    return {
      total,
      avgRating: avg,
      fiveStars,
      verifiedPercent
    };
  }, [reviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchStatus = statusFilter === 'All' || r.status === statusFilter;
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm.trim() ||
        (r.author || '').toLowerCase().includes(term) ||
        (r.propertyTitle || r.property || '').toLowerCase().includes(term) ||
        (r.title || '').toLowerCase().includes(term) ||
        (r.comment || '').toLowerCase().includes(term);
      return matchStatus && matchSearch;
    });
  }, [reviews, statusFilter, searchTerm]);

  // Delete review from database
  const handleDelete = async (id) => {
    if (window.confirm('Delete this customer review permanently from the database?')) {
      const ok = await reviewApi.delete(id);
      if (ok) {
        setReviews((prev) => prev.filter((r) => (r._id || r.id) !== id));
        triggerToast('Review deleted from database.');
      }
    }
  };

  // Toggle status
  const handleToggleStatus = async (r) => {
    const nextStatus = r.status === 'Approved' ? 'Pending' : 'Approved';
    const id = r._id || r.id;
    try {
      await reviewApi.updateStatus(id, nextStatus);
      setReviews((prev) =>
        prev.map((item) => ((item._id || item.id) === id ? { ...item, status: nextStatus } : item))
      );
      triggerToast(`Review marked as ${nextStatus}`);
    } catch (e) {
      console.error(e);
    }
  };

  // Submit new review from Admin
  const handleCreateReview = async (e) => {
    e.preventDefault();
    if (!newReview.author.trim() || !newReview.comment.trim() || !newReview.email.trim()) {
      return;
    }

    try {
      const saved = await reviewApi.create(newReview);
      if (saved) {
        setReviews((prev) => [saved, ...prev]);
        triggerToast('Review saved into database successfully!');
        setModalOpen(false);
        setNewReview((prev) => ({
          ...prev,
          author: '',
          email: '',
          title: '',
          comment: '',
          rating: 5
        }));
      }
    } catch (err) {
      console.error('Error creating review:', err);
      triggerToast('Error saving review to database.');
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className={`text-2xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Customer Reviews
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
              isDark
                ? 'bg-neutral-900 text-amber-400 border-white'
                : 'bg-amber-50 text-amber-700 border-amber-300'
            }`}>
              {metrics.avgRating} ★ ({reviews.length} in Database)
            </span>
          </div>
          <p className={`text-xs font-medium mt-1 ${
            isDark ? 'text-gray-400' : 'text-slate-500'
          }`}>
            Live buyer ratings and testimonials synced directly with the MongoDB database.
          </p>
        </div>

        {/* Sub-Admin Reviews Scoping Banner */}
        {user?.role === 'Sub-Admin' && (
          <div className={`w-full p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs shadow-xs ${
            user?.accessPermissions?.canViewAllReviews
              ? isDark
                ? 'bg-blue-950/30 border-blue-800/60 text-blue-300'
                : 'bg-blue-50/80 border-blue-200 text-blue-900'
              : isDark
              ? 'bg-purple-950/30 border-purple-800/60 text-purple-300'
              : 'bg-purple-50/80 border-purple-200 text-purple-900'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                user?.accessPermissions?.canViewAllReviews
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
              }`}>
                <Shield size={16} />
              </div>
              <div>
                <span className="font-extrabold uppercase tracking-wider text-[11px] block">
                  {user?.accessPermissions?.canViewAllReviews
                    ? 'Global Customer Review Access Granted'
                    : 'Sub-Admin Review Scoping Active'}
                </span>
                <span className="text-[11px] opacity-85 font-medium">
                  {user?.accessPermissions?.canViewAllReviews
                    ? 'Super Admin has granted you elevated permission to inspect reviews across all properties.'
                    : 'Restricted View: You are currently viewing customer ratings and reviews exclusively for properties listed by you.'}
                </span>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 border ${
              user?.accessPermissions?.canViewAllReviews
                ? 'bg-blue-500/20 text-blue-400 border-blue-400/40'
                : 'bg-purple-500/20 text-purple-400 border-purple-400/40'
            }`}>
              {user?.accessPermissions?.canViewAllReviews ? 'All Reviews' : 'Ownership Scoped'}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadReviews}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer shadow-2xs ${
              isDark
                ? 'bg-black border-white hover:bg-neutral-900 text-white'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
            title="Reload from MongoDB"
          >
            <RotateCcw size={14} />
            <span>Sync Database</span>
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border shadow-xs cursor-pointer transition-all ${
              isDark
                ? 'bg-white hover:bg-neutral-200 text-black border-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
            }`}
          >
            <Plus size={16} /> Add Review
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Average Rating */}
        <div className={`p-5 rounded-2xl border shadow-xs transition-all ${
          isDark ? 'bg-neutral-950 border-white' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`p-2.5 rounded-xl border shadow-2xs ${
              isDark ? 'bg-neutral-900 border-white text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600'
            }`}>
              <Star size={18} fill="currentColor" />
            </span>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              Top Tier
            </span>
          </div>
          <div className="mt-3">
            <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
              Average Rating
            </p>
            <h3 className={`text-xl font-extrabold mt-0.5 flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <span>{metrics.avgRating}</span>
              <span className="text-amber-400 text-sm">★★★★★</span>
            </h3>
          </div>
        </div>

        {/* Total Reviews */}
        <div className={`p-5 rounded-2xl border shadow-xs transition-all ${
          isDark ? 'bg-neutral-950 border-white' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`p-2.5 rounded-xl border shadow-2xs ${
              isDark ? 'bg-neutral-900 border-white text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600'
            }`}>
              <MessageSquare size={18} />
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
              isDark ? 'border-neutral-700 text-gray-300' : 'border-slate-200 text-slate-600'
            }`}>
              Database Synced
            </span>
          </div>
          <div className="mt-3">
            <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
              Total Feedback
            </p>
            <h3 className={`text-xl font-extrabold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {metrics.total} Submissions
            </h3>
          </div>
        </div>

        {/* 5-Star Reviews */}
        <div className={`p-5 rounded-2xl border shadow-xs transition-all ${
          isDark ? 'bg-neutral-950 border-white' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`p-2.5 rounded-xl border shadow-2xs ${
              isDark ? 'bg-neutral-900 border-white text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
            }`}>
              <Sparkles size={18} />
            </span>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              High Satisfaction
            </span>
          </div>
          <div className="mt-3">
            <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
              5-Star Ratings
            </p>
            <h3 className={`text-xl font-extrabold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {metrics.fiveStars} Reviews
            </h3>
          </div>
        </div>

        {/* Verified Buyers */}
        <div className={`p-5 rounded-2xl border shadow-xs transition-all ${
          isDark ? 'bg-neutral-950 border-white' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`p-2.5 rounded-xl border shadow-2xs ${
              isDark ? 'bg-neutral-900 border-white text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-600'
            }`}>
              <CheckCircle size={18} />
            </span>
            <span className="text-[10px] font-bold text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-md">
              Authentic
            </span>
          </div>
          <div className="mt-3">
            <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
              Verified Buyers
            </p>
            <h3 className={`text-xl font-extrabold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {metrics.verifiedPercent}
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
            placeholder="Search reviews by client, property, or keyword..."
            className={`w-full px-4 py-2 rounded-xl text-xs font-medium border transition-all focus:outline-none ${
              isDark
                ? 'bg-neutral-950 text-white placeholder-gray-500 border-white focus:border-brand'
                : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-brand'
            }`}
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {['All', 'Approved', 'Pending'].map((tab) => {
            const count =
              tab === 'All'
                ? reviews.length
                : reviews.filter((r) => r.status === tab).length;
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

      {/* Reviews Grid */}
      {filteredReviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReviews.map((r) => {
            const revId = r._id || r.id;
            const revRating = Number(r.rating) || 5;
            const revDate = r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }) : 'Recent';

            return (
              <div
                key={revId}
                className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between space-y-4 transition-all hover:shadow-md ${
                  isDark
                    ? 'bg-neutral-950 border-white hover:border-brand'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Top Bar: Stars & Status & Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={15}
                          fill={i < revRating ? 'currentColor' : 'none'}
                          className={i < revRating ? 'text-amber-400' : isDark ? 'text-neutral-800' : 'text-slate-200'}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider border ${
                        r.status === 'Approved'
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
                          : 'bg-amber-950/40 text-amber-300 border-amber-800'
                      }`}>
                        {r.status || 'Approved'}
                      </span>
                      <span className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-slate-400'}`}>
                        {revDate}
                      </span>
                    </div>
                  </div>

                  {/* Review Title */}
                  {r.title && (
                    <h4 className={`text-sm font-bold mt-3 leading-snug ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {r.title}
                    </h4>
                  )}

                  {/* Comment */}
                  <p className={`text-xs mt-1.5 leading-relaxed italic ${
                    isDark ? 'text-gray-300' : 'text-slate-600'
                  }`}>
                    "{r.comment}"
                  </p>

                  {/* Attached Media */}
                  {r.mediaUrl && (
                    <div className="mt-3 rounded-xl overflow-hidden border max-h-36 max-w-xs">
                      <img
                        src={r.mediaUrl}
                        alt="Customer upload"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Author & Property */}
                  <div className={`mt-4 pt-3 border-t text-xs space-y-1 ${
                    isDark ? 'border-neutral-900' : 'border-slate-100'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {r.author}
                      </span>
                      {r.email && (
                        <span className={`text-[11px] truncate max-w-[130px] ${
                          isDark ? 'text-gray-500' : 'text-slate-400'
                        }`}>
                          {r.email}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-brand font-semibold">
                      <Building2 size={12} className="shrink-0" />
                      <span className="truncate">{r.propertyTitle || r.property || 'Real Estate Listing'}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Toolbar */}
                <div className={`flex items-center justify-between pt-3 border-t text-xs ${
                  isDark ? 'border-neutral-900' : 'border-slate-100'
                }`}>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                    <CheckCircle size={13} /> Verified Buyer
                  </span>

                  <div className="flex items-center gap-1">
                    {/* Toggle Status */}
                    <button
                      onClick={() => handleToggleStatus(r)}
                      className={`px-2 py-1 rounded-lg border text-[10px] font-bold transition-colors cursor-pointer ${
                        r.status === 'Approved'
                          ? isDark
                            ? 'border-neutral-700 text-gray-400 hover:text-white'
                            : 'border-slate-200 text-slate-500 hover:text-slate-900'
                          : 'border-emerald-500 text-emerald-400 bg-emerald-950/40'
                      }`}
                      title={r.status === 'Approved' ? 'Set as Pending' : 'Approve Review'}
                    >
                      {r.status === 'Approved' ? 'Hide' : 'Approve'}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(revId)}
                      className="text-red-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer transition-colors"
                      title="Delete Review from Database"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`py-16 px-6 text-center flex flex-col items-center justify-center border rounded-2xl shadow-xs transition-colors ${
          isDark ? 'border-white bg-black' : 'border-slate-200 bg-white'
        }`}>
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-3 shadow-2xs ${
            isDark ? 'bg-neutral-900 border-white text-gray-400' : 'bg-slate-100 border-slate-200 text-slate-500'
          }`}>
            <Star size={24} />
          </div>
          <h3 className={`text-sm font-bold mb-1 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            No Reviews Found in Database
          </h3>
          <p className={`text-xs max-w-sm mb-4 ${
            isDark ? 'text-gray-400' : 'text-slate-500'
          }`}>
            No reviews match your selected filter. Click below to add a verified customer testimonial into MongoDB.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border shadow-xs cursor-pointer transition-all ${
              isDark
                ? 'bg-white hover:bg-neutral-200 text-black border-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
            }`}
          >
            <Plus size={15} /> Add First Review
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* ADD REVIEW MODAL */}
      {/* ======================================================== */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div
            className={`rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border space-y-5 my-auto max-h-[92vh] flex flex-col transition-all ${
              isDark ? 'bg-neutral-950 border-white text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-xs ${
                    isDark ? 'bg-neutral-900 border-white text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600'
                  }`}
                >
                  <Star size={18} fill="currentColor" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-snug">
                    Submit Review to Database
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    Adds a verified buyer feedback document to MongoDB.
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

            {/* Form */}
            <form onSubmit={handleCreateReview} className="space-y-4 overflow-y-auto pr-1 flex-1">
              {/* Select Property */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Select Property <span className="text-red-500">*</span>
                </label>
                <select
                  value={newReview.propertyId}
                  onChange={(e) => {
                    const selId = e.target.value;
                    const found = propertiesList.find((p) => String(p._id || p.id) === selId);
                    setNewReview((prev) => ({
                      ...prev,
                      propertyId: selId,
                      propertyTitle: found ? found.title : 'Luxury Property'
                    }));
                  }}
                  className={`w-full text-xs font-medium rounded-xl px-4 py-2.5 border cursor-pointer focus:outline-none ${
                    isDark
                      ? 'bg-neutral-900 text-white border-neutral-700 focus:border-white'
                      : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-slate-900'
                  }`}
                >
                  {propertiesList.length > 0 ? (
                    propertiesList.map((p) => (
                      <option key={p._id || p.id} value={String(p._id || p.id)}>
                        {p.title}
                      </option>
                    ))
                  ) : (
                    <option value="1">The Imperial Sky Villa Luxury</option>
                  )}
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Star Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview((prev) => ({ ...prev, rating: star }))}
                      className="cursor-pointer focus:outline-none"
                    >
                      <Star
                        size={22}
                        fill={star <= newReview.rating ? 'currentColor' : 'none'}
                        className={star <= newReview.rating ? 'text-amber-400' : isDark ? 'text-neutral-700' : 'text-slate-200'}
                      />
                    </button>
                  ))}
                  <span className={`text-xs font-bold ml-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                    {newReview.rating} of 5 Stars
                  </span>
                </div>
              </div>

              {/* Author & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                    Client / Author Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newReview.author}
                    onChange={(e) => setNewReview((prev) => ({ ...prev, author: e.target.value }))}
                    placeholder="e.g. Ananya Panday"
                    className={`w-full text-xs font-medium rounded-xl px-4 py-2.5 border transition-all focus:outline-none ${
                      isDark
                        ? 'bg-neutral-900 text-white placeholder-gray-500 border-neutral-700 focus:border-white'
                        : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newReview.email}
                    onChange={(e) => setNewReview((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="client@example.com"
                    className={`w-full text-xs font-medium rounded-xl px-4 py-2.5 border transition-all focus:outline-none ${
                      isDark
                        ? 'bg-neutral-900 text-white placeholder-gray-500 border-neutral-700 focus:border-white'
                        : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Review Headline */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Review Title / Headline
                </label>
                <input
                  type="text"
                  value={newReview.title}
                  onChange={(e) => setNewReview((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Unrivalled Sea View and Architecture"
                  className={`w-full text-xs font-medium rounded-xl px-4 py-2.5 border transition-all focus:outline-none ${
                    isDark
                      ? 'bg-neutral-900 text-white placeholder-gray-500 border-neutral-700 focus:border-white'
                      : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-slate-900'
                  }`}
                />
              </div>

              {/* Review Comment */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Review Content / Testimonial <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={newReview.comment}
                  onChange={(e) => setNewReview((prev) => ({ ...prev, comment: e.target.value }))}
                  placeholder="Detailed feedback regarding the property, amenities, site tour, and closing process..."
                  className={`w-full text-xs font-medium rounded-xl px-4 py-2.5 border transition-all resize-none focus:outline-none ${
                    isDark
                      ? 'bg-neutral-900 text-white placeholder-gray-500 border-neutral-700 focus:border-white'
                      : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-slate-900'
                  }`}
                />
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/10 dark:border-white/10 shrink-0">
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
                  <Check size={15} /> Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
