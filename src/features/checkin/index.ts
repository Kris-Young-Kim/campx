/**
 * @file index.ts
 * @description Checkin Feature Public API
 *
 * 이 파일은 checkin feature의 Public API를 제공합니다.
 * FSD 아키텍처 원칙에 따라 외부에서 이 feature를 사용할 때는
 * 이 파일을 통해서만 접근해야 합니다.
 */

export { generateQRCode, verifyAndCheckIn } from './api/actions';
export type { QRCodeData, QRCodeResult } from './api/actions';

export { QRCodeDisplay } from './ui/qr-code-display';
