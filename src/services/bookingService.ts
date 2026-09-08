import apiClient from './api';
import { Booking, PaymentMethod, TripDraft } from '../types';

export interface BookingRequest {
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  travelersCount: number;
  durationDays: number;
  transportId?: string;
  selectedSeats?: string[];
  hotelId?: string;
  hotelName?: string;
  roomId?: string;
  roomName?: string;
  roomCondition?: 'AC' | 'NON_AC';
  vehicleId?: string;
  placeIds?: string[];
  paymentMethod: PaymentMethod;
}

export const bookingService = {
  async createBooking(req: BookingRequest): Promise<Booking> {
    const { data } = await apiClient.post<Booking>('/bookings', req);
    return data;
  },

  async getMyBookings(userId: string): Promise<Booking[]> {
    const { data } = await apiClient.get<Booking[]>(`/bookings/user/${userId}`);
    return data;
  },

  async getById(id: string): Promise<Booking> {
    const { data } = await apiClient.get<Booking>(`/bookings/${id}`);
    return data;
  },

  async cancelBooking(id: string): Promise<Booking> {
    const { data } = await apiClient.patch<Booking>(`/bookings/${id}/cancel`);
    return data;
  },

  async updateStatus(id: string, status: Booking['status']): Promise<Booking> {
    const { data } = await apiClient.patch<Booking>(`/bookings/${id}/status`, { status });
    return data;
  },

  async getAllBookings(): Promise<Booking[]> {
    const { data } = await apiClient.get<Booking[]>('/bookings');
    return data;
  },

  async getHotelPartnerBookings(): Promise<Booking[]> {
    const { data } = await apiClient.get<Booking[]>('/bookings/partner/hotels');
    return data;
  },

  async getVehiclePartnerBookings(): Promise<Booking[]> {
    const { data } = await apiClient.get<Booking[]>('/bookings/partner/vehicles');
    return data;
  },

  /**
   * Helper: converts a TripDraft into a BookingRequest payload
   */
  buildRequestFromDraft(draft: TripDraft, userId: string, customerName: string, customerEmail: string, customerPhone: string, paymentMethod: PaymentMethod): BookingRequest {
    return {
      userId,
      customerName,
      customerEmail,
      customerPhone,
      destination: draft.destinationName,
      departureDate: draft.departureDate,
      returnDate: draft.returnDate,
      travelersCount: draft.travelersCount,
      durationDays: draft.durationDays,
      transportId: draft.selectedTransport?.id,
      selectedSeats: draft.selectedSeats,
      hotelId: draft.selectedHotel?.id,
      hotelName: draft.selectedHotel?.name,
      roomId: draft.selectedRoom?.id,
      roomName: draft.selectedRoom?.name,
      roomCondition: draft.roomCondition,
      vehicleId: !draft.skipVehicle ? draft.selectedVehicle?.id : undefined,
      placeIds: draft.selectedPlaces.map(p => p.id),
      paymentMethod,
    };
  },
};

export default bookingService;
