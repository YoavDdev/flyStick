"use client";

import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import DashboardCard from "../../components/DashboardCard";
import axios from "axios";
import Image from "next/image";
import Dashboardpic from "../../../../public/Dashboardpic.png";
import ConvertkitEmailForm from "../../components/NewsletterSignUpForm";
import { motion } from "framer-motion";
import { FaVideo, FaRegHeart, FaClock, FaPlay, FaCheck, FaWhatsapp, FaUserPlus, FaCalendarAlt } from "react-icons/fa";
import { AiOutlineExperiment, AiOutlineCompass, AiOutlineTrophy } from "react-icons/ai";
import { MdOutlineSubscriptions, MdOutlineAdminPanelSettings } from "react-icons/md";
import { BiSolidBadgeCheck } from "react-icons/bi";
import UserMessageNotification from "../../components/UserMessageNotification";
import AdminMessageComposer from "../../components/AdminMessageComposer";
import AdminNewsletterComposer from "../../components/AdminNewsletterComposer";
import AdminFolderMetadataManager from "../../components/AdminFolderMetadataManager";
import AdminVideoSeriesManager from "../../components/AdminVideoSeriesManager";
import AdminProductManager from "../../components/AdminProductManager";
import AdminOrderManager from "../../components/AdminOrderManager";
import WelcomePopup from "../../components/WelcomePopup";

// Note: Metadata cannot be exported from client components
// SEO protection should be handled at the layout level

