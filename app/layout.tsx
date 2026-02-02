import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Brampton בית מדרש | BBM - A Place to Learn",
  description: "Brampton בית מדרש (BBM) - A dedicated place for Torah learning and spiritual growth. Join us for daily davening, shiurim, and community learning in Brampton.",
  keywords: ["Brampton בית מדרש", "BBM", "Torah learning", "Shiurim", "Jewish community", "Brampton", "בית מדרש"],
  authors: [{ name: "Brampton בית מדרש" }],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  openGraph: {
    title: "Brampton בית מדרש | BBM",
    description: "A Place to Learn - Join us for daily Torah learning and davening",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
