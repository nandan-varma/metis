import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: siteUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/signin`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/signup`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];
}
