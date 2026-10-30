import React, { useState } from 'react';
import { Settings as SettingsIcon, Server, Save, CheckCircle2, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
  const { theme, setTheme, isDark } = useTheme();
  const [saved, setSaved] = useState(false);
  const [storefrontUrl, setStorefrontUrl] = useState('http://localhost:5173');
  const adminPort = '5174';
  const [currency, setCurrency] = useState('USD ($)');

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 transition-colors duration-200 ${
      isDark ? 'bg-black text-white' : 'text-slate-900'
    }`}>
      <div>
        <h1 className={`text-2xl font-extrabold tracking-tight ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          System & Admin Settings
        </h1>
        <p className={`text-xs font-medium mt-1 ${
          isDark ? 'text-gray-400' : 'text-slate-500'
        }`}>
          Manage platform appearance, configuration, ports, and administrative preferences.
        </p>
      </div>

      {saved && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-sm font-bold shadow-xs ${
          isDark
            ? 'bg-emerald-950 border-white text-emerald-300'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <CheckCircle2 size={20} className="text-emerald-500" /> Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Appearance & Theme Selector */}
        <div className={`rounded-2xl p-6 border shadow-xs space-y-4 transition-colors ${
          isDark ? 'bg-black border-white' : 'bg-white border-slate-200'
        }`}>
          <h2 className={`text-base font-bold flex items-center gap-2 pb-3 border-b ${
            isDark ? 'text-white border-white' : 'text-slate-900 border-slate-200'
          }`}>
            <Sun size={18} className="text-brand" /> Appearance & Theme
          </h2>

          <div>
            <label className={`block text-xs font-bold mb-3 ${
              isDark ? 'text-gray-300' : 'text-slate-700'
            }`}>
              Interface Theme Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center gap-3 p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  theme === 'light'
                    ? 'border-brand bg-brand/5 ring-2 ring-brand/30'
                    : isDark
                    ? 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="p-2.5 rounded-lg bg-amber-100 text-amber-700">
                  <Sun size={20} />
                </div>
                <div>
                  <div className={`text-sm font-bold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    Light Theme
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Crisp white panels, light slate backgrounds, and high contrast.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-3 p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  theme === 'dark'
                    ? 'border-brand bg-brand/10 ring-2 ring-brand/30'
                    : isDark
                    ? 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="p-2.5 rounded-lg bg-neutral-800 text-purple-300">
                  <Moon size={20} />
                </div>
                <div>
                  <div className={`text-sm font-bold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    Dark Theme
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Pure black background with white architectural borders.
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Network & Ports Card */}
        <div className={`rounded-2xl p-6 border shadow-xs space-y-4 transition-colors ${
          isDark ? 'bg-black border-white' : 'bg-white border-slate-200'
        }`}>
          <h2 className={`text-base font-bold flex items-center gap-2 pb-3 border-b ${
            isDark ? 'text-white border-white' : 'text-slate-900 border-slate-200'
          }`}>
            <Server size={18} className="text-brand" /> Network & Multi-Port Topology
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${
                isDark ? 'text-gray-300' : 'text-slate-700'
              }`}>
                Customer Storefront URL
              </label>
              <input
                type="text"
                value={storefrontUrl}
                onChange={(e) => setStorefrontUrl(e.target.value)}
                className={`w-full text-sm font-medium rounded-xl px-4 py-2.5 border transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white placeholder-gray-500 border-white'
                    : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white'
                }`}
              />
              <span className={`text-[10px] mt-1 block font-medium ${
                isDark ? 'text-gray-400' : 'text-slate-500'
              }`}>
                The URL your public buyers visit (Port 5173).
              </span>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1.5 ${
                isDark ? 'text-gray-300' : 'text-slate-700'
              }`}>
                Admin Panel Port
              </label>
              <input
                type="text"
                disabled
                value={adminPort}
                className={`w-full text-sm font-extrabold rounded-xl px-4 py-2.5 border cursor-not-allowed ${
                  isDark
                    ? 'bg-neutral-900 text-gray-300 border-white'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              />
              <span className={`text-[10px] mt-1 block font-medium ${
                isDark ? 'text-gray-400' : 'text-slate-500'
              }`}>
                Configured in Admin/vite.config.js (Port 5174).
              </span>
            </div>
          </div>
        </div>

        {/* Platform Defaults Card */}
        <div className={`rounded-2xl p-6 border shadow-xs space-y-4 transition-colors ${
          isDark ? 'bg-black border-white' : 'bg-white border-slate-200'
        }`}>
          <h2 className={`text-base font-bold flex items-center gap-2 pb-3 border-b ${
            isDark ? 'text-white border-white' : 'text-slate-900 border-slate-200'
          }`}>
            <SettingsIcon size={18} className="text-brand" /> General Preferences
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${
                isDark ? 'text-gray-300' : 'text-slate-700'
              }`}>
                Default Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={`w-full text-sm font-medium rounded-xl px-4 py-2.5 border cursor-pointer focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white border-white'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white'
                }`}
              >
                <option value="USD ($)">USD ($)</option>
                <option value="EUR (€)">EUR (€)</option>
                <option value="GBP (£)">GBP (£)</option>
                <option value="INR (₹)">INR (₹)</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1.5 ${
                isDark ? 'text-gray-300' : 'text-slate-700'
              }`}>
                Notification Channel
              </label>
              <input
                type="text"
                defaultValue="admin-alerts@realestate.com"
                className={`w-full text-sm font-medium rounded-xl px-4 py-2.5 border focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white placeholder-gray-500 border-white'
                    : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white'
                }`}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold border shadow-xs transition-all cursor-pointer ${
              isDark
                ? 'bg-white hover:bg-neutral-200 text-black border-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
            }`}
          >
            <Save size={15} /> Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
