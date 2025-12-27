"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import AdminProductManager from "../../../components/AdminProductManager";
import Link from "next/link";

export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (status === "loading") return;

      if (!session?.user?.email) {
        router.push("/login");
        return;
      }

      try {
        const response = await axios.post("/api/get-user-subsciptionId", {
          userEmail: session.user.email,
        });

        if (response.data.subscriptionId !== "Admin") {
          router.push("/dashboard");
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error("Error checking admin:", error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [session, status, router]);

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-[#F7F3EB] flex items-center justify-center">
        <p className="text-[#2D3142]/60">טוען...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#F7F3EB]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/dashboard"
              className="text-[#2D3142]/60 hover:text-[#2D3142] transition-colors"
            >
              ← חזרה לדשבורד
            </Link>
            <span className="text-[#2D3142]/30">|</span>
            <Link
              href="/admin/orders"
              className="text-[#2D3142]/60 hover:text-[#2D3142] transition-colors"
            >
              ניהול הזמנות
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-[#2D3142]">ניהול מוצרים</h1>
          <p className="text-[#2D3142]/60 mt-2">הוספה, עריכה וניהול מוצרי החנות</p>
        </div>

        {/* Product Manager Component */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <AdminProductManager />
        </div>
      </div>
    </div>
  );
}
