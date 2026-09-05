package com.voyago.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "platformSettings")
public class PlatformSettings {

    @Id
    private String id;

    @Builder.Default
    private double commissionRate = 5.0;

    @Builder.Default
    private String payoutMode = "Immediate (24/7)";

    @Builder.Default
    private boolean maintenanceMode = false;

    @Builder.Default
    private int maxBookingsPerDay = 500;

    @Builder.Default
    private String defaultCurrency = "INR";

    @Builder.Default
    private boolean emailNotificationsEnabled = true;

    @Builder.Default
    private int apiRateLimitPerMinute = 100;

    @Builder.Default
    private String supportEmail = "support@voyago.in";

    // Feature flags
    @Builder.Default
    private boolean enableVehicleRentals = true;

    @Builder.Default
    private boolean enableHotelBookings = true;

    @Builder.Default
    private boolean enableAiTripPlanner = true;
}
