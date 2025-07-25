const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Existing categories and subcategories from the static config
const categoriesData = [
  {
    key: 'technique',
    hebrew: 'טכניקה',
    order: 1,
    subcategories: [
      { key: 'mat', hebrew: 'מזרן', order: 1 },
      { key: 'apparatus', hebrew: 'מכשירים', order: 2 },
      { key: 'flystick', hebrew: 'פלייסטיק', order: 3 },
      { key: 'basics', hebrew: 'יסודות', order: 4 }
    ]
  },
  {
    key: 'equipment',
    hebrew: 'אביזרים',
    order: 2,
    subcategories: [
      { key: 'ball', hebrew: 'כדור', order: 1 },
      { key: 'bands', hebrew: 'רצועות', order: 2 },
      { key: 'weights', hebrew: 'משקולות', order: 3 },
      { key: 'props', hebrew: 'אביזרים נוספים', order: 4 }
    ]
  },
  {
    key: 'education',
    hebrew: 'חינוך',
    order: 3,
    subcategories: [
      { key: 'theory', hebrew: 'תיאוריה', order: 1 },
      { key: 'anatomy', hebrew: 'אנטומיה', order: 2 },
      { key: 'workshops', hebrew: 'סדנאות', order: 3 },
      { key: 'courses', hebrew: 'קורסים', order: 4 }
    ]
  },
  {
    key: 'therapy',
    hebrew: 'טיפול',
    order: 4,
    subcategories: [
      { key: 'back', hebrew: 'גב', order: 1 },
      { key: 'legs', hebrew: 'רגלים', order: 2 },
      { key: 'arms', hebrew: 'ידיים', order: 3 },
      { key: 'core', hebrew: 'בטן וליבה', order: 4 },
      { key: 'neck', hebrew: 'צוואר', order: 5 }
    ]
  },
  {
    key: 'special',
    hebrew: 'מיוחד',
    order: 5,
    subcategories: [
      { key: 'pregnancy', hebrew: 'הריון', order: 1 },
      { key: 'seniors', hebrew: 'גיל הזהב', order: 2 },
      { key: 'rehabilitation', hebrew: 'שיקום', order: 3 },
      { key: 'chair', hebrew: 'כסא', order: 4 }
    ]
  },
  {
    key: 'mindfulness',
    hebrew: 'מיינדפולנס',
    order: 6,
    subcategories: [
      { key: 'meditation', hebrew: 'מדיטציה', order: 1 },
      { key: 'breathing', hebrew: 'נשימה', order: 2 },
      { key: 'relaxation', hebrew: 'הרפיה', order: 3 },
      { key: 'awareness', hebrew: 'מודעות', order: 4 }
    ]
  },
  {
    key: 'quick',
    hebrew: 'מהיר',
    order: 7,
    subcategories: [
      { key: 'morning', hebrew: 'בוקר', order: 1 },
      { key: 'break', hebrew: 'הפסקה', order: 2 },
      { key: 'evening', hebrew: 'ערב', order: 3 },
      { key: 'targeted', hebrew: 'ממוקד', order: 4 }
    ]
  },
  {
    key: 'new',
    hebrew: 'חדש',
    order: 8,
    subcategories: [
      { key: 'recent', hebrew: 'חדש', order: 1 },
      { key: 'featured', hebrew: 'מומלץ', order: 2 },
      { key: 'popular', hebrew: 'פופולרי', order: 3 }
    ]
  }
];

async function migrateCategories() {
  try {
    console.log('🚀 Starting categories migration...');

    // Check if categories already exist
    const existingCategories = await prisma.category.count();
    if (existingCategories > 0) {
      console.log('⚠️  Categories already exist in database. Skipping migration.');
      return;
    }

    // Create categories and subcategories
    for (const categoryData of categoriesData) {
      console.log(`📁 Creating category: ${categoryData.hebrew} (${categoryData.key})`);
      
      const category = await prisma.category.create({
        data: {
          key: categoryData.key,
          hebrew: categoryData.hebrew,
          order: categoryData.order,
          isActive: true
        }
      });

      // Create subcategories for this category
      for (const subCategoryData of categoryData.subcategories) {
        console.log(`  📂 Creating subcategory: ${subCategoryData.hebrew} (${subCategoryData.key})`);
        
        await prisma.subcategory.create({
          data: {
            categoryId: category.id,
            key: subCategoryData.key,
            hebrew: subCategoryData.hebrew,
            order: subCategoryData.order,
            isActive: true
          }
        });
      }
    }

    console.log('✅ Categories migration completed successfully!');
    console.log(`📊 Created ${categoriesData.length} categories and ${categoriesData.reduce((sum, cat) => sum + cat.subcategories.length, 0)} subcategories`);

  } catch (error) {
    console.error('❌ Error during categories migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateCategories()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
