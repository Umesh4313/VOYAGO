import React from 'react';
import { Compass, Sliders, RefreshCw, RotateCcw } from 'lucide-react';

export const SmartFeatures: React.FC = () => {
  const features = [
    {
      id: 'f-1',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-9 h-9 text-[#C05888]">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="4" />
          <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
          <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
          <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
          <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
        </svg>
      ),
      title: 'Plan every detail with ease.',
      description: 'Search flights, trains and buses, select your seats, choose a hotel and shape your trip in one seamless flow.',
    },
    {
      id: 'f-2',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-9 h-9 text-[#C05888]">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
          <circle cx="9" cy="6" r="2" fill="white" />
          <circle cx="15" cy="12" r="2" fill="white" />
          <circle cx="8" cy="18" r="2" fill="white" />
        </svg>
      ),
      title: 'Make your journey your own.',
      description: 'Adjust destinations, dates, travellers, budget and vehicle preferences until your travel plan feels exactly right.',
    },
    {
      id: 'f-3',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-9 h-9 text-[#C05888]">
          <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
          <path d="M11 19h8.2a1.8 1.8 0 0 0 1.55-.86 1.8 1.8 0 0 0-.05-1.79l-4.2-7.35" />
          <path d="M20 7h-3.5a1.8 1.8 0 0 1-1.55-.86 1.8 1.8 0 0 1 0-1.8L16.2 2" />
          <path d="M12 2a10 10 0 1 0 10 10" />
        </svg>
      ),
      title: 'Travel confidently, all in one place.',
      description: 'Clear prices, availability and booking details help you make informed choices from your first search to confirmed trip.',
    },
    {
      id: 'f-4',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-9 h-9 text-[#C05888]">
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <path d="M16 16h5v5" />
        </svg>
      ),
      title: 'Ready when your plans change.',
      description: 'Review your confirmed bookings, manage your travel details and keep every seat, room, vehicle and place to visit together in My Trips.',
    },
  ];

  return (
    <section className="home-section-reveal bg-[#FAF8F5] py-18 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-stone-200/80 select-none">
      <div className="max-w-7xl mx-auto text-center">
        
        {/* Header matching Screenshot 8 */}
        <h2 className="font-sans font-bold text-3xl sm:text-4xl md:text-5xl text-stone-900 tracking-tight">
          Smart trips, designed for you
        </h2>
        
        <p className="font-script text-3xl sm:text-4xl md:text-5xl text-[#C05888] italic mt-1 mb-4 transform -rotate-1">
          Around your journey
        </p>

        <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-16 font-light">
          VOYAGO brings transport, stays, vehicles and experiences into one clear travel plan. Choose what suits your dates, budget and preferences, with every option easy to compare.
        </p>

        {/* 4 Columns matching Screenshot 8 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 text-left">
          {features.map((feat) => (
            <div key={feat.id} className="home-card-motion rounded-2xl p-5 -m-5 flex flex-col">
              <div className="mb-5">
                {feat.icon}
              </div>
              <h3 className="font-sans font-bold text-lg text-stone-900 leading-snug mb-2.5">
                {feat.title}
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed font-light">
                {feat.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
