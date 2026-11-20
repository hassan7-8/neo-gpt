import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dark-synapse.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Cheap Mind AI: Free AI Chat, Image Generator & Photo Editor",
    template: "%s | Cheap Mind AI",
  },
  description:
    "Cheap Mind AI is a free, fast AI assistant. Chat in English or Urdu, create images with Nano Image, edit photos, and save your chats. By Cheap Mind organization.",
  keywords: [
    "Cheap Mind AI",
    "free AI chat",
    "AI image generator",
    "AI photo editor",
    "Urdu AI chatbot",
    "AI for students",
  ],
  applicationName: "Cheap Mind AI",
  openGraph: {
    type: "website",
    siteName: "Cheap Mind AI",
    title: "Cheap Mind AI: Free AI Chat, Image Generator & Photo Editor",
    description: "Chat, create images and edit photos with a fast, free AI assistant. English and Urdu supported.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Cheap Mind AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cheap Mind AI",
    description: "Free AI chat, image generator and photo editor.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="UrUZ-nqxdKB5WZkoimEGyxPtGy0IG5PYj_KS4QD1Rso"
        />
        {/* Ad network scripts */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script data-cfasync="false" src="https://abscloud.org/1/0b0c3f336d2a85410c852071f13d646e"></script>
      </head>
      <body className={`${dmSans.variable} ${playfair.variable} ${dmSans.className}`}>{children}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script data-cfasync="false" src="https://bauval.org/14/1b05e1ecca02062bc43a54ef7bcccb8a"></script>
      </body>
    </html>
  );
}
