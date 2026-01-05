import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Demos - Coaching Premium",
  description: "Application de coaching premium pour suivre vos clients, gérer les séances et facturer facilement.",
  keywords: ["coaching", "fitness", "sport", "entraînement", "Demos"],
  authors: [{ name: "Demos" }],
  openGraph: {
    title: "Demos - Coaching Premium",
    description: "Application de coaching premium pour suivre vos clients, gérer les séances et facturer facilement.",
    type: "website",
    siteName: "Demos",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Demos - Coaching Premium",
    description: "Application de coaching premium pour suivre vos clients, gérer les séances et facturer facilement.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#dc2626", // Rouge
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased page-transition`}
      >
        {children}
      </body>
    </html>
  );
}
