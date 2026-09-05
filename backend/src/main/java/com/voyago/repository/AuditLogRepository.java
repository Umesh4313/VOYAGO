package com.voyago.repository;

import com.voyago.model.AuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends MongoRepository<AuditLog, String> {

    List<AuditLog> findByActorContainingIgnoreCase(String actor);

    List<AuditLog> findByAction(String action);

    List<AuditLog> findTop50ByOrderByTimestampDesc();
}
