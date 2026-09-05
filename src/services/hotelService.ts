import apiClient from './api';
import { Hotel, HotelRoom } from '../types';

export const hotelService = {
  async getAll(): Promise<Hotel[]> {
    const { data } = await apiClient.get<Hotel[]>('/hotels');
    return data;
  },

  async getById(id: string): Promise<Hotel> {
    const { data } = await apiClient.get<Hotel>(`/hotels/${id}`);
    return data;
  },

  async getByDestination(destinationId: string): Promise<Hotel[]> {
    const { data } = await apiClient.get<Hotel[]>(`/hotels/destination/${destinationId}`);
    return data;
  },

  async getByPartner(partnerId: string): Promise<Hotel[]> {
    const { data } = await apiClient.get<Hotel[]>(`/hotels/partner/${partnerId}`);
    return data;
  },

  async create(hotel: Omit<Hotel, 'id'>): Promise<Hotel> {
    const { data } = await apiClient.post<Hotel>('/hotels', hotel);
    return data;
  },

  async update(id: string, hotel: Partial<Hotel>): Promise<Hotel> {
    const { data } = await apiClient.put<Hotel>(`/hotels/${id}`, hotel);
    return data;
  },

  async updateRoomPrice(hotelId: string, roomId: string, price: number): Promise<Hotel> {
    const { data } = await apiClient.patch<Hotel>(`/hotels/${hotelId}/rooms/${roomId}/price`, { price });
    return data;
  },

  async toggleRoomAvailability(hotelId: string, roomId: string): Promise<Hotel> {
    const { data } = await apiClient.patch<Hotel>(`/hotels/${hotelId}/rooms/${roomId}/toggle`);
    return data;
  },

  async addRoom(hotelId: string, room: Omit<HotelRoom, 'id' | 'availableCount'>): Promise<Hotel> {
    const { data } = await apiClient.post<Hotel>(`/hotels/${hotelId}/rooms`, room);
    return data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/hotels/${id}`);
  },
};

export default hotelService;
