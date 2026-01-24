/**
 * @file index.ts
 * @description Booking Feature Public API
 *
 * FSD 아키텍처에 따른 Public API export
 * 외부에서는 이 파일을 통해서만 booking feature를 import해야 합니다.
 */

export {
  createBooking,
  getUserBookings,
  getBookingById,
  checkInBooking,
  type Booking,
  type CreateBookingInput,
} from './api/actions';
