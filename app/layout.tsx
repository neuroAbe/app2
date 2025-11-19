import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PixelMatch - Dating Game",
  description: "A Pokemon-style dating adventure game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
