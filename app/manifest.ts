import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Metis - Calorie & Nutrition Tracker",
    short_name: "Metis",
    description:
      "Track calories, macros, water, and workouts. Scan any barcode for instant nutrition facts.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#a3e635",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
