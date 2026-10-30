import React, { useEffect, useState } from 'react';
import { X, Trash2, Truck, Plus, Minus, Ticket, Gift, Tag, Sparkles, CalendarDays, Check } from 'lucide-react';
import { useCart } from '../Context/CartContext';
import { useNavigate } from 'react-router-dom';
import imgDarthVader from '../Images/1_8c387548-6a1e-4930-890a-cec2491c0d60_600x600.webp';
import imgEastSide from '../Images/1_600x600.webp';
import imgWhiteHouse from '../Images/1_37a9cf7c-0609-4e7a-9358-c00ba0bb57e7_600x600.webp';
import imgWheelwright from '../Images/1_2366d2e8-e3d8-40cd-b6c9-c6a92538670e_600x600.webp';

const CartDrawer = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    totalItems,
    subtotal,
    discountAmount,
    finalPayable,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    formatPrice
  } = useCart();

  const navigate = useNavigate();
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState(null);

  const handleApplyCoupon = (codeToApply) => {
    const target = codeToApply || couponCodeInput;
    const res = applyCoupon(target);
    setCouponFeedback(res);
    if (res.success) {
      setCouponCodeInput('');
      setTimeout(() => setCouponFeedback(null), 3500);
    }
  };

  const recommendedItems = [
    {
      id: 'east-side-living',
      title: 'East Side Living',
      price: 'Rs. 98,900.00',
      priceNum: 98900,
      image: imgEastSide,
      link: '/product/east-side-living'
    },
    {
      id: 'the-white-house',
      title: 'The White House J-54',
      price: 'Rs. 290,400.00',
      priceNum: 290400,
      image: imgWhiteHouse,
      link: '/product/the-white-house-j-54'
    },
    {
      id: 'wheelwright-cottage',
      title: 'Wheelwright Cottage House',
      price: 'Rs. 879,900.00',
      priceNum: 879900,
      image: imgWheelwright,
      link: '/product/wheelwright-cottage-house'
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide every 4 seconds when drawer is open
  useEffect(() => {
    if (!isCartOpen) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % recommendedItems.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isCartOpen, recommendedItems.length]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsCartOpen(false);
      }
    };
    if (isCartOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isCartOpen, setIsCartOpen]);

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={() => setIsCartOpen(false)}
        className={`fixed inset-0 bg-black/70 backdrop-blur-xs z-[9998] transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Slide-over Right Cart Drawer */}
      <div
        className={`fixed inset-y-0 right-0 h-screen max-h-dvh w-full max-w-full sm:max-w-md bg-white z-[9999] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-in-out font-sans ${
          isCartOpen ? 'translate-x-0 opacity-100 visible pointer-events-auto' : 'translate-x-full opacity-0 invisible pointer-events-none'
        }`}
      >
        {/* --- Top Header (Dark - Fixed) --- */}
        <div className="bg-dark text-white h-15 px-4 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-white/90 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X size={20} strokeWidth={2.2} />
            </button>
            <h2 className="text-lg font-bold tracking-tight text-white">My Cart</h2>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-white/90">
            {totalItems} {totalItems === 1 ? 'ITEM' : 'ITEMS'}
          </span>
        </div>

        {/* --- Scrollable Body (Only this middle section scrolls) --- */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar px-5 py-4 space-y-5">
          {/* Free Shipping Banner */}
          <div>
            <p className="text-xs sm:text-sm font-bold text-dark mb-2.5">
              Congrats! You are eligible for <span className="font-extrabold">FREE Shipping</span>
            </p>
            {/* Striped progress bar + truck icon */}
            <div className="w-full flex items-center gap-2">
              <div
                className="flex-1 h-3 rounded-full relative overflow-hidden shadow-inner"
                style={{
                  background:
                    'repeating-linear-gradient(45deg, #1a232c, #1a232c 8px, #2d3b48 8px, #2d3b48 16px)'
                }}
              />
              <div className="w-8 h-8 rounded-full bg-dark text-white flex items-center justify-center shrink-0 shadow-sm">
                <Truck size={16} strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Cart Items List */}
          {cartItems.length === 0 ? (
            <div className="py-8 text-center text-gray-500 font-medium text-sm border border-dashed border-black/30 rounded-2xl bg-gray-50/50 p-6">
              <p className="mb-3 text-gray-600 font-semibold">Your cart is currently empty.</p>
              <button
                onClick={() =>
                  addToCart({
                    id: 'darth-vader-house-a24',
                    title: 'Darth Vader House A- 24',
                    size: '1300 sq fit',
                    price: 678500,
                    quantity: 1,
                    image: imgDarthVader
                  })
                }
                className="bg-[#faede3] hover:bg-dark hover:text-white text-dark rounded-full py-2 px-5 text-xs font-bold transition-all border border-black/20 cursor-pointer shadow-xs"
              >
                + Add Darth Vader House
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-black p-3.5 bg-white flex flex-col gap-2 relative shadow-xs"
                >
                  <div className="flex gap-3.5">
                    {/* Thumbnail */}
                    <img
                      src={item.image}
                      alt={item.title}
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate(`/product/${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`);
                      }}
                      className="w-22 h-18 object-cover rounded-lg border border-black/10 shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
                    />

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3
                          onClick={() => {
                            setIsCartOpen(false);
                            navigate(`/product/${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`);
                          }}
                          className="text-sm font-bold text-dark leading-tight mb-1 cursor-pointer hover:underline"
                        >
                          {item.title}
                        </h3>
                        {item.size && (
                          <p className="text-xs font-semibold text-gray-700">
                            Size: <span className="font-normal text-gray-600">{item.size}</span>
                          </p>
                        )}
                      </div>

                      {/* Quantity pill and delete */}
                      <div className="flex items-center justify-between mt-2">
                        {/* Qty Pill */}
                        <div className="rounded-full border border-black px-2.5 py-0.5 flex items-center gap-3 w-fit text-xs font-bold text-dark">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="text-gray-700 hover:text-black transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={11} strokeWidth={2.5} />
                          </button>
                          <span className="min-w-3 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="text-gray-700 hover:text-black transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus size={11} strokeWidth={2.5} />
                          </button>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1 cursor-pointer"
                          aria-label="Delete item"
                        >
                          <Trash2 size={16} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="pt-1 text-right">
                    <span className="font-extrabold text-sm text-dark">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* "You may also like" Section with 3-Item Slider */}
          <div className="pt-2">
            <h3 className="text-base font-bold text-dark mb-3">You may also like</h3>

            {/* Slider Viewport */}
            <div className="relative overflow-hidden rounded-2xl">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {recommendedItems.map((item) => (
                  <div key={item.id} className="w-full shrink-0">
                    <div className="rounded-2xl border border-black p-4 bg-white flex items-center gap-4 shadow-xs">
                      {/* Image Thumbnail */}
                      <div
                        onClick={() => {
                          setIsCartOpen(false);
                          navigate(item.link);
                        }}
                        className="w-20 h-20 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-black/10 cursor-pointer hover:opacity-85 transition-opacity"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h4
                          onClick={() => {
                            setIsCartOpen(false);
                            navigate(item.link);
                          }}
                          className="text-base font-bold text-dark leading-tight cursor-pointer hover:underline"
                        >
                          {item.title}
                        </h4>
                        <p className="text-sm font-semibold text-dark mt-1">
                          {item.price}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCartOpen(false);
                            navigate(item.link);
                          }}
                          className="text-xs font-bold text-dark underline cursor-pointer mt-2 hover:text-black block"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3-Dot Slider Indicator (Matching Screenshot Exactly) */}
            <div className="flex items-center justify-center gap-2.5 mt-3">
              {recommendedItems.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to item ${index + 1}`}
                  className="p-1 cursor-pointer flex items-center justify-center transition-all focus:outline-none"
                >
                  {currentSlide === index ? (
                    <span className="w-3.5 h-3.5 rounded-full border border-black flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                    </span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-black opacity-80 hover:opacity-100 transition-opacity"></span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- Bottom Pinned / Non-scrolling Section --- */}
        <div className="shrink-0 bg-white border-t border-black/10 select-none shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          <div className="px-5 pt-3.5 pb-3 space-y-3">
            {/* Action Quick Buttons (Offer & Site Visit) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowCouponInput((prev) => !prev)}
                className={`rounded-2xl py-2.5 px-3 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 text-xs font-bold border ${
                  appliedCoupon
                    ? 'bg-amber-500 hover:bg-amber-600 text-black border-amber-400'
                    : 'bg-dark hover:bg-black text-white border-dark'
                }`}
                title="Apply verified buyer coupon or fee waiver"
              >
                <Ticket size={16} strokeWidth={2.2} />
                <span>{appliedCoupon ? appliedCoupon.code : 'Apply Promo'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/collections/properties');
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-2xl py-2.5 px-3 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 text-xs font-bold"
                title="Schedule a physical or virtual site visit"
              >
                <CalendarDays size={16} strokeWidth={2.2} className="text-amber-600" />
                <span>Site Visit</span>
              </button>
            </div>

            {/* Collapsible Coupon Input Drawer */}
            {showCouponInput && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-900">
                    <Sparkles size={14} className="text-amber-600" />
                    <span>Real Estate Promo & Waivers</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCouponInput(false)}
                    className="text-gray-400 hover:text-black p-0.5"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyCoupon();
                      }
                    }}
                    placeholder="Enter code (e.g. LUXURY2026)"
                    className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold uppercase text-dark focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    className="bg-dark hover:bg-black text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
                  >
                    Apply
                  </button>
                </div>

                {/* Available Quick Codes */}
                <div className="pt-1">
                  <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wide mb-1.5">
                    Click to auto-apply active offer:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {['LUXURY2026', 'STAMPFREE', 'FIRSTTOUR'].map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => handleApplyCoupon(code)}
                        className={`text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          appliedCoupon?.code === code
                            ? 'bg-amber-500 text-black border-amber-600 shadow-2xs'
                            : 'bg-white hover:bg-amber-100 text-dark border-amber-300'
                        }`}
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>

                {couponFeedback && (
                  <p
                    className={`text-[11px] font-bold mt-1 ${
                      couponFeedback.success ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {couponFeedback.message}
                  </p>
                )}
              </div>
            )}

            {/* Applied Coupon Badge */}
            {appliedCoupon && (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-2 rounded-xl text-xs font-semibold">
                <div className="flex items-center gap-2 truncate">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span className="truncate">
                    <strong className="font-mono">{appliedCoupon.code}</strong>: {appliedCoupon.discount}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-emerald-700 hover:text-red-600 font-bold ml-2 p-0.5 cursor-pointer shrink-0"
                  title="Remove coupon"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Total & Subtotal Section */}
            <div className="border-t border-black/15 pt-3 space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Total Properties</span>
                <span className="font-extrabold text-dark">{totalItems}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-xs text-emerald-600 font-bold">
                  <span>Offer Savings</span>
                  <span>- {formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    {discountAmount > 0 ? 'Payable Total' : 'Subtotal'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base sm:text-lg font-extrabold text-dark">
                    {formatPrice(finalPayable)}
                  </p>
                  {discountAmount > 0 && (
                    <p className="text-[10px] text-gray-400 line-through">
                      {formatPrice(subtotal)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Split Buttons */}
          <div className="flex w-full border-t border-black/10 select-none">
            <button
              onClick={() => {
                setIsCartOpen(false);
                navigate('/cart');
              }}
              className="w-1/2 bg-dark hover:bg-[#253240] text-white font-bold py-4 text-center text-xs sm:text-sm tracking-wide transition-colors cursor-pointer"
            >
              View Cart
            </button>
            <button
              onClick={() => {
                setIsCartOpen(false);
                navigate('/checkout');
              }}
              className="w-1/2 bg-black hover:bg-gray-900 text-white font-bold py-4 text-center text-xs sm:text-sm tracking-wide transition-colors cursor-pointer border-l border-white/10"
            >
              Proceed to checkout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
