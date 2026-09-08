import React, { useState } from 'react';
import {
  Plane,
  Train,
  Bus,
  Hotel as HotelIcon,
  Car,
  Compass,
  CalendarCheck,
  Bookmark,
  Bell,
  User as UserIcon,
  Settings,
  LogOut,
  MapPin,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Shield,
  Printer,
  ChevronRight,
  Filter,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getBookingStatus } from '../../utils/bookingStatus';
import { TravelMode, TravelOption, Hotel, Vehicle, TouristPlace } from '../../types';

type CustomerTab =
  | 'dashboard'
  | 'plan-trip'
  | 'transport'
  | 'hotels'
  | 'vehicles'
  | 'places'
  | 'my-trips'
  | 'saved'
  | 'notifications'
  | 'profile'
  | 'settings';

export const CustomerPortal: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    logout,
    destinations,
    travelOptions,
    hotels,
    vehicles,
    touristPlaces,
    bookings,
    cancelBooking,
    savedItems,
    toggleSaveItem,
    isItemSaved,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    startNewTrip,
    setIsPlannerOpen,
    setActiveView,
    updateProfile,
    customerActiveTab,
    setCustomerActiveTab,
  } = useApp();

  const activeTab = (customerActiveTab as CustomerTab) || 'dashboard';
  const setActiveTab = (tab: CustomerTab) => setCustomerActiveTab(tab);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransportMode, setSelectedTransportMode] = useState<TravelMode | 'ALL'>('ALL');
  const [selectedVehicleType, setSelectedVehicleType] = useState<'ALL' | 'CAR' | 'BIKE'>('ALL');
  const [selectedDestinationFilter, setSelectedDestinationFilter] = useState<string>('ALL');

  // User Profile form state
  const [profileName, setProfileName] = useState(currentUser?.name || 'Arjun Sharma');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || 'arjun.sharma@example.com');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '+91 98765 43210');
  const [profileCity, setProfileCity] = useState(currentUser?.city || '');
  const [profileState, setProfileState] = useState(currentUser?.state || '');
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  // Settings state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [darkThemeLock, setDarkThemeLock] = useState(true);

  const customerBookings = bookings.filter((b) => b.userId === currentUser.id);
  const customerNotifications = notifications.filter((n) => n.userId === currentUser.id);
  const customerSavedItems = savedItems.filter((item) => item.userId === currentUser.id);
  const unreadNotifsCount = customerNotifications.filter((n) => !n.isRead).length;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name: profileName,
      email: profileEmail,
      phone: profilePhone,
      city: profileCity,
      state: profileState,
    });
    setProfileSavedMsg(true);
    setTimeout(() => setProfileSavedMsg(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 py-8 px-4 sm:px-6 lg:px-8 font-sans-ui">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Header Card */}
        <div className="bg-[#FAF8F5] border border-stone-200/90 rounded-3xl p-6 md:p-8 mb-8 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#9D3373]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#9D3373]/10 border border-[#9D3373]/30 text-[#9D3373] flex items-center justify-center text-2xl font-bold">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#9D3373] px-2.5 py-0.5 rounded-full bg-[#9D3373]/10 border border-[#9D3373]/20">
                    Customer Member
                  </span>
                  <span className="text-xs text-stone-300">•</span>
                  <span className="text-xs text-stone-500">{currentUser.email}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-stone-900">
                  Welcome, <span className="font-script text-[#9D3373] font-normal italic">{currentUser.name}</span>
                </h1>
                <p className="text-xs text-stone-500 font-normal mt-1">
                  Manage trips, explore flights &amp; stays, choose seats, and enjoy rule-based travel recommendations.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => startNewTrip('dest-goa')}
                className="px-6 py-3 rounded-full bg-[#9D3373] hover:bg-[#862960] text-white font-bold uppercase tracking-[0.12em] text-xs flex items-center gap-2 shadow-xs transition-all active:scale-98"
                id="customer-quick-plan-btn"
              >
                <Sparkles className="w-4 h-4" />
                <span>Plan a Trip</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('notifications')}
                className="relative p-3 rounded-full border border-stone-200 hover:border-stone-300 text-stone-600 hover:text-stone-900 bg-stone-50 transition-all shadow-2xs"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#9D3373] ring-2 ring-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Layout Grid: Sidebar Tabs + Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Navigation Sidebar */}
          <div className="lg:col-span-3 space-y-3">
            <div className="bg-[#FAF8F5] border border-stone-200/90 rounded-2xl p-3 shadow-xs space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Compass },
                { id: 'plan-trip', label: 'Search & Plan Trip', icon: Sparkles },
                { id: 'transport', label: 'Flights, Trains & Buses', icon: Plane },
                { id: 'hotels', label: 'Hotels & Rooms', icon: HotelIcon },
                { id: 'vehicles', label: 'Vehicle Rentals', icon: Car },
                { id: 'places', label: 'Tourist Places', icon: MapPin },
                { id: 'my-trips', label: 'My Trips', icon: CalendarCheck, badge: customerBookings.length },
                { id: 'saved', label: 'Saved Places', icon: Bookmark, badge: customerSavedItems.length },
                { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifsCount },
                { id: 'profile', label: 'Profile', icon: UserIcon },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as CustomerTab)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                      isActive
                        ? 'bg-[#9D3373] text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </div>
                    {typeof tab.badge === 'number' && tab.badge > 0 && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-white/25 text-white'
                            : 'bg-stone-100 text-stone-700 border border-stone-200'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="border-t border-stone-100 pt-2 mt-2">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-all font-semibold uppercase tracking-wider"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* Rule-based Recommendation Notice */}
            <div className="bg-[#EFECE5] border border-stone-200/90 rounded-2xl p-4 text-xs text-stone-600 space-y-2">
              <div className="flex items-center gap-2 text-[#9D3373] font-bold uppercase tracking-wider text-[10px]">
                <Shield className="w-3.5 h-3.5" />
                <span>Rule-Based Transparency</span>
              </div>
              <p className="leading-relaxed font-normal">
                Rankings on VOYAGO are calculated deterministically using mathematical scoring from your budget, group size, and preferences — strictly free of generative AI hallucinations.
              </p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-6">

            {/* TAB 1: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-in fade-in">
                {/* Stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#FAF8F5] border border-stone-200/90 rounded-2xl p-5 shadow-xs">
                    <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold block mb-1">
                      Active Bookings
                    </span>
                    <p className="text-3xl font-bold tracking-tight text-[#9D3373]">
                      {customerBookings.filter((b) => b.status === 'CONFIRMED').length}
                    </p>
                    <p className="text-xs text-stone-500 mt-1">Confirmed itineraries</p>
                  </div>

                  <div className="bg-[#FAF8F5] border border-stone-200/90 rounded-2xl p-5 shadow-xs">
                    <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold block mb-1">
                      Saved Sights
                    </span>
                    <p className="text-3xl font-bold tracking-tight text-stone-900">
                      {customerSavedItems.length}
                    </p>
                    <p className="text-xs text-stone-500 mt-1">Places in your bucket list</p>
                  </div>

                  <div className="bg-[#FAF8F5] border border-stone-200/90 rounded-2xl p-5 shadow-xs">
                    <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold block mb-1">
                      Explore Hub
                    </span>
                    <p className="text-3xl font-bold tracking-tight text-stone-900">
                      {destinations.length} Destinations
                    </p>
                    <p className="text-xs text-stone-500 mt-1">Ready for custom travel</p>
                  </div>
                </div>

                {/* Latest Booking Banner */}
                {customerBookings.length > 0 ? (
                  <div className="bg-[#FAF8F5] border border-[#9D3373]/30 rounded-3xl p-6 shadow-xs relative overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Confirmed Reservation
                          </span>
                          <span className="text-xs font-mono text-[#9D3373] font-bold">
                            {customerBookings[0].id}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight text-stone-900">
                          Upcoming Journey: {customerBookings[0].destination}
                        </h3>
                        <p className="text-xs text-stone-500 mt-1">
                          {customerBookings[0].departureDate} → {customerBookings[0].returnDate} • {customerBookings[0].travelersCount} Travelers
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveTab('my-trips')}
                          className="px-5 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
                        >
                          View Voucher
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#FAF8F5] border border-stone-200/90 rounded-3xl p-8 text-center space-y-4 shadow-xs">
                    <Compass className="w-12 h-12 text-[#9D3373] mx-auto opacity-70" />
                    <h3 className="text-2xl font-bold tracking-tight text-stone-900">
                      No active bookings yet
                    </h3>
                    <p className="text-xs text-stone-500 max-w-md mx-auto">
                      Plan your next journey with our coordinated end-to-end trip builder. Select transport, pick seats, reserve rooms, and add rides.
                    </p>
                    <button
                      type="button"
                      onClick={() => startNewTrip('dest-goa')}
                      className="px-6 py-3 rounded-full bg-[#9D3373] hover:bg-[#862960] text-white font-bold uppercase tracking-[0.12em] text-xs inline-flex items-center gap-2 transition-all shadow-xs"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Start Your First Trip</span>
                    </button>
                  </div>
                )}

                {/* Featured Destinations Grid */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight text-stone-900">
                        Featured Destinations
                      </h3>
                      <p className="text-xs text-stone-500">Curated destinations ready for instant booking</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('plan-trip')}
                      className="text-xs text-[#9D3373] hover:underline uppercase tracking-wider font-bold"
                    >
                      View All →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {destinations.slice(0, 4).map((dest) => (
                      <div
                        key={dest.id}
                        className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden hover:border-[#9D3373]/50 transition-all flex flex-col justify-between group shadow-xs"
                      >
                        <div className="relative h-44 overflow-hidden">
                          <img
                            src={dest.imageUrl}
                            alt={dest.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-[#9D3373] text-xs font-bold px-2.5 py-1 rounded-full border border-stone-200 shadow-2xs">
                            ★ {dest.rating}
                          </div>
                          <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-xs text-white text-xs font-medium px-2.5 py-1 rounded-md">
                            {dest.bestTimeToVisit}
                          </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-xl font-bold text-stone-900">{dest.name}</h4>
                              <span className="text-xs text-[#9D3373] font-bold">{dest.state}</span>
                            </div>
                            <p className="text-xs text-stone-600 line-clamp-2 mb-4 font-normal leading-relaxed">
                              {dest.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                            <div>
                              <span className="text-[10px] text-stone-500 uppercase font-semibold block">Starting from</span>
                              <span className="text-lg font-bold text-[#9D3373]">
                                ₹{((typeof dest.estimatedBudget === 'object' && dest.estimatedBudget !== null
                                  ? dest.estimatedBudget.Moderate
                                  : typeof dest.estimatedBudget === 'number'
                                  ? dest.estimatedBudget
                                  : dest.averageBudget) || 12000).toLocaleString()}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => startNewTrip(dest.id)}
                              className="px-4 py-2 rounded-full bg-[#1A1A1A] hover:bg-[#9D3373] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-2xs"
                            >
                              Plan Trip
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SEARCH & PLAN TRIP */}
            {activeTab === 'plan-trip' && (
              <div className="bg-white border border-stone-200/90 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs animate-in fade-in">
                <div>
                  <h3 className="text-3xl font-bold tracking-tight text-stone-900 mb-2">
                    Search Trips &amp; Coordinate Planning
                  </h3>
                  <p className="text-stone-500 text-xs font-normal">
                    Enter your parameters below. Our rule-based system will score and present the optimal flights, hotels, rooms, and optional rental vehicles.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {destinations.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => startNewTrip(d.id)}
                      className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-4 hover:border-[#9D3373] cursor-pointer transition-all flex items-center gap-4 group shadow-2xs"
                    >
                      <img
                        src={d.imageUrl}
                        alt={d.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-stone-900 group-hover:text-[#9D3373] transition-colors">
                          {d.name}
                        </h4>
                        <p className="text-xs text-stone-500">{d.state}</p>
                        <span className="text-[11px] text-[#9D3373] font-bold mt-1 block">
                          From ₹{((typeof d.estimatedBudget === 'object' && d.estimatedBudget !== null
                            ? d.estimatedBudget.Budget
                            : typeof d.estimatedBudget === 'number'
                            ? d.estimatedBudget
                            : d.averageBudget) || 9999).toLocaleString()}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#9D3373]" />
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-stone-100 flex justify-center">
                  <button
                    type="button"
                    onClick={() => startNewTrip('dest-goa')}
                    className="px-8 py-3.5 rounded-full bg-[#9D3373] hover:bg-[#862960] text-white font-bold uppercase tracking-[0.12em] text-xs flex items-center gap-2 shadow-xs transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Launch Interactive 7-Step Trip Planner</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: FLIGHTS, TRAINS & BUSES */}
            {activeTab === 'transport' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-3xl font-bold tracking-tight text-stone-900">
                      Flights, Trains &amp; Buses
                    </h3>
                    <p className="text-xs text-stone-500">
                      Coordinated schedules with interactive seat selection
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1.5">City</label>
                      <input type="text" value={profileCity} onChange={(e) => setProfileCity(e.target.value)} className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9D3373]" required />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1.5">State</label>
                      <input type="text" value={profileState} onChange={(e) => setProfileState(e.target.value)} className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9D3373]" required />
                    </div>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 bg-white border border-stone-200/90 p-1 rounded-xl shadow-2xs">
                    {(['ALL', 'FLIGHT', 'TRAIN', 'BUS'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setSelectedTransportMode(mode)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                          selectedTransportMode === mode
                            ? 'bg-[#9D3373] text-white shadow-2xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {mode === 'ALL' ? 'All Modes' : mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {travelOptions
                    .filter((t) => selectedTransportMode === 'ALL' || t.mode === selectedTransportMode)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="bg-white border border-stone-200/90 rounded-2xl p-5 hover:border-[#9D3373]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] border border-stone-200 flex items-center justify-center text-[#9D3373]">
                            {item.mode === 'FLIGHT' && <Plane className="w-6 h-6" />}
                            {item.mode === 'TRAIN' && <Train className="w-6 h-6" />}
                            {item.mode === 'BUS' && <Bus className="w-6 h-6" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg font-bold text-stone-900">
                                {item.operator}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-stone-100 border border-stone-200 font-mono text-stone-700">
                                {item.code}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-stone-500">
                              <span>
                                {item.fromCity} ({item.departureTime}) → {item.toCity} ({item.arrivalTime})
                              </span>
                              <span>•</span>
                              <span>{item.duration}</span>
                              <span>•</span>
                              <span className="text-emerald-600 font-semibold">
                                {item.availableSeats} seats left
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-stone-100">
                          <div className="md:text-right">
                            <span className="text-[10px] uppercase text-stone-500 font-semibold block">Fare per person</span>
                            <span className="text-xl font-bold text-[#9D3373]">
                              ₹{item.pricePerPerson.toLocaleString()}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              startNewTrip(item.toCity.toLowerCase().includes('goa') ? 'dest-goa' : 'dest-jaipur');
                            }}
                            className="px-5 py-2 rounded-full bg-[#1A1A1A] hover:bg-[#9D3373] text-white font-bold uppercase tracking-wider text-xs transition-all shadow-2xs"
                          >
                            Select &amp; Pick Seat
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* TAB 4: HOTELS & ROOMS */}
            {activeTab === 'hotels' && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <h3 className="text-3xl font-bold tracking-tight text-stone-900">
                    Luxury Stays &amp; Room Selection
                  </h3>
                  <p className="text-xs text-stone-500">
                    Handcrafted partner hotels with verified real-time room inventories
                  </p>
                </div>

                <div className="space-y-6">
                  {hotels.map((hotel) => (
                    <div
                      key={hotel.id}
                      className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-xs"
                    >
                      <div className="flex flex-col md:flex-row gap-6 p-6">
                        <div className="relative md:w-64 h-48 rounded-xl overflow-hidden shrink-0 border border-stone-200">
                          <img
                            src={hotel.heroImage}
                            alt={hotel.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs text-[#9D3373] text-xs font-bold px-2 py-0.5 rounded-full border border-stone-200 shadow-2xs">
                            ★ {hotel.rating}
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-2xl font-bold text-stone-900">{hotel.name}</h4>
                              <button
                                type="button"
                                onClick={() => toggleSaveItem({
                                  itemId: hotel.id,
                                  type: 'HOTEL',
                                  title: hotel.name,
                                  subtitle: hotel.address,
                                  imageUrl: hotel.heroImage,
                                })}
                                className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-[#9D3373] transition-colors"
                              >
                                <Bookmark
                                  className={`w-5 h-5 ${
                                    isItemSaved(hotel.id) ? 'fill-[#9D3373] text-[#9D3373]' : ''
                                  }`}
                                />
                              </button>
                            </div>
                            <p className="text-xs text-stone-500 mb-3">{hotel.address}</p>
                            <p className="text-xs text-stone-600 font-normal leading-relaxed mb-4">
                              {hotel.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {hotel.amenities.map((a, i) => (
                              <span
                                key={i}
                                className="text-[10px] bg-[#FAF8F5] border border-stone-200 text-stone-700 px-2.5 py-1 rounded-md"
                              >
                                {a}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Room types preview */}
                      <div className="border-t border-stone-100 bg-[#FAF8F5] p-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-3">
                          Available Room Categories
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {hotel.rooms.map((room) => (
                            <div
                              key={room.id}
                              className="bg-white border border-stone-200/80 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs"
                            >
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <h5 className="text-sm font-bold text-stone-900">
                                    {room.name}
                                  </h5>
                                  <span className="text-[10px] text-[#9D3373] uppercase font-bold">
                                    {room.type}
                                  </span>
                                </div>
                                <p className="text-[11px] text-stone-500 mb-2">
                                  Capacity: {room.maxGuests || room.capacity || 2} Guests • {room.bedType}
                                </p>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                                <div>
                                  <span className="text-base font-bold text-[#9D3373]">
                                    ₹{room.pricePerNight.toLocaleString()}
                                  </span>
                                  <span className="text-[9px] text-stone-500"> / night</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => startNewTrip(hotel.destinationId)}
                                  className="px-3 py-1 rounded-full bg-[#1A1A1A] hover:bg-[#9D3373] text-white text-[10px] font-bold uppercase tracking-wider transition-all"
                                >
                                  Reserve
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: VEHICLE RENTALS */}
            {activeTab === 'vehicles' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-3xl font-bold tracking-tight text-stone-900">
                      Vehicle Rentals (Optional)
                    </h3>
                    <p className="text-xs text-stone-500">
                      Explore Cars, Bikes &amp; Scooters with daily pricing and immediate availability
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white border border-stone-200/90 p-1 rounded-xl shadow-2xs">
                    {(['ALL', 'CAR', 'BIKE'] as const).map((vt) => (
                      <button
                        key={vt}
                        type="button"
                        onClick={() => setSelectedVehicleType(vt)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                          selectedVehicleType === vt
                            ? 'bg-[#9D3373] text-white shadow-2xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {vt === 'ALL' ? 'All Rides' : vt === 'CAR' ? 'Cars' : 'Bikes'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {vehicles
                    .filter((v) => selectedVehicleType === 'ALL' || v.type === selectedVehicleType)
                    .map((veh) => (
                      <div
                        key={veh.id}
                        className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative h-44 rounded-xl overflow-hidden mb-4 border border-stone-200">
                            <img
                              src={veh.imageUrl}
                              alt={veh.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs text-[#9D3373] text-xs font-bold px-2 py-0.5 rounded-full border border-stone-200 shadow-2xs">
                              ★ {veh.rating}
                            </div>
                            <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                              {veh.category}
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-xl font-bold text-stone-900">{veh.name}</h4>
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                veh.isAvailable
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {veh.isAvailable ? 'Available' : 'Reserved'}
                            </span>
                          </div>

                          <p className="text-xs text-stone-500 mb-3">
                            {veh.transmission} • {veh.seats} Seats • {veh.fuelType}
                          </p>

                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {veh.features.map((f, i) => (
                              <span
                                key={i}
                                className="text-[10px] bg-[#FAF8F5] border border-stone-200 text-stone-700 px-2 py-0.5 rounded"
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                          <div>
                            <span className="text-xl font-bold text-[#9D3373]">
                              ₹{veh.dailyRate.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-stone-500"> / day</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => startNewTrip(veh.destinationId)}
                            className="px-4 py-2 rounded-full bg-[#1A1A1A] hover:bg-[#9D3373] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-2xs"
                          >
                            Rent in Trip
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* TAB 6: TOURIST PLACES */}
            {activeTab === 'places' && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <h3 className="text-3xl font-bold tracking-tight text-stone-900">
                    Tourist Places &amp; Sights
                  </h3>
                  <p className="text-xs text-stone-500">
                    Discover iconic attractions without rigid day-by-day itineraries. Save to your wishlist or add to trip plans.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {touristPlaces.map((place) => {
                    const isSaved = isItemSaved(place.id);

                    return (
                      <div
                        key={place.id}
                        className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative h-44 border-b border-stone-200">
                            <img
                              src={place.imageUrl}
                              alt={place.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs text-[#9D3373] text-xs font-bold px-2 py-0.5 rounded-full border border-stone-200 shadow-2xs">
                              ★ {place.rating}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                toggleSaveItem({
                                  itemId: place.id,
                                  type: 'PLACE',
                                  title: place.name,
                                  subtitle: place.category,
                                  imageUrl: place.imageUrl,
                                })
                              }
                              className="absolute top-2 left-2 p-1.5 rounded-full bg-white/90 text-stone-600 hover:text-[#9D3373] transition-colors border border-stone-200 shadow-2xs"
                            >
                              <Bookmark
                                className={`w-4 h-4 ${isSaved ? 'fill-[#9D3373] text-[#9D3373]' : ''}`}
                              />
                            </button>
                          </div>

                          <div className="p-4">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-lg font-bold text-stone-900">{place.name}</h4>
                              <span className="text-[10px] text-[#9D3373] uppercase font-bold">
                                {place.category}
                              </span>
                            </div>
                            <p className="text-xs text-stone-500 line-clamp-2 mb-3 font-normal">
                              {place.description}
                            </p>

                            <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-stone-400" />
                                {place.visitDuration || place.timeRequired || '1-2 hours'}
                              </span>
                              <span className="text-[#9D3373] font-bold">
                                Entry: {place.entryFee === 0 ? 'Free' : `₹${place.entryFee}`}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 pt-0">
                          <button
                            type="button"
                            onClick={() => startNewTrip(place.destinationId)}
                            className="w-full py-2 rounded-xl bg-[#1A1A1A] hover:bg-[#9D3373] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-2xs"
                          >
                            Include in Trip
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 7: MY TRIPS */}
            {activeTab === 'my-trips' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-bold tracking-tight text-stone-900">
                      My Trips &amp; Bookings
                    </h3>
                    <p className="text-xs text-stone-500">
                      View confirmed vouchers, print travel receipts, or manage active bookings
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startNewTrip('dest-goa')}
                    className="px-5 py-2 rounded-full bg-[#9D3373] hover:bg-[#862960] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-2xs"
                  >
                    + Book New Trip
                  </button>
                </div>

                {customerBookings.length === 0 ? (
                  <div className="bg-white border border-stone-200/90 rounded-3xl p-12 text-center space-y-4 shadow-xs">
                    <CalendarCheck className="w-12 h-12 text-stone-400 mx-auto" />
                    <h4 className="text-2xl font-bold text-stone-900">
                      No reservations found
                    </h4>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      You haven't made any bookings yet. Create your first tailored journey now.
                    </p>
                    <button
                      type="button"
                      onClick={() => startNewTrip('dest-goa')}
                      className="px-6 py-2.5 rounded-full bg-[#9D3373] hover:bg-[#862960] text-white font-bold uppercase text-xs shadow-2xs transition-all"
                    >
                      Plan a Trip Now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {customerBookings.map((b) => {
                      const bookingStatus = getBookingStatus(b);
                      return (
                      <div
                        key={b.id}
                        className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-xs space-y-6"
                      >
                        {/* Booking Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                                  bookingStatus === 'CONFIRMED'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}
                              >
                                {bookingStatus}
                              </span>
                              <span className="text-xs font-mono font-bold text-[#9D3373]">{b.id}</span>
                            </div>
                            <h4 className="text-2xl font-bold text-stone-900">
                              {b.destination} Trip
                            </h4>
                            <p className="text-xs text-stone-500 mt-0.5">
                              {b.departureDate} → {b.returnDate} ({b.durationDays} Days • {b.travelersCount} Travelers)
                            </p>
                          </div>

                          <div className="sm:text-right">
                            <span className="text-[10px] uppercase text-stone-500 font-semibold block">Total Amount Paid</span>
                            <span className="text-2xl font-bold text-[#9D3373]">
                              ₹{b.totalCost.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-stone-500 block">via {b.payment.method}</span>
                          </div>
                        </div>

                        {/* Breakdown lines */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          {/* Transport */}
                          <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-4">
                            <div className="flex items-center gap-2 text-[#9D3373] font-bold mb-2">
                              <Plane className="w-4 h-4" />
                              <span className="uppercase tracking-wider text-[10px]">Travel Route</span>
                            </div>
                            {b.transport ? (
                              <>
                                <p className="font-bold text-stone-900">{b.transport.operator}</p>
                                <p className="text-stone-500">{b.transport.departureTime} – {b.transport.arrivalTime}</p>
                                {b.selectedSeats && b.selectedSeats.length > 0 && (
                                  <span className="mt-2 inline-block text-[10px] px-2 py-0.5 rounded bg-[#9D3373]/10 text-[#9D3373] font-mono font-bold">
                                    {b.transportClass === 'NON_AC' ? 'Non-AC' : 'AC'} • Seats: {b.selectedSeats.join(', ')}
                                  </span>
                                )}
                              </>
                            ) : (
                              <p className="text-stone-500">Self-arranged travel</p>
                            )}
                          </div>

                          {/* Hotel */}
                          <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-4">
                            <div className="flex items-center gap-2 text-[#9D3373] font-bold mb-2">
                              <HotelIcon className="w-4 h-4" />
                              <span className="uppercase tracking-wider text-[10px]">Accommodations</span>
                            </div>
                            {b.hotel ? (
                              <>
                                <p className="font-bold text-stone-900">{b.hotel.name}</p>
                                <p className="text-stone-500">
                                  {b.hotel.roomName} ({b.hotel.condition === 'NON_AC' ? 'Non-AC' : 'AC'} • {b.hotel.nights} Nights)
                                </p>
                                <p className="text-[10px] text-stone-500 mt-1">{b.hotel.address}</p>
                              </>
                            ) : (
                              <p className="text-stone-500">No hotel reserved</p>
                            )}
                          </div>

                          {/* Vehicle */}
                          <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-4">
                            <div className="flex items-center gap-2 text-[#9D3373] font-bold mb-2">
                              <Car className="w-4 h-4" />
                              <span className="uppercase tracking-wider text-[10px]">Vehicle Rental</span>
                            </div>
                            {b.vehicle ? (
                              <>
                                <p className="font-bold text-stone-900">{b.vehicle.name}</p>
                                <p className="text-stone-500">{b.vehicle.type} ({b.vehicle.days} Days)</p>
                                <span className="mt-2 inline-block text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                                  Confirmed Pickup
                                </span>
                              </>
                            ) : (
                              <p className="text-stone-500">Vehicle rental skipped</p>
                            )}
                          </div>
                        </div>

                        {/* Booking actions */}
                        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-stone-100">
                          <div className="text-[11px] text-stone-500">
                            Booked on {new Date(b.createdAt).toLocaleDateString()} • Ref: {b.payment.transactionRef}
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => window.print()}
                              className="px-4 py-2 rounded-full border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Print Voucher</span>
                            </button>

                            {bookingStatus === 'CONFIRMED' && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Are you sure you want to cancel booking ${b.id}? Inventory will be restored.`)) {
                                    cancelBooking(b.id);
                                  }
                                }}
                                className="px-4 py-2 rounded-full border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold uppercase tracking-wider transition-all"
                              >
                                Cancel Booking
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 8: SAVED PLACES */}
            {activeTab === 'saved' && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <h3 className="text-3xl font-bold tracking-tight text-stone-900">
                    Saved Places &amp; Wishlist
                  </h3>
                  <p className="text-xs text-stone-500">
                    Keep track of hotels and tourist attractions you want to visit
                  </p>
                </div>

                {customerSavedItems.length === 0 ? (
                  <div className="bg-white border border-stone-200/90 rounded-3xl p-12 text-center space-y-4 shadow-xs">
                    <Bookmark className="w-12 h-12 text-stone-400 mx-auto" />
                    <h4 className="text-2xl font-bold text-stone-900">
                      No saved places yet
                    </h4>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      Click the bookmark icon on any hotel or attraction to add it to your wishlist.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {customerSavedItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
                      >
                        <div>
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-40 object-cover"
                            />
                          )}
                          <div className="p-4">
                            <span className="text-[10px] text-[#9D3373] uppercase font-bold block mb-1">
                              {item.type}
                            </span>
                            <h4 className="text-lg font-bold text-stone-900 mb-1">
                              {item.title}
                            </h4>
                            {item.subtitle && (
                              <p className="text-xs text-stone-500">{item.subtitle}</p>
                            )}
                          </div>
                        </div>

                        <div className="p-4 pt-0 flex items-center justify-between border-t border-stone-100 mt-2">
                          <button
                            type="button"
                            onClick={() => toggleSaveItem(item)}
                            className="text-xs text-rose-600 hover:underline font-semibold"
                          >
                            Remove
                          </button>
                          <button
                            type="button"
                            onClick={() => startNewTrip('dest-goa')}
                            className="px-3.5 py-1.5 rounded-full bg-[#1A1A1A] hover:bg-[#9D3373] text-white text-xs font-bold uppercase tracking-wider transition-all"
                          >
                            Plan Trip
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 9: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-bold tracking-tight text-stone-900">
                      Notifications &amp; Alerts
                    </h3>
                    <p className="text-xs text-stone-500">
                      Stay updated on bookings, partner updates, and travel vouchers
                    </p>
                  </div>

                  {customerNotifications.length > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-xs text-[#9D3373] hover:underline uppercase tracking-wider font-bold"
                    >
                      Mark All as Read
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {customerNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`bg-white border rounded-2xl p-4 flex items-start gap-4 transition-all cursor-pointer shadow-2xs ${
                        notif.isRead ? 'border-stone-200/70 opacity-70' : 'border-[#9D3373]/30 bg-[#FAF8F5]'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#9D3373]/10 text-[#9D3373] flex items-center justify-center shrink-0 mt-0.5">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-base font-bold text-stone-900">
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-stone-500">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 font-normal leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#9D3373] shrink-0 mt-2" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 10: PROFILE */}
            {activeTab === 'profile' && (
              <div className="bg-white border border-stone-200/90 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs animate-in fade-in">
                <div>
                  <h3 className="text-3xl font-bold tracking-tight text-stone-900 mb-2">
                    Customer Profile
                  </h3>
                  <p className="text-xs text-stone-500 font-normal">
                    Update personal information and contact details for tickets &amp; hotel check-in
                  </p>
                </div>

                {profileSavedMsg && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Profile saved successfully!</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1.5">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9D3373] focus:ring-1 focus:ring-[#9D3373]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9D3373] focus:ring-1 focus:ring-[#9D3373]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1.5">
                      Mobile Phone Number
                    </label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9D3373] focus:ring-1 focus:ring-[#9D3373]"
                      required
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-full bg-[#9D3373] hover:bg-[#862960] text-white font-bold uppercase tracking-wider text-xs shadow-2xs transition-all"
                    >
                      Save Profile Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 11: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="bg-white border border-stone-200/90 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs animate-in fade-in">
                <div>
                  <h3 className="text-3xl font-bold tracking-tight text-stone-900 mb-2">
                    Account &amp; Travel Preferences
                  </h3>
                  <p className="text-xs text-stone-500 font-normal">
                    Manage notifications, currency, and system themes
                  </p>
                </div>

                <div className="space-y-4 max-w-lg divide-y divide-stone-100">
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <p className="text-xs font-bold text-stone-900">Email Trip Vouchers</p>
                      <p className="text-[11px] text-stone-500">Receive PDF vouchers upon instant confirmation</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="w-4 h-4 accent-[#9D3373]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <p className="text-xs font-bold text-stone-900">SMS Updates</p>
                      <p className="text-[11px] text-stone-500">Get gate numbers and check-in reminders via SMS</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={smsAlerts}
                      onChange={(e) => setSmsAlerts(e.target.checked)}
                      className="w-4 h-4 accent-[#9D3373]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <p className="text-xs font-bold text-stone-900">Voyago Warm Aesthetic</p>
                      <p className="text-[11px] text-stone-500">Sophisticated warm neutral and berry palette</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="w-4 h-4 accent-[#9D3373]"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
