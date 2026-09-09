package com.voyago.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "hotels")
public class Hotel {

    @Id
    private String id;

    private String name;

    private String destinationId;

    private String destinationName;

    private double rating;

    private int reviewCount;

    private String address;

    private String city;

    private String description;

    private String heroImage;

    private List<String> gallery;

    private List<String> amenities;

    private String partnerId;

    private double priceStartsFrom;

    private List<HotelRoom> rooms;

    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE | INACTIVE

    @Builder.Default
    private String approvalStatus = "PENDING"; // PENDING | APPROVED | REJECTED | SUSPENDED

    private String rejectionReason;

    @Builder.Default
    private boolean bookingAlertsEnabled = true;

    @Builder.Default
    private boolean autoCheckInEnabled = false;
}
