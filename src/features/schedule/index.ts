/**
 * @file index.ts
 * @description Schedule Feature Public API
 *
 * FSD 아키텍처에 따른 Public API export
 * 외부에서는 이 파일을 통해서만 schedule feature를 import해야 합니다.
 */

export {
  getSchedulesByBookingId,
  getActiveSchedule,
  toggleScheduleActive,
  generateSchedule,
  type Schedule,
  type ScheduleItem,
  type GenerateScheduleInput,
} from './api/actions';
