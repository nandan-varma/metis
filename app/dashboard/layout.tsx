import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your daily calories, macros, water, and activity at a glance.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
