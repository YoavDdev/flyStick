const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupCategories() {
  try {
    console.log('🧹 Starting categories cleanup...');

    // Delete all subcategories first (due to foreign key constraints)
    console.log('Deleting all subcategories...');
    await prisma.subcategory.deleteMany({});

    // Delete all categories except "technique"
    console.log('Deleting all categories except "technique"...');
    await prisma.category.deleteMany({
      where: {
        key: {
          not: 'technique'
        }
      }
    });

    // Ensure we have the technique category
    const techniqueCategory = await prisma.category.findFirst({
      where: { key: 'technique' }
    });

    if (!techniqueCategory) {
      console.log('Creating technique category...');
      await prisma.category.create({
        data: {
          key: 'technique',
          hebrew: 'טכניקה',
          order: 1,
          isActive: true
        }
      });
    } else {
      console.log('✅ Technique category already exists');
    }

    // Update all folder metadata to use only "technique" category
    console.log('Updating all folder metadata to use technique category...');
    await prisma.folderMetadata.updateMany({
      data: {
        category: 'technique',
        subCategory: null
      }
    });

    console.log('✅ Categories cleanup completed successfully!');
    console.log('📊 Final state:');
    console.log('- Only "technique" category remains');
    console.log('- All subcategories removed');
    console.log('- All folder metadata updated to use technique category');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupCategories();
