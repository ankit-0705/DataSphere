import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import UserProvider from "@/context/UserContext";
import NotificationProvider from "@/context/NotificationContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DataSphere - The Dataset Hub for Developers & Students",
  description: "Find, share, and explore coding and ML datasets. Built for students, indie devs, and early learners seeking quality project data.",
  keywords: ["datasets", "machine learning", "coding projects", "student resources", "data sharing"],
  creator: "Ankit Sangwan",
  openGraph: {
    title: "DataSphere - Dataset Hub",
    description: "Share and explore datasets for coding and ML projects.",
    url: "https://DataSphere.app",
    images: [
      {
        url: "/DataSphere.png",
        width: 1200,
        height: 630,
        alt: "DataSphere Logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <UserProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </UserProvider>
      </body>
    </html>
  );
}
