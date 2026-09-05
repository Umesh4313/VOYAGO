import React from 'react';

export const StatsBar: React.FC = () => {
  return (
    <section className="bg-[#FAF8F5] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-stone-200 text-center">
          
          <div className="py-6 md:py-2 px-4">
            <p className="font-serif-display text-4xl sm:text-5xl font-light italic text-[#9D3373] tracking-tight mb-2">
              48,000<span className="text-[#9D3373]/70 font-sans-ui text-2xl sm:text-3xl not-italic ml-1">+</span>
            </p>
            <p className="text-stone-500 text-xs uppercase tracking-[0.15em] font-medium">Travelers planned trips</p>
          </div>

          <div className="py-6 md:py-2 px-4">
            <p className="font-serif-display text-4xl sm:text-5xl font-light italic text-[#9D3373] tracking-tight mb-2">
              3,200<span className="text-[#9D3373]/70 font-sans-ui text-2xl sm:text-3xl not-italic ml-1">+</span>
            </p>
            <p className="text-stone-500 text-xs uppercase tracking-[0.15em] font-medium">Partner hotels listed</p>
          </div>

          <div className="py-6 md:py-2 px-4">
            <p className="font-serif-display text-4xl sm:text-5xl font-light italic text-[#9D3373] tracking-tight mb-2">
              1,150<span className="text-[#9D3373]/70 font-sans-ui text-2xl sm:text-3xl not-italic ml-1">+</span>
            </p>
            <p className="text-stone-500 text-xs uppercase tracking-[0.15em] font-medium">Cars &amp; bikes for rent</p>
          </div>

          <div className="py-6 md:py-2 px-4">
            <p className="font-serif-display text-4xl sm:text-5xl font-light italic text-[#9D3373] tracking-tight mb-2">
              4.7 <span className="text-stone-400 font-light not-italic text-2xl sm:text-3xl">/ 5</span>
            </p>
            <p className="text-stone-500 text-xs uppercase tracking-[0.15em] font-medium">Average trip rating</p>
          </div>

        </div>
      </div>
    </section>
  );
};

