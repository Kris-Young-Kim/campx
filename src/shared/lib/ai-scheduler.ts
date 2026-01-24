/**
 * @file ai-scheduler.ts
 * @description AI 스케줄러 엔진 핵심 로직
 *
 * 이 파일은 AI 기반 스케줄 생성의 핵심 알고리즘을 포함합니다.
 *
 * 주요 기능:
 * 1. 벡터 유사도 계산 (Cosine Similarity)
 * 2. 피로도 페널티 계산 (특허 수식 3)
 * 3. 최적 경로 산출 (TSP 변형 알고리즘)
 *
 * 핵심 구현 로직:
 * - pgvector를 사용한 벡터 유사도 검색
 * - 거리와 고도 차이를 고려한 피로도 계산
 * - 그리디 알고리즘 기반 최적 경로 탐색
 *
 * @dependencies
 * - @/shared/api/db: 데이터베이스 연결
 * - @/entities/node: 노드 스키마
 * - @/entities/user: 사용자 스키마
 */

import { sql } from 'drizzle-orm';
import { db } from '@/shared/api/db';
import { nodes } from '@/entities/node';
import type { Node } from '@/features/node/api/actions';

/**
 * 벡터 유사도 결과 타입
 */
export type SimilarityResult = {
  node: Node;
  similarity: number; // 0-1 사이 값 (1에 가까울수록 유사)
};

/**
 * 경로 노드 타입 (피로도 점수 포함)
 */
export type PathNode = {
  node: Node;
  fatiguePenalty: number; // 누적 피로도 페널티
  distance: number; // 이전 노드로부터의 거리
  elevationDelta: number; // 이전 노드로부터의 고도 차이
};

/**
 * 최적 경로 결과 타입
 */
export type OptimalPath = {
  nodes: PathNode[];
  totalFatigueScore: number;
  totalDistance: number;
};

/**
 * 두 벡터 간의 코사인 유사도를 계산합니다.
 * 
 * @param vector1 첫 번째 벡터 (3차원: [Nature, Activity, Rest])
 * @param vector2 두 번째 벡터 (3차원: [Nature, Activity, Rest])
 * @returns 코사인 유사도 (0-1 사이 값, 1에 가까울수록 유사)
 */
export function calculateCosineSimilarity(
  vector1: number[],
  vector2: number[],
): number {
  if (vector1.length !== vector2.length) {
    throw new Error('벡터 차원이 일치하지 않습니다.');
  }

  // 내적 계산
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let i = 0; i < vector1.length; i++) {
    dotProduct += vector1[i]! * vector2[i]!;
    magnitude1 += vector1[i]! * vector1[i]!;
    magnitude2 += vector2[i]! * vector2[i]!;
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  // 코사인 유사도 = 내적 / (벡터1 크기 * 벡터2 크기)
  return dotProduct / (magnitude1 * magnitude2);
}

/**
 * 사용자 벡터와 유사한 노드들을 pgvector를 사용하여 조회합니다.
 * 
 * @param userVector 사용자 선호 벡터 (3차원: [Nature, Activity, Rest])
 * @param limit 조회할 노드 개수 (기본값: 20)
 * @returns 유사도 점수와 함께 정렬된 노드 목록
 */
export async function findSimilarNodes(
  userVector: number[],
  limit: number = 20,
): Promise<SimilarityResult[]> {
  if (userVector.length !== 3) {
    throw new Error('사용자 벡터는 3차원이어야 합니다.');
  }

  // pgvector의 cosine distance를 사용하여 유사 노드 검색
  // cosine distance = 1 - cosine similarity
  // 따라서 distance가 작을수록 유사도가 높음
  const vectorString = `[${userVector.join(',')}]`;

  const results = await db.execute<{
    id: string;
    name: string;
    type: string;
    pos_x: number;
    pos_y: number;
    pos_z: number;
    attr_vector: string;
    description: string | null;
    created_at: Date | null;
    updated_at: Date | null;
    similarity: number;
  }>(
    sql`
      SELECT 
        id,
        name,
        type,
        pos_x,
        pos_y,
        pos_z,
        attr_vector::text as attr_vector,
        description,
        created_at,
        updated_at,
        1 - (attr_vector <=> ${vectorString}::vector) as similarity
      FROM nodes
      WHERE attr_vector IS NOT NULL
      ORDER BY attr_vector <=> ${vectorString}::vector
      LIMIT ${limit}
    `,
  );

  return results.rows.map((row) => ({
    node: {
      id: row.id,
      name: row.name,
      type: row.type as Node['type'],
      posX: row.pos_x,
      posY: row.pos_y,
      posZ: row.pos_z,
      attrVector: JSON.parse(row.attr_vector) as number[],
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    },
    similarity: Number(row.similarity),
  }));
}

