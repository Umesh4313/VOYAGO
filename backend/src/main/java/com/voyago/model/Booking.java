package com.voyago.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "bookings")
public class Booking {

    @Id
    private String id; // e.g. VOY-2026-89412

    private String userId;

    private String customerName;

    private String customerEmail;

    private String customerPhone;

    private String destination;

    private String departureDate;

    private String returnDate;

    private int travelersCount;

    private int durationDays;

    // Embedded transport reference
    private TravelOption transport;

    private List<String> selectedSeats;

    // Embedded hotel booking snapshot
    private BookingHotel hotel;

    // Embedded vehicle booking snapshot
    private BookingVehicle vehicle;

    private List<TouristPlace> places;

    private PaymentDetails payment;

    private double totalCost;

    private double taxesAndFees;

    @Builder.Default
    private String status = "CONFIRMED"; // CONFIRMED | COMPLETED | CANCELLED

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    // ── Embedded snapshot classes ──────────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BookingHotel {
        private String id;
        private String name;
        private String roomId;
        private String roomType;
        private String roomName;
        @Builder.Default
        private int roomUnits = 1;
        private double pricePerNight;
        private String condition;
        private int nights;
        private double total;
        private String address;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BookingVehicle {
        private String id;
        private String name;
        private String type;
        private double dailyRate;
        private int days;
        private double total;
        @Builder.Default
        private int units = 1;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaymentDetails {
        private String method; // UPI | CARD | NETBANKING
        private double amount;
        private String status; // SUCCESS | FAILED | PENDING
        private String transactionRef;
        private String timestamp;
        private String idempotencyKey;
    }
}
