import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import axios from "axios";

export async function GET(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "אין הרשאות מתאימות" },
        { status: 401 }
      );
    }

    // Extract the email from the token
    const email = authHeader.split(" ")[1];

    // Check if the user is an admin
    const adminUser = await prisma.user.findUnique({
      where: { email },
      select: { subscriptionId: true },
    });

    if (!adminUser || adminUser.subscriptionId !== "Admin") {
      return NextResponse.json(
        { error: "אין הרשאות מתאימות" },
        { status: 403 }
      );
    }
    
    // Fetch all users with their watched videos count and folders
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionId: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            watchedVideos: true,
            favorites: true,
            accounts: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Fetch PayPal subscription details for users with subscriptionId
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    
    if (clientId && clientSecret) {
      const auth = {
        username: clientId,
        password: clientSecret,
      };
      
      // Define User type with PayPal fields
      type UserWithPayPal = typeof users[0] & {
        paypalStatus: string | null;
        paypalId: string | null;
        paypalCancellationDate: string | null;
      };
      
      // Helper function to fetch PayPal subscription with retry logic
      const fetchPayPalSubscriptionWithRetry = async (subscriptionId: string, maxRetries = 2): Promise<any> => {
        let retries = 0;
        
        while (retries <= maxRetries) {
          try {
            // Increase timeout to 8 seconds
            const response = await axios.get(
              `https://api.paypal.com/v1/billing/subscriptions/${subscriptionId}`,
              { 
                auth,
                timeout: 8000 // 8 second timeout
              }
            );
            return response.data;
          } catch (error: any) {
            // If we've reached max retries, throw the error
            if (retries === maxRetries) {
              throw error;
            }
            
            // If it's a timeout or network error, retry
            if (error.code === 'ECONNABORTED' || error.message?.includes('timeout') || 
                error.response?.status === 429 || error.response?.status >= 500) {
              console.log(`Retry ${retries + 1} for subscription ${subscriptionId}`);
              retries++;
              // Exponential backoff: wait longer between each retry
              await new Promise(resolve => setTimeout(resolve, 1000 * retries));
            } else {
              // For other errors (like 404, 401), don't retry
              throw error;
            }
          }
        }
      };
      
      // Enhance users with PayPal subscription details
      const usersWithPayPalDetails = await Promise.all(
        users.map(async (user: typeof users[0]) => {
          // Only fetch PayPal details for users with subscription IDs that look like PayPal IDs
          // (not Admin, active, or null)
          if (user.subscriptionId && 
              user.subscriptionId !== "Admin" && 
              user.subscriptionId !== "active" &&
              user.subscriptionId !== "free" &&
              user.subscriptionId !== "trial_30" &&
              user.subscriptionId.startsWith("I-")) {
            try {
              const subscriptionData = await fetchPayPalSubscriptionWithRetry(user.subscriptionId);
              
              // Extract cancellation date if subscription is canceled
              let cancellationDate = null;
              if (subscriptionData.status === 'CANCELLED' || subscriptionData.status === 'EXPIRED') {
                // Try to get the cancellation date from status_update_time or last_payment date
                cancellationDate = subscriptionData.status_update_time || 
                                 (subscriptionData.billing_info?.last_payment?.time) || null;
              }
              
              return {
                ...user,
                paypalStatus: subscriptionData.status,
                paypalId: user.subscriptionId,
                paypalCancellationDate: cancellationDate
              };
            } catch (error) {
              console.error(`Error fetching PayPal details for user ${user.id}:`, error);
              return {
                ...user,
                paypalStatus: "error",
                paypalId: user.subscriptionId,
                paypalCancellationDate: null
              };
            }
          }
          return {
            ...user,
            paypalStatus: null,
            paypalId: user.subscriptionId,
            paypalCancellationDate: null
          };
        })
      );
      
      return NextResponse.json(usersWithPayPalDetails);
    }
    
    // If no PayPal credentials, return users without PayPal details
    return NextResponse.json(users.map((user: typeof users[0]) => ({
      ...user,
      paypalStatus: null,
      paypalId: user.subscriptionId,
      paypalCancellationDate: null
    })));
    
  } catch (error) {
    console.error("[ADMIN_GET_ALL_USERS_ERROR]", error);
    return NextResponse.json(
      { error: "שגיאת שרת פנימית" },
      { status: 500 }
    );
  }
}
