import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  UserRole,
  PartnerStatus,
  Destination,
  TravelOption,
  Hotel,
  HotelRoom,
  Vehicle,
  VehicleRentalStatus,
  MaintenanceRecord,
  TouristPlace,
  TripDraft,
  Booking,
  AuditLog,
  NotificationItem,
  SavedItem,
  PaymentMethod,
} from '../types';
import {
  INITIAL_USERS,
  DESTINATIONS,
  TRAVEL_OPTIONS,
  HOTELS,
  VEHICLES,
  TOURIST_PLACES,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';
import authService from '../services/authService';
import bookingService from '../services/bookingService';
import adminService from '../services/adminService';

export type AppViewType = 'home' | 'customer' | 'my-trips' | 'hotel-partner' | 'vehicle-partner' | 'admin';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  beginUserSession: (user: User, isNewRegistration?: boolean) => void;
  logout: () => void;
  users: User[];
  refreshUsers: () => Promise<void>;
  toggleUserStatus: (userId: string) => void;
  updatePartnerStatus: (userId: string, status: PartnerStatus) => void;

  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalInitialTab: 'login' | 'signup';
  setAuthModalInitialTab: (tab: 'login' | 'signup') => void;
  authRoleToLogin?: UserRole;
  setAuthRoleToLogin: (role?: UserRole) => void;

  // Catalog Data
  destinations: Destination[];
  travelOptions: TravelOption[];
  hotels: Hotel[];
  vehicles: Vehicle[];
  touristPlaces: TouristPlace[];
  bookings: Booking[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  savedItems: SavedItem[];
  maintenanceRecords: MaintenanceRecord[];

  // Trip Draft
  currentDraft: TripDraft;
  updateDraft: (updates: Partial<TripDraft>) => void;
  startNewTrip: (
    destinationId?: string,
    startDate?: string,
    endDate?: string,
    travelers?: number,
    budgetCategory?: 'Budget' | 'Moderate' | 'Luxury',
    vehiclePref?: 'ANY' | 'CAR' | 'BIKE' | 'NONE',
    openPlanner?: boolean
  ) => void;
  isPlannerOpen: boolean;
  setIsPlannerOpen: (open: boolean) => void;
  plannerStep: number;
  setPlannerStep: (step: number) => void;

  // Booking & Availability Actions
  checkAvailability: (draft: TripDraft) => {
    isAvailable: boolean;
    reason?: string;
  };
  processPaymentAndConfirm: (
    method: PaymentMethod,
    simulateFailure?: boolean
  ) => Promise<{ success: boolean; booking?: Booking; error?: string }>;
  cancelBooking: (bookingId: string) => void;

  // Partner & Admin mutation functions
  updateHotelRoomPrice: (hotelId: string, roomId: string, newPrice: number) => void;
  updateHotelRoomDetails: (hotelId: string, roomId: string, newPrice: number, newTotalUnits: number, details?: Partial<Pick<HotelRoom, 'name' | 'bedType' | 'maxGuests'>>) => void;
  addHotelRoomType: (hotelId: string, room: Omit<HotelRoom, 'id' | 'availableCount'>) => void;
  toggleHotelRoomAvailability: (hotelId: string, roomId: string) => void;

  updateVehiclePriceAndStatus: (vehicleId: string, newDailyRate: number, isAvailable: boolean) => void;
  setVehicleRentalStatus: (vehicleId: string, status: VehicleRentalStatus) => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  addMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id'>) => void;

  // Transportation Management (Admin)
  addTransportOption: (opt: Omit<TravelOption, 'id'>) => void;
  deleteTransportOption: (id: string) => void;

  // Destinations & Places (Admin)
  addDestination: (dest: Omit<Destination, 'id'>) => void;
  updateDestination: (id: string, updates: Partial<Omit<Destination, 'id'>>) => void;
  addTouristPlace: (place: Omit<TouristPlace, 'id'>) => void;
  updateTouristPlace: (id: string, updates: Partial<Omit<TouristPlace, 'id'>>) => void;
  removeHotel: (id: string) => void;
  removeVehicle: (id: string) => void;

  // Saved Places & Notifications
  toggleSaveItem: (item: Omit<SavedItem, 'id' | 'savedAt'>) => void;
  isItemSaved: (itemId: string) => boolean;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => void;

  addAuditLog: (action: string, entity: string, entityId: string, details: string) => void;

  // Navigation state
  activeView: AppViewType;
  setActiveView: (view: AppViewType) => void;
  adminActiveTab: string;
  setAdminActiveTab: (tab: string) => void;
  customerActiveTab: string;
  setCustomerActiveTab: (tab: string) => void;
  navigateToAdminTab: (tab: string) => void;
  navigateToCustomerTab: (tab: string) => void;
  openPlanningLogin: () => void;
  backgroundImage: string;
  setBackgroundImage: (img: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'voyago_';
const GUEST_USER: User = {
  id: 'guest',
  name: 'Guest',
  email: '',
  role: 'CUSTOMER',
};

const safeGetItem = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`Failed to parse localStorage key ${key}`, err);
    return fallback;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Current User & Users list
  const [currentUser, setCurrentUser] = useState<User>(() => {
    return authService.isAuthenticated() ? (authService.getStoredUser() || GUEST_USER) : GUEST_USER;
  });

  const [users, setUsers] = useState<User[]>(() => {
    return safeGetItem<User[]>(
      `${LOCAL_STORAGE_PREFIX}users_list`,
      INITIAL_USERS.map((u) => ({
        ...u,
        partnerStatus: u.role.includes('PARTNER') ? ('APPROVED' as PartnerStatus) : undefined,
        isActive: true,
        createdAt: '2026-01-15',
      }))
    );
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(() => (
    typeof window !== 'undefined' && Boolean(new URLSearchParams(window.location.search).get('resetToken'))
  ));
  const [authModalInitialTab, setAuthModalInitialTab] = useState<'login' | 'signup'>('login');
  const [authRoleToLogin, setAuthRoleToLogin] = useState<UserRole | undefined>(undefined);
  const [activeView, setActiveView] = useState<AppViewType>('home');
  const [adminActiveTab, setAdminActiveTab] = useState<string>('dashboard');
  const [customerActiveTab, setCustomerActiveTab] = useState<string>('dashboard');
  const [backgroundImage, setBackgroundImage] = useState<string>(
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2560&q=85'
  );

  const navigateToAdminTab = (tab: string) => {
    setAdminActiveTab(tab);
    setActiveView('admin');
  };

  const navigateToCustomerTab = (tab: string) => {
    setCustomerActiveTab(tab);
    setActiveView('customer');
  };

  const openPlanningLogin = () => {
    setAuthRoleToLogin('CUSTOMER');
    setAuthModalInitialTab('login');
    setIsAuthModalOpen(true);
  };

  // 2. Catalog states
  const [destinations, setDestinations] = useState<Destination[]>(() => {
    return safeGetItem<Destination[]>(`${LOCAL_STORAGE_PREFIX}destinations`, DESTINATIONS);
  });

  const [travelOptions, setTravelOptions] = useState<TravelOption[]>(() => {
    return safeGetItem<TravelOption[]>(`${LOCAL_STORAGE_PREFIX}travel_options`, TRAVEL_OPTIONS);
  });

  const [hotels, setHotels] = useState<Hotel[]>(() => {
    const fallback = HOTELS.map((h) => ({
      ...h,
      rooms: h.rooms.map((r) => ({
        ...r,
        totalUnits: r.totalUnits ?? 8,
        bookedUnits: r.bookedUnits ?? Math.max(0, 8 - r.availableCount),
        availableCount: r.availableCount,
      })),
    }));
    return safeGetItem<Hotel[]>(`${LOCAL_STORAGE_PREFIX}hotels`, fallback);
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const fallback = VEHICLES.map((v) => ({
      ...v,
      rentalStatus: (v.isAvailable ? 'AVAILABLE' : 'RENTED') as VehicleRentalStatus,
      registrationNumber: `GA-01-E-${Math.floor(1000 + Math.random() * 9000)}`,
      modelYear: 2024,
    }));
    return safeGetItem<Vehicle[]>(`${LOCAL_STORAGE_PREFIX}vehicles`, fallback);
  });

  const [touristPlaces, setTouristPlaces] = useState<TouristPlace[]>(() => {
    return safeGetItem<TouristPlace[]>(`${LOCAL_STORAGE_PREFIX}places`, TOURIST_PLACES);
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    return [];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    return safeGetItem<AuditLog[]>(`${LOCAL_STORAGE_PREFIX}logs`, INITIAL_AUDIT_LOGS);
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    return [];
  });
  const [notificationStorageUser, setNotificationStorageUser] = useState<string | null>(null);

  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
    return safeGetItem<SavedItem[]>(`${LOCAL_STORAGE_PREFIX}saved`, []);
  });

  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(() => {
    const fallback = [
      {
        id: 'maint-1',
        vehicleId: 'veh-goa-3',
        vehicleName: 'Royal Enfield Classic 350',
        date: '2026-09-01',
        cost: 1850,
        description: 'Routine 5,000 km oil change, brake pad inspection and chain lubrication.',
        technician: 'Goa Moto Care Hub',
        status: 'COMPLETED' as const,
      },
    ];
    return safeGetItem<MaintenanceRecord[]>(`${LOCAL_STORAGE_PREFIX}maintenance`, fallback);
  });

  const beginUserSession = (user: User, isNewRegistration = false) => {
    if (isNewRegistration) {
      localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}notifs_${user.id}`);
      localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}saved_${user.id}`);
      setNotifications([]);
      setBookings([]);
      setSavedItems((previousItems) => previousItems.filter((item) => item.userId !== user.id));
    }
    setUsers((previousUsers) => (
      previousUsers.some((existingUser) => existingUser.id === user.id)
        ? previousUsers.map((existingUser) => existingUser.id === user.id ? { ...existingUser, ...user } : existingUser)
        : [...previousUsers, {
            ...user,
            partnerStatus: user.role.endsWith('_PARTNER') ? 'PENDING' : undefined,
            isActive: true,
            createdAt: user.createdAt || new Date().toISOString(),
          }]
    ));
    setCurrentUser(user);
  };

  const refreshUsers = useCallback(async () => {
    const remoteUsers = await adminService.getUsers();
    setUsers(remoteUsers);
  }, []);

  // 3. Current Trip Draft
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [plannerStep, setPlannerStep] = useState(1);

  const [currentDraft, setCurrentDraft] = useState<TripDraft>({
    destinationId: 'dest-goa',
    destinationName: 'Goa',
    departureDate: '2026-10-15',
    returnDate: '2026-10-19',
    durationDays: 4,
    travelersCount: 2,
    budgetCategory: 'Moderate',
    preferences: ['Relaxation', 'Beaches'],
    selectedSeats: [],
    transportClass: 'AC',
    roomCondition: 'AC',
    skipVehicle: false,
    selectedPlaces: [],
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}user`, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}users_list`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}destinations`, JSON.stringify(destinations));
  }, [destinations]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}travel_options`, JSON.stringify(travelOptions));
  }, [travelOptions]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}hotels`, JSON.stringify(hotels));
  }, [hotels]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}vehicles`, JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}places`, JSON.stringify(touristPlaces));
  }, [touristPlaces]);

  useEffect(() => {
    if (!authService.isAuthenticated() || currentUser.id === GUEST_USER.id) {
      setBookings([]);
      return;
    }
    let isCurrentUser = true;
    setBookings([]);
    bookingService.getMyBookings(currentUser.id)
      .then((userBookings) => {
        if (isCurrentUser) setBookings(userBookings);
      })
      .catch((error) => console.error('Failed to load bookings from the database.', error));
    return () => {
      isCurrentUser = false;
    };
  }, [currentUser.id]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}logs`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    const storageKey = `${LOCAL_STORAGE_PREFIX}notifs_${currentUser.id}`;
    setNotificationStorageUser(null);
    setNotifications(
      currentUser.id === GUEST_USER.id
        ? []
        : safeGetItem<NotificationItem[]>(storageKey, []).filter((notification) => notification.userId === currentUser.id)
    );
    setNotificationStorageUser(currentUser.id);
    localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}notifs`);
  }, [currentUser.id]);

  useEffect(() => {
    if (notificationStorageUser !== currentUser.id || currentUser.id === GUEST_USER.id) return;
    localStorage.setItem(
      `${LOCAL_STORAGE_PREFIX}notifs_${currentUser.id}`,
      JSON.stringify(notifications.filter((notification) => notification.userId === currentUser.id))
    );
  }, [notifications, currentUser.id, notificationStorageUser]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}saved`, JSON.stringify(savedItems));
  }, [savedItems]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}maintenance`, JSON.stringify(maintenanceRecords));
  }, [maintenanceRecords]);

  const addAuditLog = (action: string, entity: string, entityId: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      actor: currentUser.email,
      role: currentUser.role,
      action,
      entity,
      entityId,
      timestamp: new Date().toISOString(),
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const addNotification = (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      userId: notif.userId || (currentUser.id !== GUEST_USER.id ? currentUser.id : undefined),
      id: `nt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (
      n.id === id && n.userId === currentUser.id ? { ...n, isRead: true } : n
    )));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => (
      n.userId === currentUser.id ? { ...n, isRead: true } : n
    )));
  };

  const toggleSaveItem = (item: Omit<SavedItem, 'id' | 'savedAt'>) => {
    setSavedItems((prev) => {
      const exists = prev.find((s) => s.itemId === item.itemId && s.userId === currentUser.id);
      if (exists) {
        return prev.filter((s) => s.id !== exists.id);
      } else {
        return [
          {
            ...item,
            userId: currentUser.id,
            id: `save-${Date.now()}`,
            savedAt: new Date().toISOString(),
          },
          ...prev,
        ];
      }
    });
  };

  const isItemSaved = (itemId: string) => {
    return savedItems.some((s) => s.itemId === itemId && s.userId === currentUser.id);
  };

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u))
    );
    addAuditLog('USER_STATUS_TOGGLE', 'User', userId, 'Toggled user active/suspended state');
  };

  const updatePartnerStatus = (userId: string, status: PartnerStatus) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, partnerStatus: status } : u))
    );
    addAuditLog('PARTNER_STATUS_UPDATE', 'User', userId, `Updated partner status to ${status}`);
    addNotification({
      title: 'Partner Account Updated',
      message: `Partner status changed to ${status}`,
      type: 'PARTNER',
    });
  };


  const logout = () => {
    authService.logout();
    setCurrentUser(GUEST_USER);
    setActiveView('home');
    setIsAuthModalOpen(false);
  };

  const updateDraft = (updates: Partial<TripDraft>) => {
    setCurrentDraft((prev) => ({ ...prev, ...updates }));
  };

  const startNewTrip = (
    destinationId: string = 'dest-goa',
    startDate: string = '2026-10-15',
    endDate: string = '2026-10-19',
    travelers: number = 2,
    budgetCategory: 'Budget' | 'Moderate' | 'Luxury' = 'Moderate',
    vehiclePref: 'ANY' | 'CAR' | 'BIKE' | 'NONE' = 'ANY',
    openPlanner = true
  ) => {
    const dest = destinations.find((d) => d.id === destinationId) || destinations[0];
    
    // calculate days
    let days = 4;
    try {
      const d1 = new Date(startDate);
      const d2 = new Date(endDate);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) days = diffDays;
    } catch {
      days = 4;
    }

    setCurrentDraft({
      destinationId: dest.id,
      destinationName: dest.name,
      departureDate: startDate,
      returnDate: endDate,
      durationDays: days,
      travelersCount: travelers,
      budgetCategory,
      preferences: ['Relaxation', 'Beaches'],
      selectedTransport: undefined,
      selectedSeats: [],
      transportClass: 'AC',
      selectedHotel: undefined,
      selectedRoom: undefined,
      roomCondition: 'AC',
      selectedVehicle: undefined,
      skipVehicle: vehiclePref === 'NONE',
      selectedPlaces: [],
    });

    setPlannerStep(1);
    if (openPlanner) {
      setIsPlannerOpen(true);
    }
  };

  // Pre-payment Availability Verification (FR-AVL-01 & FR-VEH-03)
  const checkAvailability = (draft: TripDraft): { isAvailable: boolean; reason?: string } => {
    // 1. Transport seat check
    if (draft.selectedTransport && draft.selectedSeats && draft.selectedSeats.length > 0) {
      const liveTransport = travelOptions.find((t) => t.id === draft.selectedTransport?.id);
      if (liveTransport && liveTransport.occupiedSeats) {
        const conflict = draft.selectedSeats.find((s) => liveTransport.occupiedSeats?.includes(s));
        if (conflict) {
          return {
            isAvailable: false,
            reason: `Seat ${conflict} on ${liveTransport.operator} was just reserved by another traveler. Please select an alternate seat.`,
          };
        }
      }
    }

    // 2. Hotel room availability
    if (draft.selectedHotel && draft.selectedRoom) {
      const liveHotel = hotels.find((h) => h.id === draft.selectedHotel?.id);
      const liveRoom = liveHotel?.rooms.find((r) => r.id === draft.selectedRoom?.id);
      if (!liveRoom || liveRoom.availableCount <= 0) {
        return {
          isAvailable: false,
          reason: `The room "${draft.selectedRoom.name}" at ${draft.selectedHotel.name} is fully booked. Please choose an alternate room or hotel.`,
        };
      }
    }

    // 3. Vehicle availability (if not skipped)
    if (!draft.skipVehicle && draft.selectedVehicle) {
      const liveVehicle = vehicles.find((v) => v.id === draft.selectedVehicle?.id);
      if (!liveVehicle || !liveVehicle.isAvailable || liveVehicle.rentalStatus === 'MAINTENANCE') {
        return {
          isAvailable: false,
          reason: `The vehicle "${draft.selectedVehicle.name}" is undergoing maintenance or is currently reserved. You may choose another vehicle or click "Skip".`,
        };
      }
    }

    return { isAvailable: true };
  };

  // Payment & Idempotent Confirmation (FR-PAY-01 to 05)
  const processPaymentAndConfirm = async (
    method: PaymentMethod,
    simulateFailure: boolean = false
  ): Promise<{ success: boolean; booking?: Booking; error?: string }> => {
    const availCheck = checkAvailability(currentDraft);
    if (!availCheck.isAvailable) {
      return {
        success: false,
        error: availCheck.reason || 'Inventory is currently unavailable.',
      };
    }

    // Simulate payment processing delay (1.2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1200));

    if (simulateFailure) {
      addAuditLog('PAYMENT_FAILED', 'Payment', `draft-${Date.now()}`, 'Simulated transaction decline by card issuer');
      return {
        success: false,
        error: 'Payment was declined by the bank or gateway timeout occurred. Please retry with UPI or an alternate card.',
      };
    }

    try {
      const booking = await bookingService.createBooking(
        bookingService.buildRequestFromDraft(
          currentDraft,
          currentUser.id,
          currentUser.name,
          currentUser.email,
          currentUser.phone || '',
          method
        )
      );
      setBookings((prev) => [booking, ...prev.filter((item) => item.id !== booking.id)]);
      addAuditLog(
        'BOOKING_CONFIRMED',
        'Booking',
        booking.id,
        `Confirmed booking for ${currentUser.name} (${currentDraft.destinationName}). Total: ₹${booking.totalCost.toLocaleString()}`
      );
      addNotification({
        title: 'Booking Confirmed!',
        message: `Your trip to ${currentDraft.destinationName} (${booking.id}) is confirmed. Total: ₹${booking.totalCost.toLocaleString()}`,
        type: 'BOOKING',
      });
      return { success: true, booking };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Booking could not be saved. Please try again.';
      return { success: false, error: message };
    }

    // Calculate total
    const transportTotal = (currentDraft.selectedTransport?.pricePerPerson || 0) * currentDraft.travelersCount;
    const roomTotal = (currentDraft.selectedRoom?.pricePerNight || 0) * currentDraft.durationDays;
    const vehicleTotal = !currentDraft.skipVehicle && currentDraft.selectedVehicle
      ? currentDraft.selectedVehicle.dailyRate * currentDraft.durationDays
      : 0;
    const subtotal = transportTotal + roomTotal + vehicleTotal;
    const taxesAndFees = Math.round(subtotal * 0.05); // 5% GST & service
    const totalCost = subtotal + taxesAndFees;

    // Unique Booking ID (e.g. VOY-2026-89412)
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const bookingId = `VOY-2026-${randomNum}`;

    const newBooking: Booking = {
      id: bookingId,
      userId: currentUser.id,
      customerName: currentUser.name,
      customerEmail: currentUser.email,
      customerPhone: currentUser.phone || '+91 98765 43210',
      destination: currentDraft.destinationName,
      departureDate: currentDraft.departureDate,
      returnDate: currentDraft.returnDate,
      travelersCount: currentDraft.travelersCount,
      durationDays: currentDraft.durationDays,
      transport: currentDraft.selectedTransport,
      selectedSeats: currentDraft.selectedSeats || ['1A', '1B'],
      transportClass: currentDraft.transportClass,
      hotel: currentDraft.selectedHotel && currentDraft.selectedRoom
        ? {
            id: currentDraft.selectedHotel.id,
            name: currentDraft.selectedHotel.name,
            roomType: currentDraft.selectedRoom.type,
            roomName: currentDraft.selectedRoom.name,
            pricePerNight: currentDraft.selectedRoom.pricePerNight,
            nights: currentDraft.durationDays,
            total: roomTotal,
            address: currentDraft.selectedHotel.address,
            condition: currentDraft.roomCondition,
          }
        : undefined,
      vehicle: !currentDraft.skipVehicle && currentDraft.selectedVehicle
        ? {
            id: currentDraft.selectedVehicle.id,
            name: currentDraft.selectedVehicle.name,
            type: currentDraft.selectedVehicle.type,
            dailyRate: currentDraft.selectedVehicle.dailyRate,
            days: currentDraft.durationDays,
            total: vehicleTotal,
          }
        : undefined,
      places: currentDraft.selectedPlaces,
      payment: {
        method,
        amount: totalCost,
        status: 'SUCCESS',
        transactionRef: `${method}/20260904/${randomNum}`,
        timestamp: new Date().toISOString(),
        idempotencyKey: `idemp-${bookingId}-${Date.now()}`,
      },
      totalCost,
      taxesAndFees,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };

    // Update Room Inventory (FR-AVL-04: Available units decremented)
    if (currentDraft.selectedHotel && currentDraft.selectedRoom) {
      setHotels((prev) =>
        prev.map((h) => {
          if (h.id === currentDraft.selectedHotel?.id) {
            return {
              ...h,
              rooms: h.rooms.map((r) => {
                if (r.id === currentDraft.selectedRoom?.id) {
                  const total = r.totalUnits ?? 8;
                  const booked = (r.bookedUnits ?? 0) + 1;
                  const available = Math.max(0, total - booked);
                  return { ...r, bookedUnits: booked, availableCount: available };
                }
                return r;
              }),
            };
          }
          return h;
        })
      );
    }

    // Update Vehicle Inventory (Marked as RENTED)
    if (!currentDraft.skipVehicle && currentDraft.selectedVehicle) {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === currentDraft.selectedVehicle?.id
            ? { ...v, isAvailable: false, rentalStatus: 'RENTED' as VehicleRentalStatus }
            : v
        )
      );
    }

    // Update Transport Occupied Seats
    if (currentDraft.selectedTransport && currentDraft.selectedSeats) {
      setTravelOptions((prev) =>
        prev.map((t) => {
          if (t.id === currentDraft.selectedTransport?.id) {
            const currentOccupied = t.occupiedSeats || [];
            return {
              ...t,
              occupiedSeats: [...currentOccupied, ...(currentDraft.selectedSeats || [])],
              availableSeats: Math.max(0, t.availableSeats - (currentDraft.selectedSeats?.length || 1)),
            };
          }
          return t;
        })
      );
    }

    // Save booking
    setBookings((prev) => [newBooking, ...prev]);

    // Record audit logs
    addAuditLog(
      'BOOKING_CONFIRMED',
      'Booking',
      bookingId,
      `Confirmed booking for ${currentUser.name} (${currentDraft.destinationName}). Total: ₹${totalCost.toLocaleString()}`
    );

    // Add notifications
    addNotification({
      title: 'Booking Confirmed!',
      message: `Your trip to ${currentDraft.destinationName} (${bookingId}) is confirmed. Total: ₹${totalCost.toLocaleString()}`,
      type: 'BOOKING',
    });
    if (currentDraft.selectedHotel) {
      addNotification({
        userId: currentDraft.selectedHotel.partnerId,
        title: 'New Hotel Booking',
        message: `${currentUser.name} booked ${currentDraft.selectedRoom?.name || 'a room'} at ${currentDraft.selectedHotel.name} from ${currentDraft.departureDate} to ${currentDraft.returnDate}.`,
        type: 'BOOKING',
      });
    }
    if (currentDraft.selectedVehicle) {
      addNotification({
        userId: currentDraft.selectedVehicle.partnerId,
        title: 'New Vehicle Rental',
        message: `${currentUser.name} booked ${currentDraft.selectedVehicle.name} from ${currentDraft.departureDate} to ${currentDraft.returnDate}.`,
        type: 'BOOKING',
      });
    }

    return { success: true, booking: newBooking };
  };

  const cancelBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b))
    );

    // Restore hotel room availableCount
    if (booking.hotel) {
      setHotels((prev) =>
        prev.map((h) => {
          if (h.id === booking.hotel?.id) {
            return {
              ...h,
              rooms: h.rooms.map((r) => {
                if (r.name === booking.hotel?.roomName || r.type === booking.hotel?.roomType) {
                  const total = r.totalUnits ?? 8;
                  const booked = Math.max(0, (r.bookedUnits ?? 1) - 1);
                  return { ...r, bookedUnits: booked, availableCount: Math.min(total, r.availableCount + 1) };
                }
                return r;
              }),
            };
          }
          return h;
        })
      );
    }

    // Restore vehicle availability
    if (booking.vehicle) {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === booking.vehicle?.id
            ? { ...v, isAvailable: true, rentalStatus: 'AVAILABLE' as VehicleRentalStatus }
            : v
        )
      );
    }

    addAuditLog('BOOKING_CANCELLED', 'Booking', bookingId, `Booking ${bookingId} cancelled by user`);
    addNotification({
      title: 'Booking Cancelled',
      message: `Reservation ${bookingId} has been cancelled. Refund initiated to original payment source.`,
      type: 'BOOKING',
    });
  };

  // Hotel Partner Operations
  const updateHotelRoomPrice = (hotelId: string, roomId: string, newPrice: number) => {
    setHotels((prev) =>
      prev.map((h) => {
        if (h.id === hotelId) {
          return {
            ...h,
            rooms: h.rooms.map((r) => (r.id === roomId ? { ...r, pricePerNight: newPrice } : r)),
          };
        }
        return h;
      })
    );
    addAuditLog('ROOM_PRICE_UPDATE', 'HotelRoom', roomId, `Room price adjusted to ₹${newPrice}/night`);
  };

  // Direct editing of price and total units with automatic math: Available = Total - Occupied
  const updateHotelRoomDetails = (
    hotelId: string,
    roomId: string,
    newPrice: number,
    newTotalUnits: number,
    details?: Partial<Pick<HotelRoom, 'name' | 'bedType' | 'maxGuests'>>
  ) => {
    setHotels((prev) =>
      prev.map((h) => {
        if (h.id === hotelId) {
          return {
            ...h,
            rooms: h.rooms.map((r) => {
              if (r.id === roomId) {
                const booked = r.bookedUnits ?? 0;
                const available = Math.max(0, newTotalUnits - booked);
                return {
                  ...r,
                  ...details,
                  pricePerNight: newPrice,
                  totalUnits: newTotalUnits,
                  availableCount: available,
                };
              }
              return r;
            }),
          };
        }
        return h;
      })
    );
    addAuditLog(
      'ROOM_DETAILS_UPDATE',
      'HotelRoom',
      roomId,
      `Updated room: ₹${newPrice}/night, Total Units: ${newTotalUnits}`
    );
  };

  const addHotelRoomType = (hotelId: string, roomData: Omit<HotelRoom, 'id' | 'availableCount'>) => {
    const newRoom: HotelRoom = {
      ...roomData,
      id: `rm-${Date.now()}`,
      totalUnits: roomData.totalUnits ?? 6,
      bookedUnits: 0,
      availableCount: roomData.totalUnits ?? 6,
      isActive: true,
    };

    setHotels((prev) =>
      prev.map((h) => (h.id === hotelId ? { ...h, rooms: [...h.rooms, newRoom] } : h))
    );
    addAuditLog('ROOM_ADDED', 'HotelRoom', newRoom.id, `Added room type ${newRoom.name}`);
  };

  const toggleHotelRoomAvailability = (hotelId: string, roomId: string) => {
    setHotels((prev) =>
      prev.map((h) => {
        if (h.id === hotelId) {
          return {
            ...h,
            rooms: h.rooms.map((r) =>
              r.id === roomId ? { ...r, availableCount: r.availableCount > 0 ? 0 : (r.totalUnits ?? 5) } : r
            ),
          };
        }
        return h;
      })
    );
    addAuditLog('ROOM_AVAILABILITY_TOGGLE', 'HotelRoom', roomId, `Toggled room availability`);
  };

  // Vehicle Partner Operations
  const updateVehiclePriceAndStatus = (vehicleId: string, newDailyRate: number, isAvailable: boolean) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === vehicleId
          ? {
              ...v,
              dailyRate: newDailyRate,
              isAvailable,
              rentalStatus: isAvailable ? 'AVAILABLE' : 'RESERVED',
            }
          : v
      )
    );
    addAuditLog(
      'VEHICLE_UPDATE',
      'Vehicle',
      vehicleId,
      `Rate set to ₹${newDailyRate}/day, Available: ${isAvailable}`
    );
  };

  const setVehicleRentalStatus = (vehicleId: string, status: VehicleRentalStatus) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === vehicleId
          ? {
              ...v,
              rentalStatus: status,
              isAvailable: status === 'AVAILABLE',
            }
          : v
      )
    );
    addAuditLog('VEHICLE_STATUS_CHANGE', 'Vehicle', vehicleId, `Rental status changed to ${status}`);
  };

  const addVehicle = (vehicleData: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      partnerId: currentUser.id,
      id: `veh-${Date.now()}`,
      rentalStatus: 'AVAILABLE',
      isAvailable: true,
      registrationNumber: vehicleData.registrationNumber || `GA-01-V-${Math.floor(1000 + Math.random() * 9000)}`,
      modelYear: vehicleData.modelYear || 2024,
    };
    setVehicles((prev) => [newVehicle, ...prev]);
    addAuditLog('VEHICLE_ADDED', 'Vehicle', newVehicle.id, `Added vehicle ${newVehicle.name}`);
  };

  const addMaintenanceRecord = (record: Omit<MaintenanceRecord, 'id'>) => {
    const newRecord: MaintenanceRecord = {
      ...record,
      id: `maint-${Date.now()}`,
    };
    setMaintenanceRecords((prev) => [newRecord, ...prev]);

    // Automatically set vehicle to MAINTENANCE status if in progress
    if (record.status !== 'COMPLETED') {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === record.vehicleId
            ? { ...v, rentalStatus: 'MAINTENANCE', isAvailable: false }
            : v
        )
      );
    }
    addAuditLog('VEHICLE_MAINTENANCE_LOGGED', 'Maintenance', newRecord.id, `Maintenance logged for ${record.vehicleName}: ₹${record.cost}`);
  };

  // Admin Transport Operations
  const addTransportOption = (opt: Omit<TravelOption, 'id'>) => {
    const newOpt: TravelOption = {
      ...opt,
      id: `tr-${Date.now()}`,
      occupiedSeats: [],
    };
    setTravelOptions((prev) => [newOpt, ...prev]);
    addAuditLog('TRANSPORT_SCHEDULE_ADDED', 'TravelOption', newOpt.id, `Added route ${newOpt.operator} (${newOpt.code})`);
  };

  const deleteTransportOption = (id: string) => {
    setTravelOptions((prev) => prev.filter((t) => t.id !== id));
    addAuditLog('TRANSPORT_SCHEDULE_DELETED', 'TravelOption', id, 'Deleted transport option');
  };

  // Admin Destination Operations
  const addDestination = (dest: Omit<Destination, 'id'>) => {
    const newDest: Destination = {
      ...dest,
      id: `dest-${Date.now()}`,
    };

    setDestinations((prev) => [...prev, newDest]);
    addAuditLog('DESTINATION_ADDED', 'Destination', newDest.id, `Added destination ${newDest.name}`);
  };

  const addTouristPlace = (place: Omit<TouristPlace, 'id'>) => {
    const newPlace: TouristPlace = {
      ...place,
      id: `pl-${Date.now()}`,
    };

    setTouristPlaces((prev) => [...prev, newPlace]);
    addAuditLog('TOURIST_PLACE_ADDED', 'TouristPlace', newPlace.id, `Added attraction ${newPlace.name}`);
  };

  const updateDestination = (id: string, updates: Partial<Omit<Destination, 'id'>>) => {
    setDestinations((prev) => prev.map((dest) => dest.id === id ? { ...dest, ...updates } : dest));
    addAuditLog('DESTINATION_UPDATED', 'Destination', id, 'Updated destination details');
  };

  const updateTouristPlace = (id: string, updates: Partial<Omit<TouristPlace, 'id'>>) => {
    setTouristPlaces((prev) => prev.map((place) => place.id === id ? { ...place, ...updates } : place));
    addAuditLog('TOURIST_PLACE_UPDATED', 'TouristPlace', id, 'Updated tourist place details');
  };

  const removeHotel = (id: string) => {
    setHotels((prev) => prev.filter((hotel) => hotel.id !== id));
    addAuditLog('HOTEL_REMOVED', 'Hotel', id, 'Removed hotel from inventory');
  };

  const removeVehicle = (id: string) => {
    setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== id));
    addAuditLog('VEHICLE_REMOVED', 'Vehicle', id, 'Removed vehicle from fleet');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        beginUserSession,
        logout,
        users,
        refreshUsers,
        toggleUserStatus,
        updatePartnerStatus,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalInitialTab,
        setAuthModalInitialTab,
        authRoleToLogin,
        setAuthRoleToLogin,
        destinations,
        travelOptions,
        hotels,
        vehicles,
        touristPlaces,
        bookings,
        auditLogs,
        notifications,
        savedItems,
        maintenanceRecords,
        currentDraft,
        updateDraft,
        startNewTrip,
        isPlannerOpen,
        setIsPlannerOpen,
        plannerStep,
        setPlannerStep,
        checkAvailability,
        processPaymentAndConfirm,
        cancelBooking,
        updateHotelRoomPrice,
        updateHotelRoomDetails,
        addHotelRoomType,
        toggleHotelRoomAvailability,
        updateVehiclePriceAndStatus,
        setVehicleRentalStatus,
        addVehicle,
        addMaintenanceRecord,
        addTransportOption,
        deleteTransportOption,
        addDestination,
        updateDestination,
        addTouristPlace,
        updateTouristPlace,
        removeHotel,
        removeVehicle,
        toggleSaveItem,
        isItemSaved,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,
        addAuditLog,
        activeView,
        setActiveView,
        adminActiveTab,
        setAdminActiveTab,
        customerActiveTab,
        setCustomerActiveTab,
        navigateToAdminTab,
        navigateToCustomerTab,
        openPlanningLogin,
        backgroundImage,
        setBackgroundImage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
