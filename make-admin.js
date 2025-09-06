const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function makeUserAdmin() {
  try {
    // Get your email - replace with your actual email
    const userEmail = process.argv[2];
    
    if (!userEmail) {
      console.log('Usage: node make-admin.js your-email@example.com');
      return;
    }

    // Update user to admin
    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: { subscriptionId: 'Admin' }
    });

    console.log(`✅ User ${userEmail} is now an admin!`);
    console.log('Refresh your dashboard to see admin features.');
    
  } catch (error) {
    console.error('Error making user admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeUserAdmin();
