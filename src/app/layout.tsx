import type { Metadata } from "next";
import React from "react";

import "@/styles/tokens.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bookify",
  description: "Frontend de Bookify en desarrollo",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
