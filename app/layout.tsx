import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import ChatPanel from "./components/ChatPanel";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Delightrics Dashboard",
  description: "AI-powered analytics dashboard",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="flex h-full bg-[#f5f3ef] antialiased">
        <Sidebar />
        <main className="ml-56 flex min-h-full flex-1 flex-col overflow-y-auto">
          {children}
        </main>
        <ChatPanel />
      </body>
    </html>
  );
}
