// Direct migration script that reads the folder-metadata.ts file and parses it
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Parse the folder-metadata.ts file directly
 * This is a simple parser that extracts the metadata object from the TypeScript file
 */
function parseFolderMetadataFile() {
  const filePath = path.join(__dirname, '../src/config/folder-metadata.ts');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  // Find the start of the folderMetadata object
  const startIndex = fileContent.indexOf('export const folderMetadata');
  if (startIndex === -1) {
    throw new Error('Could not find folderMetadata in file');
  }
  
  // Extract the object definition
  let braceCount = 0;
  let objectStartIndex = -1;
  let objectEndIndex = -1;
  
  for (let i = startIndex; i < fileContent.length; i++) {
    const char = fileContent[i];
    
    if (char === '{') {
      braceCount++;
      if (objectStartIndex === -1) {
        objectStartIndex = i;
      }
    } else if (char === '}') {
      braceCount--;
      if (braceCount === 0 && objectStartIndex !== -1) {
        objectEndIndex = i + 1;
        break;
      }
    }
  }
  
  if (objectStartIndex === -1 || objectEndIndex === -1) {
    throw new Error('Could not parse folderMetadata object');
  }
  
  // Extract the object string and convert it to a JavaScript object
  const objectString = fileContent.substring(objectStartIndex, objectEndIndex);
  
  // Create a function that will evaluate the object string
  // This is safer than using eval directly
  const createObject = new Function(`return ${objectString}`);
  
  try {
    return createObject();
  } catch (error) {
    console.error('Error parsing folder metadata:', error);
    throw new Error('Failed to parse folderMetadata object');
  }
}

/**
 * Migration function to transfer folder metadata to database
 */
async function migrateFolderMetadata() {
  console.log('🚀 Starting folder metadata migration...');
  
  try {
    // Parse the folder metadata file
    const folderMetadata = parseFolderMetadataFile();
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
  } catch (error) {
    console.error('Migration failed with error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateFolderMetadata();
