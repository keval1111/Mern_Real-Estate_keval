import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  ShieldCheck,
  Plus,
  Key,
  Trash2,
  Search,
  UserCheck,
  Building2,
  DollarSign,
  Users,
  CheckCircle2,
  Mail,
  ShieldAlert,
  RefreshCw,
  Lock,
  Sparkles,
  FileCheck,
  CreditCard,
  Clock,
  AlertTriangle,
  Eye,
  Check,
  X,
  ExternalLink,
  Sliders,
  Settings2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { userApi, kycApi } from '../services/api';

// Default initial team members if no sub-admins exist yet
const INITIAL_SUB_ADMINS = [
  {
    id: 'sub-1',
    name: 'Vikram Malhotra',
    email: 'vikram.advisor@modernrealestate.com',
    role: 'Super Admin',
    permissions: 'Full Access (All Modules)',
    department: 'Legal & Executive Conveyancing',
    phone: '+91 98200 11223',
    status: 'Active',
    lastActive: 'Online Now',
    kycStatus: 'Approved',
  },
  {
    id: 'sub-2',
    name: 'Ananya Deshmukh',
    email: 'ananya.legal@modernrealestate.com',
    role: 'Sub-Admin',
    permissions: 'Bookings, Financial Reports & Escrow',
    department: 'Escrow & Financial Audit',
    phone: '+91 98110 55443',
    status: 'Active',
    lastActive: '2 hours ago',
    kycStatus: 'Approved',
    kycDetails: {
      fullName: 'Ananya Deshmukh',
      dob: '1990-11-20',
      phone: '+91 98110 55443',
      residentialAddress: 'Flat 1204, Lodha Bellissimo, Mahalaxmi, Mumbai',
      documentType: 'Aadhaar',
      documentNumber: '9921 4455 6677',
      bankName: 'ICICI Bank',
      accountHolderName: 'Ananya Deshmukh',
      accountNumber: '001205004432',
      ifscCode: 'ICIC0000012',
      upiId: 'ananya@icici',
      submittedAt: '2026-03-10T10:00:00Z',
    },
  },
  {
    id: 'sub-3',
    name: 'Rohit Sharma (Sub-Admin)',
    email: 'subadmin.pending@realestate.com',
    role: 'Sub-Admin',
    permissions: 'Manage Listings, Uploads & Categories',
    department: 'Listing Management',
    phone: '+91 98765 43210',
    status: 'Active',
    lastActive: '10 mins ago',
    kycStatus: 'Pending',
    kycDetails: {
      fullName: 'Rohit Sharma',
      dob: '1992-05-15',
      phone: '+91 98765 43210',
      residentialAddress: 'B-402, Royal Palms, Goregaon East, Mumbai',
      documentType: 'Aadhaar Card',
      documentNumber: '8876 5432 1098',
      documentFileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      bankName: 'HDFC Bank',
      accountHolderName: 'Rohit Sharma',
      accountNumber: '501004329871',
      ifscCode: 'HDFC0001234',
      upiId: 'rohitsharma@okhdfcbank',
      cancelledChequeUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
      submittedAt: new Date().toISOString(),
    },
  },
  {
    id: 'sub-4',
    name: 'Pooja Verma',
    email: 'subadmin.new@realestate.com',
    role: 'Sub-Admin',
    permissions: 'Leads, Inquiries, Chat & Site Visits',
    department: 'Client Relations',
    phone: '+91 98220 12345',
    status: 'Active',
    lastActive: 'Just registered',
    kycStatus: 'Not_Submitted',
    kycDetails: {},
  }
];

