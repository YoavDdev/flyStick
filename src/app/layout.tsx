import "./globals.css";
import type { Metadata } from "next";
import { Lato } from "next/font/google";
import { Footer, Navbar } from "./components";
import Provider from "./context/AuthContext";
import ToasterContext from "./context/ToasterContext";

const poppins = Lato({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Boaz Nahaisi's Studio",
  description:
    "Dive into a Vast Collection of Lessons and Exercises, Expertly Curated to Enhance Your Body-Mind Connection and Elevate Your Well-Being with Varied Training Techniques and Difficulty Levels.",
  keywords: ["Flystick"],
  icons: {
    icon: ["/favicon.ico?v=4"],
    apple: ["/apple-touch-icon.png?v=4"],
    shortcut: ["/apple-touch-icon.png"],
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
