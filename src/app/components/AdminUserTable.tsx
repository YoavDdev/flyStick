"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { format, differenceInDays, addDays, isBefore } from "date-fns";
import { he } from "date-fns/locale";
import toast from "react-hot-toast";

// SortableHeader component for table column headers
type SortableHeaderProps = {
  field: string;
  currentSort: string;
  direction: "asc" | "desc";
  onSort: (field: string) => void;
  children: React.ReactNode;
};

const SortableHeader: React.FC<SortableHeaderProps> = ({ 
  field, 
  currentSort, 
  direction, 
  onSort, 
  children 
}) => {
  const isSorted = currentSort === field;
  
  return (
    <th 
      className="px-2 sm:px-3 py-2 sm:py-3.5 text-right text-xs sm:text-sm font-semibold text-[#5D5D5D] cursor-pointer hover:text-[#B56B4A]"
      onClick={() => onSort(field)}
    >
      {children}
      {isSorted && (
        <span className="ml-1">
          {direction === "asc" ? "↑" : "↓"}
        </span>
      )}
    </th>
  );
};

// Import User type from shared types file
import { User } from "../types/User";

// AdminUserTable props definition
type AdminUserTableProps = {
  users: User[];
  onUpdateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  sortField: keyof User;
  sortDirection: "asc" | "desc";
  onSort: (field: string) => void;
  isUpdating?: boolean;
};

