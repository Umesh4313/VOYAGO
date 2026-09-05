import React from 'react';
import { useApp } from '../context/AppContext';

export const HowItWorks: React.FC = () => {
  const { openPlanningLogin } = useApp();

  const handleStartPlanning = () => {
    openPlanningLogin();
  };

  return (
    <section className="home-section-reveal bg-[#FAF8F5] py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-stone-200/80 select-none">
      <div className="max-w-7xl mx-auto">
        
        {/* Large Chartreuse Lime Card matching Screenshot 4 */}
        <div className="bg-[#CEE678] rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Headline, Steps & CTA */}
            <div className="lg:col-span-7">
              {/* Script Title matching Screenshot 4 */}
              <p className="font-script text-3xl sm:text-4xl text-[#9D3373] italic mb-3 transform -rotate-1">
                How it works?
              </p>

              {/* Bold Display Headline matching Screenshot 4 */}
              <h2 className="font-sans font-bold text-3xl sm:text-4xl md:text-5xl text-stone-900 tracking-tight leading-tight max-w-lg mb-8">
                Build your perfect trip in a few simple steps.
              </h2>

              {/* Numbered Steps matching Screenshot 4 */}
              <div className="space-y-4 sm:space-y-5 mb-10">
                <div className="flex items-center gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#9D3373] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                    1
                  </div>
                  <span className="font-sans font-semibold text-stone-900 text-sm sm:text-base">
                    Choose your destination and dates
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#9D3373] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                    2
                  </div>
                  <span className="font-sans font-semibold text-stone-900 text-sm sm:text-base">
                    Select travel, stays and seats
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#9D3373] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                    3
                  </div>
                  <span className="font-sans font-semibold text-stone-900 text-sm sm:text-base">
                    Confirm your journey securely
                  </span>
                </div>
              </div>

              {/* Action Button matching Screenshot 4 */}
              <button
                onClick={handleStartPlanning}
                className="bg-[#9D3373] hover:bg-[#862960] text-white px-7 py-3 rounded-full text-xs font-semibold uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
                id="btn-how-it-works-start"
              >
                Start planning your trip
              </button>
            </div>

            {/* Right Column: Smiling Traveler Photo matching Screenshot 4 */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="home-shimmer home-float relative w-full max-w-sm aspect-4/5 rounded-3xl overflow-hidden shadow-xl bg-white/20">
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=85"
                  alt="Smiling traveler enjoying scenic mountain journey"
                  referrerPolicy="no-referrer"
                  className="home-image-motion w-full h-full object-cover"
                />
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
