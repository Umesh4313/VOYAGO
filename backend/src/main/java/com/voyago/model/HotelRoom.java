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

    private Double nonAcPricePerNight;

    private int maxGuests;

    private int capacity;

    private String bedType;

    private List<String> amenities;

    private int totalUnits;

    private int bookedUnits;

    private int availableCount;

    private String imageUrl;

    private List<String> gallery;

    private String bathroomImageUrl;

    private String viewImageUrl;

    private String description;

    private boolean isAC = true; // AC or Non-AC room

    @Builder.Default
    private boolean isActive = true;
}
