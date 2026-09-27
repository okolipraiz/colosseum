// app/markets/page.tsx  ← NO "use client"
import type { Metadata } from "next";
import MarketsClient from "@/components/dashboard/MarketsClient";

const baseUrl = "https://useforecast.cc";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Markets - Forecast by anomaly",
  description:
    "Explore the latest markets on Forecast by anomaly. Analyze trends, predict outcomes, and maximize your earnings with smart insights.",
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: `${baseUrl}/markets`,
  },
  openGraph: {
    title: "Forecast by anomaly",
    description:
      "Analyze trends, forecast outcomes, and maximize your earnings.",
    url: `${baseUrl}/markets`,
    siteName: "Forecast by anomaly",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Forecast by anomaly preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Forecast by anomaly",
    description:
      "Analyze trends, forecast outcomes, and maximize your earnings.",
    images: [`${baseUrl}/og-image.png`],
  },
};

export default function MarketsPage() {
  return <MarketsClient />;
}
