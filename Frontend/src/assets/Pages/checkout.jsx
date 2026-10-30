import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  ShieldCheck,
  CreditCard,
  Building2,
  QrCode,
  Smartphone,
  Landmark,
  FileText,
  Lock,
  ChevronRight,
  Clock,
  Sparkles,
  Printer,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  DollarSign,
  Calendar,
  MapPin,
  User,
  Key,
  Download,
  ExternalLink,
  Zap,
  Mail,
  Upload,
  FileCheck,
  Loader2,
  Ticket,
  X,
  Tag
} from 'lucide-react';
import { useCart } from '../Context/CartContext';
import { useCustomerAuth } from '../Context/CustomerAuthContext';
import { products, getProductBySlug } from '../Data/products';

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    cartItems,
    clearCart,
    formatPrice,
    subtotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discountAmount
  } = useCart();
  const { customer, isLoggedIn } = useCustomerAuth();

  // If a specific property slug is passed via query params (e.g. /checkout?property=the-white-house-j-54)
  const propertySlug = searchParams.get('property') || searchParams.get('slug');
  const directProduct = propertySlug ? getProductBySlug(propertySlug) : null;

  // Selected properties for checkout: ONLY direct product or actual items in cart. No dummy fallbacks!
  const itemsToCheckout = directProduct
    ? [{
        id: directProduct.id,
        title: directProduct.title,
        price: directProduct.price,
        priceNumber: typeof directProduct.priceNumber === 'number'
          ? directProduct.priceNumber
          : (typeof directProduct.price === 'number' ? directProduct.price : Number(String(directProduct.price || '').replace(/[^0-9.]/g, '')) || 0),
        image: directProduct.image,
        category: directProduct.category || 'Luxury Villa',
        size: directProduct.size || '1,200 sq ft',
        quantity: 1,
      }]
    : (cartItems || []).map((ci) => ({
        ...ci,
        priceNumber: typeof ci.priceNumber === 'number'
          ? ci.priceNumber
          : (typeof ci.price === 'number' ? ci.price : Number(String(ci.price || '').replace(/[^0-9.]/g, '')) || 0),
        quantity: ci.quantity || 1,
      }));

  const primaryItem = itemsToCheckout.length > 0 ? itemsToCheckout[0] : null;

  // Steps: 1: Buyer Info, 2: Registry Address, 3: Payment Plan & Method, 4: Complete
  const [currentStep, setCurrentStep] = useState(1);

  // Buyer Information
  const [buyerInfo, setBuyerInfo] = useState({
    fullName: customer?.name || customer?.firstName || 'Keval Patel',
    email: customer?.email || 'keval@example.com',
    phone: customer?.phone || '+91 98765 43210',
    panOrTaxId: 'ABCDE1234F',
    aadhaarNumber: 'XXXX-XXXX-9821',
    buyerType: 'Individual Buyer',
    hasCoApplicant: false,
    coApplicantName: '',
  });

  // KYC Uploaded Documents
  const [kycDocs, setKycDocs] = useState({
    panCardUrl: '',
    panCardName: '',
    aadhaarDocUrl: '',
    aadhaarDocName: '',
  });
  const [uploadingPan, setUploadingPan] = useState(false);
  const [uploadingAadhaar, setUploadingAadhaar] = useState(false);

  const handleUploadKycFile = async (e, docType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (docType === 'pan') setUploadingPan(true);
    else setUploadingAadhaar(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.fileUrl) {
        setKycDocs((prev) => ({
          ...prev,
          [docType === 'pan' ? 'panCardUrl' : 'aadhaarDocUrl']: data.fileUrl,
          [docType === 'pan' ? 'panCardName' : 'aadhaarDocName']: file.name,
        }));
      } else {
        throw new Error('Upload fallback');
      }
    } catch {
      // Local fallback for offline mode
      const reader = new FileReader();
      reader.onload = () => {
        setKycDocs((prev) => ({
          ...prev,
          [docType === 'pan' ? 'panCardUrl' : 'aadhaarDocUrl']: reader.result,
          [docType === 'pan' ? 'panCardName' : 'aadhaarDocName']: file.name,
        }));
      };
      reader.readAsDataURL(file);
    } finally {
      if (docType === 'pan') setUploadingPan(false);
      else setUploadingAadhaar(false);
    }
  };

  // Registry Address
  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem(`customer_addresses_${customer?.email || 'guest'}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'addr-1',
        isDefault: true,
        type: 'Primary Residence & Deed Address',
        fullName: customer?.name || 'Keval Patel',
        phone: customer?.phone || '+91 98765 43210',
        street: '742 Evergreen Terrace, Palm Boulevard, 4th Floor',
        city: 'Springfield',
        state: 'Oregon',
        pincode: '97477',
        country: 'United States'
      }
    ];
  });

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'United States',
    type: 'Primary Title Address'
  });

  // Payment Plan Selection
  // 'token': Token advance to lock property (e.g. ₹1,00,000)
  // 'full': 100% upfront settlement
  // 'emi': Token now + Home Loan Mortgage EMI
  const [paymentPlan, setPaymentPlan] = useState('token');
  const [tokenAmount, setTokenAmount] = useState('Rs. 1,00,000.00');
  const [tokenNumber, setTokenNumber] = useState(100000);

  // Home Loan Calculator State
  const [loanTenureYears, setLoanTenureYears] = useState(20);
  const [loanInterestRate] = useState(8.5); // 8.5% p.a.

  // Payment Method Selection: 'razorpay', 'upi', 'card', 'netbanking', 'escrow'
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  // UPI State
  const [upiId, setUpiId] = useState('keval@okaxis');
  const [isUpiVerified, setIsUpiVerified] = useState(true);
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');

  // Card State
  const [cardDetails, setCardDetails] = useState({
    number: '4532 •••• •••• 8821',
    name: customer?.name || 'Keval Patel',
    expiry: '08/29',
    cvv: '821',
    saveCard: true
  });

  // Net Banking State
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Escrow Bank Wire State
  const [escrowUtr, setEscrowUtr] = useState('');

  // Gateway Simulation State
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [processingStage, setProcessingStage] = useState(1);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');

  // Razorpay Gateway State
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [currentRzpOrder, setCurrentRzpOrder] = useState(null);
  const [rzpSubmitting, setRzpSubmitting] = useState(false);

  // Completed Order State
  const [completedOrder, setCompletedOrder] = useState(null);

  // Copy toast state
  const [copiedText, setCopiedText] = useState(null);
  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Calculate Total Full Price for all items in checkout
  const propertyFullPrice = itemsToCheckout.reduce((sum, item) => sum + (item.priceNumber || 0) * (item.quantity || 1), 0);
  const rawPayableAmount = paymentPlan === 'token' ? tokenNumber : propertyFullPrice;
  const couponDeduction = appliedCoupon ? Math.min(discountAmount || 25000, rawPayableAmount > 5000 ? rawPayableAmount - 1000 : 0) : 0;
  const payableAmountNumber = Math.max(1000, rawPayableAmount - couponDeduction);
  const payableFormatted = formatPrice(payableAmountNumber);

  // Calculate Monthly EMI for Home Loan
  const loanPrincipal = Math.max(0, propertyFullPrice - tokenNumber);
  const monthlyRate = loanInterestRate / (12 * 100);
  const totalMonths = loanTenureYears * 12;
  const calculatedEmi = Math.round(
    (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)
  ) || 0;

  // Handle Token Amount Selection
  const handleSelectToken = (amountStr, num) => {
    setTokenAmount(amountStr);
    setTokenNumber(num);
  };

  // Handle Real Payment Gateway (Razorpay Test Mode)
  const handleRazorpayPayment = async () => {
    setIsProcessingPayment(true);
    setProcessingStage(1);

    try {
      // 1. Create order on backend via POST /api/payments/create-order
      const res = await fetch('http://localhost:5000/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: payableAmountNumber,
          currency: 'INR',
          customerName: buyerInfo.fullName,
          customerEmail: buyerInfo.email,
          customerPhone: buyerInfo.phone,
          propertyTitle: primaryItem?.title || 'Luxury Real Estate',
          propertyId: primaryItem?.id || 'PROP-01',
        })
      });
      const orderData = await res.json();
      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to initialize payment gateway');
      }

      setIsProcessingPayment(false);
      setCurrentRzpOrder(orderData);
      setIsRazorpayModalOpen(true);
    } catch (err) {
      console.error('Razorpay Error:', err);
      setIsProcessingPayment(false);
      alert(err.message || 'Payment initiation failed. Please check backend connection.');
    }
  };

  // Finalize and verify Razorpay payment with backend
  const handleCompleteRzpVerification = async (customPayload = {}) => {
    if (!currentRzpOrder) return;
    setRzpSubmitting(true);
    setIsRazorpayModalOpen(false);
    setIsProcessingPayment(true);
    setProcessingStage(1);

    setTimeout(() => setProcessingStage(2), 600);
    setTimeout(() => setProcessingStage(3), 1200);

    try {
      const activeAddress = (addresses && addresses[selectedAddressIndex]) || (addresses && addresses[0]) || {
        street: '742 Evergreen Terrace, Palm Boulevard, 4th Floor',
        city: 'Springfield',
        state: 'Oregon',
        pincode: '97477',
        country: 'United States'
      };
      const combinedTitle = itemsToCheckout.length === 1
        ? itemsToCheckout[0].title
        : `${itemsToCheckout[0].title} + ${itemsToCheckout.length - 1} other property${itemsToCheckout.length > 2 ? 'ies' : ''}`;

      const paymentId = customPayload.razorpay_payment_id || `pay_test_${Math.random().toString(36).substring(2, 10)}${Date.now().toString().slice(-4)}`;
      const signature = customPayload.razorpay_signature || `sig_test_${Math.random().toString(36).substring(2, 12)}`;

      const vRes = await fetch('http://localhost:5000/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: currentRzpOrder.order_id,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          customer: buyerInfo.fullName,
          email: buyerInfo.email,
          phone: buyerInfo.phone,
          item: combinedTitle,
          propertyId: primaryItem?.id || null,
          total: formatPrice(propertyFullPrice),
          tokenPaid: payableFormatted,
          address: activeAddress?.street || '742 Evergreen Terrace',
          city: activeAddress?.city || 'Springfield',
          state: activeAddress?.state || 'Oregon',
          pincode: activeAddress?.pincode || '97477',
          country: activeAddress?.country || 'United States',
          propertyImage: primaryItem?.image || '',
          kycDocuments: {
            panNumber: buyerInfo.panOrTaxId,
            aadhaarNumber: buyerInfo.aadhaarNumber,
            panCardUrl: kycDocs.panCardUrl,
            aadhaarDocUrl: kycDocs.aadhaarDocUrl,
            status: 'Under Review',
          }
        })
      });

      const vData = await vRes.json();
      if (!vData.success) {
        throw new Error(vData.error || vData.message || 'Payment signature verification failed');
      }

      const confirmedOrder = vData.order;
      const newOrder = {
        id: confirmedOrder.orderId,
        orderId: confirmedOrder.orderId,
        item: confirmedOrder.item,
        items: itemsToCheckout,
        category: primaryItem?.category || 'Luxury Real Estate',
        total: confirmedOrder.total,
        totalNumber: propertyFullPrice,
        tokenPaid: confirmedOrder.tokenPaid || payableFormatted,
        tokenPaidNumber: confirmedOrder.tokenPaidNumber || payableAmountNumber,
        kycDocuments: confirmedOrder.kycDocuments || {
          panNumber: buyerInfo.panOrTaxId,
          aadhaarNumber: buyerInfo.aadhaarNumber,
          panCardUrl: kycDocs.panCardUrl,
          aadhaarDocUrl: kycDocs.aadhaarDocUrl,
          status: 'Under Review',
        },
        paymentPlan: paymentPlan === 'token' ? 'Token Advance (Allotment Locked)' : '100% Full Upfront Settlement',
        paymentMethod: 'Razorpay Gateway (Test Mode)',
        paymentDetails: confirmedOrder.paymentDetails,
        allotmentReceiptId: confirmedOrder.allotmentReceiptId,
        receiptUrl: vData.receiptUrl,
        txnReference: confirmedOrder.paymentDetails?.razorpay_payment_id || paymentId,
        customer: buyerInfo.fullName,
        email: buyerInfo.email,
        phone: buyerInfo.phone,
        panOrTaxId: buyerInfo.panOrTaxId,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'Processing',
        propertyImage: primaryItem?.image || '',
        address: activeAddress,
        tracking: confirmedOrder.tracking || {
          trackingNumber: `TRK-${confirmedOrder.orderId.replace(/[^0-9]/g, '')}-ESTATE`,
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
            {
              title: 'Booking Request Received & Allotment Locked',
              desc: `Token advance of ${payableFormatted} confirmed via Razorpay. Allotment Certificate issued.`,
              date: 'Today • Confirmed',
              completed: true
            },
            {
              title: 'KYC & Title Deed Verification',
              desc: 'Legal solicitors conducting 7/12 extract, municipal registry and PAN/tax audit.',
              date: 'In progress',
              completed: false
            },
            {
              title: 'Site Visit & Legal Appraisal',
              desc: 'On-site engineer appraisal, boundary survey, and municipal sanctions check.',
              date: 'Estimated 3 Days',
              completed: false
            },
            {
              title: 'Ownership Transfer & Key Handover',
              desc: 'Sub-registrar deed execution, biometric registry, and luxury key handover.',
              date: 'Estimated 7 Days',
              completed: false
            }
          ]
        }
      };

      // Store in localStorage
      const storageKey = `customer_orders_${buyerInfo.email}`;
      try {
        const current = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const cleaned = current.filter((o) => o.id !== 'ORD-894210' && o.id !== 'ORD-762118');
        localStorage.setItem(storageKey, JSON.stringify([newOrder, ...cleaned]));
      } catch {}

      clearCart();
      setIsProcessingPayment(false);
      setRzpSubmitting(false);
      setCompletedOrder(newOrder);
      setCurrentStep(4);
    } catch (err) {
      console.error('Razorpay Verification Error:', err);
      setIsProcessingPayment(false);
      setRzpSubmitting(false);
      alert(err.message || 'Payment verification failed');
    }
  };

  // Submit Payment / Trigger Gateway
  const handleInitiatePayment = (e) => {
    e.preventDefault();
    if (paymentMethod === 'escrow' && !escrowUtr) {
      alert('Please enter your Bank Wire / RTGS UTR reference number.');
      return;
    }
    if (paymentMethod === 'razorpay') {
      handleRazorpayPayment();
      return;
    }
    setIsOtpModalOpen(true);
    setOtpCode('824910'); // Pre-fill sample secure OTP for convenient testing
  };

  // Authorize Payment via OTP
  const handleAuthorizePayment = async () => {
    if (!otpCode || otpCode.length < 4) {
      setOtpError('Please enter a valid 6-digit bank verification code.');
      return;
    }

    setOtpError('');
    setIsOtpModalOpen(false);
    setIsProcessingPayment(true);
    setProcessingStage(1);

    // Realistic multi-stage verification
    setTimeout(() => setProcessingStage(2), 1200);
    setTimeout(() => setProcessingStage(3), 2400);

    setTimeout(async () => {
      const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const txnRef = `TXN-ESTATE-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const activeAddress = addresses[selectedAddressIndex] || addresses[0];

      const combinedTitle = itemsToCheckout.length === 1
        ? itemsToCheckout[0].title
        : `${itemsToCheckout[0].title} + ${itemsToCheckout.length - 1} other property${itemsToCheckout.length > 2 ? 'ies' : ''}`;

      const newOrder = {
        id: orderId,
        orderId,
        item: combinedTitle,
        items: itemsToCheckout,
        category: primaryItem?.category || 'Luxury Real Estate',
        total: formatPrice(propertyFullPrice),
        totalNumber: propertyFullPrice,
        tokenPaid: payableFormatted,
        tokenPaidNumber: payableAmountNumber,
        paymentPlan: paymentPlan === 'token' ? 'Token Advance (Allotment Locked)' : '100% Full Upfront Settlement',
        paymentMethod: paymentMethod === 'upi' ? `UPI Instant (${upiId})` : paymentMethod === 'card' ? `Credit Card (Visa ending in 8821)` : paymentMethod === 'netbanking' ? `NetBanking (${selectedBank})` : `Escrow Wire (UTR: ${escrowUtr || 'N/A'})`,
        txnReference: txnRef,
        customer: buyerInfo.fullName,
        email: buyerInfo.email,
        phone: buyerInfo.phone,
        panOrTaxId: buyerInfo.panOrTaxId,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'Processing',
        propertyImage: primaryItem?.image || '',
        address: activeAddress,
        kycDocuments: {
          panNumber: buyerInfo.panOrTaxId,
          aadhaarNumber: buyerInfo.aadhaarNumber,
          panCardUrl: kycDocs.panCardUrl,
          aadhaarDocUrl: kycDocs.aadhaarDocUrl,
          status: 'Under Review',
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
            {
              title: 'Booking Request Received & Allotment Locked',
              desc: `Token advance of ${payableFormatted} confirmed via ${paymentMethod.toUpperCase()}. Provisional deed allotment generated.`,
              date: 'Today • Confirmed',
              completed: true
            },
            {
              title: 'KYC & Title Deed Verification',
              desc: 'Legal solicitors conducting 7/12 extract, municipal registry and PAN/tax audit.',
              date: 'In progress',
              completed: false
            },
            {
              title: 'Site Visit & Legal Appraisal',
              desc: 'On-site engineer appraisal, boundary survey, and municipal sanctions check.',
              date: 'Estimated 3 Days',
              completed: false
            },
            {
              title: 'Ownership Transfer & Key Handover',
              desc: 'Sub-registrar deed execution, biometric registry, and luxury key handover.',
              date: 'Estimated 7 Days',
              completed: false
            }
          ]
        }
      };

      // Store in localStorage - remove any legacy dummy seed orders
      const storageKey = `customer_orders_${buyerInfo.email}`;
      try {
        const current = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const cleaned = current.filter((o) => o.id !== 'ORD-894210' && o.id !== 'ORD-762118');
        localStorage.setItem(storageKey, JSON.stringify([newOrder, ...cleaned]));
      } catch {}

      // Sync to backend API
      try {
        await fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer: buyerInfo.fullName,
            email: buyerInfo.email,
            phone: buyerInfo.phone,
            item: newOrder.item,
            propertyId: primaryItem?._id || primaryItem?.id || null,
            quantity: primaryItem?.quantity || 1,
            total: newOrder.total,
            tokenPaid: newOrder.tokenPaid,
            tokenAmount: newOrder.tokenPaidNumber,
            address: activeAddress.street,
            city: activeAddress.city,
            state: activeAddress.state,
            pincode: activeAddress.pincode,
            country: activeAddress.country,
            propertyImage: primaryItem?.image || '',
            kycDocuments: newOrder.kycDocuments
          })
        });
      } catch (err) {
        console.warn('Backend order sync optional:', err);
      }

      clearCart();
      setIsProcessingPayment(false);
      setCompletedOrder(newOrder);
      setCurrentStep(4);
    }, 3200);
  };

  return (
    <div className="w-full min-h-screen bg-neutral-50/70 font-sans text-dark py-8 px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Top Header & Security Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-dark/80 hover:text-dark transition-colors cursor-pointer group"
          >
            <span className="w-7 h-7 rounded-full bg-white border border-black/10 flex items-center justify-center transition-all group-hover:bg-dark group-hover:text-white shadow-2xs">
              <ArrowLeft size={13} strokeWidth={2.2} />
            </span>
            <span>Return to Property Catalog</span>
          </button>

          <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
            <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <ShieldCheck size={14} />
              <span>256-Bit SSL Encrypted Escrow</span>
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-dark/70">
              <Landmark size={14} />
              <span>RERA Approved Registry</span>
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* EMPTY CART OR ACTIVE CHECKOUT STEPS */}
        {/* ======================================================== */}
        {itemsToCheckout.length === 0 && !completedOrder ? (
          <div className="bg-white rounded-3xl border border-black/8 p-12 text-center max-w-lg mx-auto space-y-5 shadow-xs my-8 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-dark/60">
              <Building2 size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-dark">Your Cart is Empty</h2>
              <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                Cart me koi property nahi he. Kripya pehle property select kare aur "Buy Now" ya cart me add karke checkout kare.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-2.5 rounded-full bg-dark text-white font-bold text-xs hover:bg-black transition-all cursor-pointer shadow-xs inline-flex items-center gap-2"
              >
                <ArrowLeft size={14} />
                <span>Explore Properties</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ======================================================== */}
            {/* STEP PROGRESS TRACKER (Steps 1 -> 2 -> 3 -> 4) */}
            {/* ======================================================== */}
            {currentStep < 4 && (
              <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-white p-3 sm:p-4 rounded-3xl border border-black/8 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className={`flex items-center gap-2.5 p-2 rounded-2xl transition-all cursor-pointer text-left ${
                    currentStep === 1
                      ? 'bg-dark text-white shadow-xs'
                      : currentStep > 1
                      ? 'text-emerald-700'
                      : 'text-gray-400'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    currentStep === 1 ? 'bg-[#faede3] text-dark' : currentStep > 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {currentStep > 1 ? '✓' : '1'}
                  </span>
                  <div className="hidden sm:block min-w-0">
                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-75">Step 1</p>
                    <p className="text-xs font-bold truncate">Buyer Information</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className={`flex items-center gap-2.5 p-2 rounded-2xl transition-all cursor-pointer text-left ${
                    currentStep === 2
                      ? 'bg-dark text-white shadow-xs'
                      : currentStep > 2
                      ? 'text-emerald-700'
                      : 'text-gray-400'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    currentStep === 2 ? 'bg-[#faede3] text-dark' : currentStep > 2 ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {currentStep > 2 ? '✓' : '2'}
                  </span>
                  <div className="hidden sm:block min-w-0">
                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-75">Step 2</p>
                    <p className="text-xs font-bold truncate">Registry Address</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className={`flex items-center gap-2.5 p-2 rounded-2xl transition-all cursor-pointer text-left ${
                    currentStep === 3
                      ? 'bg-dark text-white shadow-xs'
                      : 'text-gray-400'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    currentStep === 3 ? 'bg-[#faede3] text-dark' : 'bg-gray-100 text-gray-400'
                  }`}>
                    3
                  </span>
                  <div className="hidden sm:block min-w-0">
                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-75">Step 3</p>
                    <p className="text-xs font-bold truncate">Payment & Settlement</p>
                  </div>
                </button>
              </div>
            )}

        {/* ======================================================== */}
        {/* MAIN CHECKOUT LAYOUT (GRID: LEFT 8 COLS, RIGHT 4 COLS) */}
        {/* ======================================================== */}
        {currentStep < 4 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: ACTIVE STEP FORM (8 COLS) */}
            <div className="lg:col-span-8 space-y-6">

              {/* ---------------------------------------------------- */}
              {/* STEP 1: BUYER INFORMATION & LEGAL TITLE IDENTITY */}
              {/* ---------------------------------------------------- */}
              {currentStep === 1 && (
                <div className="bg-white rounded-3xl border border-black/8 p-6 sm:p-8 shadow-sm space-y-6">
                  <div>
                    <h2 className="text-xl font-extrabold text-dark">Buyer Legal Title Details</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Provide authorized buyer identification for Sub-Registrar stamp duty deed and RERA certificate.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-dark mb-1.5">Legal Buyer Full Name *</label>
                      <input
                        type="text"
                        required
                        value={buyerInfo.fullName}
                        onChange={(e) => setBuyerInfo({ ...buyerInfo, fullName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark"
                        placeholder="As shown on Passport or Govt ID"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-dark mb-1.5">Contact Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={buyerInfo.phone}
                        onChange={(e) => setBuyerInfo({ ...buyerInfo, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark"
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-dark mb-1.5">Official Email for Allotment Deed *</label>
                      <input
                        type="email"
                        required
                        value={buyerInfo.email}
                        onChange={(e) => setBuyerInfo({ ...buyerInfo, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark"
                        placeholder="buyer@example.com"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-dark mb-1.5">PAN Card / Tax Identification Number *</label>
                      <input
                        type="text"
                        required
                        value={buyerInfo.panOrTaxId}
                        onChange={(e) => setBuyerInfo({ ...buyerInfo, panOrTaxId: e.target.value.toUpperCase() })}
                        className="w-full px-4 py-3 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark uppercase font-mono"
                        placeholder="e.g. ABCDE1234F"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-dark mb-1.5">Ownership Structure</label>
                      <select
                        value={buyerInfo.buyerType}
                        onChange={(e) => setBuyerInfo({ ...buyerInfo, buyerType: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-dark focus:ring-1 focus:ring-dark"
                      >
                        <option value="Individual Buyer">Sole Individual Owner</option>
                        <option value="Joint Family Ownership">Joint / Family Ownership</option>
                        <option value="Corporate / LLP Entity">Corporate / Private Trust</option>
                        <option value="Non-Resident Indian (NRI / OCI)">NRI / International Buyer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-dark mb-1.5">National Identity Proof (Aadhaar / Passport)</label>
                      <input
                        type="text"
                        value={buyerInfo.aadhaarNumber}
                        onChange={(e) => setBuyerInfo({ ...buyerInfo, aadhaarNumber: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark"
                        placeholder="XXXX-XXXX-9821"
                      />
                    </div>
                  </div>

                  {/* KYC Document Upload Section */}
                  <div className="pt-4 border-t border-black/10 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-dark flex items-center gap-1.5">
                          <FileCheck size={16} className="text-emerald-600" />
                          <span>Upload KYC Verification Documents (RERA Required)</span>
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Upload clear image (JPG, PNG) or PDF of your PAN Card and National Identity Proof.
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full self-start sm:self-auto">
                        🔒 Encrypted &amp; Audit Compliant
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      {/* Document 1: PAN Card */}
                      <div className={`p-4 rounded-2xl border transition-all ${
                        kycDocs.panCardUrl ? 'border-emerald-500 bg-emerald-50/20' : 'border-dashed border-black/20 bg-neutral-50 hover:bg-white'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-dark flex items-center gap-1.5">
                            <span>PAN Card Document</span>
                            {kycDocs.panCardUrl && <CheckCircle size={14} className="text-emerald-600" />}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">PDF, JPG, PNG</span>
                        </div>

                        {kycDocs.panCardUrl ? (
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-emerald-300">
                            <div className="flex items-center gap-2 truncate">
                              <FileText size={16} className="text-emerald-600 shrink-0" />
                              <span className="text-xs font-bold text-dark truncate">
                                {kycDocs.panCardName || 'PAN_Document_Uploaded.pdf'}
                              </span>
                            </div>
                            <label className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer shrink-0 ml-2">
                              Change
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) => handleUploadKycFile(e, 'pan')}
                                className="hidden"
                              />
                            </label>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center p-4 border border-dashed border-black/15 rounded-xl bg-white cursor-pointer hover:border-black/40 transition-colors">
                            {uploadingPan ? (
                              <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                <Loader2 size={16} className="animate-spin text-dark" />
                                <span>Uploading PAN...</span>
                              </div>
                            ) : (
                              <>
                                <Upload size={18} className="text-gray-400 mb-1" />
                                <span className="text-xs font-bold text-dark">Click to upload PAN Card</span>
                                <span className="text-[10px] text-gray-400 mt-0.5">Supports PDF or Image</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              disabled={uploadingPan}
                              onChange={(e) => handleUploadKycFile(e, 'pan')}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      {/* Document 2: Aadhaar Card / National ID */}
                      <div className={`p-4 rounded-2xl border transition-all ${
                        kycDocs.aadhaarDocUrl ? 'border-emerald-500 bg-emerald-50/20' : 'border-dashed border-black/20 bg-neutral-50 hover:bg-white'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-dark flex items-center gap-1.5">
                            <span>Aadhaar / Passport Document</span>
                            {kycDocs.aadhaarDocUrl && <CheckCircle size={14} className="text-emerald-600" />}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">PDF, JPG, PNG</span>
                        </div>

                        {kycDocs.aadhaarDocUrl ? (
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-emerald-300">
                            <div className="flex items-center gap-2 truncate">
                              <FileText size={16} className="text-emerald-600 shrink-0" />
                              <span className="text-xs font-bold text-dark truncate">
                                {kycDocs.aadhaarDocName || 'Identity_Proof_Uploaded.pdf'}
                              </span>
                            </div>
                            <label className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer shrink-0 ml-2">
                              Change
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) => handleUploadKycFile(e, 'aadhaar')}
                                className="hidden"
                              />
                            </label>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center p-4 border border-dashed border-black/15 rounded-xl bg-white cursor-pointer hover:border-black/40 transition-colors">
                            {uploadingAadhaar ? (
                              <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                <Loader2 size={16} className="animate-spin text-dark" />
                                <span>Uploading Identity Proof...</span>
                              </div>
                            ) : (
                              <>
                                <Upload size={18} className="text-gray-400 mb-1" />
                                <span className="text-xs font-bold text-dark">Click to upload Aadhaar / Passport</span>
                                <span className="text-[10px] text-gray-400 mt-0.5">Supports PDF or Image</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              disabled={uploadingAadhaar}
                              onChange={(e) => handleUploadKycFile(e, 'aadhaar')}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Co-Applicant Option */}
                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-dark">
                      <input
                        type="checkbox"
                        checked={buyerInfo.hasCoApplicant}
                        onChange={(e) => setBuyerInfo({ ...buyerInfo, hasCoApplicant: e.target.checked })}
                        className="rounded border-black/20 text-dark focus:ring-dark"
                      />
                      <span>Add Co-Applicant / Joint Property Owner (Spouse / Partner / Family)</span>
                    </label>

                    {buyerInfo.hasCoApplicant && (
                      <div className="mt-3 p-4 bg-neutral-50 rounded-2xl border border-black/5 text-xs">
                        <label className="block font-bold text-dark mb-1">Co-Applicant Full Legal Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Ananya Patel"
                          value={buyerInfo.coApplicantName}
                          onChange={(e) => setBuyerInfo({ ...buyerInfo, coApplicantName: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white"
                        />
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-black/8 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="bg-dark hover:bg-black text-white text-xs font-bold py-3.5 px-8 rounded-full flex items-center gap-2 transition-all cursor-pointer shadow-md"
                    >
                      <span>Proceed to Registry Address</span>
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* STEP 2: REGISTRY DEED ADDRESS */}
              {/* ---------------------------------------------------- */}
              {currentStep === 2 && (
                <div className="bg-white rounded-3xl border border-black/8 p-6 sm:p-8 shadow-sm space-y-6">
                  <div>
                    <h2 className="text-xl font-extrabold text-dark">Deed Registration & Notice Address</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Choose the official correspondence location where legal title notices and courier documents will be delivered.
                    </p>
                  </div>

                  {/* Saved Addresses list */}
                  <div className="space-y-3">
                    {addresses.map((addr, idx) => (
                      <div
                        key={addr.id || idx}
                        onClick={() => setSelectedAddressIndex(idx)}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                          selectedAddressIndex === idx
                            ? 'border-dark ring-2 ring-dark/10 bg-neutral-50 shadow-xs'
                            : 'border-black/10 hover:border-black/25'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            selectedAddressIndex === idx ? 'border-dark bg-dark text-white' : 'border-gray-400'
                          }`}>
                            {selectedAddressIndex === idx && <span className="w-2 h-2 rounded-full bg-white" />}
                          </div>

                          <div className="text-xs space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-dark text-sm">{addr.fullName}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-black/5 text-dark rounded-full">
                                {addr.type}
                              </span>
                            </div>
                            <p className="text-gray-600 font-medium">{addr.street}</p>
                            <p className="text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                            <p className="text-dark font-semibold pt-1">Contact: {addr.phone}</p>
                          </div>
                        </div>

                        {addr.isDefault && (
                          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                            Default
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add New Address Accordion */}
                  <div>
                    {!isAddingNewAddress ? (
                      <button
                        type="button"
                        onClick={() => setIsAddingNewAddress(true)}
                        className="text-xs font-bold text-dark hover:underline flex items-center gap-1 cursor-pointer pt-2"
                      >
                        <span>+ Enter New Registry Address</span>
                      </button>
                    ) : (
                      <div className="p-5 bg-neutral-50 rounded-2xl border border-black/10 space-y-3 text-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-black/5">
                          <h4 className="font-bold text-dark">Add New Registration Address</h4>
                          <button
                            type="button"
                            onClick={() => setIsAddingNewAddress(false)}
                            className="text-gray-400 hover:text-dark font-bold"
                          >
                            Cancel
                          </button>
                        </div>

                        <div>
                          <label className="block font-bold text-dark mb-1">Street Address & Landmark *</label>
                          <input
                            type="text"
                            value={newAddress.street}
                            onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                            placeholder="Plot / Flat / Street Name"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block font-bold text-dark mb-1">City *</label>
                            <input
                              type="text"
                              value={newAddress.city}
                              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-dark mb-1">State *</label>
                            <input
                              type="text"
                              value={newAddress.state}
                              onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-dark mb-1">PIN Code *</label>
                            <input
                              type="text"
                              value={newAddress.pincode}
                              onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (!newAddress.street || !newAddress.city || !newAddress.pincode) {
                              alert('Please fill out street, city and PIN code.');
                              return;
                            }
                            const added = {
                              ...newAddress,
                              id: `addr-${Date.now()}`,
                              fullName: buyerInfo.fullName,
                              phone: buyerInfo.phone
                            };
                            setAddresses([...addresses, added]);
                            setSelectedAddressIndex(addresses.length);
                            setIsAddingNewAddress(false);
                          }}
                          className="bg-dark text-white text-xs font-bold px-4 py-2 rounded-full cursor-pointer mt-2"
                        >
                          Use This Address
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-black/8 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-bold text-dark/70 hover:text-dark cursor-pointer"
                    >
                      ← Back to Buyer Info
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="bg-dark hover:bg-black text-white text-xs font-bold py-3.5 px-8 rounded-full flex items-center gap-2 transition-all cursor-pointer shadow-md"
                    >
                      <span>Proceed to Payment Plan</span>
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* STEP 3: PAYMENT PLAN & PAYMENT MODES */}
              {/* ---------------------------------------------------- */}
              {currentStep === 3 && (
                <div className="bg-white rounded-3xl border border-black/8 p-6 sm:p-8 shadow-sm space-y-8">
                  {/* Part A: Choose Payment Plan */}
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-xl font-extrabold text-dark">Select Payment Plan</h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Lock in the property allotment with an initial token advance or complete full acquisition settlement today.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Plan 1: Token Advance (Most Common in Real Estate) */}
                      <div
                        onClick={() => setPaymentPlan('token')}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          paymentPlan === 'token'
                            ? 'border-dark bg-[#faede3]/40 ring-2 ring-dark shadow-xs'
                            : 'border-black/10 hover:border-black/30 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-dark text-white">
                              Recommended
                            </span>
                            <span className="text-xs font-bold text-emerald-700">Immediate Hold</span>
                          </div>
                          <h4 className="text-sm font-extrabold text-dark">Token Advance Allotment</h4>
                          <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                            Pay initial token deposit to freeze property allotment & begin title deed transfer.
                          </p>
                        </div>
                        <p className="text-sm font-extrabold text-dark mt-3 pt-2 border-t border-black/5">
                          {tokenAmount}
                        </p>
                      </div>

                      {/* Plan 2: 100% Full Payment */}
                      <div
                        onClick={() => setPaymentPlan('full')}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          paymentPlan === 'full'
                            ? 'border-dark bg-[#faede3]/40 ring-2 ring-dark shadow-xs'
                            : 'border-black/10 hover:border-black/30 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-neutral-200 text-dark">
                              Direct Buy
                            </span>
                            <span className="text-xs font-bold text-gray-500">100% Full</span>
                          </div>
                          <h4 className="text-sm font-extrabold text-dark">Full Upfront Settlement</h4>
                          <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                            Full property price payment into legal escrow for immediate registry scheduling.
                          </p>
                        </div>
                        <p className="text-sm font-extrabold text-dark mt-3 pt-2 border-t border-black/5">
                          {formatPrice(propertyFullPrice)}
                        </p>
                      </div>

                      {/* Plan 3: Home Loan Assistance */}
                      <div
                        onClick={() => setPaymentPlan('emi')}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          paymentPlan === 'emi'
                            ? 'border-dark bg-[#faede3]/40 ring-2 ring-dark shadow-xs'
                            : 'border-black/10 hover:border-black/30 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                              Bank Mortgage
                            </span>
                            <span className="text-xs font-bold text-blue-700">8.5% p.a.</span>
                          </div>
                          <h4 className="text-sm font-extrabold text-dark">Home Loan + Token</h4>
                          <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                            Token advance today + bank home loan pre-approval for the remaining 80-90%.
                          </p>
                        </div>
                        <p className="text-sm font-extrabold text-dark mt-3 pt-2 border-t border-black/5">
                          ₹{calculatedEmi.toLocaleString()}/mo
                        </p>
                      </div>
                    </div>

                    {/* Token Amount Selector (If Token plan chosen) */}
                    {paymentPlan === 'token' && (
                      <div className="p-4 bg-neutral-50 rounded-2xl border border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <span className="font-bold text-dark">Select Token Deposit Amount:</span>
                        <div className="flex items-center gap-2 flex-wrap">
                          {[
                            { label: 'Rs. 50,000.00', num: 50000 },
                            { label: 'Rs. 1,00,000.00', num: 100000 },
                            { label: 'Rs. 2,50,000.00', num: 250000 },
                          ].map((t) => (
                            <button
                              key={t.num}
                              type="button"
                              onClick={() => handleSelectToken(t.label, t.num)}
                              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                                tokenNumber === t.num
                                  ? 'bg-dark text-white shadow-2xs'
                                  : 'bg-white text-dark border border-black/15 hover:bg-neutral-100'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Home Loan Interactive Calculator (If EMI chosen) */}
                    {paymentPlan === 'emi' && (
                      <div className="p-5 bg-neutral-50 rounded-2xl border border-black/8 space-y-4 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-dark text-sm">Estimated Bank Mortgage EMI</span>
                          <span className="text-base font-extrabold text-emerald-700">
                            ₹{calculatedEmi.toLocaleString()} / month
                          </span>
                        </div>

                        <div>
                          <div className="flex justify-between text-gray-500 mb-1">
                            <span>Loan Tenure: <strong>{loanTenureYears} Years</strong></span>
                            <span>Interest Rate: <strong>8.5% p.a. (HDFC / SBI)</strong></span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="30"
                            step="5"
                            value={loanTenureYears}
                            onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                            className="w-full accent-dark cursor-pointer"
                          />
                        </div>

                        <div className="text-[11px] text-gray-500 bg-white p-3 rounded-xl border border-black/5 flex items-center gap-2">
                          <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                          <span>Pre-approved mortgage assistance: Our legal officer will arrange bank sanction letter within 48 hours.</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Part B: Choose Payment Mode */}
                  <div className="space-y-4 pt-6 border-t border-black/8">
                    <div>
                      <h3 className="text-lg font-extrabold text-dark">Select Payment Mode</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Choose your verified transaction channel for paying <strong className="text-dark">{payableFormatted}</strong>.
                      </p>
                    </div>

                    {/* Payment Mode Tabs (Razorpay, UPI, Card, NetBanking, Escrow Wire) */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('razorpay')}
                        className={`p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all cursor-pointer relative ${
                          paymentMethod === 'razorpay'
                            ? 'border-dark bg-dark text-white shadow-xs'
                            : 'border-black/10 hover:border-black/30 bg-white text-dark'
                        }`}
                      >
                        <span className="absolute -top-2 right-2 text-[8px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                          Gateway
                        </span>
                        <Zap size={20} className={paymentMethod === 'razorpay' ? 'text-amber-400' : 'text-dark'} />
                        <span className="text-center">Razorpay Test</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all cursor-pointer ${
                          paymentMethod === 'upi'
                            ? 'border-dark bg-dark text-white shadow-xs'
                            : 'border-black/10 hover:border-black/30 bg-white text-dark'
                        }`}
                      >
                        <QrCode size={20} />
                        <span>UPI / QR Code</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all cursor-pointer ${
                          paymentMethod === 'card'
                            ? 'border-dark bg-dark text-white shadow-xs'
                            : 'border-black/10 hover:border-black/30 bg-white text-dark'
                        }`}
                      >
                        <CreditCard size={20} />
                        <span>Credit / Debit Card</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('netbanking')}
                        className={`p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all cursor-pointer ${
                          paymentMethod === 'netbanking'
                            ? 'border-dark bg-dark text-white shadow-xs'
                            : 'border-black/10 hover:border-black/30 bg-white text-dark'
                        }`}
                      >
                        <Landmark size={20} />
                        <span>Net Banking</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('escrow')}
                        className={`p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all cursor-pointer ${
                          paymentMethod === 'escrow'
                            ? 'border-dark bg-dark text-white shadow-xs'
                            : 'border-black/10 hover:border-black/30 bg-white text-dark'
                        }`}
                      >
                        <Building2 size={20} />
                        <span>Escrow Bank Wire</span>
                      </button>
                    </div>

                    {/* ============================================== */}
                    {/* MODE 0: RAZORPAY GATEWAY (TEST MODE) */}
                    {/* ============================================== */}
                    {paymentMethod === 'razorpay' && (
                      <div className="p-6 bg-linear-to-br from-[#121920]/5 via-neutral-50 to-emerald-50/30 rounded-3xl border border-black/10 space-y-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-black/8">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-dark text-amber-400 flex items-center justify-center shadow-md">
                              <Zap size={24} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-dark text-sm sm:text-base">
                                  Razorpay Real Payment Gateway
                                </h4>
                                <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                                  Test Mode Active
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Verified RERA Escrow integration. Accepts all cards, UPI, NetBanking & wallets.
                              </p>
                            </div>
                          </div>

                          <span className="text-xs font-mono font-bold bg-dark/5 text-dark px-3 py-1 rounded-xl border border-black/10">
                            Key: rzp_test_realestate2026
                          </span>
                        </div>

                        {/* Supported Methods inside Razorpay */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="p-3 bg-white rounded-xl border border-black/5 shadow-2xs space-y-1">
                            <span className="font-bold text-dark flex items-center gap-1.5">
                              <QrCode size={14} className="text-emerald-600" /> UPI & Apps
                            </span>
                            <p className="text-[10px] text-gray-500">GPay, PhonePe, Paytm, QR</p>
                          </div>
                          <div className="p-3 bg-white rounded-xl border border-black/5 shadow-2xs space-y-1">
                            <span className="font-bold text-dark flex items-center gap-1.5">
                              <CreditCard size={14} className="text-blue-600" /> Cards
                            </span>
                            <p className="text-[10px] text-gray-500">Visa, Mastercard, RuPay, Amex</p>
                          </div>
                          <div className="p-3 bg-white rounded-xl border border-black/5 shadow-2xs space-y-1">
                            <span className="font-bold text-dark flex items-center gap-1.5">
                              <Landmark size={14} className="text-purple-600" /> NetBanking
                            </span>
                            <p className="text-[10px] text-gray-500">50+ Indian & Global Banks</p>
                          </div>
                          <div className="p-3 bg-white rounded-xl border border-black/5 shadow-2xs space-y-1">
                            <span className="font-bold text-dark flex items-center gap-1.5">
                              <ShieldCheck size={14} className="text-emerald-700" /> 100% Escrow
                            </span>
                            <p className="text-[10px] text-gray-500">RERA Allotment Deed Sync</p>
                          </div>
                        </div>

                        {/* Info banner */}
                        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/60 flex items-start gap-3 text-xs text-amber-900">
                          <Sparkles size={16} className="text-amber-600 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <p className="font-bold">Test Mode Active: No real money is deducted</p>
                            <p className="text-[11px] text-amber-800 leading-relaxed">
                              Clicking "Pay via Razorpay Gateway" will call <code>POST /api/payments/create-order</code>, launch the official Razorpay test checkout or seamless verification fallback, confirm the booking in MongoDB, and auto-generate your downloadable PDF Allotment Receipt.
                            </p>
                          </div>
                        </div>

                        {/* Quick Direct Pay Button inside the card for convenience */}
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={handleRazorpayPayment}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-6 rounded-full flex items-center gap-2 cursor-pointer shadow-md transition-all hover:scale-[1.02]"
                          >
                            <Zap size={14} />
                            <span>Pay {payableFormatted} via Razorpay Test Gateway</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ============================================== */}
                    {/* MODE 1: UPI & QR CODE DETAILS */}
                    {/* ============================================== */}
                    {paymentMethod === 'upi' && (
                      <div className="p-6 bg-neutral-50 rounded-3xl border border-black/8 space-y-5">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                          {/* Simulated Dynamic UPI QR Code */}
                          <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-sm flex flex-col items-center shrink-0">
                            <div className="w-36 h-36 bg-white border border-dashed border-dark/30 rounded-xl flex flex-col items-center justify-center p-2 text-center relative overflow-hidden">
                              {/* QR Pattern visual elements */}
                              <div className="w-full h-full flex flex-col justify-between">
                                <div className="flex justify-between">
                                  <div className="w-8 h-8 border-4 border-dark rounded-md flex items-center justify-center">
                                    <div className="w-3 h-3 bg-dark rounded-xs" />
                                  </div>
                                  <div className="w-8 h-8 border-4 border-dark rounded-md flex items-center justify-center">
                                    <div className="w-3 h-3 bg-dark rounded-xs" />
                                  </div>
                                </div>
                                <div className="text-[10px] font-extrabold text-dark py-1">
                                  REAL ESTATE ESCROW
                                </div>
                                <div className="flex justify-between items-end">
                                  <div className="w-8 h-8 border-4 border-dark rounded-md flex items-center justify-center">
                                    <div className="w-3 h-3 bg-dark rounded-xs" />
                                  </div>
                                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded">
                                    VERIFIED
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-gray-500 mt-2 flex items-center gap-1">
                              <Clock size={11} /> Valid for 14:59 mins
                            </span>
                          </div>

                          {/* Quick UPI Apps & ID input */}
                          <div className="space-y-4 flex-1 text-xs w-full">
                            <div>
                              <p className="font-bold text-dark mb-2">Scan with Any UPI App:</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI', 'Cred'].map((app) => (
                                  <span
                                    key={app}
                                    className="px-3 py-1.5 rounded-xl bg-white border border-black/10 font-bold text-dark shadow-2xs"
                                  >
                                    {app}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="block font-bold text-dark mb-1">Or Enter Your Virtual Payment Address (VPA / UPI ID):</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={upiId}
                                  onChange={(e) => setUpiId(e.target.value)}
                                  placeholder="e.g. yourname@okaxis"
                                  className="flex-1 px-4 py-2.5 rounded-xl border border-black/15 bg-white focus:ring-1 focus:ring-dark"
                                />
                                <button
                                  type="button"
                                  onClick={() => setIsUpiVerified(true)}
                                  className="bg-dark hover:bg-black text-white px-4 py-2.5 rounded-xl font-bold cursor-pointer"
                                >
                                  {isUpiVerified ? 'Verified ✓' : 'Verify'}
                                </button>
                              </div>
                              <p className="text-[10px] text-gray-500 mt-1">
                                A payment prompt for <strong>{payableFormatted}</strong> will be sent to your UPI app.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ============================================== */}
                    {/* MODE 2: CREDIT / DEBIT CARDS */}
                    {/* ============================================== */}
                    {paymentMethod === 'card' && (
                      <div className="p-6 bg-neutral-50 rounded-3xl border border-black/8 space-y-6">
                        {/* Metallic Luxury Virtual Card Display */}
                        <div className="max-w-md mx-auto rounded-3xl bg-linear-to-tr from-[#121920] via-dark to-[#24303c] text-white p-6 shadow-xl relative overflow-hidden select-none border border-white/10">
                          <div className="flex justify-between items-center mb-6">
                            <span className="text-[10px] font-mono tracking-widest uppercase text-white/70">
                              Real Estate Escrow Debit Card
                            </span>
                            <span className="text-lg font-black tracking-widest italic text-[#faede3]">
                              VISA
                            </span>
                          </div>

                          <div className="space-y-4">
                            <div className="w-10 h-7 rounded-md bg-amber-400/80 border border-amber-300 shadow-inner" />

                            <p className="font-mono text-lg sm:text-xl font-extrabold tracking-widest text-white">
                              {cardDetails.number}
                            </p>

                            <div className="flex justify-between items-end pt-2 text-xs">
                              <div>
                                <span className="text-[9px] uppercase tracking-wider text-white/50 block">Cardholder</span>
                                <span className="font-bold text-white uppercase">{cardDetails.name || 'VALUED BUYER'}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-[9px] uppercase tracking-wider text-white/50 block">Expires</span>
                                <span className="font-mono font-bold text-white">{cardDetails.expiry}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card input fields */}
                        <div className="space-y-3 text-xs max-w-lg mx-auto">
                          <div>
                            <label className="block font-bold text-dark mb-1">Card Number *</label>
                            <input
                              type="text"
                              value={cardDetails.number}
                              onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                              placeholder="16-digit card number"
                              className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white font-mono focus:ring-1 focus:ring-dark"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block font-bold text-dark mb-1">Expiry Date *</label>
                              <input
                                type="text"
                                value={cardDetails.expiry}
                                onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                placeholder="MM/YY"
                                className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white font-mono focus:ring-1 focus:ring-dark"
                              />
                            </div>
                            <div>
                              <label className="block font-bold text-dark mb-1">CVV / CVC *</label>
                              <input
                                type="password"
                                maxLength={4}
                                value={cardDetails.cvv}
                                onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                                placeholder="3 digits"
                                className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white font-mono focus:ring-1 focus:ring-dark"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block font-bold text-dark mb-1">Name on Card *</label>
                            <input
                              type="text"
                              value={cardDetails.name}
                              onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                              placeholder="Name printed on card"
                              className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white focus:ring-1 focus:ring-dark"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ============================================== */}
                    {/* MODE 3: NET BANKING */}
                    {/* ============================================== */}
                    {paymentMethod === 'netbanking' && (
                      <div className="p-6 bg-neutral-50 rounded-3xl border border-black/8 space-y-4 text-xs">
                        <p className="font-bold text-dark">Popular Scheduled Banks:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map((b) => (
                            <button
                              key={b}
                              type="button"
                              onClick={() => setSelectedBank(b)}
                              className={`p-3 rounded-xl border font-bold text-left transition-all cursor-pointer flex items-center justify-between ${
                                selectedBank === b
                                  ? 'border-dark bg-dark text-white shadow-2xs'
                                  : 'border-black/10 bg-white text-dark hover:border-black/25'
                              }`}
                            >
                              <span>{b}</span>
                              {selectedBank === b && <span>✓</span>}
                            </button>
                          ))}
                        </div>

                        <div className="pt-2">
                          <label className="block font-bold text-dark mb-1">Or Select from All Banks:</label>
                          <select
                            value={selectedBank}
                            onChange={(e) => setSelectedBank(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white"
                          >
                            <option value="HDFC Bank">HDFC Bank</option>
                            <option value="ICICI Bank">ICICI Bank</option>
                            <option value="State Bank of India">State Bank of India (SBI)</option>
                            <option value="Axis Bank">Axis Bank</option>
                            <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                            <option value="Bank of Baroda">Bank of Baroda</option>
                            <option value="Canara Bank">Canara Bank</option>
                            <option value="IndusInd Bank">IndusInd Bank</option>
                            <option value="Standard Chartered">Standard Chartered Bank</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* ============================================== */}
                    {/* MODE 4: ESCROW WIRE / RTGS / NEFT */}
                    {/* ============================================== */}
                    {paymentMethod === 'escrow' && (
                      <div className="p-6 bg-neutral-50 rounded-3xl border border-black/8 space-y-4 text-xs">
                        <div className="flex items-center gap-2 text-dark font-extrabold text-sm pb-2 border-b border-black/8">
                          <Building2 size={16} />
                          <span>Official Real Estate Escrow Trust Account</span>
                        </div>

                        <div className="space-y-2 bg-white p-4 rounded-2xl border border-black/10">
                          <div className="flex justify-between items-center py-1 border-b border-black/5">
                            <span className="text-gray-500">Beneficiary Name:</span>
                            <span className="font-extrabold text-dark">Modern Real Estate Client Escrow Trust</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-black/5">
                            <span className="text-gray-500">Escrow Bank:</span>
                            <span className="font-bold text-dark">HDFC Bank Ltd, Nariman Point Branch</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-black/5">
                            <span className="text-gray-500">Virtual Account Number:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-dark">50200088921134</span>
                              <button
                                type="button"
                                onClick={() => handleCopy('50200088921134')}
                                className="text-gray-400 hover:text-dark cursor-pointer"
                              >
                                <Copy size={12} />
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span className="text-gray-500">IFSC Code:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-dark">HDFC0000060</span>
                              <button
                                type="button"
                                onClick={() => handleCopy('HDFC0000060')}
                                className="text-gray-400 hover:text-dark cursor-pointer"
                              >
                                <Copy size={12} />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-dark mb-1">
                            Enter Bank Transfer UTR / Transaction Reference Number *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. HDFC2026102089201948"
                            value={escrowUtr}
                            onChange={(e) => setEscrowUtr(e.target.value.toUpperCase())}
                            className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white font-mono uppercase"
                          />
                          <p className="text-[10px] text-gray-500 mt-1">
                            Once entered, funds will be auto-reconciled against this allotment reference.
                          </p>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Bottom Navigation */}
                  <div className="pt-4 border-t border-black/8 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-bold text-dark/70 hover:text-dark cursor-pointer"
                    >
                      ← Back to Address
                    </button>

                    <button
                      type="button"
                      onClick={handleInitiatePayment}
                      className="bg-dark hover:bg-black text-white text-xs font-extrabold py-4 px-9 rounded-full flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:scale-[1.02]"
                    >
                      <Lock size={14} />
                      <span>Authorize Payment of {payableFormatted}</span>
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: PROPERTY & ORDER SUMMARY (4 COLS) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl border border-black/8 p-6 shadow-sm space-y-5 sticky top-6">
                <div className="flex items-center justify-between pb-3 border-b border-black/8">
                  <h3 className="text-sm font-extrabold text-dark uppercase tracking-wider">
                    Property Allotment Order
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
                    Active Allotment
                  </span>
                </div>

                {/* Property Card Snapshot or Multiple Items */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {itemsToCheckout.map((item, idx) => (
                    <div key={item.id || idx} className="flex items-start gap-3.5 bg-neutral-50 p-3 rounded-2xl border border-black/5">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                          {item.category || 'Property'}
                        </span>
                        <h4 className="text-xs font-bold text-dark leading-snug truncate">
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          Size: {item.size || '1,200 sq ft'} {item.quantity > 1 ? `• Qty: ${item.quantity}` : ''}
                        </p>
                        <p className="text-xs font-extrabold text-dark mt-1">
                          {typeof item.price === 'string' ? item.price : formatPrice(item.priceNumber || item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Applied Offer Banner if active */}
                {appliedCoupon && (
                  <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                        <Ticket size={13} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono font-extrabold text-dark truncate">{appliedCoupon.code}</p>
                        <p className="text-[10px] text-emerald-700 font-bold truncate">{appliedCoupon.discount}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-gray-400 hover:text-red-600 font-bold text-[10px] uppercase p-1 cursor-pointer"
                      title="Remove offer code"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Payment Breakdown */}
                <div className="space-y-2 text-xs pt-2">
                  <div className="flex justify-between text-gray-600">
                    <span>{itemsToCheckout.length > 1 ? `Total Properties Value (${itemsToCheckout.length}):` : 'Full Property Value:'}</span>
                    <span className="font-bold text-dark">
                      {formatPrice(propertyFullPrice)}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Payment Plan Chosen:</span>
                    <span className="font-bold text-dark">
                      {paymentPlan === 'token' ? 'Token Advance Allotment' : paymentPlan === 'emi' ? 'Home Loan Assistance' : '100% Upfront Buy'}
                    </span>
                  </div>

                  {couponDeduction > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200/60">
                      <span className="flex items-center gap-1">
                        <Check size={12} />
                        <span>Offer Applied ({appliedCoupon.code}):</span>
                      </span>
                      <span>- {formatPrice(couponDeduction)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Legal Due Diligence & RERA Stamp:</span>
                    <span className="font-bold text-emerald-700">Complimentary ✓</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Escrow Trust Service Fee:</span>
                    <span className="font-bold text-emerald-700">₹0 (Zero Fee)</span>
                  </div>

                  <div className="pt-3 border-t border-black/10 flex justify-between items-baseline">
                    <div>
                      <p className="text-sm font-extrabold text-dark">Payable Today:</p>
                      <p className="text-[10px] text-gray-400">
                        {paymentPlan === 'token' ? 'Remaining due at Sub-Registrar deed signing' : 'Full settlement verified in escrow'}
                      </p>
                    </div>
                    <span className="text-xl font-extrabold text-dark">
                      {payableFormatted}
                    </span>
                  </div>
                </div>

                {/* Security Badges */}
                <div className="pt-3 border-t border-black/5 space-y-2 text-[11px] text-gray-500">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                    <span>Government RERA Approved Title Verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock size={14} className="text-dark shrink-0" />
                    <span>Direct Escrow Bank Lock with 100% Refund Guarantee</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* ======================================================== */
          /* STEP 4: ORDER CONFIRMED & ALLOTMENT CERTIFICATE */
          /* ======================================================== */
          completedOrder && (
            <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-black/10 p-8 sm:p-12 shadow-xl space-y-8 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg">
                <Check size={32} strokeWidth={3} />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1 rounded-full uppercase tracking-wider">
                  Payment Confirmed • Allotment Locked
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
                  Congratulations, Property Successfully Allotted!
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto">
                  Your token deposit for <strong>{completedOrder.item}</strong> has been secured in legal escrow. The provisional deed has been issued.
                </p>
              </div>

              {/* Order & Transaction Details Card */}
              <div className="bg-neutral-50 rounded-2xl p-6 border border-black/8 text-left text-xs space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-black/5">
                  <span className="text-gray-500">Booking Order ID:</span>
                  <span className="font-mono font-extrabold text-dark text-sm">#{completedOrder.orderId}</span>
                </div>
                {completedOrder.allotmentReceiptId && (
                  <div className="flex justify-between items-center pb-2 border-b border-black/5">
                    <span className="text-gray-500">RERA Allotment Certificate No:</span>
                    <span className="font-mono font-extrabold text-emerald-700 text-xs sm:text-sm">{completedOrder.allotmentReceiptId}</span>
                  </div>
                )}
                {completedOrder.paymentDetails?.razorpay_payment_id && (
                  <div className="flex justify-between items-center pb-2 border-b border-black/5">
                    <span className="text-gray-500">Razorpay Payment ID:</span>
                    <span className="font-mono font-bold text-dark">{completedOrder.paymentDetails.razorpay_payment_id}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pb-2 border-b border-black/5">
                  <span className="text-gray-500">Transaction Reference:</span>
                  <span className="font-mono font-bold text-dark">{completedOrder.txnReference}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-black/5">
                  <span className="text-gray-500">Allotted Buyer:</span>
                  <span className="font-bold text-dark">{completedOrder.customer} ({completedOrder.phone})</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-black/5">
                  <span className="text-gray-500">Token Amount Paid:</span>
                  <span className="font-extrabold text-emerald-700 text-sm">{completedOrder.tokenPaid}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Payment Channel:</span>
                  <span className="font-bold text-dark">{completedOrder.paymentMethod}</span>
                </div>
              </div>

              {/* Automated Email & Deed Notification Banner */}
              <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-left gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-emerald-950">
                      Confirmation Email & Allotment Deed Sent!
                    </p>
                    <p className="text-[11px] text-emerald-800">
                      Official PDF Allotment Deed & payment receipt dispatched to <strong>{completedOrder.email}</strong>
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-white text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-extrabold shadow-2xs">
                  <Check size={12} strokeWidth={2.5} />
                  <span>Nodemailer Dispatched</span>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 flex-wrap">
                <a
                  href={`http://localhost:5000/api/payments/receipt/${completedOrder.orderId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold py-3.5 px-6 rounded-full flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all hover:scale-[1.02]"
                >
                  <Download size={14} />
                  <span>Download Allotment Receipt (PDF)</span>
                </a>

                <button
                  type="button"
                  onClick={() => navigate(`/customer-details?tab=tracking&orderId=${completedOrder.orderId}`)}
                  className="w-full sm:w-auto bg-dark hover:bg-black text-white text-xs font-bold py-3.5 px-6 rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Key size={14} />
                  <span>Track Property Milestone Steps</span>
                  <ChevronRight size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto bg-neutral-100 hover:bg-neutral-200 text-dark text-xs font-bold py-3.5 px-5 rounded-full flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Printer size={14} />
                  <span>Print Receipt</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="w-full sm:w-auto text-xs font-bold text-gray-500 hover:text-dark py-3.5 px-4 cursor-pointer"
                >
                  Return to Home
                </button>
              </div>
            </div>
          )
        )}
          </>
        )}

      </div>

      {/* ======================================================== */}
      {/* RAZORPAY PAYMENT GATEWAY TEST MODAL */}
      {/* ======================================================== */}
      {isRazorpayModalOpen && currentRzpOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-black/10 overflow-hidden animate-fade-in text-dark">
            {/* Razorpay Branded Top Header */}
            <div className="bg-[#0c2340] text-white p-5 sm:p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                  <Zap size={22} className="text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base tracking-wide">Razorpay</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Test Gateway
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300">Modern Real Estate Client Escrow Trust</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase text-gray-400 font-bold block">Payable Token</span>
                <span className="text-base sm:text-lg font-extrabold text-emerald-400">
                  {payableFormatted}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-7 space-y-5 text-xs">
              {/* Order Meta details */}
              <div className="bg-neutral-50 rounded-2xl p-4 border border-black/5 space-y-2">
                <div className="flex justify-between items-center text-gray-500">
                  <span>Razorpay Order ID:</span>
                  <span className="font-mono font-bold text-dark">{currentRzpOrder.order_id}</span>
                </div>
                <div className="flex justify-between items-center text-gray-500">
                  <span>Merchant Key ID:</span>
                  <span className="font-mono font-bold text-dark">{currentRzpOrder.key_id}</span>
                </div>
                <div className="flex justify-between items-center text-gray-500">
                  <span>Purchaser:</span>
                  <span className="font-bold text-dark">{buyerInfo.fullName} ({buyerInfo.phone})</span>
                </div>
                <div className="flex justify-between items-center text-gray-500">
                  <span>Property Allotment:</span>
                  <span className="font-bold text-dark truncate max-w-[200px]">{primaryItem?.title || 'Luxury Estate'}</span>
                </div>
              </div>

              {/* Test Sandbox Badge / Explanation */}
              <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200/60 flex items-start gap-2.5 text-blue-900">
                <ShieldCheck size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-[11px]">
                  <p className="font-bold">Sandbox Test Environment Active</p>
                  <p className="text-blue-800 leading-relaxed">
                    Razorpay SDK has created order <code>{currentRzpOrder.order_id}</code>. Authorizing will verify the HMAC-SHA256 signature on the server, confirm your booking in MongoDB, and issue the RERA Allotment Certificate.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => handleCompleteRzpVerification()}
                  disabled={rzpSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all hover:scale-[1.01] text-xs sm:text-sm"
                >
                  <Lock size={15} />
                  <span>Authorize & Confirm Test Payment of {payableFormatted}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsRazorpayModalOpen(false)}
                  disabled={rzpSubmitting}
                  className="w-full bg-neutral-100 hover:bg-neutral-200 text-dark font-bold py-2.5 rounded-2xl cursor-pointer text-xs transition-colors"
                >
                  Cancel Transaction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3D SECURE / BANK OTP MODAL SIMULATION */}
      {/* ======================================================== */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl border border-black/10 text-center animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-dark text-white flex items-center justify-center mx-auto shadow-md">
              <ShieldCheck size={24} />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-dark">Bank 3D Secure Authorization</h3>
              <p className="text-xs text-gray-500 mt-1">
                Authorizing <strong>{payableFormatted}</strong> to Modern Real Estate Escrow Trust.
              </p>
            </div>

            {otpError && (
              <div className="p-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-1.5 justify-center">
                <AlertCircle size={14} />
                <span>{otpError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <p className="text-gray-500">
                A verification code has been dispatched to mobile ending in <strong className="text-dark">**4321</strong>.
              </p>

              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full text-center text-xl font-mono font-extrabold tracking-widest px-4 py-3 rounded-xl border border-black/20 focus:ring-2 focus:ring-dark"
              />

              <button
                type="button"
                onClick={() => setOtpCode('824910')}
                className="text-[11px] font-bold text-dark hover:underline cursor-pointer"
              >
                Click to Auto-fill Demo OTP (824910)
              </button>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleAuthorizePayment}
                className="flex-1 bg-dark hover:bg-black text-white text-xs font-bold py-3.5 rounded-full transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <Lock size={13} />
                <span>Confirm & Pay {payableFormatted}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsOtpModalOpen(false)}
                className="px-5 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-dark text-xs font-bold rounded-full cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PROCESSING GATEWAY FULLSCREEN SPINNER */}
      {/* ======================================================== */}
      {isProcessingPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl">
            <div className="w-14 h-14 border-4 border-dark border-t-transparent rounded-full animate-spin mx-auto" />

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-dark">
                Processing Secure Payment...
              </h3>
              <p className="text-xs text-gray-500">
                Please do not refresh or close this browser window.
              </p>
            </div>

            <div className="space-y-2 text-xs font-semibold text-left bg-neutral-50 p-4 rounded-2xl border border-black/5">
              <div className={`flex items-center gap-2 ${processingStage >= 1 ? 'text-emerald-700' : 'text-gray-400'}`}>
                <span>{processingStage >= 1 ? '✓' : '○'}</span>
                <span>Verifying bank authorization...</span>
              </div>
              <div className={`flex items-center gap-2 ${processingStage >= 2 ? 'text-emerald-700' : 'text-gray-400'}`}>
                <span>{processingStage >= 2 ? '✓' : '○'}</span>
                <span>Locking funds in escrow account...</span>
              </div>
              <div className={`flex items-center gap-2 ${processingStage >= 3 ? 'text-emerald-700' : 'text-gray-400'}`}>
                <span>{processingStage >= 3 ? '✓' : '○'}</span>
                <span>Generating provisional deed certificate...</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Checkout;
