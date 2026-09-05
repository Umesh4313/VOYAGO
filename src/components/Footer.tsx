import React from 'react';
import { Camera, User, Users, Play } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { setActiveView, setAuthRoleToLogin, setAuthModalInitialTab, setIsAuthModalOpen, navigateToCustomerTab } = useApp();
  const handlePartnerLink = (role: 'HOTEL_PARTNER' | 'VEHICLE_PARTNER') => {
    setAuthRoleToLogin(role);
    setAuthModalInitialTab('login');
    setIsAuthModalOpen(true);
  };

  return (
    <footer className="select-none">
      {/* 1. Newsletter Section matching Screenshot 11 */}
      <section className="bg-[#FAF8F5] py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          
          {/* Left: Text */}
          <div>
            <p className="font-script text-3xl sm:text-4xl text-[#C05888] italic mb-2 transform -rotate-1">
              Travel notes for you
            </p>
            <h2 className="font-sans font-bold text-3xl sm:text-4xl text-stone-900 tracking-tight leading-tight mb-3">
              Plan smarter journeys with VOYAGO
            </h2>
            <p className="text-stone-600 text-sm sm:text-base max-w-md font-light">
              Get monthly destination ideas, booking tips, and fresh travel inspiration for your next trip across India.
            </p>
          </div>

        </div>
      </section>

      {/* 2. Deep Forest Green Footer matching Screenshot 11 */}
      <div className="bg-[#122B25] text-[#E0E7E4] pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* 4 Navigation Columns matching Screenshot 11 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-16">
            
            {/* Column 1: EXPLORE DESTINATIONS */}
            <div>
              <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/90 mb-5">
                EXPLORE DESTINATIONS
              </h3>
              <ul className="space-y-2.5 text-xs text-white/70 font-light">
                {['Pune escapes', 'Goa getaways', 'Kerala journeys', 'Rajasthan tours', 'Mumbai trips', 'Manali adventures', 'Jaipur holidays', 'Kashmir escapes', 'Bengaluru breaks', 'Udaipur journeys'].map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => {
                        setActiveView('home');
                        const el = document.getElementById('destinations-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="hover:text-white transition-colors cursor-pointer text-left"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: TRAVEL EXPERIENCES */}
            <div>
              <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/90 mb-5">
                TRAVEL EXPERIENCES
              </h3>
              <ul className="space-y-2.5 text-xs text-white/70 font-light">
                {['Flight booking', 'Train booking', 'Bus booking', 'Hotel stays', 'Vehicle rentals', 'Family holidays', 'Weekend escapes', 'Cultural tours', 'Nature getaways', 'Custom trips'].map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => {
                        if (item.includes('Hotel')) navigateToCustomerTab('hotels');
                        else if (item.includes('Vehicle')) navigateToCustomerTab('vehicles');
                        else navigateToCustomerTab('transport');
                      }}
                      className="hover:text-white transition-colors cursor-pointer text-left"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: VOYAGO */}
            <div>
              <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/90 mb-5">
                VOYAGO
              </h3>
              <ul className="space-y-2.5 text-xs text-white/70 font-light">
                <li>
                  <button onClick={() => setActiveView('home')} className="hover:text-white transition-colors cursor-pointer">
                    About Voyago
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setActiveView('home');
                      window.scrollTo({ top: 900, behavior: 'smooth' });
                    }} 
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    How it works
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveView('home')} className="hover:text-white transition-colors cursor-pointer">
                    Smart recommendations
                  </button>
                </li>
                <li>
                  <button onClick={() => handlePartnerLink('HOTEL_PARTNER')} className="hover:text-white transition-colors cursor-pointer text-[#F4B8D5]">
                    For hotel partners
                  </button>
                </li>
                <li>
                  <button onClick={() => handlePartnerLink('VEHICLE_PARTNER')} className="hover:text-white transition-colors cursor-pointer text-[#F4B8D5]">
                    For vehicle partners
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveView('customer')} className="hover:text-white transition-colors cursor-pointer">
                    Help centre
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveView('customer')} className="hover:text-white transition-colors cursor-pointer">
                    Contact us
                  </button>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">Terms &amp; conditions</span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">Privacy policy</span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">Cancellation policy</span>
                </li>
              </ul>
            </div>

            {/* Column 4: FOLLOW ALONG */}
            <div>
              <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/90 mb-5">
                FOLLOW ALONG
              </h3>
              <div className="flex items-center gap-3 mb-6">
                <button 
                  className="w-10 h-10 rounded-full border border-white/20 hover:border-white/60 bg-white/5 flex items-center justify-center text-white transition-colors cursor-pointer"
                  aria-label="Instagram"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <button 
                  className="w-10 h-10 rounded-full border border-white/20 hover:border-white/60 bg-white/5 flex items-center justify-center text-white transition-colors cursor-pointer"
                  aria-label="Account"
                >
                  <User className="w-4 h-4" />
                </button>
                <button 
                  className="w-10 h-10 rounded-full border border-white/20 hover:border-white/60 bg-white/5 flex items-center justify-center text-white transition-colors cursor-pointer"
                  aria-label="Community"
                >
                  <Users className="w-4 h-4" />
                </button>
                <button 
                  className="w-10 h-10 rounded-full border border-white/20 hover:border-white/60 bg-white/5 flex items-center justify-center text-white transition-colors cursor-pointer"
                  aria-label="Videos"
                >
                  <Play className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Bar matching Screenshot 11 */}
          <div className="border-t border-white/15 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
            <p>© 2026 VOYAGO. All rights reserved.</p>
            <p className="font-medium tracking-wider uppercase">
              ENGLISH • INR ₹
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
};
