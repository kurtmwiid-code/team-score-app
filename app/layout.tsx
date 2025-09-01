import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FilePlus, BarChart3, Settings, Home } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QC Dashboard",
  description: "Sales Rep Scoring System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}
      >
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
            <div className="flex items-center gap-3 px-6 py-4 border-b bg-gray-50">
              {/* Logo (update path if needed) */}
              <img
                src="/THB.webp"
                alt="Trusted Home Buyers Logo"
                className="h-12 object-contain"
              />
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
              <a
                href="/"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-[#1F3C88]/10 hover:text-[#1F3C88] transition"
              >
                <Home className="h-4 w-4" />
                Home
              </a>
              <a
                href="/submit"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-[#1F3C88]/10 hover:text-[#1F3C88] transition"
              >
                <FilePlus className="h-4 w-4" />
                Submit Score
              </a>
              <a
                href="/analysis"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-[#1F3C88]/10 hover:text-[#1F3C88] transition"
              >
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </a>
              <a
                href="/settings"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-[#1F3C88]/10 hover:text-[#1F3C88] transition"
              >
                <Settings className="h-4 w-4" />
                Settings
              </a>
            </nav>

            <footer className="px-6 py-4 border-t text-xs text-gray-500">
              © {new Date().getFullYear()} Trusted Home Buyers
            </footer>
          </aside>

          {/* Main Content */}
          <main className="flex-1 bg-gray-50 p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
