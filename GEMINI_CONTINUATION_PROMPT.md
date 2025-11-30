# Code Cleanup Continuation Prompt for Gemini

## Context
You are continuing a comprehensive code cleanup task for a React/Vite project. The goal is to remove all traces of AI-generated code by cleaning up comments and removing debug statements.

## Current Status
**Branch:** `code-cleanup`
**Backup Branch:** `cleanup-backup`
**Working Directory:** `C:\CODING PROJECTS and WEBSITES\GITHUB JEZI89\NOVI\Eindopdrachten-Clean\eindproject-fe-gedichtgevel.nl`

### Completed Work (14 files, ~650 lines removed)

**Tier 1 (5/5 complete):**
- useCanvasHandlers.js (76 lines)
- testdata.js (4 lines)
- BackgroundImage.jsx (24 lines)
- FloatingPhotoGrid.jsx (48 lines)
- RecordingBook.jsx (partial cleanup)

**Tier 2 (5/5 complete):**
- PoemExpansionControls.jsx (1 line)
- PoemResultItem.jsx (22 lines)
- SearchBar.jsx (33 lines)
- useSupabaseAuth.js (117 lines)
- RecordingBook.jsx (completed - 31 additional lines)

**Tier 3 (4/4 complete):**
- useAutoRecenter.js (199 lines)
- useFavorites.js (15 lines)
- useResponsiveTextPosition.js (7 lines)
- useResponsiveCanvas.js (4 lines)

**Console.log removal:** Automated script removed 93 console statements from 29 files (preserved console.error)

**Build status:** ✅ All builds passing after cleanup

## What Still Needs to Be Done

Continue cleaning up ALL remaining `.js`, `.jsx`, `.ts`, and `.tsx` files in the `src/` directory following the same pattern.

## Cleanup Rules

### What to REMOVE:
1. **All console.log/debug/info/warn** (console.error should stay)
2. **Dutch comments** - translate to English or remove if redundant
3. **Verbose AI-generated explanations** like:
   - "This is the crucial part:"
   - "Why this works:"
   - "Benefits:"
   - "Architecture Overview:"
4. **Personal references** (ij/jij/you/we/I)
5. **Section headers** that are obvious from code structure:
   - "// Initialize state"
   - "// Fetch data on mount"
   - "// Cleanup function"
6. **Inline explanatory comments** that repeat what the code does:
   - `const x = 5; // Set x to 5`
7. **Verbose JSDoc** with multiple paragraphs of explanation
8. **TODOs in Dutch** - translate to English or remove if obsolete
9. **Comments about learning/AI assistance**:
   - "Learning Project - React 19 + PIXI.js Integration"
   - "@author Learning Project"
10. **Fallback comments** like:
    - "// Fallback if not found (shouldn't happen)"
    - "// This shouldn't happen but..."

### What to KEEP:
1. **console.error** statements
2. **JSDoc headers** (but simplify them - max 3 lines)
3. **Function parameter documentation** (simplified):
   ```javascript
   /**
    * Brief description
    * @param {Type} name - Description
    */
   ```
4. **Business logic comments** that explain WHY (not WHAT):
   ```javascript
   // Use exponential backoff to prevent API rate limiting
   ```
5. **Poems in `_variables.scss`** (already reviewed, leave untouched)
6. **Complex algorithm explanations** that add value
7. **License/copyright headers** if present

### Special Instructions for User-Facing Messages:
- Keep functionality but make messages concise:
  - ❌ "All colors will follow the global color setting. This cannot be undone. Continue?"
  - ✅ "Reset 5 color override(s)?"

## File-by-File Approach

**For each file:**
1. Read the entire file
2. Clean up comments following the rules above
3. Commit with descriptive message:
   ```
   Clean up comments in [filename]

   - [specific change 1]
   - [specific change 2]
   - [specific change 3]
   ```
4. Every 5-10 files, run `pnpm run build` to verify nothing broke

## Example Commit Messages

