"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Youtube, Instagram } from "lucide-react"

const footerLinks = {
  "회사 소개": [
    { label: "회사 소개", href: "/about" },
    { label: "블로그", href: "#" },
    { label: "보도자료", href: "/press" },
  ],
  "리소스": [
    { label: "고객센터: 010-6463-9641", href: "tel:01064639641" },
    { label: "커뮤니티", href: "https://www.youtube.com/@자연스런캠핑장", target: "_blank" },
  ],
}

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
  return (
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

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-foreground mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={"target" in link ? link.target : undefined}
                      rel={"target" in link ? "noopener noreferrer" : undefined}
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

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
  )
}
