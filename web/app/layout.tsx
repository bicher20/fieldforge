import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const mono = IBM_Plex_Mono({ variable: "--font-mono-data", weight: ["400", "500"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FieldForge",
  description: "Console d'exploitation terrain — field service management.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${mono.variable} h-full`}>
      <body className="min-h-full font-sans text-[14px] text-text antialiased">{children}</body>
    </html>
  );
}
