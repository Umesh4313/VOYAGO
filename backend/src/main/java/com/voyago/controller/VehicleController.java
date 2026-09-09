package com.voyago.controller;

import com.voyago.model.Vehicle;
import com.voyago.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping
    public ResponseEntity<List<Vehicle>> getAll() {
        return ResponseEntity.ok(vehicleService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getById(@PathVariable String id) {
        return ResponseEntity.ok(vehicleService.getById(id));
    }

    @GetMapping("/destination/{destinationId}")
    public ResponseEntity<List<Vehicle>> getByDestination(@PathVariable String destinationId) {
        return ResponseEntity.ok(vehicleService.getByDestination(destinationId));
    }

    @GetMapping("/available")
    public ResponseEntity<List<Vehicle>> getAvailable() {
        return ResponseEntity.ok(vehicleService.getAvailable());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('VEHICLE_PARTNER', 'ADMIN') and @partnerApproval.isApproved(authentication)")
    public ResponseEntity<Vehicle> create(@RequestBody Vehicle vehicle) {
        return ResponseEntity.ok(vehicleService.create(vehicle));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('VEHICLE_PARTNER', 'ADMIN') and @partnerApproval.isApproved(authentication)")
    public ResponseEntity<Vehicle> update(@PathVariable String id, @RequestBody Vehicle vehicle) {
        return ResponseEntity.ok(vehicleService.update(id, vehicle));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAnyRole('VEHICLE_PARTNER', 'ADMIN') and @partnerApproval.isApproved(authentication)")
    public ResponseEntity<Vehicle> toggleAvailability(@PathVariable String id) {
        return ResponseEntity.ok(vehicleService.toggleAvailability(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('VEHICLE_PARTNER', 'ADMIN') and @partnerApproval.isApproved(authentication)")
    public ResponseEntity<Vehicle> updateStatus(@PathVariable String id, @RequestBody java.util.Map<String, String> body) {
        String status = body.get("rentalStatus");
        Vehicle vehicle = vehicleService.getById(id);
        vehicle.setRentalStatus(status);
        vehicle.setAvailable("AVAILABLE".equals(status));
        return ResponseEntity.ok(vehicleService.update(id, vehicle));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('VEHICLE_PARTNER', 'ADMIN') and @partnerApproval.isApproved(authentication)")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        vehicleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
