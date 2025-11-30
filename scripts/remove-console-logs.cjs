#!/usr/bin/env node

/**
 * Console Log Removal Script
 *
 * Removes console.log, console.debug, console.info, and console.warn statements
 * while preserving console.error for production debugging.
 *
 * Usage:
 *   node scripts/remove-console-logs.cjs           # Dry-run mode
 *   node scripts/remove-console-logs.cjs --execute # Execute changes
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = !process.argv.includes('--execute');
const SRC_DIR = path.join(__dirname, '..', 'src');

// Console methods to remove
const CONSOLE_METHODS_TO_REMOVE = ['log', 'debug', 'info', 'warn'];

// Statistics
const stats = {
  filesScanned: 0,
  filesModified: 0,
  linesRemoved: 0,
  consoleStatementsRemoved: 0,
  changes: []
};

/**
 * Recursively find all files matching extensions
 */
function findFiles(dir, extensions, excludePatterns = []) {
  const files = [];

  function walk(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      const relativePath = path.relative(dir, fullPath);

      // Skip excluded patterns
      if (excludePatterns.some(pattern => relativePath.includes(pattern))) {
        continue;
      }

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }

  walk(dir);
  return files;
}

/**
 * Check if a line contains a console statement to remove
 */
function shouldRemoveLine(line) {
  const trimmed = line.trim();

  // Skip if it's a console.error
  if (trimmed.includes('console.error')) {
    return false;
  }

  // Check for console statements to remove
  return CONSOLE_METHODS_TO_REMOVE.some(method => {
    const pattern = new RegExp(`console\\.${method}\\s*\\(`);
    return pattern.test(trimmed);
  });
}

/**
 * Process a single file
 */
function processFile(filePath) {
  stats.filesScanned++;

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const newLines = [];
  const removedLines = [];

  let inMultiLineConsole = false;
  let multiLineBuffer = '';
  let multiLineStart = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Handle multi-line console statements
    if (inMultiLineConsole) {
      multiLineBuffer += line + '\n';

      // Count parentheses to detect end of statement
      const openParens = (multiLineBuffer.match(/\(/g) || []).length;
      const closeParens = (multiLineBuffer.match(/\)/g) || []).length;

      if (closeParens >= openParens && (trimmed.endsWith(');') || trimmed.endsWith(','))) {
        // Multi-line console statement complete - remove it
        stats.consoleStatementsRemoved++;
        removedLines.push({ lineNum: multiLineStart + 1, content: multiLineBuffer.trim() });

        inMultiLineConsole = false;
        multiLineBuffer = '';
        multiLineStart = -1;
        continue;
      }
      // Still in multi-line, skip this line
      continue;
    }

    // Check if line should be removed
    if (shouldRemoveLine(line)) {
      // Check if it's a complete statement or start of multi-line
      const openParens = (line.match(/\(/g) || []).length;
      const closeParens = (line.match(/\)/g) || []).length;

      if (openParens > closeParens && !trimmed.endsWith(');')) {
        // Start of multi-line console statement
        inMultiLineConsole = true;
        multiLineBuffer = line + '\n';
        multiLineStart = i;
        continue;
      } else {
        // Single-line console statement - remove it
        stats.consoleStatementsRemoved++;
        removedLines.push({ lineNum: i + 1, content: trimmed });
        continue;
      }
    }

    // Keep the line
    newLines.push(line);
  }

  // Check if file was modified
  if (removedLines.length > 0) {
    stats.filesModified++;
    stats.linesRemoved += removedLines.length;

    stats.changes.push({
      file: path.relative(process.cwd(), filePath),
      removed: removedLines
    });

    if (!DRY_RUN) {
      fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    }
  }
}

/**
 * Main execution
 */
function main() {
  console.log('========================================');
  console.log('Console Log Removal Script');
  console.log('========================================');
  console.log(DRY_RUN ? '🔍 DRY RUN MODE (no files will be modified)' : '⚠️  EXECUTE MODE (files will be modified)');
  console.log('');

  // Find all JS/JSX files in src/
  const files = findFiles(SRC_DIR, ['.js', '.jsx'], [
    '.test.js',
    '.test.jsx',
    '.spec.js',
    '.spec.jsx'
  ]);

  console.log(`Found ${files.length} files to scan\n`);

  // Process each file
  files.forEach(processFile);

  // Print results
  console.log('\n========================================');
  console.log('SUMMARY');
  console.log('========================================');
  console.log(`Files scanned: ${stats.filesScanned}`);
  console.log(`Files modified: ${stats.filesModified}`);
  console.log(`Lines removed: ${stats.linesRemoved}`);
  console.log(`Console statements removed: ${stats.consoleStatementsRemoved}`);
  console.log('');

  if (stats.changes.length > 0) {
    console.log('========================================');
    console.log('DETAILED CHANGES');
    console.log('========================================\n');

    stats.changes.forEach(change => {
      console.log(`📄 ${change.file}`);
      change.removed.forEach(item => {
        console.log(`   Line ${item.lineNum}: ${item.content.substring(0, 80)}${item.content.length > 80 ? '...' : ''}`);
      });
      console.log('');
    });
  }

  if (DRY_RUN && stats.filesModified > 0) {
    console.log('========================================');
    console.log('💡 To execute these changes, run:');
    console.log('   node scripts/remove-console-logs.js --execute');
    console.log('========================================');
  }

  if (!DRY_RUN && stats.filesModified > 0) {
    console.log('✅ Files successfully modified!');
    console.log('💡 Remember to test the build: npm run build');
  }
}

main();
