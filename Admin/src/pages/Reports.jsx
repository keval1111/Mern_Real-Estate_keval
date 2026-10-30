import React, { useState, useEffect, useMemo } from 'react';
import {
  Download,
  Calendar,
  Search,
  RefreshCw,
  Printer,
  DollarSign,
  Building2,
  Users,
  CalendarCheck,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  FileCode,
  ArrowUpRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { propertyApi, inquiryApi, orderApi, payoutApi } from '../services/api';
import { defaultProperties } from '../data/defaultProperties';

// Fallback seed orders if neither backend nor localStorage has records
const SEED_ORDERS = [
  {
    id: 'ORD-9401',
    orderId: 'ORD-9401',
    customer: 'Priya Sharma',
    email: 'priya.sharma@gmail.com',
    item: 'East Side Living',
    location: 'Manhattan, New York, NY',
    tokenAmount: 50000,
    totalAmount: 1250000,
    status: 'Completed',
    paymentStatus: 'Paid',
    date: '2026-10-18',
    advisor: 'Vikram Malhotra'
  },
  {
    id: 'ORD-9402',
    orderId: 'ORD-9402',
    customer: 'Alexander Wright',
    email: 'alex.wright@corporate.io',
    item: 'The White House J-54',
    location: 'Beverly Hills, CA',
    tokenAmount: 150000,
    totalAmount: 3650000,
    status: 'Completed',
    paymentStatus: 'Paid',
    date: '2026-10-15',
    advisor: 'Rajesh Singhania'
  },
  {
    id: 'ORD-9403',
    orderId: 'ORD-9403',
    customer: 'Rajesh Patel',
    email: 'rpatel.invest@yahoo.com',
    item: 'Wheelwright Cottage House',
    location: 'East Hampton, NY',
    tokenAmount: 100000,
    totalAmount: 2400000,
    status: 'Processing',
    paymentStatus: 'Partially Paid',
    date: '2026-10-12',
    advisor: 'Ananya Deshmukh'
  },
  {
    id: 'ORD-9404',
    orderId: 'ORD-9404',
    customer: 'Samantha Miller',
    email: 'smiller@luxuryestates.org',
    item: 'Grand Marina Penthouse',
    location: 'Miami Beach, FL',
    tokenAmount: 200000,
    totalAmount: 4850000,
    status: 'Completed',
    paymentStatus: 'Paid',
    date: '2026-09-29',
    advisor: 'Rohan Kapoor'
  },
  {
    id: 'ORD-9405',
    orderId: 'ORD-9405',
    customer: 'David Chen',
    email: 'david.chen@techcapital.com',
    item: 'Skyline Modern Villa',
    location: 'Seattle, WA',
    tokenAmount: 750000,
    totalAmount: 1950000,
    status: 'Processing',
    paymentStatus: 'Escrow Initiated',
    date: '2026-09-22',
    advisor: 'Vikram Malhotra'
  },
  {
    id: 'ORD-9406',
    orderId: 'ORD-9406',
    customer: 'Elena Rostova',
    email: 'elena.rostova@monaco-holdings.mc',
    item: 'The Glass Pavilion',
    location: 'Malibu, CA',
    tokenAmount: 120000,
    totalAmount: 3200000,
    status: 'Completed',
    paymentStatus: 'Paid',
    date: '2026-09-15',
    advisor: 'Rajesh Singhania'
  }
];

// Fallback seed inquiries
const SEED_INQUIRIES = [
  {
    id: 'INQ-101',
    client: 'Marcus Vance',
    email: 'marcus.vance@gmail.com',
    phone: '+1 (555) 234-5678',
    property: 'The White House J-54',
    status: 'Completed',
    date: '2026-10-21',
    message: 'Requesting verified title deed and escrow terms for immediate token reservation.'
  },
  {
    id: 'INQ-102',
    client: 'Neha Kapoor',
    email: 'neha.k@outlook.com',
    phone: '+91 98200 45678',
    property: 'East Side Living',
    status: 'Contacted',
    date: '2026-10-20',
    message: 'Inquiring about private inspection timing and flexible mortgage advisory.'
  },
  {
    id: 'INQ-103',
    client: 'Robert Sterling',
    email: 'rsterling@investments.co',
    phone: '+1 (555) 876-5432',
    property: 'Grand Marina Penthouse',
    status: 'Pending',
    date: '2026-10-18',
    message: 'Corporate buyer inquiry for beachfront acquisition portfolio.'
  },
  {
    id: 'INQ-104',
    client: 'Chloe Dubois',
    email: 'chloe.dubois@luxurylife.fr',
    phone: '+33 6 12 34 56 78',
    property: 'Wheelwright Cottage House',
    status: 'Completed',
    date: '2026-10-14',
    message: 'Requested 3D virtual walkthrough and architectural blueprint package.'
  }
];

// Fallback seed site visits
const SEED_VISITS = [
  {
    id: 'VIS-301',
    visitor: 'David Chen',
    phone: '+1 (555) 345-9876',
    property: 'Skyline Modern Villa',
    date: '2026-10-24',
    timeSlot: '11:00 AM - 12:30 PM',
    tourType: 'In-Person VIP Tour',
    status: 'Confirmed'
  },
  {
    id: 'VIS-302',
    visitor: 'Priya Sharma',
    phone: '+1 (555) 456-7890',
    property: 'East Side Living',
    date: '2026-10-20',
    timeSlot: '03:30 PM - 04:30 PM',
    tourType: 'In-Person Inspection',
    status: 'Completed'
  },
  {
    id: 'VIS-303',
    visitor: 'Robert Sterling',
    phone: '+1 (555) 876-5432',
    property: 'Grand Marina Penthouse',
    date: '2026-10-26',
    timeSlot: '02:00 PM - 03:30 PM',
    tourType: 'Escorted Private Showing',
    status: 'Confirmed'
  },
  {
    id: 'VIS-304',
    visitor: 'Neha Kapoor',
    phone: '+91 98200 45678',
    property: 'Wheelwright Cottage House',
    date: '2026-10-28',
    timeSlot: '10:30 AM - 11:30 AM',
    tourType: 'Virtual Video Walkthrough',
    status: 'Scheduled'
  }
];

// CSV Download Helper
const exportToCSV = (filename, headers, rows) => {
  const sanitize = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(sanitize).join(','),
    ...rows.map((row) => row.map(sanitize).join(','))
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// JSON Download Helper
const exportToJSON = (filename, data) => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Print / PDF Helper
const printReport = (title, subtitle, headers, rows, stats = []) => {
  const printWindow = window.open('', '_blank', 'width=1000,height=800');
  if (!printWindow) {
    alert('Please allow popups to generate and print reports.');
    return;
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const statsHtml = stats.length > 0 ? `
    <div style="display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;">
      ${stats.map(s => `
        <div style="flex: 1; min-width: 160px; padding: 14px 18px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;">
          <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">${s.label}</div>
          <div style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 4px;">${s.value}</div>
        </div>
      `).join('')}
    </div>
  ` : '';

  const tableHeaderHtml = headers.map(h => `
    <th style="padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">${h}</th>
  `).join('');

  const tableRowsHtml = rows.map((row, idx) => `
    <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0;">
      ${row.map(cell => `
        <td style="padding: 10px 14px; font-size: 12px; color: #1e293b; font-weight: 500;">${cell}</td>
      `).join('')}
    </tr>
  `).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - EstateAdmin Report</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4 landscape; margin: 16mm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 24px;
            background: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 16px;
            border-bottom: 2px solid #0f172a;
            margin-bottom: 20px;
          }
          .brand {
            font-size: 22px;
            font-weight: 900;
            letter-spacing: -0.5px;
            color: #0f172a;
          }
          .brand-badge {
            display: inline-block;
            font-size: 10px;
            background: #c39379;
            color: #ffffff;
            font-weight: 800;
            padding: 2px 8px;
            border-radius: 4px;
            margin-left: 8px;
            vertical-align: middle;
          }
          .title {
            font-size: 18px;
            font-weight: 800;
            margin-top: 8px;
            color: #1e293b;
          }
          .subtitle {
            font-size: 12px;
            color: #64748b;
            margin-top: 2px;
          }
          .meta-info {
            text-align: right;
            font-size: 11px;
            color: #64748b;
            line-height: 1.5;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
          }
          .footer {
            margin-top: 36px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #94a3b8;
          }
          .signature-box {
            margin-top: 24px;
            display: flex;
            justify-content: flex-end;
          }
          .signature-line {
            width: 220px;
            text-align: center;
            border-top: 1px solid #475569;
            padding-top: 6px;
            font-size: 11px;
            font-weight: 600;
            color: #475569;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">EstateAdmin<span class="brand-badge">ENTERPRISE AUDIT</span></div>
            <div class="title">${title}</div>
            <div class="subtitle">${subtitle}</div>
          </div>
          <div class="meta-info">
            <div><strong>Generated:</strong> ${currentDate}</div>
            <div><strong>Classification:</strong> Internal Confidential</div>
            <div><strong>Authorized Administrator:</strong> Systems Controller</div>
          </div>
        </div>

        ${statsHtml}

        <table>
          <thead>
            <tr>${tableHeaderHtml}</tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>

        <div class="signature-box">
          <div class="signature-line">
            Authorized Controller Signature
          </div>
        </div>

        <div class="footer">
          <div>EstateAdmin Real Estate Management Systems &copy; 2026. All rights reserved.</div>
          <div>Confidentiality Notice: This automated export contains proprietary asset and transaction data.</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

const Reports = () => {
  const { isDark } = useTheme();

  // Data State
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [visits, setVisits] = useState([]);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState('');

  // Interactive Table State
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'inventory' | 'inquiries' | 'visits'
  const [searchTerm, setSearchTerm] = useState('');

  // Custom Report Builder Form State
  const [customReportType, setCustomReportType] = useState('financial');
  const [customDateRange, setCustomDateRange] = useState('All Time');
  const [customFormat, setCustomFormat] = useState('csv');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // Load live data from endpoints / localStorage / seed fallbacks
  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1. Properties
      const propData = await propertyApi.getAll();
      setProperties(Array.isArray(propData) && propData.length > 0 ? propData : defaultProperties);

      // 2. Orders
      let loadedOrders = [];
      try {
        const orderData = await orderApi.getAll();
        if (Array.isArray(orderData) && orderData.length > 0) {
          loadedOrders = orderData;
        }
      } catch (err) {
        console.warn('Reports orderApi.getAll warning:', err);
      }
      if (loadedOrders.length === 0) {
        const saved = localStorage.getItem('admin_orders');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) loadedOrders = parsed;
          } catch {
            // ignore
          }
        }
      }
      setOrders(loadedOrders.length > 0 ? loadedOrders : SEED_ORDERS);

      // 3. Inquiries
      let loadedInq = [];
      try {
        const inqData = await inquiryApi.getAll();
        if (Array.isArray(inqData) && inqData.length > 0) loadedInq = inqData;
      } catch {
        // ignore
      }
      if (loadedInq.length === 0) {
        const saved = localStorage.getItem('admin_inquiries');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) loadedInq = parsed;
          } catch {
            // ignore
          }
        }
      }
      setInquiries(loadedInq.length > 0 ? loadedInq : SEED_INQUIRIES);

      // 4. Visits
      let loadedVisits = [];
      try {
        const visitRes = await fetch('http://localhost:5000/api/visits');
        const visitJson = await visitRes.json();
        if (visitJson.success && Array.isArray(visitJson.data) && visitJson.data.length > 0) {
          loadedVisits = visitJson.data;
        }
      } catch {
        // ignore
      }
      setVisits(loadedVisits.length > 0 ? loadedVisits : SEED_VISITS);
    } catch (err) {
      console.warn('Reports data fetch warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Helper to extract clean numeric value from any string or number
  const extractAmountNumber = (val) => {
    if (typeof val === 'number') {
      if (val > 0 && val < 10) return val * 10000000; // handle fractional crore notation
      return val;
    }
    if (!val) return 0;
    const clean = String(val).replace(/[^0-9.]/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  // Helper to get formatted display string for Token Paid
  const getOrderToken = (ord) => {
    if (ord.tokenPaid) return String(ord.tokenPaid);
    if (ord.tokenAmount !== undefined && ord.tokenAmount !== null) {
      return typeof ord.tokenAmount === 'number' ? `$${ord.tokenAmount.toLocaleString()}` : String(ord.tokenAmount);
    }
    if (ord.tokenPaidNumber) return `$${ord.tokenPaidNumber.toLocaleString()}`;
    return 'Rs. 1,00,000.00';
  };

  // Helper to get formatted display string for Total Price / Valuation
  const getOrderTotal = (ord) => {
    if (ord.total) return String(ord.total);
    if (ord.totalAmount !== undefined && ord.totalAmount !== null) {
      return typeof ord.totalAmount === 'number' ? `$${ord.totalAmount.toLocaleString()}` : String(ord.totalAmount);
    }
    if (ord.price) return String(ord.price);
    if (ord.totalNumber && ord.totalNumber > 1) return `$${ord.totalNumber.toLocaleString()}`;
    return '$0';
  };

  // Computed Key Financial & Portfolio Metrics
  const metrics = useMemo(() => {
    const totalRevenue = orders.reduce((acc, curr) => {
      const val = curr.total || curr.totalAmount || curr.price || curr.priceNumber || curr.totalNumber;
      return acc + extractAmountNumber(val);
    }, 0);

    const totalTokenCollected = orders.reduce((acc, curr) => {
      const val = curr.tokenPaid || curr.tokenAmount || curr.tokenPaidNumber || 'Rs. 1,00,000';
      return acc + extractAmountNumber(val);
    }, 0);

    const portfolioValuation = properties.reduce((acc, curr) => {
      const val = curr.priceNumber || (typeof curr.price === 'string' ? Number(curr.price.replace(/[^0-9]/g, '')) : curr.price) || 0;
      return acc + (Number(val) || 0);
    }, 0);

    const completedOrders = orders.filter((o) => (o.status || '').toLowerCase() === 'completed').length;
    const completedInquiries = inquiries.filter((i) => (i.status || '').toLowerCase() === 'completed').length;

    return {
      totalRevenue,
      totalTokenCollected,
      portfolioValuation,
      totalProperties: properties.length,
      totalOrders: orders.length,
      completedOrders,
      totalInquiries: inquiries.length,
      completedInquiries,
      totalVisits: visits.length
    };
  }, [orders, properties, inquiries, visits]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // ==========================================
  // EXPORT HANDLERS FOR THE 4 REPORT CARDS
  // ==========================================

  // 1. Monthly Revenue & Sales Statement
  const handleExportRevenue = (format = 'csv') => {
    const headers = [
      'Order ID',
      'Date',
      'Customer Name',
      'Email',
      'Property Purchased',
      'Total Valuation',
      'Listing Creator',
      'Split Policy',
      'Sub-Admin Share (90%)',
      'Main Admin Net (100% or 10%)',
      'Token Paid',
      'Order Status'
    ];
    const rows = orders.map((o) => {
      const split = o.paymentSplit || {};
      const owner = o.propertyOwner?.name || o.advisor || 'Main Admin';
      const isSubAdmin = split.splitType === 'SUBADMIN_90_10' || o.propertyOwner?.role === 'Sub-Admin';
      const splitLabel = isSubAdmin ? '90% Sub-Admin / 10% Platform Fee' : '100% Main Admin Direct';
      const subAdminAmt = split.subAdminAmount !== undefined ? `$${split.subAdminAmount.toLocaleString()}` : (isSubAdmin ? 'Calculated' : 'N/A (0%)');
      const superAdminAmt = split.superAdminAmount !== undefined ? `$${split.superAdminAmount.toLocaleString()}` : getOrderTotal(o);

      return [
        o.orderId || o.id || 'N/A',
        o.date || o.createdAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        o.customer || o.customerDetails?.name || 'Private Buyer',
        o.email || o.customerDetails?.email || 'N/A',
        o.item || o.property?.title || 'Luxury Property',
        getOrderTotal(o),
        owner,
        splitLabel,
        subAdminAmt,
        superAdminAmt,
        getOrderToken(o),
        o.status || 'Completed'
      ];
    });

    const filename = `Revenue_Statement_${new Date().toISOString().slice(0, 10)}`;

    if (format === 'csv') {
      exportToCSV(`${filename}.csv`, headers, rows);
      showToast(`📥 Successfully exported "${filename}.csv"`);
    } else if (format === 'json') {
      exportToJSON(`${filename}.json`, orders);
      showToast(`📥 Exported JSON statement`);
    } else {
      printReport(
        'Monthly Revenue & Sales Statement',
        'Official Ledger of Escrow Transactions, Token Deposits & 90/10 vs 100% Revenue Splits',
        headers,
        rows,
        [
          { label: 'Total Transaction Volume', value: formatCurrency(metrics.totalRevenue) },
          { label: 'Token Capital Secured', value: formatCurrency(metrics.totalTokenCollected) },
          { label: 'Total Recorded Deeds', value: metrics.totalOrders },
          { label: 'Completed Closings', value: metrics.completedOrders }
        ]
      );
    }
  };

  // 2. Listing Inquiries & Leads Audit
  const handleExportInquiries = (format = 'csv') => {
    const headers = ['Inquiry ID', 'Date Logged', 'Client Name', 'Email Address', 'Phone Number', 'Property Interest', 'Lead Status', 'Inquiry Message'];
    const rows = inquiries.map((inq) => [
      inq._id || inq.id || 'INQ-REF',
      inq.createdAt ? inq.createdAt.slice(0, 10) : inq.date || new Date().toISOString().slice(0, 10),
      inq.client || inq.name || 'Anonymous Prospect',
      inq.email || 'N/A',
      inq.phone || 'N/A',
      inq.property || 'General Portfolio',
      inq.status || 'Pending',
      (inq.message || '').replace(/\n/g, ' ')
    ]);

    const filename = `Listing_Inquiries_Audit_${new Date().toISOString().slice(0, 10)}`;

    if (format === 'csv') {
      exportToCSV(`${filename}.csv`, headers, rows);
      showToast(`📥 Successfully exported "${filename}.csv"`);
    } else if (format === 'json') {
      exportToJSON(`${filename}.json`, inquiries);
      showToast(`📥 Exported JSON inquiries`);
    } else {
      printReport(
        'Listing Inquiries & Leads Audit',
        'Buyer Lead Audit, Prospective Investor Inquiries & Conversion Activity',
        headers,
        rows,
        [
          { label: 'Total Inquiries Received', value: metrics.totalInquiries },
          { label: 'Completed Conversions', value: metrics.completedInquiries },
          { label: 'Active Pipeline', value: Math.max(0, metrics.totalInquiries - metrics.completedInquiries) }
        ]
      );
    }
  };

  // 3. Property Inventory & Valuation Report
  const handleExportInventory = (format = 'csv') => {
    const headers = ['Property ID', 'Property Title', 'Category', 'Location', 'Price ($)', 'Beds', 'Baths', 'Sq Ft', 'Listing Status', 'Featured'];
    const rows = properties.map((p) => [
      p._id || p.id || 'PROP-REF',
      p.title || 'Untitled Listing',
      p.category || 'Residential',
      p.location || 'N/A',
      p.priceNumber || (typeof p.price === 'string' ? p.price : `$${p.price || 0}`),
      p.beds || '-',
      p.baths || '-',
      p.sqft || '-',
      p.status || 'Active',
      p.featured ? 'Yes' : 'No'
    ]);

    const filename = `Property_Inventory_Valuation_${new Date().toISOString().slice(0, 10)}`;

    if (format === 'csv') {
      exportToCSV(`${filename}.csv`, headers, rows);
      showToast(`📥 Successfully exported "${filename}.csv"`);
    } else if (format === 'json') {
      exportToJSON(`${filename}.json`, properties);
      showToast(`📥 Exported JSON inventory`);
    } else {
      printReport(
        'Property Inventory & Valuation Report',
        'Comprehensive Portfolio Valuation, Asset Inventory & Listing Status Statement',
        headers,
        rows,
        [
          { label: 'Total Portfolio Valuation', value: formatCurrency(metrics.portfolioValuation) },
          { label: 'Listed Assets', value: metrics.totalProperties },
          { label: 'Average Asset Value', value: metrics.totalProperties ? formatCurrency(metrics.portfolioValuation / metrics.totalProperties) : '$0' }
        ]
      );
    }
  };

  // 4. Storefront Traffic & Site Visits Report
  const handleExportVisits = (format = 'csv') => {
    const headers = ['Visit ID', 'Date', 'Time Slot', 'Visitor Name', 'Phone Number', 'Property Visited', 'Tour Type', 'Inspection Status'];
    const rows = visits.map((v) => [
      v._id || v.id || 'VIS-REF',
      v.date || new Date().toISOString().slice(0, 10),
      v.timeSlot || 'Scheduled Slot',
      v.visitor || v.name || 'Registered Visitor',
      v.phone || 'N/A',
      v.property || 'Showcase Property',
      v.tourType || 'In-Person Tour',
      v.status || 'Confirmed'
    ]);

    const filename = `Site_Visits_Traffic_Report_${new Date().toISOString().slice(0, 10)}`;

    if (format === 'csv') {
      exportToCSV(`${filename}.csv`, headers, rows);
      showToast(`📥 Successfully exported "${filename}.csv"`);
    } else if (format === 'json') {
      exportToJSON(`${filename}.json`, visits);
      showToast(`📥 Exported JSON visits`);
    } else {
      printReport(
        'Storefront Traffic & Site Visits Report',
        'Official Log of Buyer On-Site Inspections, Virtual Walkthroughs & Tour Engagement',
        headers,
        rows,
        [
          { label: 'Total Scheduled Visits', value: metrics.totalVisits },
          { label: 'Confirmed Appointments', value: visits.filter((v) => (v.status || '').toLowerCase() === 'confirmed').length }
        ]
      );
    }
  };

  // Custom Report Builder Action
  const handleGenerateCustomReport = () => {
    if (customReportType === 'financial') {
      handleExportRevenue(customFormat);
    } else if (customReportType === 'inventory') {
      handleExportInventory(customFormat);
    } else if (customReportType === 'inquiries') {
      handleExportInquiries(customFormat);
    } else if (customReportType === 'visits') {
      handleExportVisits(customFormat);
    } else if (customReportType === 'all') {
      // Export complete all-in-one bundle
      const allBundle = {
        meta: {
          exportDate: new Date().toISOString(),
          system: 'EstateAdmin Enterprise Core',
          metrics
        },
        orders,
        properties,
        inquiries,
        visits
      };
      if (customFormat === 'json') {
        exportToJSON(`EstateAdmin_Full_Audit_${new Date().toISOString().slice(0, 10)}.json`, allBundle);
        showToast('📥 Downloaded comprehensive system JSON audit');
      } else {
        // Default to Revenue CSV + show note
        handleExportRevenue(customFormat);
      }
    }
  };

  // 4 Primary Mock/Card Definitions mapped to real functionality
  const reportCards = [
    {
      id: 1,
      title: 'Monthly Revenue & Sales Statement',
      period: 'October 2026',
      format: 'PDF & CSV',
      size: `${orders.length} Records`,
      icon: DollarSign,
      iconColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      description: 'Transaction ledger, escrow token deposits, buyer closing accounts, and financial clearance.',
      onExportCSV: () => handleExportRevenue('csv'),
      onExportPDF: () => handleExportRevenue('pdf')
    },
    {
      id: 2,
      title: 'Listing Inquiries & Leads Audit',
      period: 'Q3/Q4 2026',
      format: 'PDF & CSV',
      size: `${inquiries.length} Inquiries`,
      icon: Users,
      iconColor: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      description: 'Contact form submissions, client inquiry messages, prospect tracking, and response statuses.',
      onExportCSV: () => handleExportInquiries('csv'),
      onExportPDF: () => handleExportInquiries('pdf')
    },
    {
      id: 3,
      title: 'Storefront Traffic & Site Visits Report',
      period: 'Annual 2026',
      format: 'PDF & CSV',
      size: `${visits.length} Tours`,
      icon: CalendarCheck,
      iconColor: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      description: 'Prospective buyer inspection schedules, booked open houses, and virtual walkthrough requests.',
      onExportCSV: () => handleExportVisits('csv'),
      onExportPDF: () => handleExportVisits('pdf')
    },
    {
      id: 4,
      title: 'Property Inventory & Valuation Report',
      period: 'YTD 2026',
      format: 'PDF & CSV',
      size: `${properties.length} Properties`,
      icon: Building2,
      iconColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      description: 'Active property listings, asset valuations, category distribution, and availability stats.',
      onExportCSV: () => handleExportInventory('csv'),
      onExportPDF: () => handleExportInventory('pdf')
    }
  ];

  // Filter preview table items
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = searchTerm.toLowerCase();
      return (
        (o.orderId || o.id || '').toLowerCase().includes(q) ||
        (o.customer || o.customerDetails?.name || '').toLowerCase().includes(q) ||
        (o.item || o.property?.title || '').toLowerCase().includes(q) ||
        (o.status || '').toLowerCase().includes(q)
      );
    });
  }, [orders, searchTerm]);

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const q = searchTerm.toLowerCase();
      return (
        (p.title || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.location || '').toLowerCase().includes(q) ||
        (p.status || '').toLowerCase().includes(q)
      );
    });
  }, [properties, searchTerm]);

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((i) => {
      const q = searchTerm.toLowerCase();
      return (
        (i.client || i.name || '').toLowerCase().includes(q) ||
        (i.property || '').toLowerCase().includes(q) ||
        (i.email || '').toLowerCase().includes(q) ||
        (i.status || '').toLowerCase().includes(q)
      );
    });
  }, [inquiries, searchTerm]);

  const filteredVisits = useMemo(() => {
    return visits.filter((v) => {
      const q = searchTerm.toLowerCase();
      return (
        (v.visitor || v.name || '').toLowerCase().includes(q) ||
        (v.property || '').toLowerCase().includes(q) ||
        (v.tourType || '').toLowerCase().includes(q) ||
        (v.status || '').toLowerCase().includes(q)
      );
    });
  }, [visits, searchTerm]);

  return (
    <div
      className={`space-y-7 max-w-7xl mx-auto transition-colors duration-200 ${
        isDark ? 'text-white' : 'text-slate-900'
      }`}
    >
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-xs tracking-wide animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={18} className="text-white shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-black/8 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1
              className={`text-2xl font-black tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              System &amp; Financial Reports
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${
                isDark
                  ? 'bg-neutral-900 text-brand border-neutral-800'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              Live Data Audit
            </span>
          </div>
          <p
            className={`text-xs font-medium mt-1 ${
              isDark ? 'text-gray-400' : 'text-slate-500'
            }`}
          >
            Export certified audit summaries, transaction reports, portfolio valuations, and performance analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadAllData}
            disabled={loading}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 shadow-2xs ${
              isDark
                ? 'bg-neutral-900 hover:bg-neutral-800 text-gray-200 border-neutral-800'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="Refresh Report Data"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-brand' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={() => handleExportRevenue('pdf')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
              isDark
                ? 'bg-white hover:bg-neutral-200 text-black'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <Printer size={14} />
            <span>Print Master Ledger</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div
          className={`p-4 rounded-2xl border transition-all shadow-xs ${
            isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-gray-400' : 'text-slate-500'
              }`}
            >
              Audited Revenue
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-2 text-xl font-black">
            {formatCurrency(metrics.totalRevenue)}
          </div>
          <div
            className={`text-[11px] mt-1 font-medium flex items-center gap-1 ${
              isDark ? 'text-gray-400' : 'text-slate-500'
            }`}
          >
            <span className="text-emerald-500 font-bold">{formatCurrency(metrics.totalTokenCollected)}</span> tokens secured
          </div>
        </div>

        {/* Metric 2 */}
        <div
          className={`p-4 rounded-2xl border transition-all shadow-xs ${
            isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-gray-400' : 'text-slate-500'
              }`}
            >
              Portfolio Valuation
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Building2 size={16} />
            </div>
          </div>
          <div className="mt-2 text-xl font-black">
            {formatCurrency(metrics.portfolioValuation)}
          </div>
          <div
            className={`text-[11px] mt-1 font-medium ${
              isDark ? 'text-gray-400' : 'text-slate-500'
            }`}
          >
            Across <span className="font-bold">{metrics.totalProperties}</span> active &amp; registered assets
          </div>
        </div>

        {/* Metric 3 */}
        <div
          className={`p-4 rounded-2xl border transition-all shadow-xs ${
            isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-gray-400' : 'text-slate-500'
              }`}
            >
              Leads &amp; Inquiries
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-2 text-xl font-black">{metrics.totalInquiries}</div>
          <div
            className={`text-[11px] mt-1 font-medium ${
              isDark ? 'text-gray-400' : 'text-slate-500'
            }`}
          >
            <span className="text-blue-500 font-bold">{metrics.completedInquiries}</span> inquiries closed
          </div>
        </div>

        {/* Metric 4 */}
        <div
          className={`p-4 rounded-2xl border transition-all shadow-xs ${
            isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-gray-400' : 'text-slate-500'
              }`}
            >
              Scheduled Visits
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <CalendarCheck size={16} />
            </div>
          </div>
          <div className="mt-2 text-xl font-black">{metrics.totalVisits}</div>
          <div
            className={`text-[11px] mt-1 font-medium ${
              isDark ? 'text-gray-400' : 'text-slate-500'
            }`}
          >
            Property tours &amp; inspections
          </div>
        </div>
      </div>

      {/* The 4 Core Report Cards (Fixed light & dark themes + real exports) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2
            className={`text-sm font-extrabold uppercase tracking-wider ${
              isDark ? 'text-gray-300' : 'text-slate-700'
            }`}
          >
            Standard Regulatory &amp; Financial Statements
          </h2>
          <span
            className={`text-xs ${
              isDark ? 'text-gray-400' : 'text-slate-500'
            }`}
          >
            Select a report to download in CSV spreadsheet or print-ready PDF
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportCards.map((rep) => {
            const IconComponent = rep.icon;
            return (
              <div
                key={rep.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 shadow-xs group ${
                  isDark
                    ? 'bg-neutral-900/70 hover:bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                    : 'bg-white hover:bg-slate-50/50 border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl border shrink-0 ${rep.iconColor}`}>
                    <IconComponent size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-sm font-black truncate ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {rep.title}
                    </h3>
                    <p
                      className={`text-xs mt-1 line-clamp-2 leading-relaxed ${
                        isDark ? 'text-gray-400' : 'text-slate-500'
                      }`}
                    >
                      {rep.description}
                    </p>
                    <div
                      className={`text-[11px] mt-2.5 flex items-center gap-2 font-medium ${
                        isDark ? 'text-gray-400' : 'text-slate-500'
                      }`}
                    >
                      <span className="flex items-center gap-1 font-semibold">
                        <Calendar size={12} className="text-brand shrink-0" />
                        {rep.period}
                      </span>
                      <span>•</span>
                      <span className="font-semibold">{rep.format}</span>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                        {rep.size}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div
                  className={`pt-3 border-t flex items-center justify-between gap-2 ${
                    isDark ? 'border-neutral-800' : 'border-slate-100'
                  }`}
                >
                  <button
                    onClick={rep.onExportPDF}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      isDark
                        ? 'bg-neutral-800/80 hover:bg-neutral-800 text-gray-200 border-neutral-700'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Printer size={13} />
                    <span>Print / PDF</span>
                  </button>

                  <button
                    onClick={rep.onExportCSV}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer shadow-2xs ${
                      isDark
                        ? 'bg-white hover:bg-neutral-200 text-black border-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
                    }`}
                  >
                    <Download size={13} />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Report Builder & Filter Box */}
      <div
        className={`p-5 rounded-2xl border transition-all shadow-xs ${
          isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-slate-200/90'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-brand" />
              <h3
                className={`text-sm font-extrabold ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Custom Report Generator
              </h3>
            </div>
            <p
              className={`text-xs mt-0.5 ${
                isDark ? 'text-gray-400' : 'text-slate-500'
              }`}
            >
              Filter target records, select time horizon, and generate instant export files.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category */}
            <div className="flex items-center gap-1.5">
              <span
                className={`text-xs font-bold ${
                  isDark ? 'text-gray-400' : 'text-slate-500'
                }`}
              >
                Scope:
              </span>
              <select
                value={customReportType}
                onChange={(e) => setCustomReportType(e.target.value)}
                className={`text-xs font-semibold px-3 py-2 rounded-xl border focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-neutral-950 text-white border-neutral-700'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white'
                }`}
              >
                <option value="financial">Financial &amp; Revenue</option>
                <option value="inventory">Property Inventory</option>
                <option value="inquiries">Leads &amp; Inquiries</option>
                <option value="visits">Site Visits &amp; Tours</option>
                <option value="all">Comprehensive Master Audit</option>
              </select>
            </div>

            {/* Timeframe */}
            <div className="flex items-center gap-1.5">
              <span
                className={`text-xs font-bold ${
                  isDark ? 'text-gray-400' : 'text-slate-500'
                }`}
              >
                Period:
              </span>
              <select
                value={customDateRange}
                onChange={(e) => setCustomDateRange(e.target.value)}
                className={`text-xs font-semibold px-3 py-2 rounded-xl border focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-neutral-950 text-white border-neutral-700'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white'
                }`}
              >
                <option value="All Time">All Time Records</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="This Quarter">Current Quarter (Q4 2026)</option>
                <option value="YTD 2026">Year-to-Date 2026</option>
              </select>
            </div>

            {/* Format */}
            <div className="flex items-center gap-1.5">
              <span
                className={`text-xs font-bold ${
                  isDark ? 'text-gray-400' : 'text-slate-500'
                }`}
              >
                Format:
              </span>
              <select
                value={customFormat}
                onChange={(e) => setCustomFormat(e.target.value)}
                className={`text-xs font-semibold px-3 py-2 rounded-xl border focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-neutral-950 text-white border-neutral-700'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white'
                }`}
              >
                <option value="csv">CSV Spreadsheet (.csv)</option>
                <option value="pdf">Printable Statement (PDF)</option>
                <option value="json">Raw Data API (.json)</option>
              </select>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateCustomReport}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                isDark
                  ? 'bg-brand hover:bg-brand-dark text-white'
                  : 'bg-brand hover:bg-brand-dark text-white'
              }`}
            >
              {customFormat === 'csv' && <FileSpreadsheet size={14} />}
              {customFormat === 'pdf' && <Printer size={14} />}
              {customFormat === 'json' && <FileCode size={14} />}
              <span>Generate &amp; Download</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Live Data Preview Table */}
      <div
        className={`rounded-2xl border overflow-hidden shadow-xs transition-colors ${
          isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-slate-200/90'
        }`}
      >
        {/* Table Top Controls & Tab Switcher */}
        <div
          className={`p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 ${
            isDark ? 'border-neutral-800 bg-neutral-950/40' : 'border-slate-100 bg-slate-50/60'
          }`}
        >
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => {
                setActiveTab('orders');
                setSearchTerm('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'orders'
                  ? isDark
                    ? 'bg-white text-black shadow-2xs'
                    : 'bg-slate-900 text-white shadow-2xs'
                  : isDark
                  ? 'text-gray-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <DollarSign size={13} />
              <span>Revenue Transactions ({orders.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('inventory');
                setSearchTerm('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'inventory'
                  ? isDark
                    ? 'bg-white text-black shadow-2xs'
                    : 'bg-slate-900 text-white shadow-2xs'
                  : isDark
                  ? 'text-gray-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 size={13} />
              <span>Property Inventory ({properties.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('inquiries');
                setSearchTerm('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'inquiries'
                  ? isDark
                    ? 'bg-white text-black shadow-2xs'
                    : 'bg-slate-900 text-white shadow-2xs'
                  : isDark
                  ? 'text-gray-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users size={13} />
              <span>Leads &amp; Inquiries ({inquiries.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('visits');
                setSearchTerm('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'visits'
                  ? isDark
                    ? 'bg-white text-black shadow-2xs'
                    : 'bg-slate-900 text-white shadow-2xs'
                  : isDark
                  ? 'text-gray-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarCheck size={13} />
              <span>Site Visits ({visits.length})</span>
            </button>
          </div>

          {/* Search inside active table */}
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-60">
              <Search
                size={14}
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  isDark ? 'text-gray-500' : 'text-slate-400'
                }`}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search active view..."
                className={`w-full text-xs font-medium rounded-xl pl-9 pr-3 py-1.5 border transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white placeholder-gray-500 border-neutral-700 focus:border-brand'
                    : 'bg-white text-slate-900 placeholder-slate-400 border-slate-200 focus:border-brand'
                }`}
              />
            </div>

            <button
              onClick={() => {
                if (activeTab === 'orders') handleExportRevenue('csv');
                else if (activeTab === 'inventory') handleExportInventory('csv');
                else if (activeTab === 'inquiries') handleExportInquiries('csv');
                else if (activeTab === 'visits') handleExportVisits('csv');
              }}
              className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                isDark
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-gray-200 border-neutral-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title="Download Current Table View (CSV)"
            >
              <Download size={14} />
            </button>
          </div>
        </div>

        {/* Tab 1: Orders Table */}
        {activeTab === 'orders' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead
                className={`text-[11px] font-bold uppercase tracking-wider border-b ${
                  isDark
                    ? 'bg-neutral-950 text-gray-400 border-neutral-800'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                <tr>
                  <th className="py-3 px-4">Booking / Order ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Creator & Split</th>
                  <th className="py-3 px-4 text-right">Token Paid</th>
                  <th className="py-3 px-4 text-right">Total Price</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isDark ? 'divide-neutral-800' : 'divide-slate-100'
                }`}
              >
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((ord) => (
                    <tr
                      key={ord.orderId || ord.id}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-neutral-800/40' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-brand">
                        {ord.orderId || ord.id}
                      </td>
                      <td
                        className={`py-3 px-4 ${
                          isDark ? 'text-gray-400' : 'text-slate-500'
                        }`}
                      >
                        {ord.date || ord.createdAt?.slice(0, 10) || '2026-10-18'}
                      </td>
                      <td className="py-3 px-4 font-bold">
                        <div>{ord.customer || ord.customerDetails?.name || 'Private Buyer'}</div>
                        <div
                          className={`text-[10px] font-normal ${
                            isDark ? 'text-gray-500' : 'text-slate-400'
                          }`}
                        >
                          {ord.email || ord.customerDetails?.email || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {ord.item || ord.property?.title || 'Luxury Estate'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold flex items-center gap-1.5 flex-wrap">
                          <span>{ord.propertyOwner?.name || ord.advisor || 'Main Admin'}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            (ord.propertyOwner?.role === 'Sub-Admin' || ord.paymentSplit?.splitType === 'SUBADMIN_90_10')
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {(ord.propertyOwner?.role === 'Sub-Admin' || ord.paymentSplit?.splitType === 'SUBADMIN_90_10') ? '90/10' : '100% Admin'}
                          </span>
                        </div>
                        {ord.paymentSplit && ord.paymentSplit.splitType === 'SUBADMIN_90_10' && (
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            Sub-Admin: ${ord.paymentSplit.subAdminAmount?.toLocaleString()} | Admin: ${ord.paymentSplit.superAdminAmount?.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-500 whitespace-nowrap">
                        {getOrderToken(ord)}
                      </td>
                      <td className="py-3 px-4 text-right font-black whitespace-nowrap">
                        {getOrderTotal(ord)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                            (ord.status || '').toLowerCase() === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                          }`}
                        >
                          {ord.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-10 text-center text-xs text-gray-400 font-medium"
                    >
                      No revenue transactions match "{searchTerm}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Property Inventory Table */}
        {activeTab === 'inventory' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead
                className={`text-[11px] font-bold uppercase tracking-wider border-b ${
                  isDark
                    ? 'bg-neutral-950 text-gray-400 border-neutral-800'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                <tr>
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-right">Valuation / Price</th>
                  <th className="py-3 px-4 text-center">Beds / Baths</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isDark ? 'divide-neutral-800' : 'divide-slate-100'
                }`}
              >
                {filteredProperties.length > 0 ? (
                  filteredProperties.map((prop) => (
                    <tr
                      key={prop._id || prop.id}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-neutral-800/40' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3 px-4 font-bold">
                        <div className="flex items-center gap-2.5">
                          {prop.image && (
                            <img
                              src={prop.image}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover shrink-0"
                            />
                          )}
                          <span>{prop.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-gray-300">
                          {prop.category || 'Residential'}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-4 ${
                          isDark ? 'text-gray-400' : 'text-slate-500'
                        }`}
                      >
                        {prop.location || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right font-black">
                        {prop.priceNumber
                          ? `$${prop.priceNumber.toLocaleString()}`
                          : prop.price}
                      </td>
                      <td className="py-3 px-4 text-center font-medium">
                        {prop.beds || '-'} bd • {prop.baths || '-'} ba
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                            (prop.status || '').toLowerCase() === 'active'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}
                        >
                          {prop.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-xs text-gray-400 font-medium"
                    >
                      No property records match "{searchTerm}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Leads & Inquiries Table */}
        {activeTab === 'inquiries' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead
                className={`text-[11px] font-bold uppercase tracking-wider border-b ${
                  isDark
                    ? 'bg-neutral-950 text-gray-400 border-neutral-800'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Prospect Client</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Property of Interest</th>
                  <th className="py-3 px-4">Inquiry Note</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isDark ? 'divide-neutral-800' : 'divide-slate-100'
                }`}
              >
                {filteredInquiries.length > 0 ? (
                  filteredInquiries.map((inq) => (
                    <tr
                      key={inq._id || inq.id}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-neutral-800/40' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td
                        className={`py-3 px-4 whitespace-nowrap ${
                          isDark ? 'text-gray-400' : 'text-slate-500'
                        }`}
                      >
                        {inq.createdAt?.slice(0, 10) || inq.date || '2026-10-21'}
                      </td>
                      <td className="py-3 px-4 font-bold">
                        {inq.client || inq.name || 'Anonymous Prospect'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div>{inq.email || 'N/A'}</div>
                        <div
                          className={`text-[10px] ${
                            isDark ? 'text-gray-500' : 'text-slate-400'
                          }`}
                        >
                          {inq.phone || ''}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-brand">
                        {inq.property || 'General Portfolio'}
                      </td>
                      <td
                        className={`py-3 px-4 max-w-xs truncate ${
                          isDark ? 'text-gray-300' : 'text-slate-600'
                        }`}
                      >
                        {inq.message || 'General buyer inquiry submitted.'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                            (inq.status || '').toLowerCase() === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                          }`}
                        >
                          {inq.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-xs text-gray-400 font-medium"
                    >
                      No inquiries match "{searchTerm}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Site Visits Table */}
        {activeTab === 'visits' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead
                className={`text-[11px] font-bold uppercase tracking-wider border-b ${
                  isDark
                    ? 'bg-neutral-950 text-gray-400 border-neutral-800'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                <tr>
                  <th className="py-3 px-4">Scheduled Date</th>
                  <th className="py-3 px-4">Time Slot</th>
                  <th className="py-3 px-4">Visitor Name</th>
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Tour Modality</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isDark ? 'divide-neutral-800' : 'divide-slate-100'
                }`}
              >
                {filteredVisits.length > 0 ? (
                  filteredVisits.map((v) => (
                    <tr
                      key={v._id || v.id}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-neutral-800/40' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3 px-4 font-bold">{v.date}</td>
                      <td
                        className={`py-3 px-4 ${
                          isDark ? 'text-gray-400' : 'text-slate-500'
                        }`}
                      >
                        {v.timeSlot}
                      </td>
                      <td className="py-3 px-4 font-bold">
                        <div>{v.visitor || v.name}</div>
                        <div
                          className={`text-[10px] font-normal ${
                            isDark ? 'text-gray-500' : 'text-slate-400'
                          }`}
                        >
                          {v.phone || ''}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-brand">
                        {v.property}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-500/10 text-purple-500 border border-purple-500/20">
                          {v.tourType || 'In-Person Tour'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                            (v.status || '').toLowerCase() === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                          }`}
                        >
                          {v.status || 'Confirmed'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-xs text-gray-400 font-medium"
                    >
                      No site visits match "{searchTerm}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer Info */}
        <div
          className={`p-3.5 border-t flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 ${
            isDark
              ? 'border-neutral-800 bg-neutral-950/40 text-gray-400'
              : 'border-slate-100 bg-slate-50/60 text-slate-500'
          }`}
        >
          <div>
            Showing{' '}
            <span className="font-bold">
              {activeTab === 'orders'
                ? filteredOrders.length
                : activeTab === 'inventory'
                ? filteredProperties.length
                : activeTab === 'inquiries'
                ? filteredInquiries.length
                : filteredVisits.length}
            </span>{' '}
            verified records in active view
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (activeTab === 'orders') handleExportRevenue('pdf');
                else if (activeTab === 'inventory') handleExportInventory('pdf');
                else if (activeTab === 'inquiries') handleExportInquiries('pdf');
                else if (activeTab === 'visits') handleExportVisits('pdf');
              }}
              className="hover:underline font-bold text-brand cursor-pointer flex items-center gap-1"
            >
              <span>Print current tab</span>
              <ArrowUpRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
