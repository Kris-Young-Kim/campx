"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Tent, Twitter, Instagram, Youtube, Github } from "lucide-react"

const footerLinks = {
  제품: ["기능", "가격", "데모", "모바일 앱"],
  회사: ["회사 소개", "채용", "블로그", "보도자료"],
  리소스: ["고객센터", "문서", "커뮤니티", "파트너"],
  법적고지: ["개인정보처리방침", "서비스 약관", "쿠키 정책", "GDPR"],
}

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "Youtube" },
  { icon: Github, href: "#", label: "Github" },
]

export function Footer() {
  return (
    <footer className="bg-secondary/5 border-t border-border">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Tent className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">CampX</span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-xs">
              모든 사람을 위한 야외 모험을 더 쉽고 즐겁게 만드는 AI 기반 캠핑 경험.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ y: -3 }}
                  className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-foreground mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2026 CampX. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm">
            야외를 사랑하는 사람들을 위해 정성스럽게 만들었습니다
          </p>
        </div>
      </div>
    </footer>
  )
}
