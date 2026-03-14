"use client"

import { motion } from "framer-motion"
import { Brain, Map, Smartphone, ArrowRight, Lock } from "lucide-react"
import Link from "next/link"
import { useUser, SignInButton } from "@clerk/nextjs"

const features = [
  {
    icon: Brain,
    title: "AI 스케줄러",
    description: "가족의 에너지 레벨과 바이오 리듬에 맞춘 맞춤형 일정. 다음에 뭘 할지 고민할 필요가 없습니다.",
    color: "bg-primary",
    href: "/schedule",
    cta: "스케줄 보기",
  },
  {
    icon: Map,
    title: "3D 맵 뷰어",
    description: "출발 전 캠핑 사이트를 실감나는 3D로 미리 확인하세요. 텐트를 칠 최적의 장소를 찾아보세요.",
    color: "bg-secondary",
    href: "/dashboard",
    cta: "맵 열기",
  },
  {
    icon: Smartphone,
    title: "스마트 체크인",
    description: "대기줄 없이 바로 텐트로. 비대면 QR 체크인 시스템으로 빠르게 입장하세요.",
    color: "bg-accent",
    href: "/bookings",
    cta: "체크인 하기",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export function FeaturesSection() {
  const { isSignedIn } = useUser()

  return (
    <section id="features" className="py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            왜 자연스런 캠핑장인가요?
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            <span className="text-primary">스마트 캠핑</span>에
            <br />
            필요한 모든 것
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            계획부터 철수까지, 캠핑의 모든 순간을 자연스런 캠핑장이 함께합니다.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
        >
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} isSignedIn={!!isSignedIn} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function FeatureCard({
  feature,
  isSignedIn,
}: {
  feature: (typeof features)[number]
  isSignedIn: boolean
}) {
  const Icon = feature.icon

  const cardContent = (
    <>
      {/* Icon */}
      <div
        className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
      <p className="text-muted-foreground leading-relaxed mb-6">{feature.description}</p>

      {/* CTA */}
      <div className="flex items-center gap-2 text-sm font-medium mt-auto">
        {isSignedIn ? (
          <span className="text-primary flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
            {feature.cta}
            <ArrowRight className="w-4 h-4" />
          </span>
        ) : (
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            로그인 후 이용 가능
          </span>
        )}
      </div>

      {/* Hover gradient */}
      <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </>
  )

  const baseClass =
    "group relative bg-card/70 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all flex flex-col"

  if (isSignedIn) {
    return (
      <motion.div variants={itemVariants} whileHover={{ y: -8, scale: 1.02 }} transition={{ duration: 0.3 }}>
        <Link href={feature.href} className={`${baseClass} hover:border-primary/40 cursor-pointer`}>
          {cardContent}
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div variants={itemVariants} whileHover={{ y: -4, scale: 1.01 }} transition={{ duration: 0.3 }}>
      <SignInButton mode="modal">
        <button type="button" className={`${baseClass} w-full text-left cursor-pointer hover:border-border`}>
          {cardContent}
        </button>
      </SignInButton>
    </motion.div>
  )
}
