import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    console.log('Testing email API...');
    console.log('API Key exists:', !!process.env.RESEND_API_KEY);
    console.log('API Key starts with re_:', process.env.RESEND_API_KEY?.startsWith('re_'));

    // Send a simple test email
    const { data, error } = await resend.emails.send({
      from: 'Studio Boaz <onboarding@resend.dev>',
      to: ['info@studioboazonline.com'],
      subject: 'Test Email from Studio Boaz',
      html: '<h1>This is a test email</h1><p>If you receive this, the email system is working!</p>',
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Email sending failed', details: error },
        { status: 500 }
      );
    }

    console.log('Email sent successfully:', data);
    return NextResponse.json(
      { message: 'Test email sent successfully!', data },
      { status: 200 }
    );

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: 'Test email failed', details: error },
      { status: 500 }
    );
  }
}
