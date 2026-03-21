"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  MdOutlineBarChart, 
  MdOutlineEmail, 
  MdOutlineVideoLibrary, 
  MdOutlineShoppingCart,
  MdOutlineSmartToy,
  MdOutlineVideocam
} from "react-icons/md";

interface Tab {
  id: string;
  label: string;
  icon: JSX.Element;
}

interface AdminTabsProps {
  children: {
    statistics: React.ReactNode;
    communication: React.ReactNode;
    content: React.ReactNode;
    live: React.ReactNode;
    commerce: React.ReactNode;
    tools: React.ReactNode;
  };
}

const AdminTabs: React.FC<AdminTabsProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>("statistics");

  const tabs: Tab[] = [
    { id: "statistics", label: "סטטיסטיקות ומעקב", icon: <MdOutlineBarChart size={20} /> },
    { id: "communication", label: "תקשורת", icon: <MdOutlineEmail size={20} /> },
    { id: "content", label: "ניהול תוכן", icon: <MdOutlineVideoLibrary size={20} /> },
    { id: "live", label: "שידורים חיים", icon: <MdOutlineVideocam size={20} /> },
    { id: "commerce", label: "חנות ומסחר", icon: <MdOutlineShoppingCart size={20} /> },
    { id: "tools", label: "כלים מתקדמים", icon: <MdOutlineSmartToy size={20} /> },
  ];

  return (
    <div className="w-full">
      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl shadow-md border border-[#D5C4B7]/30 mb-6 overflow-hidden">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 min-w-fit px-4 sm:px-6 py-4 flex items-center justify-center gap-2 
                transition-all duration-300 relative whitespace-nowrap
                ${activeTab === tab.id 
                  ? "text-[#2D3142] bg-[#F7F3EB]" 
                  : "text-[#2D3142]/60 hover:text-[#2D3142] hover:bg-[#F7F3EB]/50"
                }
              `}
            >
              {tab.icon}
              <span className="font-semibold text-sm sm:text-base">{tab.label}</span>
              
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-[#D5C4B7]"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {activeTab === "statistics" && children.statistics}
        {activeTab === "communication" && children.communication}
        {activeTab === "content" && children.content}
        {activeTab === "live" && children.live}
        {activeTab === "commerce" && children.commerce}
        {activeTab === "tools" && children.tools}
      </motion.div>
    </div>
  );
};

export default AdminTabs;
