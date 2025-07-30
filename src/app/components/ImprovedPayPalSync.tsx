"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface SyncStatus {
  totalPayPalUsers: number;
  syncedToday: number;
  successfulSyncs: number;
  errorSyncs: number;
  lastSyncTime: number | null;
}

export default function ImprovedPayPalSync() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Fetch sync status on component mount
  useEffect(() => {
    fetchSyncStatus();
  }, []);

  const fetchSyncStatus = async () => {
    try {
      setIsCheckingStatus(true);
      const response = await fetch('/api/admin/paypal-sync-job', {
        method: 'GET',
        headers: {
          "Authorization": `Bearer ${session?.user?.email}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSyncStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const startBackgroundSync = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/admin/paypal-sync-job', {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${session?.user?.email}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "שגיאה בהפעלת סנכרון PayPal");
      }

      const data = await response.json();
      
      toast.success(
        `🚀 סנכרון PayPal התחיל ברקע!\n\nהתהליך יעבד את כל המשתמשים בצורה מדורגת.\nתוכל לבדוק את ההתקדמות כאן.`,
        { duration: 8000 }
      );

      // Refresh status after starting sync
      setTimeout(() => {
        fetchSyncStatus();
      }, 2000);

    } catch (error: unknown) {
      console.error("Error starting PayPal sync:", error);
      const errorMessage = error instanceof Error ? error.message : 'שגיאה לא ידועה';
      toast.error(
        `❌ שגיאה בהפעלת סנכרון PayPal: ${errorMessage}`,
        { duration: 5000 }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastSyncTime = (timestamp: number | null) => {
    if (!timestamp) return 'אף פעם';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) {
      return `לפני ${diffMinutes} דקות`;
    } else if (diffHours < 24) {
      return `לפני ${diffHours} שעות`;
    } else {
      return date.toLocaleDateString('he-IL');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          🔄 סנכרון נתוני PayPal משופר
        </h3>
        <button
          onClick={fetchSyncStatus}
          disabled={isCheckingStatus}
          className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          {isCheckingStatus ? '🔄' : '↻'} רענן סטטוס
        </button>
      </div>

      {/* Sync Status Display */}
      {syncStatus && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {syncStatus.totalPayPalUsers}
            </div>
            <div className="text-sm text-gray-600">סה"כ משתמשי PayPal</div>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {syncStatus.successfulSyncs}
            </div>
            <div className="text-sm text-gray-600">סונכרנו בהצלחה היום</div>
          </div>
          
          <div className="bg-red-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">
              {syncStatus.errorSyncs}
            </div>
            <div className="text-sm text-gray-600">שגיאות סנכרון היום</div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="text-sm font-bold text-gray-600">
              {formatLastSyncTime(syncStatus.lastSyncTime)}
            </div>
            <div className="text-sm text-gray-600">סנכרון אחרון</div>
          </div>
        </div>
      )}

      {/* Sync Progress Indicator */}
      {syncStatus && syncStatus.totalPayPalUsers > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>התקדמות סנכרון היום</span>
            <span>{syncStatus.syncedToday}/{syncStatus.totalPayPalUsers}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min((syncStatus.syncedToday / syncStatus.totalPayPalUsers) * 100, 100)}%` 
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Improved Sync Button */}
      <div className="space-y-3">
        <button
          onClick={startBackgroundSync}
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
            isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              מפעיל סנכרון ברקע...
            </div>
          ) : (
            '🚀 הפעל סנכרון PayPal ברקע'
          )}
        </button>

        {/* Information Box */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">
                סנכרון משופר ברקע
              </h4>
              <div className="mt-1 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>הסנכרון רץ ברקע ולא יגרום לטיימאאוט</li>
                  <li>עיבוד מדורג עם השהיות למניעת rate limiting</li>
                  <li>התקדמות מתועדת ומוצגת בזמן אמת</li>
                  <li>ניתן לעבוד בעמוד הניהול בזמן הסנכרון</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
