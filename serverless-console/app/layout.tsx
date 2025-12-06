import type { Metadata } from "next";
import Link from "next/link";
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
  title: "Serverless Functions Console",
  description: "함수 개요 · 상세 · 대시보드를 관리하는 콘솔",
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
        <div className="min-h-screen flex">
          <aside className="hidden md:flex w-64 flex-col border-r border-[var(--border)] bg-white/80 backdrop-blur-sm shadow-sm">
            <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--border)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-white font-bold">
                SF
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[var(--foreground)]">
                  Serverless
                </span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  Functions Console
                </span>
              </div>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
              <SidebarLink href="/" label="함수 개요" />
              <SidebarLink href="/functions/1" label="함수 상세 (예시)" />
              <SidebarLink href="/dashboard" label="대시보드" />
            </nav>
          </aside>

          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}

type SidebarLinkProps = {
  href: string;
  label: string;
};

function SidebarLink({ href, label }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition"
    >
      <span className="h-2 w-2 rounded-full bg-[var(--primary)]" aria-hidden />
      <span>{label}</span>
    </Link>
  );
}
