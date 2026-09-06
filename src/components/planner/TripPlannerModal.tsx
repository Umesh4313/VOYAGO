import React, { useState, useMemo } from 'react';
import {
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Plane,
  Train,
  Bus,
  Hotel as HotelIcon,
  Car,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  CreditCard,
  QrCode,
  Building,
  Printer,
  Compass,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { TravelMode, PaymentMethod, Booking } from '../../types';
import { VisualSeatPicker } from './VisualSeatPicker';
import {
  scoreTravelOptions,
  scoreHotels,
  scoreVehicles,
  scoreTouristPlaces,
} from '../../utils/recommendationEngine';

export const TripPlannerModal: React.FC = () => {
  const {
    isPlannerOpen,
    setIsPlannerOpen,
    plannerStep,
    setPlannerStep,
    currentDraft,
    updateDraft,
    destinations,
    travelOptions,
    hotels,
    vehicles,
    touristPlaces,
    processPaymentAndConfirm,
    setActiveView,
  } = useApp();

  // Local UI states
  const [selectedTransportMode, setSelectedTransportMode] = useState<'ALL' | TravelMode>('ALL');
  const [selectedVehicleType, setSelectedVehicleType] = useState<'ALL' | 'CAR' | 'BIKE' | 'SCOOTER'>('ALL');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [simulateSoldOut, setSimulateSoldOut] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [transportClass, setTransportClass] = useState<'AC' | 'NON_AC'>('AC');
  const [roomCondition, setRoomCondition] = useState<'AC' | 'NON_AC'>('AC');

  // Available options for current destination
  const destTravelOptions = useMemo(() => {
    return travelOptions.filter((t) => {
      if (t.destinationId) return t.destinationId === currentDraft.destinationId;
      if (currentDraft.destinationName.toLowerCase() === 'goa') return t.id.includes('goa');
      if (currentDraft.destinationName.toLowerCase() === 'manali') return t.id.includes('manali');
      if (currentDraft.destinationName.toLowerCase() === 'jaipur') return t.id.includes('jaipur');
      if (currentDraft.destinationName.toLowerCase() === 'udaipur') return t.id.includes('udaipur');
      if (currentDraft.destinationName.toLowerCase() === 'kerala') return t.id.includes('kerala');
      if (currentDraft.destinationName.toLowerCase() === 'varanasi') return t.id.includes('varanasi');
      return true;
    });
  }, [travelOptions, currentDraft.destinationId, currentDraft.destinationName]);

  const destHotels = useMemo(() => {
    return hotels.filter((h) => h.destinationId === currentDraft.destinationId);
  }, [hotels, currentDraft.destinationId]);

  const destVehicles = useMemo(() => {
    return vehicles.filter((v) => v.destinationId === currentDraft.destinationId);
  }, [vehicles, currentDraft.destinationId]);

  const destPlaces = useMemo(() => {
    return touristPlaces.filter((p) => p.destinationId === currentDraft.destinationId);
  }, [touristPlaces, currentDraft.destinationId]);

  // Recommendation engine rule-based scorings
  const scoredTransport = useMemo(() => {
    return scoreTravelOptions(destTravelOptions, currentDraft);
  }, [destTravelOptions, currentDraft]);

  const scoredHotelsList = useMemo(() => {
    return scoreHotels(destHotels, currentDraft);
  }, [destHotels, currentDraft]);

  const scoredVehiclesList = useMemo(() => {
    return scoreVehicles(destVehicles, currentDraft);
  }, [destVehicles, currentDraft]);

  const scoredPlacesList = useMemo(() => {
    return scoreTouristPlaces(destPlaces, currentDraft);
  }, [destPlaces, currentDraft]);

  if (!isPlannerOpen) return null;

  // Price calculations
  const transportCost = (currentDraft.selectedTransport?.pricePerPerson || 0) * currentDraft.travelersCount;
  const hotelCost = (currentDraft.selectedRoom?.pricePerNight || 0) * currentDraft.durationDays;
  const vehicleCost = !currentDraft.skipVehicle && currentDraft.selectedVehicle
    ? currentDraft.selectedVehicle.dailyRate * currentDraft.durationDays
    : 0;
  const subtotal = transportCost + hotelCost + vehicleCost;
  const taxes = Math.round(subtotal * 0.05);
  const totalTripCost = subtotal + taxes;

  const handleNextStep = () => {
    // Validation
    if (plannerStep === 1) {
      setPlannerStep(2);
    } else if (plannerStep === 2) {
      if (!currentDraft.selectedTransport) {
        alert('Please select a travel option (flight, train, or bus) to continue.');
        return;
      }
      if (!currentDraft.selectedSeats || currentDraft.selectedSeats.length < currentDraft.travelersCount) {
        alert(`Please select ${currentDraft.travelersCount} seat${currentDraft.travelersCount > 1 ? 's' : ''} in the visual seat selector to continue.`);
        return;
      }
      setPlannerStep(3);
    } else if (plannerStep === 3) {
      if (!currentDraft.selectedHotel || !currentDraft.selectedRoom) {
        alert('Please select a hotel and room type to continue.');
        return;
      }
      setPlannerStep(4);
    } else if (plannerStep === 4) {
      if (!currentDraft.skipVehicle && !currentDraft.selectedVehicle) {
        alert('Please select a rental vehicle or click "Skip Vehicle Rental".');
        return;
      }
      setPlannerStep(5);
    } else if (plannerStep === 5) {
      setPlannerStep(6);
    } else if (plannerStep === 6) {
      setPlannerStep(7);
    }
  };

  const handlePayNow = async () => {
    setIsProcessingPayment(true);
    setPaymentError(null);

    // Simulate sold-out room if toggle checked for QA testing
    if (simulateSoldOut) {
      setTimeout(() => {
        setIsProcessingPayment(false);
        setPaymentError(
          `Availability Check Failed: The selected room at ${currentDraft.selectedHotel?.name} is currently sold out. Please select an alternate room or hotel.`
        );
      }, 900);
      return;
    }

    const result = await processPaymentAndConfirm(paymentMethod, simulateFailure);
    setIsProcessingPayment(false);

    if (result.success && result.booking) {
      setConfirmedBooking(result.booking);
      setPlannerStep(8);
      // Confetti burst
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.log('Confetti triggered', err);
      }
    } else {
      setPaymentError(result.error || 'Payment transaction failed. Please retry.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-[#FAF8F5] text-stone-900 rounded-3xl shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden border border-stone-200"
        id="voyago-trip-planner-container"
      >
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-white text-stone-900 flex items-center justify-between border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#9D3373]/10 border border-[#9D3373]/20 text-[#9D3373] flex items-center justify-center">
              <Plane className="w-4 h-4 transform -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-display text-xl font-light italic">
                  {currentDraft.destinationName} <span className="not-italic font-normal">Trip Planner</span>
                </h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#9D3373]/10 border border-[#9D3373]/20 text-[#9D3373] font-medium uppercase tracking-wider">
                  {currentDraft.durationDays} Days • {currentDraft.travelersCount} Travelers
                </span>
              </div>
              <p className="text-xs text-stone-500 font-light">
                Coordinated end-to-end booking • Step {plannerStep} of 7
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPlannerOpen(false)}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
            id="planner-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progression Ribbon */}
        {plannerStep < 8 && (
          <div className="bg-white/95 border-b border-stone-200 px-6 py-2.5 overflow-x-auto shrink-0 flex items-center justify-between text-xs font-semibold text-stone-500">
            <div className="flex items-center gap-2 sm:gap-4 min-w-max">
              {[
                { s: 1, label: 'Trip Inputs' },
                { s: 2, label: '1. Transport' },
                { s: 3, label: '2. Hotel & Stay' },
                { s: 4, label: '3. Rides (Optional)' },
                { s: 5, label: '4. Attractions' },
                { s: 6, label: '5. Summary' },
                { s: 7, label: '6. Payment' },
              ].map((stepItem) => {
                const isPassed = stepItem.s < plannerStep;
                const isCurrent = stepItem.s === plannerStep;
                return (
                  <button
                    key={stepItem.s}
                    onClick={() => {
                      if (stepItem.s < plannerStep) setPlannerStep(stepItem.s);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] uppercase tracking-wider transition-all ${
                      isCurrent
                        ? 'bg-[#9D3373] text-white font-bold shadow-xs'
                        : isPassed
                        ? 'bg-[#9D3373]/10 border border-[#9D3373]/20 text-[#9D3373] cursor-pointer'
                        : 'text-stone-400 cursor-default'
                    }`}
                  >
                    <span>{isPassed ? '✓' : stepItem.s}</span>
                    <span>{stepItem.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-stone-200">
              <span className="text-[11px] text-stone-500 uppercase tracking-wider">Est. Total:</span>
              <span className="font-serif-display text-base font-light italic text-[#9D3373] font-medium">
                ₹{totalTripCost.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Modal Main Content Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#FAF8F5]">
          
          {/* STEP 1: TRIP PARAMETERS */}
          {plannerStep === 1 && (
            <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in">
              <div>
                <h2 className="font-serif-display text-3xl font-light italic text-stone-900 mb-2">
                  Configure your <span className="not-italic font-normal">trip parameters</span>
                </h2>
                <p className="text-stone-500 text-sm font-light">
                  Specify destination, dates, travelers, and style. We will rank flight, stay, and attraction options using our rule-based scoring algorithm.
                </p>
              </div>

              {/* Destination picker */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500">
                  Select Destination
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {destinations.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        updateDraft({
                          destinationId: d.id,
                          destinationName: d.name,
                          selectedTransport: undefined,
                          selectedHotel: undefined,
                          selectedRoom: undefined,
                          selectedVehicle: undefined,
                          selectedPlaces: [],
                        });
                      }}
                      className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                        currentDraft.destinationId === d.id
                          ? 'border-[#9D3373] bg-[#9D3373]/10 ring-1 ring-[#9D3373]/40'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <img
                        src={d.imageUrl}
                        alt={d.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-serif-display text-sm font-light text-stone-900">{d.name}</p>
                        <p className="text-[11px] text-stone-500">{d.idealDays} days recommended</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates & Travelers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    value={currentDraft.departureDate}
                    onChange={(e) => updateDraft({ departureDate: e.target.value })}
                    className="w-full font-medium text-stone-900 text-sm outline-none bg-transparent"
                  />
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1">
                    Return Date
                  </label>
                  <input
                    type="date"
                    value={currentDraft.returnDate}
                    onChange={(e) => updateDraft({ returnDate: e.target.value })}
                    className="w-full font-medium text-stone-900 text-sm outline-none bg-transparent"
                  />
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1">
                    Travelers Count
                  </label>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        updateDraft({ travelersCount: Math.max(1, currentDraft.travelersCount - 1) })
                      }
                      className="w-8 h-8 rounded-full border border-stone-200 font-bold hover:border-[#9D3373] hover:text-[#9D3373] flex items-center justify-center text-stone-700 transition-colors"
                    >
                      -
                    </button>
                    <span className="font-serif-display text-lg font-light text-stone-900">
                      {currentDraft.travelersCount}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateDraft({ travelersCount: Math.min(8, currentDraft.travelersCount + 1) })
                      }
                      className="w-8 h-8 rounded-full border border-stone-200 font-bold hover:border-[#9D3373] hover:text-[#9D3373] flex items-center justify-center text-stone-700 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Budget & Preferences */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                    Trip Budget Category
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['Budget', 'Moderate', 'Luxury'] as const).map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => updateDraft({ budgetCategory: b })}
                        className={`py-3 px-4 rounded-xl text-center border text-xs font-bold uppercase tracking-wider transition-all ${
                          currentDraft.budgetCategory === b
                            ? 'border-[#9D3373] bg-[#9D3373]/10 text-[#9D3373]'
                            : 'border-stone-200 text-stone-600 hover:border-stone-300 bg-stone-50/50'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                    Travel Preferences (Select Interests)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Relaxation', 'Beaches', 'Adventure', 'Heritage', 'Nature', 'Nightlife'].map(
                      (pref) => {
                        const isSelected = currentDraft.preferences.includes(pref);
                        return (
                          <button
                            key={pref}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                updateDraft({
                                  preferences: currentDraft.preferences.filter((p) => p !== pref),
                                });
                              } else {
                                updateDraft({
                                  preferences: [...currentDraft.preferences, pref],
                                });
                              }
                            }}
                            className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-all ${
                              isSelected
                                ? 'bg-[#9D3373] text-white font-bold shadow-xs'
                                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {pref}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: TRANSPORT SELECTION */}
          {plannerStep === 2 && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif-display text-3xl font-light italic text-stone-900">
                    Select Transportation to {currentDraft.destinationName}
                  </h2>
                  <p className="text-stone-500 text-sm font-light">
                    Flights, trains, and buses ranked by rule-based match score for {currentDraft.travelersCount} travelers.
                  </p>
                </div>

                {/* Filter buttons */}
                <div className="flex items-center gap-1.5 bg-white border border-stone-200 p-1 rounded-xl self-start shadow-xs">
                  {(['ALL', 'FLIGHT', 'TRAIN', 'BUS'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setSelectedTransportMode(mode)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedTransportMode === mode
                          ? 'bg-[#9D3373] text-white shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scored Options List */}
              <div className="space-y-4">
                {scoredTransport
                  .filter((item) => selectedTransportMode === 'ALL' || item.item.mode === selectedTransportMode)
                  .map(({ item, score, matchBadges }) => {
                    const isSelected = currentDraft.selectedTransport?.id === item.id;
                    const totalCostForGroup = item.pricePerPerson * currentDraft.travelersCount;

                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-2xl p-5 border transition-all shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                          isSelected
                            ? 'border-[#9D3373] ring-1 ring-[#9D3373]/40 bg-[#9D3373]/5'
                            : 'border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border bg-[#9D3373]/10 text-[#9D3373] border-[#9D3373]/20">
                            {item.mode === 'FLIGHT' && <Plane className="w-6 h-6" />}
                            {item.mode === 'TRAIN' && <Train className="w-6 h-6" />}
                            {item.mode === 'BUS' && <Bus className="w-6 h-6" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-serif-display text-lg font-light text-stone-900">
                                {item.operator}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 font-mono text-stone-600">
                                {item.code}
                              </span>
                              {score >= 85 && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#9D3373]/10 border border-[#9D3373]/20 text-[#9D3373] font-bold flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-[#9D3373]" />
                                  {score}% Match
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-stone-500 mb-2">
                              <span>Dep: <strong className="text-stone-800">{item.departureTime}</strong></span>
                              <span>•</span>
                              <span>Arr: <strong className="text-stone-800">{item.arrivalTime}</strong></span>
                              <span>•</span>
                              <span>Duration: <strong className="text-stone-700">{item.duration}</strong> ({item.stops})</span>
                            </div>

                            <div className="flex items-center gap-1.5 flex-wrap">
                              {matchBadges.map((b, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] bg-stone-100 border border-stone-200 text-stone-700 font-medium px-2 py-0.5 rounded-md"
                                >
                                  {b}
                                </span>
                              ))}
                              <span className="text-[10px] text-stone-500">
                                {item.availableSeats} seats remaining
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:flex-col md:items-end w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-stone-200">
                          <div className="md:text-right">
                            <span className="text-[10px] uppercase tracking-wider text-stone-500">Total ({currentDraft.travelersCount} pax)</span>
                            <p className="font-serif-display text-xl font-light italic text-[#9D3373] font-medium">
                              ₹{totalCostForGroup.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-stone-500">
                              ₹{item.pricePerPerson.toLocaleString()} / person
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              updateDraft({
                                selectedTransport: item,
                                selectedSeats: isSelected ? currentDraft.selectedSeats : [],
                                transportClass,
                              });
                            }}
                            className={`mt-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                              isSelected
                                ? 'bg-[#9D3373] text-white shadow-xs'
                                : 'bg-stone-100 hover:bg-[#9D3373] hover:text-white text-stone-700'
                            }`}
                          >
                            {isSelected ? '✓ Selected' : 'Select'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Step 2B: Visual Seat Selection (PRD FR-SEAT-01 to 05) */}
              {currentDraft.selectedTransport && (
                <div className="pt-6 border-t border-stone-200">
                  <div className="mb-5 rounded-2xl border border-stone-200 bg-[#FAF8F5] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                      {currentDraft.selectedTransport.mode === 'TRAIN' ? 'Coach class' : 'Bus type'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(currentDraft.selectedTransport.mode === 'TRAIN'
                        ? [
                            { value: 'AC' as const, label: 'AC (1A / 2A / 3A)' },
                            { value: 'NON_AC' as const, label: 'Non-AC Sleeper' },
                          ]
                        : currentDraft.selectedTransport.mode === 'BUS'
                        ? [
                            { value: 'AC' as const, label: 'AC Seater' },
                            { value: 'NON_AC' as const, label: 'Non-AC Seater' },
                          ]
                        : [{ value: 'AC' as const, label: 'Standard cabin' }]
                      ).map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setTransportClass(option.value);
                            updateDraft({ transportClass: option.value, selectedSeats: [] });
                          }}
                          className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                            transportClass === option.value
                              ? 'border-[#9D3373] bg-[#9D3373] text-white'
                              : 'border-stone-300 bg-white text-stone-700 hover:border-[#9D3373]'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-serif-display text-2xl font-light italic text-stone-900 flex items-center gap-2">
                        <span>Visual Seat Selection</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#9D3373]/10 border border-[#9D3373]/20 text-[#9D3373] not-italic font-sans font-bold">
                          Official Cabin Layout
                        </span>
                      </h3>
                      <p className="text-xs text-stone-500">
                        Select {currentDraft.travelersCount} seat{currentDraft.travelersCount > 1 ? 's' : ''} for your group on {currentDraft.selectedTransport.operator} ({currentDraft.selectedTransport.code})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500">Selected:</span>
                      <span className="text-xs font-bold text-[#9D3373]">
                        {currentDraft.selectedSeats && currentDraft.selectedSeats.length > 0
                          ? currentDraft.selectedSeats.join(', ')
                          : 'None'}
                      </span>
                    </div>
                  </div>

                  <VisualSeatPicker
                    transport={currentDraft.selectedTransport}
                    travelersCount={currentDraft.travelersCount}
                    selectedSeats={currentDraft.selectedSeats || []}
                    seatClass={transportClass}
                    onSeatsChange={(seats) => updateDraft({ selectedSeats: seats })}
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 3: HOTEL & ROOM SELECTION */}
          {plannerStep === 3 && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
              <div>
                <h2 className="font-serif-display text-3xl font-light italic text-stone-900">
                  Select Hotel &amp; Room in {currentDraft.destinationName}
                </h2>
                <p className="text-stone-500 text-sm font-light">
                  Accommodations for {currentDraft.durationDays} nights. Availability is verified dynamically.
                </p>
              </div>

              <div className="space-y-8">
                {scoredHotelsList.map(({ item: hotel, score, matchBadges }) => {
                  const isHotelSelected = currentDraft.selectedHotel?.id === hotel.id;

                  return (
                    <div
                      key={hotel.id}
                      className={`bg-white rounded-2xl overflow-hidden border shadow-xs transition-all ${
                        isHotelSelected
                          ? 'border-[#9D3373] ring-1 ring-[#9D3373]/40'
                          : 'border-stone-200'
                      }`}
                    >
                      {/* Hotel Header Info */}
                      <div className="flex flex-col md:flex-row gap-6 p-6">
                        <div className="relative md:w-72 h-48 rounded-xl overflow-hidden shrink-0 border border-stone-200">
                          <img
                            src={hotel.heroImage}
                            alt={hotel.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-stone-900 text-xs font-semibold px-2.5 py-1 rounded-full border border-stone-200 shadow-xs">
                            ★ {hotel.rating} ({hotel.reviewCount})
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <h3 className="font-serif-display text-2xl font-light italic text-stone-900">
                                {hotel.name}
                              </h3>
                              {score >= 85 && (
                                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#9D3373]/10 border border-[#9D3373]/20 text-[#9D3373] font-bold flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-[#9D3373]" />
                                  {score}% Match
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-stone-500 mb-2 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-[#9D3373]" />
                              {hotel.address}
                            </p>

                            <p className="text-stone-600 text-xs sm:text-sm font-light leading-relaxed mb-4 line-clamp-2">
                              {hotel.description}
                            </p>

                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {hotel.amenities.map((a, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] bg-stone-100 border border-stone-200 text-stone-700 px-2 py-0.5 rounded-md font-medium"
                                >
                                  {a}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-stone-200">
                            {matchBadges.map((b, i) => (
                              <span
                                key={i}
                                className="text-[10px] bg-[#9D3373]/10 border border-[#9D3373]/20 text-[#9D3373] font-medium px-2 py-0.5 rounded-md"
                              >
                                {b}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Hotel Rooms Table */}
                      <div className="bg-[#FAF8F5] px-6 py-4 border-t border-stone-200">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3">
                          Select Room Type for {currentDraft.durationDays} Nights
                        </p>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-3">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Room preference</p>
                              <p className="text-xs text-stone-600">Choose your room cooling option</p>
                            </div>
                            <div className="flex gap-2">
                              {(['AC', 'NON_AC'] as const).map((condition) => (
                                <button
                                  key={condition}
                                  type="button"
                                  onClick={() => {
                                    setRoomCondition(condition);
                                    updateDraft({ roomCondition: condition });
                                  }}
                                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                                    roomCondition === condition
                                      ? 'border-[#9D3373] bg-[#9D3373] text-white'
                                      : 'border-stone-300 bg-white text-stone-700'
                                  }`}
                                >
                                  {condition === 'AC' ? 'AC' : 'Non-AC'}
                                </button>
                              ))}
                            </div>
                          </div>
                          {hotel.rooms.map((room) => {
                            const isRoomSelected =
                              isHotelSelected && currentDraft.selectedRoom?.id === room.id;
                            const roomTotal = room.pricePerNight * currentDraft.durationDays;
                            const isAvailable = room.availableCount > 0;

                            return (
                              <div
                                key={room.id}
                                className={`p-4 rounded-xl bg-white border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                                  isRoomSelected
                                    ? 'border-[#9D3373] bg-[#9D3373]/5 ring-1 ring-[#9D3373]/30'
                                    : 'border-stone-200'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-serif-display text-base font-light text-stone-900">
                                      {room.name}
                                    </h4>
                                    <span className="text-[10px] bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-md font-mono text-stone-600">
                                      {room.type} • {roomCondition === 'AC' ? 'AC' : 'Non-AC'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-stone-500 mt-0.5">
                                    {room.bedType} • Max {room.maxGuests} Guests •{' '}
                                    <span
                                      className={
                                        isAvailable ? 'text-emerald-700 font-medium' : 'text-rose-600 font-bold'
                                      }
                                    >
                                      {isAvailable ? `${room.availableCount} available` : 'Sold out'}
                                    </span>
                                  </p>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                                  <div className="sm:text-right">
                                    <p className="font-serif-display text-lg font-light italic text-[#9D3373] font-medium">
                                      ₹{roomTotal.toLocaleString()}
                                    </p>
                                    <p className="text-[10px] text-stone-500">
                                      ₹{room.pricePerNight.toLocaleString()} / night
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    disabled={!isAvailable}
                                    onClick={() => {
                                      updateDraft({
                                        selectedHotel: hotel,
                                        selectedRoom: room,
                                      });
                                    }}
                                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                                      !isAvailable
                                        ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
                                        : isRoomSelected
                                        ? 'bg-[#9D3373] text-white shadow-xs'
                                        : 'bg-stone-100 hover:bg-[#9D3373] hover:text-white text-stone-700'
                                    }`}
                                  >
                                    {!isAvailable
                                      ? 'Sold Out'
                                      : isRoomSelected
                                      ? '✓ Selected'
                                      : 'Select Room'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: OPTIONAL VEHICLE RENTAL */}
          {plannerStep === 4 && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif-display text-3xl font-light italic text-stone-900">
                    Add a Rental Car or Bike (Optional)
                  </h2>
                  <p className="text-stone-500 text-sm font-light">
                    Explore {currentDraft.destinationName} at your own pace. You can select a vehicle or skip.
                  </p>
                </div>

                {/* SKIP VEHICLE RENTAL BUTTON (PRD MANDATE FR-VEH-02) */}
                <button
                  type="button"
                  onClick={() => {
                    updateDraft({
                      skipVehicle: true,
                      selectedVehicle: undefined,
                    });
                  }}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                    currentDraft.skipVehicle
                      ? 'bg-[#9D3373] text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
                  }`}
                  id="skip-vehicle-btn"
                >
                  {currentDraft.skipVehicle && <Check className="w-4 h-4" />}
                  <span>Skip Vehicle Rental (No ride needed)</span>
                </button>
              </div>

              {/* Vehicle Type Filter */}
              <div className="flex items-center gap-2">
                {(['ALL', 'CAR', 'BIKE', 'SCOOTER'] as const).map((vt) => (
                  <button
                    key={vt}
                    onClick={() => {
                      setSelectedVehicleType(vt);
                      if (currentDraft.skipVehicle) updateDraft({ skipVehicle: false });
                    }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      selectedVehicleType === vt && !currentDraft.skipVehicle
                        ? 'bg-[#9D3373] text-white shadow-xs'
                        : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {vt === 'ALL' ? 'All Rides' : vt === 'CAR' ? 'Cars' : vt === 'BIKE' ? 'Motorcycles' : 'Scooters'}
                  </button>
                ))}
              </div>

              {/* Vehicle Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {scoredVehiclesList
                  .filter((v) => selectedVehicleType === 'ALL' || v.item.type === selectedVehicleType)
                  .map(({ item: veh, score, matchBadges }) => {
                    const isSelected = !currentDraft.skipVehicle && currentDraft.selectedVehicle?.id === veh.id;
                    const totalCostForDays = veh.dailyRate * currentDraft.durationDays;

                    return (
                      <div
                        key={veh.id}
                        className={`bg-white rounded-2xl p-5 border flex flex-col justify-between shadow-xs transition-all ${
                          isSelected
                            ? 'border-[#9D3373] ring-1 ring-[#9D3373]/40 bg-[#9D3373]/5'
                            : 'border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div>
                          <div className="relative h-44 rounded-xl overflow-hidden mb-4 bg-stone-100 border border-stone-200">
                            <img
                              src={veh.imageUrl}
                              alt={veh.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-stone-900 text-xs font-semibold px-2.5 py-1 rounded-full border border-stone-200 shadow-xs">
                              ★ {veh.rating}
                            </div>
                            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs text-[#9D3373] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-stone-200 shadow-xs">
                              {veh.category}
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-serif-display text-lg font-light text-stone-900">{veh.name}</h3>
                            {score >= 80 && (
                              <span className="text-[10px] bg-[#9D3373]/10 border border-[#9D3373]/20 text-[#9D3373] px-2 py-0.5 rounded-full font-bold">
                                {score}% Match
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-stone-500 mb-3">
                            {veh.transmission} • {veh.seats} Seats • {veh.fuelType}
                          </p>

                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {veh.features.map((f, i) => (
                              <span
                                key={i}
                                className="text-[10px] bg-stone-100 border border-stone-200 text-stone-700 px-2 py-0.5 rounded-md font-medium"
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-stone-200">
                          <div>
                            <p className="font-serif-display text-lg font-light italic text-[#9D3373] font-medium">
                              ₹{totalCostForDays.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-stone-500">
                              ₹{veh.dailyRate.toLocaleString()} / day ({currentDraft.durationDays} days)
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              updateDraft({
                                skipVehicle: false,
                                selectedVehicle: veh,
                              });
                            }}
                            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                              isSelected
                                ? 'bg-[#9D3373] text-white shadow-xs'
                                : 'bg-stone-100 hover:bg-[#9D3373] hover:text-white text-stone-700'
                            }`}
                          >
                            {isSelected ? '✓ Selected' : 'Add to Trip'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* STEP 5: TOURIST PLACES (FLEXIBLE MULTI-SELECT - PRD FR-PLACE-02 & FR-PLACE-03) */}
          {plannerStep === 5 && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif-display text-3xl font-light italic text-stone-900">
                    Tourist Places &amp; Attractions in {currentDraft.destinationName}
                  </h2>
                  <p className="text-stone-500 text-sm font-light">
                    Select the sights you wish to experience. No forced Day 1/Day 2 schedules — build your personalized travel list.
                  </p>
                </div>

                <div className="text-xs bg-[#9D3373]/10 border border-[#9D3373]/20 text-[#9D3373] font-bold px-4 py-2 rounded-full uppercase tracking-wider">
                  {currentDraft.selectedPlaces.length} attractions chosen
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {scoredPlacesList.map(({ item: place, score, matchBadges }) => {
                  const isSelected = currentDraft.selectedPlaces.some((p) => p.id === place.id);

                  return (
                    <div
                      key={place.id}
                      onClick={() => {
                        if (isSelected) {
                          updateDraft({
                            selectedPlaces: currentDraft.selectedPlaces.filter((p) => p.id !== place.id),
                          });
                        } else {
                          updateDraft({
                            selectedPlaces: [...currentDraft.selectedPlaces, place],
                          });
                        }
                      }}
                      className={`bg-white rounded-2xl overflow-hidden border cursor-pointer transition-all shadow-xs flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#9D3373] ring-1 ring-[#9D3373]/40 shadow-xs bg-[#9D3373]/5'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div>
                        <div className="relative h-40 overflow-hidden border-b border-stone-200">
                          <img
                            src={place.imageUrl}
                            alt={place.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs text-stone-900 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-stone-200 shadow-xs">
                            ★ {place.rating}
                          </div>
                          <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-xs text-[#9D3373] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-stone-200 shadow-xs">
                            {place.category}
                          </div>
                        </div>

                        <div className="p-4">
                          <h4 className="font-serif-display text-base font-light text-stone-900 mb-1 leading-snug">
                            {place.name}
                          </h4>
                          <p className="text-xs text-stone-500 mb-2">
                            Est. time: {place.visitDuration} • {place.recommendedTime}
                          </p>
                          <p className="text-xs text-stone-600 font-light line-clamp-2 mb-3">
                            {place.description}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 pt-0 flex items-center justify-between border-t border-stone-200">
                        <span className="text-xs font-serif-display font-light italic text-[#9D3373] font-medium">
                          {place.entryFee === 0 ? 'Free Entry' : `Entry: ₹${place.entryFee}`}
                        </span>

                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1 transition-all ${
                            isSelected
                              ? 'bg-[#9D3373] text-white shadow-xs'
                              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          {isSelected ? '✓ Added' : '+ Add'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: TRIP SUMMARY & AVAILABILITY PRE-CHECK (PRD FR-SUM-01 & FR-AVL-01) */}
          {plannerStep === 6 && (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
              <div>
                <h2 className="font-serif-display text-3xl font-light italic text-stone-900">
                  Consolidated Trip Summary
                </h2>
                <p className="text-stone-500 text-sm font-light">
                  Review your combined itinerary and estimated costs before proceeding to payment.
                </p>
              </div>

              {/* Dynamic Availability Verification Ribbon (PRD FR-AVL-01) */}
              <div className="bg-[#9D3373]/10 border border-[#9D3373]/20 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#9D3373]/15 border border-[#9D3373]/30 text-[#9D3373] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-[#9D3373] text-sm">
                      Pre-Payment Availability Check Passed
                    </p>
                    <p className="text-xs text-stone-600 font-light">
                      Transport seats verified • Room availability confirmed • Overlap prevention active
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-[#9D3373] text-white font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                  Verified
                </span>
              </div>

              {import.meta.env.DEV && <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs flex flex-wrap items-center justify-between gap-2 shadow-xs">
                <span className="text-stone-500 font-medium uppercase tracking-wider text-[10px]">QA / Demo State Testing:</span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer text-stone-700">
                    <input
                      type="checkbox"
                      checked={simulateSoldOut}
                      onChange={(e) => setSimulateSoldOut(e.target.checked)}
                      className="rounded text-[#9D3373]"
                    />
                    <span>Simulate Room Sold Out</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-stone-700">
                    <input
                      type="checkbox"
                      checked={simulateFailure}
                      onChange={(e) => setSimulateFailure(e.target.checked)}
                      className="rounded text-rose-500"
                    />
                    <span>Simulate Payment Decline</span>
                  </label>
                </div>
              </div>}

              {/* Breakdown Card */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs divide-y divide-stone-100">
                
                {/* Destination & Dates */}
                <div className="pb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Destination</span>
                    <h4 className="font-serif-display text-2xl font-light italic text-stone-900">
                      {currentDraft.destinationName}
                    </h4>
                  </div>
                  <div className="text-right text-xs text-stone-500">
                    <p className="font-medium text-stone-900">
                      {currentDraft.departureDate} → {currentDraft.returnDate}
                    </p>
                    <p>{currentDraft.durationDays} Days • {currentDraft.travelersCount} Travelers</p>
                  </div>
                </div>

                {/* Transport line */}
                <div className="py-4 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-[#9D3373]" />
                      <span className="font-serif-display text-base font-light text-stone-900">
                        {currentDraft.selectedTransport?.operator}
                      </span>
                      {currentDraft.selectedSeats && currentDraft.selectedSeats.length > 0 && (
                        <span className="text-[10px] bg-[#9D3373]/10 border border-[#9D3373]/20 text-[#9D3373] font-mono font-bold px-2 py-0.5 rounded">
                          Seats: {currentDraft.selectedSeats.join(', ')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5 font-light">
                      {currentDraft.selectedTransport?.departureTime} – {currentDraft.selectedTransport?.arrivalTime} ({currentDraft.selectedTransport?.duration})
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif-display text-base font-light italic text-[#9D3373] font-medium">
                      ₹{transportCost.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-stone-500">
                      ₹{currentDraft.selectedTransport?.pricePerPerson.toLocaleString()} × {currentDraft.travelersCount}
                    </p>
                  </div>
                </div>

                {/* Hotel line */}
                <div className="py-4 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <HotelIcon className="w-4 h-4 text-[#9D3373]" />
                      <span className="font-serif-display text-base font-light text-stone-900">
                        {currentDraft.selectedHotel?.name}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5 font-light">
                      {currentDraft.selectedRoom?.name} ({currentDraft.selectedRoom?.type})
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif-display text-base font-light italic text-[#9D3373] font-medium">
                      ₹{hotelCost.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-stone-500">
                      ₹{currentDraft.selectedRoom?.pricePerNight.toLocaleString()} × {currentDraft.durationDays} nights
                    </p>
                  </div>
                </div>

                {/* Vehicle line */}
                <div className="py-4 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-[#9D3373]" />
                      <span className="font-serif-display text-base font-light text-stone-900">
                        {currentDraft.skipVehicle
                          ? 'Vehicle Rental: Skipped'
                          : currentDraft.selectedVehicle?.name}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5 font-light">
                      {currentDraft.skipVehicle
                        ? 'No vehicle charges applied'
                        : `${currentDraft.selectedVehicle?.category} (${currentDraft.durationDays} days)`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif-display text-base font-light italic text-[#9D3373] font-medium">
                      {currentDraft.skipVehicle ? '₹0' : `₹${vehicleCost.toLocaleString()}`}
                    </p>
                  </div>
                </div>

                {/* Attractions list */}
                <div className="py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                      Selected Attractions ({currentDraft.selectedPlaces.length})
                    </span>
                    <span className="text-xs font-semibold text-[#9D3373]">Flexible Schedule</span>
                  </div>
                  {currentDraft.selectedPlaces.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {currentDraft.selectedPlaces.map((p) => (
                        <span
                          key={p.id}
                          className="text-[10px] bg-stone-100 border border-stone-200 text-stone-700 px-2.5 py-1 rounded-md font-medium"
                        >
                          {p.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-stone-500 italic">No attractions selected.</p>
                  )}
                </div>

                {/* Final Total */}
                <div className="pt-4 space-y-2">
                  <div className="flex justify-between text-xs text-stone-500 font-light">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-stone-500 font-light">
                    <span>Government Taxes &amp; Platform Fees (5%)</span>
                    <span>₹{taxes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-light text-stone-900 pt-2 border-t border-stone-200">
                    <span className="font-serif-display italic">Estimated Total Cost</span>
                    <span className="font-serif-display text-2xl font-light italic text-[#9D3373] font-medium">
                      ₹{totalTripCost.toLocaleString()}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 7: PAYMENT STEP (PRD FR-PAY-01 to FR-PAY-05) */}
          {plannerStep === 7 && (
            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
              <div>
                <h2 className="font-serif-display text-3xl font-light italic text-stone-900">
                  Pay &amp; Secure Confirmation
                </h2>
                <p className="text-stone-500 text-sm font-light">
                  Complete your one-time payment of <strong className="text-stone-900 font-semibold">₹{totalTripCost.toLocaleString()}</strong> to automatically confirm bookings with hotel and vehicle partners.
                </p>
              </div>

              {/* Payment Failure Error Alert */}
              {paymentError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Transaction Exception</span>
                  </div>
                  <p>{paymentError}</p>
                </div>
              )}

              {/* Payment Methods */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3">
                    Choose Payment Gateway
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('UPI')}
                      className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                        paymentMethod === 'UPI'
                          ? 'border-[#9D3373] bg-[#9D3373]/10 text-[#9D3373] font-bold ring-1 ring-[#9D3373]/40'
                          : 'border-stone-200 hover:border-stone-300 bg-stone-50 text-stone-700'
                      }`}
                    >
                      <QrCode className="w-6 h-6" />
                      <span className="text-xs uppercase tracking-wider">UPI / QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CARD')}
                      className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                        paymentMethod === 'CARD'
                          ? 'border-[#9D3373] bg-[#9D3373]/10 text-[#9D3373] font-bold ring-1 ring-[#9D3373]/40'
                          : 'border-stone-200 hover:border-stone-300 bg-stone-50 text-stone-700'
                      }`}
                    >
                      <CreditCard className="w-6 h-6" />
                      <span className="text-xs uppercase tracking-wider">Cards</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('NETBANKING')}
                      className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                        paymentMethod === 'NETBANKING'
                          ? 'border-[#9D3373] bg-[#9D3373]/10 text-[#9D3373] font-bold ring-1 ring-[#9D3373]/40'
                          : 'border-stone-200 hover:border-stone-300 bg-stone-50 text-stone-700'
                      }`}
                    >
                      <Building className="w-6 h-6" />
                      <span className="text-xs uppercase tracking-wider">NetBanking</span>
                    </button>
                  </div>
                </div>

                {paymentMethod === 'UPI' && (
                  <div className="p-5 bg-[#FAF8F5] rounded-2xl border border-stone-200 text-center space-y-3">
                    <p className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Instant UPI Fast Pay</p>
                    <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl border border-stone-200 shadow-sm flex items-center justify-center">
                      <QrCode className="w-24 h-24 text-stone-900" />
                    </div>
                    <p className="text-[11px] text-stone-500 font-light">Scan via Google Pay, PhonePe, or Paytm</p>
                  </div>
                )}

                {paymentMethod === 'CARD' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Card Number (4242 •••• •••• 4242)"
                      defaultValue="4242 8821 9912 4022"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:border-[#9D3373] focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="MM / YY"
                        defaultValue="12 / 28"
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:border-[#9D3373] focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        defaultValue="842"
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:border-[#9D3373] focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'NETBANKING' && (
                  <select className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm font-medium focus:border-[#9D3373] focus:outline-none">
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>State Bank of India (SBI)</option>
                    <option>Axis Bank</option>
                  </select>
                )}

                <div className="p-3 bg-[#9D3373]/10 rounded-xl border border-[#9D3373]/20 text-[#9D3373] text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#9D3373] shrink-0" />
                  <span>
                    Idempotent transaction guarantee. You will only be billed once for <strong>₹{totalTripCost.toLocaleString()}</strong>.
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handlePayNow}
                  className="w-full py-4 bg-[#9D3373] hover:bg-[#862960] active:scale-98 text-white font-bold uppercase tracking-[0.15em] rounded-2xl shadow-md flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50 cursor-pointer"
                  id="planner-pay-submit-btn"
                >
                  {isProcessingPayment ? (
                    <span>Securing Reservation &amp; Processing...</span>
                  ) : (
                    <span>Authorize &amp; Pay ₹{totalTripCost.toLocaleString()}</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 8: SUCCESS / BOOKING CONFIRMATION (PRD FR-PAY-03 & FR-TRIP-05) */}
          {plannerStep === 8 && confirmedBooking && (
            <div className="max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 text-center">
              <div className="w-16 h-16 rounded-full bg-[#9D3373]/10 border border-[#9D3373]/20 text-[#9D3373] mx-auto flex items-center justify-center shadow-xs">
                <Check className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#9D3373] bg-[#9D3373]/10 border border-[#9D3373]/20 px-3 py-1 rounded-full">
                  Booking Confirmed
                </span>
                <h2 className="font-serif-display text-4xl font-light italic text-stone-900 mt-3 mb-1">
                  You're going to {confirmedBooking.destination}!
                </h2>
                <p className="text-stone-500 text-sm font-light">
                  Your trip is locked in. Unique Booking Reference:{' '}
                  <strong className="text-[#9D3373] font-mono text-base">{confirmedBooking.id}</strong>
                </p>
              </div>

              {/* Confirmed details voucher */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 text-left shadow-xs divide-y divide-stone-100 text-sm">
                <div className="pb-3 flex justify-between">
                  <span className="text-stone-500 font-light">Traveler</span>
                  <span className="font-medium text-stone-900">{confirmedBooking.customerName}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-stone-500 font-light">Dates</span>
                  <span className="font-medium text-stone-900">
                    {confirmedBooking.departureDate} to {confirmedBooking.returnDate}
                  </span>
                </div>
                {confirmedBooking.transport && (
                  <div className="py-3 flex justify-between">
                    <span className="text-stone-500 font-light">Travel</span>
                    <span className="font-medium text-stone-900 flex items-center gap-2">
                      <span>{confirmedBooking.transport.operator} ({confirmedBooking.transport.departureTime})</span>
                      {confirmedBooking.selectedSeats && confirmedBooking.selectedSeats.length > 0 && (
                        <span className="text-[10px] bg-[#9D3373]/10 border border-[#9D3373]/20 text-[#9D3373] font-mono font-bold px-2 py-0.5 rounded">
                          Seats: {confirmedBooking.selectedSeats.join(', ')}
                        </span>
                      )}
                    </span>
                  </div>
                )}
                {confirmedBooking.hotel && (
                  <div className="py-3 flex justify-between">
                    <span className="text-stone-500 font-light">Stay</span>
                    <span className="font-medium text-stone-900">
                      {confirmedBooking.hotel.name} - {confirmedBooking.hotel.roomName}
                    </span>
                  </div>
                )}
                {confirmedBooking.vehicle && (
                  <div className="py-3 flex justify-between">
                    <span className="text-stone-500 font-light">Rental Ride</span>
                    <span className="font-medium text-stone-900">
                      {confirmedBooking.vehicle.name} ({confirmedBooking.vehicle.days} days)
                    </span>
                  </div>
                )}
                <div className="py-3 flex justify-between items-center pt-3">
                  <span className="text-stone-500 font-light">Total Paid</span>
                  <span className="font-serif-display font-light italic text-[#9D3373] text-xl font-medium">
                    ₹{confirmedBooking.totalCost.toLocaleString()} (Paid via {confirmedBooking.payment.method})
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full sm:w-auto px-6 py-3 rounded-full border border-stone-200 font-bold uppercase tracking-wider text-stone-700 text-xs flex items-center justify-center gap-2 hover:bg-stone-100 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Ticket Voucher</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPlannerOpen(false);
                    setActiveView('my-trips');
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#9D3373] hover:bg-[#862960] text-white font-bold uppercase tracking-[0.15em] text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                  id="go-to-my-trips-btn"
                >
                  <span>Go to My Trips</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Action Footer (For navigation between steps 1-6) */}
        {plannerStep < 7 && (
          <div className="px-6 py-4 bg-white border-t border-stone-200 flex items-center justify-between shrink-0">
            <button
              type="button"
              disabled={plannerStep === 1}
              onClick={() => setPlannerStep(Math.max(1, plannerStep - 1))}
              className="px-5 py-2.5 rounded-full border border-stone-200 text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-stone-100 disabled:opacity-20 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleNextStep}
                className="px-7 py-2.5 rounded-full bg-[#9D3373] hover:bg-[#862960] active:scale-98 text-white text-xs font-bold uppercase tracking-[0.15em] transition-all flex items-center gap-1.5 shadow-md"
                id="planner-next-btn"
              >
                <span>{plannerStep === 6 ? 'Proceed to Payment' : 'Continue'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
