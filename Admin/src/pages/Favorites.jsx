import React, { useState, useEffect } from 'react';
import {
  Heart,
  Building2,
  Eye,
  ExternalLink,
  RefreshCw,
  MapPin,
  Users,
  Mail,
  Phone,
  Calendar,
  X,
  MessageCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Favorites = () => {
  const { isDark } = useTheme();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBuyerModal, setActiveBuyerModal] = useState(null);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/wishlist/admin/all');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setFavorites(json.data);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend favorites fetch failed, checking local backup:', err);
    }

    // Local fallback
    try {
      const saved = localStorage.getItem('real_estate_wishlist_v2') || localStorage.getItem('admin_favorites');
      setFavorites(saved ? JSON.parse(saved) : []);
    } catch {
      setFavorites([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <div className={`space-y-6 max-w-7xl mx-auto transition-colors duration-200 ${
      isDark ? 'bg-black text-white' : 'text-slate-900'
    }`}>
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Most Favorited Items & Customer Leads
          </h1>
          <p className={`text-xs font-medium mt-1 ${
            isDark ? 'text-gray-400' : 'text-slate-500'
          }`}>
            Listings saved by buyers to their wishlists, with complete customer contact details.
          </p>
        </div>

        <button
          onClick={fetchFavorites}
          disabled={loading}
          className={`self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
            isDark
              ? 'bg-neutral-900 border-white hover:bg-neutral-800 text-white'
              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
          }`}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Favorites</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-3 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            Loading customer wishlists and buyer records from MongoDB...
          </p>
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {favorites.map((fav, index) => {
            const buyers = fav.buyers || [];
            const primaryBuyer = buyers[0];

            return (
              <div
                key={fav._id || fav.id || index}
                className={`rounded-2xl border shadow-xs overflow-hidden flex flex-col justify-between transition-all hover:shadow-lg ${
                  isDark
                    ? 'bg-black border-white hover:border-brand'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Property Image Header with Heart Badge */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={fav.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'}
                    alt={fav.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Heart size={11} fill="currentColor" />
                      <span>Saved by {fav.savesCount || buyers.length || 1} {fav.savesCount === 1 ? 'buyer' : 'buyers'}</span>
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {fav.category || 'Luxury'}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className={`text-sm font-bold truncate ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {fav.title || fav.name}
                    </h3>

                    <p className={`text-xs mt-1 flex items-center gap-1 truncate ${
                      isDark ? 'text-gray-400' : 'text-slate-500'
                    }`}>
                      <MapPin size={12} className="shrink-0 text-slate-400" />
                      <span>{fav.location || fav.city || 'Prime Location'}</span>
                    </p>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/5 dark:border-white/10">
                      <span className="text-xs text-slate-400 font-medium">Price:</span>
                      <span className={`text-sm font-extrabold ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        {fav.price || '$1,500,000'}
                      </span>
                    </div>

                    {/* Customer Lead Highlight Section */}
                    {buyers.length > 0 && (
                      <div className={`mt-3 p-2.5 rounded-xl border text-xs space-y-1.5 ${
                        isDark ? 'bg-neutral-900/80 border-white/10' : 'bg-rose-50/50 border-rose-100'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <Users size={11} />
                            <span>Interested Customer{buyers.length > 1 ? 's' : ''}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveBuyerModal(fav)}
                            className="text-[10px] font-bold text-dark dark:text-white hover:underline cursor-pointer"
                          >
                            View All ({buyers.length})
                          </button>
                        </div>

                        <div className="flex items-center gap-2 pt-0.5">
                          <div className="w-6 h-6 rounded-full bg-dark text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                            {primaryBuyer.name ? primaryBuyer.name[0].toUpperCase() : 'B'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs truncate leading-none">
                              {primaryBuyer.name}
                            </p>
                            <p className="text-[10px] text-gray-500 truncate mt-0.5">
                              {primaryBuyer.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className={`pt-2 border-t flex items-center justify-between text-xs ${
                    isDark ? 'border-white/10' : 'border-slate-100'
                  }`}>
                    {buyers.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setActiveBuyerModal(fav)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                          isDark
                            ? 'border-rose-400/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                            : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                      >
                        <Users size={12} />
                        <span>Customer Details ({buyers.length})</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        Active Listing
                      </span>
                    )}

                    <a
                      href={`http://localhost:5173/checkout?property=${fav.slug || (fav.title ? fav.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : fav.id)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-colors cursor-pointer ${
                        isDark
                          ? 'border-white/30 bg-neutral-900 hover:bg-white hover:text-black text-white'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span>Storefront</span>
                      <ExternalLink size={11} />
                    </a>
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
            <Heart size={24} />
          </div>
          <h3 className={`text-base font-extrabold ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            No Favorited Items Yet
          </h3>
          <p className={`text-xs max-w-sm mt-1 leading-relaxed ${
            isDark ? 'text-gray-400' : 'text-slate-500'
          }`}>
            Items saved by buyers to their storefront wishlists will automatically be aggregated here.
          </p>
        </div>
      )}

      {activeBuyerModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border space-y-5 animate-fade-in ${
            isDark ? 'bg-neutral-950 border-white text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md">
                  <Heart size={20} fill="currentColor" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-snug">
                    Interested Customers ({activeBuyerModal.buyers?.length || 0})
                  </h3>
                  <p className="text-xs text-gray-500 truncate max-w-xs">
                    Property: <strong>{activeBuyerModal.title}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveBuyerModal(null)}
                className="p-1.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* List of Customers who Favorited this Property */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {(activeBuyerModal.buyers || []).map((buyer, idx) => (
                <div
                  key={buyer.id || idx}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    isDark ? 'bg-neutral-900 border-white/10' : 'bg-neutral-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-dark text-white dark:bg-white dark:text-dark flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      {buyer.name ? buyer.name[0].toUpperCase() : 'B'}
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-extrabold text-sm text-dark dark:text-white">
                        {buyer.name}
                      </p>
                      <p className="text-gray-500 flex items-center gap-1.5">
                        <Mail size={12} className="shrink-0" />
                        <span>{buyer.email}</span>
                      </p>
                      <p className="text-gray-500 flex items-center gap-1.5">
                        <Phone size={12} className="shrink-0" />
                        <span>{buyer.phone || '+91 98765 43210'}</span>
                      </p>
                      {buyer.savedAt && (
                        <p className="text-[10px] text-gray-400 flex items-center gap-1 pt-0.5">
                          <Calendar size={10} />
                          <span>Saved: {new Date(buyer.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contact Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-auto pt-2 sm:pt-0">
                    <a
                      href={`mailto:${buyer.email}?subject=Regarding ${encodeURIComponent(activeBuyerModal.title)}`}
                      className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-bold transition-colors"
                      title="Send Email"
                    >
                      <Mail size={14} />
                    </a>
                    <a
                      href={`tel:${buyer.phone || ''}`}
                      className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-bold transition-colors"
                      title="Call Buyer"
                    >
                      <Phone size={14} />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Bottom Close */}
            <div className="pt-2 border-t border-black/5 dark:border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveBuyerModal(null)}
                className="px-5 py-2.5 rounded-full bg-dark text-white dark:bg-white dark:text-dark text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Favorites;