const DashboardPage = () => {
  const { data: session } = useSession();
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [showWhatsAppTooltip, setShowWhatsAppTooltip] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userStats, setUserStats] = useState({
    daysLeft: 0,
    watchedVideos: 0,
    favorites: 0,
    trialStartDate: null,
    cancellationDate: null,
    newUsers: 0,
    newSubscriptions: 0,
    recentCancellations: 0
  });
  const [purchasedSeries, setPurchasedSeries] = useState<any[]>([]);
  const [isSeriesOnlyUser, setIsSeriesOnlyUser] = useState(false);
  const [userDataLoading, setUserDataLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (session?.user) {
          // Fetch user data including subscriptionId from the new API route
          const response = await axios.post("/api/get-user-subsciptionId", {
            userEmail: session.user.email,
          });

          const userData = response.data;

          // Extract subscriptionId from userData
          const subscriptionId = userData.subscriptionId as string;
          setSubscriptionId(subscriptionId);
          
          // Check if user is admin
          setIsAdmin(subscriptionId === "Admin");

          // Calculate stats based on subscription type
          const stats = { ...userStats };
          
          // For trial users, calculate days left
          if (subscriptionId && subscriptionId === "trial_30" && userData.trialStartDate) {
            const trialStart = new Date(userData.trialStartDate);
            const today = new Date();
            const trialEnd = new Date(trialStart);
            trialEnd.setDate(trialEnd.getDate() + 30);
            const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
            stats.daysLeft = daysLeft;
            stats.trialStartDate = userData.trialStartDate;
          }
          
          // For users with cancellation date, calculate grace period
          if (userData.cancellationDate) {
            const cancelDate = new Date(userData.cancellationDate);
            const today = new Date();
            const graceEnd = new Date(cancelDate);
            graceEnd.setDate(graceEnd.getDate() + 30);
            const daysLeft = Math.max(0, Math.ceil((graceEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
            stats.daysLeft = daysLeft;
            stats.cancellationDate = userData.cancellationDate;
          }
          
          // Get watched videos and favorites count
          if (userData.watchedVideosCount !== undefined) {
            stats.watchedVideos = userData.watchedVideosCount;
          }
          
          if (userData.favoritesCount !== undefined) {
            stats.favorites = userData.favoritesCount;
          }
          
          // For admin users, fetch additional stats
          if (subscriptionId && subscriptionId === "Admin") {
            try {
              const adminStatsResponse = await axios.get("/api/admin/get-dashboard-stats", {
                headers: { Authorization: `Bearer ${session.user.email}` }
              });
              
              if (adminStatsResponse.data) {
                stats.newUsers = adminStatsResponse.data.newUsersLast30Days || 0;
                stats.newSubscriptions = adminStatsResponse.data.newSubscriptionsLast30Days || 0;
                stats.recentCancellations = adminStatsResponse.data.recentCancellations || 0;
              }
            } catch (adminError) {
              console.error("Error fetching admin stats:", adminError);
            }
          }
          
          setUserStats(stats);

          // Fetch subscription details using the retrieved subscriptionId
          if (subscriptionId && subscriptionId.startsWith("I-")) {
            const clientId = process.env.PAYPAL_CLIENT_ID;
            const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

            const auth = {
              username: clientId!,
              password: clientSecret!,
            };

            const subscriptionResponse = await axios.get(
              `https://api.paypal.com/v1/billing/subscriptions/${subscriptionId}`,
              { auth },
            );

            const status = subscriptionResponse.data.status;
            setSubscriptionStatus(status);
          } else if (subscriptionId === "Admin") {
            setSubscriptionStatus("ACTIVE");
          } else if (subscriptionId === "trial_30") {
            setSubscriptionStatus("TRIAL");
          } else if (subscriptionId === "free") {
            setSubscriptionStatus("FREE");
          } else {
            setSubscriptionStatus("UNKNOWN");
          }

          setIsAdmin(userData.isAdmin || userData.subscriptionId === "Admin");
          
          // Fetch purchased series for non-admin users
          if (!userData.isAdmin && userData.subscriptionId !== "Admin") {
            const purchases = await fetchPurchasedSeries();
            
            // Determine if user is series-only (has purchased series but no active subscription)
            const hasNoActiveSubscription = !subscriptionId || 
              (!subscriptionId.startsWith("I-") && 
               subscriptionId !== "trial_30" && 
               subscriptionId !== "free" && 
               subscriptionId !== "Admin");
            
            if (hasNoActiveSubscription && purchases.length > 0) {
              setIsSeriesOnlyUser(true);
            }
          }
          
          setLoading(false);
          setUserDataLoading(false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
        setUserDataLoading(false);
      }
    };

    const fetchPurchasedSeries = async () => {
      try {
        const response = await fetch("/api/series/purchase");
        if (response.ok) {
          const purchases = await response.json();
          setPurchasedSeries(purchases);
          return purchases;
        }
        return [];
      } catch (error) {
        console.error("Error fetching purchased series:", error);
        return [];
      }
    };

    if (session?.user) {
      fetchUserData();
    }
  }, [session]);

  const cancelSubscription = async () => {
    try {
      if (session?.user) {
        const confirmed = window.confirm(
          "האם אתה בטוח שברצונך לבטל את המנוי שלך?"
        );

        if (confirmed) {
          const clientId = process.env.PAYPAL_CLIENT_ID;
          const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

          const auth = {
            username: clientId!,
            password: clientSecret!,
          };

          const response = await axios.post("/api/get-user-subsciptionId", {
            userEmail: session.user.email,
          });

          const userData = response.data;
          const subscriptionId = userData.subscriptionId;

          const cancellationResponse = await axios.post(
            `https://api.paypal.com/v1/billing/subscriptions/${subscriptionId}/cancel`,
            {},
            { auth },
          );

          if (cancellationResponse.status === 204) {
            // Call our backend API to update the database with cancellation date
            await axios.post("/api/cancel-subscription", {
              userEmail: session.user.email,
            });
            
            setSubscriptionStatus("CANCELLED");
            console.log("Subscription canceled successfully");
          } else {
            console.log(
              "Failed to cancel subscription",
              cancellationResponse.data,
            );
          }
        }
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
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
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1.0] as [number, number, number, number],
      },
    },
  };

  // Function to handle WhatsApp group join
  const handleWhatsAppJoin = () => {
    // WhatsApp group invite link
    window.open('https://chat.whatsapp.com/Id0a5w2JBj7IPM4JWRchjP?mode=r_c', '_blank');
  };

  // Show loading spinner while user data is being fetched
  if (userDataLoading) {
    return (
      <div className="min-h-screen relative pt-14 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#D5C4B7]"></div>
          <p className="mt-4 text-[#2D3142]">טוען נתוני משתמש...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pt-14">
      <div className="container mx-auto px-3 sm:px-6 py-6 sm:py-12">
        {session ? (
          <>
            {/* Welcome Popup for new users */}
            <WelcomePopup />
            
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="flex flex-col gap-5 sm:gap-8"
            >
            {/* Header with decorative element */}
            <div className="relative overflow-hidden rounded-xl bg-[#D5C4B7]/20 p-5 sm:p-8 border border-[#D5C4B7]/30">              
              <motion.div variants={itemVariants} className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#2D3142] text-center flex-1">
                    {session.user?.name ? `שלום, ${session.user.name}` : 'ברוך הבא'}
                  </h1>
                  <UserMessageNotification className="ml-4" />
                </div>
                <p className="text-base sm:text-lg text-[#3D3D3D] text-center">
                  {subscriptionId === "Admin" ? 
                    'ברוך הבא לדשבורד האישי שלך, מנהל יקר!' :
                  isSeriesOnlyUser ?
                    'ברוך הבא לאיזור הסדרות שלך! כאן תוכל לגשת לכל הסדרות שרכשת' :
                  subscriptionId === "trial_30" ? 
                    `ברוך הבא לדשבורד האישי שלך! נותרו לך ${userStats.daysLeft} ימים בתקופת הניסיון` :
                  subscriptionId === "free" ? 
                    'ברוך הבא לדשבורד האישי שלך! אתה נהנה מגישה חופשית לתכני הסטודיו' :
                  subscriptionId && subscriptionId.startsWith("I-") && userStats.cancellationDate ? 
                    `המנוי שלך בוטל. נותרו לך עוד ${userStats.daysLeft} ימי גישה לתכנים` :
                  subscriptionId && subscriptionId.startsWith("I-") ? 
                    'ברוך הבא לדשבורד האישי שלך בסטודיו בועז אונליין' :
                    'ברוך הבא לדשבורד האישי שלך בסטודיו בועז אונליין'}
                </p>
                
              </motion.div>
            </div>

            {/* Admin Components - Only visible to admin users */}
            {isAdmin && (
              <>
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <AdminMessageComposer />
                  </div>
                  <div className="flex-1">
                    <AdminNewsletterComposer />
                  </div>
                </motion.div>
                
                {/* Folder Metadata Manager */}
                <motion.div variants={itemVariants}>
                  <AdminFolderMetadataManager />
                </motion.div>

                {/* Video Series Manager */}
                <motion.div variants={itemVariants}>
                  <AdminVideoSeriesManager />
                </motion.div>

                {/* Shop Management Links */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/admin/products">
                    <div className="bg-white border-2 border-[#D5C4B7] rounded-xl p-6 hover:shadow-lg transition-all hover:border-[#B8A99C] cursor-pointer">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="bg-[#D5C4B7] p-3 rounded-full">
                          <svg className="w-6 h-6 text-[#2D3142]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-[#2D3142]">ניהול מוצרים</h3>
                      </div>
                      <p className="text-[#2D3142]/60 text-sm">הוספה, עריכה וניהול מוצרי חנות Kohu</p>
                    </div>
                  </Link>

                  <Link href="/admin/orders">
                    <div className="bg-white border-2 border-[#D5C4B7] rounded-xl p-6 hover:shadow-lg transition-all hover:border-[#B8A99C] cursor-pointer">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="bg-[#D5C4B7] p-3 rounded-full">
                          <svg className="w-6 h-6 text-[#2D3142]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-[#2D3142]">ניהול הזמנות</h3>
                      </div>
                      <p className="text-[#2D3142]/60 text-sm">מעקב וניהול הזמנות, עדכון סטטוסים</p>
                    </div>
                  </Link>
                </motion.div>
              </>
            )}

            {/* WhatsApp Group Join Section */}
            <motion.div 
              variants={itemVariants}
              className="bg-[#F7F3EB] rounded-xl p-4 sm:p-6 border border-[#D5C4B7]/30 shadow-md relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-32 h-32 opacity-10 -mt-10 -ml-10">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill="#25D366"
                    d="M45.7,-58.2C58.9,-48.3,69.2,-33.5,73.2,-16.9C77.2,-0.3,74.9,18.1,66.4,32.6C57.9,47.1,43.2,57.7,27.1,64.9C11,72.1,-6.5,75.9,-22.6,71.3C-38.7,66.7,-53.4,53.7,-62.3,37.8C-71.2,21.9,-74.3,3.1,-70.9,-14.1C-67.5,-31.3,-57.6,-46.9,-44.1,-56.8C-30.6,-66.7,-13.6,-70.8,1.5,-72.7C16.6,-74.6,32.5,-68.2,45.7,-58.2Z"
                  />
                </svg>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-6 relative">

                
                <div className="flex-grow">
                  <h3 className="text-lg sm:text-xl font-bold text-[#2D3142] mb-2">
                    הצטרף לקבוצת הוואטסאפ שלנו
                  </h3>
                  <p className="text-sm sm:text-base text-[#3D3D3D] mb-4">
                    הצטרף לקהילה שלנו בוואטסאפ כדי לקבל עדכונים, טיפים, ולהיות בקשר ישיר עם בועז והצוות. כאן תוכלו לשאול שאלות ולקבל תמיכה מהקהילה.
                  </p>
                  
                  <motion.button
                    onClick={handleWhatsAppJoin}
                    className="bg-[#25D366] hover:bg-[#128C7E] text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-full flex items-center gap-2 transition-all duration-300 text-sm sm:text-base"
                    whileHover={{ opacity: 0.9 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaWhatsapp size={20} />
                    <span>הצטרף לקבוצה עכשיו</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* User Stats Section - New Addition */}
            <motion.div variants={itemVariants} className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-[#D5C4B7] p-3 rounded-full">
                  <AiOutlineTrophy size={24} className="text-[#2D3142]" />
                </div>
                <h3 className="text-xl font-bold text-[#2D3142]">
                  {isSeriesOnlyUser ? 'סטטוס רכישות' : 'סטטוס מנוי'}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {/* Dynamic stats based on subscription type */}
                {isSeriesOnlyUser && (
                  <>
                    <div className="bg-purple-50 p-4 rounded-lg flex items-center gap-3">
                      <FaPlay className="text-purple-500 text-xl" />
                      <div>
                        <h4 className="font-semibold text-[#2D3142]">סטטוס</h4>
                        <p className="text-lg font-bold">רוכש סדרות</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-3">
                      <FaVideo className="text-blue-500 text-xl" />
                      <div>
                        <h4 className="font-semibold text-[#2D3142]">סדרות שנרכשו</h4>
                        <p className="text-lg font-bold">{purchasedSeries.length} סדרות</p>
                      </div>
                    </div>
                  </>
                )}
                
                {!isSeriesOnlyUser && subscriptionId === "trial_30" && (
                  <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-3">
                    <FaClock className="text-blue-500 text-xl" />
                    <div>
                      <h4 className="font-semibold text-[#2D3142]">ימים שנותרו בניסיון</h4>
                      <p className="text-lg font-bold">{userStats.daysLeft} ימים</p>
                    </div>
                  </div>
                )}

                {!isSeriesOnlyUser && userStats.cancellationDate && (
                  <div className="bg-amber-50 p-4 rounded-lg flex items-center gap-3">
                    <FaClock className="text-amber-500 text-xl" />
                    <div>
                      <h4 className="font-semibold text-[#2D3142]">ימים שנותרו בתקופת החסד</h4>
                      <p className="text-lg font-bold">{userStats.daysLeft} ימים</p>
                    </div>
                  </div>
                )}

                {!isSeriesOnlyUser && subscriptionId === "free" && (
                  <div className="bg-green-50 p-4 rounded-lg flex items-center gap-3">
                    <BiSolidBadgeCheck className="text-green-500 text-xl" />
                    <div>
                      <h4 className="font-semibold text-[#2D3142]">סטטוס גישה</h4>
                      <p className="text-lg font-bold">גישה חופשית</p>
                    </div>
                  </div>
                )}

                {subscriptionId === "Admin" && (
                  <>
                    <div className="bg-purple-50 p-4 rounded-lg flex items-center gap-3">
                      <MdOutlineAdminPanelSettings className="text-purple-500 text-xl" />
                      <div>
                        <h4 className="font-semibold text-[#2D3142]">סטטוס</h4>
                        <p className="text-lg font-bold">מנהל מערכת</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-3">
                      <FaUserPlus className="text-blue-500 text-xl" />
                      <div>
                        <h4 className="font-semibold text-[#2D3142]">משתמשים חדשים (30 ימים)</h4>
                        <p className="text-lg font-bold">{userStats.newUsers}</p>
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg flex items-center gap-3">
                      <MdOutlineSubscriptions className="text-green-500 text-xl" />
                      <div>
                        <h4 className="font-semibold text-[#2D3142]">מנויים חדשים (30 ימים)</h4>
                        <p className="text-lg font-bold">{userStats.newSubscriptions}</p>
                      </div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg flex items-center gap-3">
                      <MdOutlineSubscriptions className="text-red-500 text-xl" />
                      <div>
                        <h4 className="font-semibold text-[#2D3142]">ביטולי מנוי (30 ימים)</h4>
                        <p className="text-lg font-bold">{userStats.recentCancellations}</p>
                      </div>
                    </div>
                    <Link href="/admin" className="bg-gray-50 p-4 rounded-lg flex items-center gap-3 hover:bg-gray-100 transition-colors">
                      <MdOutlineAdminPanelSettings className="text-gray-700 text-xl" />
                      <div>
                        <h4 className="font-semibold text-[#2D3142]">דף ניהול</h4>
                        <p className="text-sm text-gray-600">לחץ כאן לניהול המערכת</p>
                      </div>
                    </Link>
                  </>
                )}

                {/* Stats for regular users only - admin stats are handled separately */}
                {subscriptionId !== "Admin" && (
                  <>
                    {/* No watched videos or favorites stats as requested */}
                  </>
                )}

                {subscriptionId && subscriptionId.startsWith("I-") && !userStats.cancellationDate && (
                  <div className="bg-green-50 p-4 rounded-lg flex items-center gap-3">
                    <BiSolidBadgeCheck className="text-green-500 text-xl" />
                    <div>
                      <h4 className="font-semibold text-[#2D3142]">סטטוס:</h4>
                      <p className="text-lg font-bold">פעיל</p>
                    </div>
                  </div>
                )}

                {userStats.trialStartDate && (
                  <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-3">
                    <FaCalendarAlt className="text-blue-500 text-xl" />
                    <div>
                      <h4 className="font-semibold text-[#2D3142]">תאריך התחלת ניסיון</h4>
                      <p className="text-lg font-bold">{new Date(userStats.trialStartDate).toLocaleDateString('he-IL')}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Dashboard Cards Grid - Only for regular users, not series-only users */}
            {!isSeriesOnlyUser && (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8"
              >
                <DashboardCard
                  title="הסרטונים שלי"
                  description="צפה בסרטונים שהתחלת לראות וחזור אליהם בקלות"
                  link="/user/watched"
                  icon={<FaVideo size={24} />}
                />
                <DashboardCard
                  title="חיפוש אישי"
                  description="חפש סרטונים לפי נושאים שמעניינים אותך"
                  link="/explore"
                  icon={<AiOutlineCompass size={24} />}
                />
                <DashboardCard
                  title="המועדפים שלי"
                  description="גישה מהירה לסרטונים שסימנת כמועדפים"
                  link="/user/favorites"
                  icon={<FaRegHeart size={24} />}
                />
                <DashboardCard
                  title="טכניקות"
                  description="למד טכניקות חדשות ושפר את המיומנויות שלך"
                  link="/styles"
                  icon={<AiOutlineExperiment size={24} />}
                />
                <DashboardCard
                  title="קורסים"
                  description="גלה סדרות וקורסים מובנים לרכישה"
                  link="/series"
                  icon={<FaPlay size={24} />}
                />
              </motion.div>
            )}

            {/* Purchased Series Section - Only for non-admin users */}
            {!isAdmin && purchasedSeries.length > 0 && (
              <motion.div variants={itemVariants} className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-[#D5C4B7] p-3 rounded-full">
                    <FaVideo size={24} className="text-[#2D3142]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#2D3142]">הסדרות שרכשתי</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {purchasedSeries.map((purchase, index) => (
                    <motion.div
                      key={purchase.series.id}
                      className="group cursor-pointer"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -4 }}
                    >
                      <Link href={`/series/${purchase.series.id}`}>
                        <div className="relative bg-[#F0E9DF] rounded-2xl border border-[#D5C4B7] p-6 shadow-md hover:shadow-lg transition-all duration-500 h-full">
                          {/* Series Thumbnail */}
                          <div className="relative aspect-video bg-gradient-to-br from-[#D5C4B7] to-[#B8A99C] rounded-xl overflow-hidden mb-6">
                            {purchase.series.thumbnailUrl ? (
                              <img
                                src={purchase.series.thumbnailUrl}
                                alt={purchase.series.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#D5C4B7] to-[#B8A99C]">
                                <FaVideo className="text-5xl text-[#2D3142]/60" />
                              </div>
                            )}
                            
                            {/* Overlay with Play Button */}
                            <div className="absolute inset-0 bg-[#2D3142]/0 group-hover:bg-[#2D3142]/40 transition-all duration-300 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="bg-white text-[#2D3142] p-4 rounded-full shadow-xl"
                                >
                                  <FaPlay className="text-xl ml-1" />
                                </motion.button>
                              </div>
                            </div>

                            {/* Access Status Badge */}
                            <div className="absolute top-4 right-4 bg-gradient-to-r from-[#D5C4B7] to-[#B8A99C] text-[#2D3142] px-3 py-1 rounded-full text-sm font-bold shadow-md">
                              <FaCheck className="inline mr-1" />
                              נרכש
                            </div>
                          </div>

                          {/* Series Info */}
                          <div className="space-y-4 flex-1">
                            <h3 className="text-xl font-bold text-[#2D3142] group-hover:text-[#D9713C] transition-colors duration-300">
                              {purchase.series.title}
                            </h3>
                            <p className="text-[#2D3142]/70 text-sm leading-relaxed line-clamp-3">
                              {purchase.series.description}
                            </p>
                            
                            <div className="flex items-center justify-between pt-4">
                              <div className="flex items-center gap-2 text-sm text-[#2D3142]/60">
                                <FaVideo className="text-[#D9713C]" />
                                <span>{purchase.series.videoCount} פרקים</span>
                              </div>
                              <div className="text-xs text-[#2D3142]/50">
                                נרכש ב-{new Date(purchase.purchaseDate).toLocaleDateString('he-IL')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Link href="/series">
                    <motion.button
                      className="bg-[#B8A99C] text-white px-6 py-2 rounded-lg hover:bg-[#D5C4B7] transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      עיין בעוד סדרות
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Subscription Status Section - Hidden for Series-Only Users */}
            {!isSeriesOnlyUser && (
              <motion.div variants={itemVariants} className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-[#D5C4B7] p-3 rounded-full">
                    <MdOutlineSubscriptions size={24} className="text-[#2D3142]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#2D3142]">ניהול מנוי</h3>
                </div>

              {loading ? (
                <p className="text-center py-4">טוען...</p>
              ) : (
                <div className="mt-4">
                  {(subscriptionStatus === "ACTIVE" || subscriptionId === "Admin" || subscriptionStatus === "PENDING_CANCELLATION") && (
                    <>
                      <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md mb-4 flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        <p>המנוי שלך פעיל</p>
                      </div>
                      <p className="mb-4">
                        אתה נהנה כרגע מגישה מלאה לכל התכנים שלנו. אם ברצונך לבטל
                        את המנוי שלך, אנא לחץ על הכפתור למטה או צור קשר ב
                        <Link
                          href="/contact"
                          className="text-[#B8A99C] hover:text-[#D5C4B7] mx-1"
                        >
                          לחץ כאן
                        </Link>
                        . שימו לב, סיום מנוי מאפשר להנות מתכני הסטודיו עד לתום
                        תקופת החיוב.
                      </p>
                      <motion.button
                        onClick={cancelSubscription}
                        className="bg-red-500 text-white py-2 px-6 rounded-md hover:bg-red-600 transition duration-300 ease-in-out"
                        whileHover={{ y: -2 }}
                        whileTap={{ y: 0 }}
                      >
                        בטל מנוי
                      </motion.button>
                    </>
                  )}

                  {subscriptionStatus === "PENDING_CANCELLATION" && (
                    <>
                      <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md mb-4 flex items-center gap-2">
                        <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                        <p>המנוי שלך בתהליך ביטול</p>
                      </div>
                      <p>
                        המנוי שלך נמצא בתהליך ביטול. תוכל להמשיך להנות מהתכנים
                        שלנו עד תום תקופת החיוב הנוכחית. במידה ואתה מעוניין
                        להפסיק את תהליך הביטול ולהמשיך במנוי, צור איתנו קשר
                        ב&apos;צרו קשר&apos;.
                      </p>
                    </>
                  )}

                  {subscriptionStatus === "CANCELLED" && (
                    <>
                      <div className="bg-red-100 text-red-800 px-4 py-2 rounded-md mb-4 flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        <p>המנוי שלך בוטל</p>
                      </div>
                      <p className="mb-4">
                        המנוי שלך בוטל בהצלחה. לחידוש המנוי לחצו על הכפתור
                        מטה.
                      </p>
                      <Link href="/#Pricing">
                        <motion.span 
                          className="inline-block bg-[#D5C4B7] hover:bg-[#B8A99C] text-[#2D3142] py-2 px-6 rounded-md transition duration-300 ease-in-out"
                          whileHover={{ y: -2 }}
                          whileTap={{ y: 0 }}
                        >
                          חדש את המנוי שלך
                        </motion.span>
                      </Link>
                    </>
                  )}

                  {subscriptionStatus === null && (
                    <>
                      <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md mb-4 flex items-center gap-2">
                        <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
                        <p>אין מנוי פעיל</p>
                      </div>
                      <p className="mb-4">
                        אין לך מנוי פעיל. להצטרפות למנוי חדש ולהנות מתכני
                        הסטודיו, לחצו על הכפתור מטה.
                      </p>
                      <Link href="/#Pricing">
                        <motion.span 
                          className="inline-block bg-[#D5C4B7] hover:bg-[#B8A99C] text-[#2D3142] py-2 px-6 rounded-md transition duration-300 ease-in-out"
                          whileHover={{ y: -2 }}
                          whileTap={{ y: 0 }}
                        >
                          הפעל מנוי
                        </motion.span>
                      </Link>
                    </>
                  )}
                </div>
              )}
              </motion.div>
            )}

            {/* Newsletter Section */}
            <motion.div 
              variants={itemVariants}
              className="bg-[#F7F3EB] rounded-xl p-4 sm:p-6 border border-[#D5C4B7]/30 shadow-md"
            >
              <h3 className="text-lg sm:text-xl font-bold text-[#2D3142] mb-2 text-center">
                הרשמו לניוזלטר שלנו
              </h3>
              <p className="text-center text-sm sm:text-base text-[#3D3D3D] mb-4 sm:mb-6">
                כדי לקבל הסברים שימושיים שיעזרו לכם להתנהל בסטודיו ולדעת מה
                מתאים עבורכם ומדי פעם תקבלו עדכון על סרט חשוב, המלצה, הרצאה חדשה
                וכו&apos;.
              </p>

              <div className="flex justify-center">
                <ConvertkitEmailForm />
              </div>
            </motion.div>
          </motion.div>
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
                  whileHover={{ y: -3, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
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

export default DashboardPage;