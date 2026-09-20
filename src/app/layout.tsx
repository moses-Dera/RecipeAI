import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/ToastContext";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const harmond = localFont({
  src: [
    {
      path: "../../public/fonts/Harmond - Free For Personal Use/Harmond-ExtraBoldExpanded.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/fonts/Harmond - Free For Personal Use/Harmond-ExtBdItaExp.otf",
      weight: "800",
      style: "italic",
    },
    {
      path: "../../public/fonts/Harmond - Free For Personal Use/Harmond-SemiBoldCondensed.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Harmond - Free For Personal Use/Harmond-SemBdItaCond.otf",
      weight: "600",
      style: "italic",
    },
  ],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "RecipeAI | Discover Nigerian Cuisine",
  description: "AI-powered web app for discovering, managing, and sharing traditional Nigerian recipes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${harmond.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-bg-primary text-text-primary">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <ToastProvider>
              <Navbar />
              <main className="flex-grow w-full max-w-7xl mx-auto px-4 pt-4 pb-8">
                {children}
              </main>
              <Footer />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
