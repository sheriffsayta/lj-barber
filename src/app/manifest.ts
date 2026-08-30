import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest
{
  return {
    name: "LJ BARBER",
    short_name: "LJ BARBER",
    description: "Gestion professionnelle LJ BARBER",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    orientation: "portrait",

    icons: [
      {
        src: "/logo/logo-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo/logo-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}