// User type definition for admin dashboard
export type User = {
  id: string;
  name: string | null;
  email: string | null;
  subscriptionId: string | null;
  emailVerified: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string | null;
  trialStartDate?: string | null;
  subscriptionStartDate?: string | null;
  cancellationDate?: string | null;
  paypalStatus?: string | null;
  paypalId?: string | null;
  paypalCancellationDate?: string | null;
  _count: {
    watchedVideos: number;
    favorites: number;
    accounts: number;
  };
};
