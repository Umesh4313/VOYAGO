import React from 'react';
import { Star } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FeaturedStays: React.FC = () => {
  const { openPlanningLogin } = useApp();

  const stays = [
    {
      id: 'hotel-fern-pune',
      city: 'PUNE',
      type: 'BOUTIQUE HOTEL',
      name: 'The Fern Pune',
      description: 'A calm, connected stay with modern rooms and thoughtful essentials for city explorers.',
      pricePerNight: 3500,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85',
      alt: 'The Fern Pune boutique modern hotel room',
    },
    {
      id: 'hotel-palm-grove',
      city: 'GOA',
      type: 'BEACH RESORT',
      name: 'Palm Grove Goa',
      description: 'Unwind near the coast with spacious rooms, warm hospitality, and easy beach access.',
      pricePerNight: 5200,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85',
      alt: 'Palm Grove Goa colorful coastal beach resort with palms',
    },
  ];

  return (
    <section id="hotels-section" className="home-section-reveal home-scroll-reveal bg-[#FAF8F5] py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-stone-200/80 select-none">
      <div className="max-w-7xl mx-auto">
        
        {/* Header matching Screenshot 9 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-6">
          <div>
            <p className="font-script text-3xl sm:text-4xl text-[#C05888] italic mb-2 transform -rotate-1">
              Stay awhile.
            </p>
            <h2 className="font-sans font-bold text-3xl sm:text-4xl md:text-5xl text-stone-900 tracking-tight leading-tight max-w-xl">
              Comfortable stays for every kind of journey.
            </h2>
          </div>

          <button
            onClick={openPlanningLogin}
            className="self-start md:self-auto bg-[#9D3373] hover:bg-[#862960] text-white px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer"
            id="btn-explore-stays"
          >
            Explore stays
          </button>
        </div>

        {/* 2 Large Hotel Cards Grid matching Screenshot 9 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {stays.map((stay) => (
            <div
              key={stay.id}
              onClick={openPlanningLogin}
              className="home-card-motion bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col"
              id={`stay-${stay.id}`}
            >
              {/* Photo with rating badge on top right */}
              <div className="relative aspect-16/10 bg-stone-100 overflow-hidden">
                <img
                  src={stay.image}
                  alt={stay.alt}
                  referrerPolicy="no-referrer"
                  className="home-image-motion w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Rating Badge matching Screenshot 9 */}
                <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{stay.rating}</span>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-stone-500 mb-2">
                    {stay.city} • {stay.type}
                  </p>
                  
                  <h3 className="font-sans font-bold text-2xl text-stone-900 mb-2.5 group-hover:text-[#9D3373] transition-colors">
                    {stay.name}
                  </h3>

                  <p className="text-stone-600 text-sm leading-relaxed mb-6 font-light">
                    {stay.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                  <p className="text-sm sm:text-base font-bold text-stone-900">
                    From ₹{stay.pricePerNight.toLocaleString()} <span className="font-normal text-stone-500 text-xs sm:text-sm">/ night</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
