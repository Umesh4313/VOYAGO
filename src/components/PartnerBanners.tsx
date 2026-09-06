import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PartnerBanners: React.FC = () => {
  const { setAuthRoleToLogin, setAuthModalInitialTab, setIsAuthModalOpen } = useApp();

  const openPartnerLogin = (role: 'HOTEL_PARTNER' | 'VEHICLE_PARTNER') => {
    setAuthRoleToLogin(role);
    setAuthModalInitialTab('login');
    setIsAuthModalOpen(true);
  };

  return (
    <section className="py-16 bg-[#FAF8F5] border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Hotel Partner Card */}
          <div className="bg-white text-stone-900 rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-xs border border-stone-200 hover:border-[#9D3373]/40 hover:shadow-md transition-all relative overflow-hidden group">
            <div className="relative z-10">
              <div className="text-[10px] uppercase tracking-widest font-bold text-[#9D3373] mb-3">
                Hospitality Partners
              </div>
              <h3 className="font-serif-display text-3xl sm:text-4xl font-light italic tracking-tight text-stone-900 mb-4">
                List your <span className="not-italic font-normal">hotel</span>
              </h3>
              <p className="text-stone-500 text-sm sm:text-base font-light leading-relaxed max-w-md mb-8">
                Manage luxury suites, pricing and availability from an exclusive partner console.
              </p>
            </div>

            <div className="relative z-10">
              <button
                onClick={() => openPartnerLogin('HOTEL_PARTNER')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#9D3373] text-white hover:bg-[#862960] text-xs uppercase tracking-[0.15em] font-bold transition-all hover:gap-3 cursor-pointer shadow-xs"
                id="cta-become-hotel-partner"
              >
                <span>Become a Hotel Partner</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Vehicle Rental Partner Card */}
          <div className="bg-white text-stone-900 rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-xs border border-stone-200 hover:border-[#9D3373]/40 hover:shadow-md transition-all relative overflow-hidden group">
            <div className="relative z-10">
              <div className="text-[10px] uppercase tracking-widest font-bold text-[#9D3373] mb-3">
                Fleet Partners
              </div>
              <h3 className="font-serif-display text-3xl sm:text-4xl font-light italic tracking-tight text-stone-900 mb-4">
                Rent out <span className="not-italic font-normal">cars &amp; bikes</span>
              </h3>
              <p className="text-stone-500 text-sm sm:text-base font-light leading-relaxed max-w-md mb-8">
                Add premium vehicles, track client reservations and manage availability in real time.
              </p>
            </div>

            <div className="relative z-10">
              <button
                onClick={() => openPartnerLogin('VEHICLE_PARTNER')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#9D3373] text-white hover:bg-[#862960] text-xs uppercase tracking-[0.15em] font-bold transition-all hover:gap-3 cursor-pointer shadow-xs"
                id="cta-become-rental-partner"
              >
                <span>Become a Rental Partner</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
