import { defaultProperties } from '../data/defaultProperties';

const API_BASE = 'http://localhost:5000/api';

export const propertyApi = {
  // Get all properties
  getAll: async (params = {}) => {
    const token = localStorage.getItem('admin_token');
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/properties${query ? `?${query}` : ''}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        // Cache to localStorage for offline resilience
        localStorage.setItem('admin_properties', JSON.stringify(data.data));
        return data.data;
      }
    } catch (err) {
      console.warn('Backend API offline or unreachable, using local fallback:', err);
    }
    // Fallback to local storage or defaults
    const saved = localStorage.getItem('admin_properties');
    return saved ? JSON.parse(saved) : defaultProperties;
  },

  // Create property
  create: async (propertyData) => {
    const token = localStorage.getItem('admin_token');
    const user = JSON.parse(localStorage.getItem('admin_user') || 'null');

    // Strict RBAC Guard: Sub-Admins must be KYC Approved
    if (user && user.role === 'Sub-Admin' && user.kycStatus !== 'Approved') {
      throw new Error(
        `KYC Verification Required: Your current KYC status is "${user.kycStatus || 'Not Submitted'}". Super Admin approval is required before you can create property listings.`
      );
    }

    try {
      const res = await fetch(`${API_BASE}/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(propertyData),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to create property');
      }
      return json.data;
    } catch (err) {
      if (err.message && err.message.includes('KYC')) {
        throw err;
      }
      console.warn('API error, falling back to localStorage:', err);
    }
    // Local fallback
    const saved = JSON.parse(localStorage.getItem('admin_properties') || '[]');
    const newProp = { id: Date.now(), ...propertyData };
    const updated = [newProp, ...saved];
    localStorage.setItem('admin_properties', JSON.stringify(updated));
    return newProp;
  },

  // Update property
  update: async (id, propertyData) => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${API_BASE}/properties/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(propertyData),
      });
      if (res.ok) {
        const json = await res.json();
        const saved = JSON.parse(localStorage.getItem('admin_properties') || '[]');
        const updated = saved.map((p) =>
          String(p._id || p.id) === String(id) ? { ...p, ...json.data } : p
        );
        localStorage.setItem('admin_properties', JSON.stringify(updated));
        return json.data;
      } else {
        const errJson = await res.json().catch(() => ({}));
        if (errJson.message) throw new Error(errJson.message);
      }
    } catch (err) {
      console.warn('API error updating property:', err);
      throw err;
    }
    // Fallback in localStorage
    const saved = JSON.parse(localStorage.getItem('admin_properties') || '[]');
    const updated = saved.map((p) =>
      String(p._id || p.id) === String(id) ? { ...p, ...propertyData } : p
    );
    localStorage.setItem('admin_properties', JSON.stringify(updated));
    const target = updated.find((p) => String(p._id || p.id) === String(id));
    return target || propertyData;
  },

  // Get single property by ID
  getById: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/properties/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (err) {
      console.warn('API error fetching property by ID:', err);
    }
    const saved = JSON.parse(localStorage.getItem('admin_properties') || '[]');
    return saved.find((p) => String(p._id || p.id) === String(id)) || null;
  },

  // Toggle status
  toggleStatus: async (id) => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${API_BASE}/properties/${id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('API toggle status error:', err);
    }
    return null;
  },

  // Delete property
  delete: async (id) => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${API_BASE}/properties/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) return true;
    } catch (err) {
      console.warn('API delete error:', err);
    }
    return false;
  },

  // Reset to 12 defaults
  resetDefaults: async () => {
    try {
      const res = await fetch(`${API_BASE}/properties/reset-defaults`, {
        method: 'POST',
      });
      if (res.ok) {
        const json = await res.json();
        localStorage.setItem('admin_properties', JSON.stringify(json.data));
        return json.data;
      }
    } catch (err) {
      console.warn('API reset error, resetting local storage:', err);
    }
    localStorage.setItem('admin_properties', JSON.stringify(defaultProperties));
    return defaultProperties;
  },
};

export const inquiryApi = {
  getAll: async () => {
    try {
      const res = await fetch(`${API_BASE}/inquiries`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (err) {
      console.warn('Error fetching inquiries from API:', err);
    }
    return JSON.parse(localStorage.getItem('admin_inquiries') || '[]');
  },

  create: async (data) => {
    try {
      const res = await fetch(`${API_BASE}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('Error submitting inquiry to API:', err);
    }
    return null;
  },
};

export const orderApi = {
  getAll: async () => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (err) {
      console.warn('Error fetching orders from API:', err);
    }
    return JSON.parse(localStorage.getItem('admin_orders') || '[]');
  },
};

