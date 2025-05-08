import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopNav from '../components/Nav/TopNav';
import BottomNav from '../components/Nav/BottomNav';
import ReduxProvider from '../redux/Provider';
import AuthManager from '../components/Auth/AuthManager';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "BeYou365 - Mental Transformation",
  description: "Circuit-Based Approach to Mental Transformation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundImage: "url('/site-background.jpeg')", backgroundSize: "cover", backgroundAttachment: "fixed", backgroundPosition: "center" }}
      >
        <ReduxProvider>
          <TopNav />
          <AuthManager />
          {children}
          <BottomNav />
        </ReduxProvider>
      </body>
    </html>
  );
}
