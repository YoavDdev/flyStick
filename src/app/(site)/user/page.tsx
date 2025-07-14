"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { FaFolder, FaFolderOpen, FaPlus, FaTrash } from "react-icons/fa";
import { MdFavorite, MdHistory } from "react-icons/md";

const Page = () => {
  const { data: session } = useSession();
  const [folderNames, setFolderNames] = useState<string[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null);

  useEffect(() => {
    if (session && session.user && session.user.email) {
      fetchFolderNames();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchFolderNames = async () => {
    try {
      if (session && session.user) {
        setLoading(true);
        const response = await axios.post("/api/all-user-folder-names", {
          userEmail: session.user.email,
        });

        if (response.status === 200) {
          let folders = response.data.folderNames;
          // Add "watched" manually if it's not already there
          if (!folders.includes("watched")) {
            folders = ["watched", ...folders];
          }
          setFolderNames(folders);
        }
      }
    } catch (error) {
      console.error("Error fetching folder names:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFolder = async () => {
    try {
      if (!newFolderName) {
        toast.error("אנא הזן שם לתיקייה");
        return;
      }

      if (!session?.user?.email) {
        toast.error("אנא התחבר כדי להוסיף תיקייה");
        return;
      }

      const response = await axios.post("/api/add-new-folder", {
        userEmail: session.user.email,
        folderName: newFolderName,
      });

      if (response.status === 200) {
        setFolderNames((prev) => [...prev, newFolderName]);
        setNewFolderName("");
        setShowForm(false);
        toast.success("התיקייה נוצרה בהצלחה");
      }
    } catch (error) {
      console.error("Error adding folder:", error);
      toast.error("אירעה שגיאה ביצירת התיקייה");
    }
  };

  const handleDeleteFolder = async (folderName: string) => {
    try {
      if (!session?.user?.email) return;

      const response = await axios.delete("/api/delete-a-folder", {
        data: {
          userEmail: session.user.email,
          folderName,
        }
      });

      if (response.status === 200) {
        setFolderNames((prev) => prev.filter((name) => name !== folderName));
        toast.success("התיקייה נמחקה בהצלחה");
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("אירעה שגיאה במחיקת התיקייה");
    }
  };

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12,
        ease: [0.25, 0.1, 0.25, 1.0] as [number, number, number, number],
      },
    },
  };

  const folderIconVariants = {
    closed: { rotateY: 0 },
    open: { rotateY: 180, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        {session?.user ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <div className="mb-12">
              <motion.div variants={itemVariants}>
                <h1 className="text-3xl font-bold text-[#2D3142] mb-2 text-center">
                  הספרייה האישית שלך
                </h1>
                <p className="text-lg text-[#3D3D3D] text-center">
                  {!loading && (folderNames.length === 0
                    ? "אין לך תיקיות עדיין"
                    : "כאן תנהלו את הסרטים ששמרתם")}
                </p>
                
                {/* Loading state */}
                {loading && (
                  <div className="flex justify-center items-center py-6">
                    <div className="w-12 h-12 border-4 border-[#D5C4B7] border-t-[#B8A99C] rounded-full animate-spin"></div>
                  </div>
                )}
              </motion.div>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
              {folderNames.map((folderName: string) => (
                <motion.div 
                  key={folderName} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="relative"
                  onMouseEnter={() => setHoveredFolder(folderName)}
                  onMouseLeave={() => setHoveredFolder(null)}
                >
                  <Link href={`/user/${folderName}`}>
                    <div className="h-48 sm:h-60 w-full overflow-hidden rounded-xl bg-[#F7F3EB] p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#D5C4B7]/20">
                      <div className="flex flex-col justify-center items-center text-center h-full relative">
                        <div className="mb-4 text-[#B8A99C]">
                          {folderName.toLowerCase() === "watched" ? (
                            <MdHistory size={40} />
                          ) : folderName.toLowerCase() === "favorites" ? (
                            <MdFavorite size={40} />
                          ) : (
                            <motion.div
                              animate={hoveredFolder === folderName ? "open" : "closed"}
                              variants={folderIconVariants}
                            >
                              {hoveredFolder === folderName ? <FaFolderOpen size={40} /> : <FaFolder size={40} />}
                            </motion.div>
                          )}
                        </div>
                        
                        <h3 className="text-xl font-semibold text-[#2D3142] mb-2 capitalize">
                          {folderName === "watched"
                            ? "השיעורים שצפית"
                            : folderName === "favorites"
                            ? "מועדפים"
                            : folderName}
                        </h3>
                        <p className="text-sm text-[#3D3D3D] bg-[#F7F3EB] px-3 py-1 rounded-full">לכניסה</p>

                        {folderName.toLowerCase() !== "favorites" &&
                          folderName.toLowerCase() !== "watched" && (
                            <motion.button
                              onClick={(e) => {
                                e.preventDefault();
                                handleDeleteFolder(folderName);
                              }}
                              title="מחק תיקייה"
                              className="absolute bottom-2 left-2 text-[#3D3D3D] hover:text-[#D9713C] p-2 rounded-full shadow-sm transition-colors duration-300"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <FaTrash size={16} />
                            </motion.button>
                          )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="h-48 sm:h-60 w-full overflow-hidden rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#D5C4B7]/20 border-dashed">
                  <div className="flex flex-col justify-center items-center text-center h-full">
                    {showForm ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleAddFolder();
                        }}
                        className="w-full"
                      >
                        <div className="mb-4">
                          <input
                            type="text"
                            placeholder="שם תיקייה חדשה"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            className="p-3 w-full border border-[#D5C4B7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8A99C] bg-[#F7F3EB]/50 text-right"
                            dir="rtl"
                          />
                        </div>
                        <div className="flex justify-center gap-2">
                          <motion.button
                            type="submit"
                            className="bg-[#D5C4B7] hover:bg-[#B8A99C] text-[#2D3142] px-4 py-2 rounded-lg focus:outline-none"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            הוסף
                          </motion.button>
                          <motion.button
                            onClick={() => setShowForm(false)}
                            className="bg-[#F7F3EB] text-[#3D3D3D] px-4 py-2 rounded-lg focus:outline-none border border-[#D5C4B7]/30"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            ביטול
                          </motion.button>
                        </div>
                      </form>
                    ) : (
                      <motion.button
                        onClick={() => setShowForm(true)}
                        className="bg-[#D5C4B7] hover:bg-[#B8A99C] text-[#2D3142] w-16 h-16 rounded-full flex items-center justify-center shadow-md"
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                      >
                        <FaPlus size={24} />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white p-10 rounded-xl shadow-md max-w-md mx-auto border border-[#D5C4B7]/20">
              <h1 className="text-3xl font-bold text-[#2D3142] mb-6">
                אנא היכנס כדי להמשיך
              </h1>
              <p className="text-[#3D3D3D] mb-8">כדי לצפות בספרייה האישית שלך, עליך להתחבר לחשבון שלך</p>
              <Link href="/login">
                <motion.div 
                  className="inline-block bg-[#D5C4B7] hover:bg-[#B8A99C] text-[#2D3142] px-8 py-3 rounded-lg shadow-sm transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  כניסה
                </motion.div>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Page;
