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

type TimeRange = 1 | 2 | 6 | 12 | 60;

const TIME_RANGES: Array<{ value: TimeRange; label: string }> = [
  { value: 1, label: 'Last Month' },
  { value: 2, label: 'Last 2 Months' },
  { value: 6, label: 'Last 6 Months' },
  { value: 12, label: 'Last Year' },
  { value: 60, label: 'Last 5 Years' },
];

interface HotelPartnerAnalyticsProps {
  partnerId: string;
}

export const HotelPartnerAnalytics: React.FC<HotelPartnerAnalyticsProps> = ({ partnerId }) => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>(6);
  const [analytics, setAnalytics] = useState<RevenueAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedRange, partnerId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<RevenueAnalytics>(
        `/admin/hotel-partners/${partnerId}/analytics?range=${selectedRange}`
      );
      setAnalytics(data);
    } catch (err: any) {
      console.error('Failed to fetch hotel partner analytics:', err);
      setError(err.response?.data?.message || 'Failed to load analytics data');
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
              Revenue Analytics Dashboard
            </h3>
            <p className="text-xs text-stone-500 font-normal">
              Track your property's revenue performance with detailed analytics
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl p-1">
            {TIME_RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => setSelectedRange(range.value)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedRange === range.value
                    ? 'bg-[#9D3373] text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white'
                }`}
              >
                {range.label}
              </button>
            ))}
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
