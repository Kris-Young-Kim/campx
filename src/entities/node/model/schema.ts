import { pgTable, text, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { vector } from "@/shared/lib/pgvector";

/**
 * Node types enum
 * SITE: 캠핑 사이트
 * WC: 화장실
 * STORE: 편의점/매점
 * ACTIVITY: 체험존
 */
export const nodeTypeEnum = pgEnum("node_type", ["SITE", "WC", "STORE", "ACTIVITY"]);

/**
 * Nodes table: 캠핑장 시설 정보
 */
export const nodes = pgTable("nodes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: nodeTypeEnum("type").notNull(),

  // 3D 좌표 (x, y: 평면 위치, z: 고도)
  posX: real("pos_x").notNull(),
  posY: real("pos_y").notNull(),
  posZ: real("pos_z").default(0).notNull(),

  // 속성 벡터 (Nature, Activity, Rest)
  attrVector: vector("attr_vector", { dimensions: 3 }),

  description: text("description"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
