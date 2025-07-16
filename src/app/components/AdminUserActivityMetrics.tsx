import React from 'react';
import { motion } from 'framer-motion';

type User = {
  id: string;
  name: string | null;
  email: string | null;
  subscriptionId: string | null;
  emailVerified: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string | null;
  _count: {
    watchedVideos: number;
    favorites: number;
    accounts: number;
  };
};

type AdminUserActivityMetricsProps = {
  users: User[];
};

const AdminUserActivityMetrics: React.FC<AdminUserActivityMetricsProps> = ({ users }) => {
  // Find most active users (by watched videos)
  const mostActiveUsers = [...users]
    .sort((a, b) => (b._count?.watchedVideos || 0) - (a._count?.watchedVideos || 0))
    .slice(0, 5);

  // Find users with most favorites
  const usersWithMostFavorites = [...users]
    .sort((a, b) => (b._count?.favorites || 0) - (a._count?.favorites || 0))
    .slice(0, 5);

  // Format date nicely
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "לא ידוע";
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-[#2D3142] mb-4 text-center">מדדי פעילות משתמשים</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Active Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-4"
        >
          <h3 className="text-lg font-medium mb-3 text-[#2D3142] text-center">משתמשים פעילים ביותר</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[#F7F3EB]">
                <tr>
                  <th className="px-4 py-2 text-right text-sm font-medium text-[#5D5D5D]">שם</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-[#5D5D5D]">אימייל</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-[#5D5D5D]">סרטונים שנצפו</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F3EB]">
                {mostActiveUsers.map(user => (
                  <tr key={user.id}>
                    <td className="px-4 py-2 text-sm text-[#2D3142]">{user.name || "ללא שם"}</td>
                    <td className="px-4 py-2 text-sm text-[#2D3142]">{user.email || "ללא אימייל"}</td>
                    <td className="px-4 py-2 text-sm text-[#2D3142] font-medium">{user._count?.watchedVideos || 0}</td>
                  </tr>
                ))}
                {mostActiveUsers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-sm text-center text-[#5D5D5D]">אין נתונים זמינים</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Users with Most Favorites */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-4"
        >
          <h3 className="text-lg font-medium mb-3 text-[#2D3142] text-center">משתמשים עם הכי הרבה מועדפים</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[#F7F3EB]">
                <tr>
                  <th className="px-4 py-2 text-right text-sm font-medium text-[#5D5D5D]">שם</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-[#5D5D5D]">אימייל</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-[#5D5D5D]">מועדפים</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F3EB]">
                {usersWithMostFavorites.map(user => (
                  <tr key={user.id}>
                    <td className="px-4 py-2 text-sm text-[#2D3142]">{user.name || "ללא שם"}</td>
                    <td className="px-4 py-2 text-sm text-[#2D3142]">{user.email || "ללא אימייל"}</td>
                    <td className="px-4 py-2 text-sm text-[#2D3142] font-medium">{user._count?.favorites || 0}</td>
                  </tr>
                ))}
                {usersWithMostFavorites.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-sm text-center text-[#5D5D5D]">אין נתונים זמינים</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-lg shadow-md p-4 lg:col-span-2"
        >
          <h3 className="text-lg font-medium mb-3 text-[#2D3142] text-center">פעילות אחרונה</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[#F7F3EB]">
                <tr>
                  <th className="px-4 py-2 text-right text-sm font-medium text-[#5D5D5D]">שם</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-[#5D5D5D]">אימייל</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-[#5D5D5D]">תאריך הרשמה</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-[#5D5D5D]">עדכון אחרון</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-[#5D5D5D]">סרטונים שנצפו</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F3EB]">
                {[...users]
                  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                  .slice(0, 5)
                  .map(user => (
                    <tr key={user.id}>
                      <td className="px-4 py-2 text-sm text-[#2D3142]">{user.name || "ללא שם"}</td>
                      <td className="px-4 py-2 text-sm text-[#2D3142]">{user.email || "ללא אימייל"}</td>
                      <td className="px-4 py-2 text-sm text-[#2D3142]">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-2 text-sm text-[#2D3142]">{formatDate(user.updatedAt)}</td>
                      <td className="px-4 py-2 text-sm text-[#2D3142] font-medium">{user._count?.watchedVideos || 0}</td>
                    </tr>
                  ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-2 text-sm text-center text-[#5D5D5D]">אין נתונים זמינים</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminUserActivityMetrics;
