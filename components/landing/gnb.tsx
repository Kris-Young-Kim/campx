"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
  { label: "주요 기능", href: "#features" },
  { label: "요금제", href: "#pricing" },
  { label: "파트너", href: "#partners" },
]

export function GNB() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-card/80 backdrop-blur-xl shadow-lg border-b border-border"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-natural-camping.jpg"
            alt="자연스런 캠핑장 로고"
            width={40}
            height={40}
            className="rounded-xl"
          />
          <span className="text-xl font-bold text-foreground">자연스런 캠핑장</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" className="text-foreground" asChild>
            <Link href="/auth/sign-in">로그인</Link>
          </Button>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-6" asChild>
            <Link href="/onboarding">시작하기</Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] bg-background">
            <SheetTitle className="sr-only">모바일 메뉴</SheetTitle>
            <div className="flex flex-col gap-8 mt-8">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo-natural-camping.jpg"
                  alt="자연스런 캠핑장 로고"
                  width={40}
                  height={40}
                  className="rounded-xl"
                />
                <span className="text-xl font-bold text-foreground">자연스런 캠핑장</span>
              </div>
              <nav className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-lg text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="flex flex-col gap-3 mt-4">
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/auth/sign-in" onClick={() => setMobileOpen(false)}>
                    로그인
                  </Link>
                </Button>
                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                  <Link href="/onboarding" onClick={() => setMobileOpen(false)}>
                    시작하기
                  </Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </motion.header>
  )
}
