import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favorites",
  description: "Your saved foods for quick, one-tap logging.",
  robots: { index: false, follow: false },
};

export default function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
