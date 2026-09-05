import apiClient from './api';
import { TouristPlace } from '../types';

export const touristPlaceService = {
  async getAll(): Promise<TouristPlace[]> {
    const { data } = await apiClient.get<TouristPlace[]>('/places');
    return data;
  },

  async getByDestination(destinationId: string): Promise<TouristPlace[]> {
    const { data } = await apiClient.get<TouristPlace[]>(`/places/destination/${destinationId}`);
    return data;
  },

  async getById(id: string): Promise<TouristPlace> {
    const { data } = await apiClient.get<TouristPlace>(`/places/${id}`);
    return data;
  },

  async create(place: Omit<TouristPlace, 'id'>): Promise<TouristPlace> {
    const { data } = await apiClient.post<TouristPlace>('/places', place);
    return data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/places/${id}`);
  },
};

export default touristPlaceService;
