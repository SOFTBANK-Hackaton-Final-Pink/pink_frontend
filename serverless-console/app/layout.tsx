import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RecentFunctions from "@/components/sidebar/RecentFunctions";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Serverless Functions Console",
  description: "함수 개요 · 생성 · 실행 관리 콘솔",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}
      >
        <div className="min-h-screen flex bg-gradient-to-br from-[#ffb7d5] via-[#ffcba4] to-[#b4e7ce]">
          <aside className="hidden md:flex w-64 flex-col glass-card m-4 shadow-lg sticky top-4 self-start h-[calc(100vh-2rem)] overflow-auto">
            <div className="flex items-center gap-3 px-5 py-6 border-b border-[var(--border)]">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary)] text-white font-bold shadow">
                🍱
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[var(--foreground)]">코드벤또</span>
                <span className="text-xs text-[var(--muted-foreground)]">Code Obento</span>
              </div>
            </div>

            <nav className="px-3 py-4 space-y-1 text-sm">
              <SidebarLink href="/" label="함수 개요" icon="📚" />
            </nav>

            <div className="px-4 pb-4">
              <RecentFunctions />
            </div>
          </aside>

          <main className="flex-1 px-4 py-4 md:px-6 lg:px-8 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}

type SidebarLinkProps = {
  href: string;
  label: string;
  icon?: string;
};

function SidebarLink({ href, label, icon }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--foreground)] transition font-medium hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
    >
      <span aria-hidden>{icon ?? "📌"}</span>
      <span>{label}</span>
    </Link>
  );
}
