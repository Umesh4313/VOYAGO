package com.voyago.repository;

import com.voyago.model.TouristPlace;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TouristPlaceRepository extends MongoRepository<TouristPlace, String> {

    List<TouristPlace> findByDestinationId(String destinationId);

    List<TouristPlace> findByCategory(String category);

    List<TouristPlace> findByNameContainingIgnoreCase(String name);
}