export default function AdminUserTable({
  users,
  onUpdateUser,
  onDeleteUser,
  sortField,
  sortDirection,
  onSort,
  isUpdating = false
}: AdminUserTableProps) {
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    step: 1 | 2;
    userEmail: string;
    confirmationText: string;
  } | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    subscriptionId: string;
    setCancellationDate: boolean;
  }>({
    name: "",
    subscriptionId: "",
    setCancellationDate: false,
  });

  // Handle edit button click
  const handleEditClick = (user: User) => {
    setEditingUser(user.id);
    setEditForm({
      name: user.name || "",
      subscriptionId: user.subscriptionId || "",
      setCancellationDate: false,
    });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  // Handle save edit
  const handleSaveEdit = async (userId: string) => {
    // Show confirmation dialog
    if (!window.confirm('האם אתה בטוח שברצונך לשמור את השינויים?')) {
      return; // User canceled
    }
    
    try {
      // Prepare updates object
      const updates: Partial<User> = {
        name: editForm.name,
        subscriptionId: editForm.subscriptionId,
      };
      
      // If setting to trial_30, add current date as trialStartDate
      if (editForm.subscriptionId === "trial_30") {
        // Set to current date in ISO format for proper DateTime handling
        const trialDate = new Date().toISOString();
        console.log("CLIENT DEBUG - Setting trialStartDate to:", trialDate);
        updates.trialStartDate = trialDate;
        toast.success("מנוי ניסיון הופעל - תאריך התחלה נקבע להיום");
      }
      
      // If setting cancellation date for grace period
      if (editForm.setCancellationDate) {
        updates.cancellationDate = new Date().toISOString();
        toast.success("נקבע תאריך ביטול מנוי. המשתמש יוכל להמשיך לצפות בתכנים למשך 30 יום נוספים.");
      }
      
      await onUpdateUser(userId, updates);
      setEditingUser(null);
      toast.success("השינויים נשמרו בהצלחה");
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("אירעה שגיאה בשמירת המשתמש");
    }
  };

  // Handle delete user - First confirmation
  const handleDeleteClick = (user: User) => {
    // Prevent deletion of admin users
    if (user.subscriptionId === "Admin") {
      toast.error("❌ לא ניתן למחוק משתמש מנהל");
      return;
    }

    setDeleteConfirmation({
      step: 1,
      userEmail: user.email || 'משתמש לא ידוע',
      confirmationText: ''
    });
    setDeletingUser(user.id);
  };

  // Handle delete confirmation - Second step
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation || !deletingUser) return;

    if (deleteConfirmation.step === 1) {
      // Move to step 2 - require typing DELETE
      setDeleteConfirmation({
        ...deleteConfirmation,
        step: 2
      });
      return;
    }

    // Step 2 - Check confirmation text
    if (deleteConfirmation.confirmationText !== 'DELETE') {
      toast.error("❌ יש להקליד בדיוק 'DELETE' כדי לאשר את המחיקה");
      return;
    }

    try {
      await onDeleteUser(deletingUser);
      toast.success(`✅ המשתמש ${deleteConfirmation.userEmail} נמחק בהצלחה`);
      handleDeleteCancel();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("❌ אירעה שגיאה במחיקת המשתמש");
    }
  };

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setDeleteConfirmation(null);
    setDeletingUser(null);
  };

  // Format date helper function
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: he });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "תאריך לא תקין";
    }
  };

  // Format short date helper function
  const formatShortDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: he });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "תאריך לא תקין";
    }
  };

  // Calculate days remaining helper function
  const calculateDaysRemaining = (startDate: string, daysToAdd: number) => {
    try {
      const start = new Date(startDate);
      const end = addDays(start, daysToAdd);
      const now = new Date();
      
      if (isBefore(end, now)) {
        return { days: 0, expired: true };
      }
      
      const daysRemaining = differenceInDays(end, now);
      return { days: daysRemaining, expired: false };
    } catch (error) {
      console.error("Error calculating days remaining:", error);
      return { days: 0, expired: true };
    }
  };

  // Calculate duration helper function
  const calculateDuration = (startDate: string) => {
    try {
      const start = new Date(startDate);
      const now = new Date();
      return differenceInDays(now, start);
    } catch (error) {
      console.error("Error calculating duration:", error);
      return 0;
    }
  };

  // Get sort icon helper function
  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    
    return (
      <span className="ml-1 inline-block">
        {sortDirection === "asc" ? (
          <span className="text-[#B56B4A]">↑</span>
        ) : (
          <span className="text-[#B56B4A]">↓</span>
        )}
      </span>
    );
  };

  // Get subscription status class helper function
  const getSubscriptionStatusClass = (status: string | null, paypalStatus?: string | null) => {
    if (!status) return "text-red-600";
    
    if (status === "trial_30") return "text-blue-600";
    if (status === "free") return "text-green-600";
    
    if (status.startsWith("I-")) {
      if (paypalStatus === "ACTIVE") return "text-green-600";
      if (paypalStatus === "CANCELLED") return "text-amber-600";
      return "text-blue-600";
    }
    
    return "text-[#5D5D5D]";
  };

  // Get subscription status text helper function
  const getSubscriptionStatusText = (user: User) => {
    if (!user.subscriptionId) {
      return "ללא מנוי";
    }

    if (user.subscriptionId === "Admin") {
      return "מנהל";
    }

    if (user.subscriptionId === "free") {
      return "גישה חופשית";
    }

    if (user.subscriptionId === "trial_30") {
      if (user.trialStartDate) {
        const daysLeft = calculateDaysRemaining(user.trialStartDate, 30);
        if (daysLeft.days > 0) {
          return `מנוי ניסיון (${daysLeft.days} ימים נותרו)`;
        } else {
          return "מנוי ניסיון פג תוקף";
        }
      }
      return "מנוי ניסיון";
    }

    // For PayPal subscriptions
    if (user.subscriptionId.startsWith("I-")) {
      // If we have PayPal status
      if (user.paypalStatus) {
        if (user.paypalStatus === "ACTIVE") {
          return "מנוי פעיל";
        } else if (user.paypalStatus === "CANCELLED" || user.paypalStatus === "EXPIRED") {
          return "מנוי בוטל";
        } else if (user.paypalStatus === "SUSPENDED") {
          return "מנוי מושהה";
        } else if (user.paypalStatus === "error") {
          // For error status, show a more user-friendly message
          return "מנוי פעיל (לא ניתן לאמת)";
        } else {
          return `מנוי (${user.paypalStatus})`;
        }
      }
      
      // If we have cancellation date
      if (user.cancellationDate) {
        return "מנוי בוטל (בתקופת גרייס)";
      }
      
      return "מנוי פעיל";
    }

    return user.subscriptionId;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-[#E5E7EB] table-fixed">
        <thead className="bg-[#F9FAFB]">
          <tr>
            <SortableHeader
              field="name"
              currentSort={sortField as string}
              direction={sortDirection}
              onSort={onSort}
            >
              שם
            </SortableHeader>
            
            <SortableHeader
              field="email"
              currentSort={sortField as string}
              direction={sortDirection}
              onSort={onSort}
            >
              אימייל
            </SortableHeader>
            
            <SortableHeader
              field="subscriptionId"
              currentSort={sortField as string}
              direction={sortDirection}
              onSort={onSort}
            >
              סטטוס מנוי
            </SortableHeader>
            
            <SortableHeader
              field="paypalId"
              currentSort={sortField as string}
              direction={sortDirection}
              onSort={onSort}
            >
              מזהה PayPal
            </SortableHeader>
            
            <SortableHeader
              field="createdAt"
              currentSort={sortField as string}
              direction={sortDirection}
              onSort={onSort}
            >
              מידע נוסף
            </SortableHeader>
            
            <th className="px-2 sm:px-3 py-2 sm:py-3.5 text-right text-xs sm:text-sm font-semibold text-[#5D5D5D]">
              פעולות
            </th>
          </tr>
        </thead>
        
        <tbody className="bg-white divide-y divide-[#E5E7EB]">
          {users.map((user) => (
            <motion.tr 
              key={user.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="hover:bg-[#F9FAFB]"
            >
              <td className="px-3 py-4 whitespace-nowrap text-sm text-[#5D5D5D]">
                {editingUser === user.id ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-2 py-1 border border-[#D1D5DB] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#B56B4A]"
                  />
                ) : (
                  user.name || "---"
                )}
              </td>
              
              <td className="px-3 py-4 whitespace-nowrap text-sm text-[#5D5D5D]">
                {user.email || "---"}
              </td>
              
              <td className="px-3 py-4 whitespace-nowrap text-sm">
                {editingUser === user.id ? (
                  <div className="space-y-2">
                    <select
                      value={editForm.subscriptionId}
                      onChange={(e) => setEditForm({ ...editForm, subscriptionId: e.target.value })}
                      className="w-full px-2 py-1 border border-[#D1D5DB] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#B56B4A]"
                    >
                      <option value="">ללא מנוי</option>
                      <option value="free">גישה חופשית</option>
                      <option value="trial_30">תקופת ניסיון (30 יום)</option>
                      {/* Show PayPal subscription option if user has PayPal data */}
                      {user.paypalId && (
                        <option value={user.paypalId}>
                          {user.subscriptionId === user.paypalId 
                            ? `מנוי PayPal נוכחי (${user.paypalId.substring(0, 15)}...)` 
                            : `שחזר מנוי PayPal (${user.paypalId.substring(0, 15)}...)`
                          }
                        </option>
                      )}
                    </select>
                    <input
                      type="text"
                      value={editForm.subscriptionId}
                      onChange={(e) => setEditForm({ ...editForm, subscriptionId: e.target.value })}
                      placeholder="או הזן subscription ID ידנית (I-...)"
                      className="w-full px-2 py-1 border border-[#D1D5DB] rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[#B56B4A] text-gray-600"
                    />
                  </div>
                ) : (
                  <div className={getSubscriptionStatusClass(user.subscriptionId, user.paypalStatus)}>
                    {getSubscriptionStatusText(user)}
                    {user.subscriptionId?.startsWith('I-') && user.paypalStatus === 'error' && (
                      <button 
                        className="ml-1 text-xs text-[#B56B4A] hover:text-[#A25A39] underline"
                        onClick={() => {
                          toast.loading('מנסה לרענן סטטוס מנוי...', { duration: 2000 });
                          setTimeout(() => {
                            window.location.reload();
                          }, 2000);
                        }}
                      >
                        נסה שוב
                      </button>
                    )}
                  </div>
                )}
              </td>
              
              <td className="px-3 py-4 whitespace-nowrap text-sm text-[#5D5D5D]">
                {user.subscriptionId?.startsWith("I-") ? (
                  <div className="text-xs">
                    <div className="font-medium">{user.subscriptionId}</div>
                    {user.paypalStatus ? (
                      <>
                        <div className="mt-1">
                          <span className="text-gray-500">סטטוס PayPal: </span>
                          {user.paypalStatus === "error" ? (
                            <span className="font-medium text-amber-600">
                              לא ניתן לאמת
                            </span>
                          ) : (
                            <span className={`font-medium ${user.paypalStatus === "ACTIVE" ? "text-green-600" : user.paypalStatus === "CANCELLED" || user.paypalStatus === "EXPIRED" ? "text-red-600" : "text-amber-600"}`}>
                              {user.paypalStatus}
                            </span>
                          )}
                        </div>
                        {user.paypalCancellationDate && (
                          <div className="mt-1">
                            <span className="text-gray-500">תאריך ביטול: </span>
                            <span className="font-medium text-red-600">
                              {formatShortDate(user.paypalCancellationDate)}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="mt-1 text-amber-600">
                        <span className="inline-block h-3 w-3 rounded-full border-2 border-amber-600 border-t-transparent animate-spin mr-1"></span>
                        <span>בודק סטטוס...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </td>
              
              <td className="px-3 py-4 whitespace-nowrap text-sm text-[#5D5D5D]">
                <div className="text-xs">
                  <div className="flex justify-between items-center">
                    <span>תאריך הרשמה:</span>
                    <span>{formatShortDate(user.createdAt)}</span>
                  </div>
                  
                  {user.subscriptionId === "trial_30" && (
                    <>
                      {/* Show trial start date if available */}
                      <div className="flex justify-between items-center mt-1">
                        <span>תקופת ניסיון:</span>
                        {user.trialStartDate ? (
                          <span>{formatShortDate(user.trialStartDate)}</span>
                        ) : (
                          <span className="text-amber-600">לא נקבע</span>
                        )}
                      </div>
                      
                      {user.trialStartDate && (() => {
                        try {
                          // Convert to Date object to check if it's valid
                          const startDate = new Date(user.trialStartDate);
                          if (isNaN(startDate.getTime())) {
                            return (
                              <div className="flex justify-between items-center">
                                <span>סטטוס:</span>
                                <span className="text-amber-600 font-medium">
                                  תאריך לא תקין
                                </span>
                              </div>
                            );
                          }
                          
                          const trialStatus = calculateDaysRemaining(user.trialStartDate, 30);
                          return (
                            <div className="flex justify-between items-center">
                              <span>ימים נותרו:</span>
                              {!trialStatus.expired ? (
                                <span className="text-blue-600 font-medium">
                                  {trialStatus.days} ימים
                                </span>
                              ) : (
                                <span className="text-red-600 font-medium">פג תוקף</span>
                              )}
                            </div>
                          );
                        } catch (error) {
                          console.error("Error calculating trial days:", error);
                          return (
                            <div className="flex justify-between items-center">
                              <span>סטטוס:</span>
                              <span className="text-amber-600 font-medium">
                                שגיאה בחישוב ימים
                              </span>
                            </div>
                          );
                        }
                      })()}
                    </>
                  )}
                  
                  {(user.paypalId || user.paypalStatus) && (
                    <div className="mt-1">
                      {/* Add warning if PayPal data exists but user is not on PayPal subscription */}
                      {user.paypalId && !user.subscriptionId?.startsWith("I-") && (
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-orange-600 text-xs font-medium">⚠️ יש נתוני PayPal אך המשתמש לא במנוי PayPal</span>
                        </div>
                      )}
                      {user.paypalId && (
                        <div className="flex justify-between items-center">
                          <span>מזהה PayPal:</span>
                          <span className="font-mono text-xs">{user.paypalId}</span>
                        </div>
                      )}
                      {user.paypalStatus && (
                        <div className="flex justify-between items-center">
                          <span>סטטוס PayPal:</span>
                          <span className={`${
                            user.paypalStatus === 'ACTIVE' ? 'text-green-600' :
                            user.paypalStatus === 'CANCELLED' ? 'text-red-600' :
                            user.paypalStatus === 'EXPIRED' ? 'text-gray-600' :
                            'text-gray-800'
                          }`}>{user.paypalStatus}</span>
                        </div>
                      )}
                      {user.paypalCancellationDate && (
                        <div className="flex justify-between items-center">
                          <span>תאריך ביטול:</span>
                          <span className="text-red-600">
                            {formatShortDate(user.paypalCancellationDate)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span>משך מנוי:</span>
                        <span>
                          {user.paypalCancellationDate 
                            ? `${differenceInDays(new Date(user.paypalCancellationDate), new Date(user.createdAt))} ימים` 
                            : `${calculateDuration(user.createdAt)} ימים`}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {user.cancellationDate && (
                    <>
                      <div className="flex justify-between items-center mt-1 text-amber-600">
                        <span>ביטול מנוי:</span>
                        <span>{formatShortDate(user.cancellationDate)}</span>
                      </div>
                      {(() => {
                        const graceStatus = calculateDaysRemaining(user.cancellationDate, 30);
                        return (
                          <div className="flex justify-between items-center">
                            <span>גישה עד:</span>
                            {!graceStatus.expired ? (
                              <span className="text-amber-600 font-medium">
                                {graceStatus.days} ימים נותרו
                              </span>
                            ) : (
                              <span className="text-red-600 font-medium">הסתיים</span>
                            )}
                          </div>
                        );
                      })()}
                    </>
                  )}
                  
                  {user._count && (
                    <div className="mt-2 pt-1 border-t border-[#E5E7EB]">
                      <div className="flex justify-between items-center">
                        <span>סרטונים שנצפו:</span>
                        <span>{user._count.watchedVideos}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>מועדפים:</span>
                        <span>{user._count.favorites}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>סדרות שנרכשו:</span>
                        <span className={user._count.purchases > 0 ? "text-green-600 font-medium" : ""}>
                          {user._count.purchases}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {user.purchases && user.purchases.length > 0 && (
                    <div className="mt-2 pt-1 border-t border-[#E5E7EB]">
                      <div className="text-xs font-medium text-[#B56B4A] mb-1">רכישות סדרות:</div>
                      {user.purchases.map((purchase, index) => (
                        <div key={purchase.id} className="mb-2 p-2 bg-green-50 rounded border border-green-200">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-green-800">{purchase.series.title}</span>
                            <span className="text-green-600 font-medium">₪{purchase.amount}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-green-700">
                            <span>תאריך רכישה:</span>
                            <span>{formatShortDate(purchase.purchaseDate)}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-green-700">
                            <span>מזהה PayPal:</span>
                            <span className="font-mono">{purchase.paypalOrderId}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span>סטטוס:</span>
                            <span className={`font-medium ${
                              purchase.status === 'COMPLETED' ? 'text-green-600' :
                              purchase.status === 'PENDING' ? 'text-amber-600' :
                              purchase.status === 'REFUNDED' ? 'text-red-600' :
                              'text-gray-600'
                            }`}>
                              {purchase.status === 'COMPLETED' ? 'הושלם' :
                               purchase.status === 'PENDING' ? 'ממתין' :
                               purchase.status === 'REFUNDED' ? 'הוחזר' :
                               purchase.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </td>
              
              <td className="whitespace-nowrap px-3 py-4 text-sm text-[#5D5D5D]">
                {editingUser === user.id ? (
                  <div className="space-y-2">
                    {user.subscriptionId?.startsWith("I-") && (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`setCancellation-${user.id}`}
                          checked={editForm.setCancellationDate}
                          onChange={(e) => setEditForm({ ...editForm, setCancellationDate: e.target.checked })}
                          className="mr-2 h-4 w-4 text-[#B56B4A] focus:ring-[#B56B4A] border-gray-300 rounded"
                        />
                        <label htmlFor={`setCancellation-${user.id}`} className="text-xs">
                          הגדר תאריך ביטול (תקופת חסד 30 יום)
                        </label>
                      </div>
                    )}
                    
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleSaveEdit(user.id)}
                        disabled={isUpdating}
                        className={`${isUpdating ? 'bg-[#8E9A7C]/50' : 'bg-[#8E9A7C] hover:bg-[#8E9A7C]/80'} text-white px-2 py-1 rounded-md text-xs transition-colors flex items-center gap-1`}
                      >
                        {isUpdating && (
                          <span className="inline-block h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                        )}
                        שמור
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isUpdating}
                        className={`${isUpdating ? 'bg-[#B56B4A]/5 text-[#B56B4A]/50' : 'bg-[#B56B4A]/10 text-[#B56B4A] hover:bg-[#B56B4A]/20'} px-2 py-1 rounded-md text-xs transition-colors`}
                      >
                        ביטול
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleEditClick(user)}
                      disabled={isUpdating}
                      className={`${isUpdating ? 'bg-[#D5C4B7]/30 text-[#5D5D5D]/50 cursor-not-allowed' : 'bg-[#D5C4B7]/50 text-[#5D5D5D] hover:bg-[#D5C4B7] cursor-pointer'} px-2 py-1 rounded-md text-xs transition-colors`}
                    >
                      ערוך
                    </button>
                    {user.subscriptionId !== "Admin" && (
                      <button
                        onClick={() => handleDeleteClick(user)}
                        disabled={isUpdating}
                        className={`${isUpdating ? 'bg-red-300 text-red-500 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600 cursor-pointer'} px-2 py-1 rounded-md text-xs transition-colors`}
                      >
                        מחק
                      </button>
                    )}
                  </div>
                )}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ direction: 'rtl' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-[#2D3142] mb-2">
                {deleteConfirmation.step === 1 ? 'אישור מחיקת משתמש' : 'אישור סופי למחיקה'}
              </h3>
              
              {deleteConfirmation.step === 1 ? (
                <div className="text-right">
                  <p className="text-sm text-[#3D3D3D] mb-4">
                    האם אתה בטוח שברצונך למחוק את המשתמש:
                  </p>
                  <p className="text-base font-semibold text-[#B56B4A] mb-4">
                    {deleteConfirmation.userEmail}
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-red-800 font-medium">
                      ⚠️ אזהרה: פעולה זו תמחק לצמיתות:
                    </p>
                    <ul className="text-xs text-red-700 mt-2 list-disc list-inside text-right">
                      <li>את כל נתוני המשתמש</li>
                      <li>את כל הסרטונים שצפה בהם</li>
                      <li>את כל התיקיות והמועדפים שלו</li>
                      <li>את כל ההודעות שקרא</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-right">
                  <p className="text-sm text-[#3D3D3D] mb-4">
                    כדי לאשר את המחיקה הסופית של המשתמש {deleteConfirmation.userEmail}, 
                    אנא הקלד <strong>DELETE</strong> בתיבה למטה:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmation.confirmationText}
                    onChange={(e) => setDeleteConfirmation({
                      ...deleteConfirmation,
                      confirmationText: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-center font-mono"
                    placeholder="הקלד DELETE כדי לאשר"
                    autoFocus
                  />
                </div>
              )}
              
              <div className="flex gap-3 justify-center mt-6">
                <button
                  onClick={handleDeleteConfirm}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    deleteConfirmation.step === 2 && deleteConfirmation.confirmationText !== 'DELETE'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                  disabled={deleteConfirmation.step === 2 && deleteConfirmation.confirmationText !== 'DELETE'}
                >
                  {deleteConfirmation.step === 1 ? 'המשך למחיקה' : 'מחק סופית'}
                </button>
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
                >
                  ביטול
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
