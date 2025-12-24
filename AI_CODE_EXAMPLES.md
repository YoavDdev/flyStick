# Code Implementation Examples

## 🔐 NextAuth Configuration

```typescript
// /src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/app/libs/prismadb";
import bcrypt from "bcrypt";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.hashedPassword) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

---

## 📊 User Type Detection

```typescript
// /src/app/utils/userTypeUtils.ts
export type UserType = 'free' | 'trial' | 'subscription' | 'admin';

export function getUserType(subscriptionId: string | null): UserType {
  if (!subscriptionId) return 'free';
  if (subscriptionId === 'Admin') return 'admin';
  if (subscriptionId === 'Trial') return 'trial';
  if (subscriptionId === 'Free') return 'free';
  if (subscriptionId.startsWith('I-')) return 'subscription';
  return 'free';
}

export function hasAccess(userType: UserType): boolean {
  return ['subscription', 'trial', 'admin'].includes(userType);
}

export function isAdmin(subscriptionId: string | null): boolean {
  return subscriptionId === 'Admin';
}
```

---

## 💳 PayPal Subscription Verification

```typescript
// /api/add-subscriptionId/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscriptionId } = await request.json();

    // Verify subscription with PayPal
    const PAYPAL_API = process.env.PAYPAL_MODE === 'live' 
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
    ).toString('base64');

    const response = await fetch(
      `${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}`,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Invalid subscription' }, 
        { status: 400 }
      );
    }

    const subscriptionData = await response.json();
    
    if (subscriptionData.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Subscription not active' }, 
        { status: 400 }
      );
    }

    // Update user in database
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        subscriptionId,
        paypalStatus: subscriptionData.status,
        paypalId: subscriptionId,
        paypalLastSyncAt: new Date(),
      },
    });

    // Send confirmation email to user
    await sendEmail({
      to: user.email,
      subject: '🎉 ההרשמה הושלמה בהצלחה!',
      html: confirmationEmailTemplate(user.name, subscriptionId),
    });

    // Send notification to admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `🎉 מנוי חדש נרשם - ${user.name}`,
      html: adminNotificationTemplate(user),
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Add subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
```

---

## 🎥 Video Player Component

```typescript
// /src/app/components/VideoPlayer.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Player from '@vimeo/player';

interface VideoPlayerProps {
  videoId: string;
  onClose: () => void;
  initialProgress?: number;
}

export default function VideoPlayer({ 
  videoId, 
  onClose, 
  initialProgress = 0 
}: VideoPlayerProps) {
  const playerRef = useRef<Player | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!iframeRef.current) return;

    const player = new Player(iframeRef.current);
    playerRef.current = player;

    // Initialize player
    player.ready().then(() => {
      setLoading(false);
      
      // Resume from saved progress
      if (initialProgress > 0) {
        player.setCurrentTime(initialProgress);
      }
    });

    // Save progress every 30 seconds
    let progressInterval: NodeJS.Timeout;
    player.on('timeupdate', async (data) => {
      clearTimeout(progressInterval);
      progressInterval = setTimeout(async () => {
        try {
          await fetch('/api/save-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              videoId,
              progress: data.seconds,
              completed: false,
            }),
          });
        } catch (error) {
          console.error('Failed to save progress:', error);
        }
      }, 30000);
    });

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(progressInterval);
      window.removeEventListener('keydown', handleKeyDown);
      player.destroy();
    };
  }, [videoId, initialProgress, onClose]);

  return (
    <div className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
      
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-[10001]"
        aria-label="Close video player"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="w-full max-w-6xl aspect-video">
        <iframe
          ref={iframeRef}
          src={`https://player.vimeo.com/video/${videoId}?autoplay=1`}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
```

---

## 📈 Progress Tracking API

```typescript
// /api/save-progress/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/app/libs/prismadb';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { videoId, progress, completed } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Upsert progress
    const watchedVideo = await prisma.watchedVideo.upsert({
      where: {
        userId_videoId: {
          userId: user.id,
          videoId,
        },
      },
      update: {
        progress,
        completed: completed || false,
        lastWatched: new Date(),
      },
      create: {
        userId: user.id,
        videoId,
        progress,
        completed: completed || false,
        lastWatched: new Date(),
      },
    });

    return NextResponse.json({ success: true, watchedVideo });
  } catch (error) {
    console.error('Save progress error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 🎯 Manual Completion Toggle

```typescript
// /api/mark-completed/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/app/libs/prismadb';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { videoId, completed } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const watchedVideo = await prisma.watchedVideo.upsert({
      where: {
        userId_videoId: {
          userId: user.id,
          videoId,
        },
      },
      update: {
        completed,
        lastWatched: new Date(),
      },
      create: {
        userId: user.id,
        videoId,
        progress: 0,
        completed,
        lastWatched: new Date(),
      },
    });

    return NextResponse.json({ success: true, watchedVideo });
  } catch (error) {
    console.error('Mark completed error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 🃏 Video Card Component

```typescript
// /src/app/components/VideoCard.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';
import VideoPlayer from './VideoPlayer';

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    description?: string;
    thumbnail: string;
    duration: number;
  };
  progress?: {
    progress: number;
    completed: boolean;
  };
  onProgressUpdate?: () => void;
}

