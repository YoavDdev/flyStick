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
          
          console.log('Dashboard - User data received:', { 
            subscriptionId, 
            trialStartDate: trialStart, 
            cancellationDate: cancelDate 
          });
          
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

          // Get the subscription ID
          const response = await axios.post("/api/get-user-subsciptionId", {
            userEmail: session.user.email,
          });

          const subscriptionId = response.data.subscriptionId;

          if (subscriptionId && subscriptionId.startsWith("I-")) {
            // Cancel the subscription through PayPal API
            await axios.post(
              `https://api.paypal.com/v1/billing/subscriptions/${subscriptionId}/cancel`,
              { reason: "Canceled by user" },
              { auth }
            );

            // Update the user's subscription status in your database
            await axios.post("/api/update-subscription-status", {
              email: session.user.email,
              subscriptionId: "free",
              cancellationDate: new Date().toISOString(),
            });

            toast.success("המנוי בוטל בהצלחה");
            // Refresh the page to update the UI
            window.location.reload();
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
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Function to handle WhatsApp group join
  const handleWhatsAppJoin = () => {
    window.open("https://chat.whatsapp.com/JLBVoMQBrsN0XpC2Ll8j8d", "_blank");
  };

  // Get subscription type display information
  const getSubscriptionInfo = () => {
    if (!subscriptionId) {
      return {
        type: 'unknown',
        text: 'טוען...',
        color: 'bg-gray-200 text-gray-700',
        icon: <BiTime className="mr-1" />,
        message: '',
        showUpgradeButton: false,
      };
    }

    // Admin user
    if (subscriptionId === 'Admin') {
      return {
        type: 'admin',
        text: 'מנהל',
        color: 'bg-purple-200 text-purple-800',
        icon: <MdOutlineAdminPanelSettings className="mr-1" />,
        message: 'ברוכים הבאים למערכת הניהול',
        showUpgradeButton: false,
      };
    }

    // Free user
    if (subscriptionId === 'free') {
      return {
        type: 'free',
        text: 'משתמש חופשי',
        color: 'bg-blue-100 text-blue-800',
        icon: <AiOutlineCompass className="mr-1" />,
        message: 'גישה מוגבלת לתוכן',
        showUpgradeButton: false,
      };
    }

    // Trial user
    if (subscriptionId === 'trial_30') {
      const daysRemaining = trialStartDate 
        ? calculateDaysRemaining(trialStartDate) 
        : 0;
      
      return {
        type: 'trial',
        text: `תקופת ניסיון (${daysRemaining} ימים נותרו)`,
        color: 'bg-yellow-100 text-yellow-800',
        icon: <AiOutlineExperiment className="mr-1" />,
        message: trialStartDate 
          ? `תקופת הניסיון שלך תסתיים ב-${formatDate(new Date(trialStartDate).setDate(new Date(trialStartDate).getDate() + 30))}`
          : 'תאריך התחלה חסר - יש לעדכן את המשתמש',
        showUpgradeButton: true,
      };
    }

    // PayPal subscription
    if (subscriptionId.startsWith('I-')) {
      // Check if subscription is canceled but in grace period
      if (cancellationDate && isInGracePeriod(cancellationDate)) {
        return {
          type: 'premium',
          text: 'מנוי פרימיום (תקופת חסד)',
          color: 'bg-orange-100 text-orange-800',
          icon: <FaCrown className="mr-1" />,
          message: `המנוי שלך בוטל אך יישאר פעיל עד ${formatDate(new Date(cancellationDate).setDate(new Date(cancellationDate).getDate() + 30))}`,
          showUpgradeButton: false,
        };
      }

      return {
        type: 'premium',
        text: 'מנוי פרימיום',
        color: 'bg-green-100 text-green-800',
        icon: <FaCrown className="mr-1" />,
        message: 'גישה מלאה לכל התוכן',
        showUpgradeButton: false,
      };
    }

    // Default case
    return {
      type: 'unknown',
      text: 'סטטוס לא ידוע',
      color: 'bg-gray-200 text-gray-700',
      icon: <BiTime className="mr-1" />,
      message: '',
      showUpgradeButton: true,
    };
  };

  const subscriptionInfo = getSubscriptionInfo();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F3EB]/50">
        <div className="text-center p-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D5C4B7]"></div>
          <p className="mt-4 text-[#3D3D3D]">טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EB]/50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
        {session ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 gap-6"
          >
            {/* Welcome Section */}
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Image container - hidden on small screens, visible on medium and up */}
                <div className="hidden md:block md:w-1/3 relative overflow-hidden h-48 md:h-auto">
                  <Image
                    src={Dashboardpic}
                    alt="Dashboard Welcome"
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>
                {/* Content container - full width on mobile, 2/3 on larger screens */}
                <div className="flex-1 p-4 sm:p-6 md:p-8">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2D3142] mb-2">
                    שלום, {session?.user?.name || 'משתמש יקר'}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <div className={`px-3 py-1 rounded-full flex items-center gap-1 ${subscriptionInfo.color}`}>
                      {subscriptionInfo.icon}
                      <span className="text-sm sm:text-base">{subscriptionInfo.text}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm sm:text-base text-[#3D3D3D] mb-4">
                    {subscriptionInfo.message}
                  </p>
                  
                  {subscriptionInfo.showUpgradeButton && (
                    <Link href="/pricing">
                      <motion.span
                        className="inline-block bg-[#D5C4B7] hover:bg-[#B8A99C] text-[#2D3142] py-2 px-6 rounded-full text-sm sm:text-base transition-all duration-300"
                        whileHover={{ y: -2, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                        whileTap={{ y: 0 }}
                      >
                        שדרג למנוי מלא
                      </motion.span>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Dashboard Cards Grid - Responsive grid with 1 column on mobile, 2 on tablet, 3 on desktop */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            >
              {/* Admin Panel Card - only for admin users */}
              {isAdmin && (
                <motion.div variants={itemVariants}>
                  <DashboardCard
                    title="פאנל ניהול"
                    icon={<FaUserCog className="text-3xl text-[#2D3142]" />}
                    description="ניהול משתמשים ותוכן"
                    link="/admin"
                  />
                </motion.div>
              )}

              {/* Videos Card - for users with content access */}
              {hasContentAccess && (
                <motion.div variants={itemVariants}>
                  <DashboardCard
                    title="סרטונים"
                    icon={<FaVideo className="text-3xl text-[#2D3142]" />}
                    description="צפו בסרטונים שלנו"
                    link="/videos"
                  />
                </motion.div>
              )}

              {/* Watched Videos Card - for users with content access */}
              {hasContentAccess && (
                <motion.div variants={itemVariants}>
                  <DashboardCard
                    title="סרטונים שנצפו"
                    icon={<FaCalendarAlt className="text-3xl text-[#2D3142]" />}
                    description="הסרטונים שכבר צפיתם בהם"
                    link="/user/watched"
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
                    link="/user/favorites"
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
                    link="/user"
                  />
                </motion.div>
              )}

              {/* WhatsApp Group Card - for all users */}
              <motion.div variants={itemVariants}>
                <DashboardCard
                  title="קבוצת וואטסאפ"
                  icon={<FaWhatsapp className="text-3xl text-[#2D3142]" />}
                  description="הצטרפו לקהילה שלנו בוואטסאפ"
                  link="https://chat.whatsapp.com/JLBVoMQBrsN0XpC2Ll8j8d"
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
