import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  Pencil,
  Scissors,
  Share2,
  Plus,
  Minus,
  Star,
  Upload,
  Check,
  ChevronDown,
  ShoppingBag,
  X,
  Key,
  ShieldCheck,
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Building2,
  CalendarCheck,
  Flag,
  ShieldAlert
} from 'lucide-react';
import { io } from 'socket.io-client';
import { getProductBySlug } from '../Data/products';
import { useCart } from '../Context/CartContext';
import { useWishlist } from '../Context/WishlistContext';
import { useCustomerAuth } from '../Context/CustomerAuthContext';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, formatPrice } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { customer, isLoggedIn } = useCustomerAuth();

  const initialProduct = useMemo(() => getProductBySlug(slug), [slug]);
  const [liveProperty, setLiveProperty] = useState(initialProduct);
  const [bookingError, setBookingError] = useState('');
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);

  const product = useMemo(() => {
    return {
      ...initialProduct,
      ...liveProperty,
      totalUnits: liveProperty?.totalUnits ?? initialProduct?.totalUnits ?? 2,
      availableUnits:
        liveProperty?.availableUnits !== undefined
          ? Number(liveProperty.availableUnits)
          : (initialProduct?.availableUnits ?? 2),
      status: liveProperty?.status || initialProduct?.status || 'Active',
      sizes: liveProperty?.sizes || initialProduct?.sizes || ['1200 sq fit', '1500 sq fit', '1800 sq fit'],
    };
  }, [initialProduct, liveProperty]);

  const availableUnits = Math.max(0, Number(product.availableUnits));
  const totalUnits = Math.max(1, Number(product.totalUnits));
  const isSoldOut = availableUnits <= 0 || product.status === 'Sold';

  const [selectedSize, setSelectedSize] = useState(product.defaultSize || product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const isWishlisted = isInWishlist(product.id) || isInWishlist(product.slug) || isInWishlist(product.title);
  const [wishlistToast, setWishlistToast] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [rating, setRating] = useState(3);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [copyToast, setCopyToast] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [propertyReviews, setPropertyReviews] = useState([]);
  const [reviewSuccessToast, setReviewSuccessToast] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Property Report State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Misleading or Inaccurate Information');
  const [reportDescription, setReportDescription] = useState('');
  const [reporterName, setReporterName] = useState(customer?.name || customer?.firstName || '');
  const [reporterEmail, setReporterEmail] = useState(customer?.email || '');
  const [reporterPhone, setReporterPhone] = useState(customer?.phone || '');
  const [reportEvidenceUrl, setReportEvidenceUrl] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccessToast, setReportSuccessToast] = useState('');
  const [reportError, setReportError] = useState('');

  // Property Booking Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookTokenAmount, setBookTokenAmount] = useState('Rs. 1,00,000.00');
  const [buyerName, setBuyerName] = useState(customer?.name || customer?.firstName || 'Keval Patel');
  const [buyerPhone, setBuyerPhone] = useState(customer?.phone || '+91 98765 43210');
  const [buyerEmail, setBuyerEmail] = useState(customer?.email || 'keval@example.com');
  const [paymentMethod, setPaymentMethod] = useState('UPI / NetBanking Instant Token');

  // Sync customer details when customer state changes
  useEffect(() => {
    if (customer) {
      setBuyerName(customer.name || customer.firstName || 'Keval Patel');
      setBuyerPhone(customer.phone || '+91 98765 43210');
      setBuyerEmail(customer.email || 'keval@example.com');
      if (!reporterName) setReporterName(customer.name || customer.firstName || '');
      if (!reporterEmail) setReporterEmail(customer.email || '');
      if (!reporterPhone) setReporterPhone(customer.phone || '');
    }
  }, [customer]);

  // Live property data fetch & Socket.io real-time availability sync
  useEffect(() => {
    let isMounted = true;
    fetch(`http://localhost:5000/api/properties/${slug}`)
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success && json.data) {
          const d = json.data;
          setLiveProperty((prev) => ({
            ...prev,
            ...d,
            _id: d._id,
            id: d._id || d.id || prev?.id,
            title: d.title || prev?.title,
            image: d.image || prev?.image,
            totalUnits: d.totalUnits ?? prev?.totalUnits ?? 2,
            availableUnits: d.availableUnits !== undefined ? d.availableUnits : (d.totalUnits ?? prev?.totalUnits ?? 2),
            status: d.status || prev?.status,
            price: d.price || prev?.price,
            priceNumber: d.priceNumber || prev?.priceNumber,
          }));
        }
      })
      .catch((e) => console.warn('Live property fetch warning:', e));

    let socket;
    try {
      socket = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
      });
      socket.on('propertyAvailabilityUpdated', (evt) => {
        if (!evt) return;
        const matchesThis =
          (liveProperty?._id && String(evt.propertyId) === String(liveProperty._id)) ||
          evt.slug === slug ||
          (evt.title && liveProperty?.title && evt.title.toLowerCase() === liveProperty.title.toLowerCase());

        if (matchesThis) {
          setLiveProperty((prev) => ({
            ...prev,
            availableUnits: evt.availableUnits,
            totalUnits: evt.totalUnits ?? prev?.totalUnits ?? 2,
            status: evt.status,
          }));
        }
      });
    } catch (e) {
      console.warn('Socket connection warning:', e);
    }

    return () => {
      isMounted = false;
      if (socket) socket.disconnect();
    };
  }, [slug]);

  // Site Visit Schedule Modal State
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [visitType, setVisitType] = useState('In-Person Guided Tour');
  const [visitDate, setVisitDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [visitNotes, setVisitNotes] = useState('');
  const [visitSubmitting, setVisitSubmitting] = useState(false);
  const [confirmedVisit, setConfirmedVisit] = useState(null);
  const [visitError, setVisitError] = useState('');

  const fetchSlots = async (date) => {
    setLoadingSlots(true);
    setVisitError('');
    try {
      const res = await fetch(`http://localhost:5000/api/visits/available-slots?propertyTitle=${encodeURIComponent(product.title)}&visitDate=${date}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.slots)) {
        setAvailableSlots(json.slots);
        const firstAvail = json.slots.find((s) => s.available);
        if (firstAvail) setSelectedSlot(firstAvail.slot);
        else setSelectedSlot('');
      }
    } catch (e) {
      console.warn('Failed to load slots:', e);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (isVisitModalOpen && visitDate) {
      fetchSlots(visitDate);
    }
  }, [isVisitModalOpen, visitDate]);

  const handleScheduleVisitSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setVisitError('Please select an available time window.');
      return;
    }
    setVisitSubmitting(true);
    setVisitError('');

    try {
      const res = await fetch('http://localhost:5000/api/visits/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: product.id,
          propertyTitle: product.title,
          propertySlug: product.slug || slug,
          propertyImage: product.image,
          propertyLocation: product.location || 'Prime Location',
          customerName: buyerName,
          customerEmail: buyerEmail,
          customerPhone: buyerPhone,
          visitType,
          visitDate,
          timeSlot: selectedSlot,
          notes: visitNotes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setConfirmedVisit(json.data);
      } else {
        setVisitError(json.message || 'Time slot already taken. Please choose another.');
        fetchSlots(visitDate);
      }
    } catch (err) {
      setVisitError('Failed to schedule visit. Please check backend connection.');
    } finally {
      setVisitSubmitting(false);
    }
  };

  const handleInstantBookProperty = async (e) => {
    e.preventDefault();
    if (availableUnits <= 0) {
      setBookingError('Sorry, this property is sold out (0 units available).');
      return;
    }
    if (quantity > availableUnits) {
      setBookingError(`Only ${availableUnits} unit(s) available. You cannot book ${quantity} units.`);
      return;
    }

    setBookingError('');
    setIsBookingSubmitting(true);

    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const email = customer?.email || buyerEmail || 'keval@example.com';
    const cName = customer?.name || buyerName || 'Keval Patel';
    const cPhone = customer?.phone || buyerPhone || '+91 98765 43210';

    const newOrder = {
      id: orderId,
      orderId,
      item: product.title,
      quantity: quantity,
      category: product.category || 'Properties',
      propertyId: product._id || `prop-${product.id}`,
      total: product.price,
      totalNumber: product.priceNumber * quantity,
      tokenPaid: bookTokenAmount,
      tokenPaidNumber: parseFloat(bookTokenAmount.replace(/[^0-9.]/g, '')) || 100000,
      customer: cName,
      email: email,
      phone: cPhone,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Processing',
      paymentMethod: paymentMethod,
      propertyImage: product.image,
      address: {
        fullName: cName,
        phone: cPhone,
        street: '742 Evergreen Terrace, Palm Boulevard',
        city: 'Springfield',
        state: 'Oregon',
        pincode: '97477',
        country: 'United States',
        type: 'Primary Residence'
      },
      tracking: {
        trackingNumber: `TRK-${orderId.replace(/[^0-9]/g, '')}-ESTATE`,
        currentStep: 1,
        estimatedDate: 'Within 7 Business Days',
        agent: {
          name: 'Vikram Malhotra',
          role: 'Senior Property Advisor & Legal Officer',
          phone: '+91 98200 11223',
          email: 'vikram.advisor@modernrealestate.com',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
        },
        steps: [
          { title: 'Booking Request Received & Allotment Locked', desc: `Token deposit of ${bookTokenAmount} received. Provisional allotment letter generated.`, date: 'Today • Confirmed', completed: true },
          { title: 'KYC & Title Deed Verification', desc: 'Title deed, municipal NOC and buyer background check.', date: 'In progress', completed: false },
          { title: 'Site Inspection & Legal Clearance', desc: 'Physical appraisal, boundary survey and architect report.', date: 'Scheduled', completed: false },
          { title: 'Ownership Transfer & Key Handover', desc: 'Registry deed signing and key handover.', date: 'Pending', completed: false }
        ]
      }
    };

    // Store in localStorage
    const storageKey = `customer_orders_${email}`;
    try {
      const current = JSON.parse(localStorage.getItem(storageKey) || '[]');
      localStorage.setItem(storageKey, JSON.stringify([newOrder, ...current]));
    } catch {}

    // Sync to backend and deduct availability
    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: cName,
          email: email,
          phone: cPhone,
          item: product.title,
          propertyId: product._id || product.id,
          quantity: quantity,
          total: product.price,
          tokenPaid: bookTokenAmount,
          propertyImage: product.image
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setBookingError(json.message || 'Booking failed. Insufficient availability.');
        setIsBookingSubmitting(false);
        return;
      }

      // Live update locally immediately
      if (json.remainingUnits !== undefined) {
        setLiveProperty((prev) => ({
          ...prev,
          availableUnits: json.remainingUnits,
          status: json.propertyStatus || (json.remainingUnits === 0 ? 'Sold' : prev.status)
        }));
      }
    } catch (err) {
      console.warn('Backend order sync error:', err);
    } finally {
      setIsBookingSubmitting(false);
    }

    setIsBookModalOpen(false);
    navigate(`/customer-details?tab=tracking&orderId=${orderId}`);
  };

  const reviewsRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleMediaChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setMediaPreview({ url, isVideo: file.type.startsWith('video/') });
    }
  };

  const removeMedia = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (mediaPreview?.url) {
      URL.revokeObjectURL(mediaPreview.url);
    }
    setMediaPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Fetch reviews for this property from MongoDB
  const loadProductReviews = async () => {
    try {
      const pid = String(product._id || product.id || '1');
      const res = await fetch(`http://localhost:5000/api/reviews?propertyId=${pid}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setPropertyReviews(json.data);
        }
      }
    } catch (err) {
      console.warn('Error fetching property reviews:', err);
    }
  };

  // Update selected size and initial position ONLY when navigating to a new property slug
  useEffect(() => {
    setSelectedSize(product.defaultSize || product.sizes?.[0] || '1200 sq fit');
    setQuantity(1);
    loadProductReviews();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const handleAddToCart = (e) => {
    if (e) e.stopPropagation();
    addToCart({
      id: `${product.slug}-${selectedSize}`,
      slug: product.slug,
      title: product.title,
      size: selectedSize,
      price: product.priceNumber,
      quantity: quantity,
      image: product.image
    });
  };

  const handleToggleWishlist = () => {
    const willBeWishlisted = !isWishlisted;
    toggleWishlist(product);
    setWishlistToast(willBeWishlisted ? `Added "${product.title}" to your wishlist!` : `Removed "${product.title}" from your wishlist`);
    setTimeout(() => setWishlistToast(null), 2500);
  };

  const handleBuyNow = () => {
    addToCart({
      id: `${product.slug}-${selectedSize}`,
      title: product.title,
      size: selectedSize,
      price: product.priceNumber,
      quantity: quantity,
      image: product.image
    });
    navigate(`/checkout?property=${product.slug}`);
  };

  const scrollToReviews = () => {
    setIsReviewOpen(true);
    if (reviewsRef.current) {
      reviewsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2500);
  };

  // Submit review to MongoDB database
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewContent.trim() || !displayName.trim() || !email.trim()) return;

    setIsSubmittingReview(true);
    try {
      let uploadedMediaUrl = '';
      if (selectedFile) {
        try {
          const formData = new FormData();
          formData.append('image', selectedFile);
          const upRes = await fetch('http://localhost:5000/api/upload', {
            method: 'POST',
            body: formData,
          });
          if (upRes.ok) {
            const upJson = await upRes.json();
            uploadedMediaUrl = upJson.fileUrl || '';
          }
        } catch (uploadErr) {
          console.warn('Upload warning:', uploadErr);
        }
      }

      const reviewPayload = {
        propertyId: String(product._id || product.id || '1'),
        propertyTitle: product.title || 'Luxury Estate',
        author: displayName.trim(),
        email: email.trim(),
        rating: Number(rating) || 5,
        title: reviewTitle.trim() || 'Verified Property Review',
        comment: reviewContent.trim(),
        mediaUrl: uploadedMediaUrl,
        status: 'Approved',
        verifiedBuyer: true
      };

      const res = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewPayload),
      });

      const resData = await res.json();
      if (resData.success) {
        setReviewTitle('');
        setReviewContent('');
        setDisplayName('');
        setEmail('');
        removeMedia();
        setIsReviewOpen(false);
        setReviewSuccessToast('Thank you! Your review has been saved in the database.');
        setTimeout(() => setReviewSuccessToast(''), 4500);
        loadProductReviews();
      } else {
        alert(resData.message || 'Error submitting review');
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert('Network error while saving review to database.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Submit Property Report
  const handleSubmitPropertyReport = async (e) => {
    e.preventDefault();
    if (!reportDescription.trim() || !reporterName.trim() || !reporterEmail.trim()) {
      setReportError('Please provide your name, email, and a detailed description.');
      return;
    }
    setIsSubmittingReport(true);
    setReportError('');

    try {
      const res = await fetch('http://localhost:5000/api/property-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('customerToken')
            ? { Authorization: `Bearer ${localStorage.getItem('customerToken')}` }
            : {}),
        },
        body: JSON.stringify({
          propertyId: String(product._id || product.id || '1'),
          propertyTitle: product.title || 'Luxury Estate',
          propertyImage: product.image || '',
          propertyPrice: product.price || '',
          propertyLocation: product.location || 'Prime Location',
          reporterName: reporterName.trim(),
          reporterEmail: reporterEmail.trim(),
          reporterPhone: reporterPhone.trim(),
          reason: reportReason,
          description: reportDescription.trim(),
          evidenceUrl: reportEvidenceUrl.trim(),
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setReportDescription('');
        setReportEvidenceUrl('');
        setIsReportModalOpen(false);
        setReportSuccessToast('Thank you! Your report has been submitted to the property owner and Super Admin for review.');
        setTimeout(() => setReportSuccessToast(''), 5000);
      } else {
        setReportError(json.message || 'Failed to submit report. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting report:', err);
      setReportError('Network error while submitting report. Please check server connection.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-dark text-white font-sans flex flex-col pb-28">
      {/* Toast Notification for share */}
      {copyToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#faede3] text-dark px-6 py-2.5 rounded-full font-bold text-xs shadow-xl flex items-center gap-2 border border-black/10 animate-fade-in">
          <Check size={14} className="text-emerald-700" />
          <span>Product link copied to clipboard!</span>
        </div>
      )}

      {/* Toast Notification for Wishlist */}
      {wishlistToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#faede3] text-dark px-6 py-2.5 rounded-full font-bold text-xs shadow-xl flex items-center gap-2 border border-black/10 animate-fade-in">
          <Heart size={14} className="text-red-500 fill-red-500" />
          <span>{wishlistToast}</span>
        </div>
      )}

      {/* Toast Notification for Review Submission */}
      {reviewSuccessToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-2.5 rounded-full font-bold text-xs shadow-xl flex items-center gap-2 border border-emerald-400 animate-fade-in">
          <Check size={14} className="text-white" />
          <span>{reviewSuccessToast}</span>
        </div>
      )}

      {/* Toast Notification for Property Report */}
      {reportSuccessToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-6 py-2.5 rounded-full font-bold text-xs shadow-xl flex items-center gap-2 border border-rose-400 animate-fade-in">
          <ShieldAlert size={14} className="text-white" />
          <span>{reportSuccessToast}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-8 sm:pt-10 flex-1">
        
        {/* Top Header Row (Back to category & Wishlist) */}
        <div className="flex items-center justify-between mb-8 sm:mb-10 select-none">
          {/* Back Button */}
          <button
            onClick={() => navigate('/collections/bestseller')}
            className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-medium text-white/90 hover:text-white transition-colors cursor-pointer group"
          >
            <span className="w-8 h-8 rounded-full border border-white/50 flex items-center justify-center transition-all group-hover:border-white group-hover:bg-white/10">
              <ArrowLeft size={14} strokeWidth={2.2} />
            </span>
            <span>Back to category</span>
          </button>

          {/* Add to Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-white/90 hover:text-white transition-colors cursor-pointer group"
          >
            <Heart
              size={18}
              strokeWidth={2}
              className={`transition-colors ${
                isWishlisted ? 'text-red-500 fill-red-500' : 'text-white group-hover:scale-110'
              }`}
            />
            <span>{isWishlisted ? 'In wishlist' : 'Add to wishlist'}</span>
          </button>
        </div>

        {/* 2-Column Product Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start pb-16">
          
          {/* Left Column: Product Information */}
          <div className="lg:col-span-6 flex flex-col">
            
            {/* Stars & Write a review link */}
            <div className="flex items-center gap-3 mb-3 text-xs sm:text-sm">
              <div className="flex items-center gap-1 text-white/90">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} strokeWidth={1.5} className="text-white/80" />
                ))}
              </div>
              <button
                onClick={scrollToReviews}
                className="inline-flex items-center gap-1 text-white/90 hover:text-white hover:underline transition-colors cursor-pointer font-medium"
              >
                <Pencil size={13} strokeWidth={2} />
                <span>Write a Review</span>
              </button>
              <span className="text-white/30">•</span>
              <button
                type="button"
                onClick={() => {
                  setReportError('');
                  setIsReportModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 text-rose-300 hover:text-rose-200 hover:underline transition-colors cursor-pointer font-medium"
              >
                <Flag size={12} strokeWidth={2.5} />
                <span>Report Listing</span>
              </button>
            </div>

            {/* Product Title */}
            <h1 className="text-3xl sm:text-4xl md:text-3xl font-extrabold text-white tracking-tight mb-4 leading-tight">
              {product.title}
            </h1>

            {/* Product Description */}
            <p className="text-xs sm:text-sm font-normal text-white/80 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Size Selector */}
            <div className="mb-6">
              <p className="text-xs sm:text-sm font-semibold text-white mb-3">
                Size: <span className="font-normal text-white/90">{selectedSize}</span>
              </p>
              
              {/* Size Pills */}
              <div className="flex items-center flex-wrap gap-2.5">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-full px-5 py-2 text-xs transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'bg-[#faede3] text-dark font-bold shadow-md'
                          : 'bg-transparent text-white border border-white/40 hover:border-white font-medium hover:bg-white/5'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Links (Sizing Guide & Share) */}
            <div className="flex items-center gap-6 mb-7 text-xs sm:text-sm text-white/90 select-none">
              <button
                type="button"
                onClick={() => setShowSizeModal(true)}
                className="inline-flex items-center gap-2 hover:text-white hover:underline cursor-pointer transition-colors"
              >
                <Scissors size={15} strokeWidth={2} />
                <span>See Sizing Guide</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 hover:text-white hover:underline cursor-pointer transition-colors"
              >
                <Share2 size={15} strokeWidth={2} />
                <span>Share</span>
              </button>
            </div>

            {/* Live Units Availability Status Badge */}
            <div className="mb-6">
              {availableUnits > 0 ? (
                <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-xs">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span>
                    {availableUnits === 1 ? (
                      <span className="text-amber-300 font-extrabold">⚡ Only 1 Unit Left — Selling Fast!</span>
                    ) : (
                      <span><strong>{availableUnits} Apartments / Units Available</strong></span>
                    )}
                    <span className="text-white/60 font-medium ml-2">({totalUnits} Total in Property)</span>
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold shadow-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                  <span>🔴 Sold Out — 0 Units Currently Available</span>
                </div>
              )}
            </div>

            {/* Quantity Pill & Price */}
            <div className="flex items-center gap-5 mb-8 flex-wrap">
              {/* Qty Pill */}
              <div className="rounded-full border border-white/40 px-3.5 py-1.5 flex items-center justify-between w-28 text-xs font-bold text-white select-none">
                <button
                  type="button"
                  disabled={quantity <= 1 || isSoldOut}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="text-white/80 hover:text-white transition-colors cursor-pointer p-0.5 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Decrease quantity"
                >
                  <Minus size={12} strokeWidth={2.5} />
                </button>
                <span className="min-w-4 text-center">{isSoldOut ? 0 : quantity}</span>
                <button
                  type="button"
                  disabled={quantity >= availableUnits || isSoldOut}
                  onClick={() => setQuantity((q) => Math.min(availableUnits, q + 1))}
                  className="text-white/80 hover:text-white transition-colors cursor-pointer p-0.5 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Increase quantity"
                >
                  <Plus size={12} strokeWidth={2.5} />
                </button>
              </div>

              {/* Price */}
              <div className="text-xl sm:text-xl font-extrabold text-white">
                {formatPrice(product.priceNumber * (isSoldOut ? 1 : quantity))}
              </div>

              {availableUnits > 0 && (
                <span className="text-[11px] text-white/60">
                  (Max {availableUnits} unit{availableUnits > 1 ? 's' : ''} available)
                </span>
              )}
            </div>

            {/* Main Action Buttons */}
            <div className="space-y-3">
              {isSoldOut ? (
                <button
                  type="button"
                  disabled
                  className="w-full bg-neutral-800 text-gray-400 border border-neutral-700 font-extrabold rounded-full py-4 px-8 text-sm cursor-not-allowed shadow-none flex items-center justify-center gap-2"
                >
                  <span>Property Sold Out (All Units Purchased)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setBookingError('');
                    setIsBookModalOpen(true);
                  }}
                  className="w-full bg-[#faede3] hover:bg-white text-dark font-extrabold rounded-full py-4 px-8 text-sm transition-all duration-200 cursor-pointer shadow-lg flex items-center justify-center gap-2 group/book active:scale-98"
                >
                  <Key size={16} />
                  <span>Book Property ({quantity} Unit{quantity > 1 ? 's' : ''} • Instant Allotment)</span>
                  <span className="transition-transform group-hover/book:translate-x-1">→</span>
                </button>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isSoldOut}
                  onClick={handleAddToCart}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold rounded-full py-3 px-6 text-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 group/add active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>{isSoldOut ? 'Sold Out' : 'Add to Cart'}</span>
                  {!isSoldOut && <span className="transition-transform group-hover/add:translate-x-1">→</span>}
                </button>

                <button
                  type="button"
                  disabled={isSoldOut}
                  onClick={handleBuyNow}
                  className="bg-transparent hover:bg-white/10 text-white border border-white font-bold rounded-full py-3 px-6 text-xs transition-all duration-200 cursor-pointer text-center active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSoldOut ? 'Unavailable' : 'Buy it now'}
                </button>
              </div>

              {/* Schedule Private Site Visit Button */}
              <button
                type="button"
                onClick={() => {
                  setIsVisitModalOpen(true);
                  setConfirmedVisit(null);
                }}
                className="w-full bg-blue-600/25 hover:bg-blue-600/40 text-white border border-blue-400/50 font-bold rounded-full py-3.5 px-6 text-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-98"
              >
                <Calendar size={15} className="text-blue-300" />
                <span>Schedule Private Site Visit / 3D Walkthrough</span>
              </button>
            </div>
          </div>

          {/* Right Column: Hero Product Image (Appears first on mobile & tablet) */}
          <div className="lg:col-span-6 w-full order-first lg:order-last">
            <div className="w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#121920] group relative">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              {product.tag && (
                <div className="absolute top-5 right-5 bg-brand text-dark px-4 py-1.5 rounded-full text-xs font-bold shadow-md">
                  {product.tag}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div ref={reviewsRef} className="pt-12 pb-16 border-t border-white/10">
          
          {/* Header */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-6">
            Customer Reviews
          </h2>

          {/* Subheader bar with review prompt & toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 mb-10 text-center">
            <div className="flex flex-col items-center sm:items-start gap-1">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={propertyReviews.length > 0 ? 'currentColor' : 'none'}
                    className={propertyReviews.length > 0 ? 'text-amber-400' : 'text-white/40'}
                  />
                ))}
              </div>
              <span className="text-xs sm:text-sm text-white/80 font-medium">
                {propertyReviews.length > 0
                  ? `${propertyReviews.length} ${propertyReviews.length === 1 ? 'Review' : 'Reviews'} submitted`
                  : 'Be the first to write a review'}
              </span>
            </div>

            <div className="hidden sm:block h-10 w-px bg-white/20"></div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsReviewOpen((prev) => !prev)}
                className="rounded-full bg-[#faede3] hover:bg-white text-dark font-bold px-6 py-2.5 text-xs sm:text-sm transition-all cursor-pointer shadow-sm"
              >
                {isReviewOpen ? 'Cancel review' : 'Write a review'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setReportError('');
                  setIsReportModalOpen(true);
                }}
                className="rounded-full bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 font-bold px-5 py-2.5 text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Flag size={13} />
                <span>Report Listing</span>
              </button>
            </div>
          </div>

          {/* Write a Review Form Card */}
          {isReviewOpen && (
            <div className="bg-white text-dark rounded-3xl p-6 sm:p-10 max-w-2xl mx-auto shadow-2xl animate-fade-in border border-black/10">
              <h3 className="text-xl font-bold text-center mb-6">Write a review</h3>

              <form onSubmit={handleSubmitReview} className="space-y-5">
                {/* Rating Stars */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="cursor-pointer p-0.5 focus:outline-none"
                      >
                        <Star
                          size={22}
                          className={`transition-colors ${
                            (hoverRating || rating) >= star
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Title */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Review Title <span className="font-normal text-gray-500">(100)</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="Give your review a title"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                {/* Review Content */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Review content
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="Start writing here..."
                    className="w-full rounded-xl border border-gray-300 p-4 text-sm focus:outline-none focus:ring-1 focus:ring-black resize-none"
                  />
                </div>

                {/* Upload box */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Picture/Video (optional)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaChange}
                    className="hidden"
                  />

                  {mediaPreview ? (
                    <div className="relative w-24 h-24 rounded-2xl border border-black overflow-hidden group">
                      {mediaPreview.isVideo ? (
                        <video
                          src={mediaPreview.url}
                          className="w-full h-full object-cover"
                          autoPlay
                          muted
                          loop
                        />
                      ) : (
                        <img
                          src={mediaPreview.url}
                          alt="Review upload preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={removeMedia}
                        className="absolute top-1.5 right-1.5 bg-black/75 hover:bg-black text-white p-1 rounded-full cursor-pointer transition-colors shadow-sm"
                        title="Remove file"
                      >
                        <X size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 rounded-2xl border border-gray-300 hover:border-black flex items-center justify-center hover:bg-gray-50 cursor-pointer text-gray-500 hover:text-black transition-all group"
                      role="button"
                      tabIndex={0}
                      aria-label="Upload picture or video"
                    >
                      <Upload size={24} className="group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  )}
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Display name <span className="font-normal text-gray-500">(displayed publicly like John Smith)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Display name"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                {/* Privacy terms */}
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  How we use your data: We'll only contact you about the review you left, and only if necessary. By submitting your review, you agree to Judge.me's terms, privacy and content policies.
                </p>

                {/* Form Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReviewOpen(false)}
                    className="rounded-full border border-black hover:bg-gray-100 px-6 py-2.5 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel review
                  </button>

                  <button
                    type="submit"
                    className="rounded-full bg-[#faede3] hover:bg-dark hover:text-white text-dark px-7 py-2.5 text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Real Customer Reviews List from Database */}
          {propertyReviews.length > 0 && (
            <div className="mt-12 max-w-2xl mx-auto space-y-4 animate-fade-in">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2.5">
                <span>Verified Client Reviews</span>
                <span className="text-xs bg-white/10 px-2.5 py-0.5 rounded-full text-brand font-semibold">
                  {propertyReviews.length}
                </span>
              </h3>
              <div className="space-y-4">
                {propertyReviews.map((rev) => (
                  <div
                    key={rev._id || rev.id}
                    className="p-5 sm:p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3 backdrop-blur-xs transition-all hover:bg-white/8"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(5)].map((_, idx) => (
                          <Star
                            key={idx}
                            size={14}
                            fill={idx < (Number(rev.rating) || 5) ? 'currentColor' : 'none'}
                            className={idx < (Number(rev.rating) || 5) ? 'text-amber-400' : 'text-gray-600'}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-gray-400">
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                      </span>
                    </div>

                    {rev.title && (
                      <h4 className="text-sm font-bold text-white leading-snug">{rev.title}</h4>
                    )}

                    <p className="text-xs text-gray-300 leading-relaxed italic">
                      "{rev.comment}"
                    </p>

                    {rev.mediaUrl && (
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/20">
                        <img src={rev.mediaUrl} alt="Review attachment" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                      <span className="font-bold text-white">{rev.author}</span>
                      <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        ✓ Verified Buyer
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Sticky Bottom Bar (Matching Screenshot 3) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#121920]/95 backdrop-blur-md border-t border-white/10 py-3 px-4 sm:px-8 lg:px-14 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
        
        {/* Left: Thumbnail & Title & Price */}
        <div className="flex items-center gap-3.5 min-w-0">
          <img
            src={product.image}
            alt={product.title}
            className="w-13 h-10 object-cover rounded-lg border border-white/10 shrink-0"
          />
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-white truncate">{product.title}</h4>
            <p className="text-xs text-white/80 font-medium">
              {formatPrice(product.priceNumber * quantity)}
            </p>
          </div>
        </div>

        {/* Center: Size Dropdown Pill */}
        <div className="hidden sm:flex items-center">
          <div className="relative">
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="appearance-none bg-dark text-white border border-white/40 rounded-full py-1.5 pl-4 pr-8 text-xs font-bold cursor-pointer hover:border-white transition-colors outline-none"
            >
              {product.sizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/80">
              <ChevronDown size={12} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Right: Quantity Pill & Add to Cart button */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Qty Pill */}
          <div className="hidden md:flex rounded-full border border-white/40 px-3 py-1 items-center justify-between gap-3 text-xs font-bold text-white">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="text-white/80 hover:text-white cursor-pointer p-0.5"
            >
              <Minus size={11} strokeWidth={2.5} />
            </button>
            <span className="min-w-3 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="text-white/80 hover:text-white cursor-pointer p-0.5"
            >
              <Plus size={11} strokeWidth={2.5} />
            </button>
          </div>

          {/* Add to Cart Pill Button */}
          <button
            onClick={handleAddToCart}
            className="rounded-full bg-[#faede3] hover:bg-white text-dark font-bold px-5 sm:px-6 py-2.5 text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <ShoppingBag size={15} strokeWidth={2.2} />
            <span>Add to Cart</span>
          </button>
        </div>

      </div>

      {/* Sizing Guide Modal */}
      {showSizeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-dark rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-fade-in">
            <button
              onClick={() => setShowSizeModal(false)}
              className="absolute top-5 right-5 text-gray-500 hover:text-black p-1 cursor-pointer rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              <Scissors size={18} />
              <span>Architectural Sizing Guide</span>
            </h3>
            <p className="text-xs text-gray-600 mb-5 leading-relaxed">
              Standard residential living floorplans:
            </p>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="font-bold">1100 sq fit</span>
                <span className="text-gray-600">2 Beds, 2 Baths, 1 Living Studio</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="font-bold">1200 sq fit</span>
                <span className="text-gray-600">3 Beds, 2 Baths, Garden Patio</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="font-bold">1300 sq fit</span>
                <span className="text-gray-600">3 Beds, 3 Baths, Terrace & Lounge</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-bold">1800+ sq fit</span>
                <span className="text-gray-600">4+ Beds, Luxury Pavilion & Pool</span>
              </div>
            </div>
            <button
              onClick={() => setShowSizeModal(false)}
              className="w-full mt-6 bg-dark text-white py-3 rounded-full font-bold text-xs hover:bg-black transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Property Booking Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleInstantBookProperty}
            className="bg-white text-dark rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl border border-black/10"
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/8">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Direct Allotment</span>
                <h3 className="text-xl font-extrabold text-dark mt-0.5">Book {product.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBookModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-dark hover:bg-black/5 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Error message if booking fails or units exceeded */}
              {bookingError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span className="flex-1">{bookingError}</span>
                </div>
              )}

              {/* Property summary */}
              <div className="flex items-center gap-4 bg-neutral-50 p-3.5 rounded-2xl border border-black/5">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-extrabold text-dark truncate">{product.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                    <span>Units to Book: <strong className="text-dark font-extrabold">{quantity}</strong></span>
                    <span>•</span>
                    <span className="text-emerald-600 font-bold">{availableUnits} Remaining in Stock</span>
                  </div>
                  <p className="font-extrabold text-dark mt-1 text-sm">{formatPrice(product.priceNumber * quantity)}</p>
                </div>
              </div>

              {/* Token selection */}
              <div>
                <label className="block font-bold text-dark mb-1">Booking Token Advance *</label>
                <select
                  value={bookTokenAmount}
                  onChange={(e) => setBookTokenAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-dark focus:ring-1 focus:ring-dark font-semibold"
                >
                  <option value="Rs. 50,000.00">Rs. 50,000.00 (Standard Allotment Token)</option>
                  <option value="Rs. 1,00,000.00">Rs. 1,00,000.00 (Priority Legal Lock)</option>
                  <option value="Rs. 2,50,000.00">Rs. 2,50,000.00 (Exclusive Premium Allotment)</option>
                </select>
              </div>

              {/* Buyer info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-dark mb-1">Buyer Name *</label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark"
                  />
                </div>
                <div>
                  <label className="block font-bold text-dark mb-1">Buyer Phone *</label>
                  <input
                    type="tel"
                    required
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-dark mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-dark focus:ring-1 focus:ring-dark"
                >
                  <option value="UPI / NetBanking Instant Token">UPI / NetBanking Instant Token</option>
                  <option value="Visa / Mastercard Credit Card">Credit Card (Visa / Mastercard)</option>
                  <option value="Solicitor Escrow Wire Transfer">Verified Solicitor Escrow Wire</option>
                </select>
              </div>

              <div className="p-3 bg-[#faede3]/60 rounded-xl border border-black/5 flex items-center gap-2.5">
                <ShieldCheck size={20} className="text-dark shrink-0" />
                <p className="text-[11px] text-dark/80">
                  Includes full RERA title deed verification and direct tracking in your Customer Portal.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-black/8">
              <button
                type="submit"
                disabled={isBookingSubmitting || isSoldOut}
                className="flex-1 bg-dark hover:bg-black text-white text-xs font-bold py-3 rounded-full transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Key size={14} />
                <span>
                  {isBookingSubmitting
                    ? 'Confirming Allotment...'
                    : isSoldOut
                    ? 'Sold Out'
                    : `Confirm & Book ${quantity} Unit${quantity > 1 ? 's' : ''}`}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsBookModalOpen(false)}
                className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-dark text-xs font-bold rounded-full cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* SCHEDULE PROPERTY SITE VISIT / TOUR MODAL */}
      {/* ======================================================== */}
      {isVisitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-black/10 space-y-4 animate-fade-in text-dark max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-black/8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-dark leading-tight">
                    Schedule Private Property Tour
                  </h3>
                  <p className="text-xs text-gray-500 truncate max-w-xs">{product.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsVisitModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {confirmedVisit ? (
              /* Success Confirmation Screen */
              <div className="space-y-4 text-center py-2 animate-fade-in">
                <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle2 size={30} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Visit Confirmed • Appointment Locked
                  </span>
                  <h4 className="text-lg font-extrabold text-dark pt-1">
                    Your Property Tour is Booked!
                  </h4>
                  <p className="text-xs text-gray-500">
                    Appointment ID: <strong className="font-mono text-dark">{confirmedVisit.visitId}</strong>
                  </p>
                </div>

                {/* Details Box */}
                <div className="bg-neutral-50 rounded-2xl p-4 border border-black/5 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date & Slot:</span>
                    <span className="font-bold text-blue-600">{confirmedVisit.visitDate} ({confirmedVisit.timeSlot})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tour Format:</span>
                    <span className="font-bold text-dark">{confirmedVisit.visitType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Assigned Advisor:</span>
                    <span className="font-bold text-dark">{confirmedVisit.assignedAgent?.name} ({confirmedVisit.assignedAgent?.phone})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Visitor:</span>
                    <span className="font-bold text-dark">{confirmedVisit.customerName} ({confirmedVisit.customerEmail})</span>
                  </div>
                </div>

                {/* Google Calendar Link Button */}
                {confirmedVisit.googleCalendarUrl && (
                  <a
                    href={confirmedVisit.googleCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-full text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Calendar size={14} />
                    <span>Add to Google Calendar</span>
                  </a>
                )}

                <p className="text-[11px] text-gray-400">
                  Confirmation email with site directions and security pass has been dispatched to <strong>{confirmedVisit.customerEmail}</strong>.
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsVisitModalOpen(false)}
                    className="w-full py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-dark text-xs font-bold cursor-pointer transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* Booking Form */
              <form onSubmit={handleScheduleVisitSubmit} className="space-y-4 text-xs">
                {visitError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs">
                    ⚠️ {visitError}
                  </div>
                )}

                {/* Tour Format Tabs */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                    Select Tour Format *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { type: 'In-Person Guided Tour', icon: Building2, desc: 'Physical walkthrough' },
                      { type: 'Live 3D Video Walkthrough', icon: Video, desc: 'Virtual live stream' },
                    ].map((fmt) => (
                      <button
                        key={fmt.type}
                        type="button"
                        onClick={() => setVisitType(fmt.type)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          visitType === fmt.type
                            ? 'bg-blue-50 border-blue-500 shadow-xs ring-1 ring-blue-500'
                            : 'bg-neutral-50 border-black/10 hover:bg-neutral-100'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-dark">
                          <fmt.icon size={13} className={visitType === fmt.type ? 'text-blue-600' : 'text-gray-400'} />
                          <span className="truncate">{fmt.type.split(' ')[0]} Tour</span>
                        </div>
                        <span className="text-[10px] text-gray-400 block mt-0.5">{fmt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferred Date */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1 uppercase tracking-wider">
                    Select Preferred Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white font-bold text-dark focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>

                {/* Available Slots Pills */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                      Select Available Time Window *
                    </label>
                    {loadingSlots && <span className="text-[10px] text-blue-500 font-bold">Checking slots...</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map((s) => (
                      <button
                        key={s.slot}
                        type="button"
                        disabled={!s.available}
                        onClick={() => setSelectedSlot(s.slot)}
                        className={`py-2 px-3 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                          !s.available
                            ? 'bg-neutral-100 border-black/5 text-gray-400 cursor-not-allowed line-through'
                            : selectedSlot === s.slot
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white border-black/15 text-dark hover:border-blue-400'
                        }`}
                      >
                        <span>{s.slot}</span>
                        {!s.available && <span className="block text-[9px] font-normal text-rose-500">Booked</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visitor Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label className="block font-bold text-gray-600 text-[10px] uppercase mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full px-3 py-2 rounded-xl border border-black/15 focus:ring-1 focus:ring-blue-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-600 text-[10px] uppercase mb-1">Mobile Phone *</label>
                    <input
                      type="tel"
                      required
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      placeholder="+91 Mobile number"
                      className="w-full px-3 py-2 rounded-xl border border-black/15 focus:ring-1 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-600 text-[10px] uppercase mb-1">Email (For Calendar Invite) *</label>
                  <input
                    type="email"
                    required
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-black/15 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block font-bold text-gray-600 text-[10px] uppercase mb-1">Special Requirements / Notes (Optional)</label>
                  <input
                    type="text"
                    value={visitNotes}
                    onChange={(e) => setVisitNotes(e.target.value)}
                    placeholder="E.g. Request wheelchair accessibility, check balcony view..."
                    className="w-full px-3 py-2 rounded-xl border border-black/15 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>

                {/* Submit buttons */}
                <div className="flex items-center gap-2.5 pt-2 border-t border-black/8">
                  <button
                    type="submit"
                    disabled={visitSubmitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-full text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                  >
                    <CalendarCheck size={14} />
                    <span>{visitSubmitting ? 'Reserving Slot...' : 'Confirm & Lock Schedule'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsVisitModalOpen(false)}
                    className="px-5 py-3 rounded-full bg-neutral-100 hover:bg-neutral-200 text-dark font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Property Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-[#141d26] text-white border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/25">
                  <Flag size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Report Property Listing</h3>
                  <p className="text-xs text-white/60">Submit a compliance or safety concern</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Property Snippet */}
            <div className="mt-4 p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3.5">
              <img
                src={product.image}
                alt={product.title}
                className="w-14 h-12 object-cover rounded-xl border border-white/10 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-white truncate">{product.title}</h4>
                <div className="flex items-center justify-between text-xs text-white/70 mt-0.5">
                  <span className="truncate">{product.location || 'Prime Real Estate'}</span>
                  <span className="font-bold text-amber-400 shrink-0 ml-2">{product.price}</span>
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {reportError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <ShieldAlert size={15} className="shrink-0" />
                <span>{reportError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitPropertyReport} className="mt-4 space-y-4">
              {/* Predefined Reason */}
              <div>
                <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-1.5">
                  Predefined Reason *
                </label>
                <select
                  required
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
                >
                  <option value="Misleading or Inaccurate Information" className="bg-[#141d26]">
                    Misleading or Inaccurate Information
                  </option>
                  <option value="Fraudulent Listing / Fake Ownership" className="bg-[#141d26]">
                    Fraudulent Listing / Fake Ownership
                  </option>
                  <option value="Incorrect Pricing / Hidden Charges" className="bg-[#141d26]">
                    Incorrect Pricing / Hidden Charges
                  </option>
                  <option value="Duplicate Listing" className="bg-[#141d26]">
                    Duplicate Listing
                  </option>
                  <option value="Property Already Sold / Unavailable" className="bg-[#141d26]">
                    Property Already Sold / Unavailable
                  </option>
                  <option value="Inappropriate Images or Content" className="bg-[#141d26]">
                    Inappropriate Images or Content
                  </option>
                  <option value="Other Policy Violation" className="bg-[#141d26]">
                    Other Policy Violation
                  </option>
                </select>
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-1.5">
                  Detailed Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Please describe the discrepancy, violation, or concern with this property listing..."
                  className="w-full p-3.5 rounded-xl border border-white/15 bg-black/40 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
                />
              </div>

              {/* Reporter Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/80 uppercase tracking-wider mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3 py-2 rounded-xl border border-white/15 bg-black/40 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/80 uppercase tracking-wider mb-1">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-white/15 bg-black/40 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/80 uppercase tracking-wider mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    placeholder="+91 Mobile number"
                    className="w-full px-3 py-2 rounded-xl border border-white/15 bg-black/40 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/80 uppercase tracking-wider mb-1">
                    Supporting Link / Evidence (Optional)
                  </label>
                  <input
                    type="url"
                    value={reportEvidenceUrl}
                    onChange={(e) => setReportEvidenceUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl border border-white/15 bg-black/40 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Compliance & Super Admin Authority Notice */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-white/70 leading-relaxed">
                <span className="font-bold text-white flex items-center gap-1.5 mb-0.5">
                  <ShieldCheck size={13} className="text-rose-400" />
                  Confidential Verification Policy:
                </span>
                Reports are forwarded directly to the property owner and the Super Admin. If this listing receives multiple
                verified complaints, the Super Admin will review and execute removal of the property from the portal.
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-white/20 hover:bg-white/10 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="px-6 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Flag size={13} />
                  <span>{isSubmittingReport ? 'Submitting Report...' : 'Submit Report'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetail;
