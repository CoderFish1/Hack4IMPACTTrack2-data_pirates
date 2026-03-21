import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MedAI | Enterprise Healthcare AI",
  description: "MedAI bridges patient self-triage and hospital administration with secure, enterprise-grade clinical AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Add suppressHydrationWarning here!
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#030712] text-foreground">
        {/* Wrap children in the ThemeProvider */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="relative flex-1">
            {/* Ambient gradient + subtle grid for premium MedTech feel */}
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-20%,rgba(20,184,166,0.18),transparent_55%),radial-gradient(ellipse_at_10%_10%,rgba(16,185,129,0.10),transparent_45%),linear-gradient(to_bottom,rgba(255,255,255,0.03),transparent)]" />
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_45%,transparent_70%)]" />
            <div className="relative">{children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}