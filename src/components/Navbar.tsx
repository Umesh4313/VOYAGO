import React, { useState } from 'react';
import { ChevronDown, LogOut, Shield, Hotel, Car, Briefcase, Compass, CalendarCheck, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    setIsAuthModalOpen,
    setAuthModalInitialTab,
    setAuthRoleToLogin,
    activeView,
    setActiveView,
    adminActiveTab,
    navigateToAdminTab,
    navigateToCustomerTab,
    openPlanningLogin,
  } = useApp();

  const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false);

  const handleForBusinessClick = (role: UserRole) => {
    setIsBusinessDropdownOpen(false);
    setAuthRoleToLogin(role);
    setAuthModalInitialTab('login');
    setIsAuthModalOpen(true);
  };

  const handleOpenPlanner = () => {
    openPlanningLogin();
  };

  const handleSearchTransport = () => {
    setAuthRoleToLogin('CUSTOMER');
    setAuthModalInitialTab('login');
    setIsAuthModalOpen(true);
  };

  const handleChooseHotel = () => {
    if (activeView === 'home') {
      document.getElementById('hotels-section')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigateToCustomerTab('hotels');
    }
  };

  const role = currentUser?.role || 'CUSTOMER';
  const isHomeView = activeView === 'home';
  const isDashboardView = !isHomeView;
  const isActiveView = (view: string) => activeView === view;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200/80 text-stone-900 select-none shadow-xs">
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo - matching Screenshot 1 */}
        <div 
          onClick={() => {
            setActiveView('home');
          }} 
          className="flex items-center gap-3 cursor-pointer group"
          id="nav-logo"
        >
          {/* Berry/Plum Flower / Spiral SVG Icon matching Screenshot 1 */}
          <div className="w-8 h-8 rounded-full border-2 border-[#9D3373] flex items-center justify-center p-1 text-[#9D3373] group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-[#9D3373]">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 3a7 7 0 1 1-7 7 7 7 0 0 1 7-7Zm0 3a4 4 0 1 0 4 4 4 4 0 0 0-4-4Z" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <span className="font-sans font-bold text-2xl tracking-[0.05em] uppercase text-stone-900">
            VOYAGO
          </span>
          {role === 'ADMIN' && (
            <span className="hidden sm:inline-block text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-[#9D3373]/10 text-[#9D3373] border border-[#9D3373]/30">
              Admin Ops
            </span>
          )}
        </div>

        {/* Center Navigation Links - matching Screenshot 1 */}
        {!isDashboardView && (
        <nav className="hidden md:flex items-center gap-7 lg:gap-9 text-sm font-medium text-stone-700">
          {!isHomeView && role === 'ADMIN' ? (
            /* ADMIN NAV LINKS */
            <>
              <button
                onClick={() => navigateToAdminTab('dashboard')}
                className={`transition-colors ${
                  isActiveView('admin') && adminActiveTab === 'dashboard'
                    ? 'text-[#9D3373] font-bold'
                    : 'hover:text-[#9D3373]'
                }`}
                id="nav-admin-dashboard"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigateToAdminTab('destinations')}
                className={`transition-colors ${
                  isActiveView('admin') && adminActiveTab === 'destinations'
                    ? 'text-[#9D3373] font-bold'
                    : 'hover:text-[#9D3373]'
                }`}
                id="nav-admin-destinations"
              >
                Destinations
              </button>
              <button
                onClick={() => navigateToAdminTab('transport')}
                className={`transition-colors ${
                  isActiveView('admin') && adminActiveTab === 'transport'
                    ? 'text-[#9D3373] font-bold'
                    : 'hover:text-[#9D3373]'
                }`}
                id="nav-admin-transport"
              >
                Transit
              </button>
              <button
                onClick={() => navigateToAdminTab('hotels')}
                className={`transition-colors ${
                  isActiveView('admin') && adminActiveTab === 'hotels'
                    ? 'text-[#9D3373] font-bold'
                    : 'hover:text-[#9D3373]'
                }`}
                id="nav-hotels"
              >
                Hotels &amp; Partners
              </button>
              <button
                onClick={() => navigateToAdminTab('vehicles')}
                className={`transition-colors ${
                  isActiveView('admin') && adminActiveTab === 'vehicles'
                    ? 'text-[#9D3373] font-bold'
                    : 'hover:text-[#9D3373]'
                }`}
                id="nav-vehicles"
              >
                Fleet
              </button>
              <button
                onClick={() => navigateToAdminTab('bookings')}
                className={`transition-colors ${
                  isActiveView('admin') && adminActiveTab === 'bookings'
                    ? 'text-[#9D3373] font-bold'
                    : 'hover:text-[#9D3373]'
                }`}
                id="nav-admin-bookings"
              >
                Bookings
              </button>
            </>
          ) : (
            /* PUBLIC / CUSTOMER NAV LINKS */
            <>
              <button
                onClick={() => {
                  setActiveView('home');
                  const el = document.getElementById('trips-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-black transition-colors"
                id="nav-trips"
              >
                Trips
              </button>

              <button
                onClick={handleChooseHotel}
                className={`hover:text-black transition-colors ${
                  isActiveView('customer') ? 'text-[#9D3373]' : ''
                }`}
                id="nav-hotels"
              >
                Hotels
              </button>

              <button
                onClick={() => {
                  setActiveView('home');
                  const el = document.getElementById('destinations-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-black transition-colors"
                id="nav-destinations"
              >
                Destinations
              </button>

              {/* Black Pill Button: "Plan your trip" matching Screenshot 1 */}
              <button
                onClick={handleOpenPlanner}
                className="bg-[#1A1A1A] hover:bg-black text-white px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer"
                id="nav-plan-trip-pill"
              >
                Plan your trip
              </button>
            </>
          )}

          {/* Business Dropdown for Partner/Admin portal switches */}
          <div className="relative">
            <button
              onClick={() => setIsBusinessDropdownOpen(!isBusinessDropdownOpen)}
              className="flex items-center gap-1 hover:text-[#9D3373] transition-colors py-1 text-xs text-stone-500 font-medium"
              id="nav-for-business-btn"
            >
              <span>For Business</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {isBusinessDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white text-stone-800 rounded-xl shadow-xl py-2 border border-stone-200 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => handleForBusinessClick('HOTEL_PARTNER')}
                  className="w-full text-left px-4 py-2.5 text-xs tracking-wider hover:bg-stone-50 hover:text-[#9D3373] flex items-center gap-2.5 font-medium text-stone-700"
                  id="dropdown-hotel-partner"
                >
                  <Hotel className="w-4 h-4 text-[#9D3373]" />
                  <span>Hotel Partner Portal</span>
                </button>
                <button
                  onClick={() => handleForBusinessClick('VEHICLE_PARTNER')}
                  className="w-full text-left px-4 py-2.5 text-xs tracking-wider hover:bg-stone-50 hover:text-[#9D3373] flex items-center gap-2.5 font-medium text-stone-700"
                  id="dropdown-vehicle-partner"
                >
                  <Car className="w-4 h-4 text-[#9D3373]" />
                  <span>Vehicle Partner Portal</span>
                </button>
                <div className="border-t border-stone-100 my-1"></div>
                <button
                  onClick={() => handleForBusinessClick('ADMIN')}
                  className="w-full text-left px-4 py-2.5 text-xs tracking-wider hover:bg-stone-50 hover:text-[#9D3373] flex items-center gap-2.5 font-medium text-stone-700"
                  id="dropdown-admin"
                >
                  <Shield className="w-4 h-4 text-[#9D3373]" />
                  <span>Super Admin Console</span>
                </button>
              </div>
            )}
          </div>
        </nav>
        )}

        {/* Right Side Buttons - matching Screenshot 1 */}
        <div className="flex items-center gap-4">
          {/* "Sign in" link matching Screenshot 1 */}
          {!isDashboardView && <button
            onClick={() => {
              setAuthModalInitialTab('login');
              setIsAuthModalOpen(true);
            }}
            className="text-stone-800 hover:text-black font-medium text-sm transition-colors cursor-pointer hidden sm:block"
            id="nav-signin-btn"
          >
            Sign in
          </button>}

          {/* Plum/Magenta Pill Button: "Start planning" matching Screenshot 1 */}
          {!isDashboardView && <button
            onClick={handleOpenPlanner}
            className="bg-[#9D3373] hover:bg-[#862960] text-white px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
            id="nav-start-planning-btn"
          >
            <span>Start planning</span>
          </button>}
        </div>
      </div>

      {/* Sub-navbar: "BUILD YOUR JOURNEY" matching Screenshot 1 */}
      {!isDashboardView && <div className="bg-[#FAF8F5] border-t border-stone-200/70 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3 sm:gap-4">
          <span className="text-[11px] font-bold tracking-widest text-stone-600 uppercase mr-2">
            BUILD YOUR JOURNEY
          </span>

          <button
            onClick={handleSearchTransport}
            className="border border-stone-300 rounded-full px-4 py-1.5 text-xs text-stone-700 bg-white hover:bg-stone-50 hover:border-stone-400 transition-colors shadow-2xs font-medium cursor-pointer"
            id="subnav-search-transport"
          >
            Search transport
          </button>

          <button
            onClick={handleChooseHotel}
            className="border border-stone-300 rounded-full px-4 py-1.5 text-xs text-stone-700 bg-white hover:bg-stone-50 hover:border-stone-400 transition-colors shadow-2xs font-medium cursor-pointer"
            id="subnav-choose-hotel"
          >
            Choose a hotel
          </button>

          <button
            onClick={handleOpenPlanner}
            className="border border-stone-300 rounded-full px-4 py-1.5 text-xs text-stone-700 bg-white hover:bg-stone-50 hover:border-stone-400 transition-colors shadow-2xs font-medium cursor-pointer"
            id="subnav-plan-from-scratch"
          >
            Plan from scratch
          </button>
        </div>
      </div>}
    </header>
  );
};
