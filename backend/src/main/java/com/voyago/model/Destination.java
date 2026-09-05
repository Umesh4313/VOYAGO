package com.voyago.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "destinations")
public class Destination {

    @Id
    private String id;

    private String name;

    private String country;

    private String state;

    private String tagline;

    private String description;

    private String imageUrl;

    @Builder.Default
    private boolean isTrending = false;

    private int idealDays;

    private double averageBudget;

    // { "Budget": 8000, "Moderate": 15000, "Luxury": 30000 }
    private Map<String, Double> estimatedBudget;

    private double rating;

    private String bestTimeToVisit;

    private List<String> highlights;
}