export default function VideoCard({ 
  video, 
  progress, 
  onProgressUpdate 
}: VideoCardProps) {
  const [showPlayer, setShowPlayer] = useState(false);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await fetch('/api/mark-completed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: video.id,
          completed: !progress?.completed,
        }),
      });
      onProgressUpdate?.();
    } catch (error) {
      console.error('Failed to toggle completion:', error);
    }
  };

  return (
    <>
      <div
        onClick={() => setShowPlayer(true)}
        className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
      >
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Duration Badge */}
          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-sm px-2 py-1 rounded">
            {formatDuration(video.duration)}
          </div>

          {/* Progress Badge */}
          {progress && (
            <div
              onClick={handleToggleComplete}
              className="absolute top-2 right-2 cursor-pointer hover:scale-110 transition-transform"
            >
              {progress.completed ? (
                <div className="bg-green-500 text-white rounded-full p-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : (
                <div className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full">
                  {Math.round(progress.progress)}%
                </div>
              )}
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-right">
            {video.title}
          </h3>
          {video.description && (
            <p className="text-gray-600 text-sm line-clamp-2 text-right">
              {video.description}
            </p>
          )}
        </div>
      </div>

      {/* Video Player Modal */}
      {showPlayer && (
        <VideoPlayer
          videoId={video.id}
          initialProgress={progress?.progress || 0}
          onClose={() => {
            setShowPlayer(false);
            onProgressUpdate?.();
          }}
        />
      )}
    </>
  );
}
```

---

## 👤 Admin User Table

```typescript
// /src/app/components/AdminUserTable.tsx
'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  subscriptionId: string | null;
  paypalStatus: string | null;
  paypalId: string | null;
  paypalCancellationDate: string | null;
  createdAt: string;
}

export default function AdminUserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/get-all-users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (userId: string, newSubscriptionId: string) => {
    try {
      await fetch('/api/admin/update-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, subscriptionId: newSubscriptionId }),
      });
      await fetchUsers();
    } catch (error) {
      console.error('Failed to update subscription:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">טוען משתמשים...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-right">ניהול משתמשים</h2>
      
      {/* Search */}
      <input
        type="text"
        placeholder="חיפוש משתמש..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-4 py-2 border rounded-lg text-right"
      />

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3">שם</th>
              <th className="p-3">אימייל</th>
              <th className="p-3">סטטוס מנוי</th>
              <th className="p-3">PayPal</th>
              <th className="p-3">תאריך הרשמה</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{user.name || 'לא הוגדר'}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">
                  <select
                    value={user.subscriptionId || 'none'}
                    onChange={(e) => updateSubscription(user.id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="none">ללא מנוי</option>
                    <option value="Free">גישה חופשית</option>
                    <option value="Trial">תקופת ניסיון</option>
                    <option value="Admin">מנהל</option>
                    {user.paypalId && (
                      <option value={user.paypalId}>
                        {user.subscriptionId?.startsWith('I-') 
                          ? 'מנוי PayPal נוכחי' 
                          : 'שחזר מנוי PayPal'}
                      </option>
                    )}
                  </select>
                </td>
                <td className="p-3">
                  {user.paypalStatus && (
                    <span className={`px-2 py-1 rounded text-sm ${
                      user.paypalStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      user.paypalStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.paypalStatus}
                    </span>
                  )}
                  {user.paypalId && !user.subscriptionId?.startsWith('I-') && (
                    <div className="text-orange-600 text-sm mt-1">
                      ⚠️ יש מידע PayPal אך המשתמש לא על מנוי PayPal
                    </div>
                  )}
                </td>
                <td className="p-3">
                  {new Date(user.createdAt).toLocaleDateString('he-IL')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## 📧 Email Templates

```typescript
// /src/app/libs/emailTemplates.ts

export const confirmationEmailTemplate = (userName: string, subscriptionId: string) => `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #F7F3EB; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; }
    .header { text-align: center; color: #2D3142; margin-bottom: 30px; }
    .content { color: #3D3D3D; line-height: 1.6; }
    .button { display: inline-block; background-color: #D5C4B7; color: white; padding: 12px 30px; 
              text-decoration: none; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 ברוכים הבאים!</h1>
    </div>
    <div class="content">
      <p>שלום ${userName},</p>
      <p>ההרשמה שלך הושלמה בהצלחה!</p>
      <p>מספר מנוי: ${subscriptionId}</p>
      <p>כעת יש לך גישה מלאה לכל התכנים באתר.</p>
      <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">
        כניסה לאתר
      </a>
      <p>בהצלחה במסע שלך!</p>
    </div>
  </div>
</body>
</html>
`;

export const adminNotificationTemplate = (user: any) => `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #F7F3EB; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; }
    .info { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎉 מנוי חדש נרשם</h1>
    <div class="info">
      <p><strong>שם:</strong> ${user.name}</p>
      <p><strong>אימייל:</strong> ${user.email}</p>
      <p><strong>מנוי:</strong> ${user.subscriptionId}</p>
      <p><strong>תאריך:</strong> ${new Date().toLocaleDateString('he-IL')}</p>
    </div>
    <a href="${process.env.NEXTAUTH_URL}/dashboard">
      כניסה לפאנל הניהול
    </a>
  </div>
</body>
</html>
`;
```

---

## 🔧 Middleware Protection

```typescript
// /middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/register');
  
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                          request.nextUrl.pathname.startsWith('/explore') ||
                          request.nextUrl.pathname.startsWith('/styles') ||
                          request.nextUrl.pathname.startsWith('/user');

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to dashboard if accessing auth pages while logged in
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/explore/:path*', '/styles/:path*', '/user/:path*', '/login', '/register']
};
```

This provides all the key implementation patterns needed to build the platform!
