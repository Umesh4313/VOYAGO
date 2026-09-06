package com.voyago.config;

import com.voyago.model.*;
import com.voyago.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * Seeds MongoDB with initial demo data on application startup.
 * Only runs if the respective collections are empty (idempotent).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DestinationRepository destinationRepository;
    private final HotelRepository hotelRepository;
    private final VehicleRepository vehicleRepository;
    private final TravelOptionRepository travelOptionRepository;
    private final TouristPlaceRepository touristPlaceRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();
        seedDestinations();
        seedHotels();
        seedVehicles();
        seedTravelOptions();
        seedTouristPlaces();
        log.info("✅ DataSeeder complete.");
    }

    private void seedUsers() {
        log.info("Ensuring demo users exist...");
        ensureDemoUser("usr-demo-customer", "Demo Customer", "customer@gmail.com", "password123", "CUSTOMER", null);
        ensureDemoUser("usr-demo-admin", "Demo Admin", "admin@gmail.com", "admin123", "ADMIN", null);
        ensureDemoUser("usr-demo-hotel", "Demo Hotel Partner", "hotel@gmail.com", "hotel123", "HOTEL_PARTNER", "Voyago Demo Stays");
        ensureDemoUser("usr-demo-vehicle", "Demo Vehicle Partner", "vehicle@gmail.com", "vehicle123", "VEHICLE_PARTNER", "Voyago Demo Rides");
    }

    private void ensureDemoUser(String id, String name, String email, String password, String role, String businessName) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null) {
            return;
        }
        user = new User();
        user.setId(id);
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        user.setPartnerBusinessName(businessName);
        user.setPartnerStatus("CUSTOMER".equals(role) || "ADMIN".equals(role) ? null : "APPROVED");
        user.setActive(true);
        userRepository.save(user);
    }

    private void seedDestinations() {
        if (destinationRepository.count() > 0) return;
        log.info("Seeding destinations...");
        destinationRepository.saveAll(List.of(
            Destination.builder().id("dest-goa").name("Goa").country("India")
                .tagline("Beaches, sunsets & seafood shacks")
                .description("Golden sand coastlines, Portuguese heritage architecture, vibrant night markets, and watersports alongside serene backwaters.")
                .imageUrl("https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80")
                .isTrending(true).idealDays(4).averageBudget(15000)
                .estimatedBudget(Map.of("Budget", 8000.0, "Moderate", 15000.0, "Luxury", 35000.0))
                .rating(4.7).bestTimeToVisit("October – March")
                .highlights(List.of("Baga & Anjuna Coast", "Aguada Fort", "Dudhsagar Waterfalls", "Beach Shacks & Cuisine"))
                .build(),
            Destination.builder().id("dest-manali").name("Manali").country("India")
                .tagline("Snow peaks & pine-scented valleys")
                .description("Surrounded by towering Himalayan peaks, known for Solang Valley adventure sports, Rohtang Pass, and tranquil apple orchards.")
                .imageUrl("https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80")
                .isTrending(true).idealDays(5).averageBudget(18000)
                .estimatedBudget(Map.of("Budget", 9000.0, "Moderate", 18000.0, "Luxury", 40000.0))
                .rating(4.8).bestTimeToVisit("December – February, May – June")
                .highlights(List.of("Solang Valley Snow", "Old Manali Cafes", "Rohtang Pass", "Jogini Waterfalls"))
                .build(),
            Destination.builder().id("dest-jaipur").name("Jaipur").country("India")
                .tagline("Forts, palaces & pink-city bazaars")
                .description("The Pink City blends majestic royal fortresses like Amber Fort and Nahargarh with colorful gemstone bazaars, City Palace, and rich Rajasthani cuisine.")
                .imageUrl("https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&auto=format&fit=crop&q=80")
                .isTrending(false).idealDays(3).averageBudget(12000)
                .estimatedBudget(Map.of("Budget", 6000.0, "Moderate", 12000.0, "Luxury", 28000.0))
                .rating(4.6).bestTimeToVisit("October – March")
                .highlights(List.of("Hawa Mahal & Bazaars", "Amber Fort Sunrise", "City Palace", "Jal Mahal"))
                .build(),
            Destination.builder().id("dest-udaipur").name("Udaipur").country("India")
                .tagline("City of lakes & marble heritage")
                .description("Known as the Venice of the East, famed for fairy-tale lake palaces on Lake Pichola, intricate temples, romantic boat rides, and sunsets.")
                .imageUrl("https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=800&auto=format&fit=crop&q=80")
                .isTrending(true).idealDays(3).averageBudget(14000)
                .estimatedBudget(Map.of("Budget", 7000.0, "Moderate", 14000.0, "Luxury", 32000.0))
                .rating(4.8).bestTimeToVisit("September – March")
                .highlights(List.of("Lake Pichola Boat Cruise", "City Palace Complex", "Saheliyon Ki Bari", "Jag Mandir"))
                .build(),
            Destination.builder().id("dest-kerala").name("Kerala").country("India")
                .tagline("Emerald backwaters & misty tea hills")
                .description("God's Own Country offers serene Alleppey houseboat cruises, emerald tea plantations, Ayurvedic wellness, and spice coast heritage.")
                .imageUrl("https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80")
                .isTrending(false).idealDays(5).averageBudget(20000)
                .estimatedBudget(Map.of("Budget", 10000.0, "Moderate", 20000.0, "Luxury", 45000.0))
                .rating(4.8).bestTimeToVisit("October – February")
                .highlights(List.of("Alleppey Backwaters Houseboat", "Munnar Tea Gardens", "Kathakali Performance", "Varkala Cliff Beach"))
                .build(),
            Destination.builder().id("dest-varanasi").name("Varanasi").country("India")
                .tagline("Ancient ghats, Ganga aarti & sacred serenity")
                .description("One of the world's oldest living cities, celebrated for illuminated evening Ganga Aarti rituals, ancient alleys, and morning boat rides.")
                .imageUrl("https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop&q=80")
                .isTrending(false).idealDays(3).averageBudget(9000)
                .estimatedBudget(Map.of("Budget", 5000.0, "Moderate", 9000.0, "Luxury", 20000.0))
                .rating(4.7).bestTimeToVisit("October – March")
                .highlights(List.of("Dashashwamedh Ganga Aarti", "Sunrise Boat Ride", "Kashi Vishwanath Corridor", "Sarnath Buddhist Stupas"))
                .build()
        ));
    }

    private void seedHotels() {
        if (hotelRepository.count() > 0) return;
        log.info("Seeding hotels...");
        hotelRepository.saveAll(List.of(
            Hotel.builder().id("ht-goa-1").name("Taj Exotica Resort & Spa, Goa")
                .destinationId("dest-goa").destinationName("Goa").rating(4.9).reviewCount(3247)
                .address("Calwaddo, Benaulim, South Goa 403716")
                .city("Goa").description("A luxury seafront resort set amid 56 acres of lush grounds, featuring private beach access, multiple pools, and Jiva Spa.")
                .heroImage("https://images.unsplash.com/photo-1602002418082-dd4a6f9b1b7c?w=800&auto=format&fit=crop&q=80")
                .gallery(List.of()).amenities(List.of("Private Beach", "Infinity Pool", "Jiva Spa", "4 Restaurants", "Tennis Court", "Kids Club"))
                .partnerId("usr-hp1").priceStartsFrom(8500).status("ACTIVE")
                .rooms(List.of(
                    HotelRoom.builder().id("rm-taj-1").name("Deluxe Sea Facing Room").type("Deluxe")
                        .pricePerNight(8500).maxGuests(2).bedType("1 King Bed")
                        .amenities(List.of("Balcony with Ocean View", "Minibar", "Bathtub")).totalUnits(10).bookedUnits(3).availableCount(7)
                        .imageUrl("https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&auto=format&fit=crop&q=80").isActive(true).build(),
                    HotelRoom.builder().id("rm-taj-2").name("Pool Villa Suite").type("Suite")
                        .pricePerNight(18500).maxGuests(4).bedType("1 King + 1 Double Sofa Bed")
                        .amenities(List.of("Private Plunge Pool", "Outdoor Shower", "Concierge")).totalUnits(5).bookedUnits(1).availableCount(4)
                        .imageUrl("https://images.unsplash.com/photo-1602002418082-dd4a6f9b1b7c?w=600&auto=format&fit=crop&q=80").isActive(true).build()
                )).build(),
            Hotel.builder().id("ht-manali-1").name("Solang Valley Snow Retreat")
                .destinationId("dest-manali").destinationName("Manali").rating(4.7).reviewCount(986)
                .address("Solang Valley Rd, Manali 175131")
                .city("Manali").description("A boutique mountain chalet built of cedar wood and stone, offering panoramic views of Solang Valley snowfields.")
                .heroImage("https://images.unsplash.com/photo-1586375300773-8384e3e4916f?w=800&auto=format&fit=crop&q=80")
                .gallery(List.of()).amenities(List.of("Mountain View", "Wood Fireplace", "Ski-in Ski-out Access", "Hot Tub", "Adventure Desk"))
                .partnerId("usr-hp1").priceStartsFrom(3800).status("ACTIVE")
                .rooms(List.of(
                    HotelRoom.builder().id("rm-solang-1").name("Alpine Valley View Room").type("Standard")
                        .pricePerNight(3800).maxGuests(2).bedType("1 Queen Bed")
                        .amenities(List.of("Panoramic Mountain Window", "Electric Blanket", "Heater")).totalUnits(8).bookedUnits(2).availableCount(6)
                        .imageUrl("https://images.unsplash.com/photo-1586375300773-8384e3e4916f?w=600&auto=format&fit=crop&q=80").isActive(true).build(),
                    HotelRoom.builder().id("rm-solang-2").name("Chalet Family Suite").type("Suite")
                        .pricePerNight(6200).maxGuests(4).bedType("1 King + 2 Bunk Beds")
                        .amenities(List.of("Private Deck", "Stone Fireplace", "Ski Storage")).totalUnits(4).bookedUnits(1).availableCount(3)
                        .imageUrl("https://images.unsplash.com/photo-1572797439071-11fa76f28b0e?w=600&auto=format&fit=crop&q=80").isActive(true).build()
                )).build(),
            Hotel.builder().id("ht-jaipur-1").name("Samode Haveli Heritage Hotel")
                .destinationId("dest-jaipur").destinationName("Jaipur").rating(4.8).reviewCount(1680)
                .address("Gangapole, Jaipur 302002")
                .city("Jaipur").description("A restored 19th-century nobleman's mansion in the walled Pink City, with intricate mirror mosaics, painted archways, and rooftop views over Jaipur.")
                .heroImage("https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&auto=format&fit=crop&q=80")
                .gallery(List.of()).amenities(List.of("Heritage Architecture", "Rooftop Restaurant", "Courtyard Pool", "Elephant Rides", "Puppet Shows"))
                .partnerId("usr-hp1").priceStartsFrom(4800).status("ACTIVE")
                .rooms(List.of(
                    HotelRoom.builder().id("rm-samode-1").name("Royal Heritage Room").type("Heritage")
                        .pricePerNight(4800).maxGuests(2).bedType("1 Four-Poster King Bed")
                        .amenities(List.of("Frescoed Walls", "Jharokha Windows", "Marble Bathroom")).totalUnits(8).bookedUnits(3).availableCount(5)
                        .imageUrl("https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&auto=format&fit=crop&q=80").isActive(true).build()
                )).build(),
            Hotel.builder().id("ht-udaipur-1").name("The Leela Palace Udaipur")
                .destinationId("dest-udaipur").destinationName("Udaipur").rating(4.9).reviewCount(2104)
                .address("Lake Pichola, Udaipur 313001")
                .city("Udaipur").description("A grand palace hotel commanding uninterrupted views of Lake Pichola and the City Palace, with curated experiences of Rajasthani royalty.")
                .heroImage("https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&auto=format&fit=crop&q=80")
                .gallery(List.of()).amenities(List.of("Lake Pichola Views", "Infinity Pool", "Spa by ESPA", "Private Boat Transfer", "Royal Dining"))
                .partnerId("usr-hp1").priceStartsFrom(12000).status("ACTIVE")
                .rooms(List.of(
                    HotelRoom.builder().id("rm-leela-1").name("Lake View Luxury Room").type("Luxury")
                        .pricePerNight(12000).maxGuests(2).bedType("1 King Bed")
                        .amenities(List.of("Lake Pichola View", "Clawfoot Bathtub", "24hr Butler")).totalUnits(6).bookedUnits(2).availableCount(4)
                        .imageUrl("https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=600&auto=format&fit=crop&q=80").isActive(true).build(),
                    HotelRoom.builder().id("rm-leela-2").name("Royal Heritage Suite").type("Suite")
                        .pricePerNight(22000).maxGuests(3).bedType("1 King Bed + Day Bed")
                        .amenities(List.of("Private Rooftop Sit-out", "Jacuzzi", "Welcome Rajasthani Thali")).totalUnits(3).bookedUnits(0).availableCount(3)
                        .imageUrl("https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&auto=format&fit=crop&q=80").isActive(true).build()
                )).build(),
            Hotel.builder().id("ht-kerala-1").name("Kumarakom Lake Resort")
                .destinationId("dest-kerala").destinationName("Kerala").rating(4.8).reviewCount(1420)
                .address("Kottayam-Kumarakom Road, Kumarakom 686563")
                .city("Kerala").description("Set on the shores of Vembanad Lake, this heritage resort combines traditional Kerala architecture with modern luxury and curated backwater experiences.")
                .heroImage("https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80")
                .gallery(List.of()).amenities(List.of("Lakefront Property", "Ayurveda Spa", "Private Houseboat Jetty", "Infinity Pool", "Kerala Cooking Classes"))
                .partnerId("usr-hp1").priceStartsFrom(6500).status("ACTIVE")
                .rooms(List.of(
                    HotelRoom.builder().id("rm-kumar-1").name("Heritage Lake Villa").type("Villa")
                        .pricePerNight(6500).maxGuests(2).bedType("1 King Bed")
                        .amenities(List.of("Private Lake Deck", "Outdoor Rain Shower", "Hammock Garden")).totalUnits(6).bookedUnits(2).availableCount(4)
                        .imageUrl("https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&auto=format&fit=crop&q=80").isActive(true).build()
                )).build(),
            Hotel.builder().id("ht-varanasi-1").name("BrijRama Palace on Darbhanga Ghat")
                .destinationId("dest-varanasi").destinationName("Varanasi").rating(4.9).reviewCount(810)
                .address("Darbhanga Ghat, Dashashwamedh, Varanasi 221001")
                .city("Varanasi").description("An 18th-century palace situated right on the sacred ghats with river access via private boat, sitar music, and vegetarian dining.")
                .heroImage("https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&auto=format&fit=crop&q=80")
                .gallery(List.of()).amenities(List.of("Ghatside River Views", "Elevator to Ghat", "Live Classical Sitar", "Ganga Boat Pickups"))
                .partnerId("usr-hp1").priceStartsFrom(5200).status("ACTIVE")
                .rooms(List.of(
                    HotelRoom.builder().id("rm-brij-1").name("Ganga View Royal Chamber").type("Royal Chamber")
                        .pricePerNight(5200).maxGuests(2).bedType("1 King Bed")
                        .amenities(List.of("River Facing Jharokha", "Butler Service", "High Tea Included")).totalUnits(5).bookedUnits(1).availableCount(4)
                        .imageUrl("https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&auto=format&fit=crop&q=80").isActive(true).build()
                )).build()
        ));
    }

    private void seedVehicles() {
        if (vehicleRepository.count() > 0) return;
        log.info("Seeding vehicles...");
        vehicleRepository.saveAll(List.of(
            Vehicle.builder().id("veh-goa-1").name("Royal Enfield Classic 350").type("BIKE")
                .category("Cruiser Motorcycle").destinationId("dest-goa").dailyRate(750).transmission("Manual")
                .seats(2).fuelType("Petrol").rating(4.8)
                .imageUrl("https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80")
                .features(List.of("2 Helmets Included", "Phone Mount & Charger", "Roadside Assist"))
                .isAvailable(true).rentalStatus("AVAILABLE").partnerId("usr-vp1")
                .registrationNumber("GA-01-E-7821").modelYear(2024).build(),
            Vehicle.builder().id("veh-goa-2").name("Honda Activa 6G Scooter").type("SCOOTER")
                .category("Automatic Scooter").destinationId("dest-goa").dailyRate(450).transmission("Automatic")
                .seats(2).fuelType("Petrol").rating(4.7)
                .imageUrl("https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format&fit=crop&q=80")
                .features(List.of("Full Tank on Pickup", "Underseat Storage", "2 Helmets"))
                .isAvailable(true).rentalStatus("AVAILABLE").partnerId("usr-vp1")
                .registrationNumber("GA-01-A-4512").modelYear(2023).build(),
            Vehicle.builder().id("veh-goa-3").name("Mahindra Thar 4x4 Convertible").type("CAR")
                .category("Open-top Adventure 4x4").destinationId("dest-goa").dailyRate(3200).transmission("Manual")
                .seats(4).fuelType("Diesel").rating(4.9)
                .imageUrl("https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80")
                .features(List.of("Removable Hardtop", "Bluetooth Audio", "All-Terrain Wheels"))
                .isAvailable(true).rentalStatus("AVAILABLE").partnerId("usr-vp1")
                .registrationNumber("GA-01-D-9023").modelYear(2024).build(),
            Vehicle.builder().id("veh-goa-4").name("Maruti Swift Dzire AC").type("CAR")
                .category("Comfort Sedan").destinationId("dest-goa").dailyRate(1800).transmission("Manual")
                .seats(5).fuelType("Petrol").rating(4.6)
                .imageUrl("https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80")
                .features(List.of("Chill Air Conditioning", "Spacious Boot for Bags", "Unlimited Kilometers"))
                .isAvailable(true).rentalStatus("AVAILABLE").partnerId("usr-vp1")
                .registrationNumber("GA-01-S-3344").modelYear(2023).build(),
            Vehicle.builder().id("veh-manali-1").name("Royal Enfield Himalayan 411").type("BIKE")
                .category("High-Altitude Dual Sport").destinationId("dest-manali").dailyRate(1200).transmission("Manual")
                .seats(2).fuelType("Petrol").rating(4.9)
                .imageUrl("https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80")
                .features(List.of("Pannier luggage racks", "Cold-weather engine kit", "2 DOT Helmets"))
                .isAvailable(true).rentalStatus("AVAILABLE").partnerId("usr-vp1")
                .registrationNumber("HP-01-H-5511").modelYear(2024).build(),
            Vehicle.builder().id("veh-manali-2").name("Hyundai Creta SX").type("CAR")
                .category("Mid-size Mountain SUV").destinationId("dest-manali").dailyRate(2800).transmission("Automatic")
                .seats(5).fuelType("Diesel").rating(4.8)
                .imageUrl("https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80")
                .features(List.of("Panoramic Sunroof", "Hill Start Assist", "Heated Cabin"))
                .isAvailable(true).rentalStatus("AVAILABLE").partnerId("usr-vp1")
                .registrationNumber("HP-01-C-7723").modelYear(2024).build(),
            Vehicle.builder().id("veh-jaipur-1").name("Honda City Automatic").type("CAR")
                .category("Executive Sedan").destinationId("dest-jaipur").dailyRate(2100).transmission("Automatic")
                .seats(5).fuelType("Petrol").rating(4.8)
                .imageUrl("https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80")
                .features(List.of("Rear AC vents", "Apple CarPlay / Android Auto", "Fastag toll ready"))
                .isAvailable(true).rentalStatus("AVAILABLE").partnerId("usr-vp1")
                .registrationNumber("RJ-14-C-4421").modelYear(2024).build(),
            Vehicle.builder().id("veh-jaipur-2").name("Vespa Elegante 150").type("SCOOTER")
                .category("Retro Italian Scooter").destinationId("dest-jaipur").dailyRate(600).transmission("Automatic")
                .seats(2).fuelType("Petrol").rating(4.6)
                .imageUrl("https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format&fit=crop&q=80")
                .features(List.of("Great for Old City alleys", "Leather saddle", "2 vintage helmets"))
                .isAvailable(true).rentalStatus("AVAILABLE").partnerId("usr-vp1")
                .registrationNumber("RJ-14-V-8832").modelYear(2023).build(),
            Vehicle.builder().id("veh-udaipur-1").name("Tata Nexon EV Max").type("CAR")
                .category("Eco Electric Compact SUV").destinationId("dest-udaipur").dailyRate(2400).transmission("Automatic")
                .seats(5).fuelType("Electric").rating(4.8)
                .imageUrl("https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80")
                .features(List.of("Zero Emissions", "Free hotel charging pass", "Silent lakeside driving"))
                .isAvailable(true).rentalStatus("AVAILABLE").partnerId("usr-vp1")
                .registrationNumber("RJ-27-E-1122").modelYear(2024).build()
        ));
    }

    private void seedTravelOptions() {
        if (travelOptionRepository.count() > 0) return;
        log.info("Seeding travel options...");
        travelOptionRepository.saveAll(List.of(
            TravelOption.builder().id("tr-goa-1").mode("FLIGHT").operator("IndiGo 6E-241").code("6E-241")
                .fromCity("Delhi / Mumbai").toCity("Goa (GOX / Dabolim)").departureTime("06:15 AM").arrivalTime("08:45 AM")
                .duration("2h 30m").pricePerPerson(4250).availableSeats(18).stops("Non-stop").rating(4.6)
                .tags(List.of("Fastest", "Best Rated")).occupiedSeats(List.of()).build(),
            TravelOption.builder().id("tr-goa-2").mode("FLIGHT").operator("Air India AI-843").code("AI-843")
                .fromCity("Delhi / Mumbai").toCity("Goa (GOI)").departureTime("11:30 AM").arrivalTime("02:00 PM")
                .duration("2h 30m").pricePerPerson(5100).availableSeats(12).stops("Non-stop").rating(4.3)
                .tags(List.of("Includes Meal", "Baggage 25kg")).occupiedSeats(List.of()).build(),
            TravelOption.builder().id("tr-goa-3").mode("TRAIN").operator("Goa Superfast Express (12780)").code("12780")
                .fromCity("Central Station").toCity("Madgaon Junction (MAO)").departureTime("03:15 PM").arrivalTime("06:45 AM")
                .duration("15h 30m").pricePerPerson(1850).availableSeats(26).stops("4 stops (AC 3-Tier)").rating(4.4)
                .tags(List.of("Overnight Sleeper", "Scenic Route")).occupiedSeats(List.of()).build(),
            TravelOption.builder().id("tr-goa-4").mode("BUS").operator("Zingbus Premium Volvo Multi-Axle AC").code("ZB-409")
                .fromCity("City Terminus").toCity("Panaji Bus Stand").departureTime("07:30 PM").arrivalTime("08:30 AM")
                .duration("13h 00m").pricePerPerson(1290).availableSeats(14).stops("Dinner halt included").rating(4.5)
                .tags(List.of("Economy Pick", "Reclining Sleeper")).occupiedSeats(List.of()).build(),
            TravelOption.builder().id("tr-manali-1").mode("BUS").operator("HPTDC Luxury Volvo Semi-Sleeper AC").code("HP-901")
                .fromCity("ISBT Terminus").toCity("Manali Mall Road").departureTime("06:30 PM").arrivalTime("08:00 AM")
                .duration("13h 30m").pricePerPerson(1650).availableSeats(22).stops("Direct Over-the-Hills").rating(4.6)
                .tags(List.of("Top Pick", "Blanket & WiFi")).occupiedSeats(List.of()).build(),
            TravelOption.builder().id("tr-manali-2").mode("FLIGHT").operator("SpiceJet SG-123").code("SG-123")
                .fromCity("Delhi (DEL)").toCity("Bhuntar (KUU)").departureTime("09:00 AM").arrivalTime("10:05 AM")
                .duration("1h 05m").pricePerPerson(5800).availableSeats(10).stops("Non-stop").rating(4.5)
                .tags(List.of("Mountain Approach", "Scenic Landing")).occupiedSeats(List.of()).build(),
            TravelOption.builder().id("tr-jaipur-1").mode("TRAIN").operator("Shatabdi Express 12015").code("12015")
                .fromCity("New Delhi").toCity("Jaipur Junction").departureTime("06:00 AM").arrivalTime("10:35 AM")
                .duration("4h 35m").pricePerPerson(680).availableSeats(40).stops("CC Class / Non-stop").rating(4.7)
                .tags(List.of("Fastest Train", "Breakfast Included")).occupiedSeats(List.of()).build(),
            TravelOption.builder().id("tr-udaipur-1").mode("FLIGHT").operator("IndiGo 6E-752").code("6E-752")
                .fromCity("Delhi / Mumbai").toCity("Udaipur (UDR)").departureTime("07:45 AM").arrivalTime("09:15 AM")
                .duration("1h 30m").pricePerPerson(3800).availableSeats(16).stops("Non-stop").rating(4.7)
                .tags(List.of("Best Value", "On-time")).occupiedSeats(List.of()).build(),
            TravelOption.builder().id("tr-kerala-1").mode("FLIGHT").operator("Air India AI-525").code("AI-525")
                .fromCity("Mumbai (BOM)").toCity("Kochi (COK)").departureTime("08:30 AM").arrivalTime("10:45 AM")
                .duration("2h 15m").pricePerPerson(4600).availableSeats(14).stops("Non-stop").rating(4.5)
                .tags(List.of("Full Service", "In-flight Meal")).occupiedSeats(List.of()).build(),
            TravelOption.builder().id("tr-varanasi-1").mode("TRAIN").operator("Vande Bharat Express 22436").code("22436")
                .fromCity("New Delhi").toCity("Varanasi Junction").departureTime("06:00 AM").arrivalTime("02:00 PM")
                .duration("8h 00m").pricePerPerson(1450).availableSeats(30).stops("Executive Chair Car").rating(4.8)
                .tags(List.of("Semi High Speed", "Breakfast & Lunch")).occupiedSeats(List.of()).build()
        ));
    }

    private void seedTouristPlaces() {
        if (touristPlaceRepository.count() > 0) return;
        log.info("Seeding tourist places...");
        touristPlaceRepository.saveAll(List.of(
            // Goa
            TouristPlace.builder().id("plc-goa-1").destinationId("dest-goa").name("Aguada Fort & Lighthouse")
                .category("Heritage").rating(4.6).visitDuration("2 hours").entryFee(50)
                .description("17th-century Portuguese fort on a headland with panoramic Arabian Sea views and an intact lighthouse.")
                .imageUrl("https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80")
                .recommendedTime("Morning").highlights(List.of("Lighthouse Tower", "Sea Views", "Ramparts Walk")).build(),
            TouristPlace.builder().id("plc-goa-2").destinationId("dest-goa").name("Baga Beach")
                .category("Beach").rating(4.5).visitDuration("Half day").entryFee(0)
                .description("Goa's most popular stretch of golden sand, famed for water sports, beach shacks, and Tito's nightlife strip.")
                .imageUrl("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80")
                .recommendedTime("Sunset").highlights(List.of("Water Sports", "Beach Shacks", "Sunset Views")).build(),
            TouristPlace.builder().id("plc-goa-3").destinationId("dest-goa").name("Dudhsagar Waterfalls")
                .category("Nature").rating(4.8).visitDuration("4 hours").entryFee(400)
                .description("One of India's tallest waterfalls at 310m, cascading through dense jungle on the Goa-Karnataka border.")
                .imageUrl("https://images.unsplash.com/photo-1544550285-f813152fb2fd?w=600&auto=format&fit=crop&q=80")
                .recommendedTime("Morning").highlights(List.of("Waterfall Swim", "Jungle Trek", "Jeep Safari")).build(),
            // Manali
            TouristPlace.builder().id("plc-manali-1").destinationId("dest-manali").name("Solang Valley")
                .category("Adventure").rating(4.9).visitDuration("Full day").entryFee(200)
                .description("A spectacular glacier valley offering skiing in winter and paragliding, zorbing and camping in summer.")
                .imageUrl("https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&auto=format&fit=crop&q=80")
                .recommendedTime("Morning").highlights(List.of("Snow Activities", "Paragliding", "Mountain Views")).build(),
            TouristPlace.builder().id("plc-manali-2").destinationId("dest-manali").name("Rohtang Pass")
                .category("Nature").rating(4.7).visitDuration("Full day").entryFee(500)
                .description("A legendary mountain pass at 3,978m offering breathtaking views of glaciers, peaks, and snowfields.")
                .imageUrl("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&auto=format&fit=crop&q=80")
                .recommendedTime("Early Morning").highlights(List.of("Snow Experience", "Glacier Views", "Mountain Photography")).build(),
            // Jaipur
            TouristPlace.builder().id("plc-jaipur-1").destinationId("dest-jaipur").name("Amber Fort")
                .category("Heritage").rating(4.8).visitDuration("3 hours").entryFee(200)
                .description("Magnificent 16th-century Rajput fort overlooking Maota Lake, famous for intricate mirror mosaics and elephant rides.")
                .imageUrl("https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&auto=format&fit=crop&q=80")
                .recommendedTime("Morning").highlights(List.of("Sheesh Mahal Mirror Palace", "Elephant Rides", "Lake Views")).build(),
            TouristPlace.builder().id("plc-jaipur-2").destinationId("dest-jaipur").name("Hawa Mahal")
                .category("Heritage").rating(4.6).visitDuration("1 hour").entryFee(50)
                .description("The iconic Palace of Winds with 953 small windows designed for royal ladies to observe street life unseen.")
                .imageUrl("https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&auto=format&fit=crop&q=80")
                .recommendedTime("Sunrise").highlights(List.of("953 Jharokha Windows", "Pink City Views", "Photography")).build(),
            // Udaipur
            TouristPlace.builder().id("plc-udaipur-1").destinationId("dest-udaipur").name("Lake Pichola Boat Cruise")
                .category("Nature").rating(4.9).visitDuration("1.5 hours").entryFee(400)
                .description("A twilight boat cruise on the shimmering lake passing Jag Mandir and the City Palace reflected in still waters.")
                .imageUrl("https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=600&auto=format&fit=crop&q=80")
                .recommendedTime("Sunset").highlights(List.of("City Palace Reflection", "Jag Mandir Island", "Sunset Views")).build(),
            // Kerala
            TouristPlace.builder().id("plc-kerala-1").destinationId("dest-kerala").name("Alleppey Houseboat Cruise")
                .category("Nature").rating(4.9).visitDuration("Overnight").entryFee(8000)
                .description("An overnight cruise through Kerala's legendary network of tranquil backwaters on a traditional Kettuvallam rice boat.")
                .imageUrl("https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&auto=format&fit=crop&q=80")
                .recommendedTime("All Day").highlights(List.of("Backwater Villages", "Coir Making", "Sunset Cruise", "Kerala Cuisine")).build(),
            // Varanasi
            TouristPlace.builder().id("plc-varanasi-1").destinationId("dest-varanasi").name("Dashashwamedh Ghat Aarti")
                .category("Religious").rating(4.9).visitDuration("2 hours").entryFee(0)
                .description("The spectacular nightly Ganga Aarti ceremony at Varanasi's most sacred ghat, performed by rows of priests with fire lamps.")
                .imageUrl("https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600&auto=format&fit=crop&q=80")
                .recommendedTime("Evening").highlights(List.of("Fire Lamp Ceremony", "Priests Chanting", "Riverside Atmosphere")).build()
        ));
    }
}
