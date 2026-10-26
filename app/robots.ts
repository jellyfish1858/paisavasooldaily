import { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/secure-admin-panel",
        "/secure-admin-panel/",
        "/admin",
        "/admin/",
        "/api/",
        "/compare?*",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
