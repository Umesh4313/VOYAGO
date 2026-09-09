import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  ArrowUp,
  ArrowDown,
  Hotel,
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RevenueAnalytics {
  period: string;
  currentRevenue: number;
  previousRevenue: number;
  revenueChange: number;
  currentBookings: number;
  previousBookings: number;
  bookingChange: number;
  averageOrderValue: number;
  revenueData: Array<{ label: string; value: number; count?: number }>;
  bookingData: Array<{ label: string; value: number; count: number }>;
}

interface HotelPartnerAnalyticsProps {
  partnerId: string;
  partnerType?: 'hotel' | 'vehicle';
}

export const HotelPartnerAnalytics: React.FC<HotelPartnerAnalyticsProps> = ({ partnerId, partnerType = 'hotel' }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [analytics, setAnalytics] = useState<RevenueAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedMonth, selectedYear, partnerId, partnerType]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<RevenueAnalytics>(
        `/partner/${partnerType}/analytics?range=1&month=${selectedMonth}&year=${selectedYear}`
      );
      setAnalytics(data);
    } catch (err: any) {
      console.error('Failed to fetch hotel partner analytics:', err);
      const responseMessage = typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.message;
      if (!err.response || err.response.status >= 500) {
        setAnalytics({ period: 'Selected month', currentRevenue: 0, previousRevenue: 0, revenueChange: 0, currentBookings: 0, previousBookings: 0, bookingChange: 0, averageOrderValue: 0, revenueData: [], bookingData: [] });
        setError(null);
      } else {
        setError(responseMessage || `Failed to load analytics data (${err.response?.status || 'network error'})`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#9D3373] border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center">
        <p className="text-rose-600 text-sm font-medium">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) return null;

  if (analytics.currentBookings === 0 && analytics.revenueData.length === 0) {
    return <div className="bg-stone-50 border border-stone-200 rounded-2xl p-10 text-center"><Calendar className="w-10 h-10 mx-auto text-stone-400" /><p className="mt-3 text-sm font-semibold text-stone-700">No data available</p><p className="mt-1 text-xs text-stone-500">Revenue and booking charts will appear after your first booking.</p></div>;
  }

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;
  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  // Calculate commission (5% platform fee)
  const platformCommission = analytics.currentRevenue * 0.05;
  const netRevenue = analytics.currentRevenue - platformCommission;

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h3 className="font-serif-display text-3xl font-light italic text-stone-900 mb-2">
              {partnerType === 'hotel' ? 'Revenue Analytics Dashboard' : 'Fleet Revenue Analytics Dashboard'}
            </h3>
            <p className="text-xs text-stone-500 font-normal">
              Track your {partnerType === 'hotel' ? 'property' : 'fleet'} revenue performance with detailed analytics
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl p-1">
            <select value={selectedMonth} onChange={(event) => setSelectedMonth(Number(event.target.value))} className="px-3 py-2 rounded-lg border border-stone-200 bg-white text-xs font-semibold text-stone-700">
              {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => <option key={month} value={month}>{new Date(2000, month - 1).toLocaleString('default', { month: 'short' })}</option>)}
            </select>
            <select value={selectedYear} onChange={(event) => setSelectedYear(Number(event.target.value))} className="px-3 py-2 rounded-lg border border-stone-200 bg-white text-xs font-semibold text-stone-700">
              {Array.from({ length: 21 }, (_, index) => new Date().getFullYear() - 10 + index).map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics with Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
              Gross Revenue
            </span>
            <DollarSign className="w-5 h-5 text-[#9D3373]" />
          </div>
          <p className="font-serif-display text-3xl font-light italic text-[#9D3373] mb-2">
            {formatCurrency(analytics.currentRevenue)}
          </p>
          <div className="flex items-center gap-2">
            {analytics.revenueChange >= 0 ? (
              <ArrowUp className="w-4 h-4 text-emerald-600" />
            ) : (
              <ArrowDown className="w-4 h-4 text-rose-600" />
            )}
            <span
              className={`text-xs font-bold ${
                analytics.revenueChange >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {formatPercentage(analytics.revenueChange)}
            </span>
            <span className="text-xs text-stone-500">vs previous</span>
          </div>
        </div>

        {/* Platform Commission */}
        <div className="bg-rose-50 rounded-2xl p-6 border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-widest">
              Platform Fee (5%)
            </span>
            <DollarSign className="w-5 h-5 text-rose-700" />
          </div>
          <p className="font-serif-display text-3xl font-light italic text-rose-700 mb-2">
            {formatCurrency(platformCommission)}
          </p>
          <p className="text-[10px] text-rose-600">Voyago commission</p>
        </div>

        {/* Net Revenue */}
        <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
              Net Revenue
            </span>
            <Hotel className="w-5 h-5 text-emerald-700" />
          </div>
          <p className="font-serif-display text-3xl font-light italic text-emerald-700 mb-2">
            {formatCurrency(netRevenue)}
          </p>
          <p className="text-[10px] text-emerald-600">Your earnings</p>
        </div>

        {/* Bookings Count */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
              Bookings
            </span>
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <p className="font-serif-display text-3xl font-light italic text-stone-900 mb-2">
            {analytics.currentBookings}
          </p>
          <div className="flex items-center gap-2">
            {analytics.bookingChange >= 0 ? (
              <ArrowUp className="w-4 h-4 text-emerald-600" />
            ) : (
              <ArrowDown className="w-4 h-4 text-rose-600" />
            )}
            <span
              className={`text-xs font-bold ${
                analytics.bookingChange >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {formatPercentage(analytics.bookingChange)}
            </span>
          </div>
        </div>
      </div>

      {/* Average Order Value */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1">
              Average Booking Value
            </span>
            <p className="font-serif-display text-2xl font-light italic text-stone-900">
              {formatCurrency(analytics.averageOrderValue)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-stone-500">Per booking revenue</p>
            <p className="text-xs text-stone-400 mt-1">
              Previous: {formatCurrency(analytics.previousBookings > 0 ? analytics.previousRevenue / analytics.previousBookings : 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-xs">
        <h4 className="text-sm font-bold text-stone-700 uppercase tracking-widest mb-6">
          Revenue Trend - {analytics.period}
        </h4>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={analytics.revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
            <XAxis
              dataKey="label"
              stroke="#78716c"
              style={{ fontSize: '11px' }}
            />
            <YAxis
              stroke="#78716c"
              style={{ fontSize: '11px' }}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e7e5e4',
                borderRadius: '12px',
                fontSize: '12px',
              }}
              formatter={(value: number) => [formatCurrency(value), 'Revenue']}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#9D3373"
              strokeWidth={3}
              dot={{ fill: '#9D3373', r: 5 }}
              activeDot={{ r: 7 }}
              name="Revenue"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bookings Trend Chart */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-xs">
        <h4 className="text-sm font-bold text-stone-700 uppercase tracking-widest mb-6">
          Bookings Trend - {analytics.period}
        </h4>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={analytics.bookingData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
            <XAxis
              dataKey="label"
              stroke="#78716c"
              style={{ fontSize: '11px' }}
            />
            <YAxis
              stroke="#78716c"
              style={{ fontSize: '11px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e7e5e4',
                borderRadius: '12px',
                fontSize: '12px',
              }}
              formatter={(value: number) => [value, 'Bookings']}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar
              dataKey="count"
              fill="#10b981"
              radius={[8, 8, 0, 0]}
              name="Bookings"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Settlement Breakdown */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-xs">
        <h4 className="text-sm font-bold text-stone-700 uppercase tracking-widest mb-6">
          Settlement Breakdown
        </h4>
        <div className="space-y-4">
          {/* Gross Revenue Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-stone-700">Gross Revenue</span>
              <span className="text-sm font-bold text-[#9D3373]">{formatCurrency(analytics.currentRevenue)}</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#9D3373] to-[#b5478d] rounded-full"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Platform Fee Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-stone-700">Platform Fee (5%)</span>
              <span className="text-sm font-bold text-rose-700">{formatCurrency(platformCommission)}</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-rose-600 rounded-full"
                style={{ width: '5%' }}
              />
            </div>
          </div>

          {/* Net Revenue Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-stone-700">Your Net Earnings</span>
              <span className="text-sm font-bold text-emerald-700">{formatCurrency(netRevenue)}</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                style={{ width: '95%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
