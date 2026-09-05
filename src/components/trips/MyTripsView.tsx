import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Plane,
  Hotel,
  Car,
  CheckCircle2,
  Printer,
  Compass,
  ArrowRight,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Booking } from '../../types';
import { getBookingStatus } from '../../utils/bookingStatus';

export const MyTripsView: React.FC = () => {
  const { bookings, currentUser, startNewTrip, setActiveView } = useApp();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Filter bookings for current customer (or all if admin/viewing)
  const userBookings = bookings.filter((b) => b.userId === currentUser.id || currentUser.role === 'ADMIN');

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-[#9D3373]/10 border border-[#9D3373]/20 text-[#9D3373] text-[10px] font-bold uppercase tracking-widest mb-2">
              Private Portfolio
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
              My Planned Voyages
            </h1>
            <p className="text-stone-500 text-xs sm:text-sm mt-1 font-normal">
              All your confirmed journeys, vouchers, and reservation records in one unified console.
            </p>
          </div>

          <button
            onClick={() => startNewTrip()}
            className="px-6 py-2.5 bg-[#9D3373] hover:bg-[#862960] text-white font-bold uppercase tracking-wider rounded-full shadow-2xs text-xs flex items-center gap-2 self-start sm:self-auto transition-all"
            id="my-trips-plan-new-btn"
          >
            <Compass className="w-4 h-4" />
            <span>Plan New Journey</span>
          </button>
        </div>

        {/* Trips List or Empty State */}
        {userBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/90 shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 bg-[#FAF8F5] rounded-full flex items-center justify-center mx-auto mb-4 text-[#9D3373] border border-stone-200">
              <Compass className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-stone-900 mb-2">
              No journeys booked yet
            </h3>
            <p className="text-stone-500 text-xs sm:text-sm mb-6 font-normal">
              Select a destination to combine flights, stays, car rentals, and attractions into one reservation.
            </p>
            <button
              onClick={() => startNewTrip()}
              className="px-7 py-3 bg-[#9D3373] hover:bg-[#862960] text-white font-bold uppercase tracking-wider text-xs rounded-full shadow-2xs transition-colors"
            >
              Start Planning
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* List of Trip Cards */}
            <div className="lg:col-span-2 space-y-6">
              {userBookings.map((b) => (
                (() => {
                  const bookingStatus = getBookingStatus(b);
                  return (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/90 shadow-xs hover:border-[#9D3373]/40 transition-all flex flex-col justify-between"
                  id={`trip-card-${b.id}`}
                >
                  <div>
                    {/* Top bar of card */}
                    <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                      <div>
                        <span className="text-[10px] font-mono tracking-wider font-bold text-stone-400 uppercase">
                          {b.id}
                        </span>
                        <h2 className="text-2xl font-bold text-stone-900 mt-0.5">
                          {b.destination} Voyage
                        </h2>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {bookingStatus}
                        </span>
                        <p className="text-[11px] text-stone-400 mt-1">
                          Booked {new Date(b.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Quick dates & travelers info */}
                    <div className="flex items-center gap-6 py-4 text-xs font-semibold text-stone-700">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#9D3373]" />
                        <span>
                          {b.departureDate} — {b.returnDate} ({b.durationDays} Days)
                        </span>
                      </div>
                      <div>
                        <span>{b.travelersCount} Travelers</span>
                      </div>
                    </div>

                    {/* Integrated services pills */}
                    <div className="space-y-3 py-2">
                      {b.transport && (
                        <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-stone-200/80 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center">
                              <Plane className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-stone-900">
                                {b.transport.operator} ({b.transport.code})
                              </p>
                              <p className="text-[11px] text-stone-500">
                                Departs {b.transport.departureTime} • {b.transport.duration}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-stone-900">
                            ₹{(b.transport.pricePerPerson * b.travelersCount).toLocaleString()}
                          </span>
                        </div>
                      )}

                      {b.hotel && (
                        <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-stone-200/80 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-[#9D3373]/10 border border-[#9D3373]/20 text-[#9D3373] flex items-center justify-center">
                              <Hotel className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-stone-900">{b.hotel.name}</p>
                              <p className="text-[11px] text-stone-500">
                                {b.hotel.roomName} ({b.hotel.condition === 'NON_AC' ? 'Non-AC' : 'AC'} • {b.hotel.nights} nights)
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-stone-900">
                            ₹{b.hotel.total.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {b.vehicle ? (
                        <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-stone-200/80 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                              <Car className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-stone-900">{b.vehicle.name}</p>
                              <p className="text-[11px] text-stone-500">
                                Rental Vehicle ({b.vehicle.days} days)
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-stone-900">
                            ₹{b.vehicle.total.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-dashed border-stone-200 text-xs text-stone-400 italic">
                          Vehicle rental skipped for this booking.
                        </div>
                      )}

                      {b.places.length > 0 && (
                        <div className="pt-2">
                          <p className="text-[10px] font-bold text-[#9D3373] uppercase tracking-widest mb-1.5">
                            Curated Sightseeing ({b.places.length})
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {b.places.map((p) => (
                              <span
                                key={p.id}
                                className="text-[10px] bg-white border border-stone-200 text-stone-700 px-2.5 py-0.5 rounded-md font-medium shadow-2xs"
                              >
                                {p.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom total and print button */}
                  <div className="pt-5 mt-4 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Total Settled</span>
                      <p className="text-2xl font-bold text-[#9D3373]">
                        ₹{b.totalCost.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="px-4 py-2 rounded-full border border-stone-200 hover:bg-stone-100 text-xs font-bold text-stone-700 flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#9D3373]" />
                        <span>View Voucher</span>
                      </button>
                    </div>
                  </div>
                </div>
                  );
                })()
              ))}
            </div>

            {/* Right sidebar: Quick Stats / Voucher preview modal */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs">
                <h3 className="text-xl font-bold text-stone-900 mb-4">
                  Account Summary
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-stone-100">
                    <span className="text-stone-500">Total Trips Booked</span>
                    <span className="font-bold text-stone-900">{userBookings.length}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-stone-100">
                    <span className="text-stone-500">Upcoming Departures</span>
                    <span className="font-bold text-[#9D3373]">{userBookings.length}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-stone-100">
                    <span className="text-stone-500">Total Portfolio Spend</span>
                    <span className="text-base font-bold text-[#9D3373]">
                      ₹{userBookings.reduce((sum, b) => sum + b.totalCost, 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs text-stone-700 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-[#9D3373]">
                    <ShieldCheck className="w-4 h-4 text-[#9D3373]" />
                    <span>Synchronous Guarantee</span>
                  </p>
                  <p className="text-[11px] text-stone-500 leading-relaxed font-normal">
                    All reservations are confirmed with hotels and vehicle rental hubs simultaneously.
                  </p>
                </div>
              </div>

              {/* Printable Voucher detail if selected */}
              {selectedBooking && (
                <div className="bg-white rounded-2xl p-6 border-2 border-[#9D3373] shadow-xs text-xs space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <span className="text-base font-bold text-stone-900">Travel Voucher</span>
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1 rounded-full bg-[#9D3373] text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-2xs"
                    >
                      <Printer className="w-3 h-3" />
                      Print
                    </button>
                  </div>

                  <div className="space-y-2 font-mono text-[11px] text-stone-700">
                    <p><strong className="text-stone-500 uppercase font-sans">Booking Ref:</strong> {selectedBooking.id}</p>
                    <p><strong className="text-stone-500 uppercase font-sans">Guest:</strong> {selectedBooking.customerName}</p>
                    <p><strong className="text-stone-500 uppercase font-sans">Destination:</strong> {selectedBooking.destination}</p>
                    <p><strong className="text-stone-500 uppercase font-sans">Dates:</strong> {selectedBooking.departureDate} - {selectedBooking.returnDate}</p>
                    <p><strong className="text-stone-500 uppercase font-sans">Txn Ref:</strong> {selectedBooking.payment.transactionRef}</p>
                    <p><strong className="text-stone-500 uppercase font-sans">Settled:</strong> ₹{selectedBooking.totalCost.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
