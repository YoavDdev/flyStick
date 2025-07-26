"use client";
import React from "react";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/dist/client/link";
import type { Metadata } from "next";

// Prevent this page from appearing in search results
export const metadata: Metadata = {
  title: "התחברות - סטודיו בועז אונליין",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

const Page = () => {
  const session = useSession();
  const router = useRouter();
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.status === "authenticated") {
      router.push("/dashboard");
    }
  }, [session]);

  const loginUser = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);
    const callback = await signIn("credentials", { ...data, redirect: false });

    if (callback?.error) {
      toast.error("❌ אירעה שגיאה בהתחברות - אנא נסה שוב");
    }

    if (callback?.ok && !callback?.error) {
      toast.success("🎉 התחברת בהצלחה! ברוך הבא");
    }

    setLoading(false);
  };

  const onRegisterUser = async () => {
    const res = await signIn("google");
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-24 lg:px-8 pb-96 bg-[#F7F3EB]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#F0E9DF] rounded-2xl shadow-md border border-[#D5C4B7] p-8 mb-8">
          <h2 className="mt-4 text-center text-3xl font-bold leading-9 tracking-tight text-[#2D3142]">
            היכנס לחשבון שלך
          </h2>
          <div className="w-16 h-1 bg-[#B8A99C] mx-auto mt-4 rounded-full"></div>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#F0E9DF] rounded-2xl shadow-md border border-[#D5C4B7] p-8">
          <form className="space-y-6" onSubmit={loginUser}>
            <div>
              <label
                htmlFor="email"
                className="block text-base font-medium leading-6 text-[#2D3142]"
              >
                כתובת אימייל
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  className="block w-full rounded-lg border-0 py-3 px-4 text-[#2D3142] bg-white/90 shadow-sm ring-1 ring-inset ring-[#D5C4B7] placeholder:text-[#B8A99C] focus:ring-2 focus:ring-inset focus:ring-[#B8A99C] focus:outline-none sm:text-sm sm:leading-6 transition-all duration-200"
                  placeholder="הכנס את האימייל שלך"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-base font-medium leading-6 text-[#2D3142]"
                >
                  סיסמה
                </label>
              </div>

              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={data.password}
                  onChange={(e) => setData({ ...data, password: e.target.value })}
                  className="block w-full rounded-lg border-0 py-3 px-4 text-[#2D3142] bg-white/90 shadow-sm ring-1 ring-inset ring-[#D5C4B7] placeholder:text-[#B8A99C] focus:ring-2 focus:ring-inset focus:ring-[#B8A99C] focus:outline-none sm:text-sm sm:leading-6 transition-all duration-200"
                  placeholder="הכנס את הסיסמה שלך"
                  onError={() => toast.error("🔐 אימייל או סיסמה שגויים - אנא בדוק ונסה שוב")}
                />
              </div>
              <div className="mt-3 text-right">
                <Link
                  href="/forgotPassword"
                  className="text-sm text-[#D9713C] hover:text-[#B8A99C] transition-colors duration-200 hover:underline focus:outline-none"
                >
                  <p>שכחת את הסיסמה שלך?</p>
                </Link>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-lg bg-[#D5C4B7] px-5 py-3 text-base font-medium text-[#2D3142] shadow-md hover:bg-[#B8A99C] transition-all duration-300 hover:shadow-lg focus:outline-none"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-[#2D3142] border-t-[#F7F3EB] rounded-full animate-spin"></div>
                ) : (
                  "היכנס"
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-8 border-t border-[#D5C4B7] pt-6">
            <p className="mb-6 text-center text-sm text-[#2D3142]">
              עדיין לא חבר?
              <Link
                href="/register"
                className="text-[#D9713C] hover:text-[#B8A99C] transition-colors duration-200 hover:underline focus:outline-none mr-1"
              >
                הרשמה כאן
              </Link>
            </p>

            <button
              onClick={() => signIn("google")}
              disabled={loading}
              className="flex w-full justify-center items-center py-3 px-5 border mt-2 gap-3 border-[#D5C4B7] rounded-lg text-[#2D3142] bg-white/80 hover:bg-white hover:border-[#B8A99C] hover:shadow-md transition-all duration-300"
            >
              <img
                className="w-6 h-6"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                loading="lazy"
                alt="google logo"
              />
              <span className="font-medium">התחבר עם Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
