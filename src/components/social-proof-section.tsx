"use client"

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"

const partners = [
  "NatureCamp",
  "Forest Valley",
  "Pine Hill Resort",
  "Lake View Camp",
  "Mountain Base",
]

const testimonials = [
  {
    content: "자연스런 캠핑장 덕분에 가족 캠핑이 완전히 달라졌어요. AI 스케줄러가 정말 대단해요!",
    author: "김지수",
    role: "4인 가족",
    rating: 5,
  },
  {
    content: "캠핑 초보인데 3D 맵 미리보기로 도착 전에 자리를 확인할 수 있어서 안심이 됐어요.",
    author: "박민호",
    role: "캠핑 입문자",
    rating: 5,
  },
  {
    content: "스마트 체크인 덕분에 시간을 정말 많이 아꼈어요. 바로 자연을 즐길 수 있었죠!",
    author: "이유나",
    role: "주말 캠퍼",
    rating: 5,
  },
]

export function SocialProofSection() {
  return (
    <section id="partners" className="py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        {/* Trusted By */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {partners.map((partner, index) => (
              <motion.div
                key={partner}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-xl md:text-2xl font-bold text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                {partner}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            캠퍼들의 이야기
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground text-balance">
            <span className="text-primary">행복한 가족들</span>이 사랑하는 서비스
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + index * 0.15 }}
              whileHover={{ y: -5 }}
              className="bg-card/70 backdrop-blur-xl border border-border rounded-3xl p-6 md:p-8 shadow-lg"
            >
              <Quote className="w-8 h-8 text-primary/30 mb-4" />
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-accent text-accent"
                  />
                ))}
              </div>
              <div>
                <p className="font-semibold text-foreground">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
