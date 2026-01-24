// Supabase 타입 정의
// npm run generate:types 명령어로 자동 생성됩니다
// 
// 현재는 빈 타입으로 설정되어 있으며, Supabase 프로젝트 설정 후
// generate:types 스크립트를 실행하여 실제 타입을 생성하세요.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // 타입 생성 후 자동으로 채워집니다
    }
    Views: {
      // 타입 생성 후 자동으로 채워집니다
    }
    Functions: {
      // 타입 생성 후 자동으로 채워집니다
    }
  }
}
