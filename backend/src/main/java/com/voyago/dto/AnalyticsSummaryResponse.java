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
public class AnalyticsSummaryResponse {

    private double totalGmv;

    private long totalBookings;

    private long confirmedBookings;

    private long cancelledBookings;

    private long completedBookings;

    private double averageOrderValue;

    private double platformCommission; // GMV * 5%

    private double monthlyIncome;

    private long monthlyOrders;

    private List<MonthlyDataPoint> monthlyRevenue;

    private List<MonthlyDataPoint> monthlyOrderCount;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyDataPoint {
        private String label; // "Jan", "Feb", etc.
        private double value;
    }
}
