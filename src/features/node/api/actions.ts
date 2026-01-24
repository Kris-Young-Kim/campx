/**
 * @file actions.ts
 * @description 노드(시설) 정보 조회 Server Actions
 *
 * 이 파일은 캠핑장 시설(노드) 정보 조회 기능을 제공하는 Server Actions를 포함합니다.
 *
 * 주요 기능:
 * 1. 모든 노드 조회
 * 2. 노드 ID로 조회
 * 3. 노드 타입별 조회
 * 4. 노드 검색 (이름, 설명)
 *
 * 핵심 구현 로직:
 * - Drizzle ORM을 사용한 데이터베이스 쿼리
 * - 노드 타입 필터링
 * - 검색 기능
 *
 * @dependencies
 * - drizzle-orm: 데이터베이스 ORM
 * - @/shared/api/db: 데이터베이스 연결
 * - @/entities/node: 노드 스키마
 */

'use server';

import { eq, or, ilike, sql } from 'drizzle-orm';
import { db } from '@/shared/api/db';
import { nodes } from '@/entities/node';
import type { ActionResult } from '@/features/user/api/actions';

/**
 * 노드 타입
 */
export type NodeType = 'SITE' | 'WC' | 'STORE' | 'ACTIVITY';

/**
 * 노드 타입
 */
export type Node = {
  id: string;
  name: string;
  type: NodeType;
  posX: number;
  posY: number;
  posZ: number;
  attrVector: number[] | null;
  description: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

/**
 * 노드 조회 필터 옵션
 */
export type GetNodesOptions = {
  type?: NodeType;
  search?: string;
};

/**
 * 모든 노드를 조회합니다.
 *
 * @param options 필터 옵션 (타입, 검색어)
 * @returns 노드 목록
 */
export async function getNodes(
  options: GetNodesOptions = {},
): Promise<ActionResult<Node[]>> {
  try {
    let query = db.select().from(nodes);

    // 타입 필터링
    if (options.type) {
      query = query.where(eq(nodes.type, options.type)) as typeof query;
    }

    // 검색어 필터링 (이름 또는 설명에서 검색)
    if (options.search) {
      const searchPattern = `%${options.search}%`;
      query = query.where(
        or(
          ilike(nodes.name, searchPattern),
          ilike(nodes.description ?? sql`''`, searchPattern),
        )!,
      ) as typeof query;
    }

    const nodeList = await query;

    return {
      ok: true,
      data: nodeList.map((node) => ({
        id: node.id,
        name: node.name,
        type: node.type as NodeType,
        posX: node.posX,
        posY: node.posY,
        posZ: node.posZ,
        attrVector: node.attrVector
          ? (node.attrVector as unknown as number[])
          : null,
        description: node.description ?? null,
        createdAt: node.createdAt,
        updatedAt: node.updatedAt,
      })),
    };
  } catch (error) {
    console.error('Failed to get nodes:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : '노드 조회에 실패했습니다.',
    };
  }
}

/**
 * 노드 ID로 노드를 조회합니다.
 *
 * @param nodeId 노드 ID
 * @returns 노드 정보
 */
export async function getNodeById(
  nodeId: string,
): Promise<ActionResult<Node | null>> {
  try {
    const [node] = await db
      .select()
      .from(nodes)
      .where(eq(nodes.id, nodeId))
      .limit(1);

    if (!node) {
      return { ok: true, data: null };
    }

    return {
      ok: true,
      data: {
        id: node.id,
        name: node.name,
        type: node.type as NodeType,
        posX: node.posX,
        posY: node.posY,
        posZ: node.posZ,
        attrVector: node.attrVector
          ? (node.attrVector as unknown as number[])
          : null,
        description: node.description ?? null,
        createdAt: node.createdAt,
        updatedAt: node.updatedAt,
      },
    };
  } catch (error) {
    console.error('Failed to get node:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : '노드 조회에 실패했습니다.',
    };
  }
}

/**
 * 특정 타입의 노드들을 조회합니다.
 *
 * @param type 노드 타입
 * @returns 노드 목록
 */
export async function getNodesByType(
  type: NodeType,
): Promise<ActionResult<Node[]>> {
  return getNodes({ type });
}
