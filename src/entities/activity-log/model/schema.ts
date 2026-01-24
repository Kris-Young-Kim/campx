import { pgTable, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { users } from "@/entities/user/model/schema";
import { nodes } from "@/entities/node/model/schema";

/**
 * Action type enum
 * VISIT: 방문
 * CHECKIN: 체크인
 * SKIP: 건너뜀
 * COMPLETE: 완료
 */
export const actionTypeEnum = pgEnum("action_type", ["VISIT", "CHECKIN", "SKIP", "COMPLETE"]);

/**
 * Activity Logs table: 사용자 활동 기록 (재학습용)
 */
export const activityLogs = pgTable("activity_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  nodeId: text("node_id")
    .notNull()
    .references(() => nodes.id, { onDelete: "cascade" }),

  actionType: actionTypeEnum("action_type").notNull(),

  // 만족도 점수 (1-5)
  satisfactionScore: integer("satisfaction_score"),

  createdAt: timestamp("created_at").defaultNow(),
});
