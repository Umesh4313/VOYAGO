package com.voyago.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;

@Data
public class BookingRequest {

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotBlank(message = "Customer email is required")
    private String customerEmail;

    private String customerPhone;

    @NotBlank(message = "Destination is required")
    private String destination;

    @NotBlank(message = "Departure date is required")
    private String departureDate;

    @NotBlank(message = "Return date is required")
    private String returnDate;

    @Positive(message = "Travelers count must be positive")
    private int travelersCount;

    private int durationDays;

    // IDs referencing existing documents
    private String transportId;

    private List<String> selectedSeats;

    private String hotelId;

    private String hotelName;

    private String roomId;

    private String roomName;

    private String roomCondition;

    private String vehicleId;

    private List<String> placeIds;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // UPI | CARD | NETBANKING
}
