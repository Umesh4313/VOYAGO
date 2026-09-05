package com.voyago.repository;

import com.voyago.model.PlatformSettings;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlatformSettingsRepository extends MongoRepository<PlatformSettings, String> {
    // Only one document expected — use findAll().get(0) or save
}
