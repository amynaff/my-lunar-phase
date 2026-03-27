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

export const metadata: Metadata = {
  title: "MyLunarPhase | Women's Hormone Wellness",
  description:
    "A comprehensive women's hormone wellness platform with personalized nutrition, movement, self-care, AI reflection, moon phase wisdom, and partner support.",
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
      </head>
      <body
        className={`${cormorant.variable} ${quicksand.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
