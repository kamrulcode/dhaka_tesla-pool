export type FareBreakdown = {
  distanceKm: number;
  baseFare: number;
  discountPercent: number;
  discountAmount: number;
  farePerSeat: number;
  seats: number;
  totalFare: number;
};

/**
 * TeslaPool simple fare rules:
 * - 1 km starts at Tk 20
 * - Every additional km adds Tk 15
 * - Discount starts at 5% for 1 km
 * - Each additional km increases discount by 1%
 * - Maximum discount is 30%
 *
 * Distance is rounded up to the next whole kilometre for the initial MVP.
 */
export function calculateFare(distanceKm: number, seats = 1): FareBreakdown {
  const distance = Math.max(1, Math.ceil(Number(distanceKm) || 0));
  const safeSeats = Math.min(3, Math.max(1, Math.floor(Number(seats) || 1)));

  const baseFare = 20 + (distance - 1) * 15;
  const discountPercent = Math.min(30, 5 + (distance - 1));
  const discountAmount = (baseFare * discountPercent) / 100;
  const farePerSeat = Math.max(0, baseFare - discountAmount);
  const totalFare = Math.ceil(farePerSeat * safeSeats);

  return {
    distanceKm: distance,
    baseFare,
    discountPercent,
    discountAmount,
    farePerSeat,
    seats: safeSeats,
    totalFare,
  };
}
