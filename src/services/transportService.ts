import apiClient from './api';
import { TravelOption } from '../types';

export const transportService = {
  async getAll(): Promise<TravelOption[]> {
    const { data } = await apiClient.get<TravelOption[]>('/transport');
    return data;
  },

  async search(from: string, to: string, mode?: string): Promise<TravelOption[]> {
    const { data } = await apiClient.get<TravelOption[]>('/transport/search', {
      params: { from, to, ...(mode ? { mode } : {}) },
    });
    return data;
  },

  async getByMode(mode: string): Promise<TravelOption[]> {
    const { data } = await apiClient.get<TravelOption[]>(`/transport/mode/${mode}`);
    return data;
  },

  async getById(id: string): Promise<TravelOption> {
    const { data } = await apiClient.get<TravelOption>(`/transport/${id}`);
    return data;
  },

  async create(option: Omit<TravelOption, 'id'>): Promise<TravelOption> {
    const { data } = await apiClient.post<TravelOption>('/transport', option);
    return data;
  },

  async update(id: string, option: Partial<TravelOption>): Promise<TravelOption> {
    const { data } = await apiClient.put<TravelOption>(`/transport/${id}`, option);
    return data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/transport/${id}`);
  },
};

export default transportService;
