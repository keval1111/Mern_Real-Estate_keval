import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  User,
  ShoppingCart,
  LogOut,
  Package,
  MapPin,
  Truck,
  TrendingUp,
  Compass,
  Menu,
  X,
  Heart,
  ExternalLink,
  Globe
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../Context/CartContext';
import { useWishlist } from '../Context/WishlistContext';
import { useCustomerAuth } from '../Context/CustomerAuthContext';
import logoImg from '../Images/Logo.webp';
import bestsellerImg from '../Images/1567937_174_1.webp';
import farmVilaImg from '../Images/3d-rendering-house-model.webp';
import propertiesImg from '../Images/3d-rendering-flat-building_1.webp';
import royalHouseImg from '../Images/3d-rendering-house-model_1.webp';

const languages = [
  { code: 'en', label: 'English', flag: 'https://flagcdn.com/w20/gb.png' },
  { code: 'ar', label: 'العربية', flag: 'https://flagcdn.com/w20/ar.png' },
  { code: 'de', label: 'Deutsch', flag: 'https://flagcdn.com/w20/de.png' },
  { code: 'es', label: 'Español', flag: 'https://flagcdn.com/w20/es.png' },
];

const currencies = [
  { code: 'AUD', symbol: '$', label: 'AUD $', flag: 'https://flagcdn.com/w20/au.png' },
  { code: 'CAD', symbol: '$', label: 'CAD $', flag: 'https://flagcdn.com/w20/ca.png' },
  { code: 'INR', symbol: '₹', label: 'INR ₹', flag: 'https://flagcdn.com/w20/in.png' },
  { code: 'USD', symbol: '$', label: 'USD $', flag: 'https://flagcdn.com/w20/us.png' },
];

const collectionItems = [
  {
    title: 'Bestseller',
    image: bestsellerImg,
    link: '/collections/bestseller',
  },
  {
    title: 'Farm Vila',
    image: farmVilaImg,
    link: '/collections/farm-vila',
  },
  {
    title: 'Properties',
    image: propertiesImg,
    link: '/collections/properties',
  },
  {
    title: 'Royal House',
    image: royalHouseImg,
    link: '/collections/royal-house',
  },
];

const pageItems = [
  { label: 'About us', link: '/pages/about-us' },
  { label: 'Contact with us', link: '/pages/contact-with-us' },
];

