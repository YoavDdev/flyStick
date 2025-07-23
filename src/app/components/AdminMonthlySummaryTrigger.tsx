"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const AdminMonthlySummaryTrigger: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSent, setLastSent] = useState<string | null>(null);

  const sendMonthlySummary = async () => {
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/admin/monthly-summary');
      
      if (response.data.success) {
        toast.success('📊 דוח חודשי נשלח בהצלחה!');
        setLastSent(new Date().toLocaleString('he-IL'));
        
        // Show summary data in console for admin reference
        console.log('Monthly Summary Data:', response.data.data);
      } else {
        toast.error('❌ שגיאה בשליחת הדוח החודשי');
      }
    } catch (error) {
      console.error('Error sending monthly summary:', error);
      toast.error('❌ שגיאה בשליחת הדוח החודשי');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#F0E9DF] rounded-2xl shadow-md border border-[#D5C4B7] p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[#2D3142] mb-2">
            📊 דוח מנויים חודשי
          </h3>
          <p className="text-sm text-[#3D3D3D] mb-2">
            שליחת דוח מפורט עם כל המנויים הפעילים והכנסות חודשיות
          </p>
          {lastSent && (
            <p className="text-xs text-[#B8A99C]">
              נשלח לאחרונה: {lastSent}
            </p>
          )}
        </div>
        
        <button
          onClick={sendMonthlySummary}
          disabled={isLoading}
          className={`
            px-6 py-3 rounded-lg font-medium transition-all duration-200
            ${isLoading 
              ? 'bg-[#B8A99C] text-white cursor-not-allowed opacity-70' 
              : 'bg-[#D5C4B7] text-[#2D3142] hover:bg-[#B8A99C] hover:text-white hover:shadow-lg'
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent ml-2"></div>
              שולח דוח...
            </div>
          ) : (
            '📧 שלח דוח חודשי'
          )}
        </button>
      </div>
      
      <div className="bg-white/50 rounded-lg p-4 border border-[#D5C4B7]/30">
        <h4 className="font-medium text-[#2D3142] mb-2">מה כלול בדוח:</h4>
        <ul className="text-sm text-[#3D3D3D] space-y-1">
          <li>• רשימת כל המנויים הפעילים (משלמים)</li>
          <li>• מנויים חדשים שהצטרפו החודש</li>
          <li>• סיכום הכנסות חודשיות ותחזית שנתית</li>
          <li>• טבלה מפורטת עם פרטי כל מנוי</li>
          <li>• סטטיסטיקות עסקיות מקיפות</li>
        </ul>
        
        <div className="mt-3 pt-3 border-t border-[#D5C4B7]/30">
          <p className="text-xs text-[#B8A99C]">
            📧 הדוח יישלח ל: yoavddev@gmail.com, zzaaoobb@gmail.com
          </p>
          <p className="text-xs text-[#B8A99C] mt-1">
            🔄 דוח אוטומטי נשלח ב-1 לכל חודש
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminMonthlySummaryTrigger;
