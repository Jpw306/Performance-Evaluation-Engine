import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Load Clash Royale (Supercell) fonts
const clashHeadline = localFont({
  src: [
    {
      path: "../public/fonts/clash_bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/clash_regular.otf",
      weight: "400",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-clash",
});

export const metadata: Metadata = {
  title: "Performance Evaluation Engine",
  description: "Clash Royale x Productivity Compass",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${clashHeadline.variable} antialiased bg-black text-white`}>
        {children}
      </body>
    </html>
  );
}
