/**
 * @file user-vector.ts
 * @description 사용자 벡터 생성 유틸리티
 *
 * 온보딩 설문 응답을 기반으로 사용자 선호 벡터를 생성합니다.
 * 벡터는 3차원: [Nature, Activity, Rest]
 */

/**
 * 온보딩 설문 응답 타입
 */
export type OnboardingSurvey = {
  healthCondition: number; // 1-10, 높을수록 건강
  familySize: number; // 가족 구성원 수
  hasPet: boolean; // 반려동물 유무
  naturePreference: number; // 0-10, 자연 선호도
  activityPreference: number; // 0-10, 액티비티 선호도
  restPreference: number; // 0-10, 휴식 선호도
};

/**
 * 온보딩 설문 응답을 기반으로 사용자 선호 벡터를 생성합니다.
 * 
 * @param survey 온보딩 설문 응답
 * @returns 3차원 벡터 [Nature, Activity, Rest] (0-1 정규화된 값)
 */
export function generateUserVector(survey: OnboardingSurvey): number[] {
  // 선호도 값을 0-1 범위로 정규화
  const normalize = (value: number, max: number = 10): number => {
    return Math.max(0, Math.min(1, value / max));
  };

  // 가족 구성원 수와 반려동물 유무를 고려한 보정
  // 가족이 많을수록 자연과 액티비티 선호도 증가
  const familyFactor = 1 + (survey.familySize - 1) * 0.1;
  const petFactor = survey.hasPet ? 1.1 : 1.0;

  // 벡터 생성 (정규화된 값)
  const nature = normalize(survey.naturePreference) * familyFactor * petFactor;
  const activity = normalize(survey.activityPreference) * familyFactor;
  const rest = normalize(survey.restPreference);

  // 벡터 정규화 (합이 1이 되도록)
  const sum = nature + activity + rest;
  if (sum === 0) {
    // 기본값: 균등 분배
    return [0.33, 0.33, 0.34];
  }

  return [
    Math.min(1, nature / sum),
    Math.min(1, activity / sum),
    Math.min(1, rest / sum),
  ];
}
