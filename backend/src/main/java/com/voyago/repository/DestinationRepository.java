package com.voyago.repository;

import com.voyago.model.Destination;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DestinationRepository extends MongoRepository<Destination, String> {

    List<Destination> findByIsTrendingTrue();

    List<Destination> findByCountry(String country);

    List<Destination> findByNameContainingIgnoreCase(String name);
}
