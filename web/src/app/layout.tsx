import type { Metadata } from "next";
import { Cormorant_Garamond, Quicksand } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mylunarphase.com";
const siteName = "MyLunarPhase";
const title = "MyLunarPhase | Women's Hormone Wellness";
const description =
  "Personalized nutrition, movement, self-care, and moon phase wisdom for every stage — from regular cycles to perimenopause and menopause.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: [
    "women's health",
    "cycle tracking",
    "hormone wellness",
    "menstrual cycle",
    "perimenopause",
    "menopause",
    "moon phases",
    "nutrition",
    "self-care",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName,
    title,
    description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "MyLunarPhase — Women's Hormone Wellness",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: siteName,
              url: siteUrl,
              description,
              applicationCategory: "HealthApplication",
              operatingSystem: "Web, iOS, Android",
              offers: {
                "@type": "Offer",
                price: "6.99",
                priceCurrency: "USD",
                description: "Monthly subscription with 60-day free trial",
              },
              author: {
                "@type": "Organization",
                name: "MyLunarPhase",
                url: siteUrl,
              },
            }),
          }}
        />
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
          />
        )}
      </head>
      <body
        className={`${cormorant.variable} ${quicksand.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
