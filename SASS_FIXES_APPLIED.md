# SASS Deprecation Fixes Applied

## Summary of Changes

### 1. **_mixins.scss**
- Added `@use` statements for sass modules:
  - `@use "sass:color"`
  - `@use "sass:map"`
  - `@use "sass:math"`
- Updated functions:
  - `map-get()` → `map.get()`
  - `adjust-color()` → `color.adjust()`
  - `rgba($var, 0.5)` → `color.change($var, $alpha: 0.5)`

### 2. **NavBar.module.scss**
- Added `@use "sass:color"`
- Updated:
  - `rgba($navbar-text-active, 0.1)` → `color.change($navbar-text-active, $alpha: 0.1)`

## Functions Updated

| Old Function | New Function |
|-------------|--------------|
| `map-get($map, $key)` | `map.get($map, $key)` |
| `adjust-color($color, $lightness: -5%)` | `color.adjust($color, $lightness: -5%)` |
| `rgba($color-var, 0.5)` | `color.change($color-var, $alpha: 0.5)` |
| `lighten($color, 10%)` | `color.adjust($color, $lightness: 10%)` |
| `darken($color, 10%)` | `color.adjust($color, $lightness: -10%)` |

## Files Still Using Old @import Pattern

The following files still use `@import` which should eventually be migrated to `@use`:
- `src/styles/app.scss`
- `src/styles/_layout.scss`
- `src/styles/_typography.scss`
- Other component SCSS files

## Note on rgba()

- `rgba(0, 0, 0, 0.5)` with literal values is OK - no change needed
- `rgba($variable, 0.5)` with variables needs to be `color.change($variable, $alpha: 0.5)`

## Testing

Run `pnpm run dev` and check for any remaining deprecation warnings in the console.