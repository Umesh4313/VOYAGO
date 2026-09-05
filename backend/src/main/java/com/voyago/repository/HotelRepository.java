package com.voyago.repository;

import com.voyago.model.Hotel;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRepository extends MongoRepository<Hotel, String> {

    List<Hotel> findByDestinationId(String destinationId);

    List<Hotel> findByPartnerId(String partnerId);

    List<Hotel> findByStatus(String status);

    List<Hotel> findByNameContainingIgnoreCase(String name);
}
