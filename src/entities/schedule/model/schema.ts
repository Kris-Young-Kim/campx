import { pgTable, text, real, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { bookings } from "@/entities/booking/model/schema";
import { nodes } from "@/entities/node/model/schema";

/**
 * Schedules table: AI 생성 스케줄
 */
export const schedules = pgTable("schedules", {
  id: text("id").primaryKey(),
  bookingId: text("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),

  // 총 피로도 점수
  totalFatigueScore: real("total_fatigue_score").default(0),

  // 활성 상태 (사용자가 여러 스케줄을 생성할 수 있음)
  isActive: boolean("is_active").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * Schedule Items table: 스케줄 상세 항목
 */
export const scheduleItems = pgTable("schedule_items", {
  id: text("id").primaryKey(),
  scheduleId: text("schedule_id")
    .notNull()
    .references(() => schedules.id, { onDelete: "cascade" }),
  nodeId: text("node_id")
    .notNull()
    .references(() => nodes.id, { onDelete: "cascade" }),

  // 일정 순서
  sequenceOrder: integer("sequence_order").notNull(),

  // 시간
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),

  // 활동명 (예: "점심 식사", "숲속 산책", "화장실 이용")
  activityName: text("activity_name").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
