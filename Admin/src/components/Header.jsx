import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  ShieldCheck,
  Sun,
  Moon,
  Clock,
  UserCheck,
  ExternalLink,
  CheckCircle,
  FileCheck
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { notificationApi } from '../services/api';

const Header = ({ setMobileOpen }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { theme, toggleTheme, isDark } = useTheme();

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.getAll(user?.role || 'Super Admin', user?.id || user?._id);
      if (res && res.data) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount || res.data.filter((n) => !n.isRead).length);
      }
    } catch (err) {
      console.warn('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 6000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAllRead = async () => {
    await notificationApi.markAllRead(user?.role || 'Super Admin');
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await notificationApi.markRead(notif._id || notif.id);
      setNotifications((prev) =>
        prev.map((n) => ((n._id || n.id) === (notif._id || notif.id) ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setShowNotifications(false);
    if (notif.link) {
      navigate(notif.link);
    } else {
      navigate('/sub-admins');
    }
  };

  const dk = {
    bg: '#1a232c',
    border: '#2d3d4e',
    text: '#e8ddd4',
    textSec: '#a09484',
    inputBg: '#243140',
    inputBorder: '#2d3d4e',
  };
  const lt = {
    bg: '#faf8f5',
    border: '#ede5da',
    text: '#1a232c',
    textSec: '#6b7280',
    inputBg: '#f5f0eb',
    inputBorder: '#ede5da',
  };
  const c = isDark ? dk : lt;

  return (
    <header
      className="h-16 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between transition-colors duration-200 shadow-xs"
      style={{ backgroundColor: c.bg, borderBottom: `1px solid ${c.border}` }}
    >
      {/* Left: Mobile hamburger & search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl transition-colors cursor-pointer"
          style={{ color: c.text, border: `1px solid ${c.border}` }}
          aria-label="Toggle navigation"
        >
          <Menu size={20} />
        </button>

        {/* Global Search */}
        <div className="relative w-full max-w-md hidden sm:block">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: c.textSec }}
          />
          <input
            type="text"
            placeholder="Search properties, leads, clients..."
            className="w-full text-xs font-medium rounded-xl pl-10 pr-4 py-2 transition-all focus:outline-none"
            style={{
              backgroundColor: c.inputBg,
              color: c.text,
              border: `1px solid ${c.inputBorder}`,
            }}
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 md:gap-3.5">
        {/* User Role Badge */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold border ${
            user?.role === 'Super Admin'
              ? 'bg-brand/10 border-brand/30 text-brand'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          <span>{user?.role || 'Administrator'}</span>
        </div>

        {/* Theme Toggle (Light / Dark) */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          style={{
            backgroundColor: isDark ? '#243140' : '#f5f0eb',
            color: isDark ? '#c39379' : '#1a232c',
            border: `1px solid ${isDark ? '#2d3d4e' : '#ede5da'}`,
          }}
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
          <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
        </button>

        {/* Port indicator badge */}
        <div
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
          style={{ backgroundColor: isDark ? '#243140' : '#f5f0eb', border: `1px solid ${isDark ? '#2d3d4e' : '#ede5da'}`, color: isDark ? '#e8ddd4' : '#1a232c' }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse border border-emerald-300" />
          Port : 5174
        </div>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl transition-colors cursor-pointer"
            style={{ color: c.text, border: `1px solid ${c.border}`, backgroundColor: isDark ? '#243140' : '#f5f0eb' }}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand text-white text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-3 w-88 sm:w-96 rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
              style={{ backgroundColor: isDark ? '#1f2b36' : '#ffffff', border: `1px solid ${isDark ? '#2d3d4e' : '#ede5da'}`, color: c.text }}
            >
              <div
                className="flex items-center justify-between pb-3 mb-3"
                style={{ borderBottom: `1px solid ${isDark ? '#2d3d4e' : '#ede5da'}` }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-brand text-white">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-bold text-brand hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div
                  className="py-8 text-center text-xs"
                  style={{ color: c.textSec }}
                >
                  <Bell size={24} className="mx-auto mb-2 opacity-40" />
                  <span>No new notifications yet</span>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                  {notifications.map((n, idx) => (
                    <div
                      key={n._id || n.id || idx}
                      onClick={() => handleNotificationClick(n)}
                      className="p-3 rounded-2xl transition-all cursor-pointer flex gap-3 text-left"
                      style={{
                        backgroundColor: !n.isRead
                          ? isDark ? 'rgba(195,147,121,0.1)' : 'rgba(195,147,121,0.07)'
                          : isDark ? '#243140' : '#faf8f5',
                        border: `1px solid ${!n.isRead ? (isDark ? 'rgba(195,147,121,0.3)' : 'rgba(195,147,121,0.2)') : (isDark ? '#2d3d4e' : '#ede5da')}`,
                        opacity: n.isRead ? 0.75 : 1,
                      }}
                    >
                      <div className="mt-0.5 shrink-0">
                        {n.type === 'kyc_submission' ? (
                          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                            <Clock size={16} />
                          </div>
                        ) : n.type === 'kyc_approved' ? (
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                            <CheckCircle size={16} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-brand/20 text-brand flex items-center justify-center">
                            <UserCheck size={16} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold truncate">{n.title}</p>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-brand shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] mt-0.5 line-clamp-2 leading-relaxed" style={{ color: c.textSec }}>
                          {n.message}
                        </p>
                        <span className="text-[10px] mt-1 inline-block" style={{ color: isDark ? '#7a6e66' : '#9ca3af' }}>
                          {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Avatar / Profile Badge */}
        <div
          className="flex items-center gap-2 pl-2"
          style={{ borderLeft: `1px solid ${c.border}` }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-brand"
            style={{ backgroundColor: isDark ? '#243140' : '#f5f0eb', border: `1px solid ${c.border}` }}
          >
            <ShieldCheck size={19} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
