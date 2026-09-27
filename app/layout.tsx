import type { Metadata } from "next";
import "./globals.css";
import "./font.css";
import { ReactQueryClientProvider } from "@/components/ReactQueryClient";
import { Toaster } from "@/components/ui/sonner";
import AuthProvider from "@/context/auth-provider";
import WalletProvider from "@/context/wallet-provider";
import NotificationProvider from "@/context/notification-provider";
import ProgressBarProviders from "@/components/ProgressBarProvider";

const baseUrl = "https://useforecast.cc";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title:
    "Forecast by anomaly - Predict Outcomes, Analyze Trends & Earn",
  description:
    "A powerful prediction app to analyze trends, forecast outcomes, and maximize your earnings with smart insights.",
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: baseUrl,
  },
  keywords: [
    "forecast",
    "prediction",
    "prediction markets",
    "forecast markets",
    "social prediction",
    "trends",
    "market analysis",
    "finance",
    "crypto",
    "forex",
    "sports",
    "politics",
    "entertainment",
    "Forecast by anomaly",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Forecast by anomaly",
    description:
      "Analyze trends, forecast outcomes, and maximize your earnings.",
    url: baseUrl,
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

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      name: "Forecast by anomaly",
      url: baseUrl,
      description:
        "Analyze trends, forecast outcomes, and maximize your earnings.",
      publisher: {
        "@id": `${baseUrl}/#organization`,
      },
      sameAs: [
        "https://x.com/anomaly_hq",
        "https://www.instagram.com/anomaly_hq",
        "https://tiktok.com/@anomaly_hq",
      ],
    },
    {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: "Phace Company Ltd",
      url: "https://phace.vercel.app",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/og-image.png`,
      },
      sameAs: ["https://www.linkedin.com/company/phace-company/"],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        <ProgressBarProviders>
          <ReactQueryClientProvider>
            <AuthProvider>
              <NotificationProvider>
                <WalletProvider>
                  <Toaster />
                  {children}
                </WalletProvider>
              </NotificationProvider>
            </AuthProvider>
          </ReactQueryClientProvider>
        </ProgressBarProviders>
      </body>
    </html>
  );
}
