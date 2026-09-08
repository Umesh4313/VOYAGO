package com.voyago.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueAnalyticsResponse {

    private String period; // "Last Month", "Last 2 Months", etc.
    
    private double currentRevenue;
    
    private double previousRevenue;
    
    private double revenueChange; // Percentage change
    
    private long currentBookings;
    
    private long previousBookings;
    
    private double bookingChange; // Percentage change
    
    private double averageOrderValue;
    
    private List<DataPoint> revenueData; // Time series data
    
    private List<DataPoint> bookingData; // Time series data
    
    private List<CategoryBreakdown> categoryBreakdown; // Hotel, Vehicle, Transport
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DataPoint {
        private String label; // Date label (e.g., "Jan 2026", "Week 1", "Dec 25")
        private double value;
        private long count; // For bookings
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryBreakdown {
        private String category; // "Hotels", "Vehicles", "Transport"
        private double revenue;
        private long count;
        private double percentage;
    }
}