const blogItems = [
  { label: 'Blog Page', link: '/pages/blog' },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsCartOpen, totalItems, subtotal } = useCart();
  const { wishlistCount } = useWishlist();
  const { customer, isLoggedIn, logout, getInitial } = useCustomerAuth();
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const timeoutRef = useRef(null);

  const [isPagesOpen, setIsPagesOpen] = useState(false);
  const pagesTimeoutRef = useRef(null);
  const pagesRef = useRef(null);

  const [isBlogOpen, setIsBlogOpen] = useState(false);
  const blogTimeoutRef = useRef(null);
  const blogRef = useRef(null);

  const [isUserOpen, setIsUserOpen] = useState(false);
  const userRef = useRef(null);

  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef(null);

  const [selectedCurrency, setSelectedCurrency] = useState(currencies[2]); // Default to INR ₹
  const [isCurrOpen, setIsCurrOpen] = useState(false);
  const currRef = useRef(null);

  // Mobile navigation drawer states
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [mobileCollectionsExpanded, setMobileCollectionsExpanded] = useState(false);
  const [mobilePagesExpanded, setMobilePagesExpanded] = useState(false);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileNavOpen]);

  // Close dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
      if (currRef.current && !currRef.current.contains(event.target)) {
        setIsCurrOpen(false);
      }
      if (pagesRef.current && !pagesRef.current.contains(event.target)) {
        setIsPagesOpen(false);
      }
      if (blogRef.current && !blogRef.current.contains(event.target)) {
        setIsBlogOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setIsUserOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsLangOpen(false);
        setIsCurrOpen(false);
        setIsPagesOpen(false);
        setIsBlogOpen(false);
        setIsUserOpen(false);
        setIsMobileNavOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleLang = () => {
    setIsLangOpen((prev) => !prev);
    setIsCurrOpen(false);
    setIsPagesOpen(false);
    setIsBlogOpen(false);
    setIsUserOpen(false);
  };

  const toggleCurr = () => {
    setIsCurrOpen((prev) => !prev);
    setIsLangOpen(false);
    setIsPagesOpen(false);
    setIsBlogOpen(false);
    setIsUserOpen(false);
  };

  const toggleUser = () => {
    setIsUserOpen((prev) => !prev);
    setIsLangOpen(false);
    setIsCurrOpen(false);
    setIsPagesOpen(false);
    setIsBlogOpen(false);
    setIsCollectionsOpen(false);
  };

  const handleSelectLanguage = (lang) => {
    setSelectedLanguage(lang);
    setIsLangOpen(false);
  };

  const handleSelectCurrency = (curr) => {
    setSelectedCurrency(curr);
    setIsCurrOpen(false);
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsCollectionsOpen(true);
    setIsPagesOpen(false);
    setIsBlogOpen(false);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsCollectionsOpen(false);
    }, 180);
  };

  const handlePagesMouseEnter = () => {
    if (pagesTimeoutRef.current) clearTimeout(pagesTimeoutRef.current);
    setIsPagesOpen(true);
    setIsCollectionsOpen(false);
    setIsBlogOpen(false);
  };

  const handlePagesMouseLeave = () => {
    pagesTimeoutRef.current = setTimeout(() => {
      setIsPagesOpen(false);
    }, 180);
  };

  const handleBlogMouseEnter = () => {
    if (blogTimeoutRef.current) clearTimeout(blogTimeoutRef.current);
    setIsBlogOpen(true);
    setIsCollectionsOpen(false);
    setIsPagesOpen(false);
  };

  const handleBlogMouseLeave = () => {
    blogTimeoutRef.current = setTimeout(() => {
      setIsBlogOpen(false);
    }, 180);
  };

  return (
    <>
      <nav className="h-[85px] w-full bg-dark/95 backdrop-blur-md text-white flex items-center px-4 md:px-10 fixed top-0 left-0 right-0 z-50 shadow-md transition-all">
      <div className="w-full max-w-350 mx-auto flex justify-between items-center">
        
        {/* Mobile Hamburger Toggle Button (< lg) */}
        <div className="flex lg:hidden items-center">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            className="p-2 -ml-2 rounded-xl text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Desktop Left Links (>= lg) */}
        <ul className="hidden lg:flex items-center gap-8 flex-1 m-0 p-0 list-none">
          {['Apartments', 'Collections', 'Pages', 'Blog'].map((item) => {
            const isHome = item === 'Home' || item === 'Apartments';
            const isCollections = item === 'Collections';
            const isPages = item === 'Pages';
            const isBlog = item === 'Blog';
            const isHomeActive = isHome && location.pathname === '/';

            return (
              <li
                key={item}
                ref={isPages ? pagesRef : isBlog ? blogRef : undefined}
                onMouseEnter={
                  isHome
                    ? () => {
                        if (timeoutRef.current) clearTimeout(timeoutRef.current);
                        if (pagesTimeoutRef.current) clearTimeout(pagesTimeoutRef.current);
                        if (blogTimeoutRef.current) clearTimeout(blogTimeoutRef.current);
                        setIsCollectionsOpen(false);
                        setIsPagesOpen(false);
                        setIsBlogOpen(false);
                      }
                    : isCollections
                    ? handleMouseEnter
                    : isPages
                    ? handlePagesMouseEnter
                    : isBlog
                    ? handleBlogMouseEnter
                    : undefined
                }
                onMouseLeave={
                  isCollections
                    ? handleMouseLeave
                    : isPages
                    ? handlePagesMouseLeave
                    : isBlog
                    ? handleBlogMouseLeave
                    : undefined
                }
                onClick={
                  isHome
                    ? () => {
                        navigate('/');
                        setIsCollectionsOpen(false);
                        setIsPagesOpen(false);
                        setIsBlogOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    : isCollections
                    ? () => setIsCollectionsOpen((prev) => !prev)
                    : isPages
                    ? () => setIsPagesOpen((prev) => !prev)
                    : isBlog
                    ? () => setIsBlogOpen((prev) => !prev)
                    : undefined
                }
                className={`relative h-21.25 flex items-center gap-1.5 text-3.625 font-medium cursor-pointer transition-colors ${
                  (isCollections && isCollectionsOpen) || (isPages && isPagesOpen) || (isBlog && isBlogOpen) || isHomeActive
                    ? 'text-white'
                    : 'text-[#f7f7f7] hover:text-[#c9d1d9]'
                }`}
              >
                <span>{item}</span>
                <ChevronDown
                  size={14}
                  strokeWidth={2.5}
                  className={`transition-transform duration-300 ${
                    (isCollections && isCollectionsOpen) || (isPages && isPagesOpen) || (isBlog && isBlogOpen)
                      ? 'rotate-180'
                      : 'rotate-0'
                  }`}
                />

                {/* Pages Dropdown Menu (Only About us & Contact with us) */}
                {isPages && (
                  <div
                    onMouseEnter={handlePagesMouseEnter}
                    onMouseLeave={handlePagesMouseLeave}
                    className={`absolute top-[calc(100%-4px)] left-0 min-w-56 bg-white text-dark rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.18)] py-2.5 px-1.5 z-50 border border-black/5 transition-all duration-200 ease-out ${
                      isPagesOpen
                        ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                        : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      {pageItems.map((page) => (
                        <button
                          key={page.label}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(page.link);
                            setIsPagesOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-dark hover:bg-[#f4efe8] hover:text-black transition-colors cursor-pointer select-none"
                        >
                          {page.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Blog Dropdown Menu (Only Blog Page) */}
                {isBlog && (
                  <div
                    onMouseEnter={handleBlogMouseEnter}
                    onMouseLeave={handleBlogMouseLeave}
                    className={`absolute top-[calc(100%-4px)] left-0 min-w-56 bg-white text-dark rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.18)] py-2.5 px-1.5 z-50 border border-black/5 transition-all duration-200 ease-out ${
                      isBlogOpen
                        ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                        : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      {blogItems.map((blog) => (
                        <button
                          key={blog.label}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(blog.link);
                            setIsBlogOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-dark hover:bg-[#f4efe8] hover:text-black transition-colors cursor-pointer select-none"
                        >
                          {blog.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* Center Logo */}
        <div 
          onClick={() => navigate('/')}
          className="flex items-center justify-center cursor-pointer select-none px-2 sm:px-4"
        >
          <img src={logoImg} alt="Modern Real Estate" className="h-6 sm:h-6.75 object-contain" />
        </div>

        {/* Mobile Right Quick Action Icons (< lg) */}
        <div className="flex lg:hidden items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => navigate('/wishlist')}
            className="p-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors relative cursor-pointer"
            aria-label="Wishlist"
          >
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 bg-[#c39379] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="p-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors relative cursor-pointer"
            aria-label="Open Cart"
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute top-1 right-1 bg-white text-dark text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Desktop Right Actions (>= lg) */}
        <div className="hidden lg:flex items-center gap-2.5 xl:gap-3.5 flex-1 justify-end shrink-0">
          
          {/* Language Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              type="button"
              onClick={toggleLang}
              className="bg-transparent border-[1.5px] border-white text-white flex items-center gap-2 cursor-pointer transition-all hover:bg-white/10 rounded-full py-2 px-4 text-sm font-medium shrink-0 select-none whitespace-nowrap"
            >
              <img
                src={selectedLanguage.flag}
                alt={selectedLanguage.label}
                className="w-4.5 h-3.25 object-cover rounded-0.5 shrink-0"
              />
              <span>{selectedLanguage.label}</span>
              <ChevronDown
                size={15}
                strokeWidth={2.5}
                className={`w-3.75 h-3.75 min-w-3.75 shrink-0 text-white transition-transform duration-200 ${
                  isLangOpen ? 'rotate-180' : 'rotate-0'
                }`}
              />
            </button>

            {/* Language Menu */}
            <div
              className={`absolute top-[calc(100%+8px)] left-0 min-w-38.75 bg-white text-dark rounded-4.5 shadow-[0_12px_32px_rgba(0,0,0,0.22)] py-2 px-1.5 z-50 border border-black/5 transition-all duration-200 ease-out ${
                isLangOpen
                  ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                  : 'opacity-0 invisible -translate-y-2 pointer-events-none'
              }`}
            >
              <div className="flex flex-col gap-0.5">
                {languages.map((lang) => {
                  const isSelected = selectedLanguage.code === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleSelectLanguage(lang)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-3 text-sm text-left transition-colors cursor-pointer select-none ${
                        isSelected
                          ? 'bg-[#f4efe8] font-bold text-dark'
                          : 'text-[#2b3340] font-medium hover:bg-[#f7f7f8]'
                      }`}
                    >
                      <img
                        src={lang.flag}
                        alt={lang.label}
                        className="w-4.75 h-3.25 object-cover rounded-0.5 shrink-0"
                      />
                      <span>{lang.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Currency Dropdown */}
          <div className="relative" ref={currRef}>
            <button
              type="button"
              onClick={toggleCurr}
              className="bg-transparent border-[1.5px] border-white text-white flex items-center gap-2 cursor-pointer transition-all hover:bg-white/10 rounded-full py-2 px-4 text-sm font-medium shrink-0 select-none whitespace-nowrap"
            >
              <img
                src={selectedCurrency.flag}
                alt={selectedCurrency.code}
                className="w-4.5 h-3.25 object-cover rounded-0.5 shrink-0"
              />
              <span>{selectedCurrency.code}</span>
              <ChevronDown
                size={15}
                strokeWidth={2.5}
                className={`w-3.75 h-3.75 min-w-3.75 shrink-0 text-white transition-transform duration-200 ${
                  isCurrOpen ? 'rotate-180' : 'rotate-0'
                }`}
              />
            </button>

            {/* Currency Menu */}
            <div
              className={`absolute top-[calc(100%+8px)] left-0 min-w-36.25 bg-white text-dark rounded-4.5 shadow-[0_12px_32px_rgba(0,0,0,0.22)] py-2 px-1.5 z-50 border border-black/5 transition-all duration-200 ease-out ${
                isCurrOpen
                  ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                  : 'opacity-0 invisible -translate-y-2 pointer-events-none'
              }`}
            >
              <div className="flex flex-col gap-0.5">
                {currencies.map((curr) => {
                  const isSelected = selectedCurrency.code === curr.code;
                  return (
                    <button
                      key={curr.code}
                      type="button"
                      onClick={() => handleSelectCurrency(curr)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-3 text-sm text-left transition-colors cursor-pointer select-none ${
                        isSelected
                          ? 'bg-[#f4efe8] font-bold text-dark'
                          : 'text-[#2b3340] font-medium hover:bg-[#f7f7f8]'
                      }`}
                    >
                      <img
                        src={curr.flag}
                        alt={curr.code}
                        className="w-4.75 h-3.25 object-cover rounded-0.5 shrink-0"
                      />
                      <span>{curr.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* User Dropdown */}
          <div className="relative" ref={userRef}>
            <button
              type="button"
              onClick={toggleUser}
              className={`border-[1.5px] border-white flex items-center justify-center cursor-pointer transition-all rounded-full w-10.5 h-10.5 shrink-0 overflow-hidden ${
                isLoggedIn
                  ? 'bg-[#faede3] text-dark shadow-sm hover:brightness-95'
                  : 'bg-transparent text-white hover:bg-white/10'
              } ${isUserOpen ? 'ring-2 ring-white/50' : ''}`}
              aria-label={isLoggedIn ? `Account: ${customer?.name || 'Customer'}` : "User Account"}
              title={isLoggedIn ? `${customer?.name || 'Customer'} (${customer?.email || ''})` : "Account"}
            >
              {isLoggedIn ? (
                <span className="text-base font-bold text-dark select-none uppercase tracking-wide">
                  {getInitial()}
                </span>
              ) : (
                <User size={18} />
              )}
            </button>

            {/* User Menu Dropdown */}
            <div
              className={`absolute top-[calc(100%+8px)] right-0 min-w-56 bg-[#faede3] text-dark rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.22)] py-2.5 px-2 z-50 border border-black/5 transition-all duration-200 ease-out ${
                isUserOpen
                  ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                  : 'opacity-0 invisible -translate-y-2 pointer-events-none'
              }`}
            >
              {isLoggedIn ? (
                <div className="flex flex-col">
                  {/* Customer Info Card (Clickable to /account) */}
                  <div
                    onClick={() => {
                      navigate('/account');
                      setIsUserOpen(false);
                    }}
                    className="px-3 py-2.5 mb-1.5 border-b border-black/10 flex items-center gap-3 hover:bg-black/5 rounded-xl cursor-pointer transition-colors"
                    title="View Customer Profile & Orders"
                  >
                    <div className="w-9 h-9 rounded-full bg-dark text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs uppercase">
                      {getInitial()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-dark/60 font-semibold uppercase tracking-wider">Customer Portal</p>
                        <span className="text-[10px] font-bold text-dark/70 hover:underline">View</span>
                      </div>
                      <p className="text-sm font-bold text-dark truncate">
                        {customer?.name || customer?.firstName || 'Customer'}
                      </p>
                      <p className="text-[11px] text-dark/70 truncate">
                        {customer?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/orders');
                        setIsUserOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-dark hover:bg-black/5 transition-colors cursor-pointer select-none flex items-center gap-2.5"
                    >
                      <Package size={16} className="text-dark/70" />
                      <span>Booked Properties</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigate('/customer-details?tab=sell');
                        setIsUserOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-dark hover:bg-black/5 transition-colors cursor-pointer select-none flex items-center gap-2.5"
                    >
                      <TrendingUp size={16} className="text-dark/70" />
                      <span>Sell My Property</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigate('/order-tracking');
                        setIsUserOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-dark hover:bg-black/5 transition-colors cursor-pointer select-none flex items-center gap-2.5"
                    >
                      <Truck size={16} className="text-dark/70" />
                      <span>Status Tracking & Steps</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigate('/customer-details?tab=inquiries');
                        setIsUserOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-dark hover:bg-black/5 transition-colors cursor-pointer select-none flex items-center gap-2.5"
                    >
                      <Compass size={16} className="text-dark/70" />
                      <span>Site Visits & Inquiries</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigate('/saved-addresses');
                        setIsUserOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-dark hover:bg-black/5 transition-colors cursor-pointer select-none flex items-center gap-2.5"
                    >
                      <MapPin size={16} className="text-dark/70" />
                      <span>Saved Addresses</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigate('/wishlist');
                        setIsUserOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-dark hover:bg-black/5 transition-colors cursor-pointer select-none flex items-center justify-between"
                    >
                      <span>Wishlist</span>
                      <span className="bg-dark text-white text-xs px-2 py-0.5 rounded-full font-bold">
                        {wishlistCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setIsUserOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer select-none flex items-center gap-2 mt-1"
                    >
                      <LogOut size={16} />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/login');
                      setIsUserOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-dark hover:bg-black/5 transition-colors cursor-pointer select-none"
                  >
                    Log in
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/register');
                      setIsUserOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-dark hover:bg-black/5 transition-colors cursor-pointer select-none"
                  >
                    Create Account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/wishlist');
                      setIsUserOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-dark hover:bg-black/5 transition-colors cursor-pointer select-none flex items-center justify-between"
                  >
                    <span>Wishlist</span>
                    <span className="bg-dark text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {wishlistCount}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
                  
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="bg-transparent border-[1.5px] border-white text-white flex items-center gap-2 cursor-pointer transition-all hover:bg-white/10 rounded-full py-2 pl-5 pr-2 text-sm font-medium whitespace-nowrap shrink-0"
            aria-label="Open Cart"
          >
            <span>
              My Cart: {selectedCurrency.code === 'INR' ? `Rs. ${subtotal.toLocaleString('en-IN')}.00` : `${selectedCurrency.symbol} ${(subtotal / 85).toFixed(2)}`}
            </span>
            <div className="relative flex items-center justify-center ml-1">
              <ShoppingCart size={18} />
              <span className="absolute -top-2 -right-2 bg-white text-dark text-2.75 font-bold h-4.5 min-w-4.5 rounded-2xl flex items-center justify-center px-1">
                {totalItems}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Centered White Line at the bottom */}
      <div className="absolute bottom-0 left-0 w-full flex justify-center px-4 md:px-10 pointer-events-none">
        <div className="w-full max-w-350 h-px bg-[#f4eae1]"></div>
      </div>

      {/* Collections Mega Menu Dropdown */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`absolute top-full left-0 w-full bg-white text-dark shadow-2xl transition-all duration-300 ease-out border-b border-slate-200 ${
          isCollectionsOpen
            ? 'opacity-100 visible translate-y-0 pointer-events-auto'
            : 'opacity-0 invisible -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="w-full max-w-350 mx-auto px-6 sm:px-10 py-7 md:py-9">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-7">
            {collectionItems.map((item) => (
              <div
                key={item.title}
                onClick={() => { navigate(item.link); setIsCollectionsOpen(false); }}
                className="group flex flex-col items-center cursor-pointer select-none"
              >
                {/* Image Container with rounded corners */}
                <div className="w-full aspect-[4/3.2] sm:aspect-[4/3.3] overflow-hidden rounded-5 md:rounded-6 bg-slate-100 shadow-sm group-hover:shadow-md transition-all duration-300">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                {/* Title */}
                <p className="mt-3.5 text-3.75 sm:text-base font-semibold text-dark group-hover:text-black transition-colors">
                  {item.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>

    {/* ======================================================== */}
    {/* MOBILE SLIDE-OUT NAVIGATION DRAWER (< lg screens) */}
    {/* Rendered outside <nav> to prevent backdrop-blur clipping */}
    {/* ======================================================== */}
    {/* Backdrop */}
    {isMobileNavOpen && (
      <div
        onClick={() => setIsMobileNavOpen(false)}
        className="fixed inset-0 bg-black/75 backdrop-blur-xs z-[9998] lg:hidden transition-opacity duration-300"
        aria-hidden="true"
      />
    )}

    {/* Slide-out Drawer Panel */}
    <div
      className={`fixed top-0 bottom-0 left-0 w-[85%] max-w-[340px] h-screen h-[100dvh] bg-dark text-white z-[9999] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out select-none overflow-hidden lg:hidden ${
        isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
        {/* Drawer Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div
            onClick={() => {
              navigate('/');
              setIsMobileNavOpen(false);
            }}
            className="cursor-pointer"
          >
            <img src={logoImg} alt="Modern Real Estate" className="h-6 object-contain" />
          </div>

          <button
            type="button"
            onClick={() => setIsMobileNavOpen(false)}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close Navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 custom-scrollbar">
          {/* Customer Profile Card */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#c39379] text-white flex items-center justify-center font-extrabold text-sm uppercase shadow-sm shrink-0">
                    {getInitial() || 'C'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate text-white">
                      {customer?.name || customer?.firstName || 'Valued Customer'}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">
                      {customer?.email || 'customer@example.com'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/account');
                      setIsMobileNavOpen(false);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-center transition-colors cursor-pointer"
                  >
                    My Account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/order-tracking');
                      setIsMobileNavOpen(false);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-center transition-colors cursor-pointer"
                  >
                    Milestones
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2.5">
                <p className="text-xs font-semibold text-gray-300">
                  Sign in to manage booked properties & site visits.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/login');
                      setIsMobileNavOpen(false);
                    }}
                    className="w-full py-2 rounded-xl bg-[#c39379] hover:bg-[#b07d64] text-white font-bold text-xs transition-colors cursor-pointer text-center"
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/register');
                      setIsMobileNavOpen(false);
                    }}
                    className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer text-center"
                  >
                    Register
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Nav Links List */}
          <nav className="space-y-1">
            {/* Home */}
            <button
              type="button"
              onClick={() => {
                navigate('/');
                setIsMobileNavOpen(false);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>Home & Apartments</span>
              <Compass size={16} className="text-[#c39379]" />
            </button>

            {/* Collections Accordion */}
            <div>
              <button
                type="button"
                onClick={() => setMobileCollectionsExpanded((prev) => !prev)}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>Featured Collections</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    mobileCollectionsExpanded ? 'rotate-180 text-[#c39379]' : 'text-gray-400'
                  }`}
                />
              </button>

              {mobileCollectionsExpanded && (
                <div className="pl-3 pr-1 py-2 grid grid-cols-2 gap-2 animate-in fade-in duration-200">
                  {collectionItems.map((col) => (
                    <button
                      key={col.title}
                      type="button"
                      onClick={() => {
                        navigate(col.link);
                        setIsMobileNavOpen(false);
                      }}
                      className="flex flex-col items-center p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left group cursor-pointer"
                    >
                      <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-black/40 mb-1.5">
                        <img
                          src={col.image}
                          alt={col.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <span className="text-xs font-semibold text-white/90 group-hover:text-white truncate w-full text-center">
                        {col.title}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pages Accordion */}
            <div>
              <button
                type="button"
                onClick={() => setMobilePagesExpanded((prev) => !prev)}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>Company Pages</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    mobilePagesExpanded ? 'rotate-180 text-[#c39379]' : 'text-gray-400'
                  }`}
                />
              </button>

              {mobilePagesExpanded && (
                <div className="pl-4 py-1 space-y-1">
                  {pageItems.map((pg) => (
                    <button
                      key={pg.label}
                      type="button"
                      onClick={() => {
                        navigate(pg.link);
                        setIsMobileNavOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      {pg.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Blog */}
            <button
              type="button"
              onClick={() => {
                navigate('/blog');
                setIsMobileNavOpen(false);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Real Estate Journal & Blog
            </button>

            {/* Wishlist Link */}
            <button
              type="button"
              onClick={() => {
                navigate('/wishlist');
                setIsMobileNavOpen(false);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Heart size={16} className="text-red-400" />
                <span>Saved Wishlist</span>
              </span>
              <span className="bg-white/15 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {wishlistCount}
              </span>
            </button>

            {/* Cart Link & Trigger */}
            <button
              type="button"
              onClick={() => {
                setIsMobileNavOpen(false);
                setIsCartOpen(true);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <ShoppingCart size={16} className="text-[#c39379]" />
                <span>My Property Cart</span>
              </span>
              <span className="bg-[#c39379] text-white text-xs px-2 py-0.5 rounded-full font-extrabold">
                {totalItems}
              </span>
            </button>
          </nav>

          {/* Quick Actions & Currency/Language Pills */}
          <div className="pt-3 border-t border-white/10 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Preferences & Region
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Currency Selector Pill */}
              <div className="relative">
                <select
                  value={selectedCurrency.code}
                  onChange={(e) => {
                    const found = currencies.find((c) => c.code === e.target.value);
                    if (found) setSelectedCurrency(found);
                  }}
                  className="bg-white/10 border border-white/20 text-white rounded-full py-1.5 px-3 text-xs font-semibold appearance-none pr-7 cursor-pointer outline-none"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code} className="bg-dark text-white">
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none" />
              </div>

              {/* Language Selector Pill */}
              <div className="relative">
                <select
                  value={selectedLanguage.code}
                  onChange={(e) => {
                    const found = languages.find((l) => l.code === e.target.value);
                    if (found) setSelectedLanguage(found);
                  }}
                  className="bg-white/10 border border-white/20 text-white rounded-full py-1.5 px-3 text-xs font-semibold appearance-none pr-7 cursor-pointer outline-none"
                >
                  {languages.map((l) => (
                    <option key={l.code} value={l.code} className="bg-dark text-white">
                      {l.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none" />
              </div>
            </div>

            {/* Quick Link to Admin Panel */}
            <div className="pt-2">
              <a
                href="http://localhost:5174"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Admin Portal</span>
                </span>
                <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                  Port 5174 <ExternalLink size={11} />
                </span>
              </a>
            </div>

            {isLoggedIn && (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setIsMobileNavOpen(false);
                }}
                className="w-full mt-2 py-2 px-3 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2 cursor-pointer border border-red-500/20"
              >
                <LogOut size={14} />
                <span>Log Out of Account</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
