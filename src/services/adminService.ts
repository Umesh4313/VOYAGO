import apiClient from './api';
import { User, AuditLog } from '../types';

export interface AnalyticsSummary {
  totalGmv: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  averageOrderValue: number;
  platformCommission: number;
  monthlyIncome: number;
  monthlyOrders: number;
  monthlyRevenue: Array<{ label: string; value: number }>;
  monthlyOrderCount: Array<{ label: string; value: number }>;
}

export interface PlatformSettings {
  id?: string;
  commissionRate: number;
  payoutMode: string;
  maintenanceMode: boolean;
  maxBookingsPerDay: number;
  defaultCurrency: string;
  emailNotificationsEnabled: boolean;
  apiRateLimitPerMinute: number;
  supportEmail: string;
  enableVehicleRentals: boolean;
  enableHotelBookings: boolean;
  enableAiTripPlanner: boolean;
}

export const adminService = {
  async getAnalytics(): Promise<AnalyticsSummary> {
    const { data } = await apiClient.get<AnalyticsSummary>('/admin/analytics');
    return data;
  },

  async getUsers(): Promise<User[]> {
    const { data } = await apiClient.get<User[]>('/admin/users');
    return data;
  },

  async toggleUserStatus(userId: string): Promise<User> {
    const { data } = await apiClient.patch<User>(`/admin/users/${userId}/status`);
    return data;
  },

  async updatePartnerStatus(userId: string, status: string): Promise<User> {
    const { data } = await apiClient.patch<User>(`/admin/users/${userId}/partner-status`, { status });
    return data;
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const { data } = await apiClient.get<AuditLog[]>('/admin/audit-logs');
    return data;
  },

  async getSettings(): Promise<PlatformSettings> {
    const { data } = await apiClient.get<PlatformSettings>('/admin/settings');
    return data;
  },

  async updateSettings(settings: PlatformSettings): Promise<PlatformSettings> {
    const { data } = await apiClient.put<PlatformSettings>('/admin/settings', settings);
    return data;
  },
};

export default adminService;
