package com.voyago.controller;

import com.voyago.model.TravelOption;
import com.voyago.service.TransportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transport")
@RequiredArgsConstructor
public class TransportController {

    private final TransportService transportService;

    @GetMapping
    public ResponseEntity<List<TravelOption>> getAll() {
        return ResponseEntity.ok(transportService.getAll());
    }

    @GetMapping("/search")
    public ResponseEntity<List<TravelOption>> search(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String mode) {
        if (from != null && to != null) {
            return ResponseEntity.ok(transportService.search(from, to, mode));
        }
        if (mode != null) {
            return ResponseEntity.ok(transportService.getByMode(mode));
        }
        return ResponseEntity.ok(transportService.getAll());
    }

    @GetMapping("/mode/{mode}")
    public ResponseEntity<List<TravelOption>> getByMode(@PathVariable String mode) {
        return ResponseEntity.ok(transportService.getByMode(mode));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TravelOption> getById(@PathVariable String id) {
        return ResponseEntity.ok(transportService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TravelOption> create(@RequestBody TravelOption option) {
        return ResponseEntity.ok(transportService.create(option));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TravelOption> update(@PathVariable String id, @RequestBody TravelOption option) {
        return ResponseEntity.ok(transportService.update(id, option));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        transportService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
