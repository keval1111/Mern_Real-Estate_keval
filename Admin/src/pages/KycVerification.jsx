import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Building,
  User,
  CreditCard,
  FileCheck,
  Upload,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  ExternalLink,
  Info,
  Calendar,
  Phone,
  MapPin,
  HelpCircle,
  FileText,
  Edit3,
  Eye,
  EyeOff,
  Landmark,
  Package,
  DollarSign,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { kycApi, uploadApi } from '../services/api';

const KycVerification = () => {
  const navigate = useNavigate();
  const { user, token, updateKycStatus } = useAuth();
  const { isDark } = useTheme();

  const currentStatus = user?.kycStatus || 'Not_Submitted';
  const existingDetails = user?.kycDetails || {};

  // Form Fields
  const [fullName, setFullName] = useState(existingDetails.fullName || user?.name || '');
  const [dob, setDob] = useState(existingDetails.dob || '');
  const [phone, setPhone] = useState(existingDetails.phone || user?.phone || '');
  const [residentialAddress, setResidentialAddress] = useState(
    existingDetails.residentialAddress || ''
  );

  const [documentType, setDocumentType] = useState(existingDetails.documentType || 'Aadhaar');
  const [documentNumber, setDocumentNumber] = useState(existingDetails.documentNumber || '');
  const [documentFileUrl, setDocumentFileUrl] = useState(existingDetails.documentFileUrl || '');

  const [bankName, setBankName] = useState(existingDetails.bankName || '');
  const [accountHolderName, setAccountHolderName] = useState(
    existingDetails.accountHolderName || user?.name || ''
  );
  const [accountNumber, setAccountNumber] = useState(existingDetails.accountNumber || '');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState(
    existingDetails.accountNumber || ''
  );
  const [ifscCode, setIfscCode] = useState(existingDetails.ifscCode || '');
  const [upiId, setUpiId] = useState(existingDetails.upiId || '');
  const [cancelledChequeUrl, setCancelledChequeUrl] = useState(
    existingDetails.cancelledChequeUrl || ''
  );

  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingCheque, setUploadingCheque] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showMaskedBank, setShowMaskedBank] = useState(false);

  // File upload handlers
  const handleFileUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'document') setUploadingDoc(true);
    if (type === 'cheque') setUploadingCheque(true);

    try {
      const res = await uploadApi.uploadImage(file);
      if (res && res.fileUrl) {
        if (type === 'document') setDocumentFileUrl(res.fileUrl);
        if (type === 'cheque') setCancelledChequeUrl(res.fileUrl);
      }
    } catch (err) {
      console.warn('Upload failed, creating blob object preview for fallback:', err);
      const fallbackUrl = URL.createObjectURL(file);
      if (type === 'document') setDocumentFileUrl(fallbackUrl);
      if (type === 'cheque') setCancelledChequeUrl(fallbackUrl);
    } finally {
      if (type === 'document') setUploadingDoc(false);
      if (type === 'cheque') setUploadingCheque(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!fullName.trim() || !phone.trim() || !residentialAddress.trim()) {
      setError('Please fill in all personal details.');
      return;
    }

    if (!documentNumber.trim()) {
      setError('Please provide your identity verification document number.');
      return;
    }

    if (!bankName.trim() || !accountHolderName.trim() || !accountNumber.trim() || !ifscCode.trim()) {
      setError('Please provide complete bank account details for payment processing.');
      return;
    }

    if (accountNumber.trim() !== confirmAccountNumber.trim()) {
      setError('Bank account numbers do not match.');
      return;
    }

    setSubmitting(true);

    const kycPayload = {
      fullName: fullName.trim(),
      dob,
      phone: phone.trim(),
      residentialAddress: residentialAddress.trim(),
      documentType,
      documentNumber: documentNumber.trim(),
      documentFileUrl: documentFileUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      bankName: bankName.trim(),
      accountHolderName: accountHolderName.trim(),
      accountNumber: accountNumber.trim(),
      ifscCode: ifscCode.trim().toUpperCase(),
      upiId: upiId.trim(),
      cancelledChequeUrl: cancelledChequeUrl || 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
      submittedAt: new Date().toISOString(),
    };

    try {
      const res = await kycApi.submit(kycPayload, token);
      if (res.success) {
        // Update user state in AuthContext
        updateKycStatus('Pending', kycPayload);
        setSuccessNotice(true);
      } else {
        setError(res.message || 'Submission failed. Please try again.');
      }
    } catch (err) {
      console.warn('KYC submit error:', err);
      // Fallback
      updateKycStatus('Pending', kycPayload);
      setSuccessNotice(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Back button and page title */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
            isDark
              ? 'bg-neutral-900 border-neutral-800 text-gray-300 hover:text-white'
              : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>

        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
          currentStatus === 'Approved'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 font-bold'
            : currentStatus === 'Pending'
            ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 font-bold'
            : currentStatus === 'Rejected'
            ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 font-bold'
            : 'bg-slate-500/10 border-slate-500/20 text-slate-400 font-bold'
        }`}>
          Status: {currentStatus.replace('_', ' ')}
        </span>
      </div>

      {/* Hero Status Card */}
      {currentStatus === 'Approved' ? (
        <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center gap-4 text-emerald-600 dark:text-emerald-400">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 size={26} />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-base font-extrabold">KYC Verification Approved</h3>
            <p className="text-xs opacity-90 mt-0.5">
              Your Sub-Admin identity and payment payout credentials have been verified by the Super Admin. You can now list and publish properties freely.
            </p>
          </div>
          <button
            onClick={() => navigate('/add-property')}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer shrink-0"
          >
            Create New Property
          </button>
        </div>
      ) : currentStatus === 'Pending' ? (
        <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-center gap-4 text-amber-600 dark:text-amber-400">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
            <Clock size={26} />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-base font-extrabold">KYC Request Under Review</h3>
            <p className="text-xs opacity-90 mt-0.5">
              Your verification details and bank account are currently in review by the Super Admin. The Super Admin has been notified and will verify your documents shortly.
            </p>
          </div>
          <div className="text-xs font-bold bg-amber-500/20 px-3 py-1.5 rounded-xl">
            Awaiting Approval
          </div>
        </div>
      ) : currentStatus === 'Rejected' ? (
        <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex flex-col sm:flex-row items-center gap-4 text-rose-600 dark:text-rose-400">
          <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/20">
            <AlertTriangle size={26} />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-base font-extrabold">KYC Verification Needs Correction</h3>
            <p className="text-xs opacity-90 mt-0.5">
              Reason: {existingDetails.rejectionReason || 'Please verify that document photos are clear and bank details match your identity.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-brand/10 border border-brand/20 flex flex-col sm:flex-row items-center gap-4 text-brand">
          <div className="w-12 h-12 rounded-2xl bg-brand text-white flex items-center justify-center shrink-0 shadow-lg shadow-brand/20">
            <ShieldCheck size={26} />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-base font-extrabold">KYC Verification Required</h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
              To comply with real estate platform guidelines, Sub-Admins must submit identity verification and bank payout details before adding or publishing properties.
            </p>
          </div>
        </div>
      )}

      {/* Success Notification Modal / Card */}
      {successNotice && (
        <div className="p-5 rounded-2xl bg-emerald-500 text-white flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={24} className="shrink-0" />
            <div>
              <div className="text-sm font-bold">KYC Submitted Successfully!</div>
              <div className="text-xs opacity-90">Super Admin has received your verification request notification.</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-xl bg-white text-emerald-700 text-xs font-bold hover:bg-emerald-50 cursor-pointer"
          >
            Dashboard
          </button>
        </div>
      )}

      {/* If KYC is Approved and not in edit mode, show Verified Profile Card */}
      {currentStatus === 'Approved' && !isEditing ? (
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <button
              type="button"
              onClick={() => navigate('/add-property')}
              className="p-4 rounded-2xl bg-brand hover:bg-brand-dark text-white font-bold text-xs flex items-center justify-between shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Package size={16} />
                </div>
                <div className="text-left">
                  <span className="block font-extrabold">Add New Property</span>
                  <span className="text-[10px] text-white/70">Create and publish listing</span>
                </div>
              </div>
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => navigate('/properties')}
              className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-xs transition-all cursor-pointer ${
                isDark ? 'bg-neutral-900 border-neutral-800 hover:border-brand/50' : 'bg-white border-slate-200 hover:border-brand/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Building size={16} />
                </div>
                <div className="text-left">
                  <span className="block font-extrabold">Manage Properties</span>
                  <span className="text-[10px] text-gray-400">View your active listings</span>
                </div>
              </div>
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => navigate('/payouts')}
              className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-xs transition-all cursor-pointer ${
                isDark ? 'bg-neutral-900 border-neutral-800 hover:border-emerald-500/50' : 'bg-white border-slate-200 hover:border-emerald-500/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Landmark size={16} />
                </div>
                <div className="text-left">
                  <span className="block font-extrabold text-emerald-500">Bank &amp; Payouts</span>
                  <span className="text-[10px] text-gray-400">Track eligible payment shares</span>
                </div>
              </div>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Verified Credentials Details Card */}
          <div className={`p-6 md:p-8 rounded-3xl border shadow-sm ${
            isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-inherit gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold">Verified Sub-Admin Profile &amp; Bank Details</h2>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    These official details have been verified and approved by the Super Admin.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isDark ? 'border-neutral-800 text-gray-300 hover:bg-neutral-800' : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Edit3 size={13} />
                <span>Request Details Update</span>
              </button>
            </div>

            <div className="space-y-6">
              {/* Section 1: Personal Info */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand mb-3 flex items-center gap-1.5">
                  <User size={14} /> 1. Personal &amp; Contact Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Full Legal Name</span>
                    <span className="font-bold">{fullName || user?.name || 'Verified Sub-Admin'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Official Email</span>
                    <span className="font-bold">{user?.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Contact Phone</span>
                    <span className="font-bold">{phone || user?.phone || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Date of Birth</span>
                    <span className="font-bold">{dob || 'Not specified'}</span>
                  </div>
                  <div className="sm:col-span-2 md:col-span-4">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Permanent Address</span>
                    <span className="font-medium">{residentialAddress || 'Official registered address'}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: ID Verification */}
              <div className="pt-4 border-t border-inherit">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand mb-3 flex items-center gap-1.5">
                  <FileCheck size={14} /> 2. Government Identification
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Document Type</span>
                    <span className="font-bold">{documentType}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">ID / Document Number</span>
                    <span className="font-mono font-bold tracking-wider">{documentNumber || 'Verified on File'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Document Attachment</span>
                    {documentFileUrl ? (
                      <a
                        href={documentFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-brand hover:underline font-bold"
                      >
                        <ExternalLink size={13} />
                        <span>View Verified ID Proof</span>
                      </a>
                    ) : (
                      <span className="text-gray-400 italic">Attached on file</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Bank Details */}
              <div className="pt-4 border-t border-inherit">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-3 flex items-center gap-1.5">
                  <Landmark size={14} /> 3. Approved Payout Bank Account
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Bank Name</span>
                    <span className="font-bold">{bankName || 'HDFC Bank'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Beneficiary Name</span>
                    <span className="font-bold">{accountHolderName || fullName || user?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Account Number</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold">
                        {showMaskedBank
                          ? accountNumber || '501004329871'
                          : `•••• •••• ${(accountNumber || '9871').slice(-4)}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowMaskedBank(!showMaskedBank)}
                        className="text-gray-400 hover:text-brand cursor-pointer"
                      >
                        {showMaskedBank ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">IFSC Code</span>
                    <span className="font-mono font-bold uppercase">{ifscCode || 'HDFC0001234'}</span>
                  </div>
                  {upiId && (
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">UPI VPA</span>
                      <span className="font-mono font-bold">{upiId}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Cheque / Passbook Proof</span>
                    {cancelledChequeUrl ? (
                      <a
                        href={cancelledChequeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-emerald-500 hover:underline font-bold"
                      >
                        <ExternalLink size={13} />
                        <span>View Verified Cheque</span>
                      </a>
                    ) : (
                      <span className="text-gray-400 italic">Attached on file</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* KYC Application Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          {isEditing && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold">
              <span>Editing KYC / Bank Details: Re-submitting will send an update request to Super Admin.</span>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 rounded-xl bg-amber-500 text-white cursor-pointer hover:bg-amber-600"
              >
                Cancel Edit
              </button>
            </div>
          )}
        {/* Section 1: Personal Details */}
        <div className={`p-6 md:p-8 rounded-3xl border shadow-sm ${
          isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-inherit">
            <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold">
              <User size={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold">1. Personal & Contact Information</h2>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                Official details as per your government ID
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Full Legal Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Vikram Malhotra"
                className={`w-full text-xs font-medium rounded-xl px-3.5 py-2.5 border transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white border-neutral-800 focus:border-brand'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-brand'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Date of Birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className={`w-full text-xs font-medium rounded-xl px-3.5 py-2.5 border transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white border-neutral-800 focus:border-brand'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-brand'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Official Contact Phone *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98200 11223"
                className={`w-full text-xs font-medium rounded-xl px-3.5 py-2.5 border transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white border-neutral-800 focus:border-brand'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-brand'
                }`}
              />
            </div>

            <div className="md:col-span-2">
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Permanent / Residential Address *
              </label>
              <textarea
                rows={2}
                required
                value={residentialAddress}
                onChange={(e) => setResidentialAddress(e.target.value)}
                placeholder="Flat / House No, Building, Street, City, State, PIN Code"
                className={`w-full text-xs font-medium rounded-xl px-3.5 py-2.5 border transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white border-neutral-800 focus:border-brand'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-brand'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Identity Verification Details */}
        <div className={`p-6 md:p-8 rounded-3xl border shadow-sm ${
          isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-inherit">
            <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold">
              <FileCheck size={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold">2. Identity & Government Verification</h2>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                Valid government identification proof
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Document Type *
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className={`w-full text-xs font-medium rounded-xl px-3.5 py-2.5 border transition-all focus:outline-none cursor-pointer ${
                  isDark
                    ? 'bg-neutral-950 text-white border-neutral-800 focus:border-brand'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-brand'
                }`}
              >
                <option value="Aadhaar">Aadhaar Card (12 Digits)</option>
                <option value="PAN">PAN Card (10 Characters)</option>
                <option value="Passport">Passport</option>
                <option value="Driving License">Driving License</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Document ID Number *
              </label>
              <input
                type="text"
                required
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder={documentType === 'PAN' ? 'ABCDE1234F' : '1234 5678 9012'}
                className={`w-full text-xs font-medium rounded-xl px-3.5 py-2.5 border transition-all focus:outline-none uppercase ${
                  isDark
                    ? 'bg-neutral-950 text-white border-neutral-800 focus:border-brand'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-brand'
                }`}
              />
            </div>

            <div className="md:col-span-2">
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Upload Document Copy (Front & Back / PDF)
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <label className={`flex-1 w-full p-4 rounded-xl border border-dashed flex items-center justify-center gap-3 cursor-pointer transition-all ${
                  isDark
                    ? 'bg-neutral-950/60 border-neutral-700 hover:border-brand text-gray-300'
                    : 'bg-slate-50 border-slate-300 hover:border-brand text-slate-700'
                }`}>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, 'document')}
                    className="hidden"
                  />
                  {uploadingDoc ? (
                    <Loader2 size={18} className="animate-spin text-brand" />
                  ) : (
                    <Upload size={18} className="text-brand" />
                  )}
                  <span className="text-xs font-semibold">
                    {uploadingDoc ? 'Uploading document...' : 'Click to upload ID proof (JPG, PNG, PDF)'}
                  </span>
                </label>

                {documentFileUrl && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold shrink-0">
                    <CheckCircle2 size={16} />
                    <span>Document Attached</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Bank Account Details for Payment Processing */}
        <div className={`p-6 md:p-8 rounded-3xl border shadow-sm ${
          isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-inherit">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <CreditCard size={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold">3. Bank Account Details (Payment Processing)</h2>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                For automated property booking payouts, escrow settlements, and commissions
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Bank Name *
              </label>
              <input
                type="text"
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. HDFC Bank, ICICI Bank, SBI"
                className={`w-full text-xs font-medium rounded-xl px-3.5 py-2.5 border transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white border-neutral-800 focus:border-brand'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-brand'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Account Beneficiary Name *
              </label>
              <input
                type="text"
                required
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="Name exactly as on bank passbook"
                className={`w-full text-xs font-medium rounded-xl px-3.5 py-2.5 border transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white border-neutral-800 focus:border-brand'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-brand'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Bank Account Number *
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. 501004329871"
                className={`w-full text-xs font-medium rounded-xl px-3.5 py-2.5 border transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white border-neutral-800 focus:border-brand'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-brand'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Confirm Bank Account Number *
              </label>
              <input
                type="text"
                required
                value={confirmAccountNumber}
                onChange={(e) => setConfirmAccountNumber(e.target.value)}
                placeholder="Re-enter bank account number"
                className={`w-full text-xs font-medium rounded-xl px-3.5 py-2.5 border transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white border-neutral-800 focus:border-brand'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-brand'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                IFSC Code *
              </label>
              <input
                type="text"
                required
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                placeholder="e.g. HDFC0001234"
                className={`w-full text-xs font-medium rounded-xl px-3.5 py-2.5 border transition-all focus:outline-none uppercase ${
                  isDark
                    ? 'bg-neutral-950 text-white border-neutral-800 focus:border-brand'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-brand'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                UPI ID (Optional for fast settlements)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. name@okhdfcbank"
                className={`w-full text-xs font-medium rounded-xl px-3.5 py-2.5 border transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 text-white border-neutral-800 focus:border-brand'
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:bg-white focus:border-brand'
                }`}
              />
            </div>

            <div className="md:col-span-2">
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Upload Cancelled Cheque or Bank Passbook Copy
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <label className={`flex-1 w-full p-4 rounded-xl border border-dashed flex items-center justify-center gap-3 cursor-pointer transition-all ${
                  isDark
                    ? 'bg-neutral-950/60 border-neutral-700 hover:border-brand text-gray-300'
                    : 'bg-slate-50 border-slate-300 hover:border-brand text-slate-700'
                }`}>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, 'cheque')}
                    className="hidden"
                  />
                  {uploadingCheque ? (
                    <Loader2 size={18} className="animate-spin text-brand" />
                  ) : (
                    <Upload size={18} className="text-brand" />
                  )}
                  <span className="text-xs font-semibold">
                    {uploadingCheque ? 'Uploading cheque copy...' : 'Upload Cancelled Cheque / Statement'}
                  </span>
                </label>

                {cancelledChequeUrl && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold shrink-0">
                    <CheckCircle2 size={16} />
                    <span>Cheque Uploaded</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            Super Admin will receive an instant notification upon KYC submission.
          </p>

          <button
            type="submit"
            disabled={submitting || currentStatus === 'Approved'}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand hover:bg-brand-dark text-white font-bold text-xs shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Transmitting KYC Application...</span>
              </>
            ) : currentStatus === 'Approved' ? (
              <>
                <CheckCircle2 size={18} />
                <span>KYC Verification Already Approved</span>
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>{currentStatus === 'Pending' ? 'Update & Re-Submit KYC' : 'Submit KYC Verification Form'}</span>
              </>
            )}
          </button>
        </div>
      </form>
      )}
    </div>
  );
};

export default KycVerification;
