import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get admin email from query params for authorization
    const { searchParams } = new URL(request.url);
    const adminEmail = searchParams.get('adminEmail');

    if (!adminEmail) {
      return NextResponse.json({ error: 'Admin email required' }, { status: 400 });
    }

    // Verify admin authorization
    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: { subscriptionId: true }
    });

    if (!adminUser || adminUser.subscriptionId !== 'Admin') {
      return NextResponse.json({ error: 'נדרשת הרשאת מנהל' }, { status: 403 });
    }

    // Fetch all active subscribers
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      select: {
        id: true,
        email: true,
        subscribedAt: true,
        source: true
      },
      orderBy: { subscribedAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      subscribers,
      total: subscribers.length
    });

  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json(
      { error: 'שגיאה בטעינת רשימת המנויים' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { adminEmail, subscriberId } = await request.json();

    if (!adminEmail || !subscriberId) {
      return NextResponse.json({ error: 'Admin email and subscriber ID required' }, { status: 400 });
    }

    // Verify admin authorization
    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: { subscriptionId: true }
    });

    if (!adminUser || adminUser.subscriptionId !== 'Admin') {
      return NextResponse.json({ error: 'נדרשת הרשאת מנהל' }, { status: 403 });
    }

    // Remove subscriber (set as inactive)
    const removedSubscriber = await prisma.newsletterSubscriber.update({
      where: { id: subscriberId },
      data: { isActive: false }
    });

    return NextResponse.json({
      success: true,
      message: 'המנוי הוסר בהצלחה',
      removedEmail: removedSubscriber.email
    });

  } catch (error) {
    console.error('Error removing subscriber:', error);
    return NextResponse.json(
      { error: 'שגיאה בהסרת המנוי' },
      { status: 500 }
    );
  }
}
