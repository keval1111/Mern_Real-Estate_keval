import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import cat2Img from '../Images/cat-2.avif';

const WishlistContext = createContext();

const STORAGE_KEY = 'real_estate_wishlist_v2';
const API_BASE = 'http://localhost:5000/api/wishlist';

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load wishlist from storage:', e);
    }
    return [
      {
        id: 'family-villas-c-92',
        slug: 'family-villas-c-92',
        title: 'Family Villas C-92',
        image: cat2Img,
        price: 'Rs. 630,200.00',
        oldPrice: 'Rs. 678,700.00',
        category: 'Real Estate',
        sizes: ['1700 sq fit', '1600 sq fit', '1800 sq fit'],
        size: '1700 sq fit',
      },
    ];
  });

  const [isLoading, setIsLoading] = useState(false);

  // Helper to get auth headers / email
  const getAuthDetails = () => {
    try {
      const token = localStorage.getItem('customer_token');
      const userStr = localStorage.getItem('customer_user');
      const user = userStr ? JSON.parse(userStr) : null;
      return {
        token: token || user?.token || '',
        email: user?.email || '',
      };
    } catch {
      return { token: '', email: '' };
    }
  };

  // Sync wishlist from backend database on mount
  const syncWishlistFromBackend = useCallback(async () => {
    const { token, email } = getAuthDetails();
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (email) headers['X-User-Email'] = email;

      const url = email ? `${API_BASE}?email=${encodeURIComponent(email)}` : API_BASE;
      const res = await fetch(url, { headers });
      if (!res.ok) return;

      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        if (data.data.length > 0) {
          const mapped = data.data.map((item) => ({
            id: item._id || item.id || item.slug,
            _id: item._id,
            slug: item.slug || (item.title ? item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : ''),
            title: item.title,
            image: item.image,
            price: item.price ? (item.price.startsWith('$') ? item.price : `$${item.price}`) : 'Rs. 630,200.00',
            oldPrice: item.oldPrice || null,
            category: item.category || 'Real Estate',
            size: item.sqft ? `${item.sqft} sq ft` : '1500 sq ft',
            sizes: ['1200 sq ft', '1500 sq ft', '1800 sq ft'],
          }));
          setWishlistItems(mapped);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
        }
      }
    } catch (err) {
      console.warn('Backend wishlist sync skipped (offline mode):', err);
    }
  }, []);

  useEffect(() => {
    syncWishlistFromBackend();
  }, [syncWishlistFromBackend]);

  // Persist to localStorage whenever wishlistItems change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistItems));
    } catch (e) {
      console.error('Failed to save wishlist to storage:', e);
    }
  }, [wishlistItems]);

  const isInWishlist = (idOrSlug) => {
    if (!idOrSlug) return false;
    const target = String(idOrSlug).toLowerCase();
    return wishlistItems.some(
      (item) =>
        String(item.id).toLowerCase() === target ||
        (item._id && String(item._id).toLowerCase() === target) ||
        (item.slug && item.slug.toLowerCase() === target) ||
        (item.title &&
          item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === target)
    );
  };

  const toggleWishlist = async (product) => {
    if (!product) return;
    const identifier = product._id || product.id || product.slug || product.title;
    const inWish = isInWishlist(identifier);

    // 1. Optimistic UI update
    if (inWish) {
      removeFromWishlist(identifier);
    } else {
      addToWishlist(product);
    }

    // 2. Synchronize with MongoDB Backend API
    try {
      const { token, email } = getAuthDetails();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (email) headers['X-User-Email'] = email;

      const propParam = encodeURIComponent(product._id || product.slug || product.id || product.title);
      const url = email
        ? `${API_BASE}/toggle/${propParam}?email=${encodeURIComponent(email)}`
        : `${API_BASE}/toggle/${propParam}`;

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped = json.data.map((item) => ({
            id: item._id || item.id || item.slug,
            _id: item._id,
            slug: item.slug || (item.title ? item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : ''),
            title: item.title,
            image: item.image,
            price: item.price ? (item.price.startsWith('$') ? item.price : `$${item.price}`) : 'Rs. 630,200.00',
            oldPrice: item.oldPrice || null,
            category: item.category || 'Real Estate',
            size: item.sqft ? `${item.sqft} sq ft` : '1500 sq ft',
            sizes: ['1200 sq ft', '1500 sq ft', '1800 sq ft'],
          }));
          setWishlistItems(mapped);
        }
      }
    } catch (err) {
      console.warn('Backend wishlist toggle sync error:', err);
    }
  };

  const addToWishlist = (product) => {
    if (!product) return;
    const identifier = product._id || product.id || product.slug || product.title;
    if (isInWishlist(identifier)) return;

    const slug =
      product.slug ||
      (product.title
        ? product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        : String(product.id || ''));

    const newItem = {
      id: product._id || product.id || slug,
      _id: product._id,
      slug: slug,
      title: product.title || 'Luxury Real Estate',
      image: product.image,
      price: product.price || 'Rs. 630,200.00',
      oldPrice: product.oldPrice || null,
      category: product.category || 'Real Estate',
      sizes: product.sizes || (product.size ? [product.size] : ['1700 sq fit', '1600 sq fit', '1800 sq fit']),
      size: product.size || product.defaultSize || (product.sizes && product.sizes[0]) || '1700 sq fit',
    };

    setWishlistItems((prev) => [newItem, ...prev]);
  };

  const removeFromWishlist = async (idOrSlug) => {
    if (!idOrSlug) return;
    const target = String(idOrSlug).toLowerCase();

    // 1. Optimistic removal
    setWishlistItems((prev) =>
      prev.filter(
        (item) =>
          String(item.id).toLowerCase() !== target &&
          (!item._id || String(item._id).toLowerCase() !== target) &&
          (!item.slug || item.slug.toLowerCase() !== target) &&
          (!item.title ||
            item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') !== target)
      )
    );

    // 2. Synchronize deletion with MongoDB
    try {
      const { token, email } = getAuthDetails();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (email) headers['X-User-Email'] = email;

      const url = email
        ? `${API_BASE}/toggle/${encodeURIComponent(idOrSlug)}?email=${encodeURIComponent(email)}`
        : `${API_BASE}/toggle/${encodeURIComponent(idOrSlug)}`;

      await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      console.warn('Backend wishlist remove sync error:', err);
    }
  };

  const clearWishlist = async () => {
    setWishlistItems([]);
    try {
      const { token, email } = getAuthDetails();
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (email) headers['X-User-Email'] = email;

      const url = email ? `${API_BASE}?email=${encodeURIComponent(email)}` : API_BASE;
      await fetch(url, { method: 'DELETE', headers });
    } catch (err) {
      console.warn('Backend clear wishlist sync error:', err);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlist: wishlistItems,
        wishlistCount: wishlistItems.length,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        syncWishlistFromBackend,
        isLoading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

// oxlint-disable-next-line react/only-export-components
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
