"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import { FaArrowLeft, FaVideo, FaStar } from "react-icons/fa";

const SeriesRegisterPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/series';
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      // User is already logged in, redirect to return URL or series page
      const redirectUrl = returnUrl === '/' ? '/series' : returnUrl;
      router.push(redirectUrl);
    }
  }, [session, returnUrl, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("הסיסמאות אינן תואמות");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          userType: "series_only",
          registrationSource: "series_purchase"
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("🎉 נרשמת בהצלחה! כעת תוכל לרכוש סדרות");
        
        // Auto-login after registration
        const { signIn } = await import("next-auth/react");
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false
        });

        if (result?.ok) {
          // Wait a moment for session to update, then redirect to appropriate page
          const redirectUrl = returnUrl === '/' ? '/series' : returnUrl;
          setTimeout(() => {
            router.push(redirectUrl);
          }, 1000);
        } else {
          toast.error("שגיאה בהתחברות אוטומטית");
          const loginRedirectUrl = returnUrl === '/' ? '/series' : returnUrl;
          router.push(`/login?returnUrl=${encodeURIComponent(loginRedirectUrl)}`);
        }
      } else {
        toast.error(data.error || "שגיאה ברישום");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("שגיאה ברישום");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3EB] relative">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-[url('/backgrounds/paper-texture.png')] bg-repeat opacity-30"></div>
      </div>
      
      {/* Header */}
      <div className="container mx-auto px-6 py-8 relative">
        <Link href="/series" className="inline-flex items-center text-[#2D3142] hover:text-[#B8A99C] transition-colors">
          <FaArrowLeft className="mr-2" />
          חזרה לסדרות
        </Link>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-16 relative">
        <div className="max-w-md mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="bg-gradient-to-r from-[#B8A99C] to-[#D5C4B7] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <FaVideo className="text-2xl text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-[#2D3142] mb-4">
              הצטרף לסדרות הווידאו
            </h1>
            <p className="text-[#5D5D5D] leading-relaxed">
              צור חשבון כדי לרכוש ולצפות בסדרות הווידאו המקצועיות שלנו
            </p>
          </motion.div>

          {/* Registration Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl border border-[#D5C4B7]/30 p-8 shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#2D3142] mb-2">
                  שם מלא
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/80 border border-[#D5C4B7]/50 rounded-xl text-[#2D3142] placeholder-[#5D5D5D]/60 focus:outline-none focus:ring-2 focus:ring-[#B8A99C] focus:border-[#B8A99C] transition-all"
                  placeholder="הכנס את שמך המלא"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#2D3142] mb-2">
                  כתובת אימייל
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/80 border border-[#D5C4B7]/50 rounded-xl text-[#2D3142] placeholder-[#5D5D5D]/60 focus:outline-none focus:ring-2 focus:ring-[#B8A99C] focus:border-[#B8A99C] transition-all"
                  placeholder="הכנס את כתובת האימייל שלך"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#2D3142] mb-2">
                  סיסמה
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-white/80 border border-[#D5C4B7]/50 rounded-xl text-[#2D3142] placeholder-[#5D5D5D]/60 focus:outline-none focus:ring-2 focus:ring-[#B8A99C] focus:border-[#B8A99C] transition-all"
                  placeholder="בחר סיסמה (לפחות 6 תווים)"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#2D3142] mb-2">
                  אימות סיסמה
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/80 border border-[#D5C4B7]/50 rounded-xl text-[#2D3142] placeholder-[#5D5D5D]/60 focus:outline-none focus:ring-2 focus:ring-[#B8A99C] focus:border-[#B8A99C] transition-all"
                  placeholder="הכנס את הסיסמה שוב"
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-[#B8A99C] to-[#D5C4B7] text-white py-3 px-6 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "נרשם..." : "הצטרף עכשיו"}
              </motion.button>
            </form>

            {/* Benefits */}
            <div className="mt-8 pt-6 border-t border-[#D5C4B7]/30">
              <h3 className="text-lg font-semibold text-[#2D3142] mb-4 text-center">
                מה תקבל?
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-[#5D5D5D]">
                  <FaStar className="text-[#B8A99C] mr-3 flex-shrink-0" />
                  <span>רכישת סדרות בודדות לפי הצורך</span>
                </div>
                <div className="flex items-center text-[#5D5D5D]">
                  <FaStar className="text-[#B8A99C] mr-3 flex-shrink-0" />
                  <span>גישה מיידית לתכנים שרכשת</span>
                </div>
                <div className="flex items-center text-[#5D5D5D]">
                  <FaStar className="text-[#B8A99C] mr-3 flex-shrink-0" />
                  <span>אפשרות לשדרג למנוי מלא בעתיד</span>
                </div>
              </div>
            </div>

            {/* Google Sign In */}
            <div className="mt-8 border-t border-[#D5C4B7]/30 pt-6">
              <motion.button
                onClick={() => {
                  const redirectUrl = returnUrl === '/' ? '/series' : returnUrl;
                  signIn("google", { callbackUrl: redirectUrl });
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex w-full justify-center items-center py-3 px-5 border border-[#D5C4B7]/50 rounded-xl text-[#2D3142] bg-white/80 hover:bg-[#D5C4B7]/10 hover:border-[#B8A99C] transition-all duration-300 gap-3"
              >
                <img
                  className="w-6 h-6"
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  loading="lazy"
                  alt="google logo"
                />
                <span className="font-medium">המשך עם Google</span>
              </motion.button>
            </div>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-[#5D5D5D]">
                כבר יש לך חשבון?{" "}
                <Link href={`/login?returnUrl=${encodeURIComponent(returnUrl === '/' ? '/series' : returnUrl)}`} className="text-[#B8A99C] hover:text-[#2D3142] transition-colors font-medium">
                  התחבר כאן
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SeriesRegisterPage;
