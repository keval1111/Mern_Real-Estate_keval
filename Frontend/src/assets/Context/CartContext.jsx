import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import imgDarthVader from '../Images/1_8c387548-6a1e-4930-890a-cec2491c0d60_600x600.webp';
import imgEastSide from '../Images/1_600x600.webp';

const CartContext = createContext();

const CART_STORAGE_KEY = 'real_estate_cart_v1';

export const CartProvider = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load cart from storage:', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to storage:', e);
    }
  }, [cartItems]);

  const recommendedItem = {
    id: 'east-side-living',
    slug: 'east-side-living',
    title: 'East Side Living',
    size: '1200 sq fit',
    price: 98900,
    image: imgEastSide
  };

  const parsePrice = (priceVal) => {
    if (typeof priceVal === 'number' && !isNaN(priceVal)) return priceVal;
    if (!priceVal) return 98900;
    const cleaned = String(priceVal).replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 98900 : num;
  };

  const addToCart = (product) => {
    if (!product) return;

    const numericPrice = parsePrice(product.price ?? product.priceNumber);
    const qtyToAdd = Math.max(1, parseInt(product.quantity, 10) || 1);
    const chosenSize = product.size || product.defaultSize || 'Standard';

    // Unique cart id by product id / slug and size combination
    const cartItemId = product.id && String(product.id).includes(chosenSize)
      ? String(product.id)
      : `${product.slug || product.id || product.title}-${chosenSize}`;

    const itemToInsert = {
      ...product,
      id: cartItemId,
      slug: product.slug || (product.title ? product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : 'property'),
      title: product.title || 'Luxury Property',
      size: chosenSize,
      price: numericPrice,
      image: product.image || imgEastSide,
      quantity: qtyToAdd
    };

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === cartItemId);
      if (existingIndex > -1) {
        return prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + qtyToAdd }
            : item
        );
      }
      return [...prev, itemToInsert];
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const p = typeof item.price === 'number' ? item.price : parsePrice(item.price);
      return acc + p * (item.quantity || 1);
    }, 0);
  }, [cartItems]);

  const formatPrice = (amount) => {
    const val = typeof amount === 'number' ? amount : parsePrice(amount);
    return `Rs. ${val.toLocaleString('en-IN')}.00 INR`;
  };

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('real_estate_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem('real_estate_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('real_estate_coupon');
      }
    } catch (e) {
      console.error('Failed to sync coupon to storage:', e);
    }
  }, [appliedCoupon]);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'percentage') {
      const pct = Number(appliedCoupon.discountValue) || 5;
      return Math.round((subtotal * pct) / 100);
    }
    // Flat or default value
    const val = Number(appliedCoupon.discountValue) || 25000;
    return Math.min(val, subtotal);
  }, [appliedCoupon, subtotal]);

  const finalPayable = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const applyCoupon = (rawCode) => {
    if (!rawCode || !rawCode.trim()) {
      return { success: false, message: 'Please enter a valid offer or coupon code.' };
    }
    const cleanCode = rawCode.trim().toUpperCase().replace(/\s+/g, '');

    // 1. Check in admin_coupons from localStorage
    let allCoupons = [];
    try {
      const stored = localStorage.getItem('admin_coupons');
      if (stored) allCoupons = JSON.parse(stored);
    } catch {}

    // Fallback defaults if none stored yet
    if (!allCoupons || allCoupons.length === 0) {
      allCoupons = [
        {
          code: 'LUXURY2026',
          title: 'Rs. 25,000 Off Booking Advance',
          discount: 'Rs. 25,000 OFF',
          discountType: 'flat',
          discountValue: 25000,
          category: 'Booking Advance',
          status: 'Active'
        },
        {
          code: 'STAMPFREE',
          title: '100% Legal & Stamp Duty Guidance Waiver',
          discount: 'Legal Fee Waived',
          discountType: 'waiver',
          discountValue: 15000,
          category: 'Legal & Title Waiver',
          status: 'Active'
        },
        {
          code: 'FIRSTTOUR',
          title: 'Complimentary VIP Chauffeur Tour',
          discount: 'VIP Chauffeur Tour',
          discountType: 'perk',
          discountValue: 5000,
          category: 'Site Visit Perk',
          status: 'Active'
        },
        {
          code: 'MODULAR50',
          title: 'Rs. 50,000 Modular Kitchen Credit',
          discount: 'Rs. 50,000 Credit',
          discountType: 'credit',
          discountValue: 50000,
          category: 'Interior Fit-Out',
          status: 'Active'
        },
        {
          code: 'FESTIVE5',
          title: '5% Festive Special Privilege Discount',
          discount: '5% OFF Token',
          discountType: 'percentage',
          discountValue: 5,
          category: 'Festive Special',
          status: 'Active'
        }
      ];
    }

    const match = allCoupons.find(
      (c) => c.code.toUpperCase() === cleanCode
    );

    if (!match) {
      return { success: false, message: `Offer code "${cleanCode}" not found or invalid.` };
    }

    // Check expiry
    if (match.status === 'Expired') {
      return { success: false, message: `Offer code "${cleanCode}" has expired.` };
    }
    if (match.expiry && match.expiry !== 'Ongoing') {
      const exp = new Date(match.expiry);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (exp < today) {
        return { success: false, message: `Offer code "${cleanCode}" expired on ${match.expiry}.` };
      }
    }

    // Update usage count in admin_coupons
    try {
      const updatedList = allCoupons.map((c) =>
        c.code.toUpperCase() === cleanCode ? { ...c, usageCount: (c.usageCount || 0) + 1 } : c
      );
      localStorage.setItem('admin_coupons', JSON.stringify(updatedList));
      window.dispatchEvent(new Event('storage'));
    } catch {}

    setAppliedCoupon(match);
    return {
      success: true,
      message: `Coupon "${match.code}" applied! ${match.discount}`,
      coupon: match
    };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        isCartOpen,
        setIsCartOpen,
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
        discountAmount,
        finalPayable,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        formatPrice,
        recommendedItem
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// oxlint-disable-next-line react/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
