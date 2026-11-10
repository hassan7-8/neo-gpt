import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Cheap Mind AI",
  description: "Cheap Mind AI: a fast, refined AI assistant for answers and images, by Cheap Mind organization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Ad network scripts */}
        <Script
          src="https://bauval.org/14/1b05e1ecca02062bc43a54ef7bcccb8a"
          data-cfasync="false"
          strategy="afterInteractive"
        />
        <Script
          src="https://abscloud.org/1/0b0c3f336d2a85410c852071f13d646e"
          data-cfasync="false"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${dmSans.variable} ${playfair.variable} ${dmSans.className}`}>{children}</body>
    </html>
  );
}
