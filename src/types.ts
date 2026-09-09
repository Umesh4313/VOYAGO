export type UserRole = 'CUSTOMER' | 'HOTEL_PARTNER' | 'VEHICLE_PARTNER' | 'ADMIN';

export type PartnerStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  city?: string;
  state?: string;
  address?: string;
  avatar?: string;
  partnerBusinessName?: string;
  partnerStatus?: PartnerStatus;
  createdAt?: string;
  isActive?: boolean;
}

export type TravelMode = 'FLIGHT' | 'TRAIN' | 'BUS';

export interface TravelOption {
  id: string;
  destinationId?: string;
  mode: TravelMode;
  operator: string;
  code: string;
  fromCity: string;
  toCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  pricePerPerson: number;
  availableSeats: number;
  stops: string;
  rating: number;
  tags?: string[];
  occupiedSeats?: string[]; // e.g. ['1A', '2B', '3C']
}

export interface HotelRoom {
  id: string;
  name: string;
  type: string;
  pricePerNight: number;
  nonAcPricePerNight?: number;
  maxGuests: number;
  capacity?: number;
  bedType: string;
  amenities: string[];
  totalUnits?: number;
  bookedUnits?: number;
  availableCount: number;
  imageUrl: string;
  gallery?: string[];
  bathroomImageUrl?: string;
  viewImageUrl?: string;
  description?: string;
  isAC?: boolean;
  isActive?: boolean;
}

export interface Hotel {
  id: string;
  name: string;
  destinationId: string;
  destinationName: string;
  rating: number;
  reviewCount: number;
  address: string;
  city?: string;
  description: string;
  heroImage: string;
  gallery: string[];
  amenities: string[];
  partnerId: string;
  priceStartsFrom: number;
  rooms: HotelRoom[];
  status?: 'ACTIVE' | 'INACTIVE';
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  rejectionReason?: string;
  bookingAlertsEnabled?: boolean;
  autoCheckInEnabled?: boolean;
}

export type VehicleType = 'CAR' | 'BIKE' | 'SCOOTER';
export type VehicleRentalStatus = 'AVAILABLE' | 'RENTED' | 'RESERVED' | 'MAINTENANCE';

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  category: string; // e.g. 'Compact SUV', 'Cruiser Bike', 'Electric Sedan'
  destinationId: string;
  dailyRate: number;
  transmission: 'Automatic' | 'Manual';
  seats: number;
  fuelType: 'Petrol' | 'Diesel' | 'Electric';
  rating: number;
  imageUrl: string;
  features: string[];
  isAvailable: boolean;
  rentalStatus?: VehicleRentalStatus;
  partnerId: string;
  registrationNumber?: string;
  modelYear?: number;
  totalUnits?: number;
  bookedUnits?: number;
  availableUnits?: number;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehicleName: string;
  date: string;
  cost: number;
  description: string;
  technician: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface TouristPlace {
  id: string;
  destinationId: string;
  name: string;
  category: 'Beach' | 'Heritage' | 'Adventure' | 'Nature' | 'Culture' | 'Nightlife' | 'Religious' | 'Museum' | 'Shopping';
  rating: number;
  visitDuration: string;
  timeRequired?: string;
  entryFee: number;
  description: string;
  imageUrl: string;
  recommendedTime: string;
  highlights: string[];
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  state?: string;
  tagline: string;
  description: string;
  imageUrl: string;
  isTrending?: boolean;
  idealDays: number;
  averageBudget: number;
  estimatedBudget?: { Budget?: number; Moderate?: number; Luxury?: number } | number;
  rating?: number;
  bestTimeToVisit?: string;
  highlights: string[];
}

export interface TripDraft {
  destinationId: string;
  destinationName: string;
  departureDate: string;
  returnDate: string;
  durationDays: number;
  travelersCount: number;
  budgetCategory: 'Budget' | 'Moderate' | 'Luxury';
  preferences: string[]; // e.g. ['Relaxation', 'Beaches', 'Nightlife']
  selectedTransport?: TravelOption;
  transportClass?: 'AC' | 'NON_AC';
  selectedSeats?: string[]; // Visual seat selection (e.g. ['2A', '2B'])
  selectedHotel?: Hotel;
  selectedRoom?: HotelRoom;
  roomCondition?: 'AC' | 'NON_AC';
  selectedVehicle?: Vehicle;
  skipVehicle: boolean;
  selectedPlaces: TouristPlace[];
}

export type PaymentMethod = 'UPI' | 'CARD' | 'NETBANKING';

export interface PaymentDetails {
  method: PaymentMethod;
  amount: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  transactionRef: string;
  timestamp: string;
  idempotencyKey: string;
}

export interface Booking {
  id: string; // e.g. VOY-2026-89412
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  travelersCount: number;
  durationDays: number;
  transport?: TravelOption;
  selectedSeats?: string[];
  transportClass?: 'AC' | 'NON_AC';
  hotel?: {
    id: string;
    name: string;
    roomType: string;
    roomName: string;
    roomUnits?: number;
    pricePerNight: number;
    nights: number;
    total: number;
    address: string;
    condition?: 'AC' | 'NON_AC';
  };
  vehicle?: {
    id: string;
    name: string;
    type: VehicleType;
    dailyRate: number;
    days: number;
    total: number;
  };
  places: TouristPlace[];
  payment: PaymentDetails;
  totalCost: number;
  taxesAndFees: number;
  status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'BOOKING' | 'SYSTEM' | 'PARTNER' | 'PAYMENT' | 'PARTNER_UPDATE';
  roleTarget?: UserRole;
}

export interface SavedItem {
  id: string;
  userId?: string;
  type: 'DESTINATION' | 'HOTEL' | 'VEHICLE' | 'PLACE';
  itemId: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  savedAt: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  role: UserRole;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
  details: string;
}
