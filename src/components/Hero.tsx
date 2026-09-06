import React, { useEffect, useState } from 'react';
import { Star, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const HERO_ROTATING_WORDS = ['smarter', 'further', 'memorable', 'effortless'];

export const Hero: React.FC = () => {
  const { openPlanningLogin, setActiveView } = useApp();
  const [wordIndex, setWordIndex] = useState(0);

  const handleStartPlanning = () => {
    openPlanningLogin();
  };

  const handleExploreDestinations = () => {
    const el = document.getElementById('destinations-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setActiveView('home');
    }
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setWordIndex((current) => (current + 1) % HERO_ROTATING_WORDS.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div>
      {/* Main Visual Hero matching Screenshot 1 */}
      <section className="home-section-reveal home-motion relative w-full h-[540px] sm:h-[600px] lg:h-[680px] overflow-hidden select-none bg-stone-900">
        {/* Background lake sunrise image with canoe matching Screenshot 1 */}
        <img
          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2400&q=85"
          alt="Sunrise over misty lake with canoe"
          className="hero-depth-motion home-image-motion absolute inset-0 w-full h-full object-cover object-center"
          referrerPolicy="no-referrer"
        />

        {/* Soft vignette and warm sunlight overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
        <div className="hero-light-sweep absolute inset-0" />

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto h-full flex flex-col justify-center items-center text-center px-4 sm:px-6 pt-8 pb-16">
          {/* Cursive pink/rose script: "Plan smarter." matching Screenshot 1 */}
          <p className="font-script text-4xl sm:text-5xl md:text-6xl text-[#E8A5C3] italic mb-3 transform -rotate-1 drop-shadow-md" aria-live="polite">
            Plan <span key={HERO_ROTATING_WORDS[wordIndex]} className="hero-word-swap">{HERO_ROTATING_WORDS[wordIndex]}.</span>
          </p>

          {/* Bold Display Headline matching Screenshot 1 */}
          <h1 className="font-sans font-bold text-3xl sm:text-5xl md:text-6xl lg:text-[64px] text-white leading-[1.15] tracking-tight max-w-4xl drop-shadow-lg mb-8">
            Build every journey your way, <br className="hidden sm:inline" />
            from travel bookings to <br className="hidden sm:inline" />
            unforgettable places.
          </h1>

          {/* Action Buttons matching Screenshot 1 */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
            <button
              onClick={handleStartPlanning}
              className="home-button-motion bg-[#9D3373] hover:bg-[#862960] text-white px-7 py-3 rounded-full text-sm font-semibold tracking-wide shadow-lg active:scale-95 transition-all cursor-pointer"
              id="hero-btn-start-planning"
            >
              Start planning
            </button>

            <button
              onClick={handleExploreDestinations}
              className="home-button-motion border-2 border-white/80 hover:border-white text-white hover:bg-white/15 px-7 py-3 rounded-full text-sm font-semibold tracking-wide backdrop-blur-xs active:scale-95 transition-all cursor-pointer"
              id="hero-btn-explore-destinations"
            >
              Explore destinations
            </button>
          </div>

          {/* Bottom Left Origin Tag: "VOYAGO • PUNE, INDIA" matching Screenshot 1 */}
          <div className="absolute bottom-6 left-6 sm:left-10 text-left">
            <p className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-white/80">
              VOYAGO • PUNE, INDIA
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Reviews Bar directly under hero matching Screenshot 1 & 2 */}
      <section className="home-section-reveal home-scroll-reveal bg-[#FAF8F5] border-b border-stone-200/80 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          
          {/* Left: Reviews & Rating */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-stone-700">
            <div className="flex items-center gap-1.5 text-stone-500 font-semibold tracking-wider uppercase text-[11px]">
              <CheckCircle className="w-3.5 h-3.5 text-stone-600" />
              <span>REVIEWS</span>
            </div>
            <div className="flex items-center text-[#9D3373]">
              <Star className="w-3.5 h-3.5 fill-[#9D3373] text-[#9D3373]" />
              <Star className="w-3.5 h-3.5 fill-[#9D3373] text-[#9D3373]" />
              <Star className="w-3.5 h-3.5 fill-[#9D3373] text-[#9D3373]" />
              <Star className="w-3.5 h-3.5 fill-[#9D3373] text-[#9D3373]" />
              <Star className="w-3.5 h-3.5 fill-[#9D3373] text-[#9D3373]" />
            </div>
            <span className="font-bold text-stone-900">4.9 Rating</span>
            <span className="text-stone-300">•</span>
            <span className="text-stone-600">2,500+ Happy Travellers</span>
          </div>

          {/* Right: Platform Trust Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-[11px] font-bold tracking-wider text-stone-500 uppercase mr-1">
              TRUSTED TRAVEL PLATFORM:
            </span>
            <span className="home-shimmer home-glass border border-stone-300 bg-white text-[11px] font-bold text-stone-700 px-3 py-1 rounded-md tracking-wider uppercase shadow-2xs">
              SECURE BOOKINGS
            </span>
            <span className="home-shimmer home-glass border border-stone-300 bg-white text-[11px] font-bold text-stone-700 px-3 py-1 rounded-md tracking-wider uppercase shadow-2xs">
              VERIFIED PARTNERS
            </span>
            <span className="home-shimmer home-glass border border-stone-300 bg-white text-[11px] font-bold text-stone-700 px-3 py-1 rounded-md tracking-wider uppercase shadow-2xs">
              24/7 SUPPORT
            </span>
          </div>

        </div>
      </section>
      <div className="overflow-hidden bg-[#1A1A1A] text-white py-2.5 border-b border-stone-800">
        <div className="home-marquee-track flex w-max whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.28em]">
          <span className="px-8">Plan smarter • Travel further • Stay curious •</span>
          <span className="px-8">Plan smarter • Travel further • Stay curious •</span>
          <span className="px-8">Plan smarter • Travel further • Stay curious •</span>
          <span className="px-8">Plan smarter • Travel further • Stay curious •</span>
        </div>
      </div>
    </div>
  );
};
