package com.voyago.repository;

import com.voyago.model.TravelOption;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TravelOptionRepository extends MongoRepository<TravelOption, String> {

    List<TravelOption> findByMode(String mode);

    List<TravelOption> findByFromCityAndToCity(String fromCity, String toCity);

    List<TravelOption> findByFromCityAndToCityAndMode(String fromCity, String toCity, String mode);
}
