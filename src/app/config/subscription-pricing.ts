// Subscription pricing configuration
// Update these values to match your actual subscription prices

export const SUBSCRIPTION_PRICES = {
  MONTHLY_PAYPAL: 220, // ₪220 per month for PayPal subscriptions
  TRIAL: 0, // Free trial
  FREE: 0, // Free access
  ADMIN: 0 // Admin access
} as const;

export const SUBSCRIPTION_LABELS = {
  MONTHLY_PAYPAL: 'PayPal חודשי',
  TRIAL: 'תקופת ניסיון',
  FREE: 'גישה חופשית',
  ADMIN: 'מנהל'
} as const;

// Monthly summary email configuration
export const MONTHLY_SUMMARY_CONFIG = {
  // Day of month to send the summary (1-31)
  SEND_ON_DAY: 1,
  
  // Recipients for monthly summary emails
  RECIPIENTS: ['yoavddev@gmail.com', 'zzaaoobb@gmail.com'] as string[],
  
  // Email subject template
  SUBJECT_TEMPLATE: (month: string, activeCount: number, revenue: number) => 
    `📊 דוח מנויים חודשי - ${month} | ${activeCount} מנויים פעילים | ₪${revenue.toLocaleString()} הכנסה`
};
