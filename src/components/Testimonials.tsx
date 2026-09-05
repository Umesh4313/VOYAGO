import React from 'react';
import { Star } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const reviews = [
    {
      id: 'rev-1',
      author: 'Aarav',
      badge: 'VERIFIED TRAVELLER',
      image: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=600&q=80',
      alt: 'Elephants in river in India',
      quote: 'VOYAGO made our Pune to Goa trip effortless. The transport, hotel and places to visit were perfectly matched to our budget.',
    },
    {
      id: 'rev-2',
      author: 'Priya',
      badge: 'VERIFIED TRAVELLER',
      image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80',
      alt: 'Misty green mountain road',
      quote: 'From choosing our seats to confirming our room, every step felt simple. We had a smooth, memorable family holiday in Kerala.',
    },
    {
      id: 'rev-3',
      author: 'Rohan',
      badge: 'VERIFIED TRAVELLER',
      image: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?auto=format&fit=crop&w=600&q=80',
      alt: 'Desert dunes and camel caravan',
      quote: 'The recommendations helped us discover the best places in Rajasthan without overplanning. VOYAGO kept the whole journey organised.',
    },
    {
      id: 'rev-4',
      author: 'Meera',
      badge: 'VERIFIED TRAVELLER',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      alt: 'Golden sunset over desert dunes',
      quote: 'Our hotel, vehicle and travel bookings were confirmed instantly after payment. The trip summary made everything easy to follow.',
    },
  ];

  return (
    <div>
      {/* 1. Trusted by Travellers In / Media Press Bar matching Screenshot 3 */}
      <section className="home-section-reveal bg-[#EFECE5] py-10 px-4 sm:px-6 lg:px-8 border-b border-stone-200/70 select-none">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-stone-500 mb-6">
            TRUSTED BY TRAVELLERS IN
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 lg:gap-20 text-stone-700 opacity-90">
            <span className="font-serif italic text-lg sm:text-xl text-stone-700">
              Travel + Leisure
            </span>
            <span className="font-sans font-medium text-xs sm:text-sm tracking-[0.2em] uppercase text-stone-700">
              CONDÉ NAST TRAVELLER
            </span>
            <span className="font-serif italic text-base sm:text-lg font-medium text-stone-700">
              The Economic Times
            </span>
            <span className="font-sans font-bold text-xs sm:text-sm tracking-[0.15em] uppercase text-stone-700">
              INDIA TODAY
            </span>
            <span className="font-sans font-bold text-base sm:text-lg text-stone-800 tracking-tight">
              YourStory
            </span>
          </div>
        </div>
      </section>

      {/* 2. Traveller Stories & Reviews matching Screenshot 3 */}
      <section id="reviews-section" className="home-section-reveal bg-[#FAF8F5] py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-stone-200/80 select-none">
        <div className="max-w-7xl mx-auto">
          
          {/* Header matching Screenshot 3 */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-6">
            <div>
              <p className="font-script text-3xl sm:text-4xl text-[#C05888] italic mb-2 transform -rotate-1">
                Traveller stories
              </p>
              <h2 className="font-sans font-bold text-3xl sm:text-4xl md:text-5xl text-stone-900 tracking-tight leading-tight">
                Real journeys, thoughtfully planned.
              </h2>
            </div>

            <button
              onClick={() => document.getElementById('reviews-grid')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              className="self-start md:self-auto bg-[#9D3373] hover:bg-[#862960] text-white px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer"
              id="btn-read-all-reviews"
            >
              Read all reviews
            </button>
          </div>

          {/* 4 Testimonial Cards Grid matching Screenshot 3 */}
          <div id="reviews-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="home-card-motion home-shimmer bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-xs flex flex-col justify-between transition-all hover:shadow-md"
              >
                <div>
                  {/* Top Photo with rounded corners */}
                  <div className="aspect-16/10 rounded-xl overflow-hidden mb-4 bg-stone-100">
                    <img
                      src={rev.image}
                      alt={rev.alt}
                      referrerPolicy="no-referrer"
                      className="home-image-motion w-full h-full object-cover"
                    />
                  </div>

                  {/* 5 Berry Stars matching Screenshot 3 */}
                  <div className="flex items-center gap-1 mb-3 text-[#9D3373]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#9D3373] text-[#9D3373]" />
                    ))}
                  </div>

                  {/* Review text */}
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed mb-6 font-normal">
                    {rev.quote}
                  </p>
                </div>

                {/* Author Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                  <span className="font-sans font-bold text-sm text-stone-900">
                    {rev.author}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C05888]">
                    {rev.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
};
