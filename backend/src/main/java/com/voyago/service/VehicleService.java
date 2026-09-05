package com.voyago.service;

import com.voyago.model.Vehicle;
import com.voyago.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public List<Vehicle> getAll() {
        return vehicleRepository.findAll();
    }

    public Vehicle getById(String id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + id));
    }

    public List<Vehicle> getByDestination(String destinationId) {
        return vehicleRepository.findByDestinationId(destinationId);
    }

    public List<Vehicle> getAvailable() {
        return vehicleRepository.findByIsAvailableTrue();
    }

    public Vehicle create(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    public Vehicle update(String id, Vehicle updated) {
        Vehicle existing = getById(id);
        updated.setId(existing.getId());
        return vehicleRepository.save(updated);
    }

    public Vehicle toggleAvailability(String id) {
        Vehicle vehicle = getById(id);
        vehicle.setAvailable(!vehicle.isAvailable());
        vehicle.setRentalStatus(vehicle.isAvailable() ? "AVAILABLE" : "RENTED");
        return vehicleRepository.save(vehicle);
    }

    public void delete(String id) {
        vehicleRepository.deleteById(id);
    }
}
