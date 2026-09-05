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
@Document(collection = "vehicles")
public class Vehicle {

    @Id
    private String id;

    private String name;

    private String type; // CAR | BIKE | SCOOTER

    private String category; // e.g. Compact SUV, Cruiser Bike

    private String destinationId;

    private double dailyRate;

    private String transmission; // Automatic | Manual

    private int seats;

    private String fuelType; // Petrol | Diesel | Electric

    private double rating;

    private String imageUrl;

    private List<String> features;

    @Builder.Default
    private boolean isAvailable = true;

    private String rentalStatus; // AVAILABLE | RENTED | RESERVED | MAINTENANCE

    private String partnerId;

    private String registrationNumber;

    private int modelYear;
}
