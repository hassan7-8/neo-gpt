import type { Metadata } from "next";
import { DM_Sans, Fredoka } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka" });

export const metadata: Metadata = {
  title: "Cheap Mind AI",
  description: "Chat with Cheap Mind AI: fast answers and image generation in one clean screen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Site Verification Meta Tag */}
        <meta
          name="google-site-verification"
          content="UrUZ-nqxdKB5WZkoimEGyxPtGy0IG5PYj_KS4QD1Rso"
        />

        {/* Google AdSense Script */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8621118119905256"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${dmSans.variable} ${fredoka.variable} ${dmSans.className}`}>{children}</body>
    </html>
  );
}
