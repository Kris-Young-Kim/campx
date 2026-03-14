import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardPage } from "@/pages/dashboard";
import { getSession } from "@/shared/lib/auth-server";

export const metadata: Metadata = {
  title: "대시보드",
  description: "예약 현황과 빠른 액션을 한눈에 확인하세요",
};

export default async function Page() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/sign-in");
  }

  return <DashboardPage />;
}
