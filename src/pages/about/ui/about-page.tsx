"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, Phone, MapPin, Youtube, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden bg-linear-to-b from-primary/5 to-background pt-20 pb-12">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
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
            <div className="flex items-center gap-4 mb-4">
              <Image
                src="/logo-natural-camping.jpg"
                alt="자연스런 캠핑장 로고"
                width={56}
                height={56}
                className="rounded-2xl"
              />
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">자연스런 캠핑장</h1>
                <p className="text-muted-foreground mt-1">충청북도 제천시 백운면</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 pb-24 space-y-8">
        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <a
            href="tel:01064639641"
            className="flex items-center gap-3 p-5 rounded-2xl bg-primary/5 hover:bg-primary/10 transition-colors border border-border/50"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Phone className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">전화 문의</p>
              <p className="font-semibold text-foreground">010-6463-9641</p>
            </div>
          </a>

          <div className="flex items-center gap-3 p-5 rounded-2xl bg-secondary/10 border border-border/50">
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">주소</p>
              <p className="font-medium text-foreground text-sm">충청북도 제천시 백운면 구학산로 1096-1</p>
            </div>
          </div>

          <a
            href="https://www.youtube.com/@자연스런캠핑장"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-5 rounded-2xl bg-red-500/5 hover:bg-red-500/10 transition-colors border border-border/50"
          >
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
              <Youtube className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">유튜브 채널</p>
              <p className="font-semibold text-foreground">자연스런 캠핑장</p>
            </div>
          </a>
        </motion.div>

        {/* Company Intro PDF Embed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
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
              src="/company-intro.pdf"
              className="w-full"
              style={{ height: "80vh", minHeight: "600px" }}
              title="자연스런 캠핑장 회사 소개서"
            />
          </div>
        </motion.div>
      </div>
    </main>
  )
}
