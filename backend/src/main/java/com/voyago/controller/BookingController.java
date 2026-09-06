package com.voyago.controller;

import com.voyago.dto.BookingRequest;
import com.voyago.model.Booking;
import com.voyago.model.User;
import com.voyago.service.BookingService;
import com.voyago.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    // Admin: get all bookings
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Booking>> getAll() {
        return ResponseEntity.ok(bookingService.getAll());
    }

    // Get all bookings by status (admin)
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Booking>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(bookingService.getByStatus(status));
    }

    // Get bookings for current user
    @GetMapping("/my")
    public ResponseEntity<List<Booking>> getMyBookings(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        User currentUser = findCurrentUser(userDetails);
        return ResponseEntity.ok(bookingService.getByUserId(currentUser.getId()));
    }

    // Get bookings by userId (for user's own bookings)
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getByUser(@PathVariable String userId,
                                                     @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
        if (!currentUser.getId().equals(userId) && !currentUser.getRole().equals("ADMIN")) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(bookingService.getByUserId(userId));
    }

    // Get single booking by ID
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getById(@PathVariable String id,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        User currentUser = findCurrentUser(userDetails);
        Booking booking = bookingService.getById(id);
        if (!currentUser.getId().equals(booking.getUserId()) && !"ADMIN".equals(currentUser.getRole())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(booking);
    }

    // Create a new booking
    @PostMapping
    public ResponseEntity<Booking> create(@Valid @RequestBody BookingRequest request,
                                          @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
        if (!currentUser.getId().equals(request.getUserId())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(bookingService.createBooking(request));
    }

    // Cancel a booking
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancel(@PathVariable String id,
                                          @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        User currentUser = findCurrentUser(userDetails);
        Booking booking = bookingService.getById(id);
        if (!currentUser.getId().equals(booking.getUserId()) && !"ADMIN".equals(currentUser.getRole())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }

    private User findCurrentUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
    }

    // Admin stats
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> stats() {
        return ResponseEntity.ok(Map.of(
                "confirmed", bookingService.countByStatus("CONFIRMED"),
                "cancelled", bookingService.countByStatus("CANCELLED"),
                "completed", bookingService.countByStatus("COMPLETED")
        ));
    }
}
