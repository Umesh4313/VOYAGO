package com.voyago.service;

import com.voyago.dto.AnalyticsSummaryResponse;
import com.voyago.dto.RevenueAnalyticsResponse;
import com.voyago.model.AuditLog;
import com.voyago.model.Booking;
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
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
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
                User savedUser = userRepository.save(user);
                if ("HOTEL_PARTNER".equals(user.getRole())) {
                        hotelRepository.findByPartnerId(userId).forEach(hotel -> {
                                hotel.setApprovalStatus(status);
                                hotel.setStatus("APPROVED".equals(status) ? "ACTIVE" : "INACTIVE");
                                hotelRepository.save(hotel);
                        });
                }
                return savedUser;
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
                .filter(b -> !"CANCELLED".equals(b.getStatus()))
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
                .filter(b -> !"CANCELLED".equals(b.getStatus()))
                .filter(b -> b.getCreatedAt() != null && b.getCreatedAt().isAfter(startOfMonth))
                .mapToDouble(b -> b.getTotalCost())
                .sum();
        long monthlyOrders = allBookings.stream()
                .filter(b -> !"CANCELLED".equals(b.getStatus()))
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

    /**
     * Get revenue analytics for a specific time range with comparison to previous period
     * @param rangeMonths Number of months to analyze (1, 2, 6, 12, 60)
     * @return Revenue analytics with comparison
     */
    public RevenueAnalyticsResponse getRevenueAnalytics(int rangeMonths) {
                return getRevenueAnalytics(rangeMonths, null, null);
        }

        public RevenueAnalyticsResponse getRevenueAnalytics(int rangeMonths, Integer selectedMonth, Integer selectedYear) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime currentStart = now.minusMonths(rangeMonths);
                if (selectedMonth != null && selectedYear != null) {
                        currentStart = LocalDateTime.of(selectedYear, selectedMonth, 1, 0, 0);
                        now = currentStart.plusMonths(1);
                }
        LocalDateTime previousStart = currentStart.minusMonths(rangeMonths);
        LocalDateTime previousEnd = currentStart;
                final LocalDateTime queryStart = currentStart;
                final LocalDateTime queryEnd = now;

        // Get all bookings
        List<Booking> allBookings = bookingRepository.findAll();

        // Filter current period bookings
        List<Booking> currentBookings = allBookings.stream()
                .filter(b -> !"CANCELLED".equals(b.getStatus()))
                .filter(b -> b.getCreatedAt() != null &&
                        !b.getCreatedAt().isBefore(queryStart) &&
                        b.getCreatedAt().isBefore(queryEnd))
                .collect(Collectors.toList());

        // Filter previous period bookings
        List<Booking> previousBookings = allBookings.stream()
                .filter(b -> !"CANCELLED".equals(b.getStatus()))
                .filter(b -> b.getCreatedAt() != null &&
                        !b.getCreatedAt().isBefore(previousStart) &&
                        b.getCreatedAt().isBefore(previousEnd))
                .collect(Collectors.toList());

        // Calculate current period metrics
        double currentRevenue = currentBookings.stream()
                .mapToDouble(Booking::getTotalCost)
                .sum();
        long currentBookingCount = currentBookings.size();

        // Calculate previous period metrics
        double previousRevenue = previousBookings.stream()
                .mapToDouble(Booking::getTotalCost)
                .sum();
        long previousBookingCount = previousBookings.size();

        // Calculate changes
        double revenueChange = previousRevenue > 0 
                ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
                : 0;
        double bookingChange = previousBookingCount > 0 
                ? ((double)(currentBookingCount - previousBookingCount) / previousBookingCount) * 100 
                : 0;

        // Calculate average order value
        double averageOrderValue = currentBookingCount > 0 
                ? currentRevenue / currentBookingCount 
                : 0;

        // Generate time series data
        List<RevenueAnalyticsResponse.DataPoint> revenueData = generateTimeSeriesData(currentBookings, currentStart, now, rangeMonths);
        List<RevenueAnalyticsResponse.DataPoint> bookingData = generateBookingTimeSeriesData(currentBookings, currentStart, now, rangeMonths);

        // Generate category breakdown
        List<RevenueAnalyticsResponse.CategoryBreakdown> categoryBreakdown = generateCategoryBreakdown(currentBookings, currentRevenue);

        // Determine period label
        String periodLabel = selectedMonth != null && selectedYear != null
                ? Month.of(selectedMonth).name() + " " + selectedYear
                : getPeriodLabel(rangeMonths);

        return RevenueAnalyticsResponse.builder()
                .period(periodLabel)
                .currentRevenue(currentRevenue)
                .previousRevenue(previousRevenue)
                .revenueChange(revenueChange)
                .currentBookings(currentBookingCount)
                .previousBookings(previousBookingCount)
                .bookingChange(bookingChange)
                .averageOrderValue(averageOrderValue)
                .revenueData(revenueData)
                .bookingData(bookingData)
                .categoryBreakdown(categoryBreakdown)
                .build();
    }

    private String getPeriodLabel(int months) {
        return switch (months) {
            case 1 -> "Last Month";
            case 2 -> "Last 2 Months";
            case 6 -> "Last 6 Months";
            case 12 -> "Last Year";
            case 60 -> "Last 5 Years";
            default -> "Last " + months + " Months";
        };
    }

    private List<RevenueAnalyticsResponse.DataPoint> generateTimeSeriesData(
            List<Booking> bookings, LocalDateTime start, LocalDateTime end, int rangeMonths) {
        
        DateTimeFormatter formatter;
        Map<String, Double> dataMap = new LinkedHashMap<>();

        if (rangeMonths <= 2) {
            // Daily granularity for 1-2 months
            formatter = DateTimeFormatter.ofPattern("MMM dd");
            long days = ChronoUnit.DAYS.between(start, end);
            for (int i = 0; i <= days; i++) {
                LocalDateTime date = start.plusDays(i);
                String label = date.format(formatter);
                dataMap.put(label, 0.0);
            }
            
            for (Booking booking : bookings) {
                String label = booking.getCreatedAt().format(formatter);
                dataMap.merge(label, booking.getTotalCost(), Double::sum);
            }
        } else if (rangeMonths <= 12) {
            // Weekly granularity for 6-12 months
            formatter = DateTimeFormatter.ofPattern("MMM dd");
            long weeks = ChronoUnit.WEEKS.between(start, end);
            for (int i = 0; i <= weeks; i++) {
                LocalDateTime weekStart = start.plusWeeks(i);
                String label = "Week " + weekStart.format(DateTimeFormatter.ofPattern("MMM dd"));
                dataMap.put(label, 0.0);
            }
            
            for (Booking booking : bookings) {
                long weeksSinceStart = ChronoUnit.WEEKS.between(start, booking.getCreatedAt());
                LocalDateTime weekStart = start.plusWeeks(weeksSinceStart);
                String label = "Week " + weekStart.format(DateTimeFormatter.ofPattern("MMM dd"));
                dataMap.merge(label, booking.getTotalCost(), Double::sum);
            }
        } else {
            // Monthly granularity for 5 years
            formatter = DateTimeFormatter.ofPattern("MMM yyyy");
            for (int i = 0; i < rangeMonths; i++) {
                LocalDateTime month = start.plusMonths(i);
                String label = month.format(formatter);
                dataMap.put(label, 0.0);
            }
            
            for (Booking booking : bookings) {
                String label = booking.getCreatedAt().format(formatter);
                dataMap.merge(label, booking.getTotalCost(), Double::sum);
            }
        }

        return dataMap.entrySet().stream()
                .map(e -> RevenueAnalyticsResponse.DataPoint.builder()
                        .label(e.getKey())
                        .value(e.getValue())
                        .build())
                .collect(Collectors.toList());
    }

    private List<RevenueAnalyticsResponse.DataPoint> generateBookingTimeSeriesData(
            List<Booking> bookings, LocalDateTime start, LocalDateTime end, int rangeMonths) {
        
        DateTimeFormatter formatter;
        Map<String, Long> countMap = new LinkedHashMap<>();

        if (rangeMonths <= 2) {
            // Daily granularity
            formatter = DateTimeFormatter.ofPattern("MMM dd");
            long days = ChronoUnit.DAYS.between(start, end);
            for (int i = 0; i <= days; i++) {
                LocalDateTime date = start.plusDays(i);
                String label = date.format(formatter);
                countMap.put(label, 0L);
            }
            
            for (Booking booking : bookings) {
                String label = booking.getCreatedAt().format(formatter);
                countMap.merge(label, 1L, Long::sum);
            }
        } else if (rangeMonths <= 12) {
            // Weekly granularity
            long weeks = ChronoUnit.WEEKS.between(start, end);
            for (int i = 0; i <= weeks; i++) {
                LocalDateTime weekStart = start.plusWeeks(i);
                String label = "Week " + weekStart.format(DateTimeFormatter.ofPattern("MMM dd"));
                countMap.put(label, 0L);
            }
            
            for (Booking booking : bookings) {
                long weeksSinceStart = ChronoUnit.WEEKS.between(start, booking.getCreatedAt());
                LocalDateTime weekStart = start.plusWeeks(weeksSinceStart);
                String label = "Week " + weekStart.format(DateTimeFormatter.ofPattern("MMM dd"));
                countMap.merge(label, 1L, Long::sum);
            }
        } else {
            // Monthly granularity
            formatter = DateTimeFormatter.ofPattern("MMM yyyy");
            for (int i = 0; i < rangeMonths; i++) {
                LocalDateTime month = start.plusMonths(i);
                String label = month.format(formatter);
                countMap.put(label, 0L);
            }
            
            for (Booking booking : bookings) {
                String label = booking.getCreatedAt().format(formatter);
                countMap.merge(label, 1L, Long::sum);
            }
        }

        return countMap.entrySet().stream()
                .map(e -> RevenueAnalyticsResponse.DataPoint.builder()
                        .label(e.getKey())
                        .value(e.getValue().doubleValue())
                        .count(e.getValue())
                        .build())
                .collect(Collectors.toList());
    }

    private List<RevenueAnalyticsResponse.CategoryBreakdown> generateCategoryBreakdown(
            List<Booking> bookings, double totalRevenue) {
        
        double hotelRevenue = bookings.stream()
                .filter(b -> b.getHotel() != null)
                .mapToDouble(b -> b.getHotel().getTotal())
                .sum();
        
        double vehicleRevenue = bookings.stream()
                .filter(b -> b.getVehicle() != null)
                .mapToDouble(b -> b.getVehicle().getTotal())
                .sum();
        
        double transportRevenue = bookings.stream()
                .filter(b -> b.getTransport() != null)
                .mapToDouble(b -> b.getTransport().getPricePerPerson() * b.getTravelersCount())
                .sum();

        long hotelCount = bookings.stream().filter(b -> b.getHotel() != null).count();
        long vehicleCount = bookings.stream().filter(b -> b.getVehicle() != null).count();
        long transportCount = bookings.stream().filter(b -> b.getTransport() != null).count();

        List<RevenueAnalyticsResponse.CategoryBreakdown> breakdown = new ArrayList<>();

        if (hotelRevenue > 0) {
            breakdown.add(RevenueAnalyticsResponse.CategoryBreakdown.builder()
                    .category("Hotels")
                    .revenue(hotelRevenue)
                    .count(hotelCount)
                    .percentage(totalRevenue > 0 ? (hotelRevenue / totalRevenue) * 100 : 0)
                    .build());
        }

        if (vehicleRevenue > 0) {
            breakdown.add(RevenueAnalyticsResponse.CategoryBreakdown.builder()
                    .category("Vehicles")
                    .revenue(vehicleRevenue)
                    .count(vehicleCount)
                    .percentage(totalRevenue > 0 ? (vehicleRevenue / totalRevenue) * 100 : 0)
                    .build());
        }

        if (transportRevenue > 0) {
            breakdown.add(RevenueAnalyticsResponse.CategoryBreakdown.builder()
                    .category("Transport")
                    .revenue(transportRevenue)
                    .count(transportCount)
                    .percentage(totalRevenue > 0 ? (transportRevenue / totalRevenue) * 100 : 0)
                    .build());
        }

        return breakdown;
    }

    /**
     * Get hotel partner-specific revenue analytics
     */
    public RevenueAnalyticsResponse getHotelPartnerAnalytics(String partnerId, int rangeMonths) {
                return getHotelPartnerAnalytics(partnerId, rangeMonths, null, null);
        }

        public RevenueAnalyticsResponse getHotelPartnerAnalytics(String partnerId, int rangeMonths, Integer selectedMonth, Integer selectedYear) {
        // Get all hotels for this partner
        List<Hotel> partnerHotels = hotelRepository.findByPartnerId(partnerId);
        Set<String> hotelIds = partnerHotels.stream()
                .map(Hotel::getId)
                .collect(Collectors.toSet());

        // Filter bookings that include this partner's hotels
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime currentStart = now.minusMonths(rangeMonths);
                if (selectedMonth != null && selectedYear != null) {
                        currentStart = LocalDateTime.of(selectedYear, selectedMonth, 1, 0, 0);
                        now = currentStart.plusMonths(1);
                }
        LocalDateTime previousStart = currentStart.minusMonths(rangeMonths);
        final LocalDateTime queryStart = currentStart;
        final LocalDateTime queryEnd = now;
        final LocalDateTime comparisonStart = previousStart;

        List<Booking> allBookings = bookingRepository.findAll();
        
        List<Booking> currentBookings = allBookings.stream()
                .filter(b -> b.getHotel() != null && hotelIds.contains(b.getHotel().getId()))
                .filter(b -> !"CANCELLED".equals(b.getStatus()))
                .filter(b -> b.getCreatedAt() != null && 
                        !b.getCreatedAt().isBefore(queryStart) &&
                        b.getCreatedAt().isBefore(queryEnd))
                .collect(Collectors.toList());

        List<Booking> previousBookings = allBookings.stream()
                .filter(b -> b.getHotel() != null && hotelIds.contains(b.getHotel().getId()))
                .filter(b -> !"CANCELLED".equals(b.getStatus()))
                .filter(b -> b.getCreatedAt() != null && 
                        !b.getCreatedAt().isBefore(comparisonStart) &&
                        b.getCreatedAt().isBefore(queryStart))
                .collect(Collectors.toList());

        // Calculate metrics (hotel revenue only)
        double currentRevenue = currentBookings.stream()
                .mapToDouble(b -> b.getHotel().getTotal())
                .sum();
        
        double previousRevenue = previousBookings.stream()
                .mapToDouble(b -> b.getHotel().getTotal())
                .sum();

        long currentBookingCount = currentBookings.size();
        long previousBookingCount = previousBookings.size();

        double revenueChange = previousRevenue > 0 
                ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
                : 0;
        double bookingChange = previousBookingCount > 0 
                ? ((double)(currentBookingCount - previousBookingCount) / previousBookingCount) * 100 
                : 0;

        double averageOrderValue = currentBookingCount > 0 
                ? currentRevenue / currentBookingCount 
                : 0;

        // Generate time series
        List<RevenueAnalyticsResponse.DataPoint> revenueData = generateTimeSeriesData(currentBookings, currentStart, now, rangeMonths);
        List<RevenueAnalyticsResponse.DataPoint> bookingData = generateBookingTimeSeriesData(currentBookings, currentStart, now, rangeMonths);

        return RevenueAnalyticsResponse.builder()
                .period(selectedMonth != null && selectedYear != null ? Month.of(selectedMonth).name() + " " + selectedYear : getPeriodLabel(rangeMonths))
                .currentRevenue(currentRevenue)
                .previousRevenue(previousRevenue)
                .revenueChange(revenueChange)
                .currentBookings(currentBookingCount)
                .previousBookings(previousBookingCount)
                .bookingChange(bookingChange)
                .averageOrderValue(averageOrderValue)
                .revenueData(revenueData)
                .bookingData(bookingData)
                .categoryBreakdown(new ArrayList<>()) // Not needed for partner view
                .build();
    }

    public RevenueAnalyticsResponse getVehiclePartnerAnalytics(String partnerId, int rangeMonths) {
                return getVehiclePartnerAnalytics(partnerId, rangeMonths, null, null);
        }

        public RevenueAnalyticsResponse getVehiclePartnerAnalytics(String partnerId, int rangeMonths, Integer selectedMonth, Integer selectedYear) {
        Set<String> vehicleIds = vehicleRepository.findByPartnerId(partnerId).stream()
                .map(Vehicle::getId)
                .collect(Collectors.toSet());
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime currentStart = now.minusMonths(rangeMonths);
                if (selectedMonth != null && selectedYear != null) {
                        currentStart = LocalDateTime.of(selectedYear, selectedMonth, 1, 0, 0);
                        now = currentStart.plusMonths(1);
                }
        LocalDateTime previousStart = currentStart.minusMonths(rangeMonths);
                final LocalDateTime queryStart = currentStart;
                final LocalDateTime queryEnd = now;
                final LocalDateTime comparisonStart = previousStart;
        List<Booking> allBookings = bookingRepository.findAll();
        List<Booking> currentBookings = allBookings.stream()
                .filter(b -> b.getVehicle() != null && vehicleIds.contains(b.getVehicle().getId()))
                .filter(b -> !"CANCELLED".equals(b.getStatus()))
                .filter(b -> b.getCreatedAt() != null && !b.getCreatedAt().isBefore(queryStart) && b.getCreatedAt().isBefore(queryEnd))
                .collect(Collectors.toList());
        List<Booking> previousBookings = allBookings.stream()
                .filter(b -> b.getVehicle() != null && vehicleIds.contains(b.getVehicle().getId()))
                .filter(b -> !"CANCELLED".equals(b.getStatus()))
                .filter(b -> b.getCreatedAt() != null && !b.getCreatedAt().isBefore(comparisonStart) && b.getCreatedAt().isBefore(queryStart))
                .collect(Collectors.toList());
        double currentRevenue = currentBookings.stream().mapToDouble(b -> b.getVehicle().getTotal()).sum();
        double previousRevenue = previousBookings.stream().mapToDouble(b -> b.getVehicle().getTotal()).sum();
        long currentCount = currentBookings.size();
        long previousCount = previousBookings.size();
        return RevenueAnalyticsResponse.builder()
                .period(selectedMonth != null && selectedYear != null ? Month.of(selectedMonth).name() + " " + selectedYear : getPeriodLabel(rangeMonths))
                .currentRevenue(currentRevenue)
                .previousRevenue(previousRevenue)
                .revenueChange(previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0)
                .currentBookings(currentCount)
                .previousBookings(previousCount)
                .bookingChange(previousCount > 0 ? ((double) (currentCount - previousCount) / previousCount) * 100 : 0)
                .averageOrderValue(currentCount > 0 ? currentRevenue / currentCount : 0)
                .revenueData(generateTimeSeriesData(currentBookings, currentStart, now, rangeMonths))
                .bookingData(generateBookingTimeSeriesData(currentBookings, currentStart, now, rangeMonths))
                .categoryBreakdown(new ArrayList<>())
                .build();
    }
}