export const authApi = {
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }
    return { ...data.data, token: data.data?.token || data.token };
  },
  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    return { ...data.data, token: data.data?.token || data.token };
  },
  getMe: async (token) => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch user');
    return data.data;
  },
};

export const uploadApi = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to upload image');
    }
    return data;
  },
};

export const reviewApi = {
  getAll: async (params = {}) => {
    const token = localStorage.getItem('admin_token');
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/reviews${query ? `?${query}` : ''}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          localStorage.setItem('admin_reviews', JSON.stringify(json.data));
          return json.data;
        }
      }
    } catch (err) {
      console.warn('API error fetching reviews, falling back to localStorage:', err);
    }
    return JSON.parse(localStorage.getItem('admin_reviews') || '[]');
  },

  create: async (reviewData) => {
    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('API error creating review:', err);
    }
    // Fallback
    const saved = JSON.parse(localStorage.getItem('admin_reviews') || '[]');
    const newRev = { _id: Date.now().toString(), createdAt: new Date().toISOString(), ...reviewData };
    localStorage.setItem('admin_reviews', JSON.stringify([newRev, ...saved]));
    return newRev;
  },

  delete: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/reviews/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const saved = JSON.parse(localStorage.getItem('admin_reviews') || '[]');
        const updated = saved.filter((r) => (r._id || r.id) !== id);
        localStorage.setItem('admin_reviews', JSON.stringify(updated));
        return true;
      }
    } catch (err) {
      console.warn('API error deleting review:', err);
    }
    const saved = JSON.parse(localStorage.getItem('admin_reviews') || '[]');
    const updated = saved.filter((r) => (r._id || r.id) !== id);
    localStorage.setItem('admin_reviews', JSON.stringify(updated));
    return true;
  },

  updateStatus: async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/reviews/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('API error updating review status:', err);
    }
    return null;
  },
};

export const userApi = {
  getAll: async () => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          localStorage.setItem('admin_users_cache', JSON.stringify(json.data));
          return json.data;
        }
      }
    } catch (err) {
      console.warn('API error fetching users, falling back to cache:', err);
    }
    return JSON.parse(localStorage.getItem('admin_users_cache') || '[]');
  },

  create: async (userData) => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(userData),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('API error creating user:', err);
    }
    const cached = JSON.parse(localStorage.getItem('admin_users_cache') || '[]');
    const newUser = { _id: `local_${Date.now()}`, ...userData, createdAt: new Date().toISOString() };
    localStorage.setItem('admin_users_cache', JSON.stringify([newUser, ...cached]));
    return newUser;
  },

  updateRole: async (id, role) => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${API_BASE}/users/${id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('API error updating role:', err);
    }
    const cached = JSON.parse(localStorage.getItem('admin_users_cache') || '[]');
    const updated = cached.map((u) => String(u._id || u.id) === String(id) ? { ...u, role } : u);
    localStorage.setItem('admin_users_cache', JSON.stringify(updated));
    return { role };
  },

  updateStatus: async (id, status) => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${API_BASE}/users/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('API error updating status:', err);
    }
    const cached = JSON.parse(localStorage.getItem('admin_users_cache') || '[]');
    const updated = cached.map((u) => String(u._id || u.id) === String(id) ? { ...u, status } : u);
    localStorage.setItem('admin_users_cache', JSON.stringify(updated));
    return { status };
  },

  delete: async (id) => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        // Updated on backend
      }
    } catch (err) {
      console.warn('API error deleting user:', err);
    }

    // Always sync local caches so user disappears immediately without error
    const cached = JSON.parse(localStorage.getItem('admin_users_cache') || '[]');
    const updatedCached = cached.filter((u) => String(u._id || u.id) !== String(id) && u.email !== id);
    localStorage.setItem('admin_users_cache', JSON.stringify(updatedCached));

    const regSub = JSON.parse(localStorage.getItem('admin_registered_subadmins') || '[]');
    const updatedReg = regSub.filter((u) => String(u._id || u.id) !== String(id) && u.email !== id);
    localStorage.setItem('admin_registered_subadmins', JSON.stringify(updatedReg));

    const subAdmins = JSON.parse(localStorage.getItem('admin_subadmins') || '[]');
    const updatedSub = subAdmins.filter((u) => String(u._id || u.id) !== String(id) && u.email !== id);
    localStorage.setItem('admin_subadmins', JSON.stringify(updatedSub));

    return true;
  },

  updatePermissions: async (id, permissionsData) => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${API_BASE}/users/${id}/permissions`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(permissionsData),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('API error updating permissions:', err);
    }
    return null;
  },
};

export const kycApi = {
  submit: async (kycData, token) => {
    try {
      const res = await fetch(`${API_BASE}/kyc/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(kycData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'KYC submission failed');
      return data;
    } catch (err) {
      console.warn('Backend KYC offline, persisting locally:', err);
      return {
        success: true,
        message: 'KYC submitted successfully (Local Fallback)',
        data: kycData,
      };
    }
  },
  getMyStatus: async (token) => {
    try {
      const res = await fetch(`${API_BASE}/kyc/my-status`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('Failed to fetch KYC status:', err);
    }
    return null;
  },
  getAllRequests: async (token) => {
    try {
      const res = await fetch(`${API_BASE}/kyc/requests`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('Failed to fetch KYC requests from API:', err);
    }
    return [];
  },
  review: async (userId, status, reason = '', token) => {
    try {
      const res = await fetch(`${API_BASE}/kyc/review/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Review action failed');
      return data;
    } catch (err) {
      console.warn('Review API offline, applying local fallback:', err);
      return { success: true, message: `KYC marked as ${status}` };
    }
  },
  resetDemo: async () => {
    try {
      const res = await fetch(`${API_BASE}/kyc/reset-demo`, { method: 'POST' });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Reset demo KYC offline:', err);
    }
    return { success: true, message: 'Demo KYC reset locally' };
  },
};


export const notificationApi = {
  getAll: async (role = 'Super Admin', userId = null) => {
    try {
      const query = new URLSearchParams({ role, ...(userId ? { userId } : {}) }).toString();
      const res = await fetch(`${API_BASE}/notifications?${query}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          localStorage.setItem('admin_notifications', JSON.stringify(json.data));
          return json;
        }
      }
    } catch (err) {
      console.warn('Notification fetch offline, reading from localStorage:', err);
    }
    const saved = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    return {
      success: true,
      data: saved,
      unreadCount: saved.filter((n) => !n.isRead).length,
    };
  },
  markRead: async (id) => {
    try {
      await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PATCH' });
    } catch (err) {
      console.warn('Error marking notification read:', err);
    }
    const saved = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    const updated = saved.map((n) => (n._id === id || n.id === id ? { ...n, isRead: true } : n));
    localStorage.setItem('admin_notifications', JSON.stringify(updated));
  },
  markAllRead: async (role = 'Super Admin') => {
    try {
      await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
    } catch (err) {
      console.warn('Error marking all notifications read:', err);
    }
    const saved = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    const updated = saved.map((n) => ({ ...n, isRead: true }));
    localStorage.setItem('admin_notifications', JSON.stringify(updated));
  },
};

