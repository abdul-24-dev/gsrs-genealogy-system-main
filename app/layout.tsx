import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/ThemeContext";

export const metadata: Metadata = {
  title: "GSRS - Genealogical Search and Record System",
  description: "A production-grade, local-first genealogical search, family record, and generational health preservation system.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-emerald-600 selection:text-white">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
