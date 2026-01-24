import { type NeonQueryFunction, neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as fileSchema from "@/entities/file/model/schema";
import * as userSchema from "@/entities/user/model/schema";
import * as nodeSchema from "@/entities/node/model/schema";
import * as bookingSchema from "@/entities/booking/model/schema";
import * as scheduleSchema from "@/entities/schedule/model/schema";
import * as activityLogSchema from "@/entities/activity-log/model/schema";

const schema = {
  ...userSchema,
  ...fileSchema,
  ...nodeSchema,
  ...bookingSchema,
  ...scheduleSchema,
  ...activityLogSchema,
};

let sql: NeonQueryFunction<false, false>;
let db: NeonHttpDatabase<typeof schema>;

if (process.env.DATABASE_URL) {
  sql = neon(process.env.DATABASE_URL);
  db = drizzle(sql, { schema });
}

export { db };
