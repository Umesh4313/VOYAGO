import React, { useEffect, useState } from 'react';
import { Plane, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { INITIAL_USERS } from '../../data/mockData';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalInitialTab,
    authRoleToLogin,
    setCurrentUser,
    setActiveView,
    addAuditLog,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(authModalInitialTab);
  const [selectedRole, setSelectedRole] = useState<UserRole>(authRoleToLogin || 'CUSTOMER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('••••••••');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isAuthModalOpen) {
      setActiveTab(authModalInitialTab);
      setSelectedRole(authRoleToLogin || 'CUSTOMER');
      setMessage(null);
    }
  }, [isAuthModalOpen, authModalInitialTab, authRoleToLogin]);

  if (!isAuthModalOpen) return null;

  const handleDemoFill = (role: UserRole) => {
    const matched = INITIAL_USERS.find((u) => u.role === role);
    if (matched) {
      setSelectedRole(role);
      setEmail(matched.email);
      setName(matched.name);
      setPassword('password123');
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userEmail = email.trim() || `${selectedRole.toLowerCase()}@voyago.com`;
    const userName = name.trim() || (selectedRole === 'CUSTOMER' ? 'Arjun Sharma' : `${selectedRole.replace('_', ' ')} Manager`);

    const existingUser = INITIAL_USERS.find((u) => u.role === selectedRole);
    const authenticatedUser = {
      id: existingUser?.id || `usr-${Date.now()}`,
      name: userName,
      email: userEmail,
      role: selectedRole,
      phone: existingUser?.phone || '+91 98765 43210',
      partnerBusinessName: existingUser?.partnerBusinessName,
    };

    setCurrentUser(authenticatedUser);
    addAuditLog('USER_AUTHENTICATED', 'User', authenticatedUser.id, `User logged in with role ${selectedRole}`);

    setMessage({ type: 'success', text: `Welcome back, ${userName}!` });

    setTimeout(() => {
      setIsAuthModalOpen(false);
      setMessage(null);
      if (selectedRole === 'HOTEL_PARTNER') {
        setActiveView('hotel-partner');
      } else if (selectedRole === 'VEHICLE_PARTNER') {
        setActiveView('vehicle-partner');
      } else if (selectedRole === 'ADMIN') {
        setActiveView('admin');
      } else {
        setActiveView('customer');
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white text-stone-900 rounded-3xl overflow-hidden shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row border border-stone-200"
        id="voyago-auth-modal"
      >
        
        {/* Left Visual Pane */}
        <div className="relative md:w-5/12 bg-[#1A1A1A] text-white p-8 sm:p-10 flex flex-col justify-between overflow-hidden border-b md:border-b-0 md:border-r border-stone-200">
          {/* Background image with subtle overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1000&auto=format&fit=crop&q=80"
              alt="Mountain Road"
              className="w-full h-full object-cover opacity-35 filter contrast-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/40"></div>
          </div>

          {/* Top Back button */}
          <div className="relative z-10">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-xs uppercase tracking-wider font-semibold backdrop-blur-md transition-colors text-white border border-white/20 cursor-pointer"
              id="auth-back-to-voyago"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Voyago</span>
            </button>

            <div className="flex items-center gap-2.5 mt-8">
              <div className="w-8 h-8 rounded-full bg-[#9D3373] flex items-center justify-center text-white shadow-md">
                <Plane className="w-4 h-4 transform -rotate-45" />
              </div>
              <span className="font-serif-display text-2xl font-normal tracking-[0.15em] uppercase text-white">
                VOYAGO<span className="text-[#E8A5C3] font-bold">.</span>
              </span>
            </div>
          </div>

          {/* Center text */}
          <div className="relative z-10 my-8">
            <div className="inline-block px-3 py-1 rounded-full bg-[#9D3373]/30 border border-white/20 text-[#F4B8D5] text-[10px] font-bold tracking-widest uppercase mb-4 backdrop-blur-xs">
              Travel Ecosystem
            </div>
            <h2 className="font-serif-display text-4xl sm:text-5xl font-light italic leading-tight mb-4 text-white">
              Your journey <br/><span className="not-italic font-normal text-white">starts here.</span>
            </h2>
            <p className="text-white/80 text-sm font-light leading-relaxed">
              Curate destinations, discover verified stays, compare private travel options and secure your vehicle in one flow.
            </p>
          </div>

          {/* Bottom stats */}
          <div className="relative z-10 pt-6 border-t border-white/15 grid grid-cols-3 gap-2">
            <div>
              <p className="font-serif-display text-xl font-light italic text-[#F4B8D5]">48K+</p>
              <p className="text-[10px] uppercase tracking-wider text-white/70">Travelers</p>
            </div>
            <div>
              <p className="font-serif-display text-xl font-light italic text-[#F4B8D5]">3.2K+</p>
              <p className="text-[10px] uppercase tracking-wider text-white/70">Hotels</p>
            </div>
            <div>
              <p className="font-serif-display text-xl font-light italic text-[#F4B8D5]">1.1K+</p>
              <p className="text-[10px] uppercase tracking-wider text-white/70">Vehicles</p>
            </div>
          </div>

        </div>

        {/* Right Form Pane */}
        <div className="md:w-7/12 p-8 sm:p-12 overflow-y-auto bg-white text-stone-900 flex flex-col justify-between">
          <div>
            
            {/* Top Eyebrow and Headline */}
            <div className="mb-6">
              <span className="text-[10px] font-bold text-[#9D3373] tracking-widest uppercase">
                {activeTab === 'login' ? 'Authentication' : 'Membership Registration'}
              </span>
              <h3 className="font-serif-display text-3xl font-light italic text-stone-900 mt-1">
                {activeTab === 'login' ? 'Welcome back' : 'Begin your membership'}
              </h3>
              <p className="text-stone-500 text-sm mt-1 font-light">
                {activeTab === 'login'
                  ? 'Access your private reservations and travel portfolio.'
                  : 'Join Voyago to organize, reserve, and track bespoke voyages.'}
              </p>
            </div>

            {/* Login / Sign up Tabs */}
            <div className="flex border-b border-stone-200 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`pb-3 text-xs uppercase tracking-widest font-bold transition-colors relative flex-1 text-center cursor-pointer ${
                  activeTab === 'login'
                    ? 'text-[#9D3373] border-b-2 border-[#9D3373]'
                    : 'text-stone-400 hover:text-stone-700'
                }`}
                id="tab-login"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                className={`pb-3 text-xs uppercase tracking-widest font-bold transition-colors relative flex-1 text-center cursor-pointer ${
                  activeTab === 'signup'
                    ? 'text-[#9D3373] border-b-2 border-[#9D3373]'
                    : 'text-stone-400 hover:text-stone-700'
                }`}
                id="tab-signup"
              >
                Sign up
              </button>
            </div>

            {/* Development-only shortcuts; production uses real credentials. */}
            {import.meta.env.DEV && <div className="mb-6 bg-[#FAF8F5] p-3.5 rounded-2xl border border-stone-200">
              <p className="text-[10px] font-bold text-[#9D3373] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#9D3373]" />
                <span>Instant Demo Login (Choose Role)</span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleDemoFill('CUSTOMER')}
                  className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center truncate cursor-pointer ${
                    selectedRole === 'CUSTOMER'
                      ? 'bg-[#9D3373] text-white font-bold shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-700 hover:border-[#9D3373]/50'
                  }`}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('HOTEL_PARTNER')}
                  className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center truncate cursor-pointer ${
                    selectedRole === 'HOTEL_PARTNER'
                      ? 'bg-[#9D3373] text-white font-bold shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-700 hover:border-[#9D3373]/50'
                  }`}
                >
                  Hotel Partner
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('VEHICLE_PARTNER')}
                  className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center truncate cursor-pointer ${
                    selectedRole === 'VEHICLE_PARTNER'
                      ? 'bg-[#9D3373] text-white font-bold shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-700 hover:border-[#9D3373]/50'
                  }`}
                >
                  Ride Partner
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('ADMIN')}
                  className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center truncate cursor-pointer ${
                    selectedRole === 'ADMIN'
                      ? 'bg-[#9D3373] text-white font-bold shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-700 hover:border-[#9D3373]/50'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>}

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {activeTab === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Arjun Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:border-[#9D3373] focus:ring-1 focus:ring-[#9D3373]"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:border-[#9D3373] focus:ring-1 focus:ring-[#9D3373]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                    Password
                  </label>
                  {activeTab === 'login' && (
                    <button
                      type="button"
                      onClick={() => alert('Password reset link sent to ' + (email || 'your email'))}
                      className="text-xs font-semibold text-[#9D3373] hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:border-[#9D3373] focus:ring-1 focus:ring-[#9D3373]"
                />
              </div>

              {activeTab === 'login' && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#9D3373] border-stone-300"
                  />
                  <label htmlFor="remember-me" className="text-xs text-stone-600 cursor-pointer">
                    Remember me on this device
                  </label>
                </div>
              )}

              {message && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    message.type === 'success'
                      ? 'bg-[#9D3373]/10 text-[#9D3373] border border-[#9D3373]/30'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-[#9D3373]" />
                  <span>{message.text}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-[#9D3373] hover:bg-[#862960] active:scale-99 text-white font-bold uppercase tracking-[0.15em] rounded-xl shadow-md text-xs flex items-center justify-center gap-2 transition-all mt-3 cursor-pointer"
                id="auth-submit-btn"
              >
                <span>{activeTab === 'login' ? 'Log in to Voyago' : 'Create Voyago Account'}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-stone-500">
              {activeTab === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setActiveTab('signup')}
                    className="font-bold text-[#9D3373] hover:underline ml-1 cursor-pointer"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    onClick={() => setActiveTab('login')}
                    className="font-bold text-[#9D3373] hover:underline ml-1 cursor-pointer"
                  >
                    Log in
                  </button>
                </p>
              )}
            </div>

          </div>

          <p className="text-[11px] text-stone-400 text-center mt-6 uppercase tracking-wider">
            By continuing, you agree to Voyago's Terms of Service and Privacy Discretion.
          </p>

        </div>

      </div>
    </div>
  );
};
