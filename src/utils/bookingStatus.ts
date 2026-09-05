import { Booking } from '../types';

export const getBookingStatus = (booking: Booking): Booking['status'] => {
  if (booking.status === 'CANCELLED') return 'CANCELLED';

  const returnDate = new Date(`${booking.returnDate}T23:59:59`);
  return !Number.isNaN(returnDate.getTime()) && returnDate.getTime() < Date.now()
    ? 'COMPLETED'
    : booking.status;
};
