package com.voyago.controller;

import com.voyago.dto.AnalyticsSummaryResponse;
import com.voyago.dto.RevenueAnalyticsResponse;
import com.voyago.model.AuditLog;
import com.voyago.model.PlatformSettings;
import com.voyago.model.User;
import com.voyago.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsSummaryResponse> getAnalytics() {
        return ResponseEntity.ok(adminService.getAnalytics());
    }

    /**
     * Get advanced revenue analytics with time range
     * @param range Time range in months: 1, 2, 6, 12, 60 (default: 6)
     */
    @GetMapping("/revenue-analytics")
    public ResponseEntity<RevenueAnalyticsResponse> getRevenueAnalytics(
            @RequestParam(defaultValue = "6") int range) {
        return ResponseEntity.ok(adminService.getRevenueAnalytics(range));
    }

    /**
     * Get hotel partner-specific revenue analytics
     * @param partnerId Partner ID
     * @param range Time range in months
     */
    @GetMapping("/hotel-partners/{partnerId}/analytics")
    public ResponseEntity<RevenueAnalyticsResponse> getHotelPartnerAnalytics(
            @PathVariable String partnerId,
            @RequestParam(defaultValue = "6") int range) {
        return ResponseEntity.ok(adminService.getHotelPartnerAnalytics(partnerId, range));
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getUsers() {
        return ResponseEntity.ok(adminService.getAllUsers().stream()
                .map(this::safeUser)
                .collect(Collectors.toList()));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<User> toggleUserStatus(@PathVariable String id) {
        return ResponseEntity.ok(adminService.toggleUserStatus(id));
    }

    @PatchMapping("/users/{id}/partner-status")
    public ResponseEntity<User> updatePartnerStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(adminService.updatePartnerStatus(id, status));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(adminService.getAuditLogs());
    }

    @GetMapping("/settings")
    public ResponseEntity<PlatformSettings> getSettings() {
        return ResponseEntity.ok(adminService.getSettings());
    }

    @PutMapping("/settings")
    public ResponseEntity<PlatformSettings> updateSettings(@RequestBody PlatformSettings settings) {
        return ResponseEntity.ok(adminService.updateSettings(settings));
    }

    @GetMapping("/hotel-partners")
    public ResponseEntity<List<Map<String, Object>>> getHotelPartners() {
        return ResponseEntity.ok(adminService.getHotelPartners());
    }

    @GetMapping("/vehicle-partners")
    public ResponseEntity<List<Map<String, Object>>> getVehiclePartners() {
        return ResponseEntity.ok(adminService.getVehiclePartners());
    }

    @GetMapping("/hotel-partners/{partnerId}/hotels")
    public ResponseEntity<List<Map<String, Object>>> getHotelsByPartnerId(@PathVariable String partnerId) {
        return ResponseEntity.ok(adminService.getHotelsByPartnerId(partnerId));
    }

    @GetMapping("/vehicle-partners/{partnerId}/vehicles")
    public ResponseEntity<List<Map<String, Object>>> getVehiclesByPartnerId(@PathVariable String partnerId) {
        return ResponseEntity.ok(adminService.getVehiclesByPartnerId(partnerId));
    }

    private Map<String, Object> safeUser(User user) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", user.getId());
        result.put("name", user.getName());
        result.put("email", user.getEmail());
        result.put("role", user.getRole());
        result.put("phone", user.getPhone());
        result.put("city", user.getCity());
        result.put("state", user.getState());
        result.put("partnerBusinessName", user.getPartnerBusinessName());
        result.put("partnerStatus", user.getPartnerStatus());
        result.put("createdAt", user.getCreatedAt());
        result.put("isActive", user.isActive());
        return result;
    }
}
