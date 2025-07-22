import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { emails } = await req.json();

    if (!emails || !Array.isArray(emails)) {
      return NextResponse.json(
        { error: 'Invalid emails array provided' },
        { status: 400 }
      );
    }

    console.log(`Starting bulk import of ${emails.length} subscribers...`);

    const results = {
      imported: 0,
      skipped: 0,
      errors: 0,
      details: [] as any[]
    };

    for (const email of emails) {
      try {
        // Check if subscriber already exists
        const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
          where: { email: email.trim().toLowerCase() }
        });

        if (existingSubscriber) {
          results.skipped++;
          results.details.push({
            email,
            status: 'skipped',
            reason: 'Already exists'
          });
          continue;
        }

        // Create new subscriber
        await prisma.newsletterSubscriber.create({
          data: {
            email: email.trim().toLowerCase(),
            isActive: true,
            subscribedAt: new Date(),
            source: 'bulk_import',
            unsubscribeToken: randomUUID()
          }
        });

        results.imported++;
        results.details.push({
          email,
          status: 'imported',
          reason: 'Successfully added'
        });

      } catch (error) {
        console.error(`Error importing ${email}:`, error);
        results.errors++;
        results.details.push({
          email,
          status: 'error',
          reason: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`Bulk import completed:`, results);

    return NextResponse.json({
      success: true,
      message: `Import completed: ${results.imported} imported, ${results.skipped} skipped, ${results.errors} errors`,
      results
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to import subscribers',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
