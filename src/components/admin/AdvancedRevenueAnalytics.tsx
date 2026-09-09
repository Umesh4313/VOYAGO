import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';

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
  categoryBreakdown: Array<{
    category: string;
    revenue: number;
    count: number;
    percentage: number;
  }>;
}

const COLORS = ['#9D3373', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];

export const AdvancedRevenueAnalytics: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [analytics, setAnalytics] = useState<RevenueAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedMonth, selectedYear]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<RevenueAnalytics>(
        `/admin/revenue-analytics?range=1&month=${selectedMonth}&year=${selectedYear}&_=${Date.now()}`
      );
      setAnalytics({ ...data, period: `${new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' })} ${selectedYear}` });
    } catch (err: any) {
      console.error('Failed to fetch revenue analytics:', err);
      if (!err.response || err.response.status >= 500) {
        setAnalytics({
          period: `${new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' })} ${selectedYear}`,
          currentRevenue: 0,
          previousRevenue: 0,
          revenueChange: 0,
          currentBookings: 0,
          previousBookings: 0,
          bookingChange: 0,
          averageOrderValue: 0,
          revenueData: [],
          bookingData: [],
          categoryBreakdown: [],
        });
        setError(null);
      } else {
        setError(err.response?.data?.message || 'Failed to load analytics data');
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
    return (
      <div className="space-y-6">
        <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div><h3 className="font-serif-display text-3xl font-light italic text-stone-900">Advanced Revenue Analytics</h3><p className="text-xs text-stone-500 mt-2">No bookings were recorded for the selected month.</p></div>
            <div className="flex items-center gap-2"><select value={selectedMonth} onChange={(event) => setSelectedMonth(Number(event.target.value))} className="px-3 py-2 rounded-lg border border-stone-200 bg-white text-xs font-semibold text-stone-700">{Array.from({ length: 12 }, (_, index) => index + 1).map((month) => <option key={month} value={month}>{new Date(2000, month - 1).toLocaleString('default', { month: 'short' })}</option>)}</select><select value={selectedYear} onChange={(event) => setSelectedYear(Number(event.target.value))} className="px-3 py-2 rounded-lg border border-stone-200 bg-white text-xs font-semibold text-stone-700">{Array.from({ length: 21 }, (_, index) => new Date().getFullYear() - 10 + index).map((year) => <option key={year} value={year}>{year}</option>)}</select></div>
          </div>
        </div>
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-10 text-center"><Calendar className="w-10 h-10 mx-auto text-stone-400" /><p className="mt-3 text-sm font-semibold text-stone-700">No data available</p><p className="mt-1 text-xs text-stone-500">Revenue and charts will appear here after a booking is created for this month.</p></div>
      </div>
    );
  }

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;
  const selectedPeriodLabel = `${new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' })} ${selectedYear}`;
  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h3 className="font-serif-display text-3xl font-light italic text-stone-900 mb-2">
              Advanced Revenue Analytics
            </h3>
            <p className="text-xs text-stone-500 font-normal">
              Comprehensive revenue tracking with period-over-period comparison
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
        {/* Current Revenue */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
              Current Revenue
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
            <span className="text-xs text-stone-500">vs previous period</span>
          </div>
          <div className="mt-2 pt-2 border-t border-stone-100">
            <p className="text-[10px] text-stone-400">
              Previous: {formatCurrency(analytics.previousRevenue)}
            </p>
          </div>
        </div>

        {/* Current Bookings */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
              Bookings Count
            </span>
            <Calendar className="w-5 h-5 text-emerald-600" />
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
            <span className="text-xs text-stone-500">vs previous period</span>
          </div>
          <div className="mt-2 pt-2 border-t border-stone-100">
            <p className="text-[10px] text-stone-400">
              Previous: {analytics.previousBookings} bookings
            </p>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
              Avg Order Value
            </span>
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <p className="font-serif-display text-3xl font-light italic text-stone-900 mb-2">
            {formatCurrency(analytics.averageOrderValue)}
          </p>
          <p className="text-[10px] text-stone-500 mt-1">Per booking revenue</p>
        </div>

        {/* Period Label */}
        <div className="bg-gradient-to-br from-[#9D3373]/10 to-[#9D3373]/5 rounded-2xl p-6 border border-[#9D3373]/20 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-[#9D3373] uppercase tracking-widest">
              Analysis Period
            </span>
            <Calendar className="w-5 h-5 text-[#9D3373]" />
          </div>
          <p className="font-serif-display text-2xl font-light italic text-[#9D3373] mb-2">
            {selectedPeriodLabel}
          </p>
          <p className="text-[10px] text-stone-500">
            Comparing {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })} with the previous month
          </p>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-xs">
        <h4 className="text-sm font-bold text-stone-700 uppercase tracking-widest mb-6">
          Revenue Trend - {selectedPeriodLabel}
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
          Bookings Trend - {selectedPeriodLabel}
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

      {/* Category Breakdown */}
      {analytics.categoryBreakdown && analytics.categoryBreakdown.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-xs">
            <h4 className="text-sm font-bold text-stone-700 uppercase tracking-widest mb-6">
              Revenue by Category
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={analytics.categoryBreakdown.map((entry) => ({ ...entry, name: entry.category }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${((entry.percent || 0) * 100).toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {analytics.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e7e5e4',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          {/* Category Details */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-xs">
            <h4 className="text-sm font-bold text-stone-700 uppercase tracking-widest mb-6">
              Category Breakdown
            </h4>
            <div className="space-y-4">
              {analytics.categoryBreakdown.map((category, index) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium text-stone-900">
                        {category.category}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-stone-900">
                      {formatCurrency(category.revenue)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>{category.count} bookings</span>
                    <span>{category.percentage.toFixed(1)}% of total</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${category.percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
