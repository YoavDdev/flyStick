// Script to update all existing live event registrations to receive email updates
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateEmailPreferences() {
  try {
    console.log('🔄 Updating all existing registrations to receive email updates...');
    
    // Update all non-true values to true
    const result = await prisma.liveEventRegistration.updateMany({
      where: {
        NOT: {
          wantsEmailUpdates: true
        }
      },
      data: {
        wantsEmailUpdates: true
      }
    });
    
    console.log(`✅ Updated ${result.count} registrations to receive email updates`);
    
    // Show current stats
    const total = await prisma.liveEventRegistration.count();
    const wantsUpdates = await prisma.liveEventRegistration.count({
      where: { wantsEmailUpdates: true }
    });
    
    console.log('\n📊 Current stats:');
    console.log(`  ✅ Want email updates: ${wantsUpdates}/${total}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateEmailPreferences();
