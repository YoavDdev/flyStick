import "./globals.css";
import type { Metadata } from "next";
import { Lato } from "next/font/google";
import { Footer, Navbar } from "./components";
import Provider from "./context/AuthContext";
import ToasterContext from "./context/ToasterContext";

const poppins = Lato({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.studioboazonline.com/"),
  title: "Boaz Nahaisi's Studio",
  description:
    "Dive into a Vast Collection of Lessons and Exercises, Expertly Curated to Enhance Your Body-Mind Connection and Elevate Your Well-Being with Varied Training Techniques and Difficulty Levels.",
  keywords: ["studioboazonline"],
  icons: {
    icon: ["/favicon.ico?v=4"],
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
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <Provider>
          <ToasterContext />
          <Navbar />
          {children}
          <Footer />
        </Provider>
      </body>
    </html>
  );
}
