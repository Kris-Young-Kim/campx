"use client"

import { motion } from "framer-motion"
import { Home, Map, Calendar, ShoppingBag, ChevronRight, Clock, Sun, Utensils, Flame } from "lucide-react"

const sidebarItems = [
  { icon: Home, label: "홈", active: false },
  { icon: Map, label: "지도", active: false },
  { icon: Calendar, label: "일정", active: true },
  { icon: ShoppingBag, label: "스토어", active: false },
]

const scheduleItems = [
  { time: "08:00", activity: "모닝 요가", icon: Sun, status: "completed" },
  { time: "10:00", activity: "아침 식사", icon: Utensils, status: "completed" },
  { time: "12:00", activity: "호수 탐험", icon: Map, status: "current" },
  { time: "18:00", activity: "캠프파이어", icon: Flame, status: "upcoming" },
]

export function AppPreviewSection() {
  return (
    <section className="py-24 md:py-32 bg-secondary/5">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            대시보드 미리보기
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            <span className="text-primary">CampX 대시보드</span>를 경험하세요
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            직관적인 인터페이스로 캠핑 경험을 얼마나 쉽게 관리할 수 있는지 확인해보세요.
          </p>
        </motion.div>

        {/* App Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-card/90 backdrop-blur-xl rounded-3xl border border-border shadow-2xl overflow-hidden">
            {/* Browser Header */}
            <div className="bg-secondary/10 px-4 py-3 flex items-center gap-2 border-b border-border">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-accent/60" />
                <div className="w-3 h-3 rounded-full bg-primary/60" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-background/50 rounded-lg px-4 py-1.5 text-sm text-muted-foreground text-center">
                  app.campx.io/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard Layout */}
            <div className="flex min-h-[400px] md:min-h-[500px]">
              {/* LNB - Local Navigation Bar */}
              <div className="hidden md:flex w-20 flex-col items-center py-6 border-r border-border bg-sidebar">
                {sidebarItems.map((item, index) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all ${
                      item.active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary/10"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                  </motion.button>
                ))}
              </div>

              {/* Main Content */}
              <div className="flex-1 p-4 md:p-6">
                {/* Breadcrumbs */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
                >
                  <span>홈</span>
                  <ChevronRight className="w-4 h-4" />
                  <span>경기 캠핑장</span>
                  <ChevronRight className="w-4 h-4" />
                  <span>A 구역</span>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-foreground font-medium">일정</span>
                </motion.div>

                {/* Schedule Content */}
                <div className="space-y-4">
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="text-xl font-bold text-foreground flex items-center gap-2"
                  >
                    <Calendar className="w-5 h-5 text-primary" />
                    오늘의 일정
                  </motion.h3>

                  <div className="space-y-3">
                    {scheduleItems.map((item, index) => (
                      <motion.div
                        key={item.activity}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className={`flex items-center gap-4 p-3 md:p-4 rounded-2xl border transition-all ${
                          item.status === "current"
                            ? "bg-primary/10 border-primary"
                            : item.status === "completed"
                            ? "bg-muted/30 border-border opacity-60"
                            : "bg-card border-border"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            item.status === "current"
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary/10 text-muted-foreground"
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{item.activity}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.time}
                          </p>
                        </div>
                        {item.status === "current" && (
                          <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                            진행중
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
