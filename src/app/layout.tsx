import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Providers } from "./Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Premium Calendar Input",
  description: "Quickly insert events into Google Calendar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Providers>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
            <Header />
            <main style={{ flex: 1, position: 'relative', overflowY: 'auto' }}>
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
