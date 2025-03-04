import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from '../components/Navigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Resume Keyword Tailor',
  description: 'Tailor your resume to match job descriptions',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-900">
        <Navigation />
        {children}
        {/* Add a footer at the end of the page */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>© 2024 SKomp<span className="text-blue-500">X</span>cel Calibrate</p>
          <p className="mt-1">A product by SKompXcel Academic Solutions</p>
        </footer>
      </body>
    </html>
  );
}