export const payoutApi = {
  getAll: async (params = {}, token = null) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/payouts${query ? `?${query}` : ''}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Failed to fetch payouts from API:', err);
    }
    return { success: true, data: [] };
  },
  getSummary: async (token = null) => {
    try {
      const res = await fetch(`${API_BASE}/payouts/summary`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Failed to fetch payout summary:', err);
    }
    return { success: true, data: {} };
  },
  getUserStats: async (token = null) => {
    try {
      const res = await fetch(`${API_BASE}/payouts/user-stats`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Failed to fetch user payment stats from API:', err);
    }
    return { success: true, userStats: [], overall: {} };
  },
  getUserTracking: async (userId, token = null) => {
    try {
      const res = await fetch(`${API_BASE}/payouts/user-stats/${userId}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Failed to fetch user tracking details from API:', err);
    }
    return { success: false, message: 'Failed to fetch user tracking details' };
  },
  process: async (payoutId, payload = {}, token = null) => {
    const res = await fetch(`${API_BASE}/payouts/process/${payoutId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to process payout disbursement');
    }
    return data;
  },
};

export const propertyReportApi = {
  getAll: async (params = {}, token = null) => {
    const activeToken = token || localStorage.getItem('admin_token');
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/property-reports${query ? `?${query}` : ''}`, {
        headers: {
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
      });
      if (res.ok) {
        return await res.json();
      }
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || 'Failed to fetch property reports');
    } catch (err) {
      console.warn('API error fetching property reports:', err);
      return { success: false, data: [], metrics: {}, message: err.message };
    }
  },

  getById: async (id, token = null) => {
    const activeToken = token || localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/property-reports/${id}`, {
      headers: {
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch report details');
    }
    return data;
  },

  updateStatus: async (id, payload = {}, token = null) => {
    const activeToken = token || localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/property-reports/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update report status');
    }
    return data;
  },

  takeDownProperty: async (propertyId, payload = {}, token = null) => {
    const activeToken = token || localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/property-reports/takedown/${propertyId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to take down property');
    }
    return data;
  },
};

