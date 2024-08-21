"use client";
import React from "react";
import { useState, useEffect } from "react";
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
      // router.push("https://www.paypal.com/il/business");
      router.push("/login ");
    }
  });

  const registerUser = async (e: any) => {
    e.preventDefault();

    if (data.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    try {
      const res = await axios.post("/api/register", data);
      if (res.status === 200) {
        toast.success("User is registered");

        // Check if the user has opted to subscribe to the newsletter
        if (data.subscribeToNewsletter) {
          // You can call the API to subscribe the user to the newsletter here
          // For now, let's just log a message
          console.log("User opted to subscribe to the newsletter");
        }

        router.push("/login");
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      console.error("Error registering user:", error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 pb-96">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-20 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
        הרשמו לחשבון שלכם
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={registerUser}>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
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
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
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
          </div>
          <div>
            <div>
              <input
                type="checkbox"
                id="subscribeToNewsletter"
                name="subscribeToNewsletter"
                checked={data.subscribeToNewsletter}
                onChange={(e) =>
                  setData({ ...data, subscribeToNewsletter: e.target.checked })
                }
                className="mr-2"
              />
              <label
                htmlFor="subscribeToNewsletter"
                className="text-sm font-medium leading-6 text-gray-900"
              >
                להירשם לניוזלטר
              </label>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              הירשם
            </button>
          </div>
        </form>
        <div className="p-6"></div>
        <button
          onClick={() => signIn("google")}
          className="flex w-full justify-center vpx-4 py-1.5 px-3 border gap-2 border-slate-300 rounded-lg text-slate-700 hover:border-slate-400 hover:text-slate-900 hover:shadow transition duration-150"
        >
          <img
            className="w-6 h-6"
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            loading="lazy"
            alt="google logo"
          />
          המשך עם Google
        </button>
      </div>
    </div>
  );
};

export default Register;
