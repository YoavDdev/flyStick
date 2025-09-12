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
    default: "סטודיו בועז אונליין",
    template: "%s | סטודיו בועז אונליין"
  },
  description:
    "פלטפורמת אימונים אונליין מתקדמת עם אוסף נבחר של שיעורי תנועה, פלייסטיק ואימון פונקציונלי. צפו בסדרות וידאו מקצועיות, עקבו אחר ההתקדמות שלכם ובנו פלייליסטים אישיים. בועז נחייסי מלווה אתכם במסע לחיזוק הקשר בין גוף לנפש דרך תנועה מרפאה וטכניקות אימון מותאמות אישית.",
  keywords: [
    "בועז סטודיו אונליין", "בועז נחייסי", "פלייסטיק", "אימונים אישיים", 
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
    title: "סטודיו בועז אונליין",
    description:
      "פלטפורמת אימונים אונליין מתקדמת עם אוסף נבחר של שיעורי תנועה, פלייסטיק ואימון פונקציונלי. צפו בסדרות וידאו מקצועיות, עקבו אחר ההתקדמות שלכם ובנו פלייליסטים אישיים. בועז נחייסי מלווה אתכם במסע לחיזוק הקשר בין גוף לנפש דרך תנועה מרפאה.",
    url: "https://www.studioboazonline.com/",
    siteName: "סטודיו בועז אונליין",
    images: [
      {
        url: "/social-media/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "סטודיו בועז אונליין - פלטפורמת אימונים אונליין עם שיעורי תנועה, פלייסטיק ואימון פונקציונלי",
      },
    ],
    locale: "he_IL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "סטודיו בועז אונליין",
    description: "פלטפורמת אימונים אונליין מתקדמת עם שיעורי תנועה, פלייסטיק ואימון פונקציונלי. צפו בסדרות וידאו, עקבו אחר התקדמות ובנו פלייליסטים אישיים עם בועז נחייסי.",
    images: ["/social-media/og-image.jpg"],
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
