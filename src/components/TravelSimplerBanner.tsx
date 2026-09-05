import React from 'react';
import { ShieldCheck, Globe, Building2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TravelSimplerBanner: React.FC = () => {
  const { openPlanningLogin } = useApp();

  const handlePlanTrip = () => {
    openPlanningLogin();
  };

  return (
    <section className="home-section-reveal bg-[#17362E] py-18 sm:py-24 px-4 sm:px-6 lg:px-8 text-white select-none relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Text & CTA matching Screenshot 6 */}
          <div className="lg:col-span-7">
            <h2 className="font-sans font-bold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight">
              Travel made simpler
            </h2>
            
            <p className="font-script text-3xl sm:text-4xl md:text-5xl text-[#E8A5C3] italic mt-1 mb-6 transform -rotate-1">
              Travel that works harder
            </p>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-xl font-light mb-8">
              VOYAGO brings every part of your journey into one thoughtful trip planner. Compare flights, trains and buses, select your seats, reserve a hotel room and add a vehicle when you need one. Discover highly rated places to visit without building a rigid day-by-day itinerary. Transparent prices and live availability help you plan with confidence, from Pune to destinations across India.
            </p>

            <button
              onClick={handlePlanTrip}
              className="border border-white/80 hover:border-white text-white hover:bg-white/10 px-7 py-3 rounded-full text-xs font-semibold uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
              id="btn-travel-simpler-plan"
            >
              Plan your trip
            </button>
          </div>

          {/* Right Column: 3 Benefit Cards matching Screenshot 6 */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            
            {/* Card 1 */}
            <div className="border border-white/15 bg-white/5 rounded-2xl p-6 text-center flex flex-col items-center justify-center hover:bg-white/10 transition-colors shadow-sm">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 flex items-center justify-center mb-4">
                <span className="text-lg font-bold">₹</span>
              </div>
              <h3 className="font-sans font-bold text-sm text-white mb-2 leading-snug">
                Verified travel partners
              </h3>
              <p className="text-[10px] font-bold tracking-widest text-emerald-200/80 uppercase">
                TRUSTED NETWORK
              </p>
            </div>

            {/* Card 2 */}
            <div className="border border-white/15 bg-white/5 rounded-2xl p-6 text-center flex flex-col items-center justify-center hover:bg-white/10 transition-colors shadow-sm">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 flex items-center justify-center mb-4">
                <Globe className="w-5 h-5 text-emerald-300" />
              </div>
              <h3 className="font-sans font-bold text-sm text-white mb-2 leading-snug">
                Secure trip planning
              </h3>
              <p className="text-[10px] font-bold tracking-widest text-emerald-200/80 uppercase">
                PROTECTED BOOKINGS
              </p>
            </div>

            {/* Card 3 */}
            <div className="border border-white/15 bg-white/5 rounded-2xl p-6 text-center flex flex-col items-center justify-center hover:bg-white/10 transition-colors shadow-sm">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5 text-emerald-300" />
              </div>
              <h3 className="font-sans font-bold text-sm text-white mb-2 leading-snug">
                Smart travel support
              </h3>
              <p className="text-[10px] font-bold tracking-widest text-emerald-200/80 uppercase">
                ONE CONNECTED PLATFORM
              </p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
