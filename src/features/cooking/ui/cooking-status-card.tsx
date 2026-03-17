'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

const COOKING_CONFIG = { name: '숲속 정식', totalMinutes: 40 };

// 모듈 로드 시 16분 전에 시작했다고 가정 (앱 어디서 봐도 동일한 진행률)
const COOKING_START_TIME = new Date(Date.now() - 16 * 60 * 1000);

const cookingSteps = [
  { label: '재료 준비', threshold: 0 },
  { label: '조리 중', threshold: 20 },
  { label: '마무리', threshold: 75 },
  { label: '서빙 완료', threshold: 100 },
];

export function CookingStatusCard({ show }: { show: boolean }) {
  const [cookingProgress, setCookingProgress] = useState(0);
  const [flameFrame, setFlameFrame] = useState(0);

  useEffect(() => {
    const tick = setInterval(() => {
      const elapsedMs = Date.now() - COOKING_START_TIME.getTime();
      const elapsedMin = elapsedMs / 1000 / 60;
      const pct = Math.min(100, (elapsedMin / COOKING_CONFIG.totalMinutes) * 100);
      setCookingProgress(Math.round(pct * 10) / 10);
      setFlameFrame((f) => (f + 1) % 3);
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const remainingMin = Math.max(
    0,
    COOKING_CONFIG.totalMinutes - (Date.now() - COOKING_START_TIME.getTime()) / 1000 / 60,
  );

  const currentStepIdx = cookingSteps.reduce(
    (acc, step, i) => (cookingProgress >= step.threshold ? i : acc),
    0,
  );

  return (
    <div
      className={`transition-all duration-500 ease-in-out overflow-hidden ${
        show ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <Card className="border-orange-500/40 bg-orange-500/5 overflow-hidden relative">
        {/* 불꽃 배경 장식 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute bottom-0 opacity-10"
              style={{ left: `${10 + i * 16}%`, animationDelay: `${i * 0.3}s` }}
            >
              <div
                className="w-6 h-10 rounded-full bg-orange-400 animate-pulse"
                style={{ animationDuration: `${0.8 + (i % 3) * 0.3}s` }}
              />
            </div>
          ))}
        </div>

        <CardHeader className="pb-2 relative">
          <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <span className="text-xl" style={{ display: 'inline-block', animation: 'flicker 0.5s ease-in-out infinite alternate' }}>
              {(['🔥', '🍳', '♨️'] as const)[flameFrame]}
            </span>
            {COOKING_CONFIG.name}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5 relative">
          {/* 진행률 */}
          <div>
            <div className="flex items-end justify-between mb-2">
              <div>
                <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {cookingProgress.toFixed(1)}
                </span>
                <span className="text-lg text-orange-500">%</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {cookingProgress >= 100 ? '🎉 완성!' : '조리 중'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {cookingProgress >= 100 ? '서빙 준비 중' : `약 ${Math.ceil(remainingMin)}분 남음`}
                </p>
              </div>
            </div>

            {/* 프로그레스 바 */}
            <div className="relative h-5 w-full rounded-full bg-orange-100 dark:bg-orange-950 overflow-hidden">
              <div
                className="h-5 rounded-full transition-[width] duration-1000 ease-linear relative overflow-hidden"
                style={{
                  width: `${cookingProgress}%`,
                  background: 'linear-gradient(90deg, #f97316, #ea580c, #dc2626)',
                }}
              >
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s linear infinite',
                  }}
                />
              </div>
              {[20, 45, 70].map((pos) => (
                <div
                  key={pos}
                  className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-orange-300/60 animate-bounce"
                  style={{
                    left: `${(pos / 100) * cookingProgress}%`,
                    animationDuration: `${0.6 + pos * 0.01}s`,
                    display: cookingProgress > pos ? 'block' : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* 스팀 이펙트 */}
          <div className="flex justify-center gap-6 py-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col items-center gap-0.5" style={{ animationDelay: `${i * 0.4}s` }}>
                {[0, 1, 2].map((j) => (
                  <div
                    key={j}
                    className="w-1.5 h-1.5 rounded-full bg-orange-300/50 animate-bounce"
                    style={{ animationDelay: `${i * 0.4 + j * 0.15}s`, animationDuration: '1.2s' }}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* 단계 스텝 */}
          <div className="flex items-center">
            {cookingSteps.map((step, i, arr) => (
              <div key={step.label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`h-3.5 w-3.5 rounded-full border-2 transition-all duration-700 ${
                      i < currentStepIdx
                        ? 'bg-orange-500 border-orange-500'
                        : i === currentStepIdx
                          ? 'bg-orange-500 border-orange-500 animate-pulse scale-125'
                          : 'bg-background border-muted-foreground/30'
                    }`}
                  />
                  <span
                    className={`text-[10px] whitespace-nowrap ${
                      i === currentStepIdx
                        ? 'text-orange-600 dark:text-orange-400 font-bold'
                        : i < currentStepIdx
                          ? 'text-muted-foreground'
                          : 'text-muted-foreground/40'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-1 mb-5 transition-all duration-700 ${
                      i < currentStepIdx ? 'bg-orange-500' : 'bg-muted-foreground/20'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
