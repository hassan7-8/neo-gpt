// app/layout.tsx

import './globals.css';
import { ReactNode } from 'react';
import Script from 'next/script';

export const metadata = {
  title: 'Dark Synapse',
  description: 'Your AI Assistant',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-8621118119905256" />
      </head>
      <body>
        <Script
          id="adsense-script"
          async
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8621118119905256"
          crossOrigin="anonymous"
        />
        {children}
      </body>
    </html>
  );
}
