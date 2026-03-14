import type { Metadata } from "next";
import { ExperiencesPage } from "@/pages/experiences";

export const metadata: Metadata = {
  title: "체험 프로그램",
  description: "자연스런 캠핑장의 다양한 체험 프로그램을 만나보세요.",
};

export default function Page() {
  return <ExperiencesPage />;
}
