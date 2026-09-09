package com.voyago.service;

import com.voyago.dto.BookingRequest;
import com.voyago.model.*;
import com.voyago.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalDate;
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
        return autoCompletePastBookings(bookingRepository.findAll());
    }

    public List<Booking> getByUserId(String userId) {
        return autoCompletePastBookings(bookingRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }

        public List<Booking> getByHotelPartner(String partnerId) {
        List<String> hotelIds = hotelRepository.findByPartnerId(partnerId).stream()
            .map(Hotel::getId)
            .collect(Collectors.toList());
        return autoCompletePastBookings(bookingRepository.findAll().stream()
            .filter(booking -> booking.getHotel() != null && hotelIds.contains(booking.getHotel().getId()))
            .collect(Collectors.toList()));
        }

        public List<Booking> getByVehiclePartner(String partnerId) {
        List<String> vehicleIds = vehicleRepository.findByPartnerId(partnerId).stream()
            .map(Vehicle::getId)
            .collect(Collectors.toList());
        return autoCompletePastBookings(bookingRepository.findAll().stream()
            .filter(booking -> booking.getVehicle() != null && vehicleIds.contains(booking.getVehicle().getId()))
            .collect(Collectors.toList()));
        }

    public Booking getById(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + id));
        return autoCompletePastBookings(List.of(booking)).get(0);
    }

    private List<Booking> autoCompletePastBookings(List<Booking> bookings) {
        LocalDate today = LocalDate.now();
        return bookings.stream().map(booking -> {
            if (!"CONFIRMED".equals(booking.getStatus()) || booking.getReturnDate() == null) return booking;
            try {
                if (LocalDate.parse(booking.getReturnDate()).isBefore(today)) {
                    booking.setStatus("COMPLETED");
                    Booking completed = bookingRepository.save(booking);
                    releaseCompletedInventory(completed);
                    return completed;
                }
            } catch (java.time.format.DateTimeParseException ignored) {
                // Leave malformed legacy dates unchanged for manual review.
            }
            return booking;
        }).collect(Collectors.toList());
    }

    private void releaseCompletedInventory(Booking booking) {
        if (booking.getHotel() != null) {
            hotelRepository.findById(booking.getHotel().getId()).ifPresent(hotel -> {
                hotel.setRooms(hotel.getRooms().stream().map(room -> {
                    if (room.getId().equals(booking.getHotel().getRoomId())) {
                        int total = room.getTotalUnits() > 0 ? room.getTotalUnits() : 8;
                        int units = booking.getHotel().getRoomUnits() > 0 ? booking.getHotel().getRoomUnits() : 1;
                        room.setBookedUnits(Math.max(0, room.getBookedUnits() - units));
                        room.setAvailableCount(Math.min(total, room.getAvailableCount() + units));
                    }
                    return room;
                }).collect(Collectors.toList()));
                hotelRepository.save(hotel);
            });
        }
        if (booking.getVehicle() != null) {
            vehicleRepository.findById(booking.getVehicle().getId()).ifPresent(vehicle -> {
                vehicle.setAvailable(true);
                vehicle.setRentalStatus("AVAILABLE");
                vehicleRepository.save(vehicle);
            });
        }
        if (booking.getTransport() != null && booking.getSelectedSeats() != null) {
            travelOptionRepository.findById(booking.getTransport().getId()).ifPresent(transport -> {
                List<String> occupied = transport.getOccupiedSeats() == null
                        ? new java.util.ArrayList<>()
                        : new java.util.ArrayList<>(transport.getOccupiedSeats());
                occupied.removeAll(booking.getSelectedSeats());
                transport.setOccupiedSeats(occupied);
                transport.setAvailableSeats(transport.getAvailableSeats() + booking.getSelectedSeats().size());
                travelOptionRepository.save(transport);
            });
        }
    }

    public synchronized Booking createBooking(BookingRequest req) {
        // Resolve transport snapshot
        TravelOption transport = null;
        if (req.getTransportId() != null && !req.getTransportId().isBlank()) {
            transport = travelOptionRepository.findById(req.getTransportId()).orElse(null);
            if (transport == null) {
                throw new RuntimeException("Selected transport option is no longer available.");
            }
            validateTransportSeats(req, transport);
        }

        // Resolve hotel snapshot
        Booking.BookingHotel hotelSnapshot = null;
        Hotel hotel = null;
        HotelRoom room = null;
        if (req.getHotelId() != null && req.getRoomId() != null) {
            hotel = hotelRepository.findById(req.getHotelId()).orElseGet(() -> hotelRepository.findAll().stream()
                .filter(candidate -> req.getHotelName() != null && candidate.getName().equalsIgnoreCase(req.getHotelName()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Selected hotel is no longer available.")));
            room = hotel.getRooms().stream()
                .filter(candidate -> candidate.getId().equals(req.getRoomId())
                    || (req.getRoomName() != null && candidate.getName().equalsIgnoreCase(req.getRoomName())))
                .findFirst()
                .orElse(null);
            if (room == null && req.getHotelName() != null && req.getRoomName() != null) {
            Hotel matchingHotel = hotelRepository.findAll().stream()
                .filter(candidate -> candidate.getName().equalsIgnoreCase(req.getHotelName()))
                .filter(candidate -> candidate.getRooms().stream()
                    .anyMatch(candidateRoom -> candidateRoom.getName().equalsIgnoreCase(req.getRoomName())))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Selected room is no longer available."));
            hotel = matchingHotel;
            room = matchingHotel.getRooms().stream()
                .filter(candidate -> candidate.getName().equalsIgnoreCase(req.getRoomName()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Selected room is no longer available."));
            }
            if (room == null) {
            throw new RuntimeException("Selected room is no longer available.");
            }
            if (!room.isActive()) {
                throw new RuntimeException("Room '" + room.getName() + "' is inactive.");
            }
            validateRoomAvailability(req, hotel.getId(), room);
                double roomPrice = "NON_AC".equalsIgnoreCase(req.getRoomCondition())
                    ? (room.getNonAcPricePerNight() != null ? room.getNonAcPricePerNight() : room.getPricePerNight() * 0.8)
                    : room.getPricePerNight();
            hotelSnapshot = Booking.BookingHotel.builder()
                    .id(hotel.getId())
                    .name(hotel.getName())
                    .roomId(room.getId())
                    .roomType(room.getType())
                    .roomName(room.getName())
                    .roomUnits(Math.max(1, req.getRoomUnits()))
                    .pricePerNight(roomPrice)
                    .condition(req.getRoomCondition())
                    .nights(req.getDurationDays())
                    .total(roomPrice * req.getDurationDays())
                    .address(hotel.getAddress())
                    .build();
        } else if (req.getHotelId() != null || req.getRoomId() != null) {
            throw new RuntimeException("Both a hotel and room must be selected.");
        }

        // Resolve vehicle snapshot
        Booking.BookingVehicle vehicleSnapshot = null;
        Vehicle vehicle = null;
        if (req.getVehicleId() != null && !req.getVehicleId().isBlank()) {
            vehicle = vehicleRepository.findById(req.getVehicleId())
                    .orElseThrow(() -> new RuntimeException("Selected vehicle is no longer available."));
            int requestedUnits = Math.max(1, req.getVehicleUnits());
            int availableUnits = vehicle.getAvailableUnits() > 0 ? vehicle.getAvailableUnits() : (vehicle.getTotalUnits() > 0 ? vehicle.getTotalUnits() : 1);
            if (availableUnits < requestedUnits || (!vehicle.isAvailable() && !"AVAILABLE".equals(vehicle.getRentalStatus()) && vehicle.getTotalUnits() <= 1)) {
                throw new RuntimeException("Vehicle '" + vehicle.getName() + "' is not available.");
            }
            if (hasOverlappingVehicleBooking(req, vehicle.getId(), requestedUnits, vehicle.getTotalUnits())) {
                throw new RuntimeException("Vehicle '" + vehicle.getName() + "' is not available.");
            }
            vehicleSnapshot = Booking.BookingVehicle.builder()
                    .id(vehicle.getId())
                    .name(vehicle.getName())
                    .type(vehicle.getType())
                    .dailyRate(vehicle.getDailyRate())
                    .days(req.getDurationDays())
                    .units(requestedUnits)
                    .total(vehicle.getDailyRate() * req.getDurationDays())
                    .build();
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
        String bookingId = createUniqueBookingId();
        int randomNum = Math.abs(bookingId.hashCode() % 90000);

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
                    int booked = r.getBookedUnits() + Math.max(1, req.getRoomUnits());
                    r.setBookedUnits(booked);
                    r.setAvailableCount(Math.max(0, total - booked));
                }

                return r;
            }).collect(Collectors.toList()));
            hotelRepository.save(hotel);
        }

        if (vehicle != null) {
            int totalUnits = vehicle.getTotalUnits() > 0 ? vehicle.getTotalUnits() : 1;
            int bookedUnits = vehicle.getBookedUnits() + Math.max(1, req.getVehicleUnits());
            vehicle.setBookedUnits(bookedUnits);
            vehicle.setAvailableUnits(Math.max(0, totalUnits - bookedUnits));
            vehicle.setAvailable(bookedUnits < totalUnits);
            vehicle.setRentalStatus(vehicle.isAvailable() ? "AVAILABLE" : "RENTED");
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

    private String createUniqueBookingId() {
        String bookingId;
        do {
            bookingId = "VOY-" + LocalDate.now().getYear() + "-" + (10000 + new Random().nextInt(90000));
        } while (bookingRepository.existsById(bookingId));
        return bookingId;
    }

    private void validateTransportSeats(BookingRequest request, TravelOption transport) {
        if (request.getSelectedSeats() == null || request.getSelectedSeats().size() != request.getTravelersCount()) {
            throw new RuntimeException("Select exactly one available seat for each traveler.");
        }
        List<String> occupied = transport.getOccupiedSeats() == null ? List.of() : transport.getOccupiedSeats();
        request.getSelectedSeats().stream()
                .filter(occupied::contains)
                .findFirst()
                .ifPresent(seat -> {
                    throw new RuntimeException("Selected seat " + seat + " is no longer available. Please choose another seat.");
                });
        boolean alreadyBooked = bookingRepository.findByTransport_Id(transport.getId()).stream()
                .filter(booking -> datesOverlap(request.getDepartureDate(), request.getReturnDate(), booking.getDepartureDate(), booking.getReturnDate()))
                .flatMap(booking -> booking.getSelectedSeats() == null ? java.util.stream.Stream.empty() : booking.getSelectedSeats().stream())
                .anyMatch(request.getSelectedSeats()::contains);
        if (alreadyBooked) {
            throw new RuntimeException("One or more selected seats are already booked for these dates.");
        }
    }

    private void validateRoomAvailability(BookingRequest request, String hotelId, HotelRoom room) {
        long overlappingRooms = bookingRepository.findByHotel_Id(hotelId).stream()
                .filter(booking -> datesOverlap(request.getDepartureDate(), request.getReturnDate(), booking.getDepartureDate(), booking.getReturnDate()))
                .filter(booking -> booking.getHotel() != null && room.getId().equals(booking.getHotel().getRoomId()))
                .mapToLong(booking -> booking.getHotel().getRoomUnits() > 0 ? booking.getHotel().getRoomUnits() : 1)
                .sum();
        if (overlappingRooms >= room.getTotalUnits()) {
            throw new RuntimeException("No rooms available for these dates.");
        }
    }

    private boolean hasOverlappingVehicleBooking(BookingRequest request, String vehicleId, int requestedUnits, int totalUnits) {
        return bookingRepository.findByVehicle_Id(vehicleId).stream()
                .filter(booking -> !"CANCELLED".equals(booking.getStatus()))
                .filter(booking -> datesOverlap(request.getDepartureDate(), request.getReturnDate(), booking.getDepartureDate(), booking.getReturnDate()))
                .mapToInt(booking -> booking.getVehicle() != null && booking.getVehicle().getUnits() > 0 ? booking.getVehicle().getUnits() : 1)
                .sum() + requestedUnits > (totalUnits > 0 ? totalUnits : 1);
    }

    private boolean datesOverlap(String requestedStart, String requestedEnd, String existingStart, String existingEnd) {
        LocalDate requestedFrom = LocalDate.parse(requestedStart);
        LocalDate requestedTo = LocalDate.parse(requestedEnd);
        LocalDate existingFrom = LocalDate.parse(existingStart);
        LocalDate existingTo = LocalDate.parse(existingEnd);
        return requestedFrom.isBefore(existingTo) && requestedTo.isAfter(existingFrom);
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
                String roomId = booking.getHotel().getRoomId();
                hotel.setRooms(hotel.getRooms().stream().map(r -> {
                    if (r.getId().equals(roomId)) {
                        int total = r.getTotalUnits() > 0 ? r.getTotalUnits() : 8;
                        int units = booking.getHotel().getRoomUnits() > 0 ? booking.getHotel().getRoomUnits() : 1;
                        int booked = Math.max(0, r.getBookedUnits() - units);
                        r.setBookedUnits(booked);
                        r.setAvailableCount(Math.min(total, r.getAvailableCount() + units));
                    }
                    return r;
                }).collect(Collectors.toList()));
                hotelRepository.save(hotel);
            });
        }

        // Restore seats reserved by this booking.
        if (booking.getTransport() != null && booking.getSelectedSeats() != null) {
            travelOptionRepository.findById(booking.getTransport().getId()).ifPresent(transport -> {
                List<String> occupied = transport.getOccupiedSeats() == null
                        ? new java.util.ArrayList<>()
                        : new java.util.ArrayList<>(transport.getOccupiedSeats());
                occupied.removeAll(booking.getSelectedSeats());
                transport.setOccupiedSeats(occupied);
                transport.setAvailableSeats(transport.getAvailableSeats() + booking.getSelectedSeats().size());
                travelOptionRepository.save(transport);
            });
        }

        // Restore vehicle
        if (booking.getVehicle() != null) {
            vehicleRepository.findById(booking.getVehicle().getId()).ifPresent(v -> {
                int total = v.getTotalUnits() > 0 ? v.getTotalUnits() : 1;
                int units = booking.getVehicle().getUnits() > 0 ? booking.getVehicle().getUnits() : 1;
                v.setBookedUnits(Math.max(0, v.getBookedUnits() - units));
                v.setAvailableUnits(Math.min(total, total - v.getBookedUnits()));
                v.setAvailable(v.getBookedUnits() < total);
                v.setRentalStatus(v.isAvailable() ? "AVAILABLE" : "RENTED");
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

    public Booking updateStatus(String bookingId, String status) {
        String normalizedStatus = status == null ? "" : status.trim().toUpperCase();
        if (!List.of("CONFIRMED", "COMPLETED", "CANCELLED").contains(normalizedStatus)) {
            throw new RuntimeException("Unsupported booking status: " + status);
        }
        Booking booking = getById(bookingId);
        if ("CANCELLED".equals(normalizedStatus)) {
            return cancelBooking(bookingId);
        }
        if ("CANCELLED".equals(booking.getStatus())) {
            throw new RuntimeException("A cancelled booking cannot be reopened.");
        }
        booking.setStatus(normalizedStatus);
        Booking updated = bookingRepository.save(booking);
        if ("COMPLETED".equals(normalizedStatus)) {
            releaseCompletedInventory(updated);
        }
        return updated;
    }

    public long countByStatus(String status) {
        return bookingRepository.countByStatus(status);
    }

    public List<Booking> getByStatus(String status) {
        return bookingRepository.findByStatus(status);
    }
}
