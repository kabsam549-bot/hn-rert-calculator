import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "H&N Re-Irradiation Calculator",
  description: "Educational decision support tool for head and neck cancer re-irradiation assessment",
  keywords: ["head and neck cancer", "re-irradiation", "radiation oncology", "medical calculator"],
  authors: [{ name: "Medical Education Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
