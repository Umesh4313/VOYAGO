import React from 'react';

export const PhotoCollage: React.FC = () => {
  return (
    <section className="home-section-reveal bg-[#FAF8F5] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden select-none border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto relative">
        
        {/* Playful Irregular Photo Grid matching Screenshot 7 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6 items-center">
          
          {/* Left Column: Lion & Elephants */}
          <div className="lg:col-span-3 flex flex-col gap-5 sm:gap-6">
            <div className="aspect-4/3 rounded-3xl overflow-hidden shadow-sm bg-stone-200">
              <img
                src="https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80"
                alt="Majestic lion portrait"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="aspect-square rounded-3xl overflow-hidden shadow-sm bg-stone-200">
              <img
                src="https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=800&q=80"
                alt="Elephants at water's edge"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Center-Left: Giraffe silhouette */}
          <div className="lg:col-span-2 flex flex-col justify-center">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-sm bg-stone-200">
              <img
                src="https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=800&q=80"
                alt="Giraffe silhouette against amber sunset"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Center Main: Canoe on lake */}
          <div className="lg:col-span-4">
            <div className="aspect-4/5 rounded-3xl overflow-hidden shadow-md bg-stone-200">
              <img
                src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=85"
                alt="Man canoeing across vast open blue lake"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Right Column: Desert road with script overlay + Acacia sunset */}
          <div className="lg:col-span-3 flex flex-col gap-5 sm:gap-6 relative pt-8 lg:pt-0">
            {/* Script Heading floating over top right photo matching Screenshot 7 */}
            <div className="absolute top-0 left-2 sm:-top-8 sm:-left-4 lg:-top-10 lg:-left-6 z-10 pointer-events-none">
              <p className="font-script text-3xl sm:text-4xl lg:text-5xl text-[#C05888] italic whitespace-nowrap transform -rotate-6 drop-shadow-xs">
                So, where will <br />
                VOYAGO take you?
              </p>
            </div>

            <div className="aspect-4/3 rounded-3xl overflow-hidden shadow-sm bg-stone-200 mt-6 lg:mt-0">
              <img
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80"
                alt="Endless open desert road and mountains"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="aspect-16/10 rounded-3xl overflow-hidden shadow-sm bg-stone-200">
              <img
                src="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80"
                alt="Lone acacia tree against golden sunset sky"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
