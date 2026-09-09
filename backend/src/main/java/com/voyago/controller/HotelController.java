package com.voyago.controller;

import com.voyago.model.Hotel;
import com.voyago.model.HotelRoom;
import com.voyago.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
public class HotelController {

    private final HotelService hotelService;

    @GetMapping
    public ResponseEntity<List<Hotel>> getAll() {
        return ResponseEntity.ok(hotelService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Hotel> getById(@PathVariable String id) {
        return ResponseEntity.ok(hotelService.getById(id));
    }

    @GetMapping("/destination/{destinationId}")
    public ResponseEntity<List<Hotel>> getByDestination(@PathVariable String destinationId) {
        return ResponseEntity.ok(hotelService.getByDestination(destinationId));
    }

    @GetMapping("/partner/{partnerId}")
    public ResponseEntity<List<Hotel>> getByPartner(@PathVariable String partnerId) {
        return ResponseEntity.ok(hotelService.getByPartner(partnerId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('HOTEL_PARTNER', 'ADMIN') and @partnerApproval.isApproved(authentication)")
    public ResponseEntity<Hotel> create(@RequestBody Hotel hotel) {
        return ResponseEntity.ok(hotelService.create(hotel));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('HOTEL_PARTNER', 'ADMIN') and @partnerApproval.isApproved(authentication)")
    public ResponseEntity<Hotel> update(@PathVariable String id, @RequestBody Hotel hotel) {
        return ResponseEntity.ok(hotelService.update(id, hotel));
    }

    @PatchMapping("/{hotelId}/rooms/{roomId}/price")
    @PreAuthorize("hasAnyRole('HOTEL_PARTNER', 'ADMIN') and @partnerApproval.isApproved(authentication)")
    public ResponseEntity<Hotel> updateRoomPrice(
            @PathVariable String hotelId,
            @PathVariable String roomId,
            @RequestBody Map<String, Double> body) {
        double newPrice = body.getOrDefault("price", 0.0);
        return ResponseEntity.ok(hotelService.updateRoomPrice(hotelId, roomId, newPrice));
    }

    @PatchMapping("/{hotelId}/rooms/{roomId}/toggle")
    @PreAuthorize("hasAnyRole('HOTEL_PARTNER', 'ADMIN') and @partnerApproval.isApproved(authentication)")
    public ResponseEntity<Hotel> toggleRoomAvailability(
            @PathVariable String hotelId,
            @PathVariable String roomId) {
        return ResponseEntity.ok(hotelService.toggleRoomAvailability(hotelId, roomId));
    }

    @PostMapping("/{hotelId}/rooms")
    @PreAuthorize("hasAnyRole('HOTEL_PARTNER', 'ADMIN') and @partnerApproval.isApproved(authentication)")
    public ResponseEntity<Hotel> addRoom(@PathVariable String hotelId, @RequestBody HotelRoom room) {
        Hotel hotel = hotelService.getById(hotelId);
        room.setId("rm-" + System.currentTimeMillis());
        if (room.getTotalUnits() <= 0) room.setTotalUnits(6);
        room.setAvailableCount(room.getTotalUnits());
        room.setActive(true);
        hotel.getRooms().add(room);
        return ResponseEntity.ok(hotelService.update(hotelId, hotel));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('HOTEL_PARTNER', 'ADMIN') and @partnerApproval.isApproved(authentication)")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        hotelService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
