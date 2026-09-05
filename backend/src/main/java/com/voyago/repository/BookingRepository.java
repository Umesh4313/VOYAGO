package com.voyago.repository;

import com.voyago.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByUserId(String userId);

    List<Booking> findByStatus(String status);

    List<Booking> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    long countByStatus(String status);

    List<Booking> findByUserIdOrderByCreatedAtDesc(String userId);
}
