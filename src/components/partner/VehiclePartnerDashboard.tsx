import React, { useState } from 'react';
import {
  Car,
  Plus,
  CheckCircle2,
  DollarSign,
  Fuel,
  Users,
  Calendar,
  Save,
  Clock,
  Bike,
  Wrench,
  FileText,
  BarChart3,
  Bell,
  User as UserIcon,
  Settings,
  LogOut,
  Image as ImageIcon,
  Check,
  X,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Vehicle } from '../../types';

type VehicleTab =
  | 'dashboard'
  | 'vehicles'
  | 'add-vehicle'
  | 'availability'
  | 'bookings'
  | 'maintenance'
  | 'revenue'
  | 'notifications'
  | 'profile'
  | 'settings';

type RevenuePeriod = 'current' | 'last-month' | 'last-year';

export const VehiclePartnerDashboard: React.FC = () => {
  const {
    currentUser,
    destinations,
    vehicles,
    bookings,
    updateVehiclePriceAndStatus,
    addVehicle,
    logout,
    addNotification,
    notifications,
  } = useApp();

  // Partner manages Goa fleet
  const myVehicles = vehicles.filter(
    (v) => v.partnerId === currentUser.id || (currentUser.email === 'vehicle@gmail.com' && v.partnerId === 'demo-vehicle-partner')
  );

  const [activeTab, setActiveTab] = useState<VehicleTab>('dashboard');
  const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>('current');
  const [rentalReturns, setRentalReturns] = useState<Record<string, { pickup: string; returnAt?: string }>>({});

  // Add Vehicle form state
  const [name, setName] = useState('');
  const [type, setType] = useState<'CAR' | 'BIKE' | 'SCOOTER'>('CAR');
  const [category, setCategory] = useState('Compact SUV');
  const [dailyRate, setDailyRate] = useState(2500);
  const [seats, setSeats] = useState(5);
  const [transmission, setTransmission] = useState<'Automatic' | 'Manual'>('Manual');
  const [fuelType, setFuelType] = useState<'Petrol' | 'Diesel' | 'Electric'>('Petrol');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80'
  );
  const [vehicleDestinationId, setVehicleDestinationId] = useState('dest-goa');

  // Edit vehicle state
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [toast, setToast] = useState<string | null>(null);

  // Maintenance records state
  const [maintenanceRecords, setMaintenanceRecords] = useState([
    {
      id: 'maint-1',
      vehicleName: 'Mahindra Thar 4x4',
      date: '2026-08-20',
      type: '10,000 KM Periodic Service & Brake Inspection',
      cost: 4800,
      status: 'Completed',
    },
    {
      id: 'maint-2',
      vehicleName: 'Royal Enfield Classic 350',
      date: '2026-08-28',
      type: 'Oil Change & Chain Lubrication',
      cost: 1650,
      status: 'Completed',
    },
  ]);

  const [newMaintVehicle, setNewMaintVehicle] = useState('Mahindra Thar 4x4');
  const [newMaintType, setNewMaintType] = useState('Oil & Filter Change');
  const [newMaintCost, setNewMaintCost] = useState(2500);

  const vehicleBookings = bookings.filter((b) =>
    b.vehicle !== undefined && myVehicles.some((vehicle) => vehicle.id === b.vehicle?.id)
  );
  const totalRevenue = vehicleBookings.reduce((sum, b) => sum + (b.vehicle?.total || 0), 0);
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

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    addVehicle({
      destinationId: vehicleDestinationId,
      name,
      type,
      category,
      dailyRate: Number(dailyRate),
      seats: Number(seats),
      transmission,
      fuelType,
      imageUrl,
      isAvailable: true,
      features: ['Air Conditioning', 'Comprehensive Insurance', 'Unlimited Kilometers'],
      rating: 4.8,
      partnerId: currentUser.id,
    });

    addNotification({
      userId: currentUser.id,
      title: 'Vehicle Added to Fleet',
      message: `${name} has been approved and listed for rent.`,
      type: 'PARTNER_UPDATE',
    });

    setToast(`Added vehicle "${name}" to active rental fleet.`);
    setTimeout(() => setToast(null), 3000);
    setActiveTab('vehicles');
    setName('');
  };

  const handleSavePrice = (veh: Vehicle) => {
    if (editPrice > 0) {
      updateVehiclePriceAndStatus(veh.id, editPrice, veh.isAvailable);
      setEditingVehicleId(null);
      setToast(`Updated daily rental fee for ${veh.name} to ₹${editPrice}.`);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleAddMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    setMaintenanceRecords([
      {
        id: `maint-${Date.now()}`,
        vehicleName: newMaintVehicle,
        date: new Date().toISOString().split('T')[0],
        type: newMaintType,
        cost: Number(newMaintCost),
        status: 'Logged',
      },
      ...maintenanceRecords,
    ]);
    setToast('Maintenance record saved successfully.');
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 py-8 px-4 sm:px-6 lg:px-8 font-sans-ui">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Header Card */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 mb-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#9D3373]/10 border border-[#9D3373]/20 text-[#9D3373] flex items-center justify-center text-2xl font-serif-display font-light">
                <Car className="w-8 h-8 text-[#9D3373]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#9D3373] px-2 py-0.5 rounded-full bg-[#9D3373]/10 border border-[#9D3373]/20">
                    Vehicle Partner Console
                  </span>
                  <span className="text-xs text-stone-400">•</span>
                  <span className="text-xs text-stone-500">Goa Wheels Fleet Operator</span>
                </div>
                <h1 className="font-serif-display text-3xl md:text-4xl font-light italic text-stone-900">
                  Fleet &amp; Rental <span className="not-italic font-normal">Operations</span>
                </h1>
                <p className="text-xs text-stone-500 font-normal mt-1">
                  Manage cars, scooters, daily tariff rates, maintenance logs, and rental reservations.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('add-vehicle')}
                className="px-5 py-2.5 rounded-full bg-[#9D3373] hover:bg-[#862960] text-white font-bold uppercase tracking-wider text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vehicle</span>
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
                { id: 'dashboard', label: 'Fleet Dashboard', icon: Car },
                { id: 'vehicles', label: 'All Vehicles & Rates', icon: Fuel, badge: myVehicles.length },
                { id: 'add-vehicle', label: 'Add New Vehicle', icon: Plus },
                { id: 'availability', label: 'Availability Tracker', icon: Calendar },
                { id: 'bookings', label: 'Rental Bookings', icon: FileText, badge: vehicleBookings.length },
                { id: 'maintenance', label: 'Maintenance Records', icon: Wrench, badge: maintenanceRecords.length },
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
                    onClick={() => setActiveTab(tab.id as VehicleTab)}
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                      Total Rental Earnings
                    </span>
                    <p className="font-serif-display text-3xl font-light italic text-[#9D3373] mt-1">
                      ₹{totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-stone-500 mt-1">From {vehicleBookings.length} completed rentals</p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                      Fleet Inventory
                    </span>
                    <p className="font-serif-display text-3xl font-light italic text-stone-900 mt-1">
                      {myVehicles.length} Vehicles
                    </p>
                    <p className="text-[11px] text-stone-500 mt-1">
                      {myVehicles.filter((v) => v.isAvailable).length} Available • {myVehicles.filter((v) => !v.isAvailable).length} Reserved
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                      Active Maintenance
                    </span>
                    <p className="font-serif-display text-3xl font-light italic text-[#9D3373] mt-1">
                      {maintenanceRecords.length} Records
                    </p>
                    <p className="text-[11px] text-stone-500 mt-1">Inspections &amp; periodic tune-ups</p>
                  </div>
                </div>

                {/* Fleet Quick Table */}
                <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif-display text-2xl font-light italic text-stone-900">
                      Active Fleet Inventory
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('vehicles')}
                      className="text-xs text-[#9D3373] hover:underline uppercase tracking-wider font-semibold cursor-pointer"
                    >
                      View All &rarr;
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myVehicles.map((veh) => (
                      <div
                        key={veh.id}
                        className="bg-[#FAF8F5] border border-stone-200 rounded-xl p-4 flex justify-between items-center"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={veh.imageUrl}
                            alt={veh.name}
                            referrerPolicy="no-referrer"
                            className="w-14 h-14 rounded-lg object-cover border border-stone-200"
                          />
                          <div>
                            <h4 className="font-serif-display text-base font-light text-stone-900">{veh.name}</h4>
                            <p className="text-[11px] text-stone-500">{veh.transmission} • {veh.seats} Seats</p>
                            <span className="text-[11px] font-mono text-[#9D3373] font-bold mt-0.5 block">
                              ₹{veh.dailyRate.toLocaleString()} / day
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                            veh.isAvailable
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {veh.isAvailable ? 'Available' : 'Reserved'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ALL VEHICLES & RATES */}
            {activeTab === 'vehicles' && (
              <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif-display text-3xl font-light italic text-stone-900 mb-1">
                      Fleet Inventory &amp; Daily Pricing
                    </h3>
                    <p className="text-xs text-stone-500">
                      Edit rental fees or toggle readiness for customer reservation
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('add-vehicle')}
                    className="px-4 py-2 rounded-full bg-[#9D3373] text-white hover:bg-[#862960] font-bold uppercase text-xs cursor-pointer"
                  >
                    + Add New Vehicle
                  </button>
                </div>

                <div className="space-y-4">
                  {myVehicles.map((veh) => {
                    const isEditing = editingVehicleId === veh.id;

                    return (
                      <div
                        key={veh.id}
                        className="p-5 rounded-2xl border border-stone-200 bg-[#FAF8F5] flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={veh.imageUrl}
                            alt={veh.name}
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 rounded-xl object-cover border border-stone-200"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-serif-display text-xl font-light text-stone-900">{veh.name}</h4>
                              <span className="text-[10px] font-semibold bg-white border border-stone-200 px-2 py-0.5 rounded text-stone-600 uppercase">
                                {veh.category}
                              </span>
                            </div>
                            <p className="text-xs text-stone-500 mt-1">
                              {veh.transmission} • {veh.seats} Seats • {veh.fuelType}
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
                                  value={editPrice}
                                  onChange={(e) => setEditPrice(Number(e.target.value))}
                                  className="w-24 bg-white border border-[#9D3373] rounded-lg px-2 py-1 text-sm text-stone-900 font-mono"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSavePrice(veh)}
                                  className="p-1.5 rounded-lg bg-[#9D3373] text-white hover:bg-[#862960] cursor-pointer"
                                  title="Save Rate"
                                >
                                  <Check className="w-4 h-4 stroke-[3]" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingVehicleId(null)}
                                  className="p-1.5 rounded-lg bg-stone-200 text-stone-600 hover:text-stone-900 cursor-pointer"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div
                                onClick={() => {
                                  setEditingVehicleId(veh.id);
                                  setEditPrice(veh.dailyRate);
                                }}
                                className="cursor-pointer group flex items-center gap-1.5"
                                title="Click to edit daily tariff"
                              >
                                <span className="font-serif-display text-xl font-light italic text-[#9D3373] group-hover:underline">
                                  ₹{veh.dailyRate.toLocaleString()}
                                </span>
                                <span className="text-[10px] text-stone-500">/ day</span>
                              </div>
                            )}
                          </div>

                          {/* Availability Toggle */}
                          <button
                            type="button"
                            onClick={() =>
                              updateVehiclePriceAndStatus(veh.id, veh.dailyRate, !veh.isAvailable)
                            }
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              veh.isAvailable
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                            }`}
                          >
                            {veh.isAvailable ? 'Available' : 'Reserved'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: ADD NEW VEHICLE */}
            {activeTab === 'add-vehicle' && (
              <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs animate-in fade-in">
                <div>
                  <h3 className="font-serif-display text-3xl font-light italic text-stone-900 mb-2">
                    Add Vehicle to Fleet
                  </h3>
                  <p className="text-xs text-stone-500 font-light">
                    Register a new car, scooter, or bike into the Voyago platform
                  </p>
                </div>

                <form onSubmit={handleCreateVehicle} className="space-y-4 max-w-lg">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
                      Model / Brand Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Hyundai Creta SX"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9D3373]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
                        Vehicle Type
                      </label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9D3373]"
                      >
                        <option value="CAR">Car</option>
                        <option value="BIKE">Bike</option>
                        <option value="SCOOTER">Scooter</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
                        Category
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Compact SUV"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9D3373]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
                      Destination
                    </label>
                    <select
                      value={vehicleDestinationId}
                      onChange={(e) => setVehicleDestinationId(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9D3373]"
                      required
                    >
                      {destinations.map((destination) => <option key={destination.id} value={destination.id}>{destination.name}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
                        Daily Rate (₹)
                      </label>
                      <input
                        type="number"
                        value={dailyRate}
                        onChange={(e) => setDailyRate(Number(e.target.value))}
                        className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9D3373]"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
                        Seats
                      </label>
                      <input
                        type="number"
                        value={seats}
                        onChange={(e) => setSeats(Number(e.target.value))}
                        className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9D3373]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
                        Transmission
                      </label>
                      <select
                        value={transmission}
                        onChange={(e) => setTransmission(e.target.value as 'Automatic' | 'Manual')}
                        className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9D3373]"
                      >
                        <option value="Manual">Manual</option>
                        <option value="Automatic">Automatic</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
                      Vehicle Image URL
                    </label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9D3373]"
                    />
                  </div>

                  <div className="pt-4 flex items-center gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-full bg-[#9D3373] hover:bg-[#862960] text-white font-bold uppercase tracking-wider text-xs shadow-xs cursor-pointer"
                    >
                      Publish to Fleet
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('vehicles')}
                      className="px-4 py-2.5 rounded-full border border-stone-300 bg-white hover:bg-stone-50 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 4: AVAILABILITY TRACKER */}
            {activeTab === 'availability' && (
              <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs animate-in fade-in">
                <div>
                  <h3 className="font-serif-display text-3xl font-light italic text-stone-900 mb-2">
                    Fleet Availability Matrix
                  </h3>
                  <p className="text-xs text-stone-500 font-light">
                    Instant rental status switches to avoid overlapping bookings
                  </p>
                </div>

                <div className="space-y-3">
                  {myVehicles.map((veh) => (
                    <div
                      key={veh.id}
                      className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-3 h-3 rounded-full ${
                            veh.isAvailable ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-rose-500 ring-4 ring-rose-100'
                          }`}
                        />
                        <div>
                          <p className="text-sm font-semibold text-stone-900">{veh.name}</p>
                          <p className="text-xs text-stone-500">Category: {veh.category} • {veh.transmission}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          updateVehiclePriceAndStatus(veh.id, veh.dailyRate, !veh.isAvailable)
                        }
                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer ${
                          veh.isAvailable
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {veh.isAvailable ? 'Mark Rented / Out of Service' : 'Mark Available'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: RENTAL BOOKINGS */}
            {activeTab === 'bookings' && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <h3 className="font-serif-display text-3xl font-light italic text-stone-900">
                    Confirmed Rental Bookings
                  </h3>
                  <p className="text-xs text-stone-500">
                    Active traveler rentals confirmed with instant payments
                  </p>
                </div>

                {vehicleBookings.length === 0 ? (
                  <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center text-stone-500 text-xs shadow-xs">
                    No active vehicle rentals at this moment.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vehicleBookings.map((b) => (
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
                            {b.vehicle?.name} ({b.vehicle?.type})
                          </p>
                          <p className="text-xs text-stone-500 mt-0.5">
                            Rental Period: {b.departureDate} → {b.returnDate} ({b.vehicle?.days} Days)
                          </p>
                          <p className="text-xs text-stone-500 mt-1">Customer: {b.customerPhone} • {b.customerEmail}</p>
                          <p className="text-xs text-stone-500">Pickup / return: {rentalReturns[b.id]?.pickup || 'Awaiting handover'} {rentalReturns[b.id]?.returnAt ? `• Returned ${rentalReturns[b.id].returnAt}` : ''}</p>
                        </div>

                        <div className="md:text-right pt-3 md:pt-0 border-t md:border-t-0 border-stone-200">
                          <span className="text-[10px] uppercase text-stone-500 block">Total Payout</span>
                          <span className="font-serif-display text-xl font-light italic text-[#9D3373]">
                            ₹{b.vehicle?.total.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-emerald-700 block font-semibold">Automatic Settlement</span>
                          {!rentalReturns[b.id] ? <button type="button" onClick={() => setRentalReturns((prev) => ({ ...prev, [b.id]: { pickup: new Date().toLocaleString() } }))} className="mt-2 px-3 py-1.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase">Record Pickup</button> : !rentalReturns[b.id].returnAt ? <button type="button" onClick={() => setRentalReturns((prev) => ({ ...prev, [b.id]: { ...prev[b.id], returnAt: new Date().toLocaleString() } }))} className="mt-2 px-3 py-1.5 rounded-full bg-stone-800 text-white text-[10px] font-bold uppercase">Record Return</button> : <span className="text-[10px] text-emerald-700 block mt-2 font-bold">Vehicle available</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: MAINTENANCE RECORDS */}
            {activeTab === 'maintenance' && (
              <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif-display text-3xl font-light italic text-stone-900 mb-1">
                      Fleet Maintenance Logs
                    </h3>
                    <p className="text-xs text-stone-500">
                      Record brake checks, tire changes, oil servicing, and safety certifications
                    </p>
                  </div>
                </div>

                {/* Log form */}
                <form onSubmit={handleAddMaintenance} className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-5 space-y-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#9D3373] block">
                    Log New Service / Inspection
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-stone-700 block mb-1">
                        Select Vehicle
                      </label>
                      <select
                        value={newMaintVehicle}
                        onChange={(e) => setNewMaintVehicle(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                      >
                        {myVehicles.map((v) => (
                          <option key={v.id} value={v.name}>{v.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-stone-700 block mb-1">
                        Service Description
                      </label>
                      <input
                        type="text"
                        value={newMaintType}
                        onChange={(e) => setNewMaintType(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                        placeholder="e.g. Brake Pads Replacement"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-stone-700 block mb-1">
                        Service Expense (₹)
                      </label>
                      <input
                        type="number"
                        value={newMaintCost}
                        onChange={(e) => setNewMaintCost(Number(e.target.value))}
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#9D3373] hover:bg-[#862960] text-white font-bold uppercase text-xs shadow-xs cursor-pointer"
                  >
                    Add Service Record
                  </button>
                </form>

                {/* Table of records */}
                <div className="space-y-3">
                  {maintenanceRecords.map((m) => (
                    <div
                      key={m.id}
                      className="bg-[#FAF8F5] border border-stone-200 rounded-xl p-4 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-serif-display text-base font-light text-stone-900 block">{m.vehicleName}</span>
                        <p className="text-xs text-stone-500">{m.type} • {m.date}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-serif-display text-lg font-light text-rose-600 block">
                          -₹{m.cost.toLocaleString()}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                          {m.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 7: REVENUE REPORTS */}
            {activeTab === 'revenue' && (
              <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs animate-in fade-in">
                <div>
                  <h3 className="font-serif-display text-3xl font-light italic text-stone-900 mb-2">
                    Fleet Revenue &amp; Settlements
                  </h3>
                  <p className="text-xs text-stone-500 font-light">
                    Direct automated payouts without manual claim vouchers
                  </p>
                </div>

                <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl w-fit">
                  {(['current', 'last-month', 'last-year'] as RevenuePeriod[]).map((period) => (
                    <button key={period} type="button" onClick={() => setRevenuePeriod(period)} className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide ${revenuePeriod === period ? 'bg-white text-[#9D3373] shadow-sm' : 'text-stone-500'}`}>
                      {period === 'current' ? 'Current' : period === 'last-month' ? 'Last month' : 'Last year'}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    ['Gross revenue', periodGross, 'text-[#9D3373]'],
                    ['Voyago commission', periodVoyagoFee, 'text-rose-700'],
                    ['Fleet profit', periodProfit, 'text-emerald-700'],
                    ['Rentals', vehicleBookings.length, 'text-stone-900'],
                  ].map(([label, value, color]) => (
                    <div key={String(label)} className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-5">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-2">{label}</span>
                      <span className={`font-serif-display text-3xl font-light italic ${color}`}>{label === 'Rentals' ? value : `₹${Number(value).toLocaleString()}`}</span>
                      <span className="text-[10px] text-stone-500 block mt-2">{selectedPeriod.label}</span>
                    </div>
                  ))}
                </div>
                <div className="border border-stone-200 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-5"><div><h4 className="font-semibold text-sm">Rental settlement performance</h4><p className="text-xs text-stone-500 mt-1">Gross revenue, platform fee, and fleet profit</p></div><span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">15% commission</span></div>
                  <div className="h-64 flex items-end gap-3 sm:gap-6 border-b border-stone-200">{revenuePoints.map((point) => <div key={point.label} className="flex-1 h-full flex flex-col items-center justify-end gap-1"><span className="text-[9px] text-stone-500">₹{point.gross.toLocaleString()}</span><div className="w-full max-w-16 flex items-end gap-1 h-[78%]"><div className="flex-1 bg-[#9D3373] rounded-t-md" style={{ height: `${Math.max(8, point.gross / maxChartValue * 100)}%` }} /><div className="flex-1 bg-rose-400 rounded-t-md" style={{ height: `${Math.max(6, point.gross * 0.15 / maxChartValue * 100)}%` }} /><div className="flex-1 bg-emerald-500 rounded-t-md" style={{ height: `${Math.max(8, point.gross * 0.85 / maxChartValue * 100)}%` }} /></div><span className="text-[10px] text-stone-500">{point.label}</span></div>)}</div>
                  <div className="flex flex-wrap gap-4 mt-4 text-[10px] font-semibold"><span className="text-[#9D3373]">■ Gross revenue</span><span className="text-rose-700">■ Voyago fee</span><span className="text-emerald-700">■ Fleet profit</span></div>
                </div>
              </div>
            )}

            {/* TAB 8: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="font-serif-display text-3xl font-light italic text-stone-900">
                  Fleet Alerts
                </h3>
                <div className="space-y-3">
                {notifications.filter((notification) => notification.userId === currentUser.id).map((notification) => <div key={notification.id} className="bg-white border border-stone-200 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
                  <Bell className="w-5 h-5 text-[#9D3373] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-stone-900">{notification.title}</h4>
                    <p className="text-xs text-stone-500 mt-0.5">{notification.message}</p>
                  </div>
                </div>)}
                </div>
              </div>
            )}

            {/* TAB 9: PROFILE */}
            {activeTab === 'profile' && (
              <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs animate-in fade-in">
                <h3 className="font-serif-display text-3xl font-light italic text-stone-900">
                  Vehicle Operator Profile
                </h3>
                <div className="space-y-3 text-xs text-stone-700 max-w-md">
                  <div className="flex justify-between py-2 border-b border-stone-200">
                    <span className="text-stone-500">Fleet Partner</span>
                    <span className="text-stone-900 font-medium">Goa Wheels Self-Drive Rentals</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-stone-200">
                    <span className="text-stone-500">Representative</span>
                    <span className="text-stone-900 font-medium">{currentUser.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-stone-200">
                    <span className="text-stone-500">Operating Region</span>
                    <span className="text-[#9D3373] font-medium">North &amp; South Goa</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 10: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs animate-in fade-in">
                <h3 className="font-serif-display text-3xl font-light italic text-stone-900">
                  Fleet Configuration Settings
                </h3>
                <p className="text-xs text-stone-500">
                  Manage pickup location hubs, fuel policies (Full-to-Full), and security deposit limits.
                </p>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
