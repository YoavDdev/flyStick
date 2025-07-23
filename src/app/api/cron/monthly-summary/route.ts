import { NextRequest, NextResponse } from 'next/server';

// This endpoint can be called by external cron services like Vercel Cron or external schedulers
// It will trigger the monthly summary email automatically

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from a trusted source (optional security measure)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the current date to check if we should send the monthly summary
    const now = new Date();
    const dayOfMonth = now.getDate();
    
    // Only send on the 1st day of each month (or adjust as needed)
    if (dayOfMonth !== 1) {
      return NextResponse.json({
        message: `Monthly summary not sent - today is day ${dayOfMonth} of the month. Summary is sent on the 1st of each month.`,
        skipped: true
      });
    }

    // Call the monthly summary API endpoint
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const summaryResponse = await fetch(`${baseUrl}/api/admin/monthly-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!summaryResponse.ok) {
      const errorData = await summaryResponse.json();
      console.error('❌ Failed to send monthly summary:', errorData);
      return NextResponse.json(
        { error: 'Failed to send monthly summary', details: errorData },
        { status: 500 }
      );
    }

    const summaryData = await summaryResponse.json();
    
    console.log('✅ Monthly summary cron job completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Monthly summary sent successfully via cron job',
      timestamp: now.toISOString(),
      data: summaryData.data
    });

  } catch (error) {
    console.error('❌ Error in monthly summary cron job:', error);
    return NextResponse.json(
      { error: 'Internal server error in cron job' },
      { status: 500 }
    );
  }
}

// Also support POST method for flexibility
export async function POST(request: NextRequest) {
  return GET(request);
}