const SubAdmins = () => {
  const { isDark } = useTheme();

  const [admins, setAdmins] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_subadmins');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_SUB_ADMINS;
  });

  const [loading, setLoading] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [kycFilter, setKycFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Property Editor');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Listing Management');
  const [selectedPermissions, setSelectedPermissions] = useState([
    'Manage Properties',
    'View Leads'
  ]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const { token } = useAuth();
  const [selectedReviewSubAdmin, setSelectedReviewSubAdmin] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [reviewing, setReviewing] = useState(false);

  // Granular Access Permissions Modal for Sub-Admin
  const [selectedPermsSubAdmin, setSelectedPermsSubAdmin] = useState(null);
  const [permsForm, setPermsForm] = useState({
    canViewAllProperties: false,
    canManageAllProperties: false,
    canViewAllOrders: false,
    canViewAllReviews: false,
    canAccessMarketing: false,
    canAccessCustomers: false,
    canAccessReports: false,
    canAccessAnalytics: false,
    canAccessCoupons: false,
  });
  const [savingPerms, setSavingPerms] = useState(false);

  const handleOpenPermsModal = (subAdmin) => {
    setSelectedPermsSubAdmin(subAdmin);
    setPermsForm({
      canViewAllProperties: Boolean(subAdmin.accessPermissions?.canViewAllProperties),
      canManageAllProperties: Boolean(subAdmin.accessPermissions?.canManageAllProperties),
      canViewAllOrders: Boolean(subAdmin.accessPermissions?.canViewAllOrders),
      canViewAllReviews: Boolean(subAdmin.accessPermissions?.canViewAllReviews),
      canAccessMarketing: Boolean(subAdmin.accessPermissions?.canAccessMarketing),
      canAccessCustomers: Boolean(subAdmin.accessPermissions?.canAccessCustomers),
      canAccessReports: Boolean(subAdmin.accessPermissions?.canAccessReports),
      canAccessAnalytics: Boolean(subAdmin.accessPermissions?.canAccessAnalytics),
      canAccessCoupons: Boolean(subAdmin.accessPermissions?.canAccessCoupons),
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedPermsSubAdmin) return;
    setSavingPerms(true);
    try {
      const targetId = selectedPermsSubAdmin.id || selectedPermsSubAdmin._id;
      if (targetId && !String(targetId).startsWith('sub-')) {
        await userApi.updatePermissions(targetId, {
          accessPermissions: permsForm,
        });
      }

      const updated = admins.map((adm) =>
        adm.id === selectedPermsSubAdmin.id || adm.email === selectedPermsSubAdmin.email
          ? { ...adm, accessPermissions: permsForm }
          : adm
      );
      setAdmins(updated);
      localStorage.setItem('admin_subadmins', JSON.stringify(updated));

      // Also update local registered cache if present
      const regUsers = JSON.parse(localStorage.getItem('admin_registered_subadmins') || '[]');
      const updatedReg = regUsers.map((u) =>
        u.email === selectedPermsSubAdmin.email ? { ...u, accessPermissions: permsForm } : u
      );
      localStorage.setItem('admin_registered_subadmins', JSON.stringify(updatedReg));

      // Update current logged-in user in localStorage if editing self
      const currentUser = JSON.parse(localStorage.getItem('admin_user') || 'null');
      if (currentUser && (currentUser._id === targetId || currentUser.id === targetId || currentUser.email === selectedPermsSubAdmin.email)) {
        currentUser.accessPermissions = permsForm;
        localStorage.setItem('admin_user', JSON.stringify(currentUser));
      }

      showToast(`Access permissions updated for ${selectedPermsSubAdmin.name}!`);
      setSelectedPermsSubAdmin(null);
    } catch (err) {
      showToast(`Error updating permissions: ${err.message}`);
    } finally {
      setSavingPerms(false);
    }
  };

  // Sync / Load users from Backend API & Registered Cache
  const loadUsersFromBackend = async () => {
    setLoading(true);
    try {
      const backendUsers = await userApi.getAll();
      const kycRequests = await kycApi.getAllRequests(token);

      const allUsers = Array.isArray(backendUsers) && backendUsers.length > 0 ? backendUsers : [];
      const kycMap = new Map();
      if (Array.isArray(kycRequests)) {
        kycRequests.forEach((k) => kycMap.set((k.email || '').toLowerCase(), k));
      }

      // Check locally registered cache
      const cachedSubAdmins = JSON.parse(
        localStorage.getItem('admin_registered_subadmins') || '[]'
      );

      const staffUsers = allUsers.filter(
        (u) =>
          u.role === 'Super Admin' ||
          u.role === 'Sub-Admin' ||
          u.role === 'Staff' ||
          u.role === 'Property Editor' ||
          u.role === 'Finance Admin' ||
          (u.email && u.email.includes('admin'))
      );

      const combined = [...staffUsers, ...cachedSubAdmins];

      if (combined.length > 0) {
        const mapped = combined.map((su) => {
          const kycInfo = kycMap.get((su.email || '').toLowerCase()) || su;
          return {
            id: su._id || su.id,
            name: su.name,
            email: su.email,
            role: su.role || 'Sub-Admin',
            permissions:
              su.permissions ||
              (su.role === 'Super Admin'
                ? 'Full Access (All Modules)'
                : 'Manage Properties & Bookings'),
            accessPermissions: su.accessPermissions || {
              canViewAllProperties: false,
              canManageAllProperties: false,
              canViewAllOrders: false,
              canViewAllReviews: false,
            },
            department: su.department || 'Listing Management',
            phone: su.phone || '+91 98000 00000',
            status: su.status || 'Active',
            kycStatus: kycInfo.kycStatus || su.kycStatus || (su.role === 'Super Admin' ? 'Approved' : 'Not_Submitted'),
            kycDetails: kycInfo.kycDetails || su.kycDetails || {},
            lastActive: su.updatedAt ? new Date(su.updatedAt).toLocaleDateString() : 'Active',
          };
        });

        setAdmins((prev) => {
          const ids = new Set(mapped.map((m) => m.email.toLowerCase()));
          const rest = prev.filter((p) => !ids.has(p.email.toLowerCase()));
          const merged = [...mapped, ...rest];
          localStorage.setItem('admin_subadmins', JSON.stringify(merged));
          return merged;
        });
      }
    } catch (err) {
      console.warn('Backend staff load notice:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveKyc = async (subAdmin) => {
    setReviewing(true);
    try {
      await kycApi.review(subAdmin.id || subAdmin._id, 'Approved', '', token);
      const updated = admins.map((adm) =>
        adm.id === subAdmin.id || adm.email === subAdmin.email
          ? {
              ...adm,
              kycStatus: 'Approved',
              kycDetails: { ...adm.kycDetails, approvedAt: new Date().toISOString() },
            }
          : adm
      );
      setAdmins(updated);
      localStorage.setItem('admin_subadmins', JSON.stringify(updated));

      const existing = JSON.parse(localStorage.getItem('admin_registered_subadmins') || '[]');
      const updatedReg = existing.map((u) =>
        u.email === subAdmin.email ? { ...u, kycStatus: 'Approved' } : u
      );
      localStorage.setItem('admin_registered_subadmins', JSON.stringify(updatedReg));

      showToast(`KYC Approved for ${subAdmin.name}! Property listings unlocked.`);
      setSelectedReviewSubAdmin(null);
    } catch (err) {
      showToast(`Failed to approve KYC: ${err.message}`);
    } finally {
      setReviewing(false);
    }
  };

  const handleRejectKyc = async (subAdmin) => {
    const reason =
      rejectionReasonInput.trim() || 'Verification documents could not be verified.';

    setReviewing(true);
    try {
      await kycApi.review(subAdmin.id || subAdmin._id, 'Rejected', reason, token);
      const updated = admins.map((adm) =>
        adm.id === subAdmin.id || adm.email === subAdmin.email
          ? {
              ...adm,
              kycStatus: 'Rejected',
              kycDetails: { ...adm.kycDetails, rejectionReason: reason },
            }
          : adm
      );
      setAdmins(updated);
      localStorage.setItem('admin_subadmins', JSON.stringify(updated));

      const existing = JSON.parse(localStorage.getItem('admin_registered_subadmins') || '[]');
      const updatedReg = existing.map((u) =>
        u.email === subAdmin.email
          ? { ...u, kycStatus: 'Rejected', kycDetails: { ...u.kycDetails, rejectionReason: reason } }
          : u
      );
      localStorage.setItem('admin_registered_subadmins', JSON.stringify(updatedReg));

      showToast(`KYC Rejected for ${subAdmin.name}. Reason: ${reason}`);
      setSelectedReviewSubAdmin(null);
      setRejectionReasonInput('');
    } catch (err) {
      showToast(`Failed to reject KYC: ${err.message}`);
    } finally {
      setReviewing(false);
    }
  };

  const handleResetDemoKyc = async () => {
    try {
      await kycApi.resetDemo();
      const pendingKycData = {
        fullName: 'Rohit Sharma',
        dob: '1992-05-15',
        phone: '+91 98765 43210',
        residentialAddress: 'B-402, Royal Palms, Goregaon East, Mumbai - 400063',
        documentType: 'Aadhaar Card',
        documentNumber: '8876 5432 1098',
        documentFileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
        bankName: 'HDFC Bank',
        accountHolderName: 'Rohit Sharma',
        accountNumber: '501004329871',
        ifscCode: 'HDFC0001234',
        upiId: 'rohitsharma@okhdfcbank',
        cancelledChequeUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
        submittedAt: new Date().toISOString(),
        rejectionReason: '',
      };

      setAdmins((prev) => {
        const updated = prev.map((adm) =>
          adm.email === 'subadmin.pending@realestate.com'
            ? { ...adm, kycStatus: 'Pending', kycDetails: pendingKycData }
            : adm
        );
        localStorage.setItem('admin_subadmins', JSON.stringify(updated));
        return updated;
      });

      const regList = JSON.parse(localStorage.getItem('admin_registered_subadmins') || '[]');
      const updatedReg = regList.map((u) =>
        u.email === 'subadmin.pending@realestate.com'
          ? { ...u, kycStatus: 'Pending', kycDetails: pendingKycData }
          : u
      );
      localStorage.setItem('admin_registered_subadmins', JSON.stringify(updatedReg));

      showToast('Sub-Admin Rohit Sharma reset to Pending KYC! You can now test Review.');
      setKycFilter('Pending');
      await loadUsersFromBackend();
    } catch (err) {
      showToast('Failed to reset demo KYC: ' + err.message);
    }
  };

  useEffect(() => {
    loadUsersFromBackend();
  }, []);


  const handleTogglePermission = (perm) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const permissionsString =
      role === 'Super Admin'
        ? 'Full Access (All Modules)'
        : selectedPermissions.length > 0
        ? selectedPermissions.join(', ')
        : 'Restricted Access';

    const newAdmin = {
      id: `sub-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || '+91 98000 12345',
      role,
      permissions: permissionsString,
      department: department || 'Operations Team',
      lastActive: 'Just Invited',
      status: 'Active'
    };

    // Save to backend API if available
    try {
      await userApi.create({
        name: newAdmin.name,
        email: newAdmin.email,
        password: 'staffpassword123',
        phone: newAdmin.phone,
        role: newAdmin.role,
        permissions: newAdmin.permissions,
        status: 'Active'
      });
    } catch (err) {
      console.warn('API save optional:', err);
    }

    const updated = [newAdmin, ...admins];
    setAdmins(updated);
    localStorage.setItem('admin_subadmins', JSON.stringify(updated));

    // Reset Form
    setName('');
    setEmail('');
    setPhone('');
    setRole('Property Editor');
    setShowInvite(false);
    showToast(`🎉 Sub-Admin invitation sent to ${newAdmin.email}!`);
  };

  const handleDelete = async (id) => {
    const target = admins.find((a) => a.id === id);
    if (target?.role === 'Super Admin' && admins.filter((a) => a.role === 'Super Admin').length <= 1) {
      alert('Cannot delete the primary Super Admin account.');
      return;
    }

    if (window.confirm(`Are you sure you want to revoke portal access for "${target?.name || 'this staff member'}"?`)) {
      try {
        if (id && !String(id).startsWith('sub-')) {
          await userApi.delete(id);
        }
      } catch {}

      const updated = admins.filter((a) => a.id !== id);
      setAdmins(updated);
      localStorage.setItem('admin_subadmins', JSON.stringify(updated));
      showToast('Staff member access revoked.');
    }
  };

  const toggleStatus = (id) => {
    const updated = admins.map((a) => {
      if (a.id === id) {
        const next = a.status === 'Active' ? 'Inactive' : 'Active';
        return { ...a, status: next };
      }
      return a;
    });
    setAdmins(updated);
    localStorage.setItem('admin_subadmins', JSON.stringify(updated));
  };

  // Filtered List
  const filteredAdmins = useMemo(() => {
    return admins.filter((a) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        (a.department || '').toLowerCase().includes(q);

      const matchesRole = roleFilter === 'All' ? true : a.role === roleFilter;
      const matchesKyc = kycFilter === 'All' ? true : a.kycStatus === kycFilter;

      return matchesSearch && matchesRole && matchesKyc;
    });
  }, [admins, searchTerm, roleFilter, kycFilter]);

  // Metric counts
  const superAdminCount = admins.filter((a) => a.role === 'Super Admin').length;
  const subAdminCount = admins.filter((a) => a.role === 'Sub-Admin' || a.role === 'Property Editor').length;
  const pendingKycCount = admins.filter((a) => a.kycStatus === 'Pending').length;
  const approvedKycCount = admins.filter((a) => a.kycStatus === 'Approved').length;

  return (
    <div
      className={`space-y-6 max-w-7xl mx-auto transition-colors duration-200 ${
        isDark ? 'text-white' : 'text-slate-900'
      }`}
    >
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-xs tracking-wide animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={18} className="text-white shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-black/8 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1
              className={`text-2xl font-black tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Sub-Admins &amp; Staff Roles
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${
                isDark
                  ? 'bg-neutral-900 text-brand border-neutral-800'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              Access Control
            </span>
          </div>
          <p
            className={`text-xs font-medium mt-1 ${
              isDark ? 'text-gray-400' : 'text-slate-500'
            }`}
          >
            Delegate portal management, assign legal escrow roles, and configure granular permissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDemoKyc}
            className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isDark
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
            title="Set Rohit Sharma KYC to Pending for immediate testing"
          >
            <Clock size={13} />
            <span>Reset Demo (Set Pending KYC)</span>
          </button>

          <button
            onClick={loadUsersFromBackend}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? 'bg-neutral-900 border-neutral-800 text-gray-300 hover:bg-neutral-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="Reload Staff List"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-brand' : ''} />
          </button>

          <button
            onClick={() => setShowInvite(!showInvite)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-2xs cursor-pointer transition-all ${
              isDark
                ? 'bg-white hover:bg-neutral-200 text-black'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <Plus size={15} />
            <span>{showInvite ? 'Close Form' : 'Invite Sub-Admin'}</span>
          </button>
        </div>
      </div>

      {/* KPI Role & KYC Review Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pending KYC Requests (Clickable to view pending) */}
        <div
          onClick={() => {
            setKycFilter('Pending');
            setRoleFilter('All');
          }}
          className={`p-4 rounded-2xl border transition-all shadow-xs cursor-pointer ${
            kycFilter === 'Pending'
              ? 'border-amber-500 bg-amber-500/10 shadow-md ring-2 ring-amber-500/30'
              : isDark
              ? 'bg-neutral-900/60 border-neutral-800 hover:border-amber-500/50'
              : 'bg-white border-slate-200/90 hover:border-amber-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Pending KYC
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-2 text-xl font-black text-amber-500">{pendingKycCount}</div>
          <div
            className={`text-[11px] mt-1 font-medium ${
              isDark ? 'text-gray-400' : 'text-slate-500'
            }`}
          >
            Sub-Admins awaiting KYC review (Click to filter)
          </div>
        </div>

        {/* Card 2: Approved KYC Sub-Admins */}
        <div
          onClick={() => {
            setKycFilter('Approved');
            setRoleFilter('All');
          }}
          className={`p-4 rounded-2xl border transition-all shadow-xs cursor-pointer ${
            kycFilter === 'Approved'
              ? 'border-emerald-500 bg-emerald-500/10 shadow-md ring-2 ring-emerald-500/30'
              : isDark
              ? 'bg-neutral-900/60 border-neutral-800 hover:border-emerald-500/50'
              : 'bg-white border-slate-200/90 hover:border-emerald-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider text-emerald-500`}
            >
              Approved KYC
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="mt-2 text-xl font-black text-emerald-500">{approvedKycCount}</div>
          <div
            className={`text-[11px] mt-1 font-medium ${
              isDark ? 'text-gray-400' : 'text-slate-500'
            }`}
          >
            Authorized to add and manage properties
          </div>
        </div>

        {/* Card 3: Sub-Admins Total */}
        <div
          onClick={() => {
            setRoleFilter('Sub-Admin');
            setKycFilter('All');
          }}
          className={`p-4 rounded-2xl border transition-all shadow-xs cursor-pointer ${
            roleFilter === 'Sub-Admin'
              ? 'border-brand bg-brand/10 shadow-md ring-2 ring-brand/30'
              : isDark
              ? 'bg-neutral-900/60 border-neutral-800 hover:border-brand/50'
              : 'bg-white border-slate-200/90 hover:border-brand/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-gray-400' : 'text-slate-500'
              }`}
            >
              Sub-Admins
            </span>
            <div className="p-2 rounded-xl bg-brand/10 text-brand border border-brand/20">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-2 text-xl font-black">{subAdminCount}</div>
          <div
            className={`text-[11px] mt-1 font-medium ${
              isDark ? 'text-gray-400' : 'text-slate-500'
            }`}
          >
            Listing curators &amp; partner agents
          </div>
        </div>

        {/* Card 4: Super Admins */}
        <div
          onClick={() => {
            setRoleFilter('Super Admin');
            setKycFilter('All');
          }}
          className={`p-4 rounded-2xl border transition-all shadow-xs cursor-pointer ${
            roleFilter === 'Super Admin'
              ? 'border-purple-500 bg-purple-500/10 shadow-md ring-2 ring-purple-500/30'
              : isDark
              ? 'bg-neutral-900/60 border-neutral-800 hover:border-purple-500/50'
              : 'bg-white border-slate-200/90 hover:border-purple-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-gray-400' : 'text-slate-500'
              }`}
            >
              Super Admins
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <Shield size={16} />
            </div>
          </div>
          <div className="mt-2 text-xl font-black">{superAdminCount}</div>
          <div
            className={`text-[11px] mt-1 font-medium ${
              isDark ? 'text-gray-400' : 'text-slate-500'
            }`}
          >
            Full platform governance &amp; KYC approval
          </div>
        </div>
      </div>

      {/* Invite Sub-Admin Slide-down Form */}
      {showInvite && (
        <form
          onSubmit={handleInvite}
          className={`p-6 rounded-2xl border space-y-5 shadow-sm transition-all animate-in fade-in slide-in-from-top-3 duration-200 ${
            isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck size={18} className="text-brand" />
              <h3
                className={`text-sm font-extrabold ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Delegate New Sub-Admin / Staff Member
              </h3>
            </div>
            <span className="text-[11px] text-gray-400 font-medium">
              Sends automated access invitation credentials
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label
                className={`block text-xs font-bold mb-1.5 ${
                  isDark ? 'text-gray-300' : 'text-slate-700'
                }`}
              >
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rachel Green"
                className={`w-full rounded-xl px-3.5 py-2 text-xs border transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white border-neutral-700 focus:border-brand'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-brand'
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-bold mb-1.5 ${
                  isDark ? 'text-gray-300' : 'text-slate-700'
                }`}
              >
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rachel@estateadmin.com"
                className={`w-full rounded-xl px-3.5 py-2 text-xs border transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white border-neutral-700 focus:border-brand'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-brand'
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-bold mb-1.5 ${
                  isDark ? 'text-gray-300' : 'text-slate-700'
                }`}
              >
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98200 11223"
                className={`w-full rounded-xl px-3.5 py-2 text-xs border transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white border-neutral-700 focus:border-brand'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-brand'
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-bold mb-1.5 ${
                  isDark ? 'text-gray-300' : 'text-slate-700'
                }`}
              >
                Assigned Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={`w-full rounded-xl px-3.5 py-2 text-xs border cursor-pointer transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white border-neutral-700'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white'
                }`}
              >
                <option value="Property Editor">Property Editor (Listings)</option>
                <option value="Finance Admin">Finance Admin (Tokens &amp; Reports)</option>
                <option value="Staff">Support Staff (Leads &amp; Chat)</option>
                <option value="Super Admin">Super Admin (Full Governance)</option>
              </select>
            </div>
          </div>

          {/* Granular Permissions Checkboxes */}
          {role !== 'Super Admin' && (
            <div
              className={`p-4 rounded-xl border ${
                isDark ? 'bg-neutral-950/70 border-neutral-800' : 'bg-slate-50/80 border-slate-200/80'
              }`}
            >
              <span
                className={`text-xs font-bold block mb-2 ${
                  isDark ? 'text-gray-300' : 'text-slate-700'
                }`}
              >
                Granular Permissions Granted:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                {[
                  'Manage Properties',
                  'Process Bookings',
                  'View Financial Reports',
                  'Live Chat & Support',
                  'Manage Categories',
                  'Verify Seller Requests',
                  'Schedule Site Visits',
                  'Manage Reviews'
                ].map((perm) => (
                  <label
                    key={perm}
                    className="flex items-center gap-2 cursor-pointer select-none font-medium text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(perm)}
                      onChange={() => handleTogglePermission(perm)}
                      className="rounded accent-brand cursor-pointer"
                    />
                    <span className={isDark ? 'text-gray-300' : 'text-slate-700'}>
                      {perm}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowInvite(false)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-gray-300 border-neutral-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all shadow-xs ${
                isDark
                  ? 'bg-brand hover:bg-brand-dark text-white'
                  : 'bg-brand hover:bg-brand-dark text-white'
              }`}
            >
              Send Staff Invitation
            </button>
          </div>
        </form>
      )}

      {/* Controls & Search Filter Bar */}
      <div
        className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs transition-colors ${
          isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-slate-200/90'
        }`}
      >
        <div className="relative w-full md:w-80">
          <Search
            size={14}
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
              isDark ? 'text-gray-500' : 'text-slate-400'
            }`}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search staff by name, email, department..."
            className={`w-full text-xs font-medium rounded-xl pl-9 pr-3.5 py-2 border transition-all focus:outline-none ${
              isDark
                ? 'bg-neutral-950 text-white placeholder-gray-500 border-neutral-700 focus:border-brand'
                : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-brand'
            }`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {['All', 'Sub-Admin', 'Super Admin', 'Property Editor', 'Finance Admin', 'Staff'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                  roleFilter === r
                    ? isDark
                      ? 'bg-white text-black border-white shadow-2xs'
                      : 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : isDark
                    ? 'bg-neutral-950 text-gray-400 hover:text-white border-neutral-800'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* KYC Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 sm:ml-auto">
            <span className={`text-[10px] font-bold uppercase tracking-wider mr-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
              KYC Status:
            </span>
            {[
              { id: 'All', label: 'All' },
              { id: 'Pending', label: `Pending (${pendingKycCount})` },
              { id: 'Approved', label: `Approved (${approvedKycCount})` },
              { id: 'Rejected', label: 'Rejected' },
              { id: 'Not_Submitted', label: 'Not Submitted' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setKycFilter(item.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  kycFilter === item.id
                    ? item.id === 'Pending'
                      ? 'bg-amber-500 text-black border-amber-500 shadow-xs'
                      : item.id === 'Approved'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : isDark
                      ? 'bg-white text-black border-white shadow-xs'
                      : 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : isDark
                    ? 'bg-neutral-950 text-gray-400 hover:text-white border-neutral-800'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200'
                }`}
              >
                {item.id === 'Pending' && pendingKycCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
                )}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Staff & Sub-Admins Table */}
      <div
        className={`rounded-2xl overflow-hidden border shadow-xs transition-colors ${
          isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-slate-200/90'
        }`}
      >
        {filteredAdmins.length > 0 ? (
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
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Designated Role</th>
                  <th className="py-3 px-4">Access Permissions</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Activity</th>
                  <th className="py-3 px-4 text-center">KYC Verification</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isDark ? 'divide-neutral-800' : 'divide-slate-100'
                }`}
              >
                {filteredAdmins.map((adm) => (
                  <tr
                    key={adm.id}
                    className={`transition-colors ${
                      isDark ? 'hover:bg-neutral-800/40' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Staff Member */}
                    <td className="py-3 px-4 font-bold">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center font-black text-xs shrink-0 ${
                            adm.role === 'Super Admin'
                              ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                              : adm.role === 'Finance Admin'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              : adm.role === 'Property Editor'
                              ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}
                        >
                          {(adm.name || 'AD').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className={isDark ? 'text-white' : 'text-slate-900'}>
                            {adm.name}
                          </div>
                          <div
                            className={`text-[11px] font-normal flex items-center gap-2 ${
                              isDark ? 'text-gray-400' : 'text-slate-500'
                            }`}
                          >
                            <span>{adm.email}</span>
                            {adm.phone && <span>• {adm.phone}</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                          adm.role === 'Super Admin'
                            ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                            : adm.role === 'Finance Admin'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : adm.role === 'Property Editor'
                            ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}
                      >
                        {adm.role}
                      </span>
                    </td>

                    {/* Permissions */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1 max-w-xs">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                            isDark ? 'text-gray-300' : 'text-slate-600'
                          }`}
                          title={adm.permissions}
                        >
                          <Key size={11} className="text-brand shrink-0" />
                          <span className="truncate">{adm.permissions}</span>
                        </span>
                        {adm.role === 'Sub-Admin' && (
                          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                            {adm.accessPermissions?.canViewAllProperties ? (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                                <Eye size={10} /> All Properties View
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                <Lock size={10} /> Own Properties Only
                              </span>
                            )}
                            {adm.accessPermissions?.canManageAllProperties && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                Full Manage
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Department */}
                    <td
                      className={`py-3 px-4 font-medium ${
                        isDark ? 'text-gray-300' : 'text-slate-600'
                      }`}
                    >
                      {adm.department || 'Operations'}
                    </td>

                    {/* Activity */}
                    <td
                      className={`py-3 px-4 whitespace-nowrap ${
                        isDark ? 'text-gray-400' : 'text-slate-500'
                      }`}
                    >
                      {adm.lastActive}
                    </td>

                    {/* KYC Verification Status */}
                    <td className="py-3 px-4 text-center">
                      {adm.role === 'Super Admin' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 size={11} /> Verified
                        </span>
                      ) : adm.kycStatus === 'Approved' ? (
                        <button
                          type="button"
                          onClick={() => setSelectedReviewSubAdmin(adm)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/20 cursor-pointer"
                          title="Click to view approved details"
                        >
                          <CheckCircle2 size={11} /> Approved
                        </button>
                      ) : adm.kycStatus === 'Pending' ? (
                        <button
                          type="button"
                          onClick={() => setSelectedReviewSubAdmin(adm)}
                          className="inline-flex items-center gap-1 text-[10px] font-black text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/30 cursor-pointer animate-pulse shadow-xs"
                          title="Click to review Sub-Admin KYC"
                        >
                          <Clock size={11} /> Review KYC
                        </button>
                      ) : adm.kycStatus === 'Rejected' ? (
                        <button
                          type="button"
                          onClick={() => setSelectedReviewSubAdmin(adm)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/20 cursor-pointer"
                          title="Click to view rejection details"
                        >
                          <AlertTriangle size={11} /> Rejected
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400 bg-slate-500/10 px-2 py-0.5 rounded-full border border-slate-500/20">
                          Not Submitted
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleStatus(adm.id)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase cursor-pointer border transition-colors ${
                          adm.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20 hover:bg-neutral-500/20'
                        }`}
                        title="Click to toggle status"
                      >
                        {adm.status}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {adm.role === 'Sub-Admin' && (
                          <button
                            onClick={() => handleOpenPermsModal(adm)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer shadow-2xs ${
                              isDark
                                ? 'bg-neutral-800 border-neutral-700 hover:bg-brand hover:text-white text-gray-300'
                                : 'bg-slate-100 border-slate-200 hover:bg-brand hover:text-white text-slate-700'
                            }`}
                            title="Manage Sub-Admin Property & Data Permissions"
                          >
                            <Sliders size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(adm.id)}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Revoke Access"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 px-6 text-center flex flex-col items-center justify-center">
            <div
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-3 shadow-2xs ${
                isDark
                  ? 'bg-neutral-900 border-neutral-800 text-gray-400'
                  : 'bg-slate-100 border-slate-200 text-slate-500'
              }`}
            >
              <Shield size={24} />
            </div>
            <h3
              className={`text-sm font-bold mb-1 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              No Sub-Admins match "{searchTerm}"
            </h3>
            <p
              className={`text-xs max-w-sm mb-4 ${
                isDark ? 'text-gray-400' : 'text-slate-500'
              }`}
            >
              Try clearing your search query or reset the role filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('All');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-neutral-800 text-white border-neutral-700'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
      {/* Super Admin KYC Review Modal */}
      {selectedReviewSubAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border p-6 md:p-8 shadow-2xl relative transition-all ${
            isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-inherit mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-bold">
                  <FileCheck size={22} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold">Sub-Admin KYC & Bank Verification</h2>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    Verification review for {selectedReviewSubAdmin.name} ({selectedReviewSubAdmin.email})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedReviewSubAdmin(null);
                  setRejectionReasonInput('');
                }}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isDark ? 'border-neutral-800 hover:bg-neutral-800' : 'border-slate-200 hover:bg-slate-100'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Current Status Pill */}
            <div className="mb-6 flex items-center justify-between p-3.5 rounded-2xl bg-brand/5 border border-brand/20">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-brand" />
                <span className="text-xs font-bold">Current Verification Status:</span>
              </div>
              <span className={`text-xs font-black px-3 py-1 rounded-full border uppercase ${
                selectedReviewSubAdmin.kycStatus === 'Approved'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                  : selectedReviewSubAdmin.kycStatus === 'Pending'
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 animate-pulse'
                  : selectedReviewSubAdmin.kycStatus === 'Rejected'
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                  : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
              }`}>
                {selectedReviewSubAdmin.kycStatus ? selectedReviewSubAdmin.kycStatus.replace('_', ' ') : 'Not Submitted'}
              </span>
            </div>

            <div className="space-y-5">
              {/* 1. Personal Information */}
              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand mb-3 flex items-center gap-1.5">
                  <UserCheck size={14} /> 1. Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Full Legal Name:</span>
                    <span className="font-bold">{selectedReviewSubAdmin.kycDetails?.fullName || selectedReviewSubAdmin.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Date of Birth:</span>
                    <span className="font-bold">{selectedReviewSubAdmin.kycDetails?.dob || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Contact Phone:</span>
                    <span className="font-bold">{selectedReviewSubAdmin.kycDetails?.phone || selectedReviewSubAdmin.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Official Email:</span>
                    <span className="font-bold">{selectedReviewSubAdmin.email}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-400 block text-[10px]">Permanent Residential Address:</span>
                    <span className="font-medium">{selectedReviewSubAdmin.kycDetails?.residentialAddress || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* 2. Identity Verification Proof */}
              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand mb-3 flex items-center gap-1.5">
                  <FileCheck size={14} /> 2. Government Identification
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Document Type:</span>
                    <span className="font-bold">{selectedReviewSubAdmin.kycDetails?.documentType || 'Aadhaar Card'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">ID / Document Number:</span>
                    <span className="font-bold tracking-wider">{selectedReviewSubAdmin.kycDetails?.documentNumber || '8876 5432 1098'}</span>
                  </div>
                  <div className="sm:col-span-2 mt-1">
                    <span className="text-gray-400 block text-[10px] mb-1">Attached Document File:</span>
                    {selectedReviewSubAdmin.kycDetails?.documentFileUrl ? (
                      <a
                        href={selectedReviewSubAdmin.kycDetails.documentFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand/10 text-brand border border-brand/20 text-xs font-bold hover:bg-brand/20 transition-all cursor-pointer"
                      >
                        <ExternalLink size={14} />
                        <span>View Uploaded Government ID Proof</span>
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No document file attached</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Bank Account & Payment Processing */}
              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-500 mb-3 flex items-center gap-1.5">
                  <CreditCard size={14} /> 3. Bank Account Details (Payment Processing)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Bank Name:</span>
                    <span className="font-bold">{selectedReviewSubAdmin.kycDetails?.bankName || 'HDFC Bank'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Account Beneficiary Name:</span>
                    <span className="font-bold">{selectedReviewSubAdmin.kycDetails?.accountHolderName || selectedReviewSubAdmin.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Account Number:</span>
                    <span className="font-bold font-mono">{selectedReviewSubAdmin.kycDetails?.accountNumber || '501004329871'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">IFSC Code:</span>
                    <span className="font-bold font-mono uppercase">{selectedReviewSubAdmin.kycDetails?.ifscCode || 'HDFC0001234'}</span>
                  </div>
                  {selectedReviewSubAdmin.kycDetails?.upiId && (
                    <div className="sm:col-span-2">
                      <span className="text-gray-400 block text-[10px]">UPI VPA:</span>
                      <span className="font-bold font-mono">{selectedReviewSubAdmin.kycDetails.upiId}</span>
                    </div>
                  )}
                  <div className="sm:col-span-2 mt-1">
                    <span className="text-gray-400 block text-[10px] mb-1">Attached Cheque / Passbook Copy:</span>
                    {selectedReviewSubAdmin.kycDetails?.cancelledChequeUrl ? (
                      <a
                        href={selectedReviewSubAdmin.kycDetails.cancelledChequeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition-all cursor-pointer"
                      >
                        <ExternalLink size={14} />
                        <span>View Uploaded Cancelled Cheque / Passbook</span>
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No cancelled cheque attached</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Rejection Note input if rejecting */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Review Feedback / Rejection Note (If actioning rejection):
                </label>
                <input
                  type="text"
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="e.g. Document image is blurry, please provide a clear scan."
                  className={`w-full text-xs font-medium rounded-xl px-3.5 py-2.5 border transition-all focus:outline-none ${
                    isDark
                      ? 'bg-neutral-950 text-white border-neutral-800 focus:border-brand'
                      : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-brand'
                  }`}
                />
              </div>

              {/* Super Admin Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-inherit">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedReviewSubAdmin(null);
                    setRejectionReasonInput('');
                  }}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                    isDark ? 'bg-neutral-800 border-neutral-700 text-gray-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={reviewing}
                  onClick={() => handleRejectKyc(selectedReviewSubAdmin)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <X size={15} />
                  <span>Reject KYC</span>
                </button>
                <button
                  type="button"
                  disabled={reviewing}
                  onClick={() => handleApproveKyc(selectedReviewSubAdmin)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Check size={16} />
                  <span>Approve KYC & Authorize Sub-Admin</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Super Admin Manage Permissions Modal for Sub-Admin */}
      {selectedPermsSubAdmin && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200 ${
              isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div className={`p-5 border-b flex items-center justify-between ${
              isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand border border-brand/20 flex items-center justify-center">
                  <Sliders size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight">
                    Manage Sub-Admin Permissions
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    Control property visibility, payments, and management rights for this Sub-Admin.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPermsSubAdmin(null)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-gray-300'
                    : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <X size={16} />
              </button>
            </div>

            {/* Sub-Admin Summary Card */}
            <div className="p-6 space-y-5">
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <div className="text-sm font-extrabold">{selectedPermsSubAdmin.name}</div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    {selectedPermsSubAdmin.email}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                    selectedPermsSubAdmin.kycStatus === 'Approved'
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    KYC: {selectedPermsSubAdmin.kycStatus || 'Not Submitted'}
                  </span>
                </div>
              </div>

              {/* Permission Switches */}
              <div className="space-y-3.5">
                {/* 1. View All Properties */}
                <div className={`p-4 rounded-2xl border flex items-start justify-between gap-4 transition-colors ${
                  isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-slate-50/70 border-slate-200'
                }`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">Allow Viewing All Properties</span>
                      {permsForm.canViewAllProperties ? (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          OVERRIDE ACTIVE
                        </span>
                      ) : (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          DEFAULT ISOLATION
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] mt-1 leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                      By default, Sub-Admins only see properties added by themselves. Turn this ON to grant permission to view other Sub-Admins' properties in the Admin Panel.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPermsForm((prev) => ({
                        ...prev,
                        canViewAllProperties: !prev.canViewAllProperties,
                      }))
                    }
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 mt-1 ${
                      permsForm.canViewAllProperties ? 'bg-brand' : isDark ? 'bg-neutral-800' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        permsForm.canViewAllProperties ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* 2. Manage All Properties */}
                <div className={`p-4 rounded-2xl border flex items-start justify-between gap-4 transition-colors ${
                  isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-slate-50/70 border-slate-200'
                }`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">Allow Editing &amp; Deleting Other Properties</span>
                      {permsForm.canManageAllProperties && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          HIGH PRIVILEGE
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] mt-1 leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                      When OFF, Sub-Admin can ONLY edit or delete properties they submitted. When ON, allows modifying other Sub-Admins' property data.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPermsForm((prev) => ({
                        ...prev,
                        canManageAllProperties: !prev.canManageAllProperties,
                      }))
                    }
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 mt-1 ${
                      permsForm.canManageAllProperties ? 'bg-brand' : isDark ? 'bg-neutral-800' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        permsForm.canManageAllProperties ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* 3. Global Booking & Payment Records */}
                <div className={`p-4 rounded-2xl border flex items-start justify-between gap-4 transition-colors ${
                  isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-slate-50/70 border-slate-200'
                }`}>
                  <div className="flex-1">
                    <span className="text-xs font-bold">View Global Booking Payments</span>
                    <p className={`text-[11px] mt-1 leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                      When OFF, payment and order history is strictly scoped to bookings for properties owned by this Sub-Admin.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPermsForm((prev) => ({
                        ...prev,
                        canViewAllOrders: !prev.canViewAllOrders,
                      }))
                    }
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 mt-1 ${
                      permsForm.canViewAllOrders ? 'bg-brand' : isDark ? 'bg-neutral-800' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        permsForm.canViewAllOrders ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* 4. Global Reviews */}
                <div className={`p-4 rounded-2xl border flex items-start justify-between gap-4 transition-colors ${
                  isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-slate-50/70 border-slate-200'
                }`}>
                  <div className="flex-1">
                    <span className="text-xs font-bold">View Global Customer Reviews</span>
                    <p className={`text-[11px] mt-1 leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                      When OFF, review information is restricted strictly to feedback submitted on this Sub-Admin's properties.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPermsForm((prev) => ({
                        ...prev,
                        canViewAllReviews: !prev.canViewAllReviews,
                      }))
                    }
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 mt-1 ${
                      permsForm.canViewAllReviews ? 'bg-brand' : isDark ? 'bg-neutral-800' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        permsForm.canViewAllReviews ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* 5. Marketing Section */}
                <div className={`p-4 rounded-2xl border flex items-start justify-between gap-4 transition-colors ${
                  isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-slate-50/70 border-slate-200'
                }`}>
                  <div className="flex-1">
                    <span className="text-xs font-bold">Access Marketing &amp; Banners</span>
                    <p className={`text-[11px] mt-1 leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                      When ON, Sub-Admin can view and manage promotional marketing campaigns and hero sliders.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPermsForm((prev) => ({
                        ...prev,
                        canAccessMarketing: !prev.canAccessMarketing,
                      }))
                    }
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 mt-1 ${
                      permsForm.canAccessMarketing ? 'bg-brand' : isDark ? 'bg-neutral-800' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        permsForm.canAccessMarketing ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* 6. Customers Section */}
                <div className={`p-4 rounded-2xl border flex items-start justify-between gap-4 transition-colors ${
                  isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-slate-50/70 border-slate-200'
                }`}>
                  <div className="flex-1">
                    <span className="text-xs font-bold">Access Customer Profiles</span>
                    <p className={`text-[11px] mt-1 leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                      When ON, allows Sub-Admin to view registered client list and client communication records.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPermsForm((prev) => ({
                        ...prev,
                        canAccessCustomers: !prev.canAccessCustomers,
                      }))
                    }
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 mt-1 ${
                      permsForm.canAccessCustomers ? 'bg-brand' : isDark ? 'bg-neutral-800' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        permsForm.canAccessCustomers ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* 7. Platform Analytics */}
                <div className={`p-4 rounded-2xl border flex items-start justify-between gap-4 transition-colors ${
                  isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-slate-50/70 border-slate-200'
                }`}>
                  <div className="flex-1">
                    <span className="text-xs font-bold">Access Platform Analytics</span>
                    <p className={`text-[11px] mt-1 leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                      When ON, allows Sub-Admin to see overall platform visit statistics and traffic trends.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPermsForm((prev) => ({
                        ...prev,
                        canAccessAnalytics: !prev.canAccessAnalytics,
                      }))
                    }
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 mt-1 ${
                      permsForm.canAccessAnalytics ? 'bg-brand' : isDark ? 'bg-neutral-800' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        permsForm.canAccessAnalytics ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* 8. Reports Section */}
                <div className={`p-4 rounded-2xl border flex items-start justify-between gap-4 transition-colors ${
                  isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-slate-50/70 border-slate-200'
                }`}>
                  <div className="flex-1">
                    <span className="text-xs font-bold">Access Platform Reports</span>
                    <p className={`text-[11px] mt-1 leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                      When ON, permits exporting platform summaries, audits, and performance reports.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPermsForm((prev) => ({
                        ...prev,
                        canAccessReports: !prev.canAccessReports,
                      }))
                    }
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 mt-1 ${
                      permsForm.canAccessReports ? 'bg-brand' : isDark ? 'bg-neutral-800' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        permsForm.canAccessReports ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-inherit">
                <button
                  type="button"
                  onClick={() => setSelectedPermsSubAdmin(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    isDark ? 'bg-neutral-800 border-neutral-700 text-gray-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingPerms}
                  onClick={handleSavePermissions}
                  className="px-5 py-2 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingPerms ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  <span>Save Permissions</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubAdmins;
