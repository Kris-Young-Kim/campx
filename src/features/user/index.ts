/**
 * @file index.ts
 * @description User Feature Public API
 *
 * FSD 아키텍처에 따른 Public API export
 * 외부에서는 이 파일을 통해서만 user feature를 import해야 합니다.
 */

export {
  getUserProfile,
  updateUserProfile,
  createOrUpdateUserProfile,
  type ActionResult,
  type UserProfile,
  type UpdateUserProfileInput,
} from './api/actions';
