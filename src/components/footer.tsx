"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Youtube, Instagram, X, Phone, MapPin } from "lucide-react"

const partners = [
  "큐어 (휴게음식점)",
  "꿈꾸는 민박",
  "세계기독교박물관",
  "퍼스트무버",
]

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "https://www.youtube.com/@자연스런캠핑장", label: "Youtube" },
]

export function Footer() {
  const [showContact, setShowContact] = useState(false)

  return (
    <>
      <footer className="bg-secondary/5 border-t border-border">
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Logo & Description */}
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Image
                  src="/logo-natural-camping.jpg"
                  alt="자연스런 캠핑장 로고"
                  width={40}
                  height={40}
                  className="rounded-xl"
                />
                <span className="text-xl font-bold text-foreground">자연스런 캠핑장</span>
              </Link>
              <p className="text-muted-foreground mb-2 max-w-xs text-sm">
                충청북도 제천시 백운면 구학산로 1096-1
              </p>
              <p className="text-muted-foreground mb-6 max-w-xs text-sm">
                문의: 010-6463-9641
              </p>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -3 }}
                    className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* 회사 소개 */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">회사 소개</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    회사 소개
                  </Link>
                </li>
                <li>
                  <Link href="/press" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    보도자료
                  </Link>
                </li>
              </ul>
            </div>

            {/* 리소스 */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">리소스</h4>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => setShowContact(true)}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm text-left"
                  >
                    고객센터
                  </button>
                </li>
                <li>
                  <Link
                    href="https://www.youtube.com/@자연스런캠핑장"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    커뮤니티
                  </Link>
                </li>
              </ul>
            </div>

            {/* Partners */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">파트너</h4>
              <ul className="space-y-3">
                {partners.map((partner) => (
                  <li key={partner}>
                    <span className="text-muted-foreground text-sm">{partner}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © 2026 자연스런 캠핑장. All rights reserved.
            </p>
            <p className="text-muted-foreground text-sm">
              자연과 함께하는 특별한 경험
            </p>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      <AnimatePresence>
        {showContact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowContact(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">영업팀 문의</h3>
                <button
                  onClick={() => setShowContact(false)}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <a
                  href="tel:01064639641"
                  className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">전화 문의</p>
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      010-6463-9641
                    </p>
                  </div>
                </a>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">주소</p>
                    <p className="font-semibold text-foreground text-sm">
                      충청북도 제천시 백운면<br />구학산로 1096-1
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
