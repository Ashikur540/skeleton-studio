import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Skeleton Studio — Tailwind CSS Skeleton Generator",
    short_name: "Skeleton Studio",
    description:
      "Free skeleton generator & loading skeleton generator. Paste JSX, get production-ready Tailwind CSS skeleton loaders.",
    start_url: "/",
    display: "standalone",
    background_color: "#010d16",
    theme_color: "#10b981",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
