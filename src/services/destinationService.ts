import apiClient from './api';
import { Destination } from '../types';

export const destinationService = {
  async getAll(): Promise<Destination[]> {
    const { data } = await apiClient.get<Destination[]>('/destinations');
    return data;
  },

  async getTrending(): Promise<Destination[]> {
    const { data } = await apiClient.get<Destination[]>('/destinations/trending');
    return data;
  },

  async search(name: string): Promise<Destination[]> {
    const { data } = await apiClient.get<Destination[]>('/destinations/search', { params: { name } });
    return data;
  },

  async getById(id: string): Promise<Destination> {
    const { data } = await apiClient.get<Destination>(`/destinations/${id}`);
    return data;
  },

  async create(destination: Omit<Destination, 'id'>): Promise<Destination> {
    const { data } = await apiClient.post<Destination>('/destinations', destination);
    return data;
  },

  async update(id: string, destination: Partial<Destination>): Promise<Destination> {
    const { data } = await apiClient.put<Destination>(`/destinations/${id}`, destination);
    return data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/destinations/${id}`);
  },
};

export default destinationService;
