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
@Document(collection = "touristPlaces")
public class TouristPlace {

    @Id
    private String id;

    private String destinationId;

    private String name;

    // Beach | Heritage | Adventure | Nature | Culture | Nightlife | Religious | Museum | Shopping
    private String category;

    private double rating;

    private String visitDuration;

    private String timeRequired;

    private double entryFee;

    private String description;

    private String imageUrl;

    private String recommendedTime;

    private List<String> highlights;
}
