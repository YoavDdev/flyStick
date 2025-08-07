"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminUserTable from "@/app/components/AdminUserTable";
import AdminDashboardSummary from "../../components/AdminDashboardSummary";
import AdminUserActivityMetrics from "../../components/AdminUserActivityMetrics";
import AdminMessageComposer from "@/app/components/AdminMessageComposer";
import AdminNewsletterComposer from "@/app/components/AdminNewsletterComposer";
import AdminFolderMetadataManager from "@/app/components/AdminFolderMetadataManager";
import CategoryManager from "@/app/components/CategoryManager";
import AdminMonthlySummaryTrigger from "@/app/components/AdminMonthlySummaryTrigger";
import PayPalSyncProgress from "@/app/components/PayPalSyncProgress";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

// Import User type from shared types file
import { User } from "../../types/User";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof User>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'trial' | 'grace' | 'free' | 'admin' | 'cancelled'>('all');

  useEffect(() => {
    // Check if user is logged in
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Check if user is admin
    const checkAdmin = async () => {
      try {
        if (!session?.user?.email) return;

        const response = await fetch("/api/check-admin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: session.user.email }),
        });

        const data = await response.json();
        
        // Only allow access if user is admin AND not free/trial user
        if (data.isAdmin && !data.isFreeOrTrial) {
          setIsAdmin(true);
          fetchUsers();
        } else {
          toast.error("אין לך הרשאות גישה לאזור זה");
          router.push("/");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast.error("אירעה שגיאה בבדיקת הרשאות");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      checkAdmin();
    }
  }, [session, status, router]);

  const fetchUsers = async (retryCount = 0) => {
    try {
      if (!session?.user?.email) return;
      
      setLoading(true);
      const response = await fetch("/api/admin/get-all-users", {
        headers: {
          "Authorization": `Bearer ${session.user.email}`
        },
        // Add cache control to prevent stale data
        cache: 'no-store'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "שגיאה בטעינת משתמשים");
      }
      
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        throw new Error("תבנית נתונים לא תקינה");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      
      // Retry logic - try up to 2 times with increasing delay
      if (retryCount < 2) {
        console.log(`Retrying fetch users (attempt ${retryCount + 1})...`);
        setTimeout(() => fetchUsers(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }
      
      toast.error("אירעה שגיאה בטעינת המשתמשים");
    } finally {
      setLoading(false);
    }
  };

  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      if (!session?.user?.email) return;
      
      console.log("ADMIN PAGE DEBUG - Updates received:", updates);
      console.log("ADMIN PAGE DEBUG - trialStartDate:", updates.trialStartDate);
      
      setIsUpdating(true);
      const requestBody = {
        userId,
        ...updates,
        // Rename email field to avoid conflict in API
        ...(updates.email && { userEmail: updates.email }),
      };
      
      console.log("ADMIN PAGE DEBUG - Full request payload:", JSON.stringify(requestBody));
      
      const response = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.email}`
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "שגיאה בעדכון משתמש");
      }
      
      const updatedUser = await response.json();
      
      toast.success("המשתמש עודכן בהצלחה");
      await fetchUsers(); // Refresh user list with await to ensure it completes
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("אירעה שגיאה בעדכון המשתמש");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      if (!session?.user?.email) return;
      
      console.log("🗑️ ADMIN PAGE DEBUG - Deleting user:", userId);
      
      setIsUpdating(true);
      const response = await fetch("/api/admin/delete-user", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.email}`
        },
        body: JSON.stringify({
          userId,
          confirmationText: "DELETE" // Required by API for safety
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "שגיאה במחיקת המשתמש");
      }

      const data = await response.json();
      console.log("✅ ADMIN PAGE DEBUG - Delete response:", data);
      
      // Refresh user list to show updated data
      fetchUsers();
      
    } catch (error) {
      console.error("❌ Error deleting user:", error);
      throw error; // Re-throw to let AdminUserTable handle the error display
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter users based on search term and active filter
  const filteredUsers = users.filter(user => {
    // First apply search term filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      (user.name?.toLowerCase().includes(searchLower) || false) ||
      (user.email?.toLowerCase().includes(searchLower) || false) ||
      (user.subscriptionId?.toLowerCase().includes(searchLower) || false)
    );
    
    if (!matchesSearch) return false;
    
    // Then apply category filter
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') {
      // Only users with PayPal status ACTIVE
      return user.subscriptionId?.startsWith('I-') && user.paypalStatus === 'ACTIVE';
    }
    if (activeFilter === 'cancelled') {
      // Only users with PayPal status CANCELLED
      return user.subscriptionId?.startsWith('I-') && user.paypalStatus === 'CANCELLED';
    }
    if (activeFilter === 'trial') return user.subscriptionId === 'trial_30';
    if (activeFilter === 'free') return user.subscriptionId === 'free';
    if (activeFilter === 'admin') return user.subscriptionId === 'Admin';
    if (activeFilter === 'grace') {
      return user.cancellationDate && (() => {
        // Check if user was subscribed for at least 4 days before cancellation
        let qualifiesForGracePeriod = false;
        
        if ((user as any).subscriptionStartDate) {
          // Calculate days between subscription start and cancellation
          const subscriptionDuration = Math.floor(
            (new Date(user.cancellationDate).getTime() - new Date((user as any).subscriptionStartDate).getTime()) / (1000 * 60 * 60 * 24)
          );
          qualifiesForGracePeriod = subscriptionDuration >= 4;
        } else {
          // If no subscriptionStartDate, fall back to createdAt (for existing users)
          const subscriptionDuration = Math.floor(
            (new Date(user.cancellationDate).getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
          );
          qualifiesForGracePeriod = subscriptionDuration >= 4;
        }
        
        // Only include if user qualifies AND is still within the grace period
        if (!qualifiesForGracePeriod) return false;
        
        const gracePeriodEnd = new Date(user.cancellationDate);
        gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 30); // 30-day grace period
        return new Date() < gracePeriodEnd;
      })();
    }
    return true;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const fieldA = a[sortField];
    const fieldB = b[sortField];
    
    if (!fieldA && !fieldB) return 0;
    if (!fieldA) return sortDirection === "asc" ? -1 : 1;
    if (!fieldB) return sortDirection === "asc" ? 1 : -1;
    
    if (typeof fieldA === "string" && typeof fieldB === "string") {
      return sortDirection === "asc" 
        ? fieldA.localeCompare(fieldB) 
        : fieldB.localeCompare(fieldA);
    }
    
    return 0;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#F7F3EB]">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-[#B56B4A]" role="status">
            <span className="visually-hidden">טוען...</span>
          </div>
          <p className="mt-4 text-[#5D5D5D]">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-[#F7F3EB] pt-16 sm:pt-20 pb-6 sm:pb-10 px-3 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="bg-white rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-[#2D3142] mb-4 sm:mb-6 text-center">פאנל ניהול</h1>
          
          {/* Dashboard Summary */}
          <AdminDashboardSummary 
            users={users} 
            onFilterChange={(filter) => {
              setActiveFilter(filter);
              // Reset search when changing filters
              setSearchTerm('');
            }}
            activeFilter={activeFilter}
          />
          
          {/* User Activity Metrics */}
          <AdminUserActivityMetrics users={users} />
          
          {/* Message Composer */}
          <AdminMessageComposer />
          
          {/* Newsletter Composer */}
          <AdminNewsletterComposer />
          
          {/* PayPal Sync Progress */}
          <PayPalSyncProgress />

          <div className="mb-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={async () => {
                try {
                  console.log('🚀 [ADMIN] Starting PayPal sync button click');
                  
                  if (!session?.user?.email) {
                    console.error('❌ [ADMIN] No session email available');
                    toast.error('❌ שגיאה: לא נמצא מייל משתמש');
                    return;
                  }
                  
                  console.log('✅ [ADMIN] Session email found:', session.user.email);

                  // Show loading toast
                  const toastId = toast.loading('🚀 מתחיל סנכרון PayPal ברקע...');
                  
                  console.log('📡 [ADMIN] Sending POST request to /api/admin/paypal-sync-job');
                  
                  // Start background sync job
                  const response = await fetch(`/api/admin/paypal-sync-job`, {
                    method: 'POST',
                    headers: {
                      "Authorization": `Bearer ${session.user.email}`,
                      "Content-Type": "application/json"
                    },
                    cache: 'no-store'
                  });
                  
                  console.log('📡 [ADMIN] Response received:', {
                    status: response.status,
                    statusText: response.statusText,
                    ok: response.ok
                  });
                  
                  if (!response.ok) {
                    const errorData = await response.json().catch((parseError) => {
                      console.error('❌ [ADMIN] Failed to parse error response:', parseError);
                      return { error: `HTTP ${response.status}: ${response.statusText}` };
                    });
                    
                    console.error('❌ [ADMIN] PayPal sync failed:', errorData);
                    throw new Error(errorData.error || "שגיאה בהתחלת סנכרון PayPal");
                  }
                  
                  const data = await response.json();
                  
                  // Show that sync started
                  if (data.status === "started") {
                    toast.success(
                      `✨ סנכרון PayPal התחיל ברקע!\nהסנכרון רץ כעת ברקע.\nהנתונים יעודכנו בקרוב.`,
                      { id: toastId, duration: 6000 }
                    );
                    
                    // Auto-refresh the page after a delay to show updated data
                    setTimeout(() => {
                      fetchUsers();
                      toast.success('🔄 נתונים עודכנו מהסנכרון', { duration: 3000 });
                    }, 10000); // Wait 10 seconds for sync to complete
                  } else {
                    // Fallback for immediate results (if any)
                    const successCount = data.successfulSyncs || 0;
                    const errorCount = data.errorSyncs || 0;
                    
                    toast.success(
                      `✨ סנכרון PayPal הושלם!\nעודכנו: ${successCount} משתמשים\nשגיאות: ${errorCount}`,
                      { id: toastId, duration: 5000 }
                    );
                  }
                  
                  // Refresh user list to show updated PayPal data
                  fetchUsers();
                } catch (error: unknown) {
                  console.error('❌ [ADMIN] PayPal sync error details:', {
                    error: error instanceof Error ? error.message : error,
                    stack: error instanceof Error ? error.stack : undefined,
                    timestamp: new Date().toISOString(),
                    userEmail: session?.user?.email
                  });
                  
                  toast.dismiss();
                  const errorMessage = error instanceof Error ? error.message : 'שגיאה לא ידועה';
                  
                  // Show detailed error for debugging
                  toast.error(
                    `❌ שגיאה בסנכרון PayPal: ${errorMessage}\n\nבדוק את הקונסול לפרטים נוספים`,
                    { duration: 8000 }
                  );
                }
              }}
              className="bg-[#D4AF37] hover:bg-[#B8941F] text-white py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 text-sm sm:text-base"
            >
              סנכרן PayPal
            </button>
            
            <button
              onClick={async () => {
                try {
                  console.log('🔍 [ADMIN] Running PayPal diagnostic...');
                  
                  if (!session?.user?.email) {
                    toast.error('❌ שגיאה: לא נמצא מייל משתמש');
                    return;
                  }
                  
                  const toastId = toast.loading('🔍 בודק הגדרות PayPal...');
                  
                  const response = await fetch('/api/admin/paypal-debug', {
                    method: 'GET',
                    headers: {
                      "Authorization": `Bearer ${session.user.email}`
                    },
                    cache: 'no-store'
                  });
                  
                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || 'שגיאה בבדיקת האבחון');
                  }
                  
                  const diagnosticData = await response.json();
                  
                  console.log('🔍 [ADMIN] Diagnostic results:', diagnosticData);
                  
                  toast.success(
                    `🔍 אבחון הושלם!\n` +
                    `PayPal Credentials: ${diagnosticData.environment.hasPayPalClientId && diagnosticData.environment.hasPayPalClientSecret ? '✅' : '❌'}\n` +
                    `Database: ${diagnosticData.database.connectionOk ? '✅' : '❌'}\n` +
                    `PayPal Users: ${diagnosticData.database.paypalUserCount}\n` +
                    `בדוק את הקונסול לפרטים מלאים`,
                    { id: toastId, duration: 10000 }
                  );
                  
                } catch (error) {
                  console.error('❌ [ADMIN] Diagnostic error:', error);
                  toast.dismiss();
                  const errorMessage = error instanceof Error ? error.message : 'שגיאה לא ידועה';
                  toast.error(
                    `❌ שגיאה באבחון: ${errorMessage}`,
                    { duration: 5000 }
                  );
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30 text-sm sm:text-base"
            >
              🔍 אבחון PayPal
            </button>
            
            <button
              onClick={async () => {
                try {
                  if (!session?.user?.email) return;
                  
                  toast.loading('⏰ בודק תוקף מנויי הניסיון...');
                  const response = await fetch("/api/check-trial-expiry", {
                    headers: {
                      "Authorization": `Bearer ${session.user.email}`
                    },
                    cache: 'no-store'
                  });
                  
                  if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "שגיאה בבדיקת מנויי הניסיון");
                  }
                  
                  const data = await response.json();
                  toast.dismiss();
                  toast.success(data.message || "✅ בדיקת מנויי הניסיון הושלמה בהצלחה");
                  
                  // Refresh user list
                  fetchUsers();
                } catch (error) {
                  console.error("Error checking trial expiry:", error);
                  toast.dismiss();
                  toast.error("❌ אירעה שגיאה בבדיקת מנויי הניסיון");
                }
              }}
              className="bg-[#B56B4A] hover:bg-[#A25A39] text-white py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#B56B4A]/30 text-sm sm:text-base"
            >
              בדוק מנויי ניסיון פגי תוקף
            </button>
            
            <button
              onClick={() => fetchUsers()}
              className="bg-[#8E9A7C] hover:bg-[#7D8A6C] text-white py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#8E9A7C]/30 text-sm sm:text-base"
            >
              רענן נתונים
            </button>
            
            {/* Email Testing Buttons - DEBUG: These should be visible */}
            <button
              onClick={async () => {
                console.log('Monthly Summary Button Clicked!');
                try {
                  toast.loading('📧 שולח דוח מנויים חודשי...');
                  const response = await fetch('/api/admin/monthly-summary', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  });
                  
                  if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'שגיאה בשליחת הדוח');
                  }
                  
                  const data = await response.json();
                  toast.dismiss();
                  toast.success('📊 דוח מנויים חודשי נשלח בהצלחה!');
                  console.log('Monthly Summary Data:', data.data);
                } catch (error) {
                  console.error('Error sending monthly summary:', error);
                  toast.dismiss();
                  toast.error('❌ שגיאה בשליחת הדוח החודשי');
                }
              }}
              className="bg-[#D9713C] hover:bg-[#C5631F] text-white py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#D9713C]/30 text-sm sm:text-base"
              style={{ minWidth: '150px' }}
            >
              📊 שלח דוח חודשי
            </button>

          </div>
          
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder={`חיפוש משתמשים${activeFilter !== 'all' ? ' (בקטגוריה הנבחרת)' : ''}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 sm:p-3 border border-[#D0C8B0] rounded-md text-right pr-10 focus:outline-none focus:ring-2 focus:ring-[#B56B4A]/30 text-sm sm:text-base"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 sm:top-3.5 text-[#8E9A7C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <AdminUserTable 
              users={sortedUsers} 
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              sortField={sortField}
              sortDirection={sortDirection}
              isUpdating={isUpdating}
              onSort={(field: string) => {
                if (field === sortField) {
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                } else {
                  setSortField(field as keyof User);
                  setSortDirection("desc");
                }
              }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
