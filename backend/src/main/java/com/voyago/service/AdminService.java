package com.voyago.service;

import com.voyago.dto.AnalyticsSummaryResponse;
import com.voyago.model.AuditLog;
import com.voyago.model.Hotel;
import com.voyago.model.PlatformSettings;
import com.voyago.model.User;
import com.voyago.model.Vehicle;
import com.voyago.repository.AuditLogRepository;
import com.voyago.repository.BookingRepository;
import com.voyago.repository.HotelRepository;
import com.voyago.repository.PlatformSettingsRepository;
import com.voyago.repository.UserRepository;
import com.voyago.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.Month;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final AuditLogRepository auditLogRepository;
    private final PlatformSettingsRepository platformSettingsRepository;
    private final HotelRepository hotelRepository;
    private final VehicleRepository vehicleRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User toggleUserStatus(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        user.setActive(!user.isActive());
        return userRepository.save(user);
    }

    public User updatePartnerStatus(String userId, String status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        user.setPartnerStatus(status);
        return userRepository.save(user);
    }

    public AnalyticsSummaryResponse getAnalytics() {
        var allBookings = bookingRepository.findAll();

        double totalGmv = allBookings.stream()
                .filter(b -> !"CANCELLED".equals(b.getStatus()))
                .mapToDouble(b -> b.getTotalCost())
                .sum();

        long totalBookings = allBookings.size();
        long confirmed = bookingRepository.countByStatus("CONFIRMED");
        long cancelled = bookingRepository.countByStatus("CANCELLED");
        long completed = bookingRepository.countByStatus("COMPLETED");

        double aov = totalBookings > 0 ? totalGmv / totalBookings : 0;
        double commission = totalGmv * 0.05;

        // Monthly breakdown (last 6 months)
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
        var recentBookings = allBookings.stream()
                .filter(b -> b.getCreatedAt() != null && b.getCreatedAt().isAfter(sixMonthsAgo))
                .collect(Collectors.toList());

        Map<Month, Double> revenueByMonth = new TreeMap<>();
        Map<Month, Long> countByMonth = new TreeMap<>();
        for (var b : recentBookings) {
            Month m = b.getCreatedAt().getMonth();
            revenueByMonth.merge(m, b.getTotalCost(), Double::sum);
            countByMonth.merge(m, 1L, Long::sum);
        }

        List<AnalyticsSummaryResponse.MonthlyDataPoint> monthlyRevenue = revenueByMonth.entrySet().stream()
                .map(e -> AnalyticsSummaryResponse.MonthlyDataPoint.builder()
                        .label(e.getKey().name().substring(0, 3))
                        .value(e.getValue())
                        .build())
                .collect(Collectors.toList());

        List<AnalyticsSummaryResponse.MonthlyDataPoint> monthlyOrderCount = countByMonth.entrySet().stream()
                .map(e -> AnalyticsSummaryResponse.MonthlyDataPoint.builder()
                        .label(e.getKey().name().substring(0, 3))
                        .value(e.getValue().doubleValue())
                        .build())
                .collect(Collectors.toList());

        // Current month stats
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        double monthlyIncome = allBookings.stream()
                .filter(b -> b.getCreatedAt() != null && b.getCreatedAt().isAfter(startOfMonth))
                .mapToDouble(b -> b.getTotalCost())
                .sum();
        long monthlyOrders = allBookings.stream()
                .filter(b -> b.getCreatedAt() != null && b.getCreatedAt().isAfter(startOfMonth))
                .count();

        return AnalyticsSummaryResponse.builder()
                .totalGmv(totalGmv)
                .totalBookings(totalBookings)
                .confirmedBookings(confirmed)
                .cancelledBookings(cancelled)
                .completedBookings(completed)
                .averageOrderValue(aov)
                .platformCommission(commission)
                .monthlyIncome(monthlyIncome)
                .monthlyOrders(monthlyOrders)
                .monthlyRevenue(monthlyRevenue)
                .monthlyOrderCount(monthlyOrderCount)
                .build();
    }

    public List<Map<String, Object>> getHotelPartners() {
        List<User> hotelPartners = userRepository.findAll().stream()
                .filter(u -> "HOTEL_PARTNER".equals(u.getRole()))
                .collect(Collectors.toList());
        
        return hotelPartners.stream()
                .map(partner -> {
                    Map<String, Object> data = new LinkedHashMap<>();
                    data.put("id", partner.getId());
                    data.put("name", partner.getName());
                    data.put("email", partner.getEmail());
                    data.put("phone", partner.getPhone());
                    data.put("partnerBusinessName", partner.getPartnerBusinessName());
                    data.put("partnerStatus", partner.getPartnerStatus());
                    data.put("createdAt", partner.getCreatedAt());
                    data.put("isActive", partner.isActive());
                    
                    long hotelCount = hotelRepository.findByPartnerId(partner.getId()).size();
                    data.put("hotelCount", hotelCount);
                    
                    return data;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getVehiclePartners() {
        List<User> vehiclePartners = userRepository.findAll().stream()
                .filter(u -> "VEHICLE_PARTNER".equals(u.getRole()))
                .collect(Collectors.toList());
        
        return vehiclePartners.stream()
                .map(partner -> {
                    Map<String, Object> data = new LinkedHashMap<>();
                    data.put("id", partner.getId());
                    data.put("name", partner.getName());
                    data.put("email", partner.getEmail());
                    data.put("phone", partner.getPhone());
                    data.put("partnerBusinessName", partner.getPartnerBusinessName());
                    data.put("partnerStatus", partner.getPartnerStatus());
                    data.put("createdAt", partner.getCreatedAt());
                    data.put("isActive", partner.isActive());
                    
                    long vehicleCount = vehicleRepository.findByPartnerId(partner.getId()).size();
                    data.put("vehicleCount", vehicleCount);
                    
                    return data;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getHotelsByPartnerId(String partnerId) {
        List<Hotel> hotels = hotelRepository.findByPartnerId(partnerId);
        return hotels.stream()
                .map(hotel -> {
                    Map<String, Object> data = new LinkedHashMap<>();
                    data.put("id", hotel.getId());
                    data.put("name", hotel.getName());
                    data.put("address", hotel.getAddress());
                    data.put("city", hotel.getCity());
                    data.put("destinationName", hotel.getDestinationName());
                    data.put("rating", hotel.getRating());
                    data.put("reviewCount", hotel.getReviewCount());
                    data.put("heroImage", hotel.getHeroImage());
                    data.put("status", hotel.getStatus());
                    int roomCount = hotel.getRooms() != null ? hotel.getRooms().size() : 0;
                    data.put("roomCount", roomCount);
                    return data;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getVehiclesByPartnerId(String partnerId) {
        List<Vehicle> vehicles = vehicleRepository.findByPartnerId(partnerId);
        return vehicles.stream()
                .map(vehicle -> {
                    Map<String, Object> data = new LinkedHashMap<>();
                    data.put("id", vehicle.getId());
                    data.put("name", vehicle.getName());
                    data.put("registrationNumber", vehicle.getRegistrationNumber());
                    data.put("type", vehicle.getType());
                    data.put("seats", vehicle.getSeats());
                    data.put("dailyRate", vehicle.getDailyRate());
                    data.put("isAvailable", vehicle.isAvailable());
                    data.put("rentalStatus", vehicle.getRentalStatus());
                    return data;
                })
                .collect(Collectors.toList());
    }

    public List<AuditLog> getAuditLogs() {
        return auditLogRepository.findAll().stream()
                .sorted(Comparator.comparing(AuditLog::getTimestamp).reversed())
                .collect(Collectors.toList());
    }

    public PlatformSettings getSettings() {
        return platformSettingsRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> {
                    PlatformSettings defaults = PlatformSettings.builder().id("platform-settings").build();
                    return platformSettingsRepository.save(defaults);
                });
    }

    public PlatformSettings updateSettings(PlatformSettings updated) {
        PlatformSettings current = getSettings();
        updated.setId(current.getId());
        return platformSettingsRepository.save(updated);
    }
}
