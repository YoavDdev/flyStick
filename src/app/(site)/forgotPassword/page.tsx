// ForgotPasswordPage.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const initiatePasswordReset = async () => {
    try {
      // Perform validation on the email if needed
      if (!email) {
        toast.error("Please provide a valid email address.");
        return;
      }

      // Call your API endpoint to initiate password reset
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success(
          "Password reset initiated. Check your email for instructions.",
          {
            duration: 5000, // Set the duration in milliseconds
          },
        );
        router.push("/login"); // Redirect to login page or any desired page
      } else {
        toast.error("Password reset initiation failed. Please try again.");
      }
    } catch (error) {
      console.error("Error initiating password reset:", error);
      toast.error("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-24 lg:px-8 pb-96 bg-[#F7F3EB]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#F0E9DF] rounded-2xl shadow-md border border-[#D5C4B7] p-8 mb-8">
          <h2 className="mt-4 text-center text-3xl font-bold leading-9 tracking-tight text-[#2D3142]">
            שכחת את הסיסמה שלך?
          </h2>
          <div className="w-16 h-1 bg-[#B8A99C] mx-auto mt-4 rounded-full"></div>
          <p className="mt-4 text-center text-sm text-[#2D3142]/80">
            לא לדאוג, נשלח לך אימייל עם הוראות לאיפוס הסיסמה
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#F0E9DF] rounded-2xl shadow-md border border-[#D5C4B7] p-8">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-base font-medium leading-6 text-[#2D3142]"
              >
                כתובת אימייל
              </label>
              <div className="mt-2">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border-0 py-3 px-4 text-[#2D3142] bg-white/90 shadow-sm ring-1 ring-inset ring-[#D5C4B7] placeholder:text-[#B8A99C] focus:ring-2 focus:ring-inset focus:ring-[#B8A99C] focus:outline-none sm:text-sm sm:leading-6 transition-all duration-200"
                  placeholder="הכנס את האימייל שלך"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={initiatePasswordReset}
                className="flex w-full justify-center rounded-lg bg-[#D5C4B7] px-5 py-3 text-base font-medium text-[#2D3142] shadow-md hover:bg-[#B8A99C] transition-all duration-300 hover:shadow-lg focus:outline-none"
              >
                התחל איפוס סיסמה
              </button>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-[#EF8354] hover:text-[#D64933] transition-colors duration-200 hover:underline focus:outline-none"
              >
                חזור לדף הכניסה
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
