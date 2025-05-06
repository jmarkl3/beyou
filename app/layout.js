import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopNav from '../components/TopNav';
import BottomNav from '../components/BottomNav';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "BeYou - Mental Transformation",
  description: "Circuit-Based Approach to Mental Transformation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundImage: "url('/site-background.jpeg')", backgroundSize: "cover", backgroundAttachment: "fixed", backgroundPosition: "center" }}
      >
        <TopNav />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
