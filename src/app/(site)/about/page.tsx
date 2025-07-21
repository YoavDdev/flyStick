import React from "react";
import { Metadata } from "next";
import WabiSabiAboutClient from "../../components/WabiSabiAboutClient";

export const metadata: Metadata = {
  title: "אודות בועז נחייסי - מייסד שיטת הפלייסטיק ומדריך תנועה מרפאה",
  description: "הכירו את בועז נחייסי, מייסד בית הספר של בועז נחייסי מאז 2012 ויוצר שיטת הפלייסטיק. מלמד תנועה מרפאה, חיבור גוף נפש ואימונים אישיים בארץ ובעולם. אני מאמין באהבת הגוף וטיפוח הנפש, ושלתנועה יש כח עצום בהבראה.",
  keywords: [
    "בועז נחייסי", "פלייסטיק", "תנועה מרפאה", "חיבור גוף נפש", "אימונים אישיים",
    "בית הספר של בועז נחייסי", "מדריך תנועה", "נשימה ותנועה", "הבראה", "כושר",
    "boaz nahaissi", "flyastic", "movement therapy", "mind body connection", "wellness"
  ],
  openGraph: {
    title: "אודות בועז נחייסי - מייסד שיטת הפלייסטיק ומדריך תנועה מרפאה",
    description: "הכירו את בועז נחייסי, מייסד בית הספר של בועז נחייסי מאז 2012 ויוצר שיטת הפלייסטיק. מלמד תנועה מרפאה, חיבור גוף נפש ואימונים אישיים בארץ ובעולם.",
    type: "profile",
    images: [
      {
        url: "/newAboutboaz.jpg",
        width: 800,
        height: 600,
        alt: "בועז נחייסי - מדריך תנועה ויוצר שיטת הפלייסטיק",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "אודות בועז נחייסי - מייסד שיטת הפלייסטיק ומדריך תנועה מרפאה",
    description: "הכירו את בועז נחייסי, מייסד בית הספר של בועז נחייסי מאז 2012 ויוצר שיטת הפלייסטיק. מלמד תנועה מרפאה, חיבור גוף נפש ואימונים אישיים.",
    images: ["/newAboutboaz.jpg"],
  },
  alternates: {
    canonical: "/about",
  },
};

const WabiSabiAbout = () => {
  return <WabiSabiAboutClient />;
};

export default WabiSabiAbout;
