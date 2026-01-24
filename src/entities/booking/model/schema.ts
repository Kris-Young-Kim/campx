import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "@/entities/user/model/schema";

/**
 * Booking status enum
 * PENDING: 예약 대기
 * CONFIRMED: 예약 확정
 * CHECKED_IN: 체크인 완료
 * CHECKED_OUT: 체크아웃 완료
 * CANCELLED: 취소됨
 */
export const bookingStatusEnum = pgEnum("booking_status", [
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "CHECKED_OUT",
  "CANCELLED",
]);

/**
 * Bookings table: 예약 정보
 */
export const bookings = pgTable("bookings", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  checkIn: timestamp("check_in").notNull(),
  checkOut: timestamp("check_out").notNull(),

  status: bookingStatusEnum("status").default("PENDING").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
