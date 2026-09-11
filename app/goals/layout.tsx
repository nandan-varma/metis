import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Goals & Settings",
  description: "Set your daily calorie and macro targets.",
  robots: { index: false, follow: false },
};

export default function GoalsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
