#!/usr/bin/env node

/**
 * Automated Stylelint Fixer
 *
 * This script automatically fixes common stylelint violations by:
 * 1. Adding @use '@styles/variables' as vars; if variables are used
 * 2. Replacing common hardcoded colors with design tokens
 * 3. Converting px units to rem where appropriate
 */

const fs = require('fs');
const path = require('path');

// Common color replacements
const COLOR_REPLACEMENTS = {
  '#ffffff': 'vars.$neutral-white',
  '#fff': 'vars.$neutral-white',
  'white': 'vars.$neutral-white',
  '#000000': 'vars.$neutral-black',
  '#000': 'vars.$neutral-black',
  'black': 'vars.$neutral-black',
  '#f9f4ed': 'vars.$neutral-off-white',
  '#fff5e1': 'vars.$neutral-cream',
  '#efefef': 'vars.$neutral-light',
  '#ccc': 'vars.$border-subtle',
  '#cccccc': 'vars.$border-subtle',
  '#f0f0f0': 'vars.$neutral-light',
  '#943512': 'vars.$primary-cognac',
  '#e35712': 'vars.$primary-flame',
  '#156064': 'vars.$secondary-carribean-current',
  '#d09a47': 'vars.$accent-gold',
};

// Px to rem conversion (16px base)
const PX_TO_REM = {
  '12px': '0.75rem',
  '14px': '0.875rem',
  '15px': '0.9375rem',
  '16px': '1rem',
  '18px': '1.125rem',
  '20px': '1.25rem',
  '24px': '1.5rem',
  '32px': '2rem',
  '36px': '2.25rem',
  '48px': '3rem',
};

function ensureUseStatement(content) {
  const usePattern = /@use\s+['"]@styles\/variables['"]\s+as\s+vars;/;
  const hasVariables = /vars\.\$/.test(content);
  const hasUseStatement = usePattern.test(content);

  if (hasVariables && !hasUseStatement) {
    // Add @use statement at the top, after any existing @use statements
    const lines = content.split('\n');
    let insertIndex = 0;

    // Find last @use statement or first non-comment line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('@use')) {
        insertIndex = i + 1;
      } else if (line && !line.startsWith('//') && !line.startsWith('/*') && insertIndex === 0) {
        insertIndex = i;
        break;
      }
    }

    lines.splice(insertIndex, 0, "@use '@styles/variables' as vars;", '');
    return lines.join('\n');
  }

  return content;
}

function replaceColors(content) {
  let modified = content;

  for (const [oldColor, newColor] of Object.entries(COLOR_REPLACEMENTS)) {
    // Match color in various contexts
    const patterns = [
      new RegExp(`(color|background-color|border-color):\\s*${oldColor}`, 'gi'),
      new RegExp(`background:\\s*${oldColor}`, 'gi'),
      new RegExp(`border:\\s*([^;]+)\\s+${oldColor}`, 'gi'),
    ];

    patterns.forEach(pattern => {
      modified = modified.replace(pattern, (match) => {
        return match.replace(new RegExp(oldColor, 'gi'), newColor);
      });
    });
  }

  return modified;
}

function convertPxToRem(content) {
  let modified = content;

  // Only convert font-size px values
  for (const [px, rem] of Object.entries(PX_TO_REM)) {
    const pattern = new RegExp(`(font-size:\\s*)${px}`, 'gi');
    modified = modified.replace(pattern, `$1${rem}`);
  }

  return modified;
}

function processFile(filePath) {
  console.log(`Processing: ${filePath}`);

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Step 1: Replace colors
  const afterColors = replaceColors(content);
  if (afterColors !== content) {
    content = afterColors;
    modified = true;
  }

  // Step 2: Convert px to rem for font-size
  const afterPx = convertPxToRem(content);
  if (afterPx !== content) {
    content = afterPx;
    modified = true;
  }

  // Step 3: Ensure @use statement if needed
  const afterUse = ensureUseStatement(content);
  if (afterUse !== content) {
    content = afterUse;
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✓ Fixed`);
    return 1;
  } else {
    console.log(`  - No changes needed`);
    return 0;
  }
}

// Recursive file finder
function getAllScssFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllScssFiles(filePath, fileList);
    } else if (file.endsWith('.scss') || file.endsWith('.css')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Main execution
const srcDir = path.join(__dirname, '..', 'src');
const allFiles = getAllScssFiles(srcDir);

// Filter out ignored files
const ignoredFiles = [
  '_variables.scss',
  '_reset.scss',
  '_mixins.scss',
  '_module-template.scss'
];

const files = allFiles.filter(file => {
  const basename = path.basename(file);
  return !ignoredFiles.includes(basename);
});

console.log(`Found ${files.length} files to process\n`);

let fixedCount = 0;
files.forEach(file => {
  fixedCount += processFile(file);
});

console.log(`\n✓ Done! Fixed ${fixedCount} files.`);
console.log(`Run 'pnpm run lint:css' to verify remaining errors.`);
