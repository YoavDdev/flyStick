"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface EmailLog {
  id: string;
  to: string;
  from: string;
  subject: string;
  emailType: string;
  status: string;
  resendId?: string;
  errorMessage?: string;
  createdAt: string;
}

export default function EmailLogsViewer() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "sent" | "failed">("all");
  const [stats, setStats] = useState<any>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const url = filter === "all" 
        ? "/api/admin/email-logs?limit=50"
        : `/api/admin/email-logs?limit=50&status=${filter}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setLogs(data.logs);
        setStats(data.stats);
      } else {
        toast.error("שגיאה בטעינת הלוגים");
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("שגיאה בטעינת לוגי המיילים");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent": return "text-green-600 bg-green-50";
      case "failed": return "text-red-600 bg-red-50";
      case "pending": return "text-yellow-600 bg-yellow-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent": return "✅";
      case "failed": return "❌";
      case "pending": return "⏳";
      default: return "❓";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#D5C4B7]/30 p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-[#2D3142]">
          📊 לוג מיילים אחרונים
        </h3>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="text-sm bg-[#F7F3EB] hover:bg-[#D5C4B7] px-3 py-1.5 rounded-lg transition-colors"
        >
          {loading ? "טוען..." : "רענן"}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-[#B56B4A] text-white"
              : "bg-[#F7F3EB] text-[#2D3142] hover:bg-[#D5C4B7]"
          }`}
        >
          הכל
        </button>
        <button
          onClick={() => setFilter("sent")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "sent"
              ? "bg-green-600 text-white"
              : "bg-[#F7F3EB] text-[#2D3142] hover:bg-green-50"
          }`}
        >
          ✅ נשלחו
        </button>
        <button
          onClick={() => setFilter("failed")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "failed"
              ? "bg-red-600 text-white"
              : "bg-[#F7F3EB] text-[#2D3142] hover:bg-red-50"
          }`}
        >
          ❌ נכשלו
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {stats.byStatus?.map((stat: any) => (
            <div key={stat.status} className="bg-[#F7F3EB] rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-[#2D3142]">{stat._count}</div>
              <div className="text-xs text-[#5D5D5D]">
                {stat.status === "sent" ? "נשלחו" : stat.status === "failed" ? "נכשלו" : "ממתינים"}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Logs Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-8 text-[#5D5D5D]">טוען לוגים...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-[#5D5D5D]">
            אין לוגים להצגה
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="border border-[#D5C4B7]/20 rounded-lg p-4 hover:bg-[#F7F3EB]/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(log.status)}`}>
                        {getStatusIcon(log.status)} {log.status}
                      </span>
                      <span className="px-2 py-1 rounded text-xs bg-[#F7F3EB] text-[#2D3142]">
                        {log.emailType}
                      </span>
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[#5D5D5D] font-medium">אל:</span>
                        <span className="text-[#2D3142] font-mono text-xs">{log.to}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#5D5D5D] font-medium">נושא:</span>
                        <span className="text-[#2D3142]">{log.subject}</span>
                      </div>
                      {log.resendId && (
                        <div className="flex items-center gap-2">
                          <span className="text-[#5D5D5D] font-medium">Resend ID:</span>
                          <span className="text-[#2D3142] font-mono text-xs">{log.resendId}</span>
                        </div>
                      )}
                      {log.errorMessage && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                          <span className="text-xs text-red-700 font-medium">שגיאה: </span>
                          <span className="text-xs text-red-600">{log.errorMessage}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-[#9D8E81] whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('he-IL')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {logs.length > 0 && (
        <div className="mt-4 text-xs text-center text-[#9D8E81]">
          מציג {logs.length} מיילים אחרונים
        </div>
      )}
    </div>
  );
}
