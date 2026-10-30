import React, { useState } from 'react';
import { Shield, Inbox } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Users = () => {
  const { isDark } = useTheme();

  const [users] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_users');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  return (
    <div className={`space-y-6 max-w-7xl mx-auto transition-colors duration-200 ${
      isDark ? 'bg-black text-white' : 'text-slate-900'
    }`}>
      <div>
        <h1 className={`text-2xl font-extrabold tracking-tight ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          Agents & Admin Users
        </h1>
        <p className={`text-xs font-medium mt-1 ${
          isDark ? 'text-gray-400' : 'text-slate-500'
        }`}>
          Manage system administrators, brokers, and staff access permissions.
        </p>
      </div>

      <div className={`rounded-2xl overflow-hidden border shadow-xs transition-colors ${
        isDark ? 'bg-black border-white' : 'bg-white border-slate-200'
      }`}>
        {users.length > 0 ? (
          <table className="w-full text-left text-xs">
            <thead className={`border-b uppercase tracking-wider text-[11px] font-bold ${
              isDark ? 'bg-neutral-900 text-white border-white' : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}>
              <tr>
                <th className="py-3.5 px-5">User / Staff</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-5">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-medium ${
              isDark ? 'divide-white/20 text-gray-300' : 'divide-slate-100 text-slate-700'
            }`}>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className={`transition-colors ${
                    isDark ? 'hover:bg-neutral-900/60' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className={`py-3.5 px-5 font-bold flex items-center gap-3 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-extrabold text-xs ${
                      isDark ? 'bg-neutral-900 text-brand border-white' : 'bg-slate-100 text-brand border-slate-200'
                    }`}>
                      {(u.name || 'US').slice(0, 2).toUpperCase()}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[11px] font-bold shadow-2xs ${
                      isDark
                        ? 'bg-neutral-950 border-white text-white'
                        : 'bg-slate-100 border-slate-200 text-slate-800'
                    }`}>
                      <Shield size={12} className="text-brand" /> {u.role}
                    </span>
                  </td>
                  <td className={`py-3.5 px-4 font-medium ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    {u.email}
                  </td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                        u.status === 'Active'
                          ? isDark ? 'bg-emerald-950 text-emerald-300 border-white' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isDark ? 'bg-neutral-900 text-gray-300 border-white' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-16 px-6 text-center flex flex-col items-center justify-center">
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-3 shadow-2xs ${
              isDark ? 'bg-neutral-900 border-white text-gray-400' : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}>
              <Inbox size={24} />
            </div>
            <h3 className={`text-sm font-bold mb-1 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              No Staff Users Found
            </h3>
            <p className={`text-xs max-w-sm ${
              isDark ? 'text-gray-400' : 'text-slate-500'
            }`}>
              Staff and agent profiles registered to this workspace will be displayed here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
