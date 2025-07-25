#!/usr/bin/env node

/**
 * Script to run the TypeScript migration file
 */
const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Running folder metadata migration script...');

try {
  // Use ts-node to run the TypeScript migration file
  execSync('npx ts-node scripts/migrate-folder-metadata.ts', {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });
  
  console.log('✅ Migration completed successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
