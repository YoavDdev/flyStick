import "./globals.css";
import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import { Footer, Navbar } from "./components";
import Provider from "./context/AuthContext";
import ToasterContext from "./context/ToasterContext";

const rubik = Rubik({ subsets: ["latin", "hebrew"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.studioboazonline.com/"),
  title: "Boaz Nahaisi's Studio",
  description:
    "בואו לצלול לשפע עצום של שיעורים ותרגילים שפותחו כדי להעשיר ולפתח את החיבור בין הגוף לנפש שלכם ולשדרג את מצבו התפקודי עם אימונים וטכניקות ברמות קושי מגוונות.",
  keywords: ["studioboazonline"],
  icons: {
    icon: ["/favicon2.ico?v=4"],
    apple: ["/apple-touch-icon.png?v=4"],
    shortcut: ["/apple-touch-icon.png"],
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en-US",
      "he-IL": "/he-IL",
    },
  },
  openGraph: {
    images: "/android-chrome-144x144.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
  showFooter = true,
}: {
  children: React.ReactNode;
  showFooter?: boolean;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={rubik.className}>
        <Provider>
          <ToasterContext />
          <Navbar />
          {children}
          {showFooter && <Footer />}
        </Provider>
      </body>
    </html>
  );
}
