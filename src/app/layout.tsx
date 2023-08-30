import "./globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Footer, Navbar } from "./components";

const poppins = Poppins({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fly Stick",
  description: "" 
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <Navbar />
        {children}
        <Footer />
        </body>
    </html>
  );
}
