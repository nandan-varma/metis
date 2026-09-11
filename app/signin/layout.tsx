import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Metis account to continue tracking your nutrition.",
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
