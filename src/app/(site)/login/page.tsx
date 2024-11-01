"use client";
import React from "react";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/dist/client/link";

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
      toast.error(callback.error);
    }

    if (callback?.ok && !callback?.error) {
      toast.success("Logged in successfully!");
    }

    setLoading(false);
  };

  const onRegisterUser = async () => {
    const res = await signIn("google");
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 pb-96">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-20 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
        היכנס לחשבון שלך
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={loginUser}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-gray-900"
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
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900"
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
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
            <Link
              href="/forgotPassword"
              className="text-sm text-indigo-600 hover:underline focus:outline-none focus:underline"
            >
              <p>שכחת את הסיסמה שלך?</p>
            </Link>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              היכנס
            </button>
          </div>
        </form>
        <div className="">
          <p className="mb-10 text-center text-sm text-gray-500">
          עדיין לא חבר?
            <Link
              href="/register"
              className="text-sm text-indigo-600 hover:underline focus:outline-none focus:underline"
            >
              &nbsp;הרשמה כאן
            </Link>
          </p>

          <button
            onClick={() => signIn("google")}
            className="flex w-full justify-center vpx-4 py-1.5 px-3 border mt-2 gap-2 border-slate-300 rounded-lg text-slate-700 hover:border-slate-400 hover:text-slate-900 hover:shadow transition duration-150"
          >
            <img
              className="w-6 h-6"
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              loading="lazy"
              alt="google logo"
            />
            Continue with Google
          </button>
          {/* <button
            onClick={() => signIn("facebook")}
            className="flex w-full justify-center vpx-4 py-1.5 px-3 border mt-2 gap-2 border-slate-200 rounded-lg text-slate-700 hover:border-slate-400 hover:text-slate-900 hover:shadow transition duration-150"
          >
            <img
              className="w-6 h-6"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Facebook_icon.svg/1200px-Facebook_icon.svg.png"
              loading="lazy"
              alt="google logo"
            />
            Continue with Facebook
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default Page;
