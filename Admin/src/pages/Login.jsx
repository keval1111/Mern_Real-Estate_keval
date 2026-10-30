import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  User,
  Phone,
  UserPlus,
  LogIn,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { isDark } = useTheme();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('admin@realestate.com');
  const [password, setPassword] = useState('admin123');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setSubmitting(true);

    if (mode === 'login') {
      const res = await login(email, password);
      setSubmitting(false);

      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Login failed. Please verify your credentials.');
      }
    } else {
      // Sub-Admin Registration
      if (!name.trim()) {
        setError('Please enter your full name');
        setSubmitting(false);
        return;
      }

      const res = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        role: 'Sub-Admin',
      });
      setSubmitting(false);

      if (res.success) {
        setSuccessMessage('Sub-Admin registered successfully! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } else {
        setError(res.message || 'Registration failed. Please try again.');
      }
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 transition-colors duration-200"
      style={{ backgroundColor: isDark ? '#0e161d' : '#faf8f5', color: isDark ? '#e8ddd4' : '#1a232c' }}
    >
      <div
        className="w-full max-w-md rounded-3xl border p-8 shadow-2xl transition-all"
        style={{
          backgroundColor: isDark ? '#1f2b36' : '#ffffff',
          borderColor: isDark ? '#2d3d4e' : '#ede5da',
        }}
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/20 mb-3">
            <Building2 size={28} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand px-3 py-1 rounded-full bg-brand/10 mb-2">
            Real Estate Management Portal
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: isDark ? '#e8ddd4' : '#1a232c' }}>
            {mode === 'login' ? 'Welcome Back' : 'Sub-Admin Registration'}
          </h1>
          <p className="text-xs mt-1 max-w-xs" style={{ color: isDark ? '#a09484' : '#6b7280' }}>
            {mode === 'login'
              ? 'Access the Luxury Real Estate control center'
              : 'Register as an authorized Sub-Admin to list and manage premier estates'}
          </p>
        </div>

        {/* Mode Selector Tabs (Sign In vs Register) */}
        <div
          className="p-1 rounded-2xl flex items-center mb-6"
          style={{ backgroundColor: isDark ? '#243140' : '#f5f0eb', border: `1px solid ${isDark ? '#2d3d4e' : '#ede5da'}` }}
        >
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'login'
                ? 'bg-brand text-white shadow-md'
                : isDark
                ? 'text-gray-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn size={14} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setEmail('');
              setPassword('');
              setError('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'register'
                ? 'bg-brand text-white shadow-md'
                : isDark
                ? 'text-gray-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus size={14} />
            <span>Sub-Admin Register</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-2">
            <ShieldCheck size={16} className="shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Full Legal Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className={`w-full text-sm font-medium rounded-xl pl-10 pr-4 py-2.5 border transition-all focus:outline-none ${
                      isDark
                        ? 'bg-neutral-950 text-white placeholder-gray-500 border-neutral-800 focus:border-brand'
                        : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-brand'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Phone size={16} />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className={`w-full text-sm font-medium rounded-xl pl-10 pr-4 py-2.5 border transition-all focus:outline-none ${
                      isDark
                        ? 'bg-neutral-950 text-white placeholder-gray-500 border-neutral-800 focus:border-brand'
                        : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-brand'
                    }`}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail size={16} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="subadmin@realestate.com"
                className={`w-full text-sm font-medium rounded-xl pl-10 pr-4 py-2.5 border transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white placeholder-gray-500 border-neutral-800 focus:border-brand'
                    : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-brand'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full text-sm font-medium rounded-xl pl-10 pr-10 py-2.5 border transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white placeholder-gray-500 border-neutral-800 focus:border-brand'
                    : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-brand'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-200 cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

        {mode === 'register' && (
          <div
            className="p-3 rounded-xl text-[11px] leading-relaxed"
            style={{ backgroundColor: isDark ? '#243140' : '#faf8f5', border: `1px solid ${isDark ? '#2d3d4e' : '#ede5da'}`, color: isDark ? '#a09484' : '#6b7280' }}
          >
              <span className="font-bold text-brand">Note:</span> After registering, you will need to submit KYC verification (ID proofs & bank details for payment processing) before listing properties.
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-brand hover:bg-brand-dark text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>{mode === 'login' ? 'Authenticating...' : 'Registering Account...'}</span>
              </>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Complete Sub-Admin Registration'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-inherit text-center">
          <p className={`text-[11px] ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
            Protected by Real Estate Auth & Super Admin Verification System
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
