import React, { createContext, useContext, useState, useEffect } from 'react';

const CustomerAuthContext = createContext();

export const CustomerAuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(() => {
    try {
      const saved = localStorage.getItem('customer_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Sync customer state to localStorage
  useEffect(() => {
    if (customer) {
      localStorage.setItem('customer_user', JSON.stringify(customer));
      if (customer.token) {
        localStorage.setItem('customer_token', customer.token);
      }
    } else {
      localStorage.removeItem('customer_user');
      localStorage.removeItem('customer_token');
    }
  }, [customer]);

  // On mount: verify token with backend /api/auth/me for fresh profile & addresses
  useEffect(() => {
    const token = localStorage.getItem('customer_token');
    if (token) {
      fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setCustomer((prev) => ({
              ...prev,
              ...json.data,
              token,
            }));
          }
        })
        .catch((err) => {
          console.warn('Background customer session check:', err);
        });
    }
  }, []);

  // Login handler with MongoDB API and local fallback
  const login = async (email, password) => {
    setLoading(true);
    const cleanEmail = (email || '').trim().toLowerCase();

    // 1. Attempt backend API call (JWT authentication)
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        const userData = {
          _id: json.data._id || json.data.id,
          id: json.data._id || json.data.id,
          name: json.data.name || cleanEmail.split('@')[0],
          email: json.data.email,
          token: json.data.token,
          role: json.data.role || 'Customer',
          phone: json.data.phone || '+91 98765 43210',
          panOrTaxId: json.data.panOrTaxId || '',
          addresses: json.data.addresses || [],
        };
        localStorage.setItem('customer_token', json.data.token);
        setCustomer(userData);
        setLoading(false);
        return { success: true, user: userData };
      }
    } catch (err) {
      console.warn('Backend login connection unavailable, checking local accounts:', err);
    }

    // 2. Local account fallback verification
    try {
      const localAccounts = JSON.parse(localStorage.getItem('customer_accounts') || '[]');
      const found = localAccounts.find(
        (acc) => acc.email.toLowerCase() === cleanEmail && acc.password === password
      );
      if (found) {
        const userData = {
          name: `${found.firstName || ''} ${found.lastName || ''}`.trim() || found.email.split('@')[0],
          firstName: found.firstName,
          lastName: found.lastName,
          email: found.email,
          phone: found.phone || '+91 98765 43210',
          role: 'Customer',
        };
        setCustomer(userData);
        setLoading(false);
        return { success: true, user: userData };
      }
    } catch {}

    // 3. Built-in Demo account verification
    if (cleanEmail === 'keval@example.com' && (password === 'customer123' || password === 'admin123')) {
      const demoUser = {
        name: 'Keval Patel',
        firstName: 'Keval',
        lastName: 'Patel',
        email: 'keval@example.com',
        phone: '+91 98765 43210',
        role: 'Customer',
      };
      setCustomer(demoUser);
      setLoading(false);
      return { success: true, user: demoUser };
    }

    setLoading(false);
    return {
      success: false,
      message: 'Invalid email or password. Please verify your credentials or click auto-fill demo account.',
    };
  };

  // Register / Create Account handler with MongoDB backend sync
  const register = async ({ firstName, lastName, email, password, phone }) => {
    setLoading(true);
    const cleanEmail = (email || '').trim().toLowerCase();
    const fullName = `${firstName || ''} ${lastName || ''}`.trim() || cleanEmail.split('@')[0];
    const userPhone = phone || '+91 98765 43210';

    // Store in local accounts list
    try {
      const localAccounts = JSON.parse(localStorage.getItem('customer_accounts') || '[]');
      const existsIndex = localAccounts.findIndex((a) => a.email.toLowerCase() === cleanEmail);
      const newAcc = { firstName, lastName, email: cleanEmail, password, phone: userPhone };
      if (existsIndex >= 0) {
        localAccounts[existsIndex] = newAcc;
      } else {
        localAccounts.push(newAcc);
      }
      localStorage.setItem('customer_accounts', JSON.stringify(localAccounts));
    } catch {}

    // Attempt backend registration in MongoDB
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: cleanEmail,
          password,
          phone: userPhone,
          role: 'Customer',
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        const userData = {
          _id: json.data._id || json.data.id,
          id: json.data._id || json.data.id,
          name: json.data.name || fullName,
          firstName,
          lastName,
          email: json.data.email,
          phone: json.data.phone || userPhone,
          token: json.data.token,
          role: 'Customer',
          addresses: json.data.addresses || [],
        };
        localStorage.setItem('customer_token', json.data.token);
        setCustomer(userData);
        setLoading(false);
        return { success: true, user: userData };
      }
    } catch (err) {
      console.warn('Backend registration failed, saved to local accounts:', err);
    }

    // Local registration fallback
    const localUser = {
      name: fullName,
      firstName,
      lastName,
      email: cleanEmail,
      phone: userPhone,
      role: 'Customer',
    };
    setCustomer(localUser);
    setLoading(false);
    return { success: true, user: localUser };
  };

  // Logout handler
  const logout = () => {
    setCustomer(null);
    localStorage.removeItem('customer_user');
    localStorage.removeItem('customer_token');
  };

  // Profile update handler (Syncs directly to MongoDB)
  const updateProfile = async (data) => {
    setCustomer((prev) => {
      const updated = { ...(prev || {}), ...data };
      localStorage.setItem('customer_user', JSON.stringify(updated));
      return updated;
    });

    const token = customer?.token || localStorage.getItem('customer_token');
    if (token) {
      try {
        await fetch('http://localhost:5000/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
      } catch (err) {
        console.warn('Profile sync to backend optional:', err);
      }
    }
  };

  // Update address list in backend
  const updateAddresses = async (addresses) => {
    const token = customer?.token || localStorage.getItem('customer_token');
    if (token) {
      try {
        const res = await fetch('http://localhost:5000/api/auth/addresses', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ addresses }),
        });
        const json = await res.json();
        if (json.success) {
          setCustomer((prev) => ({
            ...(prev || {}),
            addresses: json.data,
          }));
        }
      } catch (err) {
        console.warn('Address sync error:', err);
      }
    }
  };

  // First letter of customer name helper
  const getInitial = () => {
    if (!customer) return 'C';
    const displayName = customer.firstName || customer.name || customer.email || '';
    const clean = displayName.trim().replace(/[^a-zA-Z0-9]/g, '');
    return clean ? clean.charAt(0).toUpperCase() : 'C';
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isLoggedIn: !!customer,
        loading,
        login,
        register,
        logout,
        getInitial,
        updateProfile,
        updateAddresses,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => useContext(CustomerAuthContext);
