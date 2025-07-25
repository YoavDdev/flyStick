export interface FolderMetadata {
  description: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'all'; // For backwards compatibility
  levels?: ('beginner' | 'intermediate' | 'advanced' | 'all')[]; // For multiple levels
  levelHebrew: string;
  category: string;
  subCategory?: string;
  order: number;
  isNew?: boolean;
  isVisible: boolean;
  image?: string; // URL to custom folder image
}

export const folderMetadata: Record<string, FolderMetadata> = {
                          "Contrology": {
      description: "שיטת התרגול של ג׳וזף. ה. פילאטיס המבוססת על 34 תרגילים שאסף מעולם היוגה, האקרובטיקה ומחיקוי חיות וילדים ואירגן בסדר מסוים, שמטרתם ליצור הרמוניה בין הגוף לנפש. דרך מקצבי תנועה ידועים מראש וניהול 34 דפוסי נשימה, הגוף מגיע למצב אופטימאלי תפקודי, מתחזק, מתגמש, מקבל אנרגיה ומשתחרר ממכאובים. תוכלו למצוא כאן פרשנויות שונות שלי לשיטה, דקויות ייחודיות וכיווני הסבר לאלו ממכם שרוצים להעמיק הן בתנועה, בהבנת השיטה, באנטומיה וחקר הגוף",
      levels: ["advanced", "intermediate", "beginner", "all"],
      levelHebrew: "מתקדמים, בינוני, מתחילים, הכל",
      category: "technique",
      subCategory: "flystick",
      order: 1,
      isVisible: true,
      image: "https://images.unsplash.com/photo-1682685794690-dea7c8847a50?q=80&w=2671&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
  "אביזרים": {
    description: "כאן תמצאו שיעורי גליל, כדור, צלחות ועוד.",
    level: "beginner",
    levelHebrew: "מתחילים",
    category: "equipment",
    order: 2,
    isVisible: true
  },
  "אימוני קיר": {
    description: "שיעורי כח וגמישות בעזרת הקיר בבית.",
    level: "intermediate",
    levelHebrew: "בינוני",
    category: "technique",
    order: 3,
    isVisible: true
  },
  "הריון ולידה": {
    description: "שיעורים והרצאות חשובים לכל השלבים בזמן הריון ולידה.",
    level: "all",
    levelHebrew: "כל הרמות",
    category: "special",
    order: 4,
    isVisible: true
  },
  "הרצאות סדנאות והשתלמויות": {
    description: "עולם של תוכן חכם וחשוב לכל אדם בנושאים שונים ומגוונים הקשורים להבנת הגוף וחשיבות התנועה בחייו של אדם.",
    level: "all",
    levelHebrew: "כל הרמות",
    category: "education",
    order: 5,
    isVisible: true
  },
  "לימודי תודעה": {
    description: "פרקים נבחרים של תובנות התבוננות וחקירה עצמית מוגשים לכם כדי להבין טוב את יותר את המציאות בה אנו חיים.",
    level: "all",
    levelHebrew: "כל הרמות",
    category: "mindfulness",
    order: 6,
    isVisible: true
  },
  "סטרונג-מובילי (פילאטיס מתקדמים)": {
    description: "תרגולי זרימה מתקדמים ועשירים בדרגת כח וגמישות גבוהים.",
    level: "advanced",
    levelHebrew: "מתקדמים",
    category: "technique",
    order: 7,
    isVisible: true
  },
  "פילאטיס-לייט (פילאטיס לימודי)": {
    description: "כאן תמצאו ׳שיעורי פתיחה׳ בהם אני פותח בהסבר מדויק על הנושא הנבחר.",
    level: "beginner",
    levelHebrew: "מתחילים",
    category: "technique",
    order: 8,
    isVisible: true
  },
    "פילאטיס מכשירים": {
    description: "שיעורים מטכניקת ה׳רפומר-פלו׳ המוגשת עד היום ברחבי הארץ.",
    level: "intermediate",
    levelHebrew: "בינוני",
    category: "equipment",
    order: 9,
    isVisible: true
  },
  "פלייסטיק-Flystick": {
    description: "שיטה מרהיבה המחברת בין רקמות הגוף ורכבות האנטומיה הטבעיות בעזרת מקל.",
    level: "advanced",
    levelHebrew: "מתקדמים",
    category: "technique",
    subCategory: "flystick",
    order: 10,
    isVisible: true
  },
  "קוויקיז Quickies": {
    description: "שיעורים קצרים בזמן המתאימים לרגע של תנועה ושחרור הגוף.",
    level: "all",
    levelHebrew: "כל הרמות",
    category: "quick",
    order: 11,
    isVisible: true
  },
  "קורס מורות\\ים קונטרולוג׳י": {
    description: "מאגר שיעורים במסגרת הכשרה של קורס המורות מורים שלי ה׳קונטרולוג׳י׳.",
    level: "advanced",
    levelHebrew: "מתקדמים",
    category: "education",
    order: 12,
    isVisible: true
  },
  "שיעורי כסא מרפאים": {
    description: "שיעורים המתמקדים בעמוד השדרה, במערכת הנשימה, באנרגית החיוניות של הגוף.",
    level: "all",
    levelHebrew: "כל הרמות",
    category: "therapy",
    order: 13,
    isVisible: true
  },
  "Flystick English classes- public": {
    description: "תכנים חדשים בFlystick English classes- public",
    level: "advanced",
    levelHebrew: "מתקדמים",
    category: "new",
    order: 999,
    isVisible: true
  }
,
  "My library": {
    description: "תכנים חדשים בMy library",
    level: "all",
    levelHebrew: "כל הרמות",
    category: "new",
    order: 999,
    isVisible: false
  }
};

// Sub-category definitions for each main category
export const subCategories: Record<string, { key: string; hebrew: string }[]> = {
  technique: [
    { key: 'mat', hebrew: 'מזרן' },
    { key: 'apparatus', hebrew: 'מכשירים' },
    { key: 'flystick', hebrew: 'פלייסטיק' },
    { key: 'basics', hebrew: 'יסודות' }
  ],
  equipment: [
    { key: 'ball', hebrew: 'כדור' },
    { key: 'bands', hebrew: 'רצועות' },
    { key: 'weights', hebrew: 'משקולות' },
    { key: 'props', hebrew: 'אביזרים נוספים' }
  ],
  education: [
    { key: 'theory', hebrew: 'תיאוריה' },
    { key: 'anatomy', hebrew: 'אנטומיה' },
    { key: 'workshops', hebrew: 'סדנאות' },
    { key: 'courses', hebrew: 'קורסים' }
  ],
  therapy: [
    { key: 'back', hebrew: 'גב' },
    { key: 'legs', hebrew: 'רגלים' },
    { key: 'arms', hebrew: 'ידיים' },
    { key: 'core', hebrew: 'בטן וליבה' },
    { key: 'neck', hebrew: 'צוואר' }
  ],
  special: [
    { key: 'pregnancy', hebrew: 'הריון' },
    { key: 'seniors', hebrew: 'גיל הזהב' },
    { key: 'rehabilitation', hebrew: 'שיקום' },
    { key: 'chair', hebrew: 'כסא' }
  ],
  mindfulness: [
    { key: 'meditation', hebrew: 'מדיטציה' },
    { key: 'breathing', hebrew: 'נשימה' },
    { key: 'relaxation', hebrew: 'הרפיה' },
    { key: 'awareness', hebrew: 'מודעות' }
  ],
  quick: [
    { key: 'morning', hebrew: 'בוקר' },
    { key: 'break', hebrew: 'הפסקה' },
    { key: 'evening', hebrew: 'ערב' },
    { key: 'targeted', hebrew: 'ממוקד' }
  ],
  new: [
    { key: 'recent', hebrew: 'חדש' },
    { key: 'featured', hebrew: 'מומלץ' },
    { key: 'popular', hebrew: 'פופולרי' }
  ]
};

// Helper function to get all levels for a folder (supports both single level and multiple levels)
export const getFolderLevels = (metadata: FolderMetadata): string[] => {
  if (metadata.levels && metadata.levels.length > 0) {
    return metadata.levels;
  }
  if (metadata.level) {
    return [metadata.level];
  }
  return ['all']; // fallback
};

// Helper function to check if a folder matches a specific level
export const folderMatchesLevel = (metadata: FolderMetadata, targetLevel: string): boolean => {
  if (targetLevel === 'all') return true;
  const folderLevels = getFolderLevels(metadata);
  return folderLevels.includes(targetLevel as any);
};

// Helper function to get metadata for any folder (with fallback for new folders)
export const getFolderMetadata = (folderName: string): FolderMetadata => {
  if (folderMetadata[folderName]) {
    return folderMetadata[folderName];
  }
  
  // Fallback metadata for folders not in the config
  const fallbackMetadata: FolderMetadata = {
    description: 'תכנים חדשים',
    level: 'all',
    levelHebrew: 'כל הרמות',
    category: 'new',
    subCategory: 'recent',
    order: 999,
    isNew: true,
    isVisible: true
  };
  return fallbackMetadata;
};

// Helper function to get level color for badges
export const getLevelColor = (level: string): string => {
  switch (level) {
    case 'beginner':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'advanced':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'all':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Helper function to get all unique levels for filtering
export const getAllLevels = (): Array<{key: string, hebrew: string}> => {
  return [
    { key: 'all', hebrew: 'הכל' },
    { key: 'beginner', hebrew: 'מתחילים' },
    { key: 'intermediate', hebrew: 'בינוני' },
    { key: 'advanced', hebrew: 'מתקדמים' }
  ];
};
