"use client";

import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
// Framer Motion import removed

import Image from "next/image";

// Custom SVG icons for each technique category in Wabi-Sabi style
const CategoryIcon = ({ name }: { name: string }) => {
  // Define SVG paths and styles based on category name
  switch (name) {
    case "Contrology":
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path d="M12,2c-0.5,0-1,0.2-1.4,0.6C10.2,3,10,3.5,10,4c0,1.1,0.9,2,2,2s2-0.9,2-2c0-0.5-0.2-1-0.6-1.4C13,2.2,12.5,2,12,2z" fill="#2D3142" opacity="0.9" />
          <path d="M18,15c-0.6-1.5-1.6-2.8-2.8-3.8c0.5-1,0.8-2.1,0.8-3.2c0-4-3.2-7.2-7.1-7.2c-3.9,0-7.1,3.2-7.1,7.2c0,1.1,0.3,2.2,0.8,3.2 C1.6,12.2,0.6,13.5,0,15c0,0,0,0.1,0,0.1c0,0.1,0,0.1,0,0.2c0,0.1,0,0.1,0,0.2c0,0,0,0.1,0,0.1c0.2,1.6,1.4,3,3,3.5 c0.5,0.2,1,0.3,1.5,0.3c0.9,0,1.7-0.3,2.4-0.7c1.2-0.8,2-2.1,2.1-3.5c0.1,1.4,0.9,2.7,2.1,3.5c0.7,0.5,1.5,0.7,2.4,0.7 c0.5,0,1-0.1,1.5-0.3c1.6-0.6,2.8-1.9,3-3.5c0,0,0-0.1,0-0.1c0-0.1,0-0.1,0-0.2c0-0.1,0-0.1,0-0.2C18,15.1,18,15,18,15z M8,17 c-0.8,0-1.5-0.4-2-1c-0.5-0.6-0.7-1.5-0.5-2.2c0.1-0.4,0.3-0.8,0.6-1.1c0.3-0.3,0.7-0.5,1.1-0.6c0.2-0.1,0.5-0.1,0.7-0.1 c0.5,0,1,0.1,1.4,0.4c0.4,0.3,0.7,0.6,0.9,1.1c0.2,0.4,0.2,0.9,0.2,1.3C10.4,16,9.3,17,8,17z M16,17c-0.8,0-1.5-0.4-2-1 c-0.5-0.6-0.7-1.5-0.5-2.2c0.1-0.4,0.3-0.8,0.6-1.1c0.3-0.3,0.7-0.5,1.1-0.6c0.2-0.1,0.5-0.1,0.7-0.1c0.5,0,1,0.1,1.4,0.4 c0.4,0.3,0.7,0.6,0.9,1.1c0.2,0.4,0.2,0.9,0.2,1.3C18.4,16,17.3,17,16,17z" fill="#2D3142" opacity="0.9" />
        </svg>
      );
    case "אביזרים":
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <circle cx="12" cy="12" r="8" fill="none" stroke="#2D3142" strokeWidth="1.5" strokeDasharray="6,2" opacity="0.9" />
          <path d="M12,4V20M4,12H20" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      );
    case "אימוני קיר":
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <rect x="2" y="2" width="20" height="20" rx="2" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M2,8H22M8,8V22" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      );
    case "הריון ולידה":
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <circle cx="12" cy="7" r="4" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M8,14c0,4,4,8,4,8s4-4,4-8s-8-4-8,0Z" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      );
    case "הרצאות סדנאות והשתלמויות":
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path d="M12,2L2,8l10,6l10-6L12,2z" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M4,11v6l8,5l8-5v-6" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      );
    case "לימודי תודעה":
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path d="M12,2c-5.5,0-10,4.5-10,10c0,5.5,4.5,10,10,10s10-4.5,10-10C22,6.5,17.5,2,12,2z" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M12,7v10M7,12h10" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M9,9l6,6M9,15l6-6" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      );
    case "סטרונג-מובילי (פילאטיס מתקדמים)":
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path d="M4,17v2h16v-2" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M7,17V7c0-2.8,2.2-5,5-5s5,2.2,5,5v10" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M12,7v5" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      );
    case "פילאטיס-לייט (פילאטיס לימודי)":
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path d="M12,2c-0.5,0-1,0.2-1.4,0.6C10.2,3,10,3.5,10,4c0,1.1,0.9,2,2,2s2-0.9,2-2c0-0.5-0.2-1-0.6-1.4C13,2.2,12.5,2,12,2z" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M12,8v8" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M8,12h8" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M7,20c0,1.1,2.2,2,5,2s5-0.9,5-2s-2.2-2-5-2S7,18.9,7,20z" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      );
    case "פילאטיס מכשירים":
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <circle cx="12" cy="12" r="3" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M12,2v7M12,15v7M2,12h7M15,12h7" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M4.9,4.9l5,5M14.1,14.1l5,5M4.9,19.1l5-5M14.1,9.9l5-5" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" strokeLinecap="round" />
        </svg>
      );
    case "פלייסטיק-Flystick":
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path d="M12,2v20" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M7,6c0,0,5-2,10,0" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M7,12c0,0,5-2,10,0" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M7,18c0,0,5-2,10,0" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      );
    case "קוויקיז Quickies":
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <circle cx="12" cy="12" r="10" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M12,6v6l4,4" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      );
    case "קורס מורות\\ים קונטרולוג׳י":
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path d="M4,4h16v16H4V4z" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M4,8h16M8,4v16" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <circle cx="16" cy="16" r="2" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      );
    case "שיעורי כסא מרפאים":
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path d="M6,12h12v4c0,1.1-0.9,2-2,2H8c-1.1,0-2-0.9-2-2V12z" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M8,12V8c0-2.2,1.8-4,4-4s4,1.8,4,4v4" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M6,18v2M18,18v2" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <circle cx="12" cy="12" r="10" fill="none" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
          <path d="M12,8v8M8,12h8" stroke="#2D3142" strokeWidth="1.5" opacity="0.9" />
        </svg>
      );
  }
};

