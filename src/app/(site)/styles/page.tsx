"use client";

import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import WabiSabiTexture from "../../../app/components/WabiSabiTexture";
import Image from "next/image";

// Icons for each technique category (you can replace these with actual icons later)
const categoryIcons: Record<string, string> = {
  Contrology: "🧘‍♀️",
  אביזרים: "🔄",
  "אימוני קיר": "🧱",
  "הריון ולידה": "👶",
  "הרצאות סדנאות והשתלמויות": "🎓",
  "לימודי תודעה": "🧠",
  "סטרונג-מובילי (פילאטיס מתקדמים)": "💪",
  "פילאטיס-לייט (פילאטיס לימודי)": "🌱",
  "פילאטיס מכשירים": "⚙️",
  "פלייסטיק-Flystick": "🏒",
  "קוויקיז Quickies": "⏱️",
  "קורס מורות\\ים קונטרולוג׳י": "👩‍🏫",
  "שיעורי כסא מרפאים": "🪑",
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
      "פילאטיס המבוססת על 34 תרגילים שאסף מעולם היוגה, האקרובטיקה ומחיקוי חיות וילדים ואירגן בסדר מסוים, שמטרתם ליצור הרמוניה בין הגוף לנפש.",
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
  
      const folders = foldersData
        .filter((folder: any) => folder.name.trim().toLowerCase() !== "my library")
        .map((folder: any) => ({
          name: folder.name,
          uri: folder.uri,
          description: folderDescriptions[folder.name as keyof typeof folderDescriptions] || "אין תיאור זמין.",
        }));
  
      setFolders(folders);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1.0] as [number, number, number, number], // Custom easing for wabi-sabi feel
      },
    },
  };

  // Get a shortened description for cards
  const getShortenedDescription = (description: string) => {
    const maxLength = 80;
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + "...";
  };

  // Filter folders based on selected category
  const filteredFolders = selectedCategory
    ? folders.filter(folder => folder.name === selectedCategory)
    : folders;

  return (
    <div className="relative min-h-screen bg-[#F7F3EB]">
      {/* Background texture */}
      <div className="absolute inset-0 z-0">
        <WabiSabiTexture 
          type="paper" 
          opacity={0.05}
          animate={true}
          className="opacity-30"
        />
      </div>
      
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
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl md:text-4xl font-medium tracking-wide text-[#3D3D3D] mb-4">
              <span className="border-b-2 border-[#B56B4A] pb-1">בחרו את הטכניקה שלכם</span>
            </h1>
            <p className="text-lg text-[#5D5D5D] max-w-2xl mx-auto mt-6">
              מגוון שיטות ותרגולים המותאמים לצרכים שונים, כל אחת מציעה חוויה ייחודית לגוף ולנפש
            </p>
          </motion.div>

          {/* Category filter - horizontal scrollable on mobile */}
          <motion.div 
            className="mb-10 overflow-x-auto pb-4 hide-scrollbar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex space-x-2 space-x-reverse justify-center min-w-max">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-5 py-2 rounded-full text-sm transition-all duration-300 ${!selectedCategory 
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
          </motion.div>

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="w-16 h-16 border-4 border-[#D5C4B7] border-t-[#B8A99C] rounded-full animate-spin"></div>
            </div>
          )}

          {/* Folders grid */}
          {!loading && (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredFolders.map((folder) => (
                <motion.div 
                  key={folder.uri}
                  variants={itemVariants}
                  whileHover={{ y: -5, transition: { duration: 0.3 } }}
                >
                  <Link href={`/styles/${folder.uri.split("/").pop()}`}>
                    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 h-full border border-[#E6DEDA]">
                      {/* Card header with icon */}
                      <div className="bg-[#F7F3EB] p-6 flex items-center border-b border-[#E6DEDA]">
                        <div className="w-12 h-12 flex items-center justify-center bg-[#D5C4B7] rounded-full text-2xl">
                          {categoryIcons[folder.name] || "🧘"}
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
                </motion.div>
              ))}
            </motion.div>
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
