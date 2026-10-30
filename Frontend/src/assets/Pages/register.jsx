import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../Context/CustomerAuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useCustomerAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;

    setLoading(true);
    setError('');

    const res = await register(formData);
    setLoading(false);

    if (res.success) {
      navigate('/account');
    } else {
      setError(res.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="w-full min-h-screen bg-white font-sans text-dark flex flex-col items-center pt-8 md:pt-12 pb-20 px-4">
      {/* Back to Shop */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2.5 text-xs md:text-sm font-medium text-gray-700 hover:text-black mb-6 group cursor-pointer"
      >
        <span className="w-7 h-7 rounded-full border border-black flex items-center justify-center group-hover:bg-gray-100 transition-all shrink-0">
          <ArrowLeft size={13} strokeWidth={2} />
        </span>
        <span>Back to Shop</span>
      </button>

      {/* Main Page Title */}
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-dark mb-8 text-center">
        Create Account
      </h1>

      {/* Main Register Box with 1px Black Border */}
      <div className="w-full max-w-xl bg-white border border-black shadow-sm mb-6">
        <form onSubmit={handleSubmit}>
          {/* Section 1: Your Personal Details */}
          <div className="px-6 py-3.5 border-b border-black">
            <h2 className="text-base font-bold text-dark">Your Personal Details</h2>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-dark mb-2">
                  First Name <span className="text-red-500">*</span> :
                </label>
                <input
                  type="text"
                  required
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="e.g. Keval"
                  className="w-full px-4 py-2.5 text-sm border border-black bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark mb-2">
                  Last Name <span className="text-red-500">*</span> :
                </label>
                <input
                  type="text"
                  required
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="e.g. Patel"
                  className="w-full px-4 py-2.5 text-sm border border-black bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark mb-2">
                E-mail <span className="text-red-500">*</span> :
              </label>
              <input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. keval@example.com"
                className="w-full px-4 py-2.5 text-sm border border-black bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Your Password */}
          <div className="px-6 py-3.5 border-t border-b border-black">
            <h2 className="text-base font-bold text-dark">Your Password</h2>
          </div>

          <div className="p-6 sm:p-8">
            <div>
              <label className="block text-xs font-semibold text-dark mb-2">
                Password <span className="text-red-500">*</span> :
              </label>
              <input
                type="password"
                required
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Choose a secure password"
                className="w-full px-4 py-2.5 text-sm border border-black bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Section 3: Bottom Action inside Box */}
          <div className="border-t border-black px-6 sm:px-8 py-4 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
            <span className="text-xs text-gray-500">
              Instant login upon creation
            </span>
            <button
              type="submit"
              disabled={loading}
              className="bg-dark hover:bg-black text-white rounded-full py-2.5 px-8 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={13} strokeWidth={2.5} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Already have an account link */}
      <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 text-sm text-dark text-center">
        <span>Already have an account?</span>
        <button
          onClick={() => navigate('/login')}
          className="font-bold underline hover:text-black cursor-pointer"
        >
          Log in
        </button>
      </div>
    </div>
  );
};

export default Register;
