import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Metis - Free Calorie & Nutrition Tracker",
    template: "%s | Metis",
  },
  description:
    "Track calories, macros, water, and workouts in seconds. Scan any barcode for instant nutrition facts, set personalized goals, and save favorites for one-tap logging.",
  keywords: [
    "calorie tracker",
    "nutrition tracker",
    "barcode scanner",
    "macro tracker",
    "food diary",
    "water intake tracker",
    "diet app",
  ],
  authors: [{ name: "Metis" }],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Metis",
    title: "Metis - Free Calorie & Nutrition Tracker",
    description:
      "Track calories, macros, water, and workouts in seconds. Scan any barcode for instant nutrition facts.",
  },
  twitter: {
    card: "summary",
    title: "Metis - Free Calorie & Nutrition Tracker",
    description:
      "Track calories, macros, water, and workouts in seconds. Scan any barcode for instant nutrition facts.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
