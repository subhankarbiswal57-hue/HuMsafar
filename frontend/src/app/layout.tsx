import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "HuMsafar — AI-Powered Infrastructure Resilience Platform",
  description: "Predictive resilience metrics, GIS spatial mapping, and AI-driven infrastructure maintenance for smarter roads, bridges, and transit systems.",
  keywords: "infrastructure, AI, GIS, road maintenance, bridge monitoring, transit, smart city, resilience",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen font-sans antialiased bg-surface-900 text-surface-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
