import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kids Calculator 🌟 - Fun Math & Learning Explorer",
  description: "A fun, colorful, and interactive math calculator designed for kids. Features remainder division, times tables explorer, visual math blocks, speech readout, and math quest challenges.",
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
