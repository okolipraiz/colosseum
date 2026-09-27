import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://useforecast.cc";
  return [
  
    { url: `${baseUrl}`, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/login`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/signup`, lastModified: new Date(), priority: 0.8 },
    {
      url: `${baseUrl}/markets`,
      lastModified: new Date(),
      priority: 0.6
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: new Date(),
      priority: 0.6
    },
    {
      url: `${baseUrl}/contact-us`,
      lastModified: new Date(),
      priority: 0.6
    },
    {
      url: `${baseUrl}/tos`,
      lastModified: new Date(),
      priority: 0.6
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      priority: 0.6
    },
  ];
}
