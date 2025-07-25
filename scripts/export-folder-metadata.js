// Script to export folder metadata to JSON
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Use ts-node to execute a script that exports the metadata
const exportScript = `
import { folderMetadata } from '../src/config/folder-metadata';
console.log(JSON.stringify(folderMetadata, null, 2));
`;

// Write the temporary export script
const tempScriptPath = path.join(__dirname, 'temp-export.ts');
fs.writeFileSync(tempScriptPath, exportScript);

try {
  // Execute the script and capture the output
  const output = execSync(`npx ts-node ${tempScriptPath}`, { 
    encoding: 'utf-8',
    cwd: path.resolve(__dirname, '..')
  });
  
  // Write the output to a JSON file
  const jsonPath = path.join(__dirname, 'folder-metadata.json');
  fs.writeFileSync(jsonPath, output);
  
  console.log(`✅ Successfully exported folder metadata to ${jsonPath}`);
} catch (error) {
  console.error('❌ Failed to export folder metadata:', error.message);
  process.exit(1);
} finally {
  // Clean up the temporary script
  fs.unlinkSync(tempScriptPath);
}
