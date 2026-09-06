import React, { useEffect, useState } from 'react';
import {
  Shield,
  TrendingUp,
  CreditCard,
  Hotel as HotelIcon,
  Car,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plane,
  Train,
  Bus,
  MapPin,
  Settings,
  BarChart3,
  Calendar,
  LogOut,
  Plus,
  Compass,
  Check,
  X,
  Eye,
  DollarSign,
  TrendingDown,
  ShoppingCart,
  Bell,
  Globe,
  Zap,
  ChevronDown,
  ChevronUp,
  Image,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Hotel, TravelMode, Destination, TouristPlace, TravelOption } from '../../types';
import { apiClient } from '../../services/api';

type AdminTab =
  | 'dashboard'
  | 'destinations'
  | 'places'
  | 'transport'
  | 'hotels'
  | 'vehicles'
  | 'customers'
  | 'bookings'
  | 'analytics'
  | 'logs'
  | 'settings';

interface PartnerSummary {
  id: string;
  name: string;
  email: string;
  phone?: string;
  partnerBusinessName?: string;
  partnerStatus?: string;
  createdAt?: string;
  hotelCount?: number;
  vehicleCount?: number;
}

interface HotelInventoryItem {
  id: string;
  name: string;
  address?: string;
  city?: string;
  destinationName?: string;
  rating?: number;
  reviewCount?: number;
  status?: string;
  roomCount?: number;
}

interface VehicleInventoryItem {
  id: string;
  name: string;
  registrationNumber?: string;
  type?: string;
  seats?: number;
  dailyRate?: number;
  isAvailable?: boolean;
  rentalStatus?: string;
}

type PartnerInventory =
  | { kind: 'hotels'; partnerName: string; items: HotelInventoryItem[] }
  | { kind: 'vehicles'; partnerName: string; items: VehicleInventoryItem[] };

// ─── SVG Bar Chart ───────────────────────────────────────────────────────────
const BarChart: React.FC<{ data: { label: string; value: number }[]; color?: string }> = ({
  data,
  color = '#9D3373',
}) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-28 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1 gap-1">
          <span className="text-[9px] text-stone-500 font-mono">
            {d.value > 999 ? `₹${(d.value / 1000).toFixed(0)}k` : d.value}
          </span>
          <div
            className="w-full rounded-t-md transition-all duration-700"
            style={{
              height: `${Math.max((d.value / max) * 80, 4)}px`,
              backgroundColor: color,
              opacity: 0.7 + 0.3 * (d.value / max),
            }}
          />
          <span className="text-[9px] text-stone-500 font-medium">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ─── SVG Donut Chart ─────────────────────────────────────────────────────────
