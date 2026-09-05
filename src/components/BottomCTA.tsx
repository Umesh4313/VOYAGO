import React from 'react';
import { useApp } from '../context/AppContext';

export const BottomCTA: React.FC = () => {
  const { openPlanningLogin } = useApp();

  const handlePlanTrip = () => {
    openPlanningLogin();
  };

  return (
    <div>
      {/* 1. "Go further." Call To Action Banner matching Screenshot 10 */}
      <section className="home-section-reveal bg-[#FAF8F5] py-14 sm:py-20 px-4 sm:px-6 lg:px-8 select-none">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-xl bg-stone-900 py-16 sm:py-20 lg:py-24 px-6 sm:px-12 text-center text-white">
            
            {/* Background Mountain Sunset Layer Photo */}
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2400&q=85"
              alt="Misty mountain ridges layers at sunset"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-40"
            />
            
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-900/60 to-stone-950/90" />

            {/* Content */}
            <div className="relative z-10 max-w-3xl mx-auto">
              <p className="font-script text-4xl sm:text-5xl text-[#E8A5C3] italic mb-3 transform -rotate-1 drop-shadow-md">
                Go further.
              </p>

              <h2 className="font-sans font-bold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight mb-8 drop-shadow-sm">
                Build a smarter journey across India, with every detail planned around you.
              </h2>

              <button
                onClick={handlePlanTrip}
                className="bg-[#9D3373] hover:bg-[#862960] text-white px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer"
                id="btn-bottom-cta-plan"
              >
                Plan your trip
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Our Travel Partners Bar matching Screenshot 10 */}
      <section className="home-section-reveal bg-[#EFECE5] py-10 px-4 sm:px-6 lg:px-8 border-y border-stone-200/70 select-none">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-stone-500 mb-6">
            OUR TRAVEL PARTNERS
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:gap-16 text-stone-700 opacity-90">
            <span className="font-serif italic text-base sm:text-lg">
              Pune Tourism Board
            </span>
            <span className="font-sans font-medium text-xs sm:text-sm tracking-wider uppercase">
              Trusted Hotel Partners
            </span>
            <span className="font-serif italic text-base sm:text-lg">
              Verified Transport Network
            </span>
            <span className="font-sans font-medium text-xs sm:text-sm tracking-wider uppercase">
              Local Experience Hosts
            </span>
            <span className="font-serif italic text-base sm:text-lg">
              Responsible Travel India
            </span>
            <span className="font-sans font-semibold text-xs sm:text-sm tracking-wider uppercase">
              Voyago Partner Network
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
