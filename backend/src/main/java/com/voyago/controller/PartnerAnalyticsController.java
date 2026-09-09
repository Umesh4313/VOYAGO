package com.voyago.controller;

import com.voyago.dto.RevenueAnalyticsResponse;
import com.voyago.model.User;
import com.voyago.repository.UserRepository;
import com.voyago.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/partner")
@RequiredArgsConstructor
public class PartnerAnalyticsController {

    private final AdminService adminService;
    private final UserRepository userRepository;

    @GetMapping("/hotel/analytics")
    @PreAuthorize("hasRole('HOTEL_PARTNER')")
    public ResponseEntity<RevenueAnalyticsResponse> getHotelAnalytics(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "1") int range,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        User partner = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated partner not found."));
        return ResponseEntity.ok(adminService.getHotelPartnerAnalytics(partner.getId(), range, month, year));
    }

    @GetMapping("/vehicle/analytics")
    @PreAuthorize("hasRole('VEHICLE_PARTNER')")
    public ResponseEntity<RevenueAnalyticsResponse> getVehicleAnalytics(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "1") int range,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        User partner = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated partner not found."));
        return ResponseEntity.ok(adminService.getVehiclePartnerAnalytics(partner.getId(), range, month, year));
    }
}