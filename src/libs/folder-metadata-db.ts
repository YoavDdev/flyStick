import { getFolderMetadata as getStaticFolderMetadata, subCategories as staticSubCategories } from '@/config/folder-metadata';
import type { FolderMetadata } from '@/config/folder-metadata';

/**
 * CLIENT-SAFE HELPER FUNCTIONS
 * These functions work with data passed to them and do not make direct database calls
 * All database operations should be done via API endpoints
 */

/**
 * Helper function to get folder levels (supports both level and levels properties)
 */
export const getFolderLevels = (metadata: FolderMetadata): string[] => {
  if (metadata.levels && metadata.levels.length > 0) {
    return metadata.levels;
  }
  if (metadata.level) {
    return [metadata.level];
  }
  return ['all']; // fallback
};

/**
 * Helper function to check if a folder matches a specific level
 */
export const folderMatchesLevel = (metadata: FolderMetadata, targetLevel: string): boolean => {
  if (targetLevel === 'all') return true;
  const folderLevels = getFolderLevels(metadata);
  return folderLevels.includes(targetLevel as any);
};

/**
 * Helper function to get all unique levels for filtering
 */
export const getAllLevels = (): Array<{key: string, hebrew: string}> => {
  return [
    { key: 'all', hebrew: 'הכל' },
    { key: 'beginner', hebrew: 'מתחילים' },
    { key: 'intermediate', hebrew: 'בינוני' },
    { key: 'advanced', hebrew: 'מתקדמים' }
  ];
};

/**
 * Helper function to get level color for badges
 */
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

/**
 * Helper function to get subcategories for each main category
 */
export const getSubCategories = (): Record<string, { key: string; hebrew: string }[]> => {
  // Currently using static subcategories, but this could be extended to fetch from DB in the future
  return staticSubCategories;
};
