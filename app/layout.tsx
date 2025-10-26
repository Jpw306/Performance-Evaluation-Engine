import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Providers from '../components/Providers';

// Load Clash Royale (Supercell) fonts
const clashHeadline = localFont({
  src: [
    {
      path: '../public/fonts/Clash_Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/Clash_Regular.otf',
      weight: '400',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-clash',
});

export const metadata: Metadata = {
  title: 'Performance Evaluation Engine',
  description: 'Clash Royale x Productivity Compass',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${clashHeadline.variable} antialiased bg-clash-black text-clash-light`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
