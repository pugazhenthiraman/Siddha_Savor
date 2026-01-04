import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./input-fix.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Siddha Savor - Your Trusted Healthcare Partner",
  description: "Experience personalized healthcare with expert doctors. Book appointments, manage health records, and get the care you deserve with Siddha Savor.",
  keywords: "healthcare, doctors, appointments, telemedicine, medical consultation, health records",
  authors: [{ name: "Siddha Savor Team" }],
  creator: "Siddha Savor",
  publisher: "Siddha Savor",
  openGraph: {
    title: "Siddha Savor - Your Trusted Healthcare Partner",
    description: "Experience personalized healthcare with expert doctors. Book appointments, manage health records, and get the care you deserve.",
    url: "https://siddhasavor.com",
    siteName: "Siddha Savor",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Siddha Savor Healthcare Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Siddha Savor - Your Trusted Healthcare Partner",
    description: "Experience personalized healthcare with expert doctors.",
    images: ["/twitter-image.jpg"],
  },
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
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#10b981" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