/**
 * 두 노드 간의 유클리드 거리를 계산합니다.
 * 
 * @param node1 첫 번째 노드
 * @param node2 두 번째 노드
 * @returns 거리 (미터 단위)
 */
export function calculateDistance(node1: Node, node2: Node): number {
  const dx = node1.posX - node2.posX;
  const dy = node1.posY - node2.posY;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 특허 수식 3: 거리와 고도 차이를 고려한 피로도 페널티를 계산합니다.
 * 
 * 수식: penalty = distance * (1 + elevation_delta / 100) * health_factor
 * 
 * @param distance 두 노드 간의 거리 (미터)
 * @param elevationDelta 고도 차이 (미터, 양수면 오르막, 음수면 내리막)
 * @param healthCondition 사용자 건강 상태 (1-10, 높을수록 건강)
 * @returns 피로도 페널티 점수
 */
export function calculateFatiguePenalty(
  distance: number,
  elevationDelta: number,
  healthCondition: number = 5,
): number {
  // 건강 상태를 페널티 계수로 변환 (1-10 → 2.0-0.5)
  // 건강할수록(높은 값) 페널티가 적음
  const healthFactor = 2.0 - (healthCondition - 1) * (1.5 / 9);

  // 고도 차이를 고려한 거리 보정
  // 오르막(양수)일수록 더 큰 페널티
  const elevationFactor = 1 + Math.abs(elevationDelta) / 100;

  // 피로도 페널티 = 거리 * 고도 보정 * 건강 계수
  return distance * elevationFactor * healthFactor;
}

/**
 * TSP 변형 알고리즘을 사용하여 최적 경로를 찾습니다.
 * 그리디 알고리즘 기반으로 가장 가까운 노드를 순차적으로 선택합니다.
 * 
 * @param candidateNodes 후보 노드 목록 (벡터 유사도로 필터링된 노드들)
 * @param startNode 시작 노드 (예: 캠핑 사이트)
 * @param healthCondition 사용자 건강 상태 (1-10)
 * @param maxNodes 최대 노드 개수 (기본값: 10)
 * @returns 최적 경로
 */
export function findOptimalPath(
  candidateNodes: SimilarityResult[],
  startNode: Node,
  healthCondition: number = 5,
  maxNodes: number = 10,
): OptimalPath {
  if (candidateNodes.length === 0) {
    return {
      nodes: [],
      totalFatigueScore: 0,
      totalDistance: 0,
    };
  }

  const path: PathNode[] = [];
  const visited = new Set<string>();
  let currentNode = startNode;
  let totalFatigue = 0;
  let totalDistance = 0;

  // 시작 노드 추가
  path.push({
    node: startNode,
    fatiguePenalty: 0,
    distance: 0,
    elevationDelta: 0,
  });

  visited.add(startNode.id);

  // 그리디 알고리즘: 가장 가까운(피로도가 적은) 노드를 순차적으로 선택
  while (path.length < maxNodes && visited.size < candidateNodes.length) {
    let bestNode: SimilarityResult | null = null;
    let bestFatigue = Infinity;
    let bestDistance = 0;
    let bestElevationDelta = 0;

    // 방문하지 않은 노드 중에서 가장 가까운 노드 찾기
    for (const candidate of candidateNodes) {
      if (visited.has(candidate.node.id)) {
        continue;
      }

      const distance = calculateDistance(currentNode, candidate.node);
      const elevationDelta = candidate.node.posZ - currentNode.posZ;
      const fatigue = calculateFatiguePenalty(
        distance,
        elevationDelta,
        healthCondition,
      );

      // 피로도가 가장 적은 노드 선택 (유사도도 고려)
      // 유사도가 높을수록 가중치를 더 줌
      const weightedFatigue = fatigue / (1 + candidate.similarity * 0.5);

      if (weightedFatigue < bestFatigue) {
        bestFatigue = weightedFatigue;
        bestNode = candidate;
        bestDistance = distance;
        bestElevationDelta = elevationDelta;
      }
    }

    if (!bestNode) {
      break; // 더 이상 방문할 노드가 없음
    }

    // 선택된 노드를 경로에 추가
    const fatiguePenalty = calculateFatiguePenalty(
      bestDistance,
      bestElevationDelta,
      healthCondition,
    );

    path.push({
      node: bestNode.node,
      fatiguePenalty,
      distance: bestDistance,
      elevationDelta: bestElevationDelta,
    });

    totalFatigue += fatiguePenalty;
    totalDistance += bestDistance;
    currentNode = bestNode.node;
    visited.add(bestNode.node.id);
  }

  return {
    nodes: path,
    totalFatigueScore: totalFatigue,
    totalDistance,
  };
}
