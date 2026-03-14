"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

const experiences = [
  {
    id: "cure-fish",
    title: "큐어피쉬 체험",
    description: "자연 속 청정 계곡에서 즐기는 힐링 피쉬 테라피. 물고기와 함께하는 특별한 자연 치유 경험.",
    image: "/exp-cure-fish.jpg",
    tag: "힐링",
  },
  {
    id: "forest-product",
    title: "임산물 체험",
    description: "계절마다 달라지는 산의 보물, 신선한 임산물을 직접 채취하고 맛보는 자연 교감 프로그램.",
    image: "/exp-forest-product.jpg",
    tag: "자연",
  },
  {
    id: "event-program",
    title: "이벤트 프로그램",
    description: "계절별·시즌별로 진행되는 다채로운 이벤트. 가족, 친구, 연인과 함께하는 특별한 추억 만들기.",
    image: "/exp-event.jpg",
    tag: "이벤트",
  },
  {
    id: "pine-echo",
    title: "소나무동산 메아리 체험",
    description: "울창한 소나무 동산에서 자연의 소리를 담은 메아리 체험. 피톤치드 가득한 숲길 산책.",
    image: "/exp-pine-echo.jpg",
    tag: "산림욕",
  },
  {
    id: "wind-valley",
    title: "바람골길 맑은 공기 체험",
    description: "제천의 깊은 계곡을 따라 흐르는 청정 바람. 맑은 공기 속 트레킹으로 몸과 마음을 정화하세요.",
    image: "/exp-wind-valley.jpg",
    tag: "트레킹",
  },
]

export function ExperiencesPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden bg-linear-to-b from-primary/5 to-background pt-20 pb-12">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button variant="ghost" asChild className="mb-6 -ml-2">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                홈으로
              </Link>
            </Button>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4 text-sm font-medium">
              자연스런 캠핑장
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              체험 프로그램
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              충청북도 제천의 청정 자연 속에서 특별한 체험을 경험해보세요.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Experience Grid */}
      <div className="container mx-auto px-4 md:px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative rounded-3xl border border-border/50 overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-default group"
            >
              {/* Image */}
              <div className="relative h-52 w-full overflow-hidden">
                <Image
                  src={exp.image}
                  alt={exp.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium text-foreground border border-border/50">
                  {exp.tag}
                </span>
              </div>

              {/* Content */}
              <div className="p-6 bg-card">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {exp.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {exp.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-16 text-center p-8 rounded-3xl bg-secondary/30 border border-border"
        >
          <h2 className="text-2xl font-bold text-foreground mb-2">예약 및 문의</h2>
          <p className="text-muted-foreground mb-6">체험 프로그램 예약은 전화로 문의해주세요.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <a
              href="tel:01064639641"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors"
            >
              📞 010-6463-9641
            </a>
            <span className="text-sm text-muted-foreground">
              충청북도 제천시 백운면 구학산로 1096-1
            </span>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
