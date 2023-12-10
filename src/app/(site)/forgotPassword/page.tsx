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
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 pb-96">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-20 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Forgot Your Password?
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Email address
            </label>
            <div className="mt-2">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <button
              onClick={initiatePasswordReset}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Initiate Password Reset
            </button>
          </div>

          <Link
            href="/login"
            className="text-sm text-indigo-600 hover:underline focus:outline-none focus:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
