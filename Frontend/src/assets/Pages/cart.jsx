import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Minus, Gift, ShoppingBag, Loader2, Ticket, Check, X, Sparkles } from 'lucide-react';
import { useCart } from '../Context/CartContext';
import { useCustomerAuth } from '../Context/CustomerAuthContext';

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    formatPrice,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discountAmount,
    finalPayable
  } = useCart();
  const { customer, isLoggedIn } = useCustomerAuth();
  const [giftWrap, setGiftWrap] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState(null);

  const giftWrapFee = giftWrap ? 500 : 0;
  const finalPayableTotal = Math.max(0, finalPayable + giftWrapFee);

  const handleApply = (code) => {
    const target = code || couponInput;
    const res = applyCoupon(target);
    setCouponMsg(res);
    if (res.success) {
      setCouponInput('');
      setTimeout(() => setCouponMsg(null), 3500);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    navigate('/checkout');
  };

  return (
    <div className="w-full min-h-screen bg-white font-sans text-dark flex flex-col">
      <div className="w-full max-w-8xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-10 flex-1">
        
        {/* Continue Shopping Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/collections/bestseller')}
            className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-dark hover:opacity-75 transition-opacity cursor-pointer group"
          >
            <span className="w-8 h-8 rounded-full border border-black flex items-center justify-center transition-all group-hover:bg-dark group-hover:text-white">
              <ArrowLeft size={14} strokeWidth={2.2} />
            </span>
            <span>Continue shopping</span>
          </button>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-dark tracking-tight mb-8">
          Your cart
        </h1>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="py-20 text-center border border-dashed border-black/30 rounded-3xl bg-gray-50/50 p-8 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#faede3] text-dark flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={28} />
            </div>
            <h2 className="text-xl font-bold text-dark mb-2">Your cart is currently empty</h2>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              Before proceed to checkout you must add some properties or items to your shopping cart.
            </p>
            <button
              onClick={() => navigate('/collections/bestseller')}
              className="bg-dark hover:bg-black text-white font-bold py-3 px-8 rounded-full text-sm transition-all shadow-sm cursor-pointer"
            >
              Explore Properties
            </button>
          </div>
        ) : (
          /* Main 2-Column Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Table of Cart Items & Gift Wrap Banner */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Table Wrapper */}
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black text-xs font-bold uppercase tracking-wider text-dark">
                      <th className="py-3 px-2 w-28">IMAGE</th>
                      <th className="py-3 px-2">NAME</th>
                      <th className="py-3 px-2 text-center w-36">PRICE</th>
                      <th className="py-3 px-2 text-center w-32">QUANTITY</th>
                      <th className="py-3 px-2 text-right w-44">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cartItems.map((item) => (
                      <tr key={item.id} className="align-middle">
                        {/* Image */}
                        <td className="py-5 px-2">
                          <img
                            src={item.image}
                            alt={item.title}
                            onClick={() => navigate(`/product/${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`)}
                            className="w-24 h-18 object-cover rounded-xl border border-black/10 shadow-xs cursor-pointer hover:opacity-85 transition-opacity"
                          />
                        </td>

                        {/* Name & Details */}
                        <td className="py-5 px-2">
                          <p className="text-xs font-semibold text-gray-500 mb-0.5">Real Estate</p>
                          <h3
                            onClick={() => navigate(`/product/${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`)}
                            className="text-sm sm:text-base font-bold text-dark hover:underline cursor-pointer leading-snug"
                          >
                            {item.title}
                          </h3>
                          {item.size && (
                            <p className="text-xs text-gray-600 mt-1">
                              Size: <span className="font-medium">{item.size}</span>
                            </p>
                          )}
                        </td>

                        {/* Unit Price */}
                        <td className="py-5 px-2 text-center text-xs sm:text-sm font-semibold text-dark whitespace-nowrap">
                          {formatPrice(item.price)}
                        </td>

                        {/* Quantity Pill */}
                        <td className="py-5 px-2 text-center">
                          <div className="inline-flex items-center justify-between gap-3 border border-black rounded-full px-3 py-1 text-xs font-bold text-dark">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="text-gray-700 hover:text-black transition-colors cursor-pointer p-0.5"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} strokeWidth={2.5} />
                            </button>
                            <span className="min-w-4 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="text-gray-700 hover:text-black transition-colors cursor-pointer p-0.5"
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} strokeWidth={2.5} />
                            </button>
                          </div>
                        </td>

                        {/* Total & Delete Button */}
                        <td className="py-5 px-2 text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-3.5">
                            <span className="text-xs sm:text-sm font-bold text-dark">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1 cursor-pointer"
                              aria-label={`Remove ${item.title}`}
                            >
                              <Trash2 size={16} strokeWidth={2} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Gift Wrap Offer Banner */}
              <div className="bg-[#faede3] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                <div className="flex items-center gap-3.5 text-center sm:text-left">
                  <div className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center shrink-0 text-dark">
                    <Gift size={20} strokeWidth={2} />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-dark">
                    Add a Gift Wrap to your order, For Rs. 500.00
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setGiftWrap((prev) => !prev)}
                  className={`rounded-full px-6 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-xs ${
                    giftWrap
                      ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                      : 'bg-dark text-white hover:bg-black'
                  }`}
                >
                  {giftWrap ? 'Gift Wrap Added ✓' : 'Add a Gift Wrap'}
                </button>
              </div>
            </div>

            {/* Right Column: Order Special Instructions & Subtotal */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Order Special Instructions Box */}
              <div>
                <label
                  htmlFor="special-instructions"
                  className="block text-xs font-bold uppercase tracking-wider text-dark mb-2"
                >
                  ORDER SPECIAL INSTRUCTIONS
                </label>
                <textarea
                  id="special-instructions"
                  rows={4}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Order special instructions"
                  className="w-full rounded-2xl border border-black p-4 text-sm text-dark placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-black resize-none bg-white transition-all shadow-2xs"
                />
              </div>

              {/* Subtotal & Checkout Card */}
              <div className="rounded-2xl border border-black p-6 bg-white shadow-2xs flex flex-col gap-4">
                {/* Apply Coupon Box */}
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-900">
                    <Ticket size={14} className="text-amber-600" />
                    <span>Real Estate Promo Code</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApply();
                        }
                      }}
                      placeholder="e.g. LUXURY2026"
                      className="flex-1 bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold uppercase text-dark focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleApply()}
                      className="bg-dark hover:bg-black text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0"
                    >
                      Apply
                    </button>
                  </div>

                  {couponMsg && (
                    <p className={`text-[11px] font-bold ${couponMsg.success ? 'text-emerald-700' : 'text-red-600'}`}>
                      {couponMsg.message}
                    </p>
                  )}

                  {appliedCoupon && (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-900 px-2.5 py-1.5 rounded-lg text-xs font-semibold">
                      <div className="flex items-center gap-1.5 truncate">
                        <Check size={12} className="text-emerald-600 shrink-0" />
                        <span className="truncate">
                          <strong>{appliedCoupon.code}</strong>: {appliedCoupon.discount}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-emerald-700 hover:text-red-600 font-bold ml-1 p-0.5 cursor-pointer shrink-0"
                        title="Remove coupon"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-1 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Base Subtotal</span>
                    <span className="font-semibold text-dark">{formatPrice(subtotal)}</span>
                  </div>

                  {giftWrap && (
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Gift Option</span>
                      <span className="font-semibold text-dark">{formatPrice(giftWrapFee)}</span>
                    </div>
                  )}

                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-sm text-emerald-600 font-bold">
                      <span>Promo Discount</span>
                      <span>- {formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-black/10">
                    <span className="text-lg font-bold text-dark">Payable Amount</span>
                    <span className="text-lg sm:text-xl font-extrabold text-dark">
                      {formatPrice(finalPayableTotal)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 font-medium">
                  Registration deeds & token receipts issued instantly upon checkout.
                </p>

                <button
                  type="button"
                  disabled={isCheckingOut}
                  onClick={handleCheckout}
                  className="w-full bg-dark hover:bg-black text-white font-bold py-3.5 px-6 rounded-full text-sm transition-all cursor-pointer mt-2 shadow-sm active:scale-[0.99] text-center flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Placing Booking Request...</span>
                    </>
                  ) : (
                    <span>Proceed to Checkout</span>
                  )}
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Cart;
