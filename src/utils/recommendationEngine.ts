import { TravelOption, Hotel, Vehicle, TouristPlace, TripDraft } from '../types';

export interface ScoredItem<T> {
  item: T;
  score: number; // 0 - 100
  matchBadges: string[];
}

/**
 * Deterministic Rule-based scoring engine for Travel Options (Flights/Trains/Buses)
 */
export function scoreTravelOptions(
  options: TravelOption[],
  draft: TripDraft
): ScoredItem<TravelOption>[] {
  return options.map((opt) => {
    let score = 70; // baseline score
    const badges: string[] = [];

    // 1. Budget fit scoring
    const totalTransportCost = opt.pricePerPerson * draft.travelersCount;
    if (draft.budgetCategory === 'Budget') {
      if (opt.mode === 'BUS' || opt.mode === 'TRAIN') {
        score += 18;
        badges.push('Budget-Friendly Choice');
      } else if (opt.pricePerPerson < 4000) {
        score += 8;
        badges.push('Economy Flight');
      }
    } else if (draft.budgetCategory === 'Luxury') {
      if (opt.mode === 'FLIGHT') {
        score += 18;
        badges.push('Fast & Premium Travel');
      }
    } else {
      // Moderate
      if (opt.mode === 'TRAIN' || opt.pricePerPerson < 5000) {
        score += 12;
        badges.push('Balanced Value');
      }
    }

    // 2. Duration & convenience
    if (opt.duration.includes('1h') || opt.duration.includes('2h')) {
      score += 10;
      badges.push('Quickest Journey');
    }

    // 3. User rating influence
    if (opt.rating >= 4.7) {
      score += 6;
      badges.push('Highest Rated');
    }

    // 4. Seat availability safety
    if (opt.availableSeats >= draft.travelersCount + 5) {
      badges.push('Guaranteed Seats');
    }

    const finalScore = Math.min(99, Math.max(50, score));
    return {
      item: opt,
      score: finalScore,
      matchBadges: badges.slice(0, 2),
    };
  }).sort((a, b) => b.score - a.score);
}

/**
 * Deterministic Rule-based scoring engine for Hotels
 */
export function scoreHotels(
  hotels: Hotel[],
  draft: TripDraft
): ScoredItem<Hotel>[] {
  return hotels.map((hotel) => {
    let score = 72;
    const badges: string[] = [];

    // 1. Budget Category matching
    if (draft.budgetCategory === 'Luxury') {
      if (hotel.priceStartsFrom >= 6000) {
        score += 18;
        badges.push('Luxury Stay Experience');
      }
    } else if (draft.budgetCategory === 'Budget') {
      if (hotel.priceStartsFrom <= 5000) {
        score += 18;
        badges.push('Best Value for Budget');
      }
    } else {
      // Moderate
      if (hotel.priceStartsFrom >= 4000 && hotel.priceStartsFrom <= 7000) {
        score += 14;
        badges.push('Ideal Price-Comfort Ratio');
      }
    }

    // 2. Preference tags matching
    if (draft.preferences.includes('Relaxation') && hotel.amenities.some(a => a.toLowerCase().includes('spa') || a.toLowerCase().includes('pool'))) {
      score += 8;
      badges.push('Relaxation & Spa Amenities');
    }
    if (draft.preferences.includes('Beaches') && hotel.amenities.some(a => a.toLowerCase().includes('beach') || a.toLowerCase().includes('sea'))) {
      score += 8;
      badges.push('Direct Beach Access');
    }
    if (draft.preferences.includes('Heritage') && (hotel.description.toLowerCase().includes('palace') || hotel.description.toLowerCase().includes('heritage') || hotel.description.toLowerCase().includes('castle'))) {
      score += 10;
      badges.push('Rich Heritage Architecture');
    }

    // 3. Traveler count suitability
    const hasFamilyRoom = hotel.rooms.some(r => r.maxGuests >= draft.travelersCount);
    if (hasFamilyRoom && draft.travelersCount >= 3) {
      score += 6;
      badges.push('Spacious Family Capacity');
    }

    const finalScore = Math.min(99, Math.max(55, score));
    return {
      item: hotel,
      score: finalScore,
      matchBadges: badges.slice(0, 2),
    };
  }).sort((a, b) => b.score - a.score);
}

/**
 * Deterministic Rule-based scoring engine for Vehicles
 */
export function scoreVehicles(
  vehicles: Vehicle[],
  draft: TripDraft
): ScoredItem<Vehicle>[] {
  return vehicles.map((veh) => {
    let score = 70;
    const badges: string[] = [];

    // Capacity checking
    if (veh.seats < draft.travelersCount) {
      score -= 30; // Cannot fit everyone in 1 vehicle
    } else {
      score += 10;
      if (draft.travelersCount > 2 && veh.type === 'CAR') {
        score += 15;
        badges.push('Sized for Group (' + veh.seats + ' seats)');
      }
    }

    if (draft.travelersCount <= 2 && (veh.type === 'BIKE' || veh.type === 'SCOOTER')) {
      score += 15;
      badges.push('Popular for Couples & Solo');
    }

    if (draft.preferences.includes('Adventure') && (veh.name.includes('Enfield') || veh.name.includes('Thar'))) {
      score += 12;
      badges.push('Adventure Certified');
    }

    if (veh.dailyRate <= 800) {
      badges.push('High Economy');
    }

    const finalScore = Math.min(99, Math.max(40, score));
    return {
      item: veh,
      score: finalScore,
      matchBadges: badges.slice(0, 2),
    };
  }).sort((a, b) => b.score - a.score);
}

/**
 * Deterministic Rule-based scoring engine for Tourist Attractions
 */
export function scoreTouristPlaces(
  places: TouristPlace[],
  draft: TripDraft
): ScoredItem<TouristPlace>[] {
  return places.map((place) => {
    let score = 75;
    const badges: string[] = [];

    // Preference correlation
    if (draft.preferences.includes('Adventure') && place.category === 'Adventure') {
      score += 18;
      badges.push('Matches Adventure Interest');
    }
    if (draft.preferences.includes('Heritage') && place.category === 'Heritage') {
      score += 18;
      badges.push('Top Historic Landmark');
    }
    if (draft.preferences.includes('Relaxation') && place.category === 'Nature') {
      score += 15;
      badges.push('Serene Scenic Spot');
    }
    if (draft.preferences.includes('Nightlife') && (place.category === 'Nightlife' || place.category === 'Beach')) {
      score += 16;
      badges.push('Vibrant Evening Experience');
    }

    if (place.rating >= 4.8) {
      score += 8;
      badges.push('Must-Visit (4.8+ Stars)');
    }

    const finalScore = Math.min(99, Math.max(60, score));
    return {
      item: place,
      score: finalScore,
      matchBadges: badges.slice(0, 2),
    };
  }).sort((a, b) => b.score - a.score);
}
