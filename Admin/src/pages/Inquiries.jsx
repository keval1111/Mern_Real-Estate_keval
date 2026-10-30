import React, { useState, useEffect } from 'react';
import {
  Search,
  Mail,
  Phone,
  Clock,
  Inbox,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  User,
  Building2
} from 'lucide-react';
import { io } from 'socket.io-client';
import { useTheme } from '../context/ThemeContext';
import { inquiryApi } from '../services/api';

const SOCKET_SERVER_URL = 'http://localhost:5000';

const Inquiries = () => {
  const { isDark } = useTheme();

  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [newInquiryAlert, setNewInquiryAlert] = useState(null);

  const loadInquiries = async () => {
    setLoading(true);
    try {
      const data = await inquiryApi.getAll();
      if (Array.isArray(data)) {
        setInquiries(data);
      }
    } catch (err) {
      console.warn('Inquiries API error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();

    // Listen for live inquiry form submissions
    const socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling']
    });

    socket.on('new_inquiry_received', (newInq) => {
      setInquiries((prev) => [newInq, ...prev.filter((i) => (i._id || i.id) !== (newInq._id || newInq.id))]);
      setNewInquiryAlert(newInq);
      setTimeout(() => setNewInquiryAlert(null), 6000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const filteredInquiries = inquiries.filter(
    (i) =>
      (i.client || '').toLowerCase().includes(search.toLowerCase()) ||
      (i.property || '').toLowerCase().includes(search.toLowerCase()) ||
      (i.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const markCompleted = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/inquiries/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Completed' }),
      });
    } catch (err) {
      console.warn('API update error:', err);
    }
    const updated = inquiries.map((i) =>
      (i._id === id || i.id === id) ? { ...i, status: 'Completed' } : i
    );
    setInquiries(updated);
  };

  return (
    <div className={`space-y-6 max-w-7xl mx-auto transition-colors duration-200 ${
      isDark ? 'bg-black text-white' : 'text-slate-900'
    }`}>
      {/* Real-time Alert Toast */}
      {newInquiryAlert && (
        <div className="fixed top-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-bounce duration-300">
          <div className="bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-400 flex items-center gap-3">
            <Sparkles size={18} className="text-amber-300 animate-spin shrink-0" />
            <div className="text-xs min-w-0">
              <div className="font-extrabold">🔔 New Contact Form Inquiry!</div>
              <div className="opacity-95 truncate font-medium">
                <span className="font-bold underline">{newInquiryAlert.client}</span>: {newInquiryAlert.message}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-black tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Form Inquiries & Leads
          </h1>
          <p className={`text-xs font-medium mt-1 ${
            isDark ? 'text-gray-400' : 'text-slate-500'
          }`}>
            Prospective clients inquiries and contact submissions from the storefront contact form.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
            isDark
              ? 'bg-neutral-900 border-white text-white'
              : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}>
            Total Leads: {inquiries.length}
          </div>
          <button
            onClick={loadInquiries}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? 'bg-neutral-900 border-white text-white hover:bg-neutral-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title="Refresh Inquiries"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className={`rounded-2xl p-4 border shadow-xs transition-colors ${
        isDark ? 'bg-black border-white' : 'bg-white border-slate-200'
      }`}>
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inquiries by client, property, or email..."
            className={`w-full text-xs font-medium rounded-xl pl-10 pr-4 py-2.5 border transition-all focus:outline-none ${
              isDark
                ? 'bg-neutral-950 text-white placeholder-gray-500 border-white focus:border-brand'
                : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-brand'
            }`}
          />
        </div>
      </div>

      {/* Inquiries Cards Grid */}
      {filteredInquiries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInquiries.map((inq) => (
            <div
              key={inq._id || inq.id}
              className={`rounded-2xl p-5 border shadow-xs flex flex-col justify-between space-y-4 transition-all ${
                isDark
                  ? 'bg-black border-white hover:border-brand'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                      {(inq.client || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {inq.client}
                      </h3>
                      <div className={`text-xs font-medium mt-0.5 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                        Property: <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{inq.property}</span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                      inq.status === 'New'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : inq.status === 'Contacted'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {inq.status}
                  </span>
                </div>

                <div className={`p-3.5 rounded-xl border text-xs leading-relaxed my-3 font-medium ${
                  isDark
                    ? 'bg-neutral-950 border-white text-gray-200'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  "{inq.message}"
                </div>

                <div className="space-y-1.5 text-xs font-medium text-slate-500">
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-brand shrink-0" />
                    <a
                      href={`mailto:${inq.email}`}
                      className={`hover:underline font-bold break-all ${isDark ? 'text-white' : 'text-slate-900'}`}
                    >
                      {inq.email}
                    </a>
                  </div>
                  {inq.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-brand shrink-0" />
                      <span className={`font-semibold ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>{inq.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={`flex items-center justify-between pt-3 border-t text-xs flex-wrap gap-2 ${
                isDark ? 'border-white' : 'border-slate-100'
              }`}>
                <span className="text-[11px] font-medium flex items-center gap-1 text-slate-400">
                  <Clock size={12} /> {inq.date || 'Recent'}
                </span>
                <button
                  onClick={() => markCompleted(inq._id || inq.id)}
                  disabled={inq.status === 'Completed'}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                    inq.status === 'Completed'
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-default'
                      : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {inq.status === 'Completed' ? '✓ Completed' : 'Mark Completed'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`py-16 px-6 text-center flex flex-col items-center justify-center border rounded-2xl shadow-xs transition-colors ${
          isDark ? 'border-white bg-black' : 'border-slate-200 bg-white'
        }`}>
          <div className="w-12 h-12 rounded-2xl border flex items-center justify-center mb-3 bg-slate-100 border-slate-200 text-slate-500">
            <Inbox size={24} />
          </div>
          <h3 className="text-sm font-bold mb-1 text-slate-900">
            No Inquiries Found
          </h3>
          <p className="text-xs max-w-sm text-slate-500">
            Client contact requests and viewing inquiries submitted from the storefront contact form will appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default Inquiries;
