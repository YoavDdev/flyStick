// pages/reset-password.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";

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
    <div className="pt-48">
      {/* Your Reset Password form */}
      <div>
        <label htmlFor="password">New Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button onClick={resetPassword}>Reset Password</button>
    </div>
  );
};

export default ResetPasswordPage;
