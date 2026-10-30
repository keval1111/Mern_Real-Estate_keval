import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_user');
      if (!saved || saved === 'undefined' || saved === 'null') return null;
      return JSON.parse(saved);
    } catch (e) {
      try { localStorage.removeItem('admin_user'); } catch (_) {}
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_token');
      if (!saved || saved === 'undefined' || saved === 'null') return null;
      return saved;
    } catch (e) {
      try { localStorage.removeItem('admin_token'); } catch (_) {}
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      if (data.role === 'Customer' || data.role === 'User') {
        setLoading(false);
        return {
          success: false,
          message: 'Access Denied: Customer accounts cannot log in to the EstateAdmin Portal. Please use the Customer Storefront at port 5173.',
        };
      }
      setUser(data);
      setToken(data.token);
      localStorage.setItem('admin_user', JSON.stringify(data));
      localStorage.setItem('admin_token', data.token);
      return { success: true, data };
    } catch (err) {
      console.warn('Backend login connection unavailable, checking demo credentials:', err);
      const cleanEmail = (email || '').trim().toLowerCase();

      // Demo Super Admin
      if (cleanEmail === 'admin@realestate.com' && password === 'admin123') {
        const demoAdmin = {
          id: 'admin_master_1',
          _id: 'admin_master_1',
          name: 'Administrator',
          email: 'admin@realestate.com',
          role: 'Super Admin',
          permissions: 'Full Access',
          kycStatus: 'Approved',
          token: 'demo_admin_jwt_token',
        };
        setUser(demoAdmin);
        setToken(demoAdmin.token);
        localStorage.setItem('admin_user', JSON.stringify(demoAdmin));
        localStorage.setItem('admin_token', demoAdmin.token);
        return { success: true, data: demoAdmin };
      }

      // Demo Sub-Admin: Pending KYC
      if (cleanEmail === 'subadmin.pending@realestate.com' && password === 'admin123') {
        const demoSub = {
          id: 'subadmin_pending_1',
          _id: 'subadmin_pending_1',
          name: 'Rohit Sharma (Sub-Admin)',
          email: 'subadmin.pending@realestate.com',
          phone: '+91 98765 43210',
          role: 'Sub-Admin',
          permissions: 'Manage Properties & Bookings',
          kycStatus: 'Pending',
          kycDetails: {
            fullName: 'Rohit Sharma',
            dob: '1992-05-15',
            phone: '+91 98765 43210',
            residentialAddress: 'B-402, Royal Palms, Goregaon East, Mumbai',
            documentType: 'Aadhaar',
            documentNumber: '8876 5432 1098',
            bankName: 'HDFC Bank',
            accountHolderName: 'Rohit Sharma',
            accountNumber: '501004329871',
            ifscCode: 'HDFC0001234',
            upiId: 'rohitsharma@okhdfcbank',
            submittedAt: new Date().toISOString(),
          },
          token: 'demo_subadmin_pending_token',
        };
        setUser(demoSub);
        setToken(demoSub.token);
        localStorage.setItem('admin_user', JSON.stringify(demoSub));
        localStorage.setItem('admin_token', demoSub.token);
        return { success: true, data: demoSub };
      }

      // Demo Sub-Admin: New / Not Submitted
      if (cleanEmail === 'subadmin.new@realestate.com' && password === 'admin123') {
        const demoSubNew = {
          id: 'subadmin_new_1',
          _id: 'subadmin_new_1',
          name: 'Pooja Verma (Sub-Admin)',
          email: 'subadmin.new@realestate.com',
          phone: '+91 98220 12345',
          role: 'Sub-Admin',
          permissions: 'Manage Properties & Bookings',
          kycStatus: 'Not_Submitted',
          kycDetails: {},
          token: 'demo_subadmin_new_token',
        };
        setUser(demoSubNew);
        setToken(demoSubNew.token);
        localStorage.setItem('admin_user', JSON.stringify(demoSubNew));
        localStorage.setItem('admin_token', demoSubNew.token);
        return { success: true, data: demoSubNew };
      }

      // Check registered users from local cache
      const cachedUsers = JSON.parse(localStorage.getItem('admin_registered_subadmins') || '[]');
      const found = cachedUsers.find((u) => u.email.toLowerCase() === cleanEmail);
      if (found) {
        setUser(found);
        setToken(found.token || 'demo_subadmin_token');
        localStorage.setItem('admin_user', JSON.stringify(found));
        localStorage.setItem('admin_token', found.token || 'demo_subadmin_token');
        return { success: true, data: found };
      }

      return { success: false, message: err.message || 'Invalid credentials' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await authApi.register({
        ...userData,
        role: userData.role || 'Sub-Admin',
      });
      setUser(data);
      setToken(data.token);
      localStorage.setItem('admin_user', JSON.stringify(data));
      localStorage.setItem('admin_token', data.token);

      // Save to registered subadmins cache
      const existing = JSON.parse(localStorage.getItem('admin_registered_subadmins') || '[]');
      localStorage.setItem(
        'admin_registered_subadmins',
        JSON.stringify([data, ...existing.filter((u) => u.email !== data.email)])
      );

      return { success: true, data };
    } catch (err) {
      console.warn('Backend register offline, creating local account fallback:', err);
      const localSubAdmin = {
        id: `subadmin_${Date.now()}`,
        _id: `subadmin_${Date.now()}`,
        name: userData.name || 'Sub-Admin User',
        email: userData.email,
        phone: userData.phone || '',
        role: 'Sub-Admin',
        permissions: 'Manage Properties & Bookings',
        kycStatus: 'Not_Submitted',
        kycDetails: {},
        token: `local_jwt_${Date.now()}`,
      };
      setUser(localSubAdmin);
      setToken(localSubAdmin.token);
      localStorage.setItem('admin_user', JSON.stringify(localSubAdmin));
      localStorage.setItem('admin_token', localSubAdmin.token);

      const existing = JSON.parse(localStorage.getItem('admin_registered_subadmins') || '[]');
      localStorage.setItem('admin_registered_subadmins', JSON.stringify([localSubAdmin, ...existing]));

      // Create local notification for Super Admin
      const notifs = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
      const newNotif = {
        _id: `notif_${Date.now()}`,
        id: `notif_${Date.now()}`,
        recipientRole: 'Super Admin',
        senderName: localSubAdmin.name,
        type: 'subadmin_registered',
        title: 'New Sub-Admin Registered',
        message: `${localSubAdmin.name} (${localSubAdmin.email}) registered as Sub-Admin. KYC verification required.`,
        link: '/sub-admins',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('admin_notifications', JSON.stringify([newNotif, ...notifs]));

      return { success: true, data: localSubAdmin };
    } finally {
      setLoading(false);
    }
  };

  const updateKycStatus = (newStatus, kycDetails = null) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      kycStatus: newStatus,
      ...(kycDetails ? { kycDetails: { ...user.kycDetails, ...kycDetails } } : {}),
    };
    setUser(updatedUser);
    localStorage.setItem('admin_user', JSON.stringify(updatedUser));

    // Update in registered cache if present
    const existing = JSON.parse(localStorage.getItem('admin_registered_subadmins') || '[]');
    const updatedCache = existing.map((u) =>
      u.email === updatedUser.email ? updatedUser : u
    );
    localStorage.setItem('admin_registered_subadmins', JSON.stringify(updatedCache));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        updateKycStatus,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
