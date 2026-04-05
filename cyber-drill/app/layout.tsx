import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CyberDrill — Cybersecurity Training Platform",
  description: "CyberDrill - Cybersecurity Training Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap"
        />
      </head>
      <body className="antialiased bg-[#0c0e12] text-[#f6f6fc] selection:bg-[#8ff5ff]/30">
        {children}
      </body>
    </html>
  );
}
