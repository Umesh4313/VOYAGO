package com.voyago.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelRoom {

    private String id;

    private String name;

    private String type;

    private double pricePerNight;

    private int maxGuests;

    private int capacity;

    private String bedType;

    private List<String> amenities;

    private int totalUnits;

    private int bookedUnits;

    private int availableCount;

    private String imageUrl;

    private String description;

    @Builder.Default
    private boolean isActive = true;
}
