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
  cancellationDate?: string | null;
  paypalStatus?: string | null;
  _count: {
    watchedVideos: number;
    favorites: number;
    accounts: number;
  };
};

type StatCardProps = {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  delay: number;
  onClick?: () => void;
  isActive?: boolean;
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, delay, onClick, isActive = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    onClick={onClick}
    className={`bg-white rounded-lg shadow-md p-4 flex flex-col items-center justify-center ${color} h-full
      ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow duration-200' : ''}
      ${isActive ? 'ring-2 ring-[#B56B4A] bg-[#F7F3EB]' : ''}`}
  >
    <div className="text-3xl mb-2">{icon}</div>
    <h3 className="text-lg font-medium text-center mb-1">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </motion.div>
);

type FilterType = 'all' | 'active' | 'trial' | 'grace' | 'free' | 'admin' | 'cancelled';

type AdminDashboardSummaryProps = {
  users: User[];
  onFilterChange?: (filter: FilterType) => void;
  activeFilter?: FilterType;
};

const AdminDashboardSummary: React.FC<AdminDashboardSummaryProps> = ({ 
  users, 
  onFilterChange = () => {}, 
  activeFilter = 'all' 
}) => {
  // Calculate statistics
  const totalUsers = users.length;
  
  // Only users with PayPal status ACTIVE
  const activeSubscriptions = users.filter(user => 
    user.subscriptionId?.startsWith('I-') && user.paypalStatus === 'ACTIVE'
  ).length;
  
  // Users with PayPal status CANCELLED
  const cancelledSubscriptions = users.filter(user => 
    user.subscriptionId?.startsWith('I-') && user.paypalStatus === 'CANCELLED'
  ).length;
  
  const trialUsers = users.filter(user => 
    user.subscriptionId === 'trial_30'
  ).length;
  
  const freeAccessUsers = users.filter(user => 
    user.subscriptionId === 'free'
  ).length;
  
  const adminUsers = users.filter(user => 
    user.subscriptionId === 'Admin'
  ).length;

  // Users in grace period (have cancellationDate and within 30 days)
  const usersInGracePeriod = users.filter(user => {
    if (!user.cancellationDate) return false;
    
    const gracePeriodEnd = new Date(user.cancellationDate);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 30); // 30-day grace period
    return new Date() < gracePeriodEnd;
  }).length;

  // Total watched videos across all users
  const totalWatchedVideos = users.reduce((sum, user) => sum + (user._count?.watchedVideos || 0), 0);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-[#2D3142] mb-4 text-center">סיכום נתונים</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="סה״כ משתמשים"
          value={totalUsers}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>}
          color="border-l-4 border-blue-500"
          delay={0.1}
          onClick={() => onFilterChange('all')}
          isActive={activeFilter === 'all'}
        />
        <StatCard
          title="מנויים פעילים"
          value={activeSubscriptions}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>}
          color="border-l-4 border-green-500"
          delay={0.2}
          onClick={() => onFilterChange('active')}
          isActive={activeFilter === 'active'}
        />
        <StatCard
          title="משתמשי ניסיון"
          value={trialUsers}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>}
          color="border-l-4 border-yellow-500"
          delay={0.3}
          onClick={() => onFilterChange('trial')}
          isActive={activeFilter === 'trial'}
        />
        <StatCard
          title="בתקופת גרייס"
          value={usersInGracePeriod}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>}
          color="border-l-4 border-amber-500"
          delay={0.4}
          onClick={() => onFilterChange('grace')}
          isActive={activeFilter === 'grace'}
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4">
        <StatCard
          title="מנויים שביטלו"
          value={cancelledSubscriptions}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>}
          color="border-l-4 border-gray-500"
          delay={0.5}
          onClick={() => onFilterChange('cancelled')}
          isActive={activeFilter === 'cancelled'}
        />
        <StatCard
          title="גישה חופשית"
          value={freeAccessUsers}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>}
          color="border-l-4 border-purple-500"
          delay={0.6}
          onClick={() => onFilterChange('free')}
          isActive={activeFilter === 'free'}
        />
        <StatCard
          title="מנהלים"
          value={adminUsers}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>}
          color="border-l-4 border-red-500"
          delay={0.7}
          onClick={() => onFilterChange('admin')}
          isActive={activeFilter === 'admin'}
        />
        <StatCard
          title="סה״כ צפיות בסרטונים"
          value={totalWatchedVideos}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>}
          color="border-l-4 border-indigo-500"
          delay={0.8}
        />
      </div>
    </div>
  );
};

export default AdminDashboardSummary;
