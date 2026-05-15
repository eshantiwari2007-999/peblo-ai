import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Prevents auto-zoom on mobile inputs
};

export const metadata: Metadata = {
  title: {
    default: "Peblo — AI Notes Workspace",
    template: "%s | Peblo",
  },
  description:
    "A premium AI-powered notes workspace. Capture ideas, generate summaries, extract action items, and share knowledge — all in one place.",
  keywords: ["notes", "AI", "productivity", "workspace", "Gemini"],
  authors: [{ name: "Peblo" }],
  openGraph: {
    title: "Peblo — AI Notes Workspace",
    description: "Premium AI-powered notes workspace built with Next.js and Google Gemini.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