const StylesPage = () => {
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: session } = useSession();
  const accessToken = process.env.VIMEO_TOKEN;
  const apiUrl = "https://api.vimeo.com/me/projects";
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };

  // Folder descriptions mapping
  const folderDescriptions = {
    Contrology:
      "שיטת התרגול של ג׳וזף. ה. פילאטיס המבוססת על 34 תרגילים שאסף מעולם היוגה, האקרובטיקה ומחיקוי חיות וילדים ואירגן בסדר מסוים, שמטרתם ליצור הרמוניה בין הגוף לנפש. דרך מקצבי תנועה ידועים מראש וניהול 34 דפוסי נשימה, הגוף מגיע למצב אופטימאלי תפקודי, מתחזק, מתגמש, מקבל אנרגיה ומשתחרר ממכאובים. תוכלו למצוא כאן פרשנויות שונות שלי לשיטה, דקויות ייחודיות וכיווני הסבר לאלו ממכם שרוצים להעמיק הן בתנועה, בהבנת השיטה, באנטומיה וחקר הגוף",
    אביזרים: "כאן תמצאו שיעורי גליל, כדור, צלחות ועוד.",
    "אימוני קיר": "שיעורי כח וגמישות בעזרת הקיר בבית.",
    "הריון ולידה": "שיעורים והרצאות חשובים לכל השלבים בזמן הריון ולידה.",
    "הרצאות סדנאות והשתלמויות":
      "עולם של תוכן חכם וחשוב לכל אדם בנושאים שונים ומגוונים הקשורים להבנת הגוף וחשיבות התנועה בחייו של אדם.",
    "לימודי תודעה":
      "פרקים נבחרים של תובנות התבוננות וחקירה עצמית מוגשים לכם כדי להבין טוב את יותר את המציאות בה אנו חיים.",
    "סטרונג-מובילי (פילאטיס מתקדמים)":
      "תרגולי זרימה מתקדמים ועשירים בדרגת כח וגמישות גבוהים.",
    "פילאטיס-לייט (פילאטיס לימודי)":
      "כאן תמצאו ׳שיעורי פתיחה׳ בהם אני פותח בהסבר מדויק על הנושא הנבחר.",
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
    setLoading(true);
    try {
      const response: AxiosResponse = await axios.get(apiUrl, { headers });
      const data = response.data;
      const foldersData = data.data;
      
      // Filter out any folders that might not have descriptions
      const validFolders = foldersData.filter((folder: any) => 
        folderDescriptions[folder.name as keyof typeof folderDescriptions]
      );
      
      // Add descriptions to folders
      const foldersWithDescriptions = validFolders.map((folder: any) => {
        return {
          ...folder,
          description: folderDescriptions[folder.name as keyof typeof folderDescriptions] || "",
        };
      });
      
      setFolders(foldersWithDescriptions);
    } catch (error) {
      console.error("Error fetching folders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Animation variants removed

  // Get a shortened description for cards
  const getShortenedDescription = (description: string) => {
    const maxLength = 80;
    if (!description) return "";
    if (description.length <= maxLength) return description;
    return `${description.substring(0, maxLength)}...`;
  };

  // Filter folders based on selected category
  const filteredFolders = selectedCategory
    ? folders.filter((folder) => folder.name === selectedCategory)
    : folders;

  return (
    <div className="min-h-screen bg-[#F7F3EB] relative">
      {/* Background texture removed */}
      
      {/* Decorative elements */}
      <div className="absolute top-40 right-10 w-32 h-32 opacity-10 hidden lg:block">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#B8A99C" strokeWidth="1" strokeDasharray="5,3" />
        </svg>
      </div>
      
      <div className="absolute bottom-20 left-10 w-24 h-24 opacity-10 hidden lg:block">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="20" width="60" height="60" rx="5" fill="none" stroke="#B8A99C" strokeWidth="1" />
        </svg>
      </div>

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-medium tracking-wide text-[#3D3D3D] mb-4">
              <span className="border-b-2 border-[#B56B4A] pb-1">בחרו את הטכניקה שלכם</span>
            </h1>
            <p className="text-lg text-[#5D5D5D] max-w-2xl mx-auto">
              אנו מציעים מגוון רחב של טכניקות תנועה לכל הרמות, מתחילים ועד מתקדמים
            </p>
            
            {/* Category filter buttons */}
            <div className="flex flex-wrap justify-center gap-2 mt-8 rtl">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-5 py-2 rounded-full text-sm transition-all duration-300 ${
                  selectedCategory === null 
                  ? 'bg-[#D5C4B7] text-[#3D3D3D] shadow-md' 
                  : 'bg-[#F7F3EB] text-[#5D5D5D] border border-[#D5C4B7] hover:bg-[#E6DEDA]'}`}
              >
                הכל
              </button>
              
              {folders.map((folder) => (
                <button
                  key={folder.uri}
                  onClick={() => setSelectedCategory(folder.name)}
                  className={`px-5 py-2 rounded-full text-sm transition-all duration-300 whitespace-nowrap ${selectedCategory === folder.name 
                    ? 'bg-[#D5C4B7] text-[#3D3D3D] shadow-md' 
                    : 'bg-[#F7F3EB] text-[#5D5D5D] border border-[#D5C4B7] hover:bg-[#E6DEDA]'}`}
                >
                  {folder.name}
                </button>
              ))}
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="w-16 h-16 border-4 border-[#D5C4B7] border-t-[#B8A99C] rounded-full animate-spin"></div>
            </div>
          )}

          {/* Folders grid */}
          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredFolders.map((folder) => (
                <div 
                  key={folder.uri} 
                  className="transition-transform duration-300 hover:-translate-y-1"
                >
                  <Link href={`/styles/${folder.uri.split("/").pop()}`}>
                    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 h-full border border-[#E6DEDA]">
                      {/* Card header with icon */}
                      <div className="bg-[#F7F3EB] p-6 flex items-center border-b border-[#E6DEDA]">
                        <div className="w-12 h-12 flex items-center justify-center bg-[#D5C4B7] rounded-full p-2.5 overflow-hidden">
                          <CategoryIcon name={folder.name} />
                        </div>
                        <h3 className="text-xl font-semibold text-[#3D3D3D] mr-4">
                          {folder.name}
                        </h3>
                      </div>
                      
                      {/* Card body */}
                      <div className="p-6">
                        <p className="text-[#5D5D5D] mb-6 text-right">
                          {getShortenedDescription(folder.description)}
                        </p>
                        
                        <div className="flex justify-end">
                          <span className="inline-flex items-center text-[#B56B4A] hover:text-[#D9845E] transition-colors duration-300">
                            <span className="ml-1">לצפייה בשיעורים</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-180" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* No results message */}
          {!loading && filteredFolders.length === 0 && (
            <div className="text-center py-20">
              <p className="text-lg text-[#5D5D5D]">לא נמצאו תוצאות. אנא נסו קטגוריה אחרת.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StylesPage;
