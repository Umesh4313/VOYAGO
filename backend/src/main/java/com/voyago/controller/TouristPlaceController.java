package com.voyago.controller;

import com.voyago.model.TouristPlace;
import com.voyago.repository.TouristPlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class TouristPlaceController {

    private final TouristPlaceRepository touristPlaceRepository;

    @GetMapping
    public ResponseEntity<List<TouristPlace>> getAll() {
        return ResponseEntity.ok(touristPlaceRepository.findAll());
    }

    @GetMapping("/destination/{destinationId}")
    public ResponseEntity<List<TouristPlace>> getByDestination(@PathVariable String destinationId) {
        return ResponseEntity.ok(touristPlaceRepository.findByDestinationId(destinationId));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<TouristPlace>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(touristPlaceRepository.findByCategory(category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TouristPlace> getById(@PathVariable String id) {
        return ResponseEntity.ok(touristPlaceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Place not found: " + id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TouristPlace> create(@RequestBody TouristPlace place) {
        return ResponseEntity.ok(touristPlaceRepository.save(place));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TouristPlace> update(@PathVariable String id, @RequestBody TouristPlace place) {
        place.setId(id);
        return ResponseEntity.ok(touristPlaceRepository.save(place));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        touristPlaceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
