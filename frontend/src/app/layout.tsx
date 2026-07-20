import type { Metadata } from 'next';
import Footer from '../components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bags Bro!',
  description: 'Welcome to Bags Bro! - a community-driven brand where music, memes, and animation collide into an ever-expanding Bagaverse. Around here, B.A.G.S. stands for more than just loot - it means Build A Great Story. And that\'s exactly what we\'re doing, one bag at a time.',
  keywords: ['animated music video', 'Bags Bro', 'Biggity Baggity Boo', 'animation', 'film festival', 'Bagaverse', 'community', 'BAGS', 'WEB3', 'NFTs', 'music'],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Biggity Baggity Boo',
    description: 'An Animated Music Experience',
    type: 'website',
    images: ['/images/scene-5.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Biggity Baggity Boo',
    description: 'An Animated Music Experience',
    images: ['/images/scene-5.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}