// Manual password reset script
// Usage: node scripts/reset-password-manual.js <email> <newPassword>

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error('Usage: node scripts/reset-password-manual.js <email> <newPassword>');
    console.error('Example: node scripts/reset-password-manual.js user@example.com newpass123');
    process.exit(1);
  }

  if (newPassword.length < 6) {
    console.error('❌ Password must be at least 6 characters');
    process.exit(1);
  }

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { hashedPassword },
    });

    console.log(`✅ Password reset successful for: ${user.name} (${user.email})`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
