import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cheap Mind AI",
    short_name: "Cheap Mind",
    description: "A fast, refined AI assistant for answers, images and photo edits.",
    start_url: "/chat",
    display: "standalone",
    background_color: "#faf5e8",
    theme_color: "#1c1811",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
