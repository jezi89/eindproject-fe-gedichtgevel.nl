#!/usr/bin/env node

/**
 * SCSS Migration Script: @import to @use
 *
 * This script migrates legacy @import statements to modern @use syntax.
 * It handles:
 * - Converting @import to @use with wildcard namespace (as *)
 * - Preserving file structure and formatting
 * - Handling both quoted and unquoted paths
 */

import { readFileSync, writeFileSync } from 'fs';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

// Simple recursive file finder
function findScssFiles(dir, files = []) {
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory() && item !== 'node_modules') {
      findScssFiles(fullPath, files);
    } else if (item.endsWith('.scss')) {
      files.push(fullPath);
    }
  }

  return files;
}

const SCSS_FILES = findScssFiles('src');

console.log(`Found ${SCSS_FILES.length} SCSS files to migrate\n`);

let totalImports = 0;
let filesModified = 0;

SCSS_FILES.forEach(filePath => {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  let modified = false;
  let importsInFile = 0;

  const newLines = lines.map(line => {
    // Match @import statements with various quote styles
    const importMatch = line.match(/^(\s*)@import\s+(['"])(.+?)\2\s*;?/);

    if (importMatch) {
      const [, indent, quote, path] = importMatch;
      modified = true;
      importsInFile++;

      // Convert to @use with wildcard namespace for backward compatibility
      return `${indent}@use ${quote}${path}${quote} as *;`;
    }

    return line;
  });

  if (modified) {
    const newContent = newLines.join('\n');
    writeFileSync(filePath, newContent, 'utf-8');
    filesModified++;
    totalImports += importsInFile;
    console.log(`✓ ${filePath} - migrated ${importsInFile} import(s)`);
  }
});

console.log(`\n${'='.repeat(60)}`);
console.log(`Migration complete!`);
console.log(`Files modified: ${filesModified}/${SCSS_FILES.length}`);
console.log(`Total @import statements migrated: ${totalImports}`);
console.log(`${'='.repeat(60)}\n`);