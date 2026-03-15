"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useAnimation, useScroll, useTransform } from "framer-motion"
import { Sparkles, Fish, Trees, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FireflyParticles } from "@/components/firefly-particles"

const row1 = [
  { src: "/hero-01.jpg", label: "소나무동산 메아리" },
  { src: "/hero-03.jpg", label: "큐어피쉬 체험" },
  { src: "/hero-05.jpg", label: "물놀이 체험" },
  { src: "/hero-07.jpg", label: "장작패기" },
]
const row2 = [
  { src: "/hero-02.jpg", label: "물놀이 체험" },
  { src: "/hero-04.jpg", label: "큐어피쉬 근접" },
  { src: "/hero-06.jpg", label: "다슬기 탐험대" },
  { src: "/hero-01.jpg", label: "소나무동산" },
]

const stats = [
  { icon: Fish,   label: "큐어피쉬 체험", value: "운영 중" },
  { icon: Trees,  label: "자연 체험",     value: "5가지" },
  { icon: Flame,  label: "캠프파이어",    value: "매일 저녁" },
]

/* ─── Infinite scroll strip ─────────────────────────────── */
function ImageStrip({
  images,
  reverse = false,
  speed = 28,
}: {
  images: { src: string; label: string }[]
  reverse?: boolean
  speed?: number
}) {
  const controls = useAnimation()
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const doubled = [...images, ...images]   // seamless loop

  const start = () =>
    controls.start({
      x: reverse ? ["0%", "50%"] : ["0%", "-50%"],
      transition: { duration: speed, repeat: Infinity, ease: "linear" },
    })

  useEffect(() => { start() }, [])          // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="overflow-hidden w-full"
      onMouseEnter={() => controls.stop()}
      onMouseLeave={() => { setHoveredIdx(null); start() }}
    >
      <motion.div
        animate={controls}
        className="flex gap-3 w-max"
        style={{ x: reverse ? "0%" : "0%" }}
      >
        {doubled.map((img, i) => (
          <motion.div
            key={`${img.src}-${i}`}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            animate={{
              scale: hoveredIdx === i ? 1.08 : 1,
              zIndex: hoveredIdx === i ? 20 : 0,
            }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-52 h-36 md:w-64 md:h-44 rounded-2xl overflow-hidden shrink-0 cursor-pointer border border-white/10 shadow-lg"
          >
            <Image
              src={img.src}
              alt={img.label}
              fill
              className="object-cover"
              sizes="256px"
            />
            {/* hover overlay */}
            <motion.div
              animate={{ opacity: hoveredIdx === i ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent flex items-end p-3"
            >
              <span className="text-white text-xs font-semibold">{img.label}</span>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

/* ─── Hero Section ───────────────────────────────────────── */
export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] })
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 80])

  const words1 = ["캠핑은", "AI가", "관리하고,"]
  const words2 = ["당신은", "자연을", "즐기세요."]

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20"
    >
      {/* Firefly particles */}
      <FireflyParticles />

      {/* Animated background blobs */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-[700px] h-[700px] bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.06, 0.12, 0.06] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 6 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-400/10 rounded-full blur-3xl"
        />
      </motion.div>

      {/* ── Top: Text + Stats ── */}
      <div className="container mx-auto px-4 md:px-6 relative z-10 pb-12 pt-8">
        <div className="max-w-3xl mx-auto text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-8"
          >
            <motion.div
              animate={{ rotate: [0, 18, -18, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 1.5 }}
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
            <span className="text-sm font-medium">[아무도 없던 숲 속에서] 산림, 에코-푸드테크 플랫폼</span>
          </motion.div>

          {/* Headline — word blur reveal */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
            <div className="flex flex-wrap justify-center gap-x-4 mb-1">
              {words1.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.75, delay: 0.15 + i * 0.13, ease: [0.16, 1, 0.3, 1] }}
                  className={i === 1 ? "text-primary" : ""}
                >
                  {word}
                </motion.span>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-x-4">
              {words2.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.75, delay: 0.55 + i * 0.13, ease: [0.16, 1, 0.3, 1] }}
                  className={i === 1 ? "text-accent" : ""}
                >
                  {word}
                </motion.span>
              ))}
            </div>
          </h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.0 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            "아무도 없던 숲속에서는 모든 것이 혁신입니다.
            <br />
            이 혁신이 자연과 인간에게 이로울 수 있기를 희망합니다."
            <br className="my-1" />
            <br />
            원시 자연의 극과 최첨단 기술의 극,
            <br />
            두 극과 극의 만남.
            <br />
            산림 DX 모델 · 에코푸드테크 플랫폼 · 자연스런 캠핑장
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.15 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-14"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
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
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 py-6 text-lg font-semibold border-2 bg-transparent"
                asChild
              >
                <Link href="/about">회사 소개</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            className="flex flex-wrap justify-center gap-6"
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4 + i * 0.1, type: "spring", stiffness: 200 }}
                whileHover={{ y: -4, scale: 1.05 }}
                className="flex items-center gap-2.5 bg-card/70 backdrop-blur-sm border border-border rounded-2xl px-4 py-2.5 shadow-sm"
              >
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <s.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-muted-foreground leading-none mb-0.5">{s.label}</p>
                  <p className="text-sm font-bold text-foreground">{s.value}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Bottom: Panoramic Image Strips ── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className="relative z-10 w-full space-y-3 pb-16"
      >
        {/* Fade edges */}
        <div className="absolute inset-y-0 left-0 w-24 bg-linear-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-linear-to-l from-background to-transparent z-10 pointer-events-none" />

        <ImageStrip images={row1} reverse={false} speed={32} />
        <ImageStrip images={row2} reverse={true}  speed={28} />
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10"
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
