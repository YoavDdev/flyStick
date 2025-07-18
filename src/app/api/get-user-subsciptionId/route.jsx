import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/app/libs/prismadb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      },
      select: {
        subscriptionId: true,
        trialStartDate: true
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      subscriptionId: user.subscriptionId,
      trialStartDate: user.trialStartDate
    });
  } catch (error) {
    console.error('Error fetching user subscription ID:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userEmail } = body;
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    const user = await prisma.user.findUnique({
      where: {
        email: userEmail
      },
      select: {
        subscriptionId: true,
        trialStartDate: true
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      subscriptionId: user.subscriptionId,
      trialStartDate: user.trialStartDate
    });
  } catch (error) {
    console.error('Error fetching user subscription ID:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}