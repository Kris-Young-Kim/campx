/**
 * @file index.ts
 * @description Map Feature Public API
 *
 * FSD 아키텍처에 따른 Public API export
 * 외부에서는 이 파일을 통해서만 map feature를 import해야 합니다.
 */

export { CampsiteMap } from './ui/campsite-map';
export { NodeDetailModal } from './ui/node-detail-modal';
export type { CampsiteMapProps } from './ui/campsite-map';
export type { NodeDetailModalProps } from './ui/node-detail-modal';
