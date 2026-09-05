import React from 'react';
import { useApp } from '../context/AppContext';

export const PopularDestinations: React.FC = () => {
  const { startNewTrip, setPlannerStep, openPlanningLogin } = useApp();

  const destinationsList = [
    {
      id: 'dest-goa',
      name: 'Goa',
      description: 'Sunlit beaches, Portuguese heritage and vibrant coastal escapes make Goa an easy favourite for every kind of traveller.',
      tripsCount: 48,
      staysCount: 126,
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1000&q=85',
      alt: 'Goa coastal beach with palm trees and ocean',
    },
    {
      id: 'dest-rajasthan',
      name: 'Rajasthan',
      description: "Trace golden forts, colourful bazaars and desert landscapes through India's most captivating royal state.",
      tripsCount: 36,
      staysCount: 94,
      image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1000&q=85',
      alt: 'Amber fort and palaces in Rajasthan',
    },
    {
      id: 'dest-kerala',
      name: 'Kerala',
      description: "Cruise tranquil backwaters, explore spice-scented hills and slow down among Kerala's lush natural beauty.",
      tripsCount: 29,
      staysCount: 82,
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1000&q=85',
      alt: 'Kerala backwater waterways and palm trees',
    },
    {
      id: 'dest-manali',
      name: 'Himachal Pradesh',
      description: "Find mountain air, pine forests and unforgettable adventure across India's spectacular northern valleys.",
      tripsCount: 41,
      staysCount: 108,
      image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1000&q=85',
      alt: 'Himachal Pradesh snow mountain peaks',
    },
  ];

  const handleSelectDestination = (destId: string) => {
    startNewTrip(destId, '2026-10-15', '2026-10-19', 2, 'Moderate', 'CAR');
    openPlanningLogin();
  };

  return (
    <section id="destinations-section" className="home-section-reveal home-scroll-reveal bg-[#FAF8F5] py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-stone-200/80 select-none">
      <div className="max-w-7xl mx-auto">
        
        {/* Header matching Screenshot 5 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-6">
          <div>
            <p className="font-script text-3xl sm:text-4xl text-[#C05888] italic mb-2 transform -rotate-1">
              Where will you go?
            </p>
            <h2 className="font-sans font-bold text-3xl sm:text-4xl md:text-5xl text-stone-900 tracking-tight leading-tight max-w-2xl">
              Discover destinations made for smarter, more memorable journeys.
            </h2>
          </div>

          <button
            onClick={() => {
              openPlanningLogin();
            }}
            className="self-start md:self-auto bg-[#9D3373] hover:bg-[#862960] text-white px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer"
            id="btn-explore-destinations"
          >
            Explore destinations
          </button>
        </div>

        {/* 4 Destination Cards Grid matching Screenshot 5 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinationsList.map((dest) => (
            <div
              key={dest.id}
              onClick={() => handleSelectDestination(dest.id)}
              className="home-card-motion group relative aspect-3/4 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer bg-stone-900"
              id={`dest-card-${dest.id}`}
            >
              {/* Background Photo */}
              <img
                src={dest.image}
                alt={dest.alt}
                referrerPolicy="no-referrer"
                className="home-image-motion w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Dark Gradient Overlay for optimal legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

              {/* Card Content at bottom matching Screenshot 5 */}
              <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 text-white flex flex-col justify-end">
                <h3 className="font-sans font-bold text-xl sm:text-2xl text-white mb-2 group-hover:text-[#F4B8D5] transition-colors">
                  {dest.name}
                </h3>
                <p className="text-white/85 text-xs sm:text-[13px] leading-relaxed mb-4 line-clamp-3 font-light">
                  {dest.description}
                </p>

                {/* Pill Badges: [X trips] [Y stays] matching Screenshot 5 */}
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-xs text-[11px] font-medium text-white transition-colors">
                    {dest.tripsCount} trips
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-xs text-[11px] font-medium text-white transition-colors">
                    {dest.staysCount} stays
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
