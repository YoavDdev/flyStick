import "./globals.css";
import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import { WabiSabiNavbar, WabiSabiFooter } from "./components";
import Provider from "./context/AuthContext";
import ToasterContext from "./context/ToasterContext";
import { VideoPlayerProvider } from "./context/VideoPlayerContext";
import StructuredData from "./components/StructuredData";
import GoogleAnalytics from "./components/GoogleAnalytics";
import LiveBanner from "./components/LiveBanner";

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
    icon: ["/favicon2.ico?v=4"],
    apple: ["/apple-touch-icon.png?v=4"],
    shortcut: ["/apple-touch-icon.png"],
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
        url: "/og-image-wide.jpg",
        width: 1200,
        height: 630,
        alt: "סטודיו בועז אונליין - אימונים אישיים ותנועה מרפאה",
      },
    ],
    siteName: "סטודיו בועז אונליין",
  },
  twitter: {
    card: "summary_large_image",
    title: "סטודיו בועז אונליין - אימונים אישיים ותנועה מרפאה",
    description: "בואו לצלול לשפע עצום של שיעורים ותרגילים שפותחו כדי להעשיר ולפתח את החיבור בין הגוף לנפש שלכם.",
    images: ["/og-image-wide.jpg"],
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
        <GoogleAnalytics />
        <StructuredData type="website" />
        <StructuredData type="person" />
        <StructuredData type="organization" />
      </head>
      <body className={rubik.className}>
        <Provider>
          <VideoPlayerProvider>
            <ToasterContext />
            <LiveBanner />
            <WabiSabiNavbar />
            {children}
            {showFooter && <WabiSabiFooter />}
          </VideoPlayerProvider>
        </Provider>
      </body>
    </html>
  );
}
