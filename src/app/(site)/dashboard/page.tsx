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
import { FaWhatsapp, FaVideo, FaRegHeart } from "react-icons/fa";
import { AiOutlineExperiment, AiOutlineCompass } from "react-icons/ai";
import { MdOutlineSubscriptions } from "react-icons/md";

const DashboardPage = () => {
  const { data: session } = useSession();
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionId, setSubscriptionId] = useState(null);
  const [showWhatsAppTooltip, setShowWhatsAppTooltip] = useState(false);

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
          const subscriptionId = userData.subscriptionId;
          setSubscriptionId(subscriptionId);

          // Fetch subscription details using the retrieved subscriptionId
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
        }
      } catch (error) {
        console.error(
          "Error fetching user data or subscription details:",
          error,
        );
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
    // Replace with the actual WhatsApp group invite link
    window.open('https://chat.whatsapp.com/your-group-invite-link', '_blank');
  };

  return (
    <div className="min-h-screen relative pt-14">
      <div className="container mx-auto px-4 py-8 md:py-12 relative z-10 max-w-6xl">
        {session ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col gap-8"
          >
            {/* Header with decorative element */}
            <div className="relative overflow-hidden rounded-xl bg-[#D5C4B7]/20 p-8 border border-[#D5C4B7]/30">              
              <motion.div variants={itemVariants} className="relative z-10">
                <h1 className="text-3xl font-bold text-[#2D3142] mb-2 text-center">
                  {session.user?.name ? `שלום, ${session.user.name}` : 'ברוך הבא'}
                </h1>
                <p className="text-lg text-[#3D3D3D] text-center">
                  ברוך הבא לדשבורד האישי שלך בסטודיו בועז אונליין
                </p>
              </motion.div>
            </div>

            {/* WhatsApp Group Join Section */}
            <motion.div 
              variants={itemVariants}
              className="bg-[#F7F3EB] rounded-xl p-6 border border-[#D5C4B7]/30 shadow-md relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-32 h-32 opacity-10 -mt-10 -ml-10">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill="#25D366"
                    d="M45.7,-58.2C58.9,-48.3,69.2,-33.5,73.2,-16.9C77.2,-0.3,74.9,18.1,66.4,32.6C57.9,47.1,43.2,57.7,27.1,64.9C11,72.1,-6.5,75.9,-22.6,71.3C-38.7,66.7,-53.4,53.7,-62.3,37.8C-71.2,21.9,-74.3,3.1,-70.9,-14.1C-67.5,-31.3,-57.6,-46.9,-44.1,-56.8C-30.6,-66.7,-13.6,-70.8,1.5,-72.7C16.6,-74.6,32.5,-68.2,45.7,-58.2Z"
                  />
                </svg>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">

                
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-[#2D3142] mb-2">
                    הצטרף לקבוצת הוואטסאפ שלנו
                  </h3>
                  <p className="text-[#3D3D3D] mb-4">
                    הצטרף לקהילה שלנו בוואטסאפ כדי לקבל עדכונים, טיפים, ולהיות בקשר ישיר עם בועז והצוות. כאן תוכלו לשאול שאלות ולקבל תמיכה מהקהילה.
                  </p>
                  
                  <motion.button
                    onClick={handleWhatsAppJoin}
                    className="bg-[#25D366] hover:bg-[#128C7E] text-white py-3 px-6 rounded-full flex items-center gap-2 transition-all duration-300"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaWhatsapp size={20} />
                    <span>הצטרף לקבוצה עכשיו</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Dashboard Cards Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                link="/user"
                icon={<FaRegHeart size={24} />}
              />
              <DashboardCard
                title="טכניקות"
                description="למד טכניקות חדשות ושפר את המיומנויות שלך"
                link="/techniques"
                icon={<AiOutlineExperiment size={24} />}
              />
            </motion.div>

            {/* Subscription Status Section */}
            <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-[#D5C4B7] p-3 rounded-full">
                  <MdOutlineSubscriptions size={24} className="text-[#2D3142]" />
                </div>
                <h3 className="text-xl font-bold text-[#2D3142]">סטטוס מנוי</h3>
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

            {/* Newsletter Section */}
            <motion.div 
              variants={itemVariants}
              className="bg-[#F7F3EB] rounded-xl p-6 border border-[#D5C4B7]/30 shadow-md"
            >
              <h3 className="text-xl font-bold text-[#2D3142] mb-2 text-center">
                הרשמו לניוזלטר שלנו
              </h3>
              <p className="text-center text-[#3D3D3D] mb-6">
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
