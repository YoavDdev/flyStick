import "./globals.css";
import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import { WabiSabiNavbar, WabiSabiFooter } from "./components";
import Provider from "./context/AuthContext";
import ToasterContext from "./context/ToasterContext";
import { VideoPlayerProvider } from "./context/VideoPlayerContext";
import StructuredData from "./components/StructuredData";

const rubik = Rubik({ subsets: ["latin", "hebrew"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.studioboazonline.com/"),
  title: {
    default: "סטודיו בועז אונליין - אימונים אישיים ותנועה מרפאה",
    template: "%s | סטודיו בועז אונליין"
  },
  description:
    "בואו לצלול לשפע עצום של שיעורים ותרגילים שפותחו כדי להעשיר ולפתח את החיבור בין הגוף לנפש שלכם ולשדרג את מצבו התפקודי עם אימונים וטכניקות ברמות קושי מגוונות. בועז נחייסי מלמד פלייסטיק, תנועה מרפאה ואימונים אישיים.",
  keywords: [
    "סטודיו בועז אונליין", "בועז נחייסי", "פלייסטיק", "אימונים אישיים", 
    "תנועה מרפאה", "יוגה", "פילאטיס", "אימון גופני", "כושר", "בריאות",
    "תנועה ונשימה", "חיבור גוף נפש", "אימון אונליין", "שיעורי וידאו",
    "studio boaz online", "boaz nahaissi", "flyastic", "movement therapy",
    "online fitness", "mind body connection", "wellness", "hebrew fitness"
  ],
  authors: [{ name: "בועז נחייסי", url: "https://www.studioboazonline.com/about" }],
  creator: "בועז נחייסי",
  publisher: "סטודיו בועז אונליין",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon-new.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
    shortcut: ["/favicon-new.svg"],
  },
  alternates: {
    canonical: "/",
    languages: {
      "he-IL": "/",
      "en-US": "/en",
    },
  },
  openGraph: {
    type: "website",
    locale: "he_IL",
    url: "https://www.studioboazonline.com/",
    title: "סטודיו בועז אונליין - אימונים אישיים ותנועה מרפאה",
    description: "בואו לצלול לשפע עצום של שיעורים ותרגילים שפותחו כדי להעשיר ולפתח את החיבור בין הגוף לנפש שלכם. בועז נחייסי מלמד פלייסטיק, תנועה מרפאה ואימונים אישיים.",
    images: [
      {
        url: "/og-image-sharp.png",
        width: 1200,
        height: 630,
        alt: "Studio Boaz Online - סטודיו בועז אונליין",
      },
    ],
    siteName: "סטודיו בועז אונליין",
  },
  twitter: {
    card: "summary_large_image",
    title: "סטודיו בועז אונליין - אימונים אישיים ותנועה מרפאה",
    description: "בואו לצלול לשפע עצום של שיעורים ותרגילים שפותחו כדי להעשיר ולפתח את החיבור בין הגוף לנפש שלכם.",
    images: ["/og-image-sharp.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/site.webmanifest",
  category: "fitness",
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
      <head>
        <StructuredData type="website" />
        <StructuredData type="person" />
        <StructuredData type="organization" />
      </head>
      <body className={rubik.className}>
        <Provider>
          <VideoPlayerProvider>
            <ToasterContext />
            <WabiSabiNavbar />
            {children}
            {showFooter && <WabiSabiFooter />}
          </VideoPlayerProvider>
        </Provider>
      </body>
    </html>
  );
}
