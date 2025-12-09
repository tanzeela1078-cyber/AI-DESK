import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NewsProvider } from "@/contexts/NewsContext";

export const metadata: Metadata = {
  title: "AI Desk - Your AI News Hub",
  description: "Stay updated with the latest AI news, videos, and insights from multiple sources powered by AI agents.",
  keywords: ["AI", "Artificial Intelligence", "News", "Technology", "Machine Learning"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <NewsProvider>
            {children}
          </NewsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
