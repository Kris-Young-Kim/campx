"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Sparkles, Activity, Flame, Box } from "lucide-react"
import { Button } from "@/components/ui/button"

const floatingCards = [
  {
    icon: Activity,
    label: "피로도",
    value: "낮음",
    position: "top-20 -left-4 md:left-10",
  },
  {
    icon: Flame,
    label: "추천 활동",
    value: "캠프파이어",
    position: "top-40 -right-4 md:right-10",
  },
  {
    icon: Box,
    label: "다음 일정",
    value: "큐어피쉬 체험",
    position: "bottom-20 left-0 md:left-20",
  },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-background" />

      {/* Decorative circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI 기반 캠핑 경험</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight text-balance"
          >
            캠핑은{" "}
            <span className="text-primary">AI</span>가 관리하고,
            <br />
            당신은{" "}
            <span className="text-accent">자연</span>을 즐기세요.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty"
          >
            스마트 체크인부터 바이오 리듬 기반 일정까지.
            자연스런 캠핑장이 번거로움을 대신 해결하고, 당신은 추억 만들기에 집중하세요.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8 py-6 text-lg font-semibold shadow-lg shadow-accent/30"
              asChild
            >
              <Link href="/experiences">
                <Sparkles className="w-5 h-5 mr-2" />
                모험 시작하기
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 py-6 text-lg font-semibold border-2 bg-transparent"
              asChild
            >
              <Link href="/about">
                회사 소개
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Floating Cards */}
        <div className="hidden lg:block">
          {floatingCards.map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.5 + index * 0.15,
              }}
              className={`absolute ${card.position}`}
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.3,
                }}
                className="bg-card/90 backdrop-blur-xl border border-border rounded-2xl p-4 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <card.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                    <p className="text-sm font-semibold text-foreground">{card.value}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
        >
          <motion.div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
        </motion.div>
      </motion.div>
    </section>
  )
}
