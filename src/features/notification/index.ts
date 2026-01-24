/**
 * @file index.ts
 * @description Notification Feature Public API
 *
 * 이 파일은 notification feature의 Public API를 제공합니다.
 * FSD 아키텍처 원칙에 따라 외부에서 이 feature를 사용할 때는
 * 이 파일을 통해서만 접근해야 합니다.
 *
 * TODO (Post-MVP):
 * - 카카오 알림톡 API 연동 후 실제 발송 함수 추가
 */

export {
  getMannerTimeNotificationTargets,
  getActivityReminderTargets,
} from './api/actions';
export type { NotificationResult } from './api/actions';