const DonutChart: React.FC<{
  segments: { label: string; value: number; color: string }[];
}> = ({ segments }) => {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let cumulative = 0;
  const r = 40;
  const cx = 55;
  const cy = 55;
  const circ = 2 * Math.PI * r;

  const arcs = segments.map((seg) => {
    const fraction = seg.value / total;
    const offset = circ * (1 - cumulative / total);
    cumulative += seg.value;
    return { ...seg, fraction, dashArray: `${fraction * circ} ${circ}`, dashOffset: offset };
  });

  return (
    <div className="flex items-center gap-4">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f5f0ee" strokeWidth="14" />
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth="14"
            strokeDasharray={arc.dashArray}
            strokeDashoffset={arc.dashOffset}
            transform={`rotate(-90 ${cx} ${cy})`}
            strokeLinecap="round"
          />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1c1917">
          {total}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="8" fill="#78716c">
          Total
        </text>
      </svg>
      <div className="space-y-2 flex-1">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-[11px] text-stone-600 flex-1">{seg.label}</span>
            <span className="text-[11px] font-bold text-stone-800">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Sparkline ────────────────────────────────────────────────────────────────
const Sparkline: React.FC<{ data: number[]; color?: string }> = ({ data, color = '#9D3373' }) => {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 120;
  const h = 40;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / range) * h;
        return <circle key={i} cx={x} cy={y} r="3" fill={color} />;
      })}
    </svg>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    bookings,
    auditLogs,
    hotels,
    vehicles,
    destinations,
    touristPlaces,
    travelOptions,
    logout,
    addNotification,
    updateHotelRoomPrice,
    updateHotelRoomDetails,
    toggleHotelRoomAvailability,
    addDestination,
    updateDestination,
    addTouristPlace,
    updateTouristPlace,
    removeHotel,
    removeVehicle,
    addTransportOption,
    users,
    refreshUsers,
    adminActiveTab,
    setAdminActiveTab,
  } = useApp();

  const activeTab = (adminActiveTab as AdminTab) || 'dashboard';
  const setActiveTab = (tab: AdminTab) => setAdminActiveTab(tab);

  useEffect(() => {
    if (activeTab !== 'customers') return;
    refreshUsers().catch((error) => {
      console.error('Failed to load registered users for the admin dashboard.', error);
    });
  }, [activeTab, refreshUsers]);

  const [hotelPartners, setHotelPartners] = useState<PartnerSummary[]>([]);
  const [vehiclePartners, setVehiclePartners] = useState<PartnerSummary[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [partnerInventory, setPartnerInventory] = useState<PartnerInventory | null>(null);
  const [loadingInventory, setLoadingInventory] = useState(false);

  const viewPartnerInventory = async (partner: PartnerSummary, kind: 'hotels' | 'vehicles') => {
    setLoadingInventory(true);
    try {
      const endpoint = kind === 'hotels'
        ? `/admin/hotel-partners/${partner.id}/hotels`
        : `/admin/vehicle-partners/${partner.id}/vehicles`;
      const { data } = await apiClient.get<HotelInventoryItem[] | VehicleInventoryItem[]>(endpoint);
      setPartnerInventory({
        kind,
        partnerName: partner.name,
        items: data,
      } as PartnerInventory);
    } catch (error) {
      console.error(`Failed to load ${kind} for partner:`, error);
      showToast(`Unable to load ${kind === 'hotels' ? 'hotels' : 'vehicles'} for this partner.`);
    } finally {
      setLoadingInventory(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'hotels') return;
    setLoadingPartners(true);
    apiClient
      .get<PartnerSummary[]>('/admin/hotel-partners')
      .then(({ data }) => {
        setHotelPartners(data);
      })
      .catch((error: unknown) => {
        console.error('Failed to load hotel partners:', error);
      })
      .finally(() => {
        setLoadingPartners(false);
      });
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'vehicles') return;
    setLoadingPartners(true);
    apiClient
      .get<PartnerSummary[]>('/admin/vehicle-partners')
      .then(({ data }) => {
        setVehiclePartners(data);
      })
      .catch((error: unknown) => {
        console.error('Failed to load vehicle partners:', error);
      })
      .finally(() => {
        setLoadingPartners(false);
      });
  }, [activeTab]);

  const [logFilter, setLogFilter] = useState('');
  const [transportFilter, setTransportFilter] = useState<TravelMode | 'ALL'>('ALL');
  const [transportDestinationFilter, setTransportDestinationFilter] = useState('ALL');
  const [newTransport, setNewTransport] = useState({
    destinationId: '',
    mode: 'FLIGHT' as TravelMode,
    operator: '',
    code: '',
    fromCity: '',
    toCity: '',
    departureTime: '',
    arrivalTime: '',
    duration: '',
    pricePerPerson: '0',
    availableSeats: '0',
    stops: 'Non-stop',
    rating: '4.5',
  });
  const [toast, setToast] = useState<string | null>(null);

  // Hotel management
  const [selectedHotelForManage, setSelectedHotelForManage] = useState<Hotel | null>(null);
  const [editingRoomPriceId, setEditingRoomPriceId] = useState<string | null>(null);
  const [tempRoomPrice, setTempRoomPrice] = useState<number>(0);

  // Settings state
  const [platformCommission, setPlatformCommission] = useState(5);
  const [autoSettleTime, setAutoSettleTime] = useState('Immediate (24/7)');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maxBookingsPerDay, setMaxBookingsPerDay] = useState(500);
  const [defaultCurrency, setDefaultCurrency] = useState('INR');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [apiRateLimit, setApiRateLimit] = useState(100);
  const [supportEmail, setSupportEmail] = useState('support@voyago.in');
  const [enableVehicle, setEnableVehicle] = useState(true);
  const [enableHotel, setEnableHotel] = useState(true);
  const [enableAIPlanner, setEnableAIPlanner] = useState(true);

  // Add Destination form
  const [showAddDest, setShowAddDest] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [editingPlace, setEditingPlace] = useState<TouristPlace | null>(null);
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [newPlace, setNewPlace] = useState({
    name: '', destinationId: '', category: 'Nature' as TouristPlace['category'], rating: '4.5',
    visitDuration: '2 hours', entryFee: '0', description: '', imageUrl: '', recommendedTime: 'Morning',
  });
  const [newDest, setNewDest] = useState({
    name: '',
    state: '',
    country: 'India',
    tagline: '',
    description: '',
    bestTimeToVisit: '',
    rating: '4.5',
    idealDays: '3',
    imageUrl: '',
    budgetBudget: '8000',
    budgetModerate: '15000',
    budgetLuxury: '30000',
    highlights: '',
  });

  // ── Analytics helpers ──────────────────────────────────────────────────────
  const totalGMV = bookings.reduce((sum, b) => sum + b.totalCost, 0);
  const confirmedBookingsCount = bookings.filter((b) => b.status === 'CONFIRMED').length;
  const cancelledCount = bookings.filter((b) => b.status === 'CANCELLED').length;
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyIncome = bookings
    .filter((b) => {
      const d = new Date(b.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, b) => sum + b.totalCost, 0);

  const monthlyOrders = bookings.filter((b) => {
    const d = new Date(b.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  // 6-month revenue bar chart data
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(currentYear, currentMonth - 5 + i, 1);
    return { month: d.getMonth(), year: d.getFullYear(), label: monthNames[d.getMonth()] };
  });

  const revenueChartData = last6Months.map(({ month, year, label }) => ({
    label,
    value: bookings
      .filter((b) => {
        const d = new Date(b.createdAt);
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .reduce((s, b) => s + b.totalCost, 0),
  }));

  const ordersChartData = last6Months.map(({ month, year, label }) => ({
    label,
    value: bookings.filter((b) => {
      const d = new Date(b.createdAt);
      return d.getMonth() === month && d.getFullYear() === year;
    }).length,
  }));

  const sparklineData = ordersChartData.map((d) => d.value);

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.actor.toLowerCase().includes(logFilter.toLowerCase()) ||
      log.action.toLowerCase().includes(logFilter.toLowerCase()) ||
      log.details.toLowerCase().includes(logFilter.toLowerCase())
  );

  const getTransportDestinationId = (item: TravelOption) => {
    if (item.destinationId) return item.destinationId;
    const routeText = `${item.id} ${item.toCity}`.toLowerCase();
    return destinations.find((destination) => routeText.includes(destination.name.toLowerCase()))?.id;
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddDestination = () => {
    if (!newDest.name.trim()) { showToast('Destination name is required.'); return; }
    addDestination({
      name: newDest.name.trim(), state: newDest.state, country: newDest.country,
      tagline: newDest.tagline, description: newDest.description, bestTimeToVisit: newDest.bestTimeToVisit,
      rating: Number(newDest.rating), idealDays: Number(newDest.idealDays), imageUrl: newDest.imageUrl,
      highlights: newDest.highlights.split(',').map((item) => item.trim()).filter(Boolean),
      averageBudget: Number(newDest.budgetModerate),
      estimatedBudget: { Budget: Number(newDest.budgetBudget), Moderate: Number(newDest.budgetModerate), Luxury: Number(newDest.budgetLuxury) },
      isTrending: false,
    });
    showToast(`Destination "${newDest.name}" added successfully!`);
    setNewDest({
      name: '', state: '', country: 'India', tagline: '', description: '',
      bestTimeToVisit: '', rating: '4.5', idealDays: '3', imageUrl: '',
      budgetBudget: '8000', budgetModerate: '15000', budgetLuxury: '30000', highlights: '',
    });
    setShowAddDest(false);
  };

  const handleAddPlace = () => {
    if (!newPlace.name.trim() || !newPlace.destinationId) {
      showToast('Place name and destination are required.');
      return;
    }
    addTouristPlace({
      name: newPlace.name.trim(),
      destinationId: newPlace.destinationId,
      category: newPlace.category,
      rating: Number(newPlace.rating),
      visitDuration: newPlace.visitDuration,
      timeRequired: newPlace.visitDuration,
      entryFee: Number(newPlace.entryFee),
      description: newPlace.description,
      imageUrl: newPlace.imageUrl,
      recommendedTime: newPlace.recommendedTime,
      highlights: [],
    });
    setNewPlace({ name: '', destinationId: '', category: 'Nature', rating: '4.5', visitDuration: '2 hours', entryFee: '0', description: '', imageUrl: '', recommendedTime: 'Morning' });
    setShowAddPlace(false);
    showToast('Tourist place added.');
  };

  const handleAddTransport = () => {
    if (!newTransport.destinationId || !newTransport.operator.trim() || !newTransport.code.trim() ||
      !newTransport.fromCity.trim() || !newTransport.toCity.trim()) {
      showToast('Select a destination and complete the transport route details.');
      return;
    }
    const option: Omit<TravelOption, 'id'> = {
      destinationId: newTransport.destinationId,
      mode: newTransport.mode,
      operator: newTransport.operator.trim(),
      code: newTransport.code.trim(),
      fromCity: newTransport.fromCity.trim(),
      toCity: newTransport.toCity.trim(),
      departureTime: newTransport.departureTime,
      arrivalTime: newTransport.arrivalTime,
      duration: newTransport.duration,
      pricePerPerson: Number(newTransport.pricePerPerson),
      availableSeats: Number(newTransport.availableSeats),
      stops: newTransport.stops,
      rating: Number(newTransport.rating),
      tags: [],
    };
    addTransportOption(option);
    showToast(`${newTransport.mode} schedule added for ${destinations.find((d) => d.id === newTransport.destinationId)?.name || 'destination'}.`);
    setNewTransport({
      destinationId: '', mode: 'FLIGHT', operator: '', code: '', fromCity: '', toCity: '',
      departureTime: '', arrivalTime: '', duration: '', pricePerPerson: '0',
      availableSeats: '0', stops: 'Non-stop', rating: '4.5',
    });
  };

  // ── Toggle switch component ────────────────────────────────────────────────
  const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${checked ? 'bg-[#9D3373]' : 'bg-stone-300'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );

  // ── Input field helper ─────────────────────────────────────────────────────
  const inputCls = "w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9D3373] transition-colors";
  const labelCls = "text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1.5";

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 py-8 px-4 sm:px-6 lg:px-8 font-sans-ui">
      <div className="max-w-7xl mx-auto">

        {/* Top Header Card */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 mb-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#9D3373]/10 border border-[#9D3373]/20 text-[#9D3373] flex items-center justify-center text-2xl font-serif-display font-light">
                <Shield className="w-8 h-8 text-[#9D3373]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#9D3373] px-2 py-0.5 rounded-full bg-[#9D3373]/10 border border-[#9D3373]/20">
                    Super Admin Console
                  </span>
                  <span className="text-xs text-stone-400">•</span>
                  <span className="text-xs text-stone-500">{currentUser.email}</span>
                </div>
                <h1 className="font-serif-display text-3xl md:text-4xl font-light italic text-stone-900">
                  VOYAGO Operations &amp; <span className="not-italic font-normal">Governance</span>
                </h1>
                <p className="text-xs text-stone-500 font-normal mt-1">
                  Cross-platform control over destinations, transport inventory, hotel &amp; vehicle partners, and audit logs.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={logout}
                className="px-5 py-2.5 rounded-full border border-stone-300 hover:border-stone-400 text-xs font-bold uppercase tracking-wider text-stone-700 bg-white hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Exit to Customer View
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
                { id: 'dashboard', label: 'Super Admin Dashboard', icon: Shield },
                { id: 'destinations', label: 'Manage Destinations', icon: Compass, badge: destinations.length },
                { id: 'places', label: 'Manage Tourist Places', icon: MapPin, badge: touristPlaces.length },
                { id: 'transport', label: 'Manage Flights/Trains/Buses', icon: Plane, badge: travelOptions.length },
                { id: 'hotels', label: 'Hotels & Partners', icon: HotelIcon, badge: hotels.length },
                { id: 'vehicles', label: 'Vehicles & Fleet', icon: Car, badge: vehicles.length },
                { id: 'customers', label: 'View All Users', icon: Users },
                { id: 'bookings', label: 'View All Bookings', icon: FileText, badge: bookings.length },
                { id: 'analytics', label: 'Revenue Analytics', icon: BarChart3 },
                { id: 'logs', label: 'System Audit Logs', icon: FileText, badge: auditLogs.length },
                { id: 'settings', label: 'Platform Settings', icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as AdminTab)}
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
                          isActive ? 'bg-white/20 text-white' : 'bg-[#9D3373]/10 text-[#9D3373]'
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
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-6">

            {/* ══════════════════════════════════════════════════
                TAB 1: DASHBOARD
            ══════════════════════════════════════════════════ */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-in fade-in">

                {/* 6 KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1">
                      Gross Merchandise Value
                    </span>
                    <p className="font-serif-display text-2xl font-light italic text-[#9D3373]">
                      ₹{totalGMV.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-stone-500 mt-1">Total transactions settled</p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1">
                      Confirmed Bookings
                    </span>
                    <p className="font-serif-display text-2xl font-light italic text-stone-900">
                      {confirmedBookingsCount}
                    </p>
                    <p className="text-[10px] text-stone-500 mt-1">End-to-end itineraries</p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1">
                      Active Hotel Partners
                    </span>
                    <p className="font-serif-display text-2xl font-light italic text-[#9D3373]">
                      {hotels.length} Properties
                    </p>
                    <p className="text-[10px] text-stone-500 mt-1">Verified partner listings</p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1">
                      Vehicle Fleet
                    </span>
                    <p className="font-serif-display text-2xl font-light italic text-stone-900">
                      {vehicles.length} Units
                    </p>
                    <p className="text-[10px] text-stone-500 mt-1">Self-drive cars &amp; bikes</p>
                  </div>

                  {/* Monthly Income – NEW */}
                  <div className="bg-gradient-to-br from-[#9D3373]/10 to-[#9D3373]/5 rounded-2xl p-5 border border-[#9D3373]/20 shadow-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-3.5 h-3.5 text-[#9D3373]" />
                      <span className="text-[10px] font-bold text-[#9D3373] uppercase tracking-widest">
                        Monthly Income
                      </span>
                    </div>
                    <p className="font-serif-display text-2xl font-light italic text-[#9D3373]">
                      ₹{monthlyIncome.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-stone-500 mt-1">{monthNames[currentMonth]} {currentYear}</p>
                  </div>

                  {/* Monthly Orders – NEW */}
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-50/30 rounded-2xl p-5 border border-emerald-200 shadow-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <ShoppingCart className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                        Monthly Orders
                      </span>
                    </div>
                    <p className="font-serif-display text-2xl font-light italic text-emerald-700">
                      {monthlyOrders}
                    </p>
                    <p className="text-[10px] text-stone-500 mt-1">Orders placed this month</p>
                  </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* 6-Month Revenue Bar Chart */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-serif-display text-lg font-light text-stone-900">Monthly Revenue</h3>
                        <p className="text-[10px] text-stone-500 mt-0.5">Last 6 months income trend</p>
                      </div>
                      <BarChart3 className="w-4 h-4 text-[#9D3373]" />
                    </div>
                    <BarChart data={revenueChartData} color="#9D3373" />
                  </div>

                  {/* Booking Status Donut */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-serif-display text-lg font-light text-stone-900">Booking Status</h3>
                        <p className="text-[10px] text-stone-500 mt-0.5">Breakdown by status</p>
                      </div>
                      <TrendingUp className="w-4 h-4 text-[#9D3373]" />
                    </div>
                    <DonutChart
                      segments={[
                        { label: 'Confirmed', value: confirmedBookingsCount, color: '#9D3373' },
                        { label: 'Completed', value: completedCount, color: '#10b981' },
                        { label: 'Cancelled', value: cancelledCount, color: '#f43f5e' },
                      ]}
                    />
                  </div>
                </div>

                {/* Order Volume Sparkline + Summary */}
                <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-serif-display text-lg font-light text-stone-900">Order Volume Trend</h3>
                      <p className="text-[10px] text-stone-500 mt-0.5">Monthly order count – last 6 months</p>
                    </div>
                    <Sparkline data={sparklineData} color="#9D3373" />
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {ordersChartData.map((d, i) => (
                      <div key={i} className="bg-[#FAF8F5] rounded-xl p-3 text-center border border-stone-100">
                        <p className="text-[10px] text-stone-500 font-medium">{d.label}</p>
                        <p className="font-serif-display text-lg font-light text-[#9D3373]">{d.value}</p>
                        <p className="text-[9px] text-stone-400">orders</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Audit Logs Overview */}
                <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif-display text-2xl font-light italic text-stone-900">
                      Recent System Events
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('logs')}
                      className="text-xs text-[#9D3373] hover:underline uppercase tracking-wider font-semibold cursor-pointer"
                    >
                      View All Logs &rarr;
                    </button>
                  </div>
                  <div className="space-y-2">
                    {auditLogs.slice(0, 4).map((log) => (
                      <div
                        key={log.id}
                        className="bg-[#FAF8F5] border border-stone-200 rounded-xl p-3 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-[#9D3373]" />
                          <span className="font-mono text-[#9D3373] font-bold">{log.action}</span>
                          <span className="text-stone-700">{log.details}</span>
                        </div>
                        <span className="text-stone-500 text-[10px]">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════
                TAB 2: MANAGE DESTINATIONS
            ══════════════════════════════════════════════════ */}
            {activeTab === 'destinations' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif-display text-3xl font-light italic text-stone-900">
                        Destination Management
                      </h3>
                      <p className="text-xs text-stone-500">
                        Configured hubs with regional budget baselines and tourist spots
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddDest((p) => !p)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#9D3373] hover:bg-[#862960] text-white font-bold uppercase tracking-wider text-xs shadow-xs cursor-pointer transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Destination</span>
                      {showAddDest ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  {/* Add Destination Form */}
                  {showAddDest && (
                    <div className="bg-[#FAF8F5] border border-[#9D3373]/20 rounded-2xl p-6 space-y-5 animate-in fade-in">
                      <h4 className="text-sm font-bold text-stone-800 uppercase tracking-widest">New Destination Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Destination Name *</label>
                          <input className={inputCls} placeholder="e.g. Manali" value={newDest.name}
                            onChange={(e) => setNewDest((p) => ({ ...p, name: e.target.value }))} />
                        </div>
                        <div>
                          <label className={labelCls}>State</label>
                          <input className={inputCls} placeholder="e.g. Himachal Pradesh" value={newDest.state}
                            onChange={(e) => setNewDest((p) => ({ ...p, state: e.target.value }))} />
                        </div>
                        <div>
                          <label className={labelCls}>Country</label>
                          <input className={inputCls} value={newDest.country}
                            onChange={(e) => setNewDest((p) => ({ ...p, country: e.target.value }))} />
                        </div>
                        <div>
                          <label className={labelCls}>Tagline</label>
                          <input className={inputCls} placeholder="Short catchy tagline" value={newDest.tagline}
                            onChange={(e) => setNewDest((p) => ({ ...p, tagline: e.target.value }))} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className={labelCls}>Description</label>
                          <textarea className={`${inputCls} resize-none h-20`} placeholder="Describe the destination..." value={newDest.description}
                            onChange={(e) => setNewDest((p) => ({ ...p, description: e.target.value }))} />
                        </div>
                        <div>
                          <label className={labelCls}>Best Time to Visit</label>
                          <input className={inputCls} placeholder="e.g. Oct – Mar" value={newDest.bestTimeToVisit}
                            onChange={(e) => setNewDest((p) => ({ ...p, bestTimeToVisit: e.target.value }))} />
                        </div>
                        <div>
                          <label className={labelCls}>Rating (0–5)</label>
                          <input type="number" step="0.1" min="0" max="5" className={inputCls} value={newDest.rating}
                            onChange={(e) => setNewDest((p) => ({ ...p, rating: e.target.value }))} />
                        </div>
                        <div>
                          <label className={labelCls}>Ideal Days</label>
                          <input type="number" min="1" className={inputCls} value={newDest.idealDays}
                            onChange={(e) => setNewDest((p) => ({ ...p, idealDays: e.target.value }))} />
                        </div>
                        <div>
                          <label className={labelCls}>Image URL</label>
                          <input className={inputCls} placeholder="https://..." value={newDest.imageUrl}
                            onChange={(e) => setNewDest((p) => ({ ...p, imageUrl: e.target.value }))} />
                        </div>
                        <div>
                          <label className={labelCls}>Budget – Economy (₹)</label>
                          <input type="number" className={inputCls} value={newDest.budgetBudget}
                            onChange={(e) => setNewDest((p) => ({ ...p, budgetBudget: e.target.value }))} />
                        </div>
                        <div>
                          <label className={labelCls}>Budget – Moderate (₹)</label>
                          <input type="number" className={inputCls} value={newDest.budgetModerate}
                            onChange={(e) => setNewDest((p) => ({ ...p, budgetModerate: e.target.value }))} />
                        </div>
                        <div>
                          <label className={labelCls}>Budget – Luxury (₹)</label>
                          <input type="number" className={inputCls} value={newDest.budgetLuxury}
                            onChange={(e) => setNewDest((p) => ({ ...p, budgetLuxury: e.target.value }))} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className={labelCls}>Highlights (comma-separated)</label>
                          <input className={inputCls} placeholder="Rohtang Pass, Solang Valley, Old Manali…" value={newDest.highlights}
                            onChange={(e) => setNewDest((p) => ({ ...p, highlights: e.target.value }))} />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleAddDestination}
                          className="px-6 py-2.5 rounded-full bg-[#9D3373] hover:bg-[#862960] text-white font-bold uppercase tracking-wider text-xs shadow-xs cursor-pointer"
                        >
                          Save Destination
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddDest(false)}
                          className="px-6 py-2.5 rounded-full border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold uppercase tracking-wider text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Existing Destinations List */}
                  <div className="space-y-4">
                    {destinations.map((dest) => (
                      <div
                        key={dest.id}
                        className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={dest.imageUrl}
                            alt={dest.name}
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 rounded-xl object-cover border border-stone-200"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-serif-display text-xl font-light text-stone-900">{dest.name}</h4>
                              <span className="text-[10px] text-[#9D3373] font-semibold">{dest.state}</span>
                            </div>
                            <p className="text-xs text-stone-500 mt-1">
                              Best time: {dest.bestTimeToVisit} • Rating: ★ {dest.rating}
                            </p>
                          </div>
                        </div>
                        <div className="sm:text-right flex items-center gap-3">
                          <span className="text-[10px] text-stone-500 uppercase block">Moderate Budget Base</span>
                          <span className="font-serif-display text-xl font-light italic text-[#9D3373]">
                            ₹{((typeof dest.estimatedBudget === 'object' && dest.estimatedBudget !== null
                              ? dest.estimatedBudget.Moderate
                              : typeof dest.estimatedBudget === 'number'
                              ? dest.estimatedBudget
                              : dest.averageBudget) || 15000).toLocaleString()}
                          </span>
                          <button type="button" onClick={() => setEditingDestination(dest)} className="px-3 py-1.5 rounded-full border border-[#9D3373]/30 text-[#9D3373] text-[10px] font-bold uppercase">Edit Details</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {editingPlace && (
                    <div className="fixed inset-0 z-50 bg-stone-900/60 flex items-center justify-center p-4">
                      <div className="bg-white rounded-3xl p-6 max-w-xl w-full space-y-4">
                        <div className="flex justify-between items-center"><h3 className="text-xl font-bold">Edit Tourist Place</h3><button type="button" onClick={() => setEditingPlace(null)}><X /></button></div>
                        <input className={inputCls} value={editingPlace.name} onChange={(e) => setEditingPlace({ ...editingPlace, name: e.target.value })} />
                        <textarea className={`${inputCls} h-24`} value={editingPlace.description} onChange={(e) => setEditingPlace({ ...editingPlace, description: e.target.value })} />
                        <div className="grid grid-cols-2 gap-3"><input className={inputCls} value={editingPlace.visitDuration} onChange={(e) => setEditingPlace({ ...editingPlace, visitDuration: e.target.value, timeRequired: e.target.value })} /><input className={inputCls} type="number" value={editingPlace.entryFee} onChange={(e) => setEditingPlace({ ...editingPlace, entryFee: Number(e.target.value) })} /></div>
                        <button type="button" onClick={() => { updateTouristPlace(editingPlace.id, editingPlace); setEditingPlace(null); showToast('Tourist place updated.'); }} className="px-5 py-2 rounded-full bg-[#9D3373] text-white text-xs font-bold uppercase">Save Changes</button>
                      </div>
                    </div>
                  )}
                  {editingDestination && (
                    <div className="fixed inset-0 z-50 bg-stone-900/60 flex items-center justify-center p-4">
                      <div className="bg-white rounded-3xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-4">
                        <div className="flex justify-between items-center"><h3 className="text-xl font-bold">Edit Destination Details</h3><button type="button" onClick={() => setEditingDestination(null)}><X /></button></div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {(['name', 'state', 'country', 'tagline', 'bestTimeToVisit', 'imageUrl'] as const).map((field) => (
                            <label key={field} className={labelCls}>{field}<input className={inputCls} value={editingDestination[field] || ''} onChange={(e) => setEditingDestination({ ...editingDestination, [field]: e.target.value })} /></label>
                          ))}
                          <label className={labelCls}>Description<textarea className={`${inputCls} h-24`} value={editingDestination.description} onChange={(e) => setEditingDestination({ ...editingDestination, description: e.target.value })} /></label>
                          <label className={labelCls}>Highlights<input className={inputCls} value={editingDestination.highlights.join(', ')} onChange={(e) => setEditingDestination({ ...editingDestination, highlights: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) })} /></label>
                        </div>
                        <button type="button" onClick={() => { updateDestination(editingDestination.id, editingDestination); setEditingDestination(null); showToast('Destination updated.'); }} className="px-5 py-2 rounded-full bg-[#9D3373] text-white text-xs font-bold uppercase">Save Changes</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════
                TAB 3: MANAGE TOURIST PLACES
            ══════════════════════════════════════════════════ */}
            {activeTab === 'places' && (
              <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs animate-in fade-in">
                <div>
                  <h3 className="font-serif-display text-3xl font-light italic text-stone-900">
                    Tourist Places Directory
                  </h3>
                  <p className="text-xs text-stone-500">
                    Sights, entry fees, and visit durations across destination networks
                  </p>
                  <button type="button" onClick={() => setShowAddPlace((value) => !value)} className="mt-3 px-4 py-2 rounded-full bg-[#9D3373] text-white text-xs font-bold uppercase"><Plus className="inline w-3 h-3 mr-1" /> Add Tourist Place</button>
                </div>
                {showAddPlace && (
                  <div className="bg-[#FAF8F5] rounded-2xl p-4 grid sm:grid-cols-2 gap-3">
                    <input className={inputCls} placeholder="Place name" value={newPlace.name} onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })} />
                    <select className={inputCls} value={newPlace.destinationId} onChange={(e) => setNewPlace({ ...newPlace, destinationId: e.target.value })}><option value="">Select destination</option>{destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
                    <input className={inputCls} placeholder="Category" value={newPlace.category} onChange={(e) => setNewPlace({ ...newPlace, category: e.target.value as TouristPlace['category'] })} />
                    <input className={inputCls} placeholder="Entry fee" type="number" value={newPlace.entryFee} onChange={(e) => setNewPlace({ ...newPlace, entryFee: e.target.value })} />
                    <input className={inputCls} placeholder="Visit duration" value={newPlace.visitDuration} onChange={(e) => setNewPlace({ ...newPlace, visitDuration: e.target.value })} />
                    <input className={inputCls} placeholder="Image URL" value={newPlace.imageUrl} onChange={(e) => setNewPlace({ ...newPlace, imageUrl: e.target.value })} />
                    <button type="button" onClick={handleAddPlace} className="sm:col-span-2 px-4 py-2 rounded-full bg-[#9D3373] text-white text-xs font-bold uppercase">Save Place</button>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {touristPlaces.map((tp) => (
                    <div
                      key={tp.id}
                      className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-4 flex items-center justify-between gap-3"
                    >
                      <div>
                        <span className="text-[10px] text-[#9D3373] uppercase font-bold">{tp.category}</span>
                        <h4 className="font-serif-display text-lg font-light text-stone-900">{tp.name}</h4>
                        <p className="text-xs text-stone-500">Est. Time: {tp.timeRequired} • ★ {tp.rating}</p>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <span className="text-xs text-stone-700 font-semibold block">
                          {tp.entryFee === 0 ? 'Free' : `₹${tp.entryFee}`}
                        </span>
                        <button type="button" onClick={() => setEditingPlace(tp)} className="text-[10px] text-[#9D3373] font-bold">Edit</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════
                TAB 4: MANAGE TRANSPORT
            ══════════════════════════════════════════════════ */}
            {activeTab === 'transport' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif-display text-3xl font-light italic text-stone-900">
                      Transport Schedules &amp; Seats
                    </h3>
                    <p className="text-xs text-stone-500">
                      Flights, Trains &amp; Buses available in customer Trip Planner
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-stone-200 p-1 rounded-xl shadow-xs">
                    {(['ALL', 'FLIGHT', 'TRAIN', 'BUS'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setTransportFilter(m)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                          transportFilter === m ? 'bg-[#9D3373] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {m === 'ALL' ? 'All' : m}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#9D3373]" />
                    <h4 className="font-semibold text-sm text-stone-900">Add schedule for a destination</h4>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <select className={inputCls} value={newTransport.destinationId} onChange={(e) => setNewTransport({ ...newTransport, destinationId: e.target.value })}>
                      <option value="">Select destination *</option>
                      {destinations.map((destination) => <option key={destination.id} value={destination.id}>{destination.name}</option>)}
                    </select>
                    <select className={inputCls} value={newTransport.mode} onChange={(e) => setNewTransport({ ...newTransport, mode: e.target.value as TravelMode })}>
                      <option value="FLIGHT">Flight</option>
                      <option value="TRAIN">Train</option>
                      <option value="BUS">Bus</option>
                    </select>
                    <input className={inputCls} placeholder="Operator *" value={newTransport.operator} onChange={(e) => setNewTransport({ ...newTransport, operator: e.target.value })} />
                    <input className={inputCls} placeholder="Code / number *" value={newTransport.code} onChange={(e) => setNewTransport({ ...newTransport, code: e.target.value })} />
                    <input className={inputCls} placeholder="From city *" value={newTransport.fromCity} onChange={(e) => setNewTransport({ ...newTransport, fromCity: e.target.value })} />
                    <input className={inputCls} placeholder="To city *" value={newTransport.toCity} onChange={(e) => setNewTransport({ ...newTransport, toCity: e.target.value })} />
                    <input className={inputCls} placeholder="Departure" value={newTransport.departureTime} onChange={(e) => setNewTransport({ ...newTransport, departureTime: e.target.value })} />
                    <input className={inputCls} placeholder="Arrival" value={newTransport.arrivalTime} onChange={(e) => setNewTransport({ ...newTransport, arrivalTime: e.target.value })} />
                    <input className={inputCls} placeholder="Duration" value={newTransport.duration} onChange={(e) => setNewTransport({ ...newTransport, duration: e.target.value })} />
                    <input className={inputCls} type="number" min="0" placeholder="Price per person" value={newTransport.pricePerPerson} onChange={(e) => setNewTransport({ ...newTransport, pricePerPerson: e.target.value })} />
                    <input className={inputCls} type="number" min="0" placeholder="Available seats" value={newTransport.availableSeats} onChange={(e) => setNewTransport({ ...newTransport, availableSeats: e.target.value })} />
                    <input className={inputCls} placeholder="Stops / service notes" value={newTransport.stops} onChange={(e) => setNewTransport({ ...newTransport, stops: e.target.value })} />
                  </div>
                  <button type="button" onClick={handleAddTransport} className="px-4 py-2 rounded-full bg-[#9D3373] text-white text-xs font-bold uppercase">
                    Add {newTransport.mode.toLowerCase()} schedule
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-stone-600">Destination</label>
                  <select className={`${inputCls} max-w-xs`} value={transportDestinationFilter} onChange={(e) => setTransportDestinationFilter(e.target.value)}>
                    <option value="ALL">All destinations</option>
                    {destinations.map((destination) => <option key={destination.id} value={destination.id}>{destination.name}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  {travelOptions
                    .filter((t) => transportFilter === 'ALL' || t.mode === transportFilter)
                    .filter((t) => transportDestinationFilter === 'ALL' || getTransportDestinationId(t) === transportDestinationFilter)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#9D3373]/10 border border-[#9D3373]/20 flex items-center justify-center text-[#9D3373]">
                            {item.mode === 'FLIGHT' && <Plane className="w-5 h-5" />}
                            {item.mode === 'TRAIN' && <Train className="w-5 h-5" />}
                            {item.mode === 'BUS' && <Bus className="w-5 h-5" />}
                          </div>
                          <div>
                            <span className="font-serif-display text-base font-light text-stone-900">
                              {item.operator} ({item.code})
                            </span>
                            <p className="text-xs text-stone-500">
                              {item.fromCity} &rarr; {item.toCity} ({item.departureTime} - {item.arrivalTime})
                            </p>
                            <p className="text-[10px] text-[#9D3373] font-semibold uppercase">
                              {destinations.find((destination) => destination.id === getTransportDestinationId(item))?.name || 'Legacy schedule'}
                            </p>
                          </div>
                        </div>
                        <div className="sm:text-right flex items-center gap-4 justify-between sm:justify-end">
                          <div>
                            <span className="text-xs text-[#9D3373] font-mono font-bold block">
                              ₹{item.pricePerPerson.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-stone-500">{item.availableSeats} seats left</span>
                          </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════
                TAB 5: HOTELS & PARTNERS (Partner View removed)
            ══════════════════════════════════════════════════ */}
            {activeTab === 'hotels' && (
              <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif-display text-3xl font-light italic text-stone-900">
                      Hotel Partners &amp; Inventory Management
                    </h3>
                    <p className="text-xs text-stone-500">
                      Partner registrations, verified properties, and real-time inventory health
                    </p>
                  </div>
                  <span className="text-xs text-[#9D3373] font-medium px-3 py-1 rounded-full bg-[#9D3373]/10 border border-[#9D3373]/20">
                    {hotelPartners.length} Active Partners
                  </span>
                </div>

                {loadingPartners ? (
                  <div className="text-center py-8">
                    <p className="text-stone-600 text-sm">Loading hotel partners...</p>
                  </div>
                ) : hotelPartners.length === 0 ? (
                  <div className="text-center py-8 bg-[#FAF8F5] rounded-2xl border border-dashed border-stone-300">
                    <p className="text-stone-600 text-sm">No hotel partners registered yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hotelPartners.map((partner) => (
                      <div
                        key={partner.id}
                        className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-stone-300 transition-all"
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#9D3373]/20 to-[#9D3373]/10 flex items-center justify-center shrink-0">
                            <HotelIcon className="w-8 h-8 text-[#9D3373]" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-serif-display text-xl font-light text-stone-900">{partner.name}</h4>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                  partner.partnerStatus === 'APPROVED'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : partner.partnerStatus === 'PENDING'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {partner.partnerStatus}
                              </span>
                            </div>
                            <p className="text-xs text-stone-600 mt-1">
                              <strong>Business:</strong> {partner.partnerBusinessName || 'Not specified'}
                            </p>
                            <p className="text-xs text-stone-600">
                              <strong>Email:</strong> {partner.email} • <strong>Phone:</strong> {partner.phone || 'Not provided'}
                            </p>
                            <p className="text-xs text-stone-500 mt-1">
                              Registered: {new Date(partner.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-[#9D3373]">{partner.hotelCount}</p>
                            <p className="text-[10px] text-stone-600 uppercase tracking-wider font-medium">
                              Properties
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => viewPartnerInventory(partner, 'hotels')}
                            className="px-4 py-2 rounded-full bg-[#9D3373] hover:bg-[#862960] text-white font-bold uppercase tracking-wider text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Hotels
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════
                TAB 6: VEHICLES & FLEET
            ══════════════════════════════════════════════════ */}
            {activeTab === 'vehicles' && (
              <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif-display text-3xl font-light italic text-stone-900">
                      Vehicle Partners &amp; Fleet Management
                    </h3>
                    <p className="text-xs text-stone-500">
                      Partner registrations, vehicle inventory, and rental operations
                    </p>
                  </div>
                  <span className="text-xs text-[#9D3373] font-medium px-3 py-1 rounded-full bg-[#9D3373]/10 border border-[#9D3373]/20">
                    {vehiclePartners.length} Active Partners
                  </span>
                </div>

                {loadingPartners ? (
                  <div className="text-center py-8">
                    <p className="text-stone-600 text-sm">Loading vehicle partners...</p>
                  </div>
                ) : vehiclePartners.length === 0 ? (
                  <div className="text-center py-8 bg-[#FAF8F5] rounded-2xl border border-dashed border-stone-300">
                    <p className="text-stone-600 text-sm">No vehicle partners registered yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vehiclePartners.map((partner) => (
                      <div
                        key={partner.id}
                        className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-stone-300 transition-all"
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#9D3373]/20 to-[#9D3373]/10 flex items-center justify-center shrink-0">
                            <Car className="w-8 h-8 text-[#9D3373]" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-serif-display text-xl font-light text-stone-900">{partner.name}</h4>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                  partner.partnerStatus === 'APPROVED'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : partner.partnerStatus === 'PENDING'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {partner.partnerStatus}
                              </span>
                            </div>
                            <p className="text-xs text-stone-600 mt-1">
                              <strong>Business:</strong> {partner.partnerBusinessName || 'Not specified'}
                            </p>
                            <p className="text-xs text-stone-600">
                              <strong>Email:</strong> {partner.email} • <strong>Phone:</strong> {partner.phone || 'Not provided'}
                            </p>
                            <p className="text-xs text-stone-500 mt-1">
                              Registered: {new Date(partner.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-[#9D3373]">{partner.vehicleCount}</p>
                            <p className="text-[10px] text-stone-600 uppercase tracking-wider font-medium">
                              Vehicles
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => viewPartnerInventory(partner, 'vehicles')}
                            className="px-4 py-2 rounded-full bg-[#9D3373] hover:bg-[#862960] text-white font-bold uppercase tracking-wider text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Vehicles
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════
                TAB 7: ALL CUSTOMERS
            ══════════════════════════════════════════════════ */}
            {activeTab === 'customers' && (
              <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs animate-in fade-in">
                <div>
                  <h3 className="font-serif-display text-3xl font-light italic text-stone-900">Registered Users</h3>
                  <p className="text-xs text-stone-500">Customers and partner accounts registered in MongoDB</p>
                </div>
                <div className="space-y-3">
                  {users.map((cust) => (
                    <div key={cust.id} className="bg-[#FAF8F5] border border-stone-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-serif-display text-base font-light text-stone-900">{cust.name}</h4>
                        <p className="text-xs text-stone-500">{cust.email} • {cust.phone || 'Phone not provided'}</p>
                        <p className="text-xs text-stone-500 mt-1"><MapPin className="inline w-3 h-3 mr-1" />{cust.address || cust.city || 'Location not provided'}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#9D3373] block">{cust.role.replace('_', ' ')}</span>
                        {cust.role === 'CUSTOMER' && (
                          <span className="text-xs font-semibold text-stone-700 block">{bookings.filter((booking) => booking.userId === cust.id).length} Trips</span>
                        )}
                        <span className="text-[10px] text-emerald-700 font-medium">{cust.isActive === false ? 'Inactive' : 'Active Member'}</span>
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && (
                    <p className="text-sm text-stone-500 py-6 text-center">No registered users found.</p>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════
                TAB 8: ALL BOOKINGS
            ══════════════════════════════════════════════════ */}
            {activeTab === 'bookings' && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <h3 className="font-serif-display text-3xl font-light italic text-stone-900">Platform Master Bookings</h3>
                  <p className="text-xs text-stone-500">All customer trips, payments, and instant settlement references</p>
                </div>
                <div className="space-y-4">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-bold text-[#9D3373]">{b.id}</span>
                          <span className="text-xs text-stone-400">•</span>
                          <span className="text-xs text-stone-900 font-medium">{b.customerName}</span>
                          <span className="text-xs text-stone-400">•</span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              b.status === 'CONFIRMED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>
                        <p className="font-serif-display text-lg font-light text-stone-900">
                          {b.destination} Trip ({b.departureDate} &rarr; {b.returnDate})
                        </p>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Ref: {b.payment.transactionRef} • Method: {b.payment.method}
                        </p>
                      </div>
                      <div className="md:text-right pt-3 md:pt-0 border-t md:border-t-0 border-stone-200">
                        <span className="text-[10px] uppercase text-stone-500 block">Total GMV</span>
                        <span className="font-serif-display text-2xl font-light italic text-[#9D3373]">
                          ₹{b.totalCost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════
                TAB 9: REVENUE ANALYTICS
            ══════════════════════════════════════════════════ */}
            {activeTab === 'analytics' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
                  <div>
                    <h3 className="font-serif-display text-3xl font-light italic text-stone-900 mb-2">
                      Financial Analytics &amp; Flow
                    </h3>
                    <p className="text-xs text-stone-500 font-normal">
                      Real-time transaction volume broken down by travel, hotel, and vehicle components
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-5">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1">Platform GMV</span>
                      <span className="font-serif-display text-3xl font-light italic text-[#9D3373]">₹{totalGMV.toLocaleString()}</span>
                    </div>
                    <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-5">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1">Avg Order Value (AOV)</span>
                      <span className="font-serif-display text-3xl font-light italic text-stone-900">
                        ₹{bookings.length > 0 ? Math.round(totalGMV / bookings.length).toLocaleString() : 0}
                      </span>
                    </div>
                    <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-5">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1">Platform Take-Rate (5%)</span>
                      <span className="font-serif-display text-3xl font-light italic text-emerald-700">
                        ₹{Math.round(totalGMV * 0.05).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Analytics Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-bold text-stone-700 uppercase tracking-widest mb-3">6-Month Revenue (₹)</h4>
                      <BarChart data={revenueChartData} color="#9D3373" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-700 uppercase tracking-widest mb-3">6-Month Order Count</h4>
                      <BarChart data={ordersChartData} color="#10b981" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-stone-700 uppercase tracking-widest mb-3">Booking Status Breakdown</h4>
                    <DonutChart
                      segments={[
                        { label: 'Confirmed', value: confirmedBookingsCount, color: '#9D3373' },
                        { label: 'Completed', value: completedCount, color: '#10b981' },
                        { label: 'Cancelled', value: cancelledCount, color: '#f43f5e' },
                      ]}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════
                TAB 10: AUDIT LOGS
            ══════════════════════════════════════════════════ */}
            {activeTab === 'logs' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif-display text-3xl font-light italic text-stone-900">
                      Security &amp; Operational Logs
                    </h3>
                    <p className="text-xs text-stone-500">
                      Immutable record of all seat allocations, room bookings, and price updates
                    </p>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Filter audit logs..."
                      value={logFilter}
                      onChange={(e) => setLogFilter(e.target.value)}
                      className="bg-white border border-stone-300 rounded-xl pl-9 pr-4 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#9D3373]"
                    />
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                  </div>
                </div>
                <div className="space-y-2">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded-full bg-[#9D3373]/10 border border-[#9D3373]/20 font-mono text-[10px] text-[#9D3373] font-bold">
                          {log.action}
                        </span>
                        <span className="text-stone-900 font-medium">{log.actor}</span>
                        <span className="text-stone-400">•</span>
                        <span className="text-stone-600 font-normal">{log.details}</span>
                      </div>
                      <span className="text-stone-400 text-[10px] shrink-0 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════
                TAB 11: PLATFORM SETTINGS (enriched)
            ══════════════════════════════════════════════════ */}
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-in fade-in">
                {/* Core Settings */}
                <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
                  <div>
                    <h3 className="font-serif-display text-3xl font-light italic text-stone-900 mb-2">
                      Super Admin Platform Settings
                    </h3>
                    <p className="text-xs text-stone-500 font-normal">
                      Commission rates, automated payouts, and platform security flags
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>Platform Take-Rate Commission (%)</label>
                      <input type="number" value={platformCommission}
                        onChange={(e) => setPlatformCommission(Number(e.target.value))}
                        className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Partner Payout Settlement Mode</label>
                      <input type="text" value={autoSettleTime}
                        onChange={(e) => setAutoSettleTime(e.target.value)}
                        className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Max Bookings Per Day</label>
                      <input type="number" value={maxBookingsPerDay}
                        onChange={(e) => setMaxBookingsPerDay(Number(e.target.value))}
                        className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Default Currency</label>
                      <select value={defaultCurrency}
                        onChange={(e) => setDefaultCurrency(e.target.value)}
                        className={`${inputCls} cursor-pointer`}>
                        <option value="INR">INR – Indian Rupee (₹)</option>
                        <option value="USD">USD – US Dollar ($)</option>
                        <option value="EUR">EUR – Euro (€)</option>
                        <option value="GBP">GBP – British Pound (£)</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>API Rate Limit (requests/min)</label>
                      <input type="number" value={apiRateLimit}
                        onChange={(e) => setApiRateLimit(Number(e.target.value))}
                        className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Support Contact Email</label>
                      <input type="email" value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        className={inputCls} />
                    </div>
                  </div>

                  {/* Toggle Settings */}
                  <div className="border-t border-stone-200 pt-5 space-y-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-stone-700">System Toggles</h4>
                    {[
                      { label: 'System Maintenance Mode', sublabel: 'Temporarily restrict all new bookings', val: maintenanceMode, set: setMaintenanceMode },
                      { label: 'Email Notifications', sublabel: 'Send booking confirmation emails to customers', val: emailNotifications, set: setEmailNotifications },
                    ].map(({ label, sublabel, val, set }, i) => (
                      <div key={i} className="flex items-center justify-between py-3 border-b border-stone-100">
                        <div>
                          <p className="text-xs font-semibold text-stone-900">{label}</p>
                          <p className="text-[11px] text-stone-500">{sublabel}</p>
                        </div>
                        <Toggle checked={val} onChange={set} />
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => showToast('Platform settings saved successfully.')}
                      className="px-6 py-2.5 rounded-full bg-[#9D3373] hover:bg-[#862960] text-white font-bold uppercase tracking-wider text-xs shadow-xs cursor-pointer"
                    >
                      Save Platform Settings
                    </button>
                  </div>
                </div>

                {/* Feature Flags */}
                <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 space-y-5 shadow-xs">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-[#9D3373]" />
                    <div>
                      <h3 className="font-serif-display text-xl font-light text-stone-900">Feature Flags</h3>
                      <p className="text-xs text-stone-500">Enable or disable platform features globally</p>
                    </div>
                  </div>
                  {[
                    { label: 'Enable Vehicle Rentals', sublabel: 'Allow customers to book self-drive vehicles', val: enableVehicle, set: setEnableVehicle },
                    { label: 'Enable Hotel Bookings', sublabel: 'Allow hotel search and booking flow', val: enableHotel, set: setEnableHotel },
                    { label: 'Enable AI Trip Planner', sublabel: 'Expose the AI-powered itinerary builder to customers', val: enableAIPlanner, set: setEnableAIPlanner },
                  ].map(({ label, sublabel, val, set }, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0">
                      <div>
                        <p className="text-xs font-semibold text-stone-900">{label}</p>
                        <p className="text-[11px] text-stone-500">{sublabel}</p>
                      </div>
                      <Toggle checked={val} onChange={set} />
                    </div>
                  ))}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => showToast('Feature flags updated successfully.')}
                      className="px-6 py-2.5 rounded-full bg-[#9D3373] hover:bg-[#862960] text-white font-bold uppercase tracking-wider text-xs shadow-xs cursor-pointer"
                    >
                      Save Feature Flags
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 md:p-8 space-y-4 shadow-xs">
                  <div>
                    <h3 className="font-serif-display text-xl font-light text-rose-700">Danger Zone</h3>
                    <p className="text-xs text-rose-600 mt-1">Irreversible operations — proceed with extreme caution</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => showToast('Audit logs cleared (simulation).')}
                      className="px-5 py-2 rounded-full border border-rose-300 text-rose-700 text-xs font-bold uppercase tracking-wider hover:bg-rose-100 cursor-pointer"
                    >
                      Clear Audit Logs
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast('Cache flushed successfully.')}
                      className="px-5 py-2 rounded-full border border-rose-300 text-rose-700 text-xs font-bold uppercase tracking-wider hover:bg-rose-100 cursor-pointer"
                    >
                      Flush Platform Cache
                    </button>
                  </div>
                </div>
              </div>
            )}

            {partnerInventory && (
              <div className="fixed inset-0 z-50 bg-stone-900/60 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-serif-display text-2xl font-light text-stone-900">
                        {partnerInventory.kind === 'hotels' ? 'Hotels' : 'Vehicles'} for {partnerInventory.partnerName}
                      </h3>
                      <p className="text-xs text-stone-500">
                        {partnerInventory.items.length} {partnerInventory.kind === 'hotels' ? 'properties' : 'vehicles'} registered
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPartnerInventory(null)}
                      className="p-2 rounded-full hover:bg-stone-100 text-stone-600 cursor-pointer"
                      aria-label="Close inventory"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {loadingInventory ? (
                    <p className="py-8 text-center text-sm text-stone-600">Loading inventory...</p>
                  ) : partnerInventory.items.length === 0 ? (
                    <div className="py-8 text-center bg-[#FAF8F5] rounded-2xl border border-dashed border-stone-300">
                      <p className="text-sm text-stone-600">
                        No {partnerInventory.kind === 'hotels' ? 'hotels' : 'vehicles'} registered for this partner.
                      </p>
                    </div>
                  ) : partnerInventory.kind === 'hotels' ? (
                    <div className="space-y-3">
                      {partnerInventory.items.map((hotel) => (
                        <div key={hotel.id} className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <h4 className="font-semibold text-stone-900">{hotel.name}</h4>
                              <p className="text-xs text-stone-600">
                                {hotel.city || hotel.address || hotel.destinationName || 'Location not provided'}
                              </p>
                            </div>
                            <span className="text-xs font-bold text-[#9D3373]">{hotel.status || 'ACTIVE'}</span>
                          </div>
                          <p className="text-xs text-stone-500 mt-2">
                            {hotel.roomCount || 0} rooms • Rating {hotel.rating || 0} ({hotel.reviewCount || 0} reviews)
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {partnerInventory.items.map((vehicle) => (
                        <div key={vehicle.id} className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <h4 className="font-semibold text-stone-900">{vehicle.name}</h4>
                              <p className="text-xs text-stone-600">
                                {vehicle.type || 'Vehicle'} • {vehicle.registrationNumber || 'Registration not provided'}
                              </p>
                            </div>
                            <span className="text-xs font-bold text-[#9D3373]">{vehicle.rentalStatus || 'AVAILABLE'}</span>
                          </div>
                          <p className="text-xs text-stone-500 mt-2">
                            {vehicle.seats || 0} seats • ₹{(vehicle.dailyRate || 0).toLocaleString()} / day
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
