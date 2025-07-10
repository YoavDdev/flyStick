// pages/reset-password.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";

const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");

  const resetPassword = async () => {
    try {
      // Validate the password (add any necessary validation logic)
      if (!password) {
        toast.error("Please enter a new password.");
        return;
      }

      // Extract the token from the query parameters

      const token = searchParams.get("token");
      const userId = searchParams.get("userId");

      // Call your API endpoint to complete the password reset
      const response = await fetch("/api/activate-reset-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password, userId }),
      });

      if (response.ok) {
        toast.success(
          "Password reset successful. You can now log in with your new password.",
        );
        router.push("/login"); // Redirect to the login page or any desired page
      } else {
        toast.error("Password reset failed. Please try again.");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-24 lg:px-8 pb-96 bg-[#F7F3EB]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#F0E9DF] rounded-2xl shadow-md border border-[#D5C4B7] p-8 mb-8">
          <h2 className="mt-4 text-center text-3xl font-bold leading-9 tracking-tight text-[#2D3142]">
            אפס את הסיסמה שלך
          </h2>
          <div className="w-16 h-1 bg-[#B8A99C] mx-auto mt-4 rounded-full"></div>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#F0E9DF] rounded-2xl shadow-md border border-[#D5C4B7] p-8">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-base font-medium leading-6 text-[#2D3142]"
              >
                סיסמה חדשה
              </label>
              <div className="mt-2">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border-0 py-3 px-4 text-[#2D3142] bg-white/90 shadow-sm ring-1 ring-inset ring-[#D5C4B7] placeholder:text-[#B8A99C] focus:ring-2 focus:ring-inset focus:ring-[#B8A99C] focus:outline-none sm:text-sm sm:leading-6 transition-all duration-200"
                  placeholder="הכנס סיסמה חדשה"
                />
              </div>
              <div className="text-xs text-[#2D3142]/70 mt-1 text-right">
                הסיסמה חייבת להיות לפחות 6 תווים
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={resetPassword}
                className="flex w-full justify-center rounded-lg bg-[#D5C4B7] px-5 py-3 text-base font-medium text-[#2D3142] shadow-md hover:bg-[#B8A99C] transition-all duration-300 hover:shadow-lg focus:outline-none"
              >
                אפס סיסמה
              </button>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-[#EF8354] hover:text-[#D64933] transition-colors duration-200 hover:underline focus:outline-none"
              >
                חזור למסך הכניסה
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
