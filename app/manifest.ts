import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    name: "CampX - AI 캠핑 가이드",
    short_name: "CampX",
    description:
      "AI 기반 맞춤형 캠핑 일정 추천 및 체크인 서비스",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#000000",
    categories: ["travel", "lifestyle"],
    lang: "ko",
    dir: "ltr",
    scope: "/",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/screenshot-wide.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "CampX 대시보드",
      },
      {
        src: "/screenshot-narrow.png",
        sizes: "750x1334",
        type: "image/png",
        form_factor: "narrow",
        label: "CampX 모바일 뷰",
      },
    ],
  };
}
