import { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://forum.florencewithlocals.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/settings/", "/auth/", "/api/", "/search", "/sentry-test", "/monitoring"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
