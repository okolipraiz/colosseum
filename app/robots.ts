import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://useforecast.cc";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api",
          "/admin",
          "/earn",
          "/portfolio",
          "/wallets",
          "/settings",
          "/account",
          "/profile",
          "/delete-account",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
