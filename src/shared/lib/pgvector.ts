import { customType } from "drizzle-orm/pg-core";

/**
 * pgvector extension type for Drizzle ORM
 * Usage: vector("column_name", { dimensions: 3 })
 */
export const vector = customType<{
  data: number[];
  driverData: string;
  config: { dimensions: number };
}>({
  dataType(config) {
    return `vector(${config?.dimensions ?? 3})`;
  },
  toDriver(value: number[]): string {
    return JSON.stringify(value);
  },
  fromDriver(value: string): number[] {
    return JSON.parse(value);
  },
});
