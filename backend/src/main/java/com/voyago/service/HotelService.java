package com.voyago.service;

import com.voyago.model.Hotel;
import com.voyago.model.HotelRoom;
import com.voyago.repository.HotelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HotelService {

    private final HotelRepository hotelRepository;

    public List<Hotel> getAll() {
        return hotelRepository.findAll();
    }

    public Hotel getById(String id) {
        return hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel not found: " + id));
    }

    public List<Hotel> getByDestination(String destinationId) {
        return hotelRepository.findByDestinationId(destinationId);
    }

    public List<Hotel> getByPartner(String partnerId) {
        return hotelRepository.findByPartnerId(partnerId);
    }

    public Hotel create(Hotel hotel) {
        return hotelRepository.save(hotel);
    }

    public Hotel update(String id, Hotel updated) {
        Hotel existing = getById(id);
        updated.setId(existing.getId());
        return hotelRepository.save(updated);
    }

    public Hotel updateRoomPrice(String hotelId, String roomId, double newPrice) {
        Hotel hotel = getById(hotelId);
        hotel.getRooms().stream()
                .filter(r -> r.getId().equals(roomId))
                .findFirst()
                .ifPresent(r -> r.setPricePerNight(newPrice));
        return hotelRepository.save(hotel);
    }

    public Hotel toggleRoomAvailability(String hotelId, String roomId) {
        Hotel hotel = getById(hotelId);
        hotel.getRooms().stream()
                .filter(r -> r.getId().equals(roomId))
                .findFirst()
                .ifPresent(r -> r.setActive(!r.isActive()));
        return hotelRepository.save(hotel);
    }

    public void delete(String id) {
        hotelRepository.deleteById(id);
    }
}
