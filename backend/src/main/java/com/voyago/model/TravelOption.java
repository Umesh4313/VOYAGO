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
@Document(collection = "travelOptions")
public class TravelOption {

    @Id
    private String id;

    private String mode; // FLIGHT | TRAIN | BUS

    private String operator;

    private String code;

    private String fromCity;

    private String toCity;

    private String departureTime;

    private String arrivalTime;

    private String duration;

    private double pricePerPerson;

    private int availableSeats;

    private String stops;

    private double rating;

    private List<String> tags;

    private List<String> occupiedSeats;
}