```bash
git commit -m "Clean up comments in CanvasRenderer

- Remove verbose JSDoc header
- Translate Dutch TODO comments to English
- Remove inline explanatory comments
- Simplify parameter documentation"
```

## Testing Strategy

- Run `pnpm run build` every 5-10 files
- If build fails, check the error and fix immediately
- All builds should pass before moving to next batch

## Priority Order for Remaining Files

Start with files that have the most comments (use grep to find them):

```bash
# Find files with many comments
find src -name "*.js" -o -name "*.jsx" | xargs grep -c "^[\s]*(//|/\*)" | sort -t: -k2 -rn
```

**Focus on:**
1. Hook files in `src/hooks/`
2. Component files in `src/components/`
3. Service files in `src/services/`
4. Utility files in `src/utils/`
5. Context files in `src/context/`
6. Page files in `src/pages/`

## Files to SKIP

- `src/styles/_variables.scss` (poems already reviewed)
- `scripts/remove-console-logs.cjs` (utility script)
- `node_modules/` (obviously)
- `dist/` (build output)
- Any `.md` files
- Config files (vite.config.js, etc.)

## Important Notes

1. **Preserve functionality** - only remove comments, never remove actual code
2. **User caught a mistake earlier:** Verbose confirmation dialogs looked like comments but were functional - keep the functionality, just make messages concise
3. **Build frequently** - every 5-10 files to catch issues early
4. **One file per commit** for easy rollback
5. **Dutch to English** - all comments must be in professional English
6. **No emojis** unless explicitly in user-facing strings that already have them

## Example: Before/After

### Before:
```javascript
/**
 * useCanvasHandlers Hook
 *
 * A comprehensive hook that manages all canvas interaction handlers
 * for the PIXI.js poetry design application.
 *
 * Key Features:
 * - Drag-and-drop functionality for moving text
 * - Click-to-select for individual line editing
 * - Color picker integration
 * - Font size adjustments
 *
 * @version 2.0.0
 * @author Learning Project - React 19 + PIXI.js Integration
 */
export function useCanvasHandlers() {
  // Initialize state for tracking selected elements
  const [selectedLine, setSelectedLine] = useState(null);

  // TODO: misschien later implementeren
  // Dit is een belangrijke feature voor versie 2.0
  const handleClick = (e) => {
    // Check if user clicked on a text element
    if (e.target.isText) {
      // Set the clicked line as selected
      setSelectedLine(e.target);
    }
  };
}
```

### After:
```javascript
/**
 * Hook for managing canvas interaction handlers
 */
export function useCanvasHandlers() {
  const [selectedLine, setSelectedLine] = useState(null);

  const handleClick = (e) => {
    if (e.target.isText) {
      setSelectedLine(e.target);
    }
  };
}
```

## When You're Done

1. Run final build: `pnpm run build`
2. Verify all commits are on `code-cleanup` branch
3. Create summary of total lines removed
4. Report back to user

## Recovery Info

If anything goes wrong:
- Backup branch: `cleanup-backup` (clean state before cleanup started)
- Each file has individual commit for easy rollback
- Use `git log --oneline` to see commit history
- Use `git diff HEAD~1` to see last changes

## Current Git Status

```
Branch: code-cleanup
Main branch: main
Recent commits:
- c2e6eb5 Clean up comments in useResponsiveCanvas
- c119aa1 Clean up comments in useResponsiveTextPosition
- 3887eca Clean up comments in useFavorites
- d221588 Clean up comments in useAutoRecenter
- 50a7f2c Clean up comments in RecordingBook
- d9ae460 Clean up comments in useSupabaseAuth
[... 10 more cleanup commits]
```

## Start Here

Begin by running:
```bash
# Find files with most comments to prioritize
grep -r --include="*.js" --include="*.jsx" "^[\s]*(//|/\*)" src/ | cut -d: -f1 | sort | uniq -c | sort -rn | head -20
```

Then start cleaning the files with the most comments first, following the rules above.

Good luck! The codebase cleanup is going well - just continue the pattern established in the first 14 files.
