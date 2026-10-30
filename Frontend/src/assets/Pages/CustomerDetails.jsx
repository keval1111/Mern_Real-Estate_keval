import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Package,
  Truck,
  MapPin,
  User,
  Calendar,
  CheckCircle,
  Clock,
  ShieldCheck,
  Phone,
  Mail,
  Edit3,
  Plus,
  Trash2,
  ArrowRight,
  ChevronRight,
  Copy,
  ExternalLink,
  FileText,
  Building2,
  Sparkles,
  X,
  CreditCard,
  ShoppingBag,
  ArrowLeft,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Tag,
  Key,
  Printer,
  Compass,
  Eye,
  Check,
  Layers,
  Award,
  ChevronDown
} from 'lucide-react';
import { useCustomerAuth } from '../Context/CustomerAuthContext';
import { useWishlist } from '../Context/WishlistContext';
import { products } from '../Data/products';

// Default initial mock orders if none exist for customer yet
// Seed functions return empty arrays - only actual user-booked properties will be displayed
const getSeedOrders = () => [];
const getSeedSellProperties = () => [];
const getSeedInquiries = () => [];

const CustomerDetails = ({ initialTab = 'orders' }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { customer, isLoggedIn, getInitial, updateProfile, logout, login } = useCustomerAuth();
  const { wishlistCount } = useWishlist();

  // Active Tab state (orders, tracking, sell, inquiries, addresses, profile)
  const tabParam = searchParams.get('tab') || initialTab;
  const [activeTab, setActiveTab] = useState(tabParam || 'orders');

  // Tracking Mode: 'buy' (Booked Properties) or 'sell' (Sold / Listed Properties)
  const [trackingMode, setTrackingMode] = useState('buy');

  // Sync tab with URL
  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Orders State (Bookings)
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState(null);
  const [orderFilter, setOrderFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Sell Properties State
  const [sellProperties, setSellProperties] = useState(() => {
    try {
      const email = customer?.email || 'keval@example.com';
      const saved = localStorage.getItem(`customer_sell_properties_${email}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((sp) => sp.id !== 'SELL-492101' && sp.id !== 'SELL-331089');
        }
      }
    } catch {}
    return [];
  });
  const [selectedSellPropertyForTracking, setSelectedSellPropertyForTracking] = useState(null);
  const [sellFilter, setSellFilter] = useState('All');

  // Inquiries State
  const [inquiries, setInquiries] = useState(() => {
    try {
      const email = customer?.email || 'keval@example.com';
      const saved = localStorage.getItem(`customer_inquiries_${email}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((inq) => inq.id !== 'INQ-9012' && inq.id !== 'INQ-8821');
        }
      }
    } catch {}
    return [];
  });

  // Modals State
  const [viewingOrder, setViewingOrder] = useState(null);
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Address State
  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem(`customer_addresses_${customer?.email || 'guest'}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'addr-1',
        isDefault: true,
        type: 'Primary Residence',
        fullName: customer?.name || customer?.firstName || 'Keval Patel',
        phone: customer?.phone || '+91 98765 43210',
        street: '742 Evergreen Terrace, Palm Boulevard, 4th Floor',
        city: 'Springfield',
        state: 'Oregon',
        pincode: '97477',
        country: 'United States'
      },
      {
        id: 'addr-2',
        isDefault: false,
        type: 'Commercial / Office',
        fullName: customer?.name || customer?.firstName || 'Keval Patel',
        phone: customer?.phone || '+91 98765 43210',
        street: '102 Cyber City, Tech Hub Avenue, Phase II',
        city: 'Seattle',
        state: 'Washington',
        pincode: '98101',
        country: 'United States'
      }
    ];
  });

  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    type: 'Primary Residence',
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'United States',
    isDefault: false
  });

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    name: customer?.name || customer?.firstName || '',
    email: customer?.email || '',
    phone: customer?.phone || '+91 98765 43210'
  });

  // Booking Form Modal State
  const [bookForm, setBookForm] = useState({
    selectedPropertyId: products[0]?.id || 1,
    selectedSize: '1200 sq fit',
    tokenAmount: 'Rs. 1,00,000.00',
    tokenNumber: 100000,
    fullName: customer?.name || customer?.firstName || 'Keval Patel',
    phone: customer?.phone || '+91 98765 43210',
    email: customer?.email || 'keval@example.com',
    paymentMethod: 'UPI / NetBanking Token Transfer',
    addressIndex: 0,
    includeLegalAudit: true
  });

  // Sell Form Modal State
  const [sellForm, setSellForm] = useState({
    title: '',
    category: 'Royal House',
    price: '',
    location: '',
    city: '',
    state: '',
    pincode: '',
    beds: 4,
    baths: 4,
    sqft: '3,200 sq ft',
    yearBuilt: '2024',
    description: '',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    amenities: ['Private Pool', '24/7 Security', 'Smart Home', 'Landscaped Garden'],
    sellerName: customer?.name || customer?.firstName || 'Keval Patel',
    sellerPhone: customer?.phone || '+91 98765 43210',
  });

  // Inquiry Form Modal State
  const [inquiryForm, setInquiryForm] = useState({
    propertyName: products[0]?.title || 'The White House J-54',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    timeSlot: 'Morning (10:00 AM - 12:00 PM)',
    notes: 'Would like a complete property walkthrough and legal title verification review.'
  });

  // Toast / Copy notification
  const [copiedId, setCopiedId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Sync addresses to localStorage
  useEffect(() => {
    if (customer?.email) {
      localStorage.setItem(`customer_addresses_${customer.email}`, JSON.stringify(addresses));
    }
  }, [addresses, customer]);

  // Sync sell properties to localStorage
  useEffect(() => {
    const email = customer?.email || 'keval@example.com';
    localStorage.setItem(`customer_sell_properties_${email}`, JSON.stringify(sellProperties));
  }, [sellProperties, customer]);

  // Sync inquiries to localStorage
  useEffect(() => {
    const email = customer?.email || 'keval@example.com';
    localStorage.setItem(`customer_inquiries_${email}`, JSON.stringify(inquiries));
  }, [inquiries, customer]);

  // Load customer orders from Backend or LocalStorage fallback (only real booked properties)
  useEffect(() => {
    let isMounted = true;
    const fetchOrders = async () => {
      setLoadingOrders(true);
      const email = customer?.email || 'keval@example.com';
      const storageKey = `customer_orders_${email}`;

      let localOrders = [];
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            // Filter out any legacy dummy mock orders
            localOrders = parsed.filter((o) => o.id !== 'ORD-894210' && o.id !== 'ORD-762118');
          }
        }
      } catch {}

      // Keep storage clean without dummy seed data
      localStorage.setItem(storageKey, JSON.stringify(localOrders));

      // Try fetching from backend
      try {
        const res = await fetch(`http://localhost:5000/api/orders?email=${encodeURIComponent(email)}`);
        const json = await res.json();
        if (res.ok && json.success && Array.isArray(json.data) && json.data.length > 0) {
          const validOrders = json.data.filter((bo) => bo.orderId !== 'ORD-894210' && bo.orderId !== 'ORD-762118');
          const backendMapped = validOrders.map((bo) => ({
            id: bo.orderId || bo._id,
            orderId: bo.orderId || bo._id,
            item: bo.item,
            total: bo.total,
            tokenPaid: bo.tokenPaid || 'Rs. 1,00,000.00',
            customer: bo.customer,
            email: bo.email,
            phone: bo.phone || customer?.phone || '+91 98765 43210',
            date: bo.date || 'Recent',
            status: bo.status || 'Processing',
            paymentMethod: 'Prepaid Token Advance (Verified)',
            propertyImage: bo.propertyImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
            address: {
              fullName: bo.customer,
              phone: bo.phone || '+91 98765 43210',
              street: bo.address || '742 Evergreen Terrace, Springfield',
              city: bo.city || 'Springfield',
              state: bo.state || 'Oregon',
              pincode: bo.pincode || '97477',
              country: bo.country || 'United States',
              type: 'Delivery & Title Address'
            },
            tracking: {
              trackingNumber: `TRK-${(bo.orderId || '894210').replace(/[^0-9]/g, '')}-ESTATE`,
              currentStep: bo.trackingStep || 2,
              estimatedDate: 'Within 7 Business Days',
              milestoneNotes: bo.milestoneNotes || '',
              agent: bo.assignedAgent || {
                name: 'Vikram Malhotra',
                role: 'Senior Property Advisor & Legal Officer',
                phone: '+91 98200 11223',
                email: 'vikram.advisor@modernrealestate.com',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
              },
              steps: bo.trackingSteps || [
                { title: 'Booking Request Received & Allotment Locked', desc: 'Order details and initial token payment recorded', date: 'Completed', completed: true },
                { title: 'KYC & Title Deed Verification', desc: 'Title deed, KYC and buyer background check', date: 'In progress', completed: true },
                { title: 'Site Inspection & Legal Clearance', desc: 'Physical appraisal & municipal approvals', date: 'Scheduled', completed: false },
                { title: 'Ownership Transfer & Key Handover', desc: 'Possession handover & key collection', date: 'Pending', completed: false }
              ]
            }
          }));

          if (isMounted) {
            const merged = [...backendMapped];
            localOrders.forEach((lo) => {
              if (!merged.find((m) => m.id === lo.id)) {
                merged.push(lo);
              }
            });
            setOrders(merged);
            setSelectedOrderForTracking(merged[0] || null);
            setSelectedSellPropertyForTracking(sellProperties[0] || null);
          }
          return;
        }
      } catch (err) {
        console.warn('Backend orders fetch failed, using local orders:', err);
      }

      if (isMounted) {
        setOrders(localOrders);
        setSelectedOrderForTracking(localOrders[0] || null);
        setSelectedSellPropertyForTracking(sellProperties[0] || null);
        setLoadingOrders(false);
      }
    };

    fetchOrders().finally(() => {
      if (isMounted) setLoadingOrders(false);
    });

    return () => {
      isMounted = false;
    };
  }, [customer]);

  // Sync customer sell submissions from backend MongoDB
  useEffect(() => {
    let isMounted = true;
    const fetchMySubmissions = async () => {
      const email = customer?.email || 'keval@example.com';
      try {
        const res = await fetch(`http://localhost:5000/api/properties/my-submissions?email=${encodeURIComponent(email)}`);
        const json = await res.json();
        if (isMounted && res.ok && json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped = json.data.map((sp) => ({
            id: sp._id || sp.id,
            _id: sp._id,
            title: sp.title,
            category: sp.category,
            price: sp.price,
            priceNumber: sp.priceNumber,
            location: sp.location,
            city: sp.city,
            beds: sp.beds,
            baths: sp.baths,
            sqft: sp.sqft,
            yearBuilt: sp.yearBuilt,
            description: sp.description,
            image: sp.image,
            status: sp.status === 'Active' ? 'Active' : sp.status,
            backendStatus: sp.status,
            currentStep: sp.status === 'Active' ? 3 : (sp.currentStep || 1),
            submittedDate: new Date(sp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            seller: sp.sellerName,
            email: sp.sellerEmail,
            phone: sp.sellerPhone,
            adminValuation: sp.adminValuation,
            verificationNotes: sp.verificationNotes,
            inquiriesCount: sp.inquiriesCount || 0,
            offersCount: sp.offersCount || 0,
            agent: {
              name: 'Rajesh Singhania',
              role: 'Chief Sales Director & Luxury Escrow Officer',
              phone: '+91 98330 99887',
              email: 'rajesh.singhania@modernrealestate.com',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
            },
            steps: sp.steps && sp.steps.length > 0 ? sp.steps : [
              { title: 'Listing Submission & Documents Audit', desc: 'Property specification, seller proof and deed documentation uploaded.', date: 'Today • Verification Pending', completed: true },
              { title: 'Field Valuation & Physical Inspection', desc: 'Certified valuer site visit and market valuation certificate generation.', date: 'Scheduled within 48 hrs', completed: sp.status === 'Active' },
              { title: 'Live On Marketplace & Buyer Viewings', desc: 'Property published to high-net-worth buyers & investors network.', date: sp.status === 'Active' ? 'Active Live' : 'Pending Inspection', completed: sp.status === 'Active' },
              { title: 'Buyer Offer & Escrow Token', desc: 'Offer negotiation & booking token deposit held in legal escrow.', date: 'Pending', completed: false },
              { title: 'Deed Registration & Seller Payout', desc: 'Sub-registrar signing & 100% escrow funds released to seller bank account.', date: 'Pending', completed: false }
            ]
          }));

          setSellProperties(mapped);
          setSelectedSellPropertyForTracking((prev) => (prev ? (mapped.find((m) => m.id === prev.id) || mapped[0]) : mapped[0]));
        }
      } catch (err) {
        console.warn('Failed to fetch my sell submissions:', err);
      }
    };

    fetchMySubmissions();
    return () => {
      isMounted = false;
    };
  }, [customer]);

  // Check URL params for specific orderId
  useEffect(() => {
    const orderIdParam = searchParams.get('orderId');
    if (orderIdParam && orders.length > 0) {
      const found = orders.find((o) => o.id === orderIdParam || o.orderId === orderIdParam);
      if (found) {
        setSelectedOrderForTracking(found);
        setTrackingMode('buy');
      }
    }
  }, [searchParams, orders]);

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    const matchesFilter =
      orderFilter === 'All' ||
      (orderFilter === 'Processing' && o.status === 'Processing') ||
      (orderFilter === 'Delivered' && (o.status === 'Delivered' || o.status === 'Completed')) ||
      (orderFilter === 'In Transit' && o.status === 'In Transit');

    const matchesSearch =
      (o.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.item || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.address?.city || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Filtered Sell Properties
  const filteredSellProperties = sellProperties.filter((sp) => {
    if (sellFilter === 'All') return true;
    return sp.status === sellFilter;
  });

  // ==========================================
  // BOOK PROPERTY PROCESS
  // ==========================================
  const handleOpenBookModal = () => {
    setBookForm({
      selectedPropertyId: products[0]?.id || 1,
      selectedSize: '1200 sq fit',
      tokenAmount: 'Rs. 1,00,000.00',
      tokenNumber: 100000,
      fullName: customer?.name || customer?.firstName || 'Keval Patel',
      phone: customer?.phone || '+91 98765 43210',
      email: customer?.email || 'keval@example.com',
      paymentMethod: 'UPI / NetBanking Token Transfer',
      addressIndex: 0,
      includeLegalAudit: true
    });
    setIsBookModalOpen(true);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    const selectedProp = products.find((p) => p.id === Number(bookForm.selectedPropertyId)) || products[0];
    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const userAddr = addresses[bookForm.addressIndex] || addresses[0] || {
      fullName: bookForm.fullName,
      phone: bookForm.phone,
      street: '742 Evergreen Terrace, Springfield',
      city: 'Springfield',
      state: 'Oregon',
      pincode: '97477',
      country: 'United States',
      type: 'Primary Residence'
    };

    const newOrder = {
      id: orderId,
      orderId,
      item: selectedProp.title,
      category: selectedProp.category || 'Properties',
      propertyId: `prop-${selectedProp.id}`,
      total: selectedProp.price,
      totalNumber: selectedProp.priceNumber,
      tokenPaid: bookForm.tokenAmount,
      tokenPaidNumber: bookForm.tokenNumber,
      customer: bookForm.fullName,
      email: bookForm.email,
      phone: bookForm.phone,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Processing',
      paymentMethod: bookForm.paymentMethod,
      propertyImage: selectedProp.image,
      address: userAddr,
      tracking: {
        trackingNumber: `TRK-${orderId.replace(/[^0-9]/g, '')}-ESTATE`,
        currentStep: 1, // Step 1 completed
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
            desc: `Booking token of ${bookForm.tokenAmount} confirmed. Provisional allotment certificate issued.`,
            date: 'Today • Instant Confirmed',
            completed: true
          },
          {
            title: 'KYC & Title Deed Verification',
            desc: 'Legal department verifying 7/12 land extract, RERA sanctions and buyer documents.',
            date: 'In Progress • Due within 48 hrs',
            completed: false
          },
          {
            title: 'Site Visit & Legal Appraisal',
            desc: 'Physical boundary appraisal, architect structural inspection & handover prep.',
            date: 'Estimated 3 Days',
            completed: false
          },
          {
            title: 'Ownership Transfer & Key Handover',
            desc: 'Biometric deed registration at Sub-Registrar office & possession key handover.',
            date: 'Estimated 7 Days',
            completed: false
          }
        ]
      }
    };

    // Save to local storage
    const storageKey = `customer_orders_${bookForm.email}`;
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    setSelectedOrderForTracking(newOrder);
    localStorage.setItem(storageKey, JSON.stringify(updatedOrders));

    // Also sync to backend API
    try {
      await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: bookForm.fullName,
          email: bookForm.email,
          phone: bookForm.phone,
          item: selectedProp.title,
          total: selectedProp.price,
          address: userAddr.street,
          city: userAddr.city,
          state: userAddr.state,
          pincode: userAddr.pincode,
          country: userAddr.country,
          propertyImage: selectedProp.image
        })
      });
    } catch (err) {
      console.warn('Backend order sync optional:', err);
    }

    setIsBookModalOpen(false);
    showToast(`Property "${selectedProp.title}" booked successfully! Order #${orderId} created.`);
    setTrackingMode('buy');
    handleTabChange('tracking');
  };

  // ==========================================
  // SELL PROPERTY PROCESS
  // ==========================================
  const handleOpenSellModal = () => {
    setSellForm({
      title: '',
      category: 'Royal House',
      price: '',
      location: '',
      city: '',
      state: '',
      pincode: '',
      beds: 4,
      baths: 4,
      sqft: '3,200 sq ft',
      yearBuilt: '2024',
      description: '',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      amenities: ['Private Pool', '24/7 Security', 'Smart Home', 'Landscaped Garden'],
      sellerName: customer?.name || customer?.firstName || 'Keval Patel',
      sellerPhone: customer?.phone || '+91 98765 43210',
    });
    setIsSellModalOpen(true);
  };

  const handleConfirmSellListing = async (e) => {
    e.preventDefault();
    if (!sellForm.title || !sellForm.price || !sellForm.location) {
      alert('Please fill in title, price, and location.');
      return;
    }

    const sellId = `SELL-${Math.floor(100000 + Math.random() * 900000)}`;
    const formattedPrice = sellForm.price.startsWith('Rs') || sellForm.price.startsWith('$') || sellForm.price.startsWith('₹')
      ? sellForm.price
      : `Rs. ${sellForm.price}`;

    const newSellProperty = {
      id: sellId,
      title: sellForm.title,
      category: sellForm.category,
      price: formattedPrice,
      priceNumber: parseFloat(String(sellForm.price).replace(/[^0-9.]/g, '')) || 0,
      location: sellForm.location,
      city: sellForm.city || 'Mumbai',
      state: sellForm.state || 'Maharashtra',
      pincode: sellForm.pincode || '400001',
      beds: Number(sellForm.beds) || 3,
      baths: Number(sellForm.baths) || 3,
      sqft: sellForm.sqft || '2,500 sq ft',
      yearBuilt: sellForm.yearBuilt || '2024',
      description: sellForm.description || 'Luxurious residential property with prime road connectivity and clear title deed.',
      image: sellForm.image,
      status: 'Under Review',
      currentStep: 1,
      submittedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      seller: sellForm.sellerName,
      email: customer?.email || 'keval@example.com',
      phone: sellForm.sellerPhone,
      inquiriesCount: 0,
      offersCount: 0,
      agent: {
        name: 'Rajesh Singhania',
        role: 'Chief Sales Director & Luxury Escrow Officer',
        phone: '+91 98330 99887',
        email: 'rajesh.singhania@modernrealestate.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
      },
      steps: [
        {
          title: 'Listing Submission & Documents Audit',
          desc: 'Property specification, seller proof and deed documentation uploaded.',
          date: 'Today • Verification Pending',
          completed: true
        },
        {
          title: 'Field Valuation & Physical Inspection',
          desc: 'Certified valuer site visit and market valuation certificate generation.',
          date: 'Scheduled within 48 hrs',
          completed: false
        },
        {
          title: 'Live On Marketplace & Buyer Viewings',
          desc: 'Property published to high-net-worth buyers & investors network.',
          date: 'Pending Inspection',
          completed: false
        },
        {
          title: 'Buyer Offer & Escrow Token',
          desc: 'Offer negotiation & booking token deposit held in legal escrow.',
          date: 'Pending',
          completed: false
        },
        {
          title: 'Deed Registration & Seller Payout',
          desc: 'Sub-registrar signing & 100% escrow funds released to seller bank account.',
          date: 'Pending',
          completed: false
        }
      ]
    };

    setIsSellModalOpen(false);

    // Call real backend sell-request endpoint
    try {
      const token = localStorage.getItem('customer_token');
      const res = await fetch('http://localhost:5000/api/properties/sell-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: sellForm.title,
          category: sellForm.category,
          price: formattedPrice,
          location: sellForm.location,
          city: sellForm.city || 'Mumbai',
          beds: Number(sellForm.beds) || 3,
          baths: Number(sellForm.baths) || 2,
          sqft: sellForm.sqft || '2,500 sq ft',
          yearBuilt: sellForm.yearBuilt || '2024',
          image: sellForm.image,
          description: sellForm.description,
          sellerName: sellForm.sellerName || customer?.name || 'Verified Seller',
          sellerEmail: customer?.email || 'keval@example.com',
          sellerPhone: sellForm.sellerPhone || customer?.phone || '+91 98765 43210',
          sellerId: customer?._id
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        const serverProp = json.data;
        const mappedProp = {
          ...newSellProperty,
          id: serverProp._id || newSellProperty.id,
          _id: serverProp._id,
          status: serverProp.status,
          currentStep: serverProp.currentStep || 1,
          steps: serverProp.steps || newSellProperty.steps
        };

        const updated = [mappedProp, ...sellProperties.filter(p => p.id !== mappedProp.id)];
        setSellProperties(updated);
        setSelectedSellPropertyForTracking(mappedProp);
        const email = customer?.email || 'keval@example.com';
        localStorage.setItem(`customer_sell_properties_${email}`, JSON.stringify(updated));
        showToast(`Property "${sellForm.title}" submitted for sale! Status: Pending Verification by Admin.`);
      } else {
        const updated = [newSellProperty, ...sellProperties];
        setSellProperties(updated);
        setSelectedSellPropertyForTracking(newSellProperty);
        showToast(`Property "${sellForm.title}" submitted for sale! Status: Under Review.`);
      }
    } catch (err) {
      console.warn('Backend property sync optional:', err);
      const updated = [newSellProperty, ...sellProperties];
      setSellProperties(updated);
      setSelectedSellPropertyForTracking(newSellProperty);
      showToast(`Property "${sellForm.title}" submitted for sale! Status: Under Review.`);
    }

    setTrackingMode('sell');
    handleTabChange('tracking');
  };

  // ==========================================
  // INQUIRY / TOUR BOOKING PROCESS
  // ==========================================
  const handleOpenInquiryModal = (propTitle) => {
    setInquiryForm({
      propertyName: propTitle || products[0]?.title || 'The White House J-54',
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      timeSlot: 'Morning (10:00 AM - 12:00 PM)',
      notes: 'Would like a complete property walkthrough and legal title verification review.'
    });
    setIsInquiryModalOpen(true);
  };

  const handleConfirmInquiry = async (e) => {
    e.preventDefault();
    const inqId = `INQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInq = {
      id: inqId,
      property: inquiryForm.propertyName,
      date: inquiryForm.date,
      timeSlot: inquiryForm.timeSlot,
      client: customer?.name || customer?.firstName || 'Keval Patel',
      email: customer?.email || 'keval@example.com',
      phone: customer?.phone || '+91 98765 43210',
      status: 'Tour Scheduled',
      message: inquiryForm.notes,
      advisor: 'Vikram Malhotra (+91 98200 11223)'
    };

    const updated = [newInq, ...inquiries];
    setInquiries(updated);

    // Sync to backend inquiries
    try {
      await fetch('http://localhost:5000/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: newInq.client,
          email: newInq.email,
          phone: newInq.phone,
          property: newInq.property,
          message: `${newInq.timeSlot} on ${newInq.date}: ${newInq.message}`
        })
      });
    } catch (err) {
      console.warn('Backend inquiry sync optional:', err);
    }

    setIsInquiryModalOpen(false);
    showToast(`Site visit tour booked for "${inquiryForm.propertyName}" on ${inquiryForm.date}!`);
    handleTabChange('inquiries');
  };

  // ==========================================
  // STEP SIMULATION (ADVANCE STEP)
  // ==========================================
  const handleAdvanceBuyStep = () => {
    if (!selectedOrderForTracking) return;
    const current = selectedOrderForTracking.tracking?.currentStep || 1;
    const max = selectedOrderForTracking.tracking?.steps?.length || 4;
    const nextStep = current < max ? current + 1 : 1;

    const updatedSteps = (selectedOrderForTracking.tracking?.steps || []).map((s, idx) => ({
      ...s,
      completed: idx < nextStep,
      date: idx < nextStep ? (s.completed ? s.date : 'Just Now • Completed') : s.date
    }));

    const nextStatus = nextStep >= max ? 'Delivered' : 'Processing';

    const updatedOrder = {
      ...selectedOrderForTracking,
      status: nextStatus,
      tracking: {
        ...selectedOrderForTracking.tracking,
        currentStep: nextStep,
        steps: updatedSteps
      }
    };

    setSelectedOrderForTracking(updatedOrder);
    setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
    showToast(`Simulated step progression: Order now on Stage ${nextStep} of ${max}`);
  };

  const handleAdvanceSellStep = () => {
    if (!selectedSellPropertyForTracking) return;
    const current = selectedSellPropertyForTracking.currentStep || 1;
    const max = selectedSellPropertyForTracking.steps?.length || 5;
    const nextStep = current < max ? current + 1 : 1;

    const statusMap = {
      1: 'Under Review',
      2: 'Valuation & Verification',
      3: 'Active on Market',
      4: 'Buyer Offer Received',
      5: 'Sold & Payout Completed'
    };

    const updatedSteps = (selectedSellPropertyForTracking.steps || []).map((s, idx) => ({
      ...s,
      completed: idx < nextStep,
      date: idx < nextStep ? (s.completed ? s.date : 'Just Now • Verified') : s.date
    }));

    const updatedSell = {
      ...selectedSellPropertyForTracking,
      status: statusMap[nextStep] || 'Active on Market',
      currentStep: nextStep,
      steps: updatedSteps
    };

    setSelectedSellPropertyForTracking(updatedSell);
    setSellProperties((prev) => prev.map((sp) => (sp.id === updatedSell.id ? updatedSell : sp)));
    showToast(`Simulated seller step: Property now on Stage ${nextStep} (${statusMap[nextStep]})`);
  };

  // ==========================================
  // ADDRESS ACTIONS
  // ==========================================
  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      type: 'Primary Residence',
      fullName: customer?.name || customer?.firstName || '',
      phone: customer?.phone || '+91 98765 43210',
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'United States',
      isDefault: addresses.length === 0
    });
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddress(addr);
    setAddressForm({ ...addr });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!addressForm.street || !addressForm.city || !addressForm.pincode) {
      alert('Please fill out street, city, and pincode.');
      return;
    }

    if (editingAddress) {
      setAddresses((prev) =>
        prev.map((a) => {
          if (a.id === editingAddress.id) {
            return { ...addressForm, id: a.id };
          }
          if (addressForm.isDefault) {
            return { ...a, isDefault: false };
          }
          return a;
        })
      );
    } else {
      const newAddr = {
        ...addressForm,
        id: `addr-${Date.now()}`
      };
      setAddresses((prev) => {
        if (newAddr.isDefault) {
          return [newAddr, ...prev.map((a) => ({ ...a, isDefault: false }))];
        }
        return [newAddr, ...prev];
      });
    }
    setIsAddressModalOpen(false);
    showToast('Address saved successfully!');
  };

  const handleDeleteAddress = (id) => {
    if (confirm('Are you sure you want to remove this address?')) {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      showToast('Address removed.');
    }
  };

  const handleSetDefaultAddress = (id) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id
      }))
    );
    showToast('Default address updated.');
  };

  // Profile Save
  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({
      name: profileForm.name,
      phone: profileForm.phone
    });
    setIsProfileModalOpen(false);
    showToast('Profile updated successfully!');
  };

  // Quick Demo Login helper if customer is logged out
  const handleQuickDemoLogin = async () => {
    const res = await login('keval@example.com', 'customer123');
    if (res.success) {
      showToast('Logged in as Keval Patel (Demo Customer)');
    }
  };

  return (
    <div className="w-full min-h-screen bg-neutral-50/70 font-sans text-dark py-8 px-4 sm:px-6 md:px-8 lg:px-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-dark text-white px-6 py-3 rounded-full font-bold text-xs shadow-2xl flex items-center gap-2 border border-white/20 animate-fade-in">
          <Sparkles size={14} className="text-[#faede3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="w-full max-w-8xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb / Top Bar */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-dark/80 hover:text-dark transition-colors cursor-pointer group"
          >
            <span className="w-7 h-7 rounded-full bg-white border border-black/10 flex items-center justify-center transition-all group-hover:bg-dark group-hover:text-white shadow-2xs">
              <ArrowLeft size={13} strokeWidth={2.2} />
            </span>
            <span>Back to Property Showcase</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenBookModal}
              className="bg-[#faede3] hover:bg-[#f3dfce] text-dark border border-black/10 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <Key size={13} />
              <span>+ Book Property</span>
            </button>

            <button
              type="button"
              onClick={handleOpenSellModal}
              className="bg-dark hover:bg-black text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <TrendingUp size={13} />
              <span>+ Sell Property</span>
            </button>
          </div>
        </div>

        {/* --- Customer Profile Header Card (Luxury Aesthetic) --- */}
        <div className="relative rounded-3xl bg-dark text-white p-6 sm:p-8 lg:p-10 shadow-xl overflow-hidden">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
          <div className="absolute right-1/3 -bottom-20 w-64 h-64 rounded-full bg-[#faede3]/10 blur-3xl pointer-events-none" />

          {/* If Logged In vs Logged Out banner */}
          {isLoggedIn ? (
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5 sm:gap-6">
                {/* Dynamic Name Initial Badge */}
                <div className="relative">
                  <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-[#faede3] text-dark font-extrabold text-2xl sm:text-3xl flex items-center justify-center shadow-lg border-2 border-white select-none shrink-0 uppercase tracking-tight">
                    {getInitial() || 'C'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-dark flex items-center justify-center text-white" title="Verified Customer">
                    <CheckCircle size={14} strokeWidth={3} />
                  </div>
                </div>

                {/* Customer Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      {customer?.name || customer?.firstName || 'Valued Customer'}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/15 text-white border border-white/20">
                      Verified Buyer & Seller
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs sm:text-sm text-white/70 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <Mail size={13} className="text-white/50" />
                      {customer?.email || 'keval@example.com'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone size={13} className="text-white/50" />
                      {customer?.phone || '+91 98765 43210'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-emerald-400" />
                      KYC Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setProfileForm({
                      name: customer?.name || customer?.firstName || '',
                      email: customer?.email || '',
                      phone: customer?.phone || '+91 98765 43210'
                    });
                    setIsProfileModalOpen(true);
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full px-4 py-2 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer backdrop-blur-xs shadow-xs"
                >
                  <Edit3 size={14} />
                  <span>Edit Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    showToast('Logged out of customer portal');
                  }}
                  className="bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer shadow-xs"
                >
                  Log Out
                </button>
              </div>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
                  <Sparkles size={13} className="text-[#faede3]" />
                  <span>Guest Browsing Session</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Welcome to Modern Real Estate Customer Portal
                </h1>
                <p className="text-xs sm:text-sm text-white/70 max-w-xl">
                  Sign in to track your booked properties, list new properties for sale, view verification milestones, and manage legal contracts.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  className="bg-[#faede3] hover:bg-white text-dark font-extrabold text-xs px-5 py-2.5 rounded-full transition-all cursor-pointer shadow-md flex items-center gap-2"
                >
                  <Sparkles size={14} />
                  <span>1-Click Demo Login (Keval)</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="bg-white/15 hover:bg-white/25 text-white font-bold text-xs px-5 py-2.5 rounded-full border border-white/20 transition-all cursor-pointer"
                >
                  Customer Login
                </button>
              </div>
            </div>
          )}

          {/* Quick Stat Tiles */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/10">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3.5 sm:p-4 border border-white/10">
              <p className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">Booked Properties</p>
              <p className="text-xl sm:text-2xl font-extrabold text-white mt-1">{orders.length}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3.5 sm:p-4 border border-white/10">
              <p className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">Sold & Listed Properties</p>
              <p className="text-xl sm:text-2xl font-extrabold text-[#faede3] mt-1">{sellProperties.length}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3.5 sm:p-4 border border-white/10">
              <p className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">Site Visits & Inquiries</p>
              <p className="text-xl sm:text-2xl font-extrabold text-white mt-1">{inquiries.length}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3.5 sm:p-4 border border-white/10">
              <p className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">Saved Addresses</p>
              <p className="text-xl sm:text-2xl font-extrabold text-white mt-1">{addresses.length}</p>
            </div>
          </div>
        </div>

        {/* --- Tab Navigation Bar (All Processes) --- */}
        <div className="flex items-center gap-2 border-b border-black/10 overflow-x-auto pb-px">
          {/* TAB 1: PLACED ORDERS / BOOKINGS */}
          <button
            type="button"
            onClick={() => handleTabChange('orders')}
            className={`px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 rounded-t-2xl transition-all cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === 'orders'
                ? 'bg-white text-dark border-dark shadow-xs'
                : 'text-dark/60 border-transparent hover:text-dark hover:bg-black/5'
            }`}
          >
            <Package size={16} />
            <span>Booked Properties</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
              activeTab === 'orders' ? 'bg-dark text-white' : 'bg-black/10 text-dark'
            }`}>
              {orders.length}
            </span>
          </button>

          {/* TAB 2: LIVE STATUS TRACKING */}
          <button
            type="button"
            onClick={() => handleTabChange('tracking')}
            className={`px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 rounded-t-2xl transition-all cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === 'tracking'
                ? 'bg-white text-dark border-dark shadow-xs'
                : 'text-dark/60 border-transparent hover:text-dark hover:bg-black/5'
            }`}
          >
            <Truck size={16} />
            <span>Status Tracking & Steps</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          {/* TAB 3: SELL MY PROPERTY */}
          <button
            type="button"
            onClick={() => handleTabChange('sell')}
            className={`px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 rounded-t-2xl transition-all cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === 'sell'
                ? 'bg-white text-dark border-dark shadow-xs'
                : 'text-dark/60 border-transparent hover:text-dark hover:bg-black/5'
            }`}
          >
            <TrendingUp size={16} />
            <span>Sell My Property</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
              activeTab === 'sell' ? 'bg-dark text-white' : 'bg-black/10 text-dark'
            }`}>
              {sellProperties.length}
            </span>
          </button>

          {/* TAB 4: SITE VISITS & INQUIRIES */}
          <button
            type="button"
            onClick={() => handleTabChange('inquiries')}
            className={`px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 rounded-t-2xl transition-all cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === 'inquiries'
                ? 'bg-white text-dark border-dark shadow-xs'
                : 'text-dark/60 border-transparent hover:text-dark hover:bg-black/5'
            }`}
          >
            <Compass size={16} />
            <span>Site Visits & Inquiries</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-black/10 text-dark">
              {inquiries.length}
            </span>
          </button>

          {/* TAB 5: SAVED ADDRESSES */}
          <button
            type="button"
            onClick={() => handleTabChange('addresses')}
            className={`px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 rounded-t-2xl transition-all cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === 'addresses'
                ? 'bg-white text-dark border-dark shadow-xs'
                : 'text-dark/60 border-transparent hover:text-dark hover:bg-black/5'
            }`}
          >
            <MapPin size={16} />
            <span>Saved Addresses</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-black/10 text-dark">
              {addresses.length}
            </span>
          </button>

          {/* TAB 6: PROFILE DETAILS */}
          <button
            type="button"
            onClick={() => handleTabChange('profile')}
            className={`px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 rounded-t-2xl transition-all cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === 'profile'
                ? 'bg-white text-dark border-dark shadow-xs'
                : 'text-dark/60 border-transparent hover:text-dark hover:bg-black/5'
            }`}
          >
            <User size={16} />
            <span>Account Details</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: PLACED ORDERS & BOOKED PROPERTIES */}
        {/* ======================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-black/8 shadow-2xs">
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Order ID, Property or City..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-black/10 focus:outline-none focus:ring-1 focus:ring-dark"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                {/* Status Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {['All', 'Processing', 'Delivered'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setOrderFilter(status)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                        orderFilter === status
                          ? 'bg-dark text-white shadow-2xs'
                          : 'bg-black/5 text-dark/70 hover:bg-black/10'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleOpenBookModal}
                  className="bg-dark hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                >
                  <Plus size={14} />
                  <span>Book Property</span>
                </button>
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-black/20 p-8">
                <Package size={36} className="mx-auto text-gray-400 mb-3" />
                <h3 className="text-base font-bold text-dark">No booked properties found</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Explore our luxury property catalogue and lock in your first property allotment today.
                </p>
                <button
                  type="button"
                  onClick={handleOpenBookModal}
                  className="mt-4 bg-dark text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-black transition-all cursor-pointer"
                >
                  Book A Property Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl border border-black/8 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/8">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs font-extrabold text-dark tracking-wide font-mono bg-black/5 px-2.5 py-1 rounded-lg">
                          #{order.orderId || order.id}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(order.orderId || order.id)}
                          className="text-[11px] font-semibold text-dark/50 hover:text-dark flex items-center gap-1 cursor-pointer"
                          title="Copy Order ID"
                        >
                          <Copy size={11} />
                          {copiedId === (order.orderId || order.id) ? 'Copied!' : 'Copy'}
                        </button>
                        <span className="text-dark/20">•</span>
                        <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                          <Calendar size={12} />
                          Booking Date: {order.date}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
                            order.status === 'Delivered' || order.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                      <div className="flex items-center gap-4">
                        <img
                          src={order.propertyImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80'}
                          alt={order.item}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 border border-black/10"
                        />
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {order.category || 'Luxury Real Estate'}
                          </span>
                          <h4 className="text-base sm:text-lg font-bold text-dark leading-snug">
                            {order.item}
                          </h4>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin size={12} />
                            {order.address?.city || 'Springfield'}, {order.address?.country || 'United States'}
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              Token Paid: {order.tokenPaid || 'Rs. 1,00,000'}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              Stage {order.tracking?.currentStep || 2}/4 Active
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col md:items-end w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-black/5">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                          Full Property Valuation
                        </span>
                        <span className="text-base sm:text-lg font-extrabold text-dark">
                          {order.total}
                        </span>

                        <div className="flex flex-row md:flex-col gap-2 w-full mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrderForTracking(order);
                              setTrackingMode('buy');
                              handleTabChange('tracking');
                            }}
                            className="flex-1 md:w-full bg-dark hover:bg-black text-white text-xs font-bold py-2 px-4 rounded-full flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                          >
                            <Truck size={13} />
                            <span>Track Steps</span>
                          </button>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setViewingOrder(order)}
                              className="flex-1 bg-white hover:bg-black/5 text-dark border border-black/15 text-xs font-bold py-2 px-3 rounded-full transition-all cursor-pointer text-center"
                            >
                              Details
                            </button>

                            <button
                              type="button"
                              onClick={() => setReceiptOrder(order)}
                              className="flex-1 bg-white hover:bg-black/5 text-dark border border-black/15 text-xs font-bold py-2 px-3 rounded-full transition-all cursor-pointer flex items-center justify-center gap-1"
                              title="Download Receipt"
                            >
                              <FileText size={12} />
                              <span>Receipt</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: STATUS TRACKING & PROPERTY STEPS */}
        {/* ======================================================== */}
        {activeTab === 'tracking' && (
          <div className="space-y-6">
            {/* Tracking Mode Switcher (Buy vs Sell Tracking) */}
            <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-4 rounded-2xl border border-black/8 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Tracking View:
                </span>
                <div className="inline-flex rounded-xl bg-neutral-100 p-1 border border-black/5">
                  <button
                    type="button"
                    onClick={() => setTrackingMode('buy')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                      trackingMode === 'buy'
                        ? 'bg-dark text-white shadow-2xs'
                        : 'text-dark/70 hover:text-dark'
                    }`}
                  >
                    Booked Property Steps ({orders.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrackingMode('sell')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                      trackingMode === 'sell'
                        ? 'bg-dark text-white shadow-2xs'
                        : 'text-dark/70 hover:text-dark'
                    }`}
                  >
                    Sold & Listed Steps ({sellProperties.length})
                  </button>
                </div>
              </div>

              {/* Simulation Stage Advancer */}
              <button
                type="button"
                onClick={trackingMode === 'buy' ? handleAdvanceBuyStep : handleAdvanceSellStep}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title="Click to simulate moving to the next milestone in the transaction"
              >
                <Sparkles size={13} />
                <span>Simulate Step Progression</span>
              </button>
            </div>

            {/* ================= BUYER TRACKING VIEW ================= */}
            {trackingMode === 'buy' && (
              <>
                {/* Order Selector Chips */}
                {orders.length > 1 && (
                  <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0">
                      Select Booked Property:
                    </span>
                    {orders.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setSelectedOrderForTracking(o)}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                          selectedOrderForTracking?.id === o.id
                            ? 'bg-dark text-white border-dark shadow-xs'
                            : 'bg-white text-dark/70 border-black/10 hover:border-black/30'
                        }`}
                      >
                        #{o.orderId || o.id} • {o.item.slice(0, 20)}...
                      </button>
                    ))}
                  </div>
                )}

                {selectedOrderForTracking ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Stepper (8 cols) */}
                    <div className="lg:col-span-8 bg-white rounded-3xl border border-black/8 p-6 sm:p-8 shadow-sm space-y-8">
                      {/* Tracking Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/8">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full uppercase tracking-wider">
                              {selectedOrderForTracking.status}
                            </span>
                            <span className="text-xs font-mono text-gray-400">
                              {selectedOrderForTracking.tracking?.trackingNumber || 'TRK-ESTATE-LIVE'}
                            </span>
                          </div>
                          <h3 className="text-xl sm:text-2xl font-extrabold text-dark mt-2">
                            {selectedOrderForTracking.item}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Booking reference: #{selectedOrderForTracking.orderId || selectedOrderForTracking.id} • Token Paid: {selectedOrderForTracking.tokenPaid || 'Rs. 1,00,000'}
                          </p>
                        </div>

                        <div className="text-left sm:text-right bg-neutral-50 sm:bg-transparent p-3 sm:p-0 rounded-2xl border sm:border-0 border-black/5">
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                            Estimated Handover
                          </p>
                          <p className="text-base sm:text-lg font-extrabold text-dark mt-0.5">
                            {selectedOrderForTracking.tracking?.estimatedDate || 'Oct 28, 2026'}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-2">
                          <span className="uppercase tracking-wider">Property Handover Progress</span>
                          <span className="text-dark">
                            {Math.round(((selectedOrderForTracking.tracking?.currentStep || 2) / 4) * 100)}% Complete
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.round(((selectedOrderForTracking.tracking?.currentStep || 2) / 4) * 100)}%`
                            }}
                          />
                        </div>
                      </div>

                      {/* Vertical Stepper Timeline */}
                      <div>
                        <h4 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-6">
                          Transaction Milestones & Verification Steps
                        </h4>

                        <div className="space-y-6 sm:space-y-8">
                          {(selectedOrderForTracking.tracking?.steps || []).map((step, idx) => {
                            const isDone = step.completed;
                            const isCurrent = !isDone && idx === (selectedOrderForTracking.tracking?.currentStep || 2) - 1;

                            return (
                              <div key={idx} className="relative flex items-start gap-4 sm:gap-6 group">
                                {idx < (selectedOrderForTracking.tracking?.steps?.length - 1) && (
                                  <div
                                    className={`absolute left-4.5 sm:left-5 top-10 bottom-0 w-0.5 -ml-px transition-colors ${
                                      isDone ? 'bg-emerald-500' : 'bg-gray-200'
                                    }`}
                                  />
                                )}

                                <div
                                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                                    isDone
                                      ? 'bg-emerald-500 text-white shadow-sm'
                                      : isCurrent
                                      ? 'bg-dark text-white ring-4 ring-[#faede3] shadow-md'
                                      : 'bg-gray-100 text-gray-400 border border-black/10'
                                  }`}
                                >
                                  {isDone ? (
                                    <CheckCircle size={18} strokeWidth={2.5} />
                                  ) : isCurrent ? (
                                    <Clock size={18} className="animate-spin" />
                                  ) : (
                                    <span className="text-xs font-bold">{idx + 1}</span>
                                  )}
                                </div>

                                <div className="flex-1 pt-1 pb-4">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                    <h5 className={`text-sm sm:text-base font-bold ${
                                      isDone || isCurrent ? 'text-dark' : 'text-gray-400'
                                    }`}>
                                      {step.title}
                                    </h5>
                                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full self-start sm:self-auto ${
                                      isDone
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : isCurrent
                                        ? 'bg-[#faede3] text-dark font-bold'
                                        : 'bg-gray-100 text-gray-400'
                                    }`}>
                                      {step.date}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    {step.desc}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Assurance & Actions */}
                      <div className="p-4 rounded-2xl bg-[#faede3]/70 border border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <ShieldCheck size={24} className="text-dark shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-dark">RERA & Municipal Legal Clearance</p>
                            <p className="text-[11px] text-dark/70">
                              Every step of your purchase is insured with certified title deeds and municipal registry guarantees.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setReceiptOrder(selectedOrderForTracking)}
                          className="bg-white hover:bg-neutral-100 text-dark border border-black/15 text-xs font-bold px-4 py-2 rounded-full shrink-0 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                        >
                          <Printer size={13} />
                          <span>View Booking Receipt</span>
                        </button>
                      </div>
                    </div>

                    {/* Right Column: Address & Advisor (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                      {/* Property Address */}
                      <div className="bg-white rounded-3xl border border-black/8 p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-extrabold uppercase tracking-widest text-dark flex items-center gap-2">
                            <MapPin size={15} /> Registered Title Address
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-black/5 text-dark rounded-full">
                            {selectedOrderForTracking.address?.type || 'Delivery Address'}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs text-gray-600 bg-neutral-50 rounded-2xl p-4 border border-black/5">
                          <p className="text-sm font-bold text-dark">
                            {selectedOrderForTracking.address?.fullName || selectedOrderForTracking.customer}
                          </p>
                          <p className="font-medium text-dark/80">
                            {selectedOrderForTracking.address?.street}
                          </p>
                          <p>
                            {selectedOrderForTracking.address?.city}, {selectedOrderForTracking.address?.state} - {selectedOrderForTracking.address?.pincode}
                          </p>
                          <p className="font-semibold text-dark/70">
                            {selectedOrderForTracking.address?.country || 'United States'}
                          </p>
                          <div className="pt-2 border-t border-black/5 mt-2 flex items-center gap-2 text-dark font-medium">
                            <Phone size={12} className="text-gray-400" />
                            <span>{selectedOrderForTracking.address?.phone || selectedOrderForTracking.phone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Dedicated Advisor */}
                      <div className="bg-white rounded-3xl border border-black/8 p-6 shadow-sm space-y-4">
                        <h4 className="text-xs font-extrabold uppercase tracking-widest text-dark">
                          Dedicated Property Advisor
                        </h4>

                        <div className="flex items-center gap-3.5">
                          <img
                            src={selectedOrderForTracking.tracking?.agent?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                            alt="Advisor"
                            className="w-13 h-13 rounded-full object-cover border-2 border-dark shrink-0"
                          />
                          <div className="min-w-0">
                            <h5 className="text-sm font-extrabold text-dark truncate">
                              {selectedOrderForTracking.tracking?.agent?.name || 'Vikram Malhotra'}
                            </h5>
                            <p className="text-[11px] text-gray-500 truncate">
                              {selectedOrderForTracking.tracking?.agent?.role || 'Senior Property Advisor'}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-black/8 text-xs">
                          <a
                            href={`tel:${selectedOrderForTracking.tracking?.agent?.phone || '+919820011223'}`}
                            className="w-full bg-dark hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-center"
                          >
                            <Phone size={13} />
                            <span>Call Advisor</span>
                          </a>
                          <a
                            href={`mailto:${selectedOrderForTracking.tracking?.agent?.email || 'advisor@modernrealestate.com'}`}
                            className="w-full bg-neutral-100 hover:bg-neutral-200 text-dark font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-center"
                          >
                            <Mail size={13} />
                            <span>Send Email</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-black/20 p-8">
                    <Truck size={36} className="mx-auto text-gray-400 mb-3" />
                    <h3 className="text-base font-bold text-dark">No booked properties to track</h3>
                    <button
                      type="button"
                      onClick={handleOpenBookModal}
                      className="mt-4 bg-dark text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-black transition-all cursor-pointer"
                    >
                      Book A Property
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ================= SELLER TRACKING VIEW ================= */}
            {trackingMode === 'sell' && (
              <>
                {/* Sell Property Selector Chips */}
                {sellProperties.length > 1 && (
                  <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0">
                      Select Listed Property:
                    </span>
                    {sellProperties.map((sp) => (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => setSelectedSellPropertyForTracking(sp)}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                          selectedSellPropertyForTracking?.id === sp.id
                            ? 'bg-dark text-white border-dark shadow-xs'
                            : 'bg-white text-dark/70 border-black/10 hover:border-black/30'
                        }`}
                      >
                        #{sp.id} • {sp.title.slice(0, 20)}...
                      </button>
                    ))}
                  </div>
                )}

                {selectedSellPropertyForTracking ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Stepper (8 cols) */}
                    <div className="lg:col-span-8 bg-white rounded-3xl border border-black/8 p-6 sm:p-8 shadow-sm space-y-8">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/8">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-0.5 rounded-full uppercase tracking-wider">
                              {selectedSellPropertyForTracking.status}
                            </span>
                            <span className="text-xs font-mono text-gray-400">
                              #{selectedSellPropertyForTracking.id}
                            </span>
                          </div>
                          <h3 className="text-xl sm:text-2xl font-extrabold text-dark mt-2">
                            {selectedSellPropertyForTracking.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Asking Price: <span className="font-extrabold text-dark">{selectedSellPropertyForTracking.price}</span> • {selectedSellPropertyForTracking.sqft}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-center px-3 py-2 bg-neutral-50 rounded-xl border border-black/5">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Inquiries</p>
                            <p className="text-base font-extrabold text-dark">{selectedSellPropertyForTracking.inquiriesCount || 0}</p>
                          </div>
                          <div className="text-center px-3 py-2 bg-neutral-50 rounded-xl border border-black/5">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Offers</p>
                            <p className="text-base font-extrabold text-emerald-700">{selectedSellPropertyForTracking.offersCount || 0}</p>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-2">
                          <span className="uppercase tracking-wider">Sale & Payout Progress</span>
                          <span className="text-dark">
                            {Math.round(((selectedSellPropertyForTracking.currentStep || 2) / 5) * 100)}% Complete
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-amber-600 h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.round(((selectedSellPropertyForTracking.currentStep || 2) / 5) * 100)}%`
                            }}
                          />
                        </div>
                      </div>

                      {/* 5 Seller Stepper Milestones */}
                      <div>
                        <h4 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-6">
                          Seller Verification & Escrow Payout Stages
                        </h4>

                        <div className="space-y-6 sm:space-y-8">
                          {(selectedSellPropertyForTracking.steps || []).map((step, idx) => {
                            const isDone = step.completed;
                            const isCurrent = !isDone && idx === (selectedSellPropertyForTracking.currentStep || 1);

                            return (
                              <div key={idx} className="relative flex items-start gap-4 sm:gap-6 group">
                                {idx < (selectedSellPropertyForTracking.steps?.length - 1) && (
                                  <div
                                    className={`absolute left-4.5 sm:left-5 top-10 bottom-0 w-0.5 -ml-px transition-colors ${
                                      isDone ? 'bg-amber-500' : 'bg-gray-200'
                                    }`}
                                  />
                                )}

                                <div
                                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                                    isDone
                                      ? 'bg-amber-600 text-white shadow-sm'
                                      : isCurrent
                                      ? 'bg-dark text-white ring-4 ring-[#faede3] shadow-md'
                                      : 'bg-gray-100 text-gray-400 border border-black/10'
                                  }`}
                                >
                                  {isDone ? (
                                    <CheckCircle size={18} strokeWidth={2.5} />
                                  ) : isCurrent ? (
                                    <Clock size={18} className="animate-spin" />
                                  ) : (
                                    <span className="text-xs font-bold">{idx + 1}</span>
                                  )}
                                </div>

                                <div className="flex-1 pt-1 pb-4">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                    <h5 className={`text-sm sm:text-base font-bold ${
                                      isDone || isCurrent ? 'text-dark' : 'text-gray-400'
                                    }`}>
                                      {step.title}
                                    </h5>
                                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full self-start sm:self-auto ${
                                      isDone
                                        ? 'bg-amber-50 text-amber-800'
                                        : isCurrent
                                        ? 'bg-[#faede3] text-dark font-bold'
                                        : 'bg-gray-100 text-gray-400'
                                    }`}>
                                      {step.date}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    {step.desc}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Seller Assurance Banner */}
                      <div className="p-4 rounded-2xl bg-[#faede3]/70 border border-black/5 flex items-center gap-3.5">
                        <Award size={24} className="text-dark shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-dark">100% Escrow & Direct Bank Payout Security</p>
                          <p className="text-[11px] text-dark/70">
                            Buyer funds are securely locked in verified bank escrow until final registry deed execution at the sub-registrar office.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Listing Snapshot & Escrow Officer (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                      <div className="bg-white rounded-3xl border border-black/8 overflow-hidden shadow-sm">
                        <img
                          src={selectedSellPropertyForTracking.image}
                          alt={selectedSellPropertyForTracking.title}
                          className="w-full h-44 object-cover"
                        />
                        <div className="p-6 space-y-3">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                            {selectedSellPropertyForTracking.category}
                          </span>
                          <h4 className="text-base font-bold text-dark">
                            {selectedSellPropertyForTracking.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {selectedSellPropertyForTracking.location}
                          </p>
                          <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs">
                            <span className="font-bold text-dark">{selectedSellPropertyForTracking.beds} Beds • {selectedSellPropertyForTracking.baths} Baths</span>
                            <span className="font-extrabold text-dark">{selectedSellPropertyForTracking.price}</span>
                          </div>
                        </div>
                      </div>

                      {/* Escrow Officer */}
                      <div className="bg-white rounded-3xl border border-black/8 p-6 shadow-sm space-y-4">
                        <h4 className="text-xs font-extrabold uppercase tracking-widest text-dark">
                          Assigned Escrow & Legal Officer
                        </h4>

                        <div className="flex items-center gap-3.5">
                          <img
                            src={selectedSellPropertyForTracking.agent?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                            alt="Officer"
                            className="w-13 h-13 rounded-full object-cover border-2 border-dark shrink-0"
                          />
                          <div className="min-w-0">
                            <h5 className="text-sm font-extrabold text-dark truncate">
                              {selectedSellPropertyForTracking.agent?.name || 'Rajesh Singhania'}
                            </h5>
                            <p className="text-[11px] text-gray-500 truncate">
                              {selectedSellPropertyForTracking.agent?.role || 'Chief Sales Director'}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-black/8 text-xs">
                          <a
                            href={`tel:${selectedSellPropertyForTracking.agent?.phone || '+919833099887'}`}
                            className="w-full bg-dark hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-center"
                          >
                            <Phone size={13} />
                            <span>Call Escrow Officer</span>
                          </a>
                          <a
                            href={`mailto:${selectedSellPropertyForTracking.agent?.email || 'escrow@modernrealestate.com'}`}
                            className="w-full bg-neutral-100 hover:bg-neutral-200 text-dark font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-center"
                          >
                            <Mail size={13} />
                            <span>Email Officer</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-black/20 p-8">
                    <TrendingUp size={36} className="mx-auto text-gray-400 mb-3" />
                    <h3 className="text-base font-bold text-dark">No listed properties to track</h3>
                    <button
                      type="button"
                      onClick={handleOpenSellModal}
                      className="mt-4 bg-dark text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-black transition-all cursor-pointer"
                    >
                      Submit A Property for Sale
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: SELL MY PROPERTY / MY LISTED PROPERTIES */}
        {/* ======================================================== */}
        {activeTab === 'sell' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-black/8 shadow-2xs">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-dark">
                  Sell Real Estate & Manage Listings
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  List luxury homes, villas, and apartments for sale. Track appraisals, buyer offers, and registry payout.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenSellModal}
                className="bg-dark hover:bg-black text-white text-xs font-bold py-2.5 px-6 rounded-full flex items-center gap-2 transition-all cursor-pointer shadow-xs self-start sm:self-auto"
              >
                <Plus size={15} />
                <span>+ List New Property for Sale</span>
              </button>
            </div>

            {/* Sell Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sellProperties.map((sp) => (
                <div
                  key={sp.id}
                  className="bg-white rounded-3xl border border-black/8 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-52 w-full overflow-hidden">
                      <img
                        src={sp.image}
                        alt={sp.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 bg-dark/85 backdrop-blur-xs text-white text-[11px] font-extrabold px-3 py-1 rounded-full">
                        {sp.category}
                      </div>
                      <div className="absolute top-4 right-4 bg-white text-dark text-xs font-extrabold px-3 py-1 rounded-full shadow-md">
                        {sp.status}
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-gray-400">#{sp.id}</span>
                        <span className="text-xs font-bold text-emerald-700">Stage {sp.currentStep || 2}/5</span>
                      </div>

                      <h4 className="text-lg font-bold text-dark leading-snug">
                        {sp.title}
                      </h4>

                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin size={13} />
                        {sp.location}
                      </p>

                      <div className="flex items-center gap-4 text-xs font-semibold text-gray-600 py-2 border-y border-black/5">
                        <span>{sp.beds} Beds</span>
                        <span>•</span>
                        <span>{sp.baths} Baths</span>
                        <span>•</span>
                        <span>{sp.sqft}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-semibold">Expected Asking Price</p>
                          <p className="text-lg font-extrabold text-dark">{sp.price}</p>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 uppercase font-semibold">Interest</p>
                          <p className="text-xs font-bold text-dark">
                            {sp.inquiriesCount} Views • {sp.offersCount} Offers
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSellPropertyForTracking(sp);
                        setTrackingMode('sell');
                        handleTabChange('tracking');
                      }}
                      className="flex-1 bg-dark hover:bg-black text-white text-xs font-bold py-2.5 rounded-full flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <Truck size={13} />
                      <span>Track Sell Milestones</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        showToast(`Viewing active buyer offers for ${sp.title}`);
                      }}
                      className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-dark text-xs font-bold rounded-full cursor-pointer transition-colors"
                    >
                      View Offers
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: SITE VISITS & INQUIRIES */}
        {/* ======================================================== */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-black/8 shadow-2xs">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-dark">
                  Scheduled Site Visits & Tour Requests
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Track upcoming physical property walkthroughs and direct legal consultation sessions.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleOpenInquiryModal()}
                className="bg-dark hover:bg-black text-white text-xs font-bold py-2.5 px-6 rounded-full flex items-center gap-2 transition-all cursor-pointer shadow-xs self-start sm:self-auto"
              >
                <Compass size={15} />
                <span>+ Schedule Site Visit</span>
              </button>
            </div>

            <div className="space-y-4">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="bg-white rounded-3xl border border-black/8 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-gray-400">#{inq.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        inq.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {inq.status}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-dark">{inq.property}</h4>
                    <p className="text-xs text-gray-600 flex items-center gap-2">
                      <Calendar size={13} className="text-gray-400" />
                      <span>Scheduled for: <strong className="text-dark">{inq.date}</strong></span>
                      <span>•</span>
                      <Clock size={13} className="text-gray-400" />
                      <span>{inq.timeSlot}</span>
                    </p>

                    <p className="text-xs text-gray-500 italic pt-1">
                      "{inq.message}"
                    </p>
                  </div>

                  <div className="flex flex-col md:items-end gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-black/5">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      Assigned Advisor
                    </span>
                    <span className="text-xs font-bold text-dark">
                      {inq.advisor || 'Vikram Malhotra (+91 98200 11223)'}
                    </span>

                    <button
                      type="button"
                      onClick={() => showToast(`Reschedule instructions sent to ${inq.email}`)}
                      className="bg-neutral-100 hover:bg-neutral-200 text-dark text-xs font-bold px-4 py-2 rounded-full cursor-pointer transition-colors"
                    >
                      Reschedule Tour
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: SAVED ADDRESSES */}
        {/* ======================================================== */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-dark">
                  Delivery & Property Addresses
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Manage your saved locations for property documentation, courier deliveries, and title billing.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddAddress}
                className="bg-dark hover:bg-black text-white text-xs font-bold py-2.5 px-5 rounded-full flex items-center gap-2 transition-all cursor-pointer shadow-xs self-start sm:self-auto"
              >
                <Plus size={14} />
                <span>Add New Address</span>
              </button>
            </div>

            {/* Address Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`bg-white rounded-3xl p-6 border transition-all relative flex flex-col justify-between ${
                    addr.isDefault
                      ? 'border-dark ring-2 ring-dark/5 shadow-md'
                      : 'border-black/10 hover:border-black/20 shadow-2xs'
                  }`}
                >
                  <div>
                    {/* Header with Type & Default pill */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-[#faede3] text-dark flex items-center justify-center shrink-0">
                          <MapPin size={16} />
                        </span>
                        <div>
                          <h4 className="text-sm font-extrabold text-dark">{addr.type}</h4>
                          {addr.isDefault && (
                            <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">
                              Default Address ✓
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditAddress(addr)}
                          className="p-1.5 text-gray-400 hover:text-dark rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
                          title="Edit Address"
                        >
                          <Edit3 size={15} />
                        </button>
                        {addresses.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Address"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Address Body */}
                    <div className="space-y-1 text-xs text-gray-600">
                      <p className="text-sm font-bold text-dark">{addr.fullName}</p>
                      <p className="font-medium text-dark/85">{addr.street}</p>
                      <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="font-semibold text-dark/70">{addr.country}</p>
                      <p className="pt-2 text-dark font-medium flex items-center gap-1.5">
                        <Phone size={12} className="text-gray-400" />
                        {addr.phone}
                      </p>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-5 mt-5 border-t border-black/8 flex items-center justify-between">
                    {!addr.isDefault ? (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        className="text-xs font-bold text-dark hover:underline cursor-pointer"
                      >
                        Set as Default
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle size={13} /> Active Default
                      </span>
                    )}

                    <span className="text-[10px] text-gray-400 font-mono">
                      ID: {addr.id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: ACCOUNT PROFILE DETAILS */}
        {/* ======================================================== */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl border border-black/8 p-6 sm:p-8 lg:p-10 shadow-sm space-y-8 max-w-3xl">
            <div>
              <h3 className="text-xl font-extrabold text-dark">Customer Account Information</h3>
              <p className="text-xs text-gray-500 mt-1">
                Your profile information is used for deed registration, purchase invoices, and delivery tracking.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-black/8">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Full Name
                </label>
                <p className="text-base font-bold text-dark">
                  {customer?.name || customer?.firstName || 'Keval Patel'}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Email Address
                </label>
                <p className="text-base font-bold text-dark">
                  {customer?.email || 'keval@example.com'}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Phone Number
                </label>
                <p className="text-base font-bold text-dark">
                  {customer?.phone || '+91 98765 43210'}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Account Status & KYC
                </label>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-sm font-bold text-emerald-700">KYC Verified & Active</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-black/8 flex items-center justify-between gap-4 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setProfileForm({
                    name: customer?.name || customer?.firstName || '',
                    email: customer?.email || '',
                    phone: customer?.phone || '+91 98765 43210'
                  });
                  setIsProfileModalOpen(true);
                }}
                className="bg-dark hover:bg-black text-white text-xs font-bold py-2.5 px-6 rounded-full transition-all cursor-pointer shadow-xs"
              >
                Update Personal Details
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('orders')}
                className="text-xs font-bold text-dark hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>View Booked Properties</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* MODAL 1: BOOK PROPERTY MODAL */}
      {/* ======================================================== */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmBooking}
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-black/10"
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/8">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Direct Allotment</span>
                <h3 className="text-xl font-extrabold text-dark mt-0.5">Book A Luxury Property</h3>
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
              {/* Select Property */}
              <div>
                <label className="block font-bold text-dark mb-1">Select Property from Catalog *</label>
                <select
                  value={bookForm.selectedPropertyId}
                  onChange={(e) => setBookForm({ ...bookForm, selectedPropertyId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-dark focus:ring-1 focus:ring-dark font-medium"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} — {p.price} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Property Preview Tile */}
              {(() => {
                const sel = products.find((p) => p.id === Number(bookForm.selectedPropertyId)) || products[0];
                return (
                  <div className="flex items-center gap-4 bg-neutral-50 p-3.5 rounded-2xl border border-black/5">
                    <img
                      src={sel.image}
                      alt={sel.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-extrabold text-dark truncate">{sel.title}</h4>
                      <p className="text-gray-500 text-[11px] truncate">{sel.description}</p>
                      <p className="font-extrabold text-dark mt-1 text-sm">{sel.price}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Token Advance Payment Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-dark mb-1">Booking Token Advance *</label>
                  <select
                    value={bookForm.tokenAmount}
                    onChange={(e) => {
                      const num = parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 50000;
                      setBookForm({ ...bookForm, tokenAmount: e.target.value, tokenNumber: num });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-dark focus:ring-1 focus:ring-dark font-semibold"
                  >
                    <option value="Rs. 50,000.00">Rs. 50,000.00 (Standard Allotment Token)</option>
                    <option value="Rs. 1,00,000.00">Rs. 1,00,000.00 (Priority Legal Lock)</option>
                    <option value="Rs. 2,50,000.00">Rs. 2,50,000.00 (Exclusive Premium Allotment)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-dark mb-1">Payment Method</label>
                  <select
                    value={bookForm.paymentMethod}
                    onChange={(e) => setBookForm({ ...bookForm, paymentMethod: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-dark focus:ring-1 focus:ring-dark"
                  >
                    <option value="UPI / NetBanking Token Transfer">UPI / NetBanking Instant Token</option>
                    <option value="HDFC / Axis Bank Visa Credit Card">Luxury Credit Card (Visa/Mastercard)</option>
                    <option value="Escrow Solicitor Wire Transfer">Verified Solicitor Escrow Wire</option>
                  </select>
                </div>
              </div>

              {/* Buyer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-dark mb-1">Buyer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={bookForm.fullName}
                    onChange={(e) => setBookForm({ ...bookForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark"
                  />
                </div>
                <div>
                  <label className="block font-bold text-dark mb-1">Buyer Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={bookForm.phone}
                    onChange={(e) => setBookForm({ ...bookForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark"
                  />
                </div>
              </div>

              {/* Registered Address Selection */}
              <div>
                <label className="block font-bold text-dark mb-1">Select Registered Address *</label>
                <select
                  value={bookForm.addressIndex}
                  onChange={(e) => setBookForm({ ...bookForm, addressIndex: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-dark focus:ring-1 focus:ring-dark"
                >
                  {addresses.map((a, idx) => (
                    <option key={a.id} value={idx}>
                      {a.type}: {a.street}, {a.city} ({a.fullName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Legal Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="legalAudit"
                  checked={bookForm.includeLegalAudit}
                  onChange={(e) => setBookForm({ ...bookForm, includeLegalAudit: e.target.checked })}
                  className="rounded border-black/20 text-dark focus:ring-dark"
                />
                <label htmlFor="legalAudit" className="font-semibold text-dark text-xs cursor-pointer select-none">
                  Include complimentary RERA municipal title deed audit & dedicated solicitor inspection.
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-black/8">
              <button
                type="submit"
                className="flex-1 bg-dark hover:bg-black text-white text-xs font-bold py-3 rounded-full transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <Key size={14} />
                <span>Confirm Allotment & Generate Booking Order</span>
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
      {/* MODAL 2: SELL PROPERTY MODAL */}
      {/* ======================================================== */}
      {isSellModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmSellListing}
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-black/10"
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/8">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Seller Onboarding</span>
                <h3 className="text-xl font-extrabold text-dark mt-0.5">List Your Property for Sale</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSellModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-dark hover:bg-black/5 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-dark mb-1">Property Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Skyline Oceanfront Penthouse & Terrace"
                  value={sellForm.title}
                  onChange={(e) => setSellForm({ ...sellForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-dark mb-1">Category / Type *</label>
                  <select
                    value={sellForm.category}
                    onChange={(e) => setSellForm({ ...sellForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-dark focus:ring-1 focus:ring-dark"
                  >
                    <option value="Royal House">Royal House</option>
                    <option value="Farm Vila">Farm Vila</option>
                    <option value="Properties">Properties</option>
                    <option value="Bestseller">Bestseller</option>
                    <option value="Villa">Luxury Villa</option>
                    <option value="Apartment">Penthouse / Apartment</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-dark mb-1">Expected Asking Price *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rs. 2,50,00,000.00"
                    value={sellForm.price}
                    onChange={(e) => setSellForm({ ...sellForm, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-dark mb-1">Street Address & Landmark *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plot 42, Skyview Enclave, Worli Seaface"
                  value={sellForm.location}
                  onChange={(e) => setSellForm({ ...sellForm, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-dark mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Mumbai"
                    value={sellForm.city}
                    onChange={(e) => setSellForm({ ...sellForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark"
                  />
                </div>
                <div>
                  <label className="block font-bold text-dark mb-1">State</label>
                  <input
                    type="text"
                    placeholder="Maharashtra"
                    value={sellForm.state}
                    onChange={(e) => setSellForm({ ...sellForm, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark"
                  />
                </div>
                <div>
                  <label className="block font-bold text-dark mb-1">PIN Code</label>
                  <input
                    type="text"
                    placeholder="400018"
                    value={sellForm.pincode}
                    onChange={(e) => setSellForm({ ...sellForm, pincode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-dark mb-1">Beds</label>
                  <input
                    type="number"
                    min="1"
                    value={sellForm.beds}
                    onChange={(e) => setSellForm({ ...sellForm, beds: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark"
                  />
                </div>
                <div>
                  <label className="block font-bold text-dark mb-1">Baths</label>
                  <input
                    type="number"
                    min="1"
                    value={sellForm.baths}
                    onChange={(e) => setSellForm({ ...sellForm, baths: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-dark mb-1">Carpet Area</label>
                  <input
                    type="text"
                    placeholder="e.g. 3,500 sq ft"
                    value={sellForm.sqft}
                    onChange={(e) => setSellForm({ ...sellForm, sqft: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-dark mb-1">Property Description & Highlights</label>
                <textarea
                  rows={3}
                  placeholder="Describe your property, terrace views, finishes, private elevator, etc."
                  value={sellForm.description}
                  onChange={(e) => setSellForm({ ...sellForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark resize-none"
                />
              </div>

              {/* Photo presets or URL */}
              <div>
                <label className="block font-bold text-dark mb-1">Property Cover Image URL</label>
                <input
                  type="url"
                  value={sellForm.image}
                  onChange={(e) => setSellForm({ ...sellForm, image: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark"
                />
              </div>

              {/* Seller details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-black/8">
                <div>
                  <label className="block font-bold text-dark mb-1">Seller Contact Name</label>
                  <input
                    type="text"
                    required
                    value={sellForm.sellerName}
                    onChange={(e) => setSellForm({ ...sellForm, sellerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark"
                  />
                </div>
                <div>
                  <label className="block font-bold text-dark mb-1">Seller Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={sellForm.sellerPhone}
                    onChange={(e) => setSellForm({ ...sellForm, sellerPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-black/8">
              <button
                type="submit"
                className="flex-1 bg-dark hover:bg-black text-white text-xs font-bold py-3 rounded-full transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <TrendingUp size={14} />
                <span>Submit Property Listing for Legal Audit</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSellModalOpen(false)}
                className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-dark text-xs font-bold rounded-full cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: SCHEDULE SITE VISIT MODAL */}
      {/* ======================================================== */}
      {isInquiryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmInquiry}
            className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl border border-black/10"
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/8">
              <h3 className="text-lg font-extrabold text-dark">Schedule Physical Property Tour</h3>
              <button
                type="button"
                onClick={() => setIsInquiryModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-dark hover:bg-black/5 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-dark mb-1">Select Property *</label>
                <select
                  value={inquiryForm.propertyName}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, propertyName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-dark focus:ring-1 focus:ring-dark"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.title}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-dark mb-1">Preferred Tour Date *</label>
                  <input
                    type="date"
                    required
                    value={inquiryForm.date}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark"
                  />
                </div>

                <div>
                  <label className="block font-bold text-dark mb-1">Preferred Time Window *</label>
                  <select
                    value={inquiryForm.timeSlot}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, timeSlot: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-dark focus:ring-1 focus:ring-dark"
                  >
                    <option value="Morning (10:00 AM - 12:00 PM)">Morning (10:00 AM - 12:00 PM)</option>
                    <option value="Afternoon (02:00 PM - 04:00 PM)">Afternoon (02:00 PM - 04:00 PM)</option>
                    <option value="Evening (05:00 PM - 07:00 PM)">Evening (05:00 PM - 07:00 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-dark mb-1">Specific Questions or Requirements</label>
                <textarea
                  rows={3}
                  value={inquiryForm.notes}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark resize-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-black/8">
              <button
                type="submit"
                className="flex-1 bg-dark hover:bg-black text-white text-xs font-bold py-3 rounded-full transition-all cursor-pointer shadow-xs"
              >
                Confirm Site Visit Booking
              </button>
              <button
                type="button"
                onClick={() => setIsInquiryModalOpen(false)}
                className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-dark text-xs font-bold rounded-full cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: VIEW OFFICIAL BOOKING RECEIPT */}
      {/* ======================================================== */}
      {receiptOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-black/10">
            <div className="flex items-center justify-between pb-4 border-b border-black/8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-dark text-white flex items-center justify-center font-bold">
                  RE
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-dark">Real Estate Allotment Certificate</h3>
                  <p className="text-[11px] text-gray-500 font-mono">Receipt No: RCP-{receiptOrder.orderId?.replace(/[^0-9]/g, '') || '9921'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReceiptOrder(null)}
                className="p-1 rounded-full text-gray-400 hover:text-dark hover:bg-black/5 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs border border-black/10 rounded-2xl p-5 bg-neutral-50/50">
              <div className="flex justify-between items-start pb-3 border-b border-black/8">
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-400">Allotted Buyer</span>
                  <p className="text-sm font-bold text-dark mt-0.5">{receiptOrder.customer}</p>
                  <p className="text-gray-500">{receiptOrder.email} • {receiptOrder.phone}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-gray-400">Date Issued</span>
                  <p className="text-xs font-bold text-dark mt-0.5">{receiptOrder.date}</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Token Confirmed ✓
                  </span>
                </div>
              </div>

              <div className="space-y-2 py-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-600">Property Title:</span>
                  <span className="font-extrabold text-dark">{receiptOrder.item}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-600">Registered Title Location:</span>
                  <span className="font-medium text-dark">{receiptOrder.address?.city}, {receiptOrder.address?.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-600">Total Purchase Agreement Value:</span>
                  <span className="font-bold text-dark">{receiptOrder.total}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold pt-2 border-t border-black/5">
                  <span>Initial Token Deposited:</span>
                  <span>{receiptOrder.tokenPaid || 'Rs. 1,00,000.00'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-black/8 flex items-center justify-between text-[11px] text-gray-500">
                <span>RERA Reg: PRM/KA/RERA/1251/2024</span>
                <span className="font-bold text-dark">Authorized Signature & Seal ✓</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 bg-dark hover:bg-black text-white text-xs font-bold py-3 rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Printer size={14} />
                <span>Print Official Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => setReceiptOrder(null)}
                className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-dark text-xs font-bold rounded-full cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: VIEW ORDER DETAILS */}
      {/* ======================================================== */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-black/10">
            <div className="flex items-center justify-between pb-4 border-b border-black/8">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Order Summary</span>
                <h3 className="text-lg font-extrabold text-dark mt-0.5">
                  #{viewingOrder.orderId || viewingOrder.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="p-1 rounded-full text-gray-400 hover:text-dark hover:bg-black/5 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-4 bg-neutral-50 p-3.5 rounded-2xl border border-black/5">
                <img
                  src={viewingOrder.propertyImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80'}
                  alt={viewingOrder.item}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-extrabold text-dark">{viewingOrder.item}</h4>
                  <p className="text-gray-500 mt-0.5">Booking Date: {viewingOrder.date}</p>
                  <p className="font-extrabold text-dark mt-1 text-sm">{viewingOrder.total}</p>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="border border-black/8 rounded-2xl p-4 space-y-1">
                <p className="font-bold text-dark text-xs uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                  <MapPin size={13} /> Registered Title Address:
                </p>
                <p className="font-bold text-dark">{viewingOrder.address?.fullName || viewingOrder.customer}</p>
                <p className="text-gray-600">{viewingOrder.address?.street}</p>
                <p className="text-gray-600">{viewingOrder.address?.city}, {viewingOrder.address?.state} - {viewingOrder.address?.pincode}</p>
                <p className="text-gray-600 font-semibold">{viewingOrder.address?.country}</p>
                <p className="text-dark font-medium pt-1">Contact: {viewingOrder.address?.phone || viewingOrder.phone}</p>
              </div>

              {/* Payment Details */}
              <div className="border border-black/8 rounded-2xl p-4 space-y-2">
                <p className="font-bold text-dark text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <CreditCard size={13} /> Payment & Billing:
                </p>
                <div className="flex justify-between text-gray-600">
                  <span>Payment Method:</span>
                  <span className="font-semibold text-dark">{viewingOrder.paymentMethod || 'Prepaid Verified'}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Token Paid:</span>
                  <span className="font-bold text-emerald-700">{viewingOrder.tokenPaid || 'Rs. 1,00,000.00'}</span>
                </div>
                <div className="flex justify-between text-dark font-extrabold text-sm pt-2 border-t border-black/5">
                  <span>Grand Total:</span>
                  <span>{viewingOrder.total}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedOrderForTracking(viewingOrder);
                  setViewingOrder(null);
                  setTrackingMode('buy');
                  handleTabChange('tracking');
                }}
                className="flex-1 bg-dark hover:bg-black text-white text-xs font-bold py-3 rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Truck size={14} />
                <span>Track This Order</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-dark text-xs font-bold rounded-full cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 6: ADD / EDIT ADDRESS */}
      {/* ======================================================== */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveAddress}
            className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl border border-black/10"
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/8">
              <h3 className="text-lg font-extrabold text-dark">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-dark hover:bg-black/5 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-dark mb-1">Address Label / Type</label>
                <select
                  value={addressForm.type}
                  onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-dark focus:ring-1 focus:ring-dark"
                >
                  <option value="Primary Residence">Primary Residence</option>
                  <option value="Commercial / Office">Commercial / Office</option>
                  <option value="Investment Property">Investment Property</option>
                  <option value="Vacation Home">Vacation Home</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-dark mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark"
                  />
                </div>
                <div>
                  <label className="block font-bold text-dark mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-dark mb-1">Street Address / Landmark *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 742 Evergreen Terrace, Apt 4B"
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-dark mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark"
                  />
                </div>
                <div>
                  <label className="block font-bold text-dark mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-bold text-dark mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-dark mb-1">Country</label>
                <input
                  type="text"
                  value={addressForm.country}
                  onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="rounded border-black/20 text-dark focus:ring-dark"
                />
                <label htmlFor="isDefault" className="font-semibold text-dark text-xs cursor-pointer select-none">
                  Set as default delivery & billing address
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-black/8">
              <button
                type="submit"
                className="flex-1 bg-dark hover:bg-black text-white text-xs font-bold py-3 rounded-full transition-all cursor-pointer shadow-xs"
              >
                {editingAddress ? 'Save Changes' : 'Add Address'}
              </button>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-dark text-xs font-bold rounded-full cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 7: EDIT PROFILE */}
      {/* ======================================================== */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveProfile}
            className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-5 shadow-2xl border border-black/10"
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/8">
              <h3 className="text-lg font-extrabold text-dark">Update Personal Profile</h3>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-dark hover:bg-black/5 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-dark mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark"
                />
              </div>

              <div>
                <label className="block font-bold text-dark mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={profileForm.email}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-neutral-100 text-gray-500 cursor-not-allowed"
                />
                <p className="text-[10px] text-gray-400 mt-1">Email cannot be modified directly for security reasons.</p>
              </div>

              <div>
                <label className="block font-bold text-dark mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 focus:ring-1 focus:ring-dark"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-black/8">
              <button
                type="submit"
                className="flex-1 bg-dark hover:bg-black text-white text-xs font-bold py-3 rounded-full transition-all cursor-pointer shadow-xs"
              >
                Save Profile
              </button>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-dark text-xs font-bold rounded-full cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default CustomerDetails;
