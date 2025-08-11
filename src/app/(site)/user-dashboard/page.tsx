"use client";

import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { motion } from "framer-motion";
import { FaWhatsapp, FaVideo, FaRegHeart } from "react-icons/fa";
import { AiOutlineExperiment, AiOutlineCompass } from "react-icons/ai";
import { MdOutlineSubscriptions } from "react-icons/md";
import DashboardCard from "../../components/DashboardCard";
import Image from "next/image";
import Dashboardpic from "../../../../public/Dashboardpic.png";
import ConvertkitEmailForm from "../../components/NewsletterSignUpForm";

const UserDashboardPage = () => {
  const { data: session } = useSession();
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [showWhatsAppTooltip, setShowWhatsAppTooltip] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  
  // WhatsApp join function is defined below

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (session?.user) {
          // Fetch user data including subscriptionId
          const response = await axios.post("/api/get-user-subsciptionId", {
            userEmail: session.user.email,
          });

          const userData = response.data;
          const subId = userData.subscriptionId;
          setSubscriptionId(subId);

          // If it's a trial subscription, calculate days left
          if (subId === "trial_30" && userData.trialStartDate) {
            const startDate = new Date(userData.trialStartDate);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 30);
            const today = new Date();
            const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            setTrialDaysLeft(Math.max(0, daysLeft));
          }

          // For PayPal subscriptions, fetch status
          if (subId && subId.startsWith("I-")) {
            try {
              const clientId = process.env.PAYPAL_CLIENT_ID;
              const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

              const auth = {
                username: clientId!,
                password: clientSecret!,
              };

              const subscriptionResponse = await axios.get(
                `https://api.paypal.com/v1/billing/subscriptions/${subId}`,
                { auth },
              );

              const status = subscriptionResponse.data.status;
              setSubscriptionStatus(status);
            } catch (error) {
              console.error("Error fetching PayPal subscription:", error);
              setSubscriptionStatus("ERROR");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session]);

  // Animation variants
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
        duration: 0.5,
      },
    },
  };

  // Helper function to handle WhatsApp group join
  const handleWhatsAppJoin = () => {
    window.open("https://chat.whatsapp.com/invite/studioboazonline", "_blank");
    setShowWhatsAppTooltip(false);
  };

  // Render different dashboards based on subscription type
  const renderDashboardContent = () => {
    if (!subscriptionId) {
      return renderNoSubscriptionDashboard();
    }

    if (subscriptionId === "Admin") {
      return renderAdminDashboard();
    }

    if (subscriptionId === "free") {
      return renderFreeDashboard();
    }

    if (subscriptionId === "trial_30") {
      return renderTrialDashboard();
    }

    // PayPal subscription
    if (subscriptionId.startsWith("I-")) {
      if (subscriptionStatus === "ACTIVE") {
        return renderActivePaidDashboard();
      } else if (subscriptionStatus === "CANCELLED") {
        return renderCancelledDashboard();
      } else {
        return renderDefaultPaidDashboard();
      }
    }

    // Default dashboard as fallback
    return renderDefaultPaidDashboard();
  };

  // Dashboard variants
  const renderAdminDashboard = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 bg-[#F7F3EB] rounded-xl p-6 border border-[#D5C4B7]/30 shadow-md">
        <h2 className="text-2xl font-bold text-[#2D3142] mb-4">{session?.user?.name ? `שלום ${session.user.name}, מנהל!` : 'ברוך הבא, מנהל!'}</h2>
        <p className="text-[#3D3D3D] mb-4">יש לך גישה מלאה לכל התכנים והכלים הניהוליים.</p>
        <div className="flex flex-wrap gap-4 mt-4">
          <Link href="/admin">
            <motion.span 
              className="inline-block bg-[#D5C4B7] hover:bg-[#B8A99C] text-[#2D3142] py-2 px-6 rounded-md transition duration-300 ease-in-out"
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              לוח בקרה למנהל
            </motion.span>
          </Link>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <DashboardCard
          title="הסרטונים שלי"
          description="צפה בסרטונים שהתחלת לראות וחזור אליהם בקלות"
          href="/user/watched"
          icon={<FaVideo size={24} />}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <DashboardCard
          title="חיפוש אישי"
          description="חפש סרטונים לפי נושאים שמעניינים אותך"
          href="/explore"
          icon={<AiOutlineCompass size={24} />}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <DashboardCard
          title="המועדפים שלי"
          description="גישה מהירה לסרטונים שסימנת כמועדפים"
          href="/user"
          icon={<FaRegHeart size={24} />}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <DashboardCard
          title="טכניקות"
          description="למד טכניקות חדשות ושפר את המיומנויות שלך"
          href="/techniques"
          icon={<AiOutlineExperiment size={24} />}
        />
      </motion.div>
    </motion.div>
  );

  const renderActivePaidDashboard = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 bg-[#F7F3EB] rounded-xl p-6 border border-[#D5C4B7]/30 shadow-md">
        <h2 className="text-2xl font-bold text-[#2D3142] mb-4">{session?.user?.name ? `שלום ${session.user.name}!` : 'ברוך הבא!'}</h2>
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md mb-4 flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          <p>המנוי שלך פעיל</p>
        </div>
        <p className="text-[#3D3D3D] mb-4">יש לך גישה מלאה לכל התכנים בסטודיו.</p>
        <div className="flex flex-wrap gap-4 mt-4">
          <button
            onClick={handleWhatsAppJoin}
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white py-2 px-4 rounded-md transition duration-300 ease-in-out"
          >
            <FaWhatsapp size={20} />
            הצטרף לקבוצת הוואטסאפ
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <DashboardCard
          title="הסרטונים שלי"
          description="צפה בסרטונים שהתחלת לראות וחזור אליהם בקלות"
          href="/user/watched"
          icon={<FaVideo size={24} />}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <DashboardCard
          title="חיפוש אישי"
          description="חפש סרטונים לפי נושאים שמעניינים אותך"
          href="/explore"
          icon={<AiOutlineCompass size={24} />}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <DashboardCard
          title="המועדפים שלי"
          description="גישה מהירה לסרטונים שסימנת כמועדפים"
          href="/user"
          icon={<FaRegHeart size={24} />}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <DashboardCard
          title="טכניקות"
          description="למד טכניקות חדשות ושפר את המיומנויות שלך"
          href="/techniques"
          icon={<AiOutlineExperiment size={24} />}
        />
      </motion.div>
    </motion.div>
  );

  const renderCancelledDashboard = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 bg-[#F7F3EB] rounded-xl p-6 border border-[#D5C4B7]/30 shadow-md">
        <h2 className="text-2xl font-bold text-[#2D3142] mb-4">{session?.user?.name ? `שלום ${session.user.name}!` : 'ברוך הבא!'}</h2>
        <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-md mb-4 flex items-center gap-2">
          <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
          <p>המנוי שלך בוטל</p>
        </div>
        <p className="text-[#3D3D3D] mb-4">המנוי שלך בוטל בהצלחה. לחידוש המנוי לחצו על הכפתור מטה.</p>
        <div className="flex flex-wrap gap-4 mt-4">
          <Link href="/#Pricing">
            <motion.span 
              className="inline-block bg-[#D5C4B7] hover:bg-[#B8A99C] text-[#2D3142] py-2 px-6 rounded-md transition duration-300 ease-in-out"
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              חדש את המנוי שלך
            </motion.span>
          </Link>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <DashboardCard
          title="הסרטונים שלי"
          description="צפה בסרטונים שהתחלת לראות וחזור אליהם בקלות"
          href="/user/watched"
          icon={<FaVideo size={24} />}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <DashboardCard
          title="חיפוש אישי"
          description="חפש סרטונים לפי נושאים שמעניינים אותך"
          href="/explore"
          icon={<AiOutlineCompass size={24} />}
        />
      </motion.div>
    </motion.div>
  );

  const renderTrialDashboard = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 bg-[#F7F3EB] rounded-xl p-6 border border-[#D5C4B7]/30 shadow-md">
        <h2 className="text-2xl font-bold text-[#2D3142] mb-4">{session?.user?.name ? `שלום ${session.user.name}, ברוך הבא לתקופת הניסיון!` : 'ברוך הבא לתקופת הניסיון!'}</h2>
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-md mb-4 flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
          <p>מנוי ניסיון פעיל</p>
        </div>
        <p className="text-[#3D3D3D] mb-4">
          {trialDaysLeft !== null 
            ? `נותרו לך ${trialDaysLeft} ימים בתקופת הניסיון. יש לך גישה מלאה לכל התכנים בסטודיו.` 
            : 'יש לך גישה מלאה לכל התכנים בסטודיו במהלך תקופת הניסיון.'}
        </p>
        <div className="flex flex-wrap gap-4 mt-4">
          <Link href="/#Pricing">
            <motion.span 
              className="inline-block bg-[#D5C4B7] hover:bg-[#B8A99C] text-[#2D3142] py-2 px-6 rounded-md transition duration-300 ease-in-out"
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              שדרג למנוי מלא
            </motion.span>
          </Link>
          <button
            onClick={handleWhatsAppJoin}
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white py-2 px-4 rounded-md transition duration-300 ease-in-out"
          >
            <FaWhatsapp size={20} />
            הצטרף לקבוצת הוואטסאפ
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <DashboardCard
          title="הסרטונים שלי"
          description="צפה בסרטונים שהתחלת לראות וחזור אליהם בקלות"
          href="/user/watched"
          icon={<FaVideo size={24} />}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <DashboardCard
          title="חיפוש אישי"
          description="חפש סרטונים לפי נושאים שמעניינים אותך"
          href="/explore"
          icon={<AiOutlineCompass size={24} />}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <DashboardCard
          title="המועדפים שלי"
          description="גישה מהירה לסרטונים שסימנת כמועדפים"
          href="/user"
          icon={<FaRegHeart size={24} />}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <DashboardCard
          title="טכניקות"
          description="למד טכניקות חדשות ושפר את המיומנויות שלך"
          href="/techniques"
          icon={<AiOutlineExperiment size={24} />}
        />
      </motion.div>
    </motion.div>
  );

  const renderFreeDashboard = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 bg-[#F7F3EB] rounded-xl p-6 border border-[#D5C4B7]/30 shadow-md">
        <h2 className="text-2xl font-bold text-[#2D3142] mb-4">{session?.user?.name ? `שלום ${session.user.name}!` : 'ברוך הבא!'}</h2>
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md mb-4 flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          <p>גישה חופשית</p>
        </div>
        <p className="text-[#3D3D3D] mb-4">יש לך גישה לתכנים מוגבלים בסטודיו. שדרג למנוי מלא לגישה לכל התכנים.</p>
        <div className="flex flex-wrap gap-4 mt-4">
          <Link href="/#Pricing">
            <motion.span 
              className="inline-block bg-[#D5C4B7] hover:bg-[#B8A99C] text-[#2D3142] py-2 px-6 rounded-md transition duration-300 ease-in-out"
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              שדרג למנוי מלא
            </motion.span>
          </Link>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <DashboardCard
          title="תכנים חינמיים"
          description="צפה בתכנים הזמינים בגישה חופשית"
          href="/free-content"
          icon={<FaVideo size={24} />}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <DashboardCard
          title="חיפוש אישי"
          description="חפש סרטונים לפי נושאים שמעניינים אותך"
          href="/explore"
          icon={<AiOutlineCompass size={24} />}
        />
      </motion.div>
    </motion.div>
  );

  const renderNoSubscriptionDashboard = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 bg-[#F7F3EB] rounded-xl p-6 border border-[#D5C4B7]/30 shadow-md">
        <h2 className="text-2xl font-bold text-[#2D3142] mb-4">{session?.user?.name ? `שלום ${session.user.name}!` : 'ברוך הבא!'}</h2>
        <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md mb-4 flex items-center gap-2">
          <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
          <p>אין מנוי פעיל</p>
        </div>
        <p className="text-[#3D3D3D] mb-4">אין לך מנוי פעיל. להצטרפות למנוי חדש ולהנות מתכני הסטודיו, לחצו על הכפתור מטה.</p>
        <div className="flex flex-wrap gap-4 mt-4">
          <Link href="/#Pricing">
            <motion.span 
              className="inline-block bg-[#D5C4B7] hover:bg-[#B8A99C] text-[#2D3142] py-2 px-6 rounded-md transition duration-300 ease-in-out"
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              הפעל מנוי
            </motion.span>
          </Link>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <DashboardCard
          title="תכנים חינמיים"
          description="צפה בתכנים הזמינים בגישה חופשית"
          href="/free-content"
          icon={<FaVideo size={24} />}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <DashboardCard
          title="חיפוש אישי"
          description="חפש סרטונים לפי נושאים שמעניינים אותך"
          href="/explore"
          icon={<AiOutlineCompass size={24} />}
        />
      </motion.div>
    </motion.div>
  );

  const renderDefaultPaidDashboard = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 bg-[#F7F3EB] rounded-xl p-6 border border-[#D5C4B7]/30 shadow-md">
        <h2 className="text-2xl font-bold text-[#2D3142] mb-4">ברוך הבא!</h2>
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-md mb-4 flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
          <p>מנוי פעיל</p>
        </div>
        <p className="text-[#3D3D3D] mb-4">יש לך גישה מלאה לכל התכנים בסטודיו.</p>
        <div className="flex flex-wrap gap-4 mt-4">
          <button
            onClick={handleWhatsAppJoin}
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white py-2 px-4 rounded-md transition duration-300 ease-in-out"
          >
            <FaWhatsapp size={20} />
            הצטרף לקבוצת הוואטסאפ
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <DashboardCard
          title="הסרטונים שלי"
          description="צפה בסרטונים שהתחלת לראות וחזור אליהם בקלות"
          href="/user/watched"
          icon={<FaVideo size={24} />}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <DashboardCard
          title="חיפוש אישי"
          description="חפש סרטונים לפי נושאים שמעניינים אותך"
          href="/explore"
          icon={<AiOutlineCompass size={24} />}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <DashboardCard
          title="המועדפים שלי"
          description="גישה מהירה לסרטונים שסימנת כמועדפים"
          href="/user"
          icon={<FaRegHeart size={24} />}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <DashboardCard
          title="טכניקות"
          description="למד טכניקות חדשות ושפר את המיומנויות שלך"
          href="/techniques"
          icon={<AiOutlineExperiment size={24} />}
        />
      </motion.div>
    </motion.div>
  );

  // WhatsApp join section component
  const WhatsAppJoinSection = () => (
    <motion.div 
      variants={itemVariants}
      className="bg-[#F7F3EB] rounded-xl p-6 border border-[#D5C4B7]/30 shadow-md relative overflow-hidden mb-8"
    >

      
      <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
        <div className="md:w-1/4 flex justify-center">
          <div className="bg-white p-4 rounded-full shadow-lg">
            <FaWhatsapp size={60} className="text-[#25D366]" />
          </div>
        </div>
        
        <div className="flex-grow md:w-3/4">
          <h3 className="text-xl font-bold text-[#2D3142] mb-2">
            הצטרף לקהילה שלנו בוואטסאפ
          </h3>
          <p className="text-[#3D3D3D] mb-4">
            הצטרף לקבוצת הוואטסאפ שלנו כדי לקבל עדכונים, טיפים, ולהיות בקשר ישיר עם בועז והצוות. 
            כאן תוכלו לשאול שאלות, לקבל תמיכה מהקהילה ולהתחבר עם מתאמנים אחרים.
          </p>
          
          <motion.button
            onClick={handleWhatsAppJoin}
            className="bg-[#25D366] hover:bg-[#128C7E] text-white py-3 px-6 rounded-md flex items-center gap-2 transition-all duration-300"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaWhatsapp size={20} />
            <span>הצטרף לקבוצה עכשיו</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#F7F3EB] pt-20 pb-8 px-4 sm:px-6 lg:px-8"> {/* Added pt-20 for top padding */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D5C4B7]"></div>
          </div>
        ) : session ? (
          <>
            {renderDashboardContent()}
            <WhatsAppJoinSection />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center"
            >
              <h1 className="text-3xl font-bold text-[#2D3142] mb-6">
                אנא התחבר כדי להמשיך
              </h1>
              <Link href="/login">
                <motion.span 
                  className="inline-block bg-[#D5C4B7] hover:bg-[#B8A99C] text-[#2D3142] py-3 px-8 rounded-full transition-all duration-300"
                  whileHover={{ y: -3, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}
                  whileTap={{ y: 0 }}
                >
                  התחברות
                </motion.span>
              </Link>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboardPage;
