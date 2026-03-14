import type { Metadata } from "next";
import { AboutPage } from "@/pages/about";

export const metadata: Metadata = {
  title: "회사 소개",
  description: "자연스런 캠핑장 회사 소개입니다.",
};

export default function Page() {
  return <AboutPage />;
}
