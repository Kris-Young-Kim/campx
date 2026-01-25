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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c7abc132-a08b-470e-b9be-70c6a8a0ef9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pgvector.ts:16',message:'toDriver called',data:{value:value,type:typeof value,isArray:Array.isArray(value)},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    // PostgreSQL vector 타입은 '[0.471,0.429,0.099]' 형식의 문자열을 기대합니다
    // JSON.stringify는 "[0.471,0.429,0.099]"를 반환하므로 그대로 사용
    const result = JSON.stringify(value);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c7abc132-a08b-470e-b9be-70c6a8a0ef9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pgvector.ts:20',message:'toDriver result',data:{result:result},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return result;
  },
  fromDriver(value: string): number[] {
    return JSON.parse(value);
  },
});
