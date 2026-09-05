package com.voyago.service;

import com.voyago.model.Destination;
import com.voyago.repository.DestinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DestinationService {

    private final DestinationRepository destinationRepository;

    public List<Destination> getAll() {
        return destinationRepository.findAll();
    }

    public Destination getById(String id) {
        return destinationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Destination not found: " + id));
    }

    public List<Destination> getTrending() {
        return destinationRepository.findByIsTrendingTrue();
    }

    public List<Destination> search(String name) {
        return destinationRepository.findByNameContainingIgnoreCase(name);
    }

    public Destination create(Destination destination) {
        return destinationRepository.save(destination);
    }

    public Destination update(String id, Destination updated) {
        Destination existing = getById(id);
        updated.setId(existing.getId());
        return destinationRepository.save(updated);
    }

    public void delete(String id) {
        destinationRepository.deleteById(id);
    }
}
