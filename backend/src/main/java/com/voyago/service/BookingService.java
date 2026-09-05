package com.voyago.service;

import com.voyago.dto.BookingRequest;
import com.voyago.model.*;
import com.voyago.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final HotelRepository hotelRepository;
    private final VehicleRepository vehicleRepository;
    private final TravelOptionRepository travelOptionRepository;
    private final TouristPlaceRepository touristPlaceRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public List<Booking> getAll() {
        return bookingRepository.findAll();
    }

    public List<Booking> getByUserId(String userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Booking getById(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + id));
    }

    public Booking createBooking(BookingRequest req) {
        // Resolve transport snapshot
        TravelOption transport = null;
        if (req.getTransportId() != null && !req.getTransportId().isBlank()) {
            transport = travelOptionRepository.findById(req.getTransportId()).orElse(null);
        }

        // Resolve hotel snapshot
        Booking.BookingHotel hotelSnapshot = null;
        Hotel hotel = null;
        HotelRoom room = null;
        if (req.getHotelId() != null && req.getRoomId() != null) {
            hotel = hotelRepository.findById(req.getHotelId()).orElse(null);
            if (hotel != null) {
                room = hotel.getRooms().stream()
                        .filter(r -> r.getId().equals(req.getRoomId()))
                        .findFirst().orElse(null);
                if (room != null) {
                    if (room.getAvailableCount() <= 0 || !room.isActive()) {
                        throw new RuntimeException("Room '" + room.getName() + "' is fully booked or inactive.");
                    }
                    hotelSnapshot = Booking.BookingHotel.builder()
                            .id(hotel.getId())
                            .name(hotel.getName())
                            .roomType(room.getType())
                            .roomName(room.getName())
                            .pricePerNight(room.getPricePerNight())
                            .nights(req.getDurationDays())
                            .total(room.getPricePerNight() * req.getDurationDays())
                            .address(hotel.getAddress())
                            .build();
                }
            }
        }

        // Resolve vehicle snapshot
        Booking.BookingVehicle vehicleSnapshot = null;
        Vehicle vehicle = null;
        if (req.getVehicleId() != null && !req.getVehicleId().isBlank()) {
            vehicle = vehicleRepository.findById(req.getVehicleId()).orElse(null);
            if (vehicle != null) {
                if (!vehicle.isAvailable()) {
                    throw new RuntimeException("Vehicle '" + vehicle.getName() + "' is not available.");
                }
                vehicleSnapshot = Booking.BookingVehicle.builder()
                        .id(vehicle.getId())
                        .name(vehicle.getName())
                        .type(vehicle.getType())
                        .dailyRate(vehicle.getDailyRate())
                        .days(req.getDurationDays())
                        .total(vehicle.getDailyRate() * req.getDurationDays())
                        .build();
            }
        }

        // Resolve tourist places
        List<TouristPlace> places = List.of();
        if (req.getPlaceIds() != null && !req.getPlaceIds().isEmpty()) {
            places = req.getPlaceIds().stream()
                    .map(pid -> touristPlaceRepository.findById(pid).orElse(null))
                    .filter(p -> p != null)
                    .collect(Collectors.toList());
        }

        // Calculate totals
        double transportTotal = transport != null ? transport.getPricePerPerson() * req.getTravelersCount() : 0;
        double roomTotal = hotelSnapshot != null ? hotelSnapshot.getTotal() : 0;
        double vehicleTotal = vehicleSnapshot != null ? vehicleSnapshot.getTotal() : 0;
        double subtotal = transportTotal + roomTotal + vehicleTotal;
        double taxesAndFees = Math.round(subtotal * 0.05);
        double totalCost = subtotal + taxesAndFees;

        // Unique booking ID
        int randomNum = 10000 + new Random().nextInt(90000);
        String bookingId = "VOY-2026-" + randomNum;

        // Payment snapshot
        Booking.PaymentDetails payment = Booking.PaymentDetails.builder()
                .method(req.getPaymentMethod())
                .amount(totalCost)
                .status("SUCCESS")
                .transactionRef(req.getPaymentMethod() + "/20260904/" + randomNum)
                .timestamp(LocalDateTime.now().toString())
                .idempotencyKey("idemp-" + bookingId + "-" + System.currentTimeMillis())
                .build();

        Booking booking = Booking.builder()
                .id(bookingId)
                .userId(req.getUserId())
                .customerName(req.getCustomerName())
                .customerEmail(req.getCustomerEmail())
                .customerPhone(req.getCustomerPhone())
                .destination(req.getDestination())
                .departureDate(req.getDepartureDate())
                .returnDate(req.getReturnDate())
                .travelersCount(req.getTravelersCount())
                .durationDays(req.getDurationDays())
                .transport(transport)
                .selectedSeats(req.getSelectedSeats())
                .hotel(hotelSnapshot)
                .vehicle(vehicleSnapshot)
                .places(places)
                .payment(payment)
                .totalCost(totalCost)
                .taxesAndFees(taxesAndFees)
                .status("CONFIRMED")
                .createdAt(LocalDateTime.now())
                .build();

        Booking saved = bookingRepository.save(booking);

        // Deduct inventory
        if (hotel != null && room != null) {
            final String roomId = room.getId();
            hotel.setRooms(hotel.getRooms().stream().map(r -> {
                if (r.getId().equals(roomId)) {
                    int total = r.getTotalUnits() > 0 ? r.getTotalUnits() : 8;
                    int booked = r.getBookedUnits() + 1;
                    r.setBookedUnits(booked);
                    r.setAvailableCount(Math.max(0, total - booked));
                }
                return r;
            }).collect(Collectors.toList()));
            hotelRepository.save(hotel);
        }

        if (vehicle != null) {
            vehicle.setAvailable(false);
            vehicle.setRentalStatus("RENTED");
            vehicleRepository.save(vehicle);
        }

        if (transport != null && req.getSelectedSeats() != null) {
            List<String> occupied = transport.getOccupiedSeats() != null
                    ? new java.util.ArrayList<>(transport.getOccupiedSeats()) : new java.util.ArrayList<>();
            occupied.addAll(req.getSelectedSeats());
            transport.setOccupiedSeats(occupied);
            transport.setAvailableSeats(Math.max(0, transport.getAvailableSeats() - req.getSelectedSeats().size()));
            travelOptionRepository.save(transport);
        }

        // Audit log
        auditLogRepository.save(AuditLog.builder()
                .actor(req.getCustomerEmail())
                .role("CUSTOMER")
                .action("BOOKING_CONFIRMED")
                .entity("Booking")
                .entityId(bookingId)
                .details("Booking confirmed for " + req.getCustomerName() + " to " + req.getDestination() + ". Total: ₹" + totalCost)
                .build());

        return saved;
    }

    public Booking cancelBooking(String bookingId) {
        Booking booking = getById(bookingId);
        if ("CANCELLED".equals(booking.getStatus())) {
            throw new RuntimeException("Booking is already cancelled.");
        }
        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);

        // Restore hotel room
        if (booking.getHotel() != null) {
            hotelRepository.findById(booking.getHotel().getId()).ifPresent(hotel -> {
                String roomName = booking.getHotel().getRoomName();
                hotel.setRooms(hotel.getRooms().stream().map(r -> {
                    if (r.getName().equals(roomName)) {
                        int total = r.getTotalUnits() > 0 ? r.getTotalUnits() : 8;
                        int booked = Math.max(0, r.getBookedUnits() - 1);
                        r.setBookedUnits(booked);
                        r.setAvailableCount(Math.min(total, r.getAvailableCount() + 1));
                    }
                    return r;
                }).collect(Collectors.toList()));
                hotelRepository.save(hotel);
            });
        }

        // Restore vehicle
        if (booking.getVehicle() != null) {
            vehicleRepository.findById(booking.getVehicle().getId()).ifPresent(v -> {
                v.setAvailable(true);
                v.setRentalStatus("AVAILABLE");
                vehicleRepository.save(v);
            });
        }

        auditLogRepository.save(AuditLog.builder()
                .actor(booking.getCustomerEmail())
                .role("CUSTOMER")
                .action("BOOKING_CANCELLED")
                .entity("Booking")
                .entityId(bookingId)
                .details("Booking " + bookingId + " cancelled. Refund initiated.")
                .build());

        return booking;
    }

    public long countByStatus(String status) {
        return bookingRepository.countByStatus(status);
    }

    public List<Booking> getByStatus(String status) {
        return bookingRepository.findByStatus(status);
    }
}
