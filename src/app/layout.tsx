import "./globals.css";
import type { Metadata } from "next";
import { Lilita_One } from "next/font/google";
import { Footer, Navbar } from "./components";
import Provider from "./context/AuthContext";
import ToasterContext from "./context/ToasterContext";

const poppins = Lilita_One({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fly Stick",
  description: "",
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
