import React from 'react';
import { Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../Context/WishlistContext';
import { useCart } from '../Context/CartContext';

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleClearAll = () => {
    if (wishlistItems.length > 0) {
      if (window.confirm("Are you sure you want to clear your wishlist?")) {
        clearWishlist();
      }
    } else {
      alert("Your wishlist is already empty.");
    }
  };

  const getItemSlug = (item) => {
    if (item.slug) return item.slug;
    if (item.title) return item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return String(item.id);
  };

  const formatDisplayPrice = (val) => {
    if (!val) return '';
    if (typeof val === 'string' && val.includes('Rs.')) {
      return val.replace(/\s*INR/gi, '');
    }
    const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.]/g, '')) || 0;
    return `Rs. ${num.toLocaleString('en-IN')}.00`;
  };

  return (
    <div className="w-full min-h-screen bg-white font-sans text-dark flex flex-col">
      {/* Dark Header Banner */}
      <div className="w-full bg-dark pt-20 pb-16 px-4 sm:px-6 md:px-8 lg:px-30 text-white">
        <div className="w-full max-w-362.5 mx-auto">
          {/* Back to Home Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 text-white/90 hover:text-white transition-colors mb-6 group cursor-pointer w-fit"
          >
            <span className="w-7 h-7 rounded-full border border-white/50 flex items-center justify-center group-hover:border-white group-hover:bg-white/10 transition-all shrink-0">
              <ArrowLeft size={13} strokeWidth={2} />
            </span>
            <span className="text-xs md:text-sm font-medium">Back to Home</span>
          </button>

          {/* Title + Subtitle */}
          <div className="max-w-3xl">
            <h1 className="text-white text-3xl md:text-3xl font-bold tracking-tight mb-4 leading-tight">
              Wishlist
            </h1>
            <p className="text-xs md:text-sm font-normal text-white/80 leading-relaxed max-w-2xl">
              we are driven by a passion for learning, discovery, and connection. We constantly strive to enhance our platform, incorporate emerging technologies, and adapt to the evolving needs of our users.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 flex-1">
        
        {/* Wishlist Header with Count */}
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-dark mb-8 sm:mb-10 text-center">
          Wishlist({wishlistItems.length})
        </h2>

        {/* Gray Rounded Table Header Bar - Visible on tablet/desktop */}
        <div className="hidden md:grid w-full bg-[#f1ebe5] rounded-2xl py-3.5 px-6 grid-cols-12 items-center font-bold text-xs sm:text-sm text-dark mb-6 shadow-xs select-none border border-dark/10">
          <div className="col-span-3 text-center">Product</div>
          <div className="col-span-4 text-left pl-6">Details</div>
          <div className="col-span-3 text-center">Action</div>
          <div className="col-span-2 text-center">Remove</div>
        </div>

        {/* Items List or Empty State */}
        {wishlistItems.length === 0 ? (
          <div className="w-full py-16 text-center text-gray-500 font-medium text-sm my-6 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50 p-8">
            <p className="text-base font-bold text-dark mb-2">Your wishlist is currently empty.</p>
            <p className="text-xs text-gray-500 mb-6">Explore our curated collections to add properties to your wishlist.</p>
            <button
              onClick={() => navigate('/collections/bestseller')}
              className="bg-dark hover:bg-black text-white font-bold rounded-full py-2.5 px-7 text-xs transition-colors cursor-pointer"
            >
              Explore Properties
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col divide-y divide-gray-200">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col md:grid md:grid-cols-12 items-center py-6 gap-4 md:gap-3"
              >
                {/* 1. Product Image Column */}
                <div className="w-full md:w-auto md:col-span-3 flex justify-center items-center">
                  <div
                    onClick={() => navigate(`/product/${getItemSlug(item)}`)}
                    className="w-72 sm:w-84 md:w-full h-48 sm:h-54 md:h-36 rounded-2xl overflow-hidden cursor-pointer shadow-xs hover:opacity-90 transition-opacity bg-gray-100 shrink-0"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* 2. Details Column */}
                <div className="w-full md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left px-2 md:pl-6 justify-center">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">
                    {item.category || 'Real Estate'}
                  </span>
                  
                  <h2
                    onClick={() => navigate(`/product/${getItemSlug(item)}`)}
                    className="text-base sm:text-lg md:text-xl font-bold text-dark leading-tight mb-1.5 cursor-pointer hover:underline"
                  >
                    {item.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-gray-600 font-normal mb-2 leading-relaxed">
                    {Array.isArray(item.sizes)
                      ? item.sizes.join(', ')
                      : (item.size || '1700 sq fit, 1600 sq fit, 1800 sq fit')}
                  </p>

                  <div className="text-sm sm:text-base text-dark font-extrabold flex items-center gap-2">
                    <span>{formatDisplayPrice(item.price)}</span>
                    {item.oldPrice && (
                      <span className="text-xs text-gray-400 line-through font-normal">
                        {formatDisplayPrice(item.oldPrice)}
                      </span>
                    )}
                  </div>

                  {/* Mobile-only Action & Remove row */}
                  <div className="flex md:hidden items-center justify-center gap-3 mt-4 w-full">
                    <button
                      type="button"
                      onClick={() =>
                        addToCart({
                          id: item.id,
                          slug: getItemSlug(item),
                          title: item.title,
                          price: item.price,
                          image: item.image,
                          size: item.size || (Array.isArray(item.sizes) ? item.sizes[0] : '1700 sq fit'),
                          quantity: 1,
                        })
                      }
                      className="bg-dark hover:bg-black text-white font-bold rounded-full py-2.5 px-8 text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
                    >
                      Add to Cart
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-2.5 cursor-pointer inline-flex items-center justify-center rounded-xl hover:bg-red-50 border border-red-200"
                      aria-label={`Remove ${item.title} from wishlist`}
                      title="Delete item"
                    >
                      <Trash2 size={18} strokeWidth={1.8} />
                    </button>
                  </div>
                </div>

                {/* 3. Cart Button Column (Tablet/Desktop) */}
                <div className="hidden md:flex md:col-span-3 justify-center items-center">
                  <button
                    type="button"
                    onClick={() =>
                      addToCart({
                        id: item.id,
                        slug: getItemSlug(item),
                        title: item.title,
                        price: item.price,
                        image: item.image,
                        size: item.size || (Array.isArray(item.sizes) ? item.sizes[0] : '1700 sq fit'),
                        quantity: 1,
                      })
                    }
                    className="bg-dark hover:bg-black text-white font-bold rounded-full py-2.5 px-6 text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
                  >
                    Add to Cart
                  </button>
                </div>

                {/* 4. Delete Column (Tablet/Desktop) */}
                <div className="hidden md:flex md:col-span-2 justify-center items-center">
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(item.id)}
                    className="text-red-500 hover:text-red-700 transition-colors p-2.5 cursor-pointer inline-flex items-center justify-center rounded-xl hover:bg-red-50"
                    aria-label={`Remove ${item.title} from wishlist`}
                    title="Delete item"
                  >
                    <Trash2 size={22} strokeWidth={1.8} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Clear All Button */}
        {wishlistItems.length > 0 && (
          <div className="flex justify-center mt-8 sm:mt-10">
            <button
              type="button"
              onClick={handleClearAll}
              className="bg-dark hover:bg-black text-white font-bold rounded-full py-2.5 px-8 sm:px-10 text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
            >
              Clear All
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Wishlist;
