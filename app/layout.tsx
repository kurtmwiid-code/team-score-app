import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TeamScore Pro | Trusted Home Buyers",
  description: "Enterprise Performance Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 text-slate-900 antialiased`}
      >
        {/* Full-screen layout - no sidebar here since we'll have it in each page */}
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}