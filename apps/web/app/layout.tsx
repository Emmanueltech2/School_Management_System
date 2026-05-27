import type { Metadata } from "next";
import { PwaRegister } from "./pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "School Management System",
  description: "Multi-school management platform",
  manifest: "/manifest.webmanifest",
  applicationName: "Elite Soft SMS",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Elite Soft SMS"
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/apple-touch-icon.svg"
  },
  themeColor: "#059669"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
