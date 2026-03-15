"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, ExternalLink, Newspaper, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

const pressItems = [
  {
    id: 1,
    outlet: "굿모닝충청",
    outletUrl: "https://www.goodmorningcc.com",
    title: "[청년이 답이다] 캠핑의 최고 가치는 자연…제천 '모두의 숲' 주목",
    summary:
      "충청북도 제천시 백운면 박달재와 다리재 사이 숲속 깊은 곳에 자리한 '모두의 숲'. 숲이라는 공간과 시간, 그리고 사람의 가치를 결합해 진정한 자연을 만드는 캠핑장으로 주목받고 있다. 청정 계곡에서의 다슬기 채취, 도토리·산나물·버섯 등 임산물 체험을 통해 모두를 위한 힐링 공간으로 자리잡고 있다.",
    href: "https://www.goodmorningcc.com/news/articleView.html?idxno=429213",
    date: "2025",
    tag: "캠핑장 소개",
  },
]

export function PressPage() {
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
              <Newspaper className="w-4 h-4" />
              언론 보도
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              보도자료
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              자연스런 캠핑장에 관한 언론 보도 및 미디어 자료를 확인하세요.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Press List */}
      <div className="container mx-auto px-4 md:px-6 pb-24">
        <div className="max-w-3xl mx-auto space-y-6">
          {pressItems.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block group bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Meta */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                        {item.outlet}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-secondary/20 text-xs font-medium text-muted-foreground">
                        {item.tag}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                        <Calendar className="w-3 h-3" />
                        {item.date}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">
                      {item.title}
                    </h2>

                    {/* Summary */}
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {item.summary}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="shrink-0 w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground group-hover:border-primary group-hover:text-primary group-hover:bg-primary/5 transition-all">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </a>
            </motion.article>
          ))}
        </div>

        {/* Company Intro PDF */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="max-w-3xl mx-auto mt-12"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">회사 소개서</h2>
            <a
              href="/company-intro.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              새 탭에서 열기
            </a>
          </div>
          <div className="rounded-3xl overflow-hidden border border-border shadow-lg bg-card">
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent("https://naturalcamp.vercel.app/company-intro.pdf")}&embedded=true`}
              className="w-full"
              style={{ height: "80vh", minHeight: 600 }}
              title="자연스런 캠핑장 회사 소개서"
            />
          </div>
        </motion.div>
      </div>
    </main>
  )
}
