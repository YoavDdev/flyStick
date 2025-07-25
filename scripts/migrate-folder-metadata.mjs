import { PrismaClient } from '@prisma/client';
import { folderMetadata } from '../src/config/folder-metadata.ts';

const prisma = new PrismaClient();

/**
 * Migration script to transfer folder metadata from TypeScript file to database
 */
async function migrateFolderMetadata() {
  console.log('🚀 Starting folder metadata migration...');
  console.log(`📊 Found ${Object.keys(folderMetadata).length} folders in TypeScript file`);
  
  // Track success and failures
  let successCount = 0;
  let failureCount = 0;
  const failures = [];
  
  // Process each folder metadata entry
  for (const [folderName, metadata] of Object.entries(folderMetadata)) {
    try {
      console.log(`📁 Processing folder: ${folderName}`);
      
      // Convert levels array to string array if it exists
      const levels = metadata.levels 
        ? metadata.levels 
        : metadata.level 
          ? [metadata.level] 
          : ['all'];
      
      // Create the database entry
      await prisma.folderMetadata.upsert({
        where: { folderName },
        update: {
          description: metadata.description,
          level: metadata.level || null,
          levels,
          levelHebrew: metadata.levelHebrew,
          category: metadata.category,
          subCategory: metadata.subCategory || null,
          order: metadata.order,
          isNew: metadata.isNew || false,
          isVisible: metadata.isVisible,
          image: metadata.image || null,
          updatedAt: new Date(),
        },
        create: {
          folderName,
          description: metadata.description,
          level: metadata.level || null,
          levels,
          levelHebrew: metadata.levelHebrew,
          category: metadata.category,
          subCategory: metadata.subCategory || null,
          order: metadata.order,
          isNew: metadata.isNew || false,
          isVisible: metadata.isVisible,
          image: metadata.image || null,
        },
      });
      
      successCount++;
      console.log(`✅ Successfully migrated: ${folderName}`);
    } catch (error) {
      failureCount++;
      failures.push(folderName);
      console.error(`❌ Failed to migrate ${folderName}:`, error);
    }
  }
  
  // Print summary
  console.log('\n📋 Migration Summary:');
  console.log(`✅ Successfully migrated: ${successCount} folders`);
  console.log(`❌ Failed to migrate: ${failureCount} folders`);
  
  if (failures.length > 0) {
    console.log('\n⚠️ Failed folders:');
    failures.forEach(folder => console.log(`  - ${folder}`));
  }
  
  console.log('\n🏁 Migration complete!');
}

// Run the migration
migrateFolderMetadata()
  .catch(e => {
    console.error('Migration failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
