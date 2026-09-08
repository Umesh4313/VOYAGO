import React, { useState } from 'react';
import {
  Hotel,
  Plus,
  CheckCircle2,
  DollarSign,
  Users,
  Calendar,
  Sparkles,
  Save,
  Clock,
  Image as ImageIcon,
  CalendarDays,
  FileText,
  BarChart3,
  Bell,
  User as UserIcon,
  Settings,
  LogOut,
  Bed,
  Check,
  X,
  AlertTriangle,
  Building,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HotelRoom } from '../../types';
import { HotelPartnerAnalytics } from './HotelPartnerAnalytics';

type HotelTab =
  | 'dashboard'
  | 'hotel-details'
  | 'rooms'
  | 'add-room'
  | 'calendar'
  | 'bookings'
  | 'guests'
  | 'revenue'
  | 'notifications'
  | 'profile'
  | 'settings';

type RevenuePeriod = 'current' | 'last-month' | 'last-year';

export const HotelPartnerDashboard: React.FC = () => {
  const {
    currentUser,
    destinations,
    hotels,
    bookings,
    updateHotelRoomPrice,
    updateHotelRoomDetails,
    toggleHotelRoomAvailability,
    addHotelRoomType,
    logout,
    notifications,
    addNotification,
    addHotel,
  } = useApp();

  // Find partner's hotel
  const myHotel = hotels.find(
    (h) => h.partnerId === currentUser.id || (currentUser.email === 'hotel@gmail.com' && h.partnerId === 'demo-hotel-partner')
  );

  const [activeTab, setActiveTab] = useState<HotelTab>('dashboard');
  const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>('current');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [photoUploadMode, setPhotoUploadMode] = useState<'url' | 'device'>('url');

  // Room pricing state
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [roomUnits, setRoomUnits] = useState<number>(0);
  const [roomName, setRoomName] = useState('');
  const [roomBed, setRoomBed] = useState('');
  const [roomGuests, setRoomGuests] = useState(2);
  const [checkedIn, setCheckedIn] = useState<Record<string, { checkIn: string; checkOut?: string; aadhar: string; phone: string; address: string }>>({});
  const [toast, setToast] = useState<string | null>(null);

  // Add Room form state
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomType, setNewRoomType] = useState('Deluxe Room');
  const [newRoomBed, setNewRoomBed] = useState('1 King Bed');
  const [newRoomMaxGuests, setNewRoomMaxGuests] = useState(2);
  const [newRoomRate, setNewRoomRate] = useState(14500);
  const [newRoomNonAcRate, setNewRoomNonAcRate] = useState(11600);
  const [newRoomIsAC, setNewRoomIsAC] = useState(true);
  const [newRoomTotalUnits, setNewRoomTotalUnits] = useState(10);
  const [newRoomImage, setNewRoomImage] = useState(
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop&q=80'
  );
  const [newRoomGallery, setNewRoomGallery] = useState<string[]>([]);

  const readRoomImages = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).slice(0, 4).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const image = String(reader.result || '');
        setNewRoomGallery((previous) => [...previous.filter((item) => item !== image), image].slice(0, 4));
        setNewRoomImage((previous) => previous || image);
      };
      reader.readAsDataURL(file);
    });
  };

  const addPhotoFromURL = (url: string) => {
    if (url.trim()) {
      setNewRoomGallery((previous) => [...previous.filter((item) => item !== url), url].slice(0, 4));
      if (!newRoomImage || newRoomImage.includes('unsplash')) {
        setNewRoomImage(url);
      }
    }
  };

  // Hotel property details state
  const [propName, setPropName] = useState(myHotel?.name || '');
  const [propAddress, setPropAddress] = useState(myHotel?.address || '');
  const [propDesc, setPropDesc] = useState(myHotel?.description || '');
  const [propPhone, setPropPhone] = useState('+91 832 6683333');
  const [propEmail, setPropEmail] = useState('taj.goa@partner.voyago.com');
  const [propertyDestinationId, setPropertyDestinationId] = useState('dest-goa');

  if (!myHotel) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-10 shadow-xs">
          <div className="max-w-2xl mx-auto">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#9D3373]">Hotel Partner Console</span>
            <h1 className="mt-2 text-3xl font-bold text-stone-900">Set up your first property</h1>
            <p className="mt-3 text-stone-500">
              Welcome, {currentUser.name}. Complete these details to open your property dashboard.
            </p>
            <form
              className="mt-8 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (!propName.trim() || !propAddress.trim()) {
                  setToast('Property name and address are required.');
                  return;
                }
                addHotel({
                  name: propName.trim(),
                  destinationId: propertyDestinationId,
                  destinationName: destinations.find((destination) => destination.id === propertyDestinationId)?.name || '',
                  rating: 0,
                  reviewCount: 0,
                  address: propAddress.trim(),
                  city: 'Goa',
                  description: propDesc.trim(),
                  heroImage: newRoomImage,
                  gallery: [],
                  amenities: [],
                  partnerId: currentUser.id,
                  priceStartsFrom: 0,
                  rooms: [],
                  status: 'INACTIVE',
                  approvalStatus: 'PENDING',
                });
              }}
            >
              <label className="block text-sm font-semibold text-stone-700">
                Property name
                <input className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-3" value={propName} onChange={(event) => setPropName(event.target.value)} required />
              </label>
              <label className="block text-sm font-semibold text-stone-700">
                Address
                <input className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-3" value={propAddress} onChange={(event) => setPropAddress(event.target.value)} required />
              </label>
              <label className="block text-sm font-semibold text-stone-700">
                Destination
                <select className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-3" value={propertyDestinationId} onChange={(event) => setPropertyDestinationId(event.target.value)} required>
                  {destinations.map((destination) => <option key={destination.id} value={destination.id}>{destination.name}</option>)}
                </select>
              </label>
              <label className="block text-sm font-semibold text-stone-700">
                Description
                <textarea className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-3" rows={4} value={propDesc} onChange={(event) => setPropDesc(event.target.value)} />
              </label>
              <div className="flex flex-wrap gap-3 pt-2">
                <button type="submit" className="px-5 py-3 rounded-full bg-[#9D3373] text-white font-bold text-sm">
                  Create property dashboard
                </button>
                <button type="button" onClick={logout} className="px-5 py-3 rounded-full border border-stone-300 text-stone-700 font-bold text-sm">
                  Sign out
                </button>
              </div>
            </form>
            {toast && <p className="mt-4 text-sm text-[#9D3373]">{toast}</p>}
          </div>
        </div>
      </div>
    );
  }

  // Check for approval status
  if (myHotel?.approvalStatus === 'PENDING') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-10 shadow-xs">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-400 mx-auto mb-6 flex items-center justify-center">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-3xl font-bold text-stone-900">Waiting for Admin Approval</h1>
            <p className="mt-4 text-stone-600 font-light">
              Thank you for registering <strong>{myHotel.name}</strong> with Voyago!
            </p>
            <p className="mt-2 text-stone-500 text-sm">
              Your hotel property is currently under review by our admin team. This typically takes 24-48 hours.
            </p>
            <div className="mt-8 p-6 rounded-2xl bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-900">
                <strong>What happens next?</strong>
              </p>
              <ul className="mt-3 text-sm text-amber-800 space-y-2">
                <li>✓ Our team will verify your property details</li>
                <li>✓ We'll contact you if we need additional information</li>
                <li>✓ Once approved, you'll receive an email notification</li>
                <li>✓ You can then start adding rooms and managing bookings</li>
              </ul>
            </div>
            <div className="mt-8 flex gap-3 justify-center">
              <button
                type="button"
                onClick={logout}
                className="px-6 py-3 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-sm transition-colors"
              >
                Return to Customer Portal
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (myHotel?.approvalStatus === 'REJECTED') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-10 shadow-xs">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-rose-100 border-2 border-rose-400 mx-auto mb-6 flex items-center justify-center">
              <X className="w-8 h-8 text-rose-600" />
            </div>
            <h1 className="text-3xl font-bold text-stone-900">Application Rejected</h1>
            <p className="mt-4 text-stone-600 font-light">
              Unfortunately, your application for <strong>{myHotel.name}</strong> could not be approved.
            </p>
            {myHotel?.rejectionReason && (
              <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-left">
                <p className="text-xs font-semibold text-rose-900 mb-2">REASON:</p>
                <p className="text-sm text-rose-800">{myHotel.rejectionReason}</p>
              </div>
            )}
            <p className="mt-6 text-stone-500 text-sm">
              Please contact our support team for more information or to reapply.
            </p>
            <div className="mt-8 flex gap-3 justify-center">
              <button
                type="button"
                onClick={logout}
                className="px-6 py-3 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-sm transition-colors"
              >
                Return to Customer Portal
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hotelBookings = bookings.filter((b) => b.hotel?.id === myHotel.id);
  const totalRevenue = hotelBookings.reduce((sum, b) => sum + (b.hotel?.total || 0), 0);
  const periodConfig: Record<RevenuePeriod, { label: string; factor: number; points: string[] }> = {
    current: { label: 'Current period', factor: 1, points: ['W1', 'W2', 'W3', 'W4'] },
    'last-month': { label: 'Last month', factor: 0.88, points: ['W1', 'W2', 'W3', 'W4'] },
    'last-year': { label: 'Last year', factor: 1.35, points: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
  };
  const selectedPeriod = periodConfig[revenuePeriod];
  const revenuePoints = selectedPeriod.points.map((label, index) => ({
    label,
    gross: Math.round((totalRevenue * selectedPeriod.factor * (0.72 + index * 0.08)) / selectedPeriod.points.length),
  }));
  const periodGross = revenuePoints.reduce((sum, point) => sum + point.gross, 0);
  const periodVoyagoFee = Math.round(periodGross * 0.15);
  const periodProfit = periodGross - periodVoyagoFee;
  const maxChartValue = Math.max(1, ...revenuePoints.map((point) => point.gross));

  const handleSavePrice = (roomId: string) => {
    if (newPrice > 0) {
      updateHotelRoomPrice(myHotel.id, roomId, newPrice);
      updateHotelRoomDetails(myHotel.id, roomId, newPrice, roomUnits, { name: roomName, bedType: roomBed, maxGuests: roomGuests });
      setEditingRoomId(null);
      setToast('Room rate updated and synchronized in real time!');
      setTimeout(() => setToast(null), 3000);
    }
  };

  const startRoomEdit = (room: HotelRoom) => {
    setEditingRoomId(room.id);
    setRoomUnits(room.totalUnits || 10);
    setRoomName(room.name);
    setRoomBed(room.bedType);
    setRoomGuests(room.maxGuests);
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRoom: Omit<HotelRoom, 'id' | 'availableCount'> = {
      name: newRoomName,
      type: newRoomType,
      bedType: newRoomBed,
      maxGuests: Number(newRoomMaxGuests),
      pricePerNight: Number(newRoomRate),
      nonAcPricePerNight: newRoomIsAC ? undefined : Number(newRoomNonAcRate),
      totalUnits: Number(newRoomTotalUnits),
      bookedUnits: 0,
      amenities: ['Ocean View', 'Balcony', 'King Size Bed', 'Complimentary Breakfast', 'Free Wi-Fi'],
      imageUrl: newRoomImage,
      gallery: newRoomGallery,
      bathroomImageUrl: newRoomGallery[1],
      viewImageUrl: newRoomGallery[2],
      isAC: newRoomIsAC,
    };

    await addHotelRoomType(myHotel.id, newRoom);
    addNotification({
      userId: currentUser.id,
      title: 'New Room Added',
      message: `Successfully created "${newRoomName}" (${newRoomIsAC ? 'AC' : 'Non-AC'}) with ${newRoomTotalUnits} total units.`,
      type: 'PARTNER_UPDATE',
    });

    setToast(`Added new room "${newRoomName}" to inventory.`);
    setTimeout(() => setToast(null), 3000);
    setActiveTab('rooms');
    setNewRoomName('');
    setNewRoomGallery([]);
  };

  const handleSaveHotelDetails = (e: React.FormEvent) => {
    e.preventDefault();
    myHotel.name = propName;
    myHotel.address = propAddress;
    myHotel.description = propDesc;
    setToast('Hotel details saved and updated across Voyago.');
    setTimeout(() => setToast(null), 3000);
  };

  // 14-day calendar simulation
  const next14Days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
    };
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 py-8 px-4 sm:px-6 lg:px-8 font-sans-ui">
      <div className="max-w-7xl mx-auto">

        {/* Top Header Card */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 mb-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#9D3373]/10 border border-[#9D3373]/20 text-[#9D3373] flex items-center justify-center text-2xl font-serif-display font-light">
                <Hotel className="w-8 h-8 text-[#9D3373]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#9D3373] px-2 py-0.5 rounded-full bg-[#9D3373]/10 border border-[#9D3373]/20">
                    Hotel Partner Console
                  </span>
                  <span className="text-xs text-stone-400">•</span>
                  <span className="text-xs text-stone-500">Partner ID: {myHotel.id}</span>
                </div>
                <h1 className="font-serif-display text-3xl md:text-4xl font-light italic text-stone-900">
                  {myHotel.name}
                </h1>
                <p className="text-xs text-stone-500 font-normal mt-1">
                  Manage live room inventory, pricing, availability calendar, and guest reservations.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('add-room')}
                className="px-5 py-2.5 rounded-full bg-[#9D3373] hover:bg-[#862960] text-white font-bold uppercase tracking-wider text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Room</span>
              </button>

              <button
                type="button"
                onClick={logout}
                className="px-4 py-2.5 rounded-full border border-stone-300 hover:border-stone-400 text-xs font-bold uppercase tracking-wider text-stone-700 bg-white hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Customer View
              </button>
            </div>
          </div>
        </div>

        {toast && (
          <div className="mb-6 p-4 rounded-xl bg-[#9D3373]/10 border border-[#9D3373]/20 text-[#9D3373] text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#9D3373]" />
            <span>{toast}</span>
          </div>
        )}

        {/* Layout Grid: Sidebar Tabs + Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Navigation Sidebar */}
          <div className="lg:col-span-3 space-y-2">
            <div className="bg-white border border-stone-200 rounded-2xl p-3 shadow-xs space-y-1">
              {[
                { id: 'dashboard', label: 'Hotel Dashboard', icon: Hotel },
                { id: 'hotel-details', label: 'Hotel Details', icon: Building },
                { id: 'rooms', label: 'Rooms & Pricing', icon: Bed, badge: myHotel.rooms.length },
                { id: 'add-room', label: 'Add Room', icon: Plus },
                { id: 'calendar', label: 'Availability Calendar', icon: CalendarDays },
                { id: 'bookings', label: 'View Bookings', icon: FileText, badge: hotelBookings.length },
                { id: 'guests', label: 'Guest Check-in/out', icon: Users, badge: Object.keys(checkedIn).length },
                { id: 'revenue', label: 'Revenue Reports', icon: BarChart3 },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'profile', label: 'Partner Profile', icon: UserIcon },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as HotelTab)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#9D3373] text-white font-bold shadow-xs'
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
                            ? 'bg-white/20 text-white'
                            : 'bg-[#9D3373]/10 text-[#9D3373]'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="border-t border-stone-200 pt-2 mt-2">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-all font-medium uppercase tracking-wider cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout to Customer</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* TAB 1: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-in fade-in">
                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                      Total Payout Revenue
                    </span>
                    <p className="font-serif-display text-3xl font-light italic text-[#9D3373] mt-1">
                      ₹{totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-stone-500 mt-1">From {hotelBookings.length} confirmed stays</p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                      Active Room Inventory
                    </span>
                    <p className="font-serif-display text-3xl font-light italic text-stone-900 mt-1">
                      {myHotel.rooms.reduce((acc, r) => acc + (r.availableCount || 0), 0)} Rooms
                    </p>
                    <p className="text-[11px] text-stone-500 mt-1">Across {myHotel.rooms.length} room categories</p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                      Guest Satisfaction
                    </span>
                    <p className="font-serif-display text-3xl font-light italic text-[#9D3373] mt-1">
                      ★ {myHotel.rating} / 5.0
                    </p>
                    <p className="text-[11px] text-stone-500 mt-1">Based on {myHotel.reviewCount} verified reviews</p>
                  </div>
                </div>

                {/* Quick Room Status Overview */}
                <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif-display text-2xl font-light italic text-stone-900">
                      Room Categories &amp; Live Availability
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('rooms')}
                      className="text-xs text-[#9D3373] hover:underline uppercase tracking-wider font-semibold cursor-pointer"
                    >
                      Manage Rates &rarr;
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myHotel.rooms.map((room) => (
                      <div
                        key={room.id}
                        className="bg-[#FAF8F5] border border-stone-200 rounded-xl p-4 flex justify-between items-center"
                      >
                        <div>
                          <h4 className="font-serif-display text-lg font-light text-stone-900">{room.name}</h4>
                          <p className="text-xs text-stone-500">{room.bedType} • Max {room.maxGuests} Guests</p>
                          <span className="text-[11px] font-mono text-[#9D3373] font-bold mt-1 block">
                            ₹{room.pricePerNight.toLocaleString()} / night
                          </span>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                              room.availableCount > 0
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {room.availableCount > 0 ? `${room.availableCount} Available` : 'Sold Out'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: HOTEL DETAILS */}
            {activeTab === 'hotel-details' && (
              <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs animate-in fade-in">
                <div>
                  <h3 className="font-serif-display text-3xl font-light italic text-stone-900 mb-2">
                    Hotel Property Details
                  </h3>
                  <p className="text-xs text-stone-500 font-light">
                    Update listing information, amenities, contact details, and hero imagery
                  </p>
                </div>

                <form onSubmit={handleSaveHotelDetails} className="space-y-4 max-w-2xl">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
                      Hotel Brand &amp; Name
                    </label>
                    <input
                      type="text"
                      value={propName}
                      onChange={(e) => setPropName(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9D3373]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
                      Property Physical Address
                    </label>
                    <input
                      type="text"
                      value={propAddress}
                      onChange={(e) => setPropAddress(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9D3373]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
                      Property Description
                    </label>
                    <textarea
                      rows={3}
                      value={propDesc}
                      onChange={(e) => setPropDesc(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9D3373]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
                        Reservation Phone
                      </label>
                      <input
                        type="text"
                        value={propPhone}
                        onChange={(e) => setPropPhone(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9D3373]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
                        Reservation Email
                      </label>
                      <input
                        type="email"
                        value={propEmail}
                        onChange={(e) => setPropEmail(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9D3373]"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-full bg-[#9D3373] hover:bg-[#862960] text-white font-bold uppercase tracking-wider text-xs shadow-xs cursor-pointer"
                    >
                      Save Property Details
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: ROOMS & PRICING */}
            {activeTab === 'rooms' && (
              <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif-display text-3xl font-light italic text-stone-900 mb-1">
                      Rooms &amp; Pricing Management
                    </h3>
                    <p className="text-xs text-stone-500">
                      Formula: Available Rooms = Total Units ({myHotel.rooms.reduce((s, r) => s + (r.totalUnits || 10), 0)}) - Booked Units ({myHotel.rooms.reduce((s, r) => s + (r.bookedUnits || 0), 0)})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('add-room')}
                    className="px-4 py-2 rounded-full bg-[#9D3373] text-white hover:bg-[#862960] font-bold uppercase text-xs cursor-pointer"
                  >
                    + Add New Room
                  </button>
                </div>

                <div className="space-y-4">
                  {myHotel.rooms.map((room) => {
                    const isEditing = editingRoomId === room.id;
                    const isAvailable = room.availableCount > 0;

                    return (
                      <div
                        key={room.id}
                        className="p-5 rounded-2xl border border-stone-200 bg-[#FAF8F5] flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          {room.imageUrl && (
                            <img
                              src={room.imageUrl}
                              alt={room.name}
                              referrerPolicy="no-referrer"
                              className="w-16 h-16 rounded-xl object-cover border border-stone-200"
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-serif-display text-xl font-light text-stone-900">{room.name}</h4>
                              <span className="text-[10px] font-semibold bg-white border border-stone-200 px-2 py-0.5 rounded text-stone-600">
                                {room.type}
                              </span>
                            </div>
                            <p className="text-xs text-stone-500 mt-1">
                              {room.bedType} • Max {room.maxGuests} Guests • Total Units: {room.totalUnits || 10} • Booked: {room.bookedUnits || 0}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-stone-200">
                          {/* Price & Edit Control */}
                          <div>
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-stone-500">₹</span>
                                <input
                                  type="number"
                                  value={newPrice}
                                  onChange={(e) => setNewPrice(Number(e.target.value))}
                                  className="w-24 bg-white border border-[#9D3373] rounded-lg px-2 py-1 text-sm text-stone-900 font-mono"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSavePrice(room.id)}
                                  className="p-1.5 rounded-lg bg-[#9D3373] text-white hover:bg-[#862960] cursor-pointer"
                                  title="Save Rate"
                                >
                                  <Check className="w-4 h-4 stroke-[3]" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingRoomId(null)}
                                  className="p-1.5 rounded-lg bg-stone-200 text-stone-600 hover:text-stone-900 cursor-pointer"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div
                                onClick={() => {
                                  setEditingRoomId(room.id);
                                  setNewPrice(room.pricePerNight);
                                }}
                                className="cursor-pointer group flex items-center gap-1.5"
                                title="Click to edit night rate"
                              >
                                <span className="font-serif-display text-xl font-light italic text-[#9D3373] group-hover:underline">
                                  ₹{room.pricePerNight.toLocaleString()}
                                </span>
                                <span className="text-[10px] text-stone-500">/ night</span>
                              </div>
                            )}
                            {isEditing && <div className="grid grid-cols-2 gap-2 mt-2">
                              <input className="w-28 bg-white border border-stone-300 rounded px-2 py-1 text-xs" value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="Room name" />
                              <input className="w-20 bg-white border border-stone-300 rounded px-2 py-1 text-xs" type="number" value={roomUnits} onChange={(e) => setRoomUnits(Number(e.target.value))} placeholder="Units" />
                              <input className="w-28 bg-white border border-stone-300 rounded px-2 py-1 text-xs" value={roomBed} onChange={(e) => setRoomBed(e.target.value)} placeholder="Bed type" />
                              <input className="w-20 bg-white border border-stone-300 rounded px-2 py-1 text-xs" type="number" value={roomGuests} onChange={(e) => setRoomGuests(Number(e.target.value))} placeholder="Guests" />
                            </div>}
                          </div>

                          {/* Availability Toggle */}
                          <button
                            type="button"
                            onClick={() => toggleHotelRoomAvailability(myHotel.id, room.id)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              isAvailable
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                            }`}
                          >
                            {isAvailable ? `${room.availableCount} Available` : 'Sold Out / Closed'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: ADD ROOM */}
            {activeTab === 'add-room' && (
              <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs animate-in fade-in">
                <div>
                  <h3 className="font-serif-display text-3xl font-light italic text-stone-900 mb-2">
                    Add New Room Category
                  </h3>
                  <p className="text-xs text-stone-500 font-light">
                    Define room name, bed arrangements, night pricing, and inventory count
                  </p>
                </div>

                <form onSubmit={handleAddRoom} className="space-y-4 max-w-lg">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
                      Room Category Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Presidential Oceanfront Villa"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9D3373]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
                        Room Type
                      </label>
                      <select
                        value={newRoomType}
                        onChange={(e) => setNewRoomType(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9D3373]"
                      >
                        <option value="Deluxe Room">Deluxe Room</option>
                        <option value="Luxury Suite">Luxury Suite</option>
                        <option value="Presidential Suite">Presidential Suite</option>
                        <option value="Ocean Villa">Ocean Villa</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
                        Bed Configuration
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 1 King Bed"
                        value={newRoomBed}
                        onChange={(e) => setNewRoomBed(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9D3373]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
                        Max Guests
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        value={newRoomMaxGuests}
                        onChange={(e) => setNewRoomMaxGuests(Number(e.target.value))}
                        className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9D3373]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
                        Total Units
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={newRoomTotalUnits}
                        onChange={(e) => setNewRoomTotalUnits(Number(e.target.value))}
                        className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9D3373]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
                        AC / Non-AC
                      </label>
                      <select
                        value={newRoomIsAC ? 'AC' : 'NON_AC'}
                        onChange={(e) => setNewRoomIsAC(e.target.value === 'AC')}
                        className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9D3373]"
                      >
                        <option value="AC">AC Room</option>
                        <option value="NON_AC">Non-AC Room</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
                        Night Rate (₹)
                      </label>
                      <input
                        type="number"
                        min="1000"
                        step="500"
                        value={newRoomRate}
                        onChange={(e) => setNewRoomRate(Number(e.target.value))}
                        className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9D3373]"
                        placeholder="AC room price"
                      />
                    </div>

                    {!newRoomIsAC && (
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
                          Non-AC Rate (₹)
                        </label>
                        <input
                          type="number"
                          min="1000"
                          step="500"
                          value={newRoomNonAcRate}
                          onChange={(e) => setNewRoomNonAcRate(Number(e.target.value))}
                          className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9D3373]"
                          placeholder="Non-AC price"
                        />
                      </div>
                    )}
                  </div>

                  {/* Photo Upload Section */}
                  <div className="border-t border-stone-200 pt-4">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-3">
                      📸 Room Photos (Upload up to 4)
                    </label>
                    
                    <div className="flex gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => setPhotoUploadMode('device')}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                          photoUploadMode === 'device'
                            ? 'bg-[#9D3373] text-white'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        Upload from Device
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoUploadMode('url')}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                          photoUploadMode === 'url'
                            ? 'bg-[#9D3373] text-white'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        Add from URL
                      </button>
                    </div>

                    {photoUploadMode === 'device' && (
                      <label className="block">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => readRoomImages(e.target.files)}
                          className="block w-full text-xs text-stone-600 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:text-xs file:font-bold file:bg-[#9D3373]/10 file:text-[#9D3373] file:border-0 cursor-pointer"
                        />
                        <p className="text-[10px] text-stone-500 mt-1">Select up to 4 images</p>
                      </label>
                    )}

                    {photoUploadMode === 'url' && (
                      <div className="space-y-2">
                        <input
                          type="url"
                          placeholder="Paste image URL here..."
                          className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9D3373]"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                              addPhotoFromURL((e.target as HTMLInputElement).value.trim());
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            const input = (e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement);
                            if (input && input.value.trim()) {
                              addPhotoFromURL(input.value.trim());
                              input.value = '';
                            }
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-[#9D3373]/10 text-[#9D3373] text-xs font-bold hover:bg-[#9D3373]/20 transition-all"
                        >
                          Add URL to Gallery
                        </button>
                      </div>
                    )}

                    {newRoomGallery.length > 0 && (
                      <div className="mt-4">
                        <p className="text-[10px] font-bold text-stone-600 mb-2">
                          Photos added: {newRoomGallery.length}/4
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {newRoomGallery.map((image, index) => (
                            <div key={`${image}-${index}`} className="relative group">
                              <img
                                src={image}
                                alt={`Room photo ${index + 1}`}
                                className="w-full aspect-square rounded-lg object-cover border border-stone-200"
                              />
                              <button
                                type="button"
                                onClick={() => setNewRoomGallery((prev) => prev.filter((_, i) => i !== index))}
                                className="absolute top-1 right-1 p-1 rounded-full bg-rose-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex items-center gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-full bg-[#9D3373] hover:bg-[#862960] text-white font-bold uppercase tracking-wider text-xs shadow-xs cursor-pointer"
                    >
                      Create Room Category
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('rooms')}
                      className="px-4 py-2.5 rounded-full border border-stone-300 bg-white hover:bg-stone-50 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 5: AVAILABILITY CALENDAR */}
            {activeTab === 'calendar' && (
              <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs animate-in fade-in">
                <div>
                  <h3 className="font-serif-display text-3xl font-light italic text-stone-900 mb-2">
                    Room Availability Calendar (14 Days)
                  </h3>
                  <p className="text-xs text-stone-500 font-light">
                    Real-time occupancy tracking across upcoming dates
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                  {next14Days.map((d, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border text-center ${
                        d.isWeekend
                          ? 'bg-[#9D3373]/10 border-[#9D3373]/30'
                          : 'bg-[#FAF8F5] border-stone-200'
                      }`}
                    >
                      <span className="text-[10px] text-stone-500 uppercase block font-bold">{d.dayName}</span>
                      <span className="text-sm font-serif-display font-light text-stone-900 block my-1">{d.dateStr}</span>
                      {(() => {
                        const date = new Date();
                        date.setDate(date.getDate() + i);
                        const dateKey = date.toISOString().slice(0, 10);
                        const bookingsForDate = hotelBookings.filter((booking) => dateKey >= booking.departureDate && dateKey < booking.returnDate);
                        const totalRooms = myHotel.rooms.reduce((sum, room) => sum + (room.totalUnits || 0), 0);
                        const occupiedRooms = bookingsForDate.length;
                        const isFull = totalRooms > 0 && occupiedRooms >= totalRooms;
                        return <><span className={`text-[10px] px-2 py-0.5 rounded-full ${isFull ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'} font-bold block`}>{isFull ? 'No rooms available' : `${Math.max(0, totalRooms - occupiedRooms)} rooms free`}</span>{bookingsForDate.map((booking) => <span key={booking.id} className="text-[9px] text-stone-600 block mt-1">{booking.customerName} • {booking.hotel?.roomName}</span>)}</>;
                      })()}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: VIEW BOOKINGS */}
            {activeTab === 'bookings' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="font-serif-display text-3xl font-light italic text-stone-900">
                      Guest Bookings &amp; Arrival History
                    </h3>
                    <p className="text-xs text-stone-500">
                      Confirmed guest reservations booked through VOYAGO
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="px-3 py-2 rounded-lg border border-stone-300 text-xs font-semibold text-stone-700 bg-white"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          {new Date(2026, m - 1).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="px-3 py-2 rounded-lg border border-stone-300 text-xs font-semibold text-stone-700 bg-white"
                    >
                      {[2024, 2025, 2026, 2027].map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {hotelBookings.length === 0 ? (
                  <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center text-stone-500 text-xs shadow-xs">
                    No confirmed bookings for this property yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hotelBookings.map((b) => (
                      <div
                        key={b.id}
                        className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono font-bold text-[#9D3373]">{b.id}</span>
                            <span className="text-xs text-stone-400">•</span>
                            <span className="text-xs text-stone-900 font-medium">{b.customerName}</span>
                          </div>
                          <p className="font-serif-display text-lg font-light text-stone-900">
                            {b.hotel?.roomName}
                          </p>
                          <p className="text-xs text-stone-500 mt-0.5">
                            Check-in: {b.departureDate} → Check-out: {b.returnDate} ({b.hotel?.nights} Nights)
                          </p>
                          <p className="text-xs text-stone-500 mt-1">
                            Guest: {b.customerEmail} • {b.customerPhone || 'Phone not provided'} • {b.travelersCount} travelers • {b.status}
                          </p>
                        </div>

                        <div className="md:text-right pt-3 md:pt-0 border-t md:border-t-0 border-stone-200">
                          <span className="text-[10px] uppercase text-stone-500 block">Payout Amount</span>
                          <span className="font-serif-display text-xl font-light italic text-[#9D3373]">
                            ₹{b.hotel?.total.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-emerald-700 block font-semibold">Automatic Settlement</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 7: REVENUE REPORTS */}
            {activeTab === 'guests' && (
              <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 space-y-5 shadow-xs animate-in fade-in">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="font-serif-display text-3xl font-light italic text-stone-900">Guest Check-in &amp; Check-out</h3>
                    <p className="text-xs text-stone-500">Record arrival and departure times, room availability, and guest contact details.</p>
                  </div>
                  <div className="flex gap-3">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="px-3 py-2 rounded-lg border border-stone-300 text-xs font-semibold text-stone-700 bg-white"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          {new Date(2026, m - 1).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="px-3 py-2 rounded-lg border border-stone-300 text-xs font-semibold text-stone-700 bg-white"
                    >
                      {[2024, 2025, 2026, 2027].map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  {hotelBookings.map((booking) => {
                    const stay = checkedIn[booking.id];
                    return <div key={booking.id} className="border border-stone-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1"><p className="font-semibold text-sm">{booking.customerName} <span className="text-xs text-stone-400">• {booking.customerPhone}</span></p><p className="text-xs text-stone-500">{booking.customerEmail} • {booking.hotel?.roomName}</p><p className="text-xs text-stone-500 mt-1">{booking.departureDate} → {booking.returnDate} • Room status: {stay && !stay.checkOut ? 'Occupied' : stay?.checkOut ? 'Vacant' : 'Awaiting check-in'}</p>{!stay && <div className="grid sm:grid-cols-3 gap-2 mt-3"><input className="border rounded-lg px-2 py-1 text-xs" placeholder="Aadhaar number" id={`aadhar-${booking.id}`} /><input className="border rounded-lg px-2 py-1 text-xs" placeholder="Arrival phone" id={`phone-${booking.id}`} /><input className="border rounded-lg px-2 py-1 text-xs" placeholder="Home address" id={`address-${booking.id}`} /></div>}</div>
                      {!stay && <button type="button" onClick={() => setCheckedIn((prev) => ({ ...prev, [booking.id]: { checkIn: new Date().toLocaleString(), aadhar: (document.getElementById(`aadhar-${booking.id}`) as HTMLInputElement).value, phone: (document.getElementById(`phone-${booking.id}`) as HTMLInputElement).value, address: (document.getElementById(`address-${booking.id}`) as HTMLInputElement).value } }))} className="px-3 py-2 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase">Complete Check-in</button>}
                      {stay && !stay.checkOut && <button type="button" onClick={() => setCheckedIn((prev) => ({ ...prev, [booking.id]: { ...prev[booking.id], checkOut: new Date().toLocaleString() } }))} className="px-3 py-2 rounded-full bg-stone-800 text-white text-[10px] font-bold uppercase">Complete Check-out</button>}
                      {stay && <p className="text-[10px] text-stone-500">In: {stay.checkIn}{stay.checkOut ? ` • Out: ${stay.checkOut}` : ''}</p>}
                    </div>;
                  })}
                </div>
              </div>
            )}

            {activeTab === 'revenue' && (
              <div className="space-y-6 animate-in fade-in">
                <HotelPartnerAnalytics partnerId={currentUser.id} />
              </div>
            )}

            {/* TAB 8: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="font-serif-display text-3xl font-light italic text-stone-900">
                  Partner Notifications
                </h3>
                <div className="space-y-3">
                  {notifications.filter((notification) => notification.userId === currentUser.id).map((notification) => <div key={notification.id} className="bg-white border border-stone-200 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
                    <Bell className="w-5 h-5 text-[#9D3373] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-stone-900">{notification.title}</h4><p className="text-xs text-stone-500 mt-0.5">{notification.message}</p>
                    </div>
                  </div>)}
                </div>
              </div>
            )}

            {/* TAB 9: PROFILE */}
            {activeTab === 'profile' && (
              <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs animate-in fade-in">
                <h3 className="font-serif-display text-3xl font-light italic text-stone-900">
                  Hotel Partner Profile
                </h3>
                <div className="space-y-3 text-xs text-stone-700 max-w-md">
                  <div className="flex justify-between py-2 border-b border-stone-200">
                    <span className="text-stone-500">Representative</span>
                    <span className="text-stone-900 font-medium">{currentUser.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-stone-200">
                    <span className="text-stone-500">Account Email</span>
                    <span className="text-stone-900 font-medium">{currentUser.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-stone-200">
                    <span className="text-stone-500">Property Assigned</span>
                    <span className="text-[#9D3373] font-medium">{myHotel.name}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 10: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs animate-in fade-in">
                <h3 className="font-serif-display text-3xl font-light italic text-stone-900">
                  Console Settings
                </h3>
                <p className="text-xs text-stone-500">
                  Configure real-time booking push alerts, currency formatting, and automated check-in SMS.
                </p>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
