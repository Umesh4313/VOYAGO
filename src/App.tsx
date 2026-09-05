import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TripsSection } from './components/TripsSection';
import { Testimonials } from './components/Testimonials';
import { HowItWorks } from './components/HowItWorks';
import { PopularDestinations } from './components/PopularDestinations';
import { TravelSimplerBanner } from './components/TravelSimplerBanner';
import { PhotoCollage } from './components/PhotoCollage';
import { SmartFeatures } from './components/SmartFeatures';
import { FeaturedStays } from './components/FeaturedStays';
import { BottomCTA } from './components/BottomCTA';
import { Footer } from './components/Footer';
import { AuthModal } from './components/auth/AuthModal';
import { TripPlannerModal } from './components/planner/TripPlannerModal';
import { MyTripsView } from './components/trips/MyTripsView';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { HotelPartnerDashboard } from './components/partner/HotelPartnerDashboard';
import { VehiclePartnerDashboard } from './components/partner/VehiclePartnerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';

const MainLayout: React.FC = () => {
  const { activeView } = useApp();
  const [scrollProgress, setScrollProgress] = React.useState(0);

  const prepareLetterReveal = (heading: HTMLElement) => {
    if (heading.dataset.lettersReady === 'true') return;
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    let currentNode = walker.nextNode();
    while (currentNode) {
      if (currentNode.textContent) textNodes.push(currentNode as Text);
      currentNode = walker.nextNode();
    }
    textNodes.forEach((textNode) => {
      const fragment = document.createDocumentFragment();
      let letterIndex = 0;
      const tokens = (textNode.textContent ?? '').split(/(\s+)/);
      tokens.forEach((token) => {
        if (/^\s+$/.test(token)) {
          Array.from(token).forEach((character) => {
            const letter = document.createElement('span');
            letter.className = 'letter-reveal-char letter-reveal-space';
            letter.style.setProperty('--letter-index', `${letterIndex}`);
            letter.textContent = '\u00A0';
            fragment.appendChild(letter);
            letterIndex += 1;
          });
          return;
        }
        if (!token) return;
        const word = document.createElement('span');
        word.className = 'letter-reveal-word';
        Array.from(token).forEach((character) => {
          const letter = document.createElement('span');
          letter.className = 'letter-reveal-char';
          letter.style.setProperty('--letter-index', `${letterIndex}`);
          letter.textContent = character;
          word.appendChild(letter);
          letterIndex += 1;
        });
        fragment.appendChild(word);
      });
      textNode.parentNode?.replaceChild(fragment, textNode);
    });
    heading.dataset.lettersReady = 'true';
  };

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0);
    };
    updateScrollProgress();
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress);
    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', updateScrollProgress);
    };
  }, []);

  useEffect(() => {
    if (activeView !== 'home') return;
    let observer: IntersectionObserver | undefined;
    const frameId = window.requestAnimationFrame(() => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>('.home-section-reveal'));
      sections.forEach((section) => section.classList.add('reveal-ready'));
      sections.forEach((section) => {
        section.querySelectorAll<HTMLElement>('h1, h2, h3').forEach((heading) => {
          prepareLetterReveal(heading);
          if (heading.tagName === 'H1') heading.classList.add('typing-headline');
        });
      });
      observer = new IntersectionObserver(
        (entries) => entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
          } else {
            entry.target.classList.remove('reveal-visible');
          }
        }),
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
      );
      sections.forEach((section) => observer?.observe(section));
    });
    return () => {
      window.cancelAnimationFrame(frameId);
      observer?.disconnect();
    };
  }, [activeView]);

  return (
    <div className="min-h-screen flex flex-col relative text-stone-900 selection:bg-[#9D3373] selection:text-white font-sans-ui overflow-x-hidden bg-[#FAF8F5]">
      <div className="site-scroll-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${scrollProgress / 100})` }} />
      </div>
      {activeView === 'home' && (
        <svg className="home-journey-line" viewBox="0 0 44 720" aria-hidden="true">
          <path className="home-journey-line-track" d="M22 8 C42 90, 4 150, 22 230 S42 370, 22 450 S4 590, 22 712" />
          <path
            className="home-journey-line-progress"
            d="M22 8 C42 90, 4 150, 22 230 S42 370, 22 450 S4 590, 22 712"
            style={{ strokeDashoffset: 704 - (704 * scrollProgress) / 100 }}
          />
          <circle className="home-journey-line-dot" cx="22" cy="8" r="4" />
        </svg>
      )}
      
      {/* Sticky Header with Main Nav and Subnav matching Screenshot 1 */}
      <div className="relative z-30">
        <Navbar />
      </div>

      {/* Main View Area */}
      <main className="flex-1 relative z-10">
        {activeView === 'home' && (
          <>
            {/* Screenshot 1: Hero Banner with Canoe & Trust Bar */}
            <Hero />

            {/* Screenshot 2: Plan Every Mile - Trips Grid */}
            <TripsSection />

            {/* Screenshot 3: Press Bar & Traveller Stories Reviews */}
            <Testimonials />

            {/* Screenshot 4: How it Works Chartreuse Lime Card */}
            <HowItWorks />

            {/* Screenshot 5: Where Will You Go - Destinations Grid */}
            <PopularDestinations />

            {/* Screenshot 6: Deep Forest Green Travel Made Simpler */}
            <TravelSimplerBanner />

            {/* Screenshot 7: Creative Photo Collage Gallery */}
            <PhotoCollage />

            {/* Screenshot 8: Smart Trips Around Your Journey Features */}
            <SmartFeatures />

            {/* Screenshot 9: Stay Awhile - Comfortable Hotel Stays */}
            <FeaturedStays />

            {/* Screenshot 10: Go Further Mountain CTA & Our Travel Partners Bar */}
            <BottomCTA />
          </>
        )}

        {/* Dedicated Role Dashboards */}
        {activeView === 'customer' && (
          <div className="bg-[#FAF8F5] min-h-screen">
            <CustomerPortal />
          </div>
        )}

        {activeView === 'my-trips' && (
          <div className="bg-[#FAF8F5] min-h-screen">
            <MyTripsView />
          </div>
        )}

        {activeView === 'hotel-partner' && (
          <div className="bg-[#FAF8F5] min-h-screen">
            <HotelPartnerDashboard />
          </div>
        )}

        {activeView === 'vehicle-partner' && (
          <div className="bg-[#FAF8F5] min-h-screen">
            <VehiclePartnerDashboard />
          </div>
        )}

        {activeView === 'admin' && (
          <div className="bg-[#FAF8F5] min-h-screen">
            <AdminDashboard />
          </div>
        )}

        {/* Fallback to prevent blank white screen */}
        {!['home', 'customer', 'my-trips', 'hotel-partner', 'vehicle-partner', 'admin'].includes(activeView) && (
          <div className="bg-[#FAF8F5] min-h-screen">
            <CustomerPortal />
          </div>
        )}
      </main>

      {/* Screenshot 11: Travel Notes Newsletter & Deep Forest Green Footer */}
      <div className="relative z-20">
        <Footer />
      </div>

      {/* Global Interactive Modals */}
      <AuthModal />
      <TripPlannerModal />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </ErrorBoundary>
  );
}
