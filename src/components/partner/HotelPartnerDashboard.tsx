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
    hotels,
    bookings,
    updateHotelRoomPrice,
    updateHotelRoomDetails,
    toggleHotelRoomAvailability,
    switchRole,
    notifications,
    addNotification,
  } = useApp();

  // Find partner's hotel
  const myHotel = hotels.find((h) => h.id === 'hotel-goa-taj') || hotels[0];

  const [activeTab, setActiveTab] = useState<HotelTab>('dashboard');
  const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>('current');

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
  const [newRoomTotalUnits, setNewRoomTotalUnits] = useState(10);
  const [newRoomImage, setNewRoomImage] = useState(
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop&q=80'
  );

  // Hotel property details state
  const [propName, setPropName] = useState(myHotel.name);
  const [propAddress, setPropAddress] = useState(myHotel.address);
  const [propDesc, setPropDesc] = useState(myHotel.description);
  const [propPhone, setPropPhone] = useState('+91 832 6683333');
  const [propEmail, setPropEmail] = useState('taj.goa@partner.voyago.com');

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
    startRoomEdit(room);
    setRoomUnits(room.totalUnits || 10);
    setRoomName(room.name);
    setRoomBed(room.bedType);
    setRoomGuests(room.maxGuests);
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const newRoom: HotelRoom = {
      id: `room-${Date.now()}`,
      name: newRoomName,
      type: newRoomType,
      bedType: newRoomBed,
      maxGuests: Number(newRoomMaxGuests),
      pricePerNight: Number(newRoomRate),
      totalUnits: Number(newRoomTotalUnits),
      bookedUnits: 0,
      availableCount: Number(newRoomTotalUnits),
      amenities: ['Ocean View', 'Balcony', 'King Size Bed', 'Complimentary Breakfast', 'Free Wi-Fi'],
      imageUrl: newRoomImage,
    };

    myHotel.rooms.push(newRoom);
    addNotification({
      userId: currentUser.id,
      title: 'New Room Added',
      message: `Successfully created "${newRoomName}" with ${newRoomTotalUnits} total units.`,
      type: 'PARTNER_UPDATE',
    });

    setToast(`Added new room "${newRoomName}" to inventory.`);
    setTimeout(() => setToast(null), 3000);
    setActiveTab('rooms');
    setNewRoomName('');
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
                onClick={() => switchRole('CUSTOMER')}
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
                  onClick={() => switchRole('CUSTOMER')}
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
                        Night Rate (₹)
                      </label>
                      <input
                        type="number"
                        min="1000"
                        step="500"
                        value={newRoomRate}
                        onChange={(e) => setNewRoomRate(Number(e.target.value))}
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
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
                      Room Photo URL
                    </label>
                    <input
                      type="url"
                      value={newRoomImage}
                      onChange={(e) => setNewRoomImage(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9D3373]"
                    />
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
                <div>
                  <h3 className="font-serif-display text-3xl font-light italic text-stone-900">
                    Guest Bookings &amp; Arrival History
                  </h3>
                  <p className="text-xs text-stone-500">
                    Confirmed guest reservations booked through VOYAGO
                  </p>
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
                <h3 className="font-serif-display text-3xl font-light italic text-stone-900">Guest Check-in &amp; Check-out</h3>
                <p className="text-xs text-stone-500">Record arrival and departure times, room availability, and guest contact details.</p>
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
                <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 flex flex-col lg:flex-row lg:items-end justify-between gap-5 shadow-xs">
                  <div>
                  <h3 className="font-serif-display text-3xl font-light italic text-stone-900 mb-2">
                    Revenue &amp; Settlement Reports
                  </h3>
                  <p className="text-xs text-stone-500 font-light">
                    Professional settlement analytics, commission tracking, and profit performance
                  </p>
                  </div>
                  <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl">
                    {(['current', 'last-month', 'last-year'] as RevenuePeriod[]).map((period) => (
                      <button key={period} type="button" onClick={() => setRevenuePeriod(period)} className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide ${revenuePeriod === period ? 'bg-white text-[#9D3373] shadow-sm' : 'text-stone-500'}`}>
                        {period === 'current' ? 'Current' : period === 'last-month' ? 'Last month' : 'Last year'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    ['Gross revenue', periodGross, 'text-[#9D3373]'],
                    ['Voyago commission', periodVoyagoFee, 'text-rose-700'],
                    ['Hotel profit', periodProfit, 'text-emerald-700'],
                    ['Bookings', hotelBookings.length, 'text-stone-900'],
                  ].map(([label, value, color]) => (
                    <div key={String(label)} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-2">{label}</span>
                      <span className={`font-serif-display text-3xl font-light italic ${color}`}>{label === 'Bookings' ? value : `₹${Number(value).toLocaleString()}`}</span>
                      <span className="text-[10px] text-stone-500 block mt-2">{selectedPeriod.label}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-xs">
                  <div className="flex items-center justify-between mb-5"><div><h4 className="font-semibold text-sm text-stone-900">Settlement performance</h4><p className="text-xs text-stone-500 mt-1">Gross revenue, Voyago fee, and net hotel profit by period</p></div><span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">15% commission</span></div>
                  <div className="h-72 flex items-end gap-3 sm:gap-6 border-b border-stone-200 px-2">
                    {revenuePoints.map((point) => <div key={point.label} className="flex-1 h-full flex flex-col items-center justify-end gap-1"><span className="text-[9px] text-stone-500">₹{point.gross.toLocaleString()}</span><div className="w-full max-w-16 flex items-end gap-1 h-[78%]"><div className="flex-1 bg-[#9D3373] rounded-t-md" style={{ height: `${Math.max(8, point.gross / maxChartValue * 100)}%` }} /><div className="flex-1 bg-rose-400 rounded-t-md" style={{ height: `${Math.max(6, point.gross * 0.15 / maxChartValue * 100)}%` }} /><div className="flex-1 bg-emerald-500 rounded-t-md" style={{ height: `${Math.max(8, point.gross * 0.85 / maxChartValue * 100)}%` }} /></div><span className="text-[10px] text-stone-500">{point.label}</span></div>)}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4 text-[10px] font-semibold"><span className="text-[#9D3373]">■ Gross revenue</span><span className="text-rose-700">■ Voyago fee</span><span className="text-emerald-700">■ Hotel profit</span></div>
                </div>
              </div>
            )}

            {/* TAB 8: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="font-serif-display text-3xl font-light italic text-stone-900">
                  Partner Notifications
                </h3>
                <div className="space-y-3">
                  {notifications.filter((notification) => notification.userId === currentUser.id || notification.roleTarget === 'HOTEL_PARTNER').map((notification) => <div key={notification.id} className="bg-white border border-stone-200 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
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
