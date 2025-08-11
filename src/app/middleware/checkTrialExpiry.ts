import prismadb from "@/app/libs/prismadb";
import { addDays, isBefore } from "date-fns";

/**
 * Automatically checks and updates expired trial subscriptions
 * This function can be called from various places to ensure trials are checked regularly
 */
export async function checkTrialExpiry() {
  try {
    // Find all users with trial_30 subscription
    const trialUsers = await prismadb.user.findMany({
      where: {
        subscriptionId: "trial_30",
        trialStartDate: { not: null }
      },
    });

    const now = new Date();
    const updatedUsers = [];

    // Check each trial user
    for (const user of trialUsers) {
      if (user.trialStartDate) {
        // Calculate expiry date (30 days after trial start)
        const expiryDate = addDays(user.trialStartDate, 30);
        
        // If current date is after expiry date, update subscription to empty string (ללא מנוי)
        if (isBefore(expiryDate, now)) {
          const updatedUser = await prismadb.user.update({
            where: { id: user.id },
            data: { 
              subscriptionId: "", // Empty string for "ללא מנוי"
              trialStartDate: null // Clear trial start date
            },
          });
          
          updatedUsers.push(updatedUser.id);
        }
      }
    }

    return {
      updatedCount: updatedUsers.length,
      updatedUsers
    };

  } catch (error) {
    console.error("[AUTO_CHECK_TRIAL_EXPIRY_ERROR]", error);
    return {
      updatedCount: 0,
      updatedUsers: [],
      error
    };
  }
}
