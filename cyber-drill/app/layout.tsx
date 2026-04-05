import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sovereign Operator | CyberDrill",
  description: "CyberDrill - Cybersecurity Training Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#0c0e12] text-[#f6f6fc] selection:bg-[#8ff5ff]/30">
        {children}
      </body>
    </html>
  );
}
