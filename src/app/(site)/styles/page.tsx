"use client";

import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link"; // Import Link from React Router

const Page = () => {
  const [folders, setFolders] = useState([]);
  const { data: session } = useSession();
  const accessToken = process.env.VIMEO_TOKEN;
  const apiUrl = "https://api.vimeo.com/me/projects";
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };

  // Folder descriptions mapping
  const folderDescriptions = {
    Contrology:
      " פילאטיס המבוססת על 34 תרגילים שאסף מעולם היוגה, האקרובטיקה ומחיקוי חיות וילדים ואירגן בסדר מסוים, שמטרתם ליצור הרמוניה בין הגוף לנפש.",
    אביזרים: "כאן תמצאו שיעורי גליל, כדור, צלחות ועוד.",
    "אימוני קיר": "שיעורי כח וגמישות בעזרת הקיר בבית.",
    "הריון ולידה": "שיעורים והרצאות חשובים לכל השלבים בזמן הריון ולידה.",
    "הרצאות סדנאות והשתלמויות":
      "עולם של תוכן חכם וחשוב לכל אדם בנושאים שונים ומגוונים הקשורים להבנת הגוף וחשיבות התנועה בחייו של אדם.",
    "לימודי תודעה":
      "פרקים נבחרים של תובנות התבוננות וחקירה עצמית מוגשים לכם כדי להבין טוב את יותר את המציאות בה אנו חיים.",
    "סטרונג-מובילי (פילאטיס מתקדמים)":
      " תרגולי זרימה מתקדמים ועשירים בדרגת כח וגמישות גבוהים.",
    "פילאטיס-לייט (פילאטיס לימודי)":
      " כאן תמצאו ׳שיעורי פתיחה׳ בהם אני פותח בהסבר מדויק על הנושא הנבחר.",
    "פילאטיס מכשירים":
      "שיעורים מטכניקת ה׳רפומר-פלו׳ המוגשת עד היום ברחבי הארץ.",
    "פלייסטיק-Flystick":
      "שיטה מרהיבה המחברת בין רקמות הגוף ורכבות האנטומיה הטבעיות בעזרת מקל.",
    "קוויקיז Quickies":
      "שיעורים קצרים בזמן המתאימים לרגע של תנועה ושחרור הגוף.",
    "קורס מורות\\ים קונטרולוג׳י":
      "מאגר שיעורים במסגרת הכשרה של קורס המורות מורים שלי ה׳קונטרולוג׳י׳.",
    "שיעורי כסא מרפאים":
      "שיעורים המתמקדים בעמוד השדרה, במערכת הנשימה, באנרגית החיוניות של הגוף.",
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const response: AxiosResponse = await axios.get(apiUrl, { headers });
      const data = response.data;
      const foldersData = data.data;

      const folders = foldersData.map((folder: any) => ({
        name: folder.name,
        uri: folder.uri, // Include the folder URI
      }));

      setFolders(folders);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Function to get the first sentence of the folder description
  const getFirstSentence = (description: string) => {
    const sentence = description.split(".")[0];
    return sentence ? sentence + "." : "אין תיאור זמין."; // Fallback if no description is available
  };

  return (
    <div className="bg-white">
      <div className="min-h-screen text-white">
        <div className="pt-20">
          <div className="container mx-auto p-6">
            <div className="mx-auto max-w-7xl px-8 pb-10">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-base font-semibold leading-7 text-[#990011]">
                  אימונים לפי טעם אישי
                </h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  בחרו את הטכניקה שלכם
                </p>
              </div>
              <div className="text-center mt-2 sm:hidden">
                <p className="text-gray-500">גלול למטה טכניקות נוספים</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 xl:gap-x-8 ">
              {folders.map((folder: any, index: number) => (
                <Link
                  href={`/styles/${folder.uri.split("/").pop()}`}
                  key={folder.uri}
                >
                  <div className="overflow-hidden transform transition-transform duration-300 ease-in-out hover:scale-105">
                    <div className="aspect-h-2 aspect-w-3 w-full rounded-lg bg-[#FCF6F5]">
                      <div className="h-full w-full flex flex-col justify-center items-center text-center p-4">
                        <h3 className="text-2xl font-semibold text-[#990011] mb-2">
                          {folder.name}
                        </h3>
                        {/* Display the first sentence of the description */}
                        <p className="text-sm text-gray-700 mt-2">
                          {getFirstSentence(
                            folderDescriptions[
                              folder.name as keyof typeof folderDescriptions
                            ] || "אין תיאור זמין.",
                          )}
                        </p>
                        {/* <p className="text-sm text-gray-700">
                          לחץ כאן כדי להתחיל
                        <y/p> */}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
