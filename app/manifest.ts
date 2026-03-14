import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    name: "자연스런 캠핑장",
    short_name: "자연스런 캠핑장",
    description:
      "충청북도 제천의 청정 자연 속 체험 캠핑장. 큐어피쉬, 임산물, 바람골길 맑은 공기 체험.",
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
        label: "자연스런 캠핑장 대시보드",
      },
      {
        src: "/screenshot-narrow.png",
        sizes: "750x1334",
        type: "image/png",
        form_factor: "narrow",
        label: "자연스런 캠핑장 모바일 뷰",
      },
    ],
  };
}
