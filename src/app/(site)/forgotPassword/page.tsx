// ForgotPasswordPage.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

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
    <div className="pt-48">
      {/* Your Forgot Password form */}
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <button onClick={initiatePasswordReset}>Initiate Password Reset</button>
    </div>
  );
};

export default ForgotPasswordPage;
