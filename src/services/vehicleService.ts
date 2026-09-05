import apiClient from './api';
import { Vehicle, VehicleRentalStatus } from '../types';

export const vehicleService = {
  async getAll(): Promise<Vehicle[]> {
    const { data } = await apiClient.get<Vehicle[]>('/vehicles');
    return data;
  },

  async getById(id: string): Promise<Vehicle> {
    const { data } = await apiClient.get<Vehicle>(`/vehicles/${id}`);
    return data;
  },

  async getByDestination(destinationId: string): Promise<Vehicle[]> {
    const { data } = await apiClient.get<Vehicle[]>(`/vehicles/destination/${destinationId}`);
    return data;
  },

  async getAvailable(): Promise<Vehicle[]> {
    const { data } = await apiClient.get<Vehicle[]>('/vehicles/available');
    return data;
  },

  async create(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    const { data } = await apiClient.post<Vehicle>('/vehicles', vehicle);
    return data;
  },

  async update(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
    const { data } = await apiClient.put<Vehicle>(`/vehicles/${id}`, vehicle);
    return data;
  },

  async toggleAvailability(id: string): Promise<Vehicle> {
    const { data } = await apiClient.patch<Vehicle>(`/vehicles/${id}/toggle`);
    return data;
  },

  async updateStatus(id: string, rentalStatus: VehicleRentalStatus): Promise<Vehicle> {
    const { data } = await apiClient.patch<Vehicle>(`/vehicles/${id}/status`, { rentalStatus });
    return data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/vehicles/${id}`);
  },
};

export default vehicleService;
