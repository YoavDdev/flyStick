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
import { FaWhatsapp, FaVideo, FaRegHeart, FaCrown, FaCalendarAlt, FaUserCog } from "react-icons/fa";
import { AiOutlineExperiment, AiOutlineCompass } from "react-icons/ai";
import { MdOutlineSubscriptions, MdOutlineAdminPanelSettings } from "react-icons/md";
import { BiTime } from "react-icons/bi";
import { addDays } from "date-fns";
import { calculateDaysRemaining, formatDate, isInGracePeriod } from "@/app/utils/dateUtils";
import { toast } from "react-hot-toast";

const DashboardPage = () => {
  const { data: session } = useSession();
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [showWhatsAppTooltip, setShowWhatsAppTooltip] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [trialStartDate, setTrialStartDate] = useState<string | null>(null);
  const [cancellationDate, setCancellationDate] = useState<string | null>(null);
  const [hasContentAccess, setHasContentAccess] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (session?.user) {
          // Fetch user data including subscriptionId from the API route
          const response = await axios.post("/api/get-user-subsciptionId", {
            userEmail: session.user.email,
          });

          const userData = response.data;

          // Extract user data
          const subscriptionId = userData.subscriptionId;
          const trialStart = userData.trialStartDate;
          const cancelDate = userData.cancellationDate;
          
          setSubscriptionId(subscriptionId);
          setTrialStartDate(trialStart);
          setCancellationDate(cancelDate);
          
          // Check if user has admin access
          const adminCheckResponse = await axios.post("/api/check-admin", {
            email: session.user.email,
          });
          
          setIsAdmin(adminCheckResponse.data.isAdmin);
          setHasContentAccess(adminCheckResponse.data.hasContentAccess);

          // For PayPal subscriptions, fetch additional details
          if (subscriptionId && subscriptionId.startsWith('I-')) {
            try {
              const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
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
            } catch (paypalError) {
              console.error("Error fetching PayPal subscription details:", paypalError);
              // Still continue with the app even if PayPal API fails
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

  const cancelSubscription = async () => {
    try {
      if (session?.user) {
        const confirmed = window.confirm(
          "האם אתה בטוח שברצונך לבטל את המנוי שלך?"
        );

        if (confirmed) {
          const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
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
            setSubscriptionStatus("CANCELLED");
            toast.success("המנוי בוטל בהצלחה");
          } else {
            toast.error("שגיאה בביטול המנוי");
          }
        }
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast.error("שגיאה בביטול המנוי");
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
      },
    },
  };

  // Function to handle WhatsApp group join
  const handleWhatsAppJoin = () => {
    window.open('https://chat.whatsapp.com/your-group-invite-link', '_blank');
  };

  // Get subscription type display information
  const getSubscriptionInfo = () => {
    if (!subscriptionId) return { type: 'none', icon: null, color: '', text: 'אין מנוי פעיל' };
    
    if (subscriptionId === 'Admin') {
      return {
        type: 'admin',
        icon: <MdOutlineAdminPanelSettings className="text-xl" />,
        color: 'bg-purple-100 text-purple-800',
        text: 'מנהל מערכת'
      };
    }
    
    if (subscriptionId === 'free') {
      return {
        type: 'free',
        icon: <FaUserCog className="text-xl" />,
        color: 'bg-blue-100 text-blue-800',
        text: 'חשבון חופשי'
      };
    }
    
    if (subscriptionId === 'trial_30') {
      const trialInfo = trialStartDate ? 
        calculateDaysRemaining(trialStartDate, 30) : 
        { days: 0, expired: true };
        
      return {
        type: 'trial',
        icon: <BiTime className="text-xl" />,
        color: 'bg-green-100 text-green-800',
        text: `מנוי ניסיון (${trialInfo.days} ימים נותרו)`,
        daysRemaining: trialInfo.days,
        expired: trialInfo.expired
      };
    }
    
    if (subscriptionId.startsWith('I-')) {
      // Check for grace period
      if (cancellationDate && isInGracePeriod(cancellationDate)) {
        const graceInfo = calculateDaysRemaining(cancellationDate, 30);
        return {
          type: 'grace',
          icon: <FaCrown className="text-xl" />,
          color: 'bg-yellow-100 text-yellow-800',
          text: `מנוי בוטל (${graceInfo.days} ימים נותרו בתקופת גרייס)`,
          daysRemaining: graceInfo.days
        };
      }
      
      // Active subscription
      return {
        type: 'premium',
        icon: <FaCrown className="text-xl" />,
        color: 'bg-amber-100 text-amber-800',
        text: 'מנוי פעיל'
      };
    }
    
    return { type: 'unknown', icon: null, color: '', text: 'סטטוס לא ידוע' };
  };
  
  const subscriptionInfo = getSubscriptionInfo();

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#F7F3EB]">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-[#B56B4A]" role="status">
            <span className="visually-hidden">טוען...</span>
          </div>
          <p className="mt-4 text-[#5D5D5D]">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EB] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {session ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 gap-6"
          >
            {/* Welcome Banner with Subscription Info */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl p-6 border border-[#D5C4B7]/30 shadow-md"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-[#2D3142] mb-2">
                    שלום, {session.user?.name || 'משתמש יקר'}
                  </h1>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`px-3 py-1 rounded-full flex items-center gap-1 ${subscriptionInfo.color}`}>
                      {subscriptionInfo.icon}
                      <span>{subscriptionInfo.text}</span>
                    </div>
                  </div>
                  
                  <p className="text-[#3D3D3D] mb-4">
                    {subscriptionInfo.type === 'admin' && 'ברוכים הבאים למערכת הניהול של סטודיו בועז. כאן תוכלו לנהל את כל תוכן האתר.'}
                    {subscriptionInfo.type === 'free' && 'תודה שהצטרפתם לסטודיו בועז. שדרגו למנוי מלא כדי לקבל גישה לכל התכנים.'}
                    {subscriptionInfo.type === 'trial' && 'ברוכים הבאים לתקופת הניסיון! זה הזמן לחקור את כל התכנים שלנו.'}
                    {subscriptionInfo.type === 'premium' && 'תודה שבחרתם בסטודיו בועז. אנחנו שמחים שאתם איתנו.'}
                    {subscriptionInfo.type === 'grace' && 'המנוי שלך בוטל אך עדיין יש לך גישה לתכנים בתקופת הגרייס.'}
                    {subscriptionInfo.type === 'none' && 'הצטרפו למנוי כדי לקבל גישה לכל התכנים שלנו.'}
                    {subscriptionInfo.type === 'unknown' && 'ברוכים הבאים לסטודיו בועז אונליין.'}
                  </p>
                  
                  {/* Action buttons based on subscription type */}
                  {subscriptionInfo.type === 'free' && (
                    <Link href="/#Pricing">
                      <motion.span 
                        className="inline-block bg-[#D5C4B7] hover:bg-[#B8A99C] text-[#2D3142] py-2 px-6 rounded-md transition duration-300 ease-in-out"
                        whileHover={{ y: -2 }}
                        whileTap={{ y: 0 }}
                      >
                        שדרוג למנוי מלא
                      </motion.span>
                    </Link>
                  )}
                  
                  {subscriptionInfo.type === 'trial' && (
                    <Link href="/#Pricing">
                      <motion.span 
                        className="inline-block bg-[#D5C4B7] hover:bg-[#B8A99C] text-[#2D3142] py-2 px-6 rounded-md transition duration-300 ease-in-out"
                        whileHover={{ y: -2 }}
                        whileTap={{ y: 0 }}
                      >
                        שדרוג למנוי מלא
                      </motion.span>
                    </Link>
                  )}
                  
                  {subscriptionInfo.type === 'grace' && (
                    <Link href="/#Pricing">
                      <motion.span 
                        className="inline-block bg-[#D5C4B7] hover:bg-[#B8A99C] text-[#2D3142] py-2 px-6 rounded-md transition duration-300 ease-in-out"
                        whileHover={{ y: -2 }}
                        whileTap={{ y: 0 }}
                      >
                        חידוש המנוי
                      </motion.span>
                    </Link>
                  )}
                  
                  {subscriptionInfo.type === 'none' && (
                    <Link href="/#Pricing">
                      <motion.span 
                        className="inline-block bg-[#D5C4B7] hover:bg-[#B8A99C] text-[#2D3142] py-2 px-6 rounded-md transition duration-300 ease-in-out"
                        whileHover={{ y: -2 }}
                        whileTap={{ y: 0 }}
                      >
                        הצטרפות למנוי
                      </motion.span>
                    </Link>
                  )}
                </div>
                
                <div className="relative w-32 h-32 md:w-40 md:h-40">
                  <Image 
                    src={Dashboardpic}
                    alt="Dashboard Welcome"
                    className="rounded-full object-cover border-4 border-[#D5C4B7]/50"
                    fill
                    sizes="(max-width: 768px) 128px, 160px"
                    priority
                  />
                </div>
              </div>
            </motion.div>
            
            {/* Main Dashboard Cards */}
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Admin-only card */}
              {isAdmin && (
                <motion.div variants={itemVariants}>
                  <DashboardCard
                    title="ניהול המערכת"
                    icon={<MdOutlineAdminPanelSettings className="text-3xl text-[#2D3142]" />}
                    description="גישה לפאנל הניהול"
                    linkText="פאנל ניהול"
                    linkHref="/admin"
                    bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
                    borderColor="border-purple-200"
                  />
                </motion.div>
              )}
              
              {/* Explore Videos Card - for all users */}
              <motion.div variants={itemVariants}>
                <DashboardCard
                  title="סגנונות תנועה"
                  icon={<AiOutlineCompass className="text-3xl text-[#2D3142]" />}
                  description="גלו את כל סגנונות התנועה שלנו"
                  linkText="לחצו לגילוי"
                  linkHref="/explore"
                  bgColor="bg-gradient-to-br from-[#F7F3EB] to-[#EFE8DD]"
                  borderColor="border-[#D5C4B7]"
                />
              </motion.div>

              {/* Watched Videos Card - for users with content access */}
              {hasContentAccess && (
                <motion.div variants={itemVariants}>
                  <DashboardCard
                    title="הסרטונים שלי"
                    icon={<FaVideo className="text-3xl text-[#2D3142]" />}
                    description="צפו בסרטונים שכבר צפיתם בהם"
                    linkText="הסרטונים שלי"
                    linkHref="/user/watched"
                    bgColor="bg-gradient-to-br from-[#F7F3EB] to-[#EFE8DD]"
                    borderColor="border-[#D5C4B7]"
                  />
                </motion.div>
              )}

              {/* Favorites Card - for users with content access */}
              {hasContentAccess && (
                <motion.div variants={itemVariants}>
                  <DashboardCard
                    title="המועדפים שלי"
                    icon={<FaRegHeart className="text-3xl text-[#2D3142]" />}
                    description="הסרטונים המועדפים עליכם"
                    linkText="המועדפים שלי"
                    linkHref="/user/favorites"
                    bgColor="bg-gradient-to-br from-[#F7F3EB] to-[#EFE8DD]"
                    borderColor="border-[#D5C4B7]"
                  />
                </motion.div>
              )}

              {/* Subscription Management Card - for premium users */}
              {subscriptionInfo.type === 'premium' && (
                <motion.div variants={itemVariants}>
                  <DashboardCard
                    title="ניהול המנוי"
                    icon={<MdOutlineSubscriptions className="text-3xl text-[#2D3142]" />}
                    description="נהלו את המנוי שלכם"
                    linkText="ביטול מנוי"
                    onClick={cancelSubscription}
                    bgColor="bg-gradient-to-br from-[#F7F3EB] to-[#EFE8DD]"
                    borderColor="border-[#D5C4B7]"
                  />
                </motion.div>
              )}

              {/* WhatsApp Group Card - for all users */}
              <motion.div variants={itemVariants}>
                <DashboardCard
                  title="קבוצת וואטסאפ"
                  icon={<FaWhatsapp className="text-3xl text-[#2D3142]" />}
                  description="הצטרפו לקהילה שלנו בוואטסאפ"
                  linkText="הצטרפו לקבוצה"
                  onClick={handleWhatsAppJoin}
                  bgColor="bg-gradient-to-br from-[#F7F3EB] to-[#EFE8DD]"
                  borderColor="border-[#D5C4B7]"
                />
              </motion.div>
            </motion.div>

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

export default DashboardPage;
