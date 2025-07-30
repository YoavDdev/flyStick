"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface SyncStatus {
  totalPayPalUsers: number;
  syncedToday: number;
}

export default function PayPalSyncProgress() {
  const { data: session } = useSession();
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  // Fetch sync status on component mount
  useEffect(() => {
    fetchSyncStatus();
  }, []);

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/admin/paypal-sync-job', {
        method: 'GET',
        headers: {
          "Authorization": `Bearer ${session?.user?.email}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSyncStatus({
          totalPayPalUsers: data.totalPayPalUsers,
          syncedToday: data.syncedToday
        });
      }
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
    }
  };

  // Don't render if no data
  if (!syncStatus || syncStatus.totalPayPalUsers === 0) {
    return null;
  }

  const progressPercentage = Math.min((syncStatus.syncedToday / syncStatus.totalPayPalUsers) * 100, 100);

  return (
    <div className="mb-4 bg-white rounded-lg shadow-sm p-4 max-w-md mx-auto">
      <div className="text-center mb-2">
        <span className="text-sm font-medium text-gray-700">התקדמות סנכרון היום</span>
      </div>
      
      <div className="text-center mb-2">
        <span className="text-lg font-bold text-gray-800">
          {syncStatus.syncedToday}/{syncStatus.totalPayPalUsers}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className="bg-[#D4AF37] h-3 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
}
