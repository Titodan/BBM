import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Brampton Beit Midrash | BBM - A Place to Learn",
  description: "Brampton Beit Midrash (BBM) - A dedicated place for Torah learning and spiritual growth. Join us for daily davening, shiurim, and community learning in Brampton.",
  keywords: ["Brampton Beit Midrash", "BBM", "Torah learning", "Shiurim", "Jewish community", "Brampton", "Beit Midrash"],
  authors: [{ name: "Brampton Beit Midrash" }],
  openGraph: {
    title: "Brampton Beit Midrash | BBM",
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
