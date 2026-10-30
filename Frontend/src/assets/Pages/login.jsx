import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../Context/CustomerAuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useCustomerAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      const destination = location.state?.from || '/account';
      navigate(destination);
    } else {
      setError(res.message || 'Invalid email or password');
    }
  };

  const handleFillDemo = () => {
    setEmail('keval@example.com');
    setPassword('customer123');
    setError('');
  };

  return (
    <div className="w-full min-h-screen bg-white font-sans text-dark flex flex-col items-center pt-8 px-4 pb-16">
      {/* Back to Shop */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center mt-6 gap-2.5 text-xs md:text-sm font-medium text-gray-700 hover:text-black mb-6 group cursor-pointer"
      >
        <span className="w-7 h-7 rounded-full border border-black flex items-center justify-center group-hover:bg-gray-100 transition-all shrink-0">
          <ArrowLeft size={13} strokeWidth={2} />
        </span>
        <span>Back to Shop</span>
      </button>

      {/* Main Page Title */}
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-dark mb-8 text-center">
        Log In
      </h1>

      {/* Quick Demo Fill Pill */}
      <button
        type="button"
        onClick={handleFillDemo}
        className="mb-6 px-4 py-2 rounded-full border border-black/20 bg-[#faede3] hover:bg-[#f4efe8] text-xs font-bold text-dark flex items-center gap-2 cursor-pointer transition-all shadow-xs"
      >
        <Sparkles size={14} className="text-amber-700" />
        <span>Click to auto-fill customer account (Keval)</span>
      </button>

      {/* Main Login Card with 1px Black Border */}
      <div className="w-full max-w-xl bg-white border border-black shadow-sm mb-8">
        {/* Box Header */}
        <div className="px-6 py-3.5 border-b border-black flex items-center justify-between">
          <h2 className="text-base font-bold text-dark">Customer Log In</h2>
          <span className="text-xs text-gray-500">Sign in to your account</span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          <p className="text-sm font-medium text-dark mb-6">
            I am a returning customer
          </p>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            <div>
              <label className="block text-xs font-semibold text-dark mb-2">
                E-mail <span className="text-red-500">*</span> :
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-2.5 text-sm border border-black bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark mb-2">
                Password <span className="text-red-500">*</span> :
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-2.5 text-sm border border-black bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Bottom Action inside box */}
          <div className="border-t border-black -mx-6 sm:-mx-8 pt-5 px-6 sm:px-8 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={() => alert('Password reset instructions have been sent to your email.')}
              className="text-red-500 text-xs font-semibold hover:underline cursor-pointer"
            >
              Forgot Password?
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-dark hover:bg-black text-white rounded-full py-2.5 px-7 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Logging In...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight size={13} strokeWidth={2.5} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Bottom Register Option */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 text-sm text-dark text-center sm:text-left">
        <span>If you don't have an account:</span>
        <button
          onClick={() => navigate('/register')}
          className="bg-[#faede3] hover:bg-[#f4efe8] text-dark rounded-full py-2 px-5 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border border-black/10"
        >
          <span>Create Account</span>
          <ArrowRight size={12} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default Login;
