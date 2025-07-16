"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

const Register = () => {
  const session = useSession();
  const router = useRouter();
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    subscribeToNewsletter: false,
  });

  useEffect(() => {
    if (session?.status === "authenticated") {
      router.push("/login");
    }
  }, [session]);

  const registerUser = async (e: any) => {
    e.preventDefault();

    if (data.password.length < 6) {
      toast.error("הסיסמה חייבת להיות באורך של 6 תווים לפחות.");
      return;
    }

    try {
      const res = await axios.post("/api/register", data);

      if (res.status === 200) {
        toast.success("המשתמש נרשם בהצלחה");

        // ✅ Subscribe to newsletter if requested
        if (data.subscribeToNewsletter) {
          try {
            await axios.post("/api/subscribe-user", {
              email: data.email,
              name: data.name, // optional, if your API handles it
            });
            console.log("✅ Subscribed to newsletter");
          } catch (err) {
            console.error("❌ Newsletter subscription failed:", err);
          }
        }

        router.push("/login");
      } else {
        toast.error("משהו השתבש, אנא נסה שוב");
      }
    } catch (error) {
      console.error("Error registering user:", error);
      toast.error("משהו השתבש, אנא נסה שוב");
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-24 lg:px-8 pb-96 bg-[#F7F3EB]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#F0E9DF] rounded-2xl shadow-md border border-[#D5C4B7] p-8 mb-8">
          <h2 className="mt-4 text-center text-3xl font-bold leading-9 tracking-tight text-[#2D3142]">
            הרשמו לחשבון שלכם
          </h2>
          <div className="w-16 h-1 bg-[#B8A99C] mx-auto mt-4 rounded-full"></div>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#F0E9DF] rounded-2xl shadow-md border border-[#D5C4B7] p-8">
          <form className="space-y-6" onSubmit={registerUser}>
            <div>
              <label htmlFor="name" className="block text-base font-medium leading-6 text-[#2D3142]">
                שם
              </label>
              <div className="mt-2">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  className="block w-full rounded-lg border-0 py-3 px-4 text-[#2D3142] bg-white/90 shadow-sm ring-1 ring-inset ring-[#D5C4B7] placeholder:text-[#B8A99C] focus:ring-2 focus:ring-inset focus:ring-[#B8A99C] focus:outline-none sm:text-sm sm:leading-6 transition-all duration-200"
                  placeholder="הכנס את השם שלך"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-base font-medium leading-6 text-[#2D3142]">
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
                <label htmlFor="password" className="block text-base font-medium leading-6 text-[#2D3142]">
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
                />
              </div>
              <div className="text-xs text-[#2D3142]/70 mt-1 text-right">
                הסיסמה חייבת להיות לפחות 6 תווים
              </div>
            </div>

            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="subscribeToNewsletter"
                name="subscribeToNewsletter"
                checked={data.subscribeToNewsletter}
                onChange={(e) =>
                  setData({ ...data, subscribeToNewsletter: e.target.checked })
                }
                className="w-4 h-4 text-[#D5C4B7] bg-white border-[#B8A99C] rounded focus:ring-[#D5C4B7] ml-2"
              />
              <label htmlFor="subscribeToNewsletter" className="text-sm font-medium text-[#2D3142]">
                להירשם לניוזלטר
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex w-full justify-center rounded-lg bg-[#D5C4B7] px-5 py-3 text-base font-medium text-[#2D3142] shadow-md hover:bg-[#B8A99C] transition-all duration-300 hover:shadow-lg focus:outline-none"
              >
                הירשם
              </button>
            </div>
          </form>

          <div className="mt-8 border-t border-[#D5C4B7] pt-6">
            <p className="mb-6 text-center text-sm text-[#2D3142]">
              כבר יש לך חשבון?
              <a href="/login" className="text-[#D9713C] hover:text-[#B8A99C] transition-colors duration-200 hover:underline focus:outline-none mr-1">
                התחבר כאן
              </a>
            </p>

            <button
              onClick={() => signIn("google")}
              className="flex w-full justify-center items-center py-3 px-5 border mt-2 gap-3 border-[#D5C4B7] rounded-lg text-[#2D3142] bg-white/80 hover:bg-white hover:border-[#B8A99C] hover:shadow-md transition-all duration-300"
            >
              <img
                className="w-6 h-6"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                loading="lazy"
                alt="google logo"
              />
              <span className="font-medium">המשך עם Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
