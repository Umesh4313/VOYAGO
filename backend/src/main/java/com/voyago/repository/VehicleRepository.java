package com.voyago.repository;

import com.voyago.model.Vehicle;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends MongoRepository<Vehicle, String> {

    List<Vehicle> findByDestinationId(String destinationId);

    List<Vehicle> findByIsAvailableTrue();

    List<Vehicle> findByPartnerId(String partnerId);

    List<Vehicle> findByType(String type);
}
