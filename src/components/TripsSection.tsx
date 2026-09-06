import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface TripPackage {
  id: string;
  destinationId: string;
  nights: number;
  title: string;
  pricePerPerson: number;
  image: string;
  alt: string;
}

const FEATURED_TRIPS: TripPackage[] = [
  {
    id: 'trip-goa',
    destinationId: 'dest-goa',
    nights: 5,
    title: 'Pune to Goa coastal escape with stays and sightseeing',
    pricePerPerson: 18499,
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    alt: 'Pune to Goa coastal escape with stays and sightseeing',
  },
  {
    id: 'trip-kerala',
    destinationId: 'dest-kerala',
    nights: 6,
    title: 'Kerala backwaters, beaches and heritage towns',
    pricePerPerson: 24999,
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    alt: 'Kerala backwaters, beaches and heritage towns',
  },
  {
    id: 'trip-rajasthan',
    destinationId: 'dest-rajasthan',
    nights: 4,
    title: 'Rajasthan forts, markets and desert sunsets',
    pricePerPerson: 16750,
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    alt: 'Rajasthan forts, markets and desert sunsets',
  },
  {
    id: 'trip-himachal',
    destinationId: 'dest-manali',
    nights: 5,
    title: 'Himachal mountain trails and riverside retreats',
    pricePerPerson: 21500,
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    alt: 'Himachal mountain trails and riverside retreats',
  },
];

export const TripsSection: React.FC = () => {
  const { startNewTrip, openPlanningLogin } = useApp();
  const [scrollIndex, setScrollIndex] = useState(0);

  const handleSelectTrip = (trip: TripPackage) => {
    startNewTrip(trip.destinationId, '2026-10-15', '2026-10-20', 2, 'Moderate', 'CAR', false);
    openPlanningLogin();
  };

  const handleNext = () => {
    setScrollIndex((prev) => (prev + 1) % FEATURED_TRIPS.length);
  };

  const handlePrev = () => {
    setScrollIndex((prev) => (prev - 1 + FEATURED_TRIPS.length) % FEATURED_TRIPS.length);
  };

  return (
    <section id="trips-section" className="home-section-reveal home-scroll-reveal bg-[#FAF8F5] py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-stone-200/80 select-none">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header matching Screenshot 2 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-6">
          <div>
            <p className="font-script text-3xl sm:text-4xl text-[#C05888] italic mb-2 transform -rotate-1">
              Plan every mile.
            </p>
            <h2 className="font-sans font-bold text-3xl sm:text-4xl md:text-5xl text-stone-900 tracking-tight max-w-2xl leading-tight">
              Build a smarter journey from departure to discovery.
            </h2>
          </div>

          <button
            onClick={() => {
              openPlanningLogin();
            }}
            className="self-start md:self-auto bg-[#9D3373] hover:bg-[#862960] text-white px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer"
            id="btn-explore-trips"
          >
            Explore trips
          </button>
        </div>

        {/* 4 Cards Grid matching Screenshot 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {FEATURED_TRIPS.map((trip) => (
            <div
              key={trip.id}
              onClick={() => handleSelectTrip(trip)}
              className="home-card-motion group cursor-pointer flex flex-col rounded-2xl p-1"
              id={`card-${trip.id}`}
            >
              {/* Photo Container */}
              <div className="relative aspect-4/5 rounded-2xl overflow-hidden mb-4 bg-stone-200 shadow-sm transition-transform duration-300 group-hover:shadow-md">
                <img
                  src={trip.image}
                  alt={trip.alt}
                  referrerPolicy="no-referrer"
                  className="home-image-motion w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Duration Badge matching Screenshot 2 */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-stone-800 text-xs font-semibold px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9D3373]"></span>
                  <span>{trip.nights} nights</span>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-sans font-bold text-base sm:text-lg text-stone-900 leading-snug mb-1.5 group-hover:text-[#9D3373] transition-colors line-clamp-2">
                {trip.title}
              </h3>

              {/* Price */}
              <p className="text-xs sm:text-sm text-stone-600 font-medium">
                From ₹{trip.pricePerPerson.toLocaleString()} / person
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Carousel Controls matching Screenshot 2 */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            onClick={handlePrev}
            className="w-9 h-9 rounded-full border border-stone-300 bg-white hover:bg-stone-50 hover:border-stone-400 flex items-center justify-center text-stone-700 transition-colors shadow-2xs cursor-pointer active:scale-95"
            aria-label="Previous trips"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="w-9 h-9 rounded-full border border-stone-300 bg-white hover:bg-stone-50 hover:border-stone-400 flex items-center justify-center text-stone-700 transition-colors shadow-2xs cursor-pointer active:scale-95"
            aria-label="Next trips"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
