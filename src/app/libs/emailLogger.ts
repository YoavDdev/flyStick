import prisma from "./prismadb";

interface EmailLogData {
  to: string;
  from: string;
  subject: string;
  emailType: string;
  status: "sent" | "failed" | "pending";
  resendId?: string;
  errorMessage?: string;
  userId?: string;
  metadata?: any;
}

/**
 * Log email sending attempt to database
 */
export async function logEmail(data: EmailLogData) {
  try {
    await prisma.emailLog.create({
      data: {
        to: data.to,
        from: data.from,
        subject: data.subject,
        emailType: data.emailType,
        status: data.status,
        resendId: data.resendId,
        errorMessage: data.errorMessage,
        userId: data.userId,
        metadata: data.metadata,
      },
    });
    console.log(`📧 Email log saved: ${data.emailType} to ${data.to} - ${data.status}`);
  } catch (error) {
    console.error("❌ Failed to log email:", error);
    // Don't throw - logging failure shouldn't break email sending
  }
}

/**
 * Get email logs for a specific user
 */
export async function getUserEmailLogs(email: string) {
  try {
    return await prisma.emailLog.findMany({
      where: { to: email },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch (error) {
    console.error("❌ Failed to get email logs:", error);
    return [];
  }
}

/**
 * Get failed emails for retry
 */
export async function getFailedEmails(limit = 100) {
  try {
    return await prisma.emailLog.findMany({
      where: { status: "failed" },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch (error) {
    console.error("❌ Failed to get failed emails:", error);
    return [];
  }
}

/**
 * Get email statistics
 */
export async function getEmailStats(days = 7) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [total, sent, failed, pending] = await Promise.all([
      prisma.emailLog.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.emailLog.count({
        where: { status: "sent", createdAt: { gte: startDate } },
      }),
      prisma.emailLog.count({
        where: { status: "failed", createdAt: { gte: startDate } },
      }),
      prisma.emailLog.count({
        where: { status: "pending", createdAt: { gte: startDate } },
      }),
    ]);

    return {
      total,
      sent,
      failed,
      pending,
      successRate: total > 0 ? ((sent / total) * 100).toFixed(2) : "0",
    };
  } catch (error) {
    console.error("❌ Failed to get email stats:", error);
    return {
      total: 0,
      sent: 0,
      failed: 0,
      pending: 0,
      successRate: "0",
    };
  }
}
