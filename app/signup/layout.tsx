import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a free Metis account and start tracking calories in seconds.",
};

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
