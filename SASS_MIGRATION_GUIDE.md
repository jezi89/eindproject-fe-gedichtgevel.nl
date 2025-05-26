# SASS Migration Guide - Fix Deprecation Warnings

## Problem
Dart Sass 3.0.0 will remove global built-in functions. All color manipulation and other built-in functions need to be migrated to use the module system.

## Solution
Add `@use` statements at the top of SCSS files and prefix functions with their namespace.

## Migration Steps

### 1. In each SCSS file that uses built-in functions, add at the top:

```scss
@use "sass:color";
@use "sass:math";
@use "sass:string";
@use "sass:list";
@use "sass:map";
```

### 2. Update function calls:

#### Color Functions
```scss
// OLD
color: lighten($primary-color, 10%);
color: darken($primary-color, 10%);
color: rgba($primary-color, 0.5);
color: mix($color1, $color2, 50%);
color: adjust-hue($primary-color, 45deg);
color: saturate($primary-color, 20%);
color: desaturate($primary-color, 20%);
color: transparentize($primary-color, 0.5);
color: opacify($primary-color, 0.5);

// NEW
color: color.adjust($primary-color, $lightness: 10%);
color: color.adjust($primary-color, $lightness: -10%);
color: color.adjust($primary-color, $alpha: -0.5);
color: color.mix($color1, $color2, 50%);
color: color.adjust($primary-color, $hue: 45deg);
color: color.adjust($primary-color, $saturation: 20%);
color: color.adjust($primary-color, $saturation: -20%);
color: color.adjust($primary-color, $alpha: -0.5);
color: color.adjust($primary-color, $alpha: 0.5);
```

#### Math Functions
```scss
// OLD
width: percentage(0.5);
width: round($number);
width: ceil($number);
width: floor($number);
width: abs($number);

// NEW
width: math.percentage(0.5);
width: math.round($number);
width: math.ceil($number);
width: math.floor($number);
width: math.abs($number);
```

#### String Functions
```scss
// OLD
content: quote($string);
content: unquote($string);
content: str-length($string);

// NEW
content: string.quote($string);
content: string.unquote($string);
content: string.length($string);
```

### 3. For rgba() with color variables:

```scss
// If you have:
background: rgba($neutral-black, 0.5);

// Option 1: Use color.adjust
@use "sass:color";
background: color.adjust($neutral-black, $alpha: -0.5);

// Option 2: Use CSS color-mix (modern browsers)
background: color-mix(in srgb, $neutral-black 50%, transparent);

// Option 3: Use CSS custom properties with opacity
background: $neutral-black;
opacity: 0.5;
```

### 4. Files to Check and Update:

Based on your project structure, check these files:
- `src/styles/_mixins.scss`
- `src/styles/_effects.scss` 
- `src/styles/app.scss`
- `src/layouts/NavBar/NavBar.module.scss`
- `src/components/**/*.scss`
- `src/pages/**/*.scss`

### 5. Example Migration for a Mixin File:

```scss
// OLD _mixins.scss
@mixin button-hover($color) {
  &:hover {
    background-color: lighten($color, 10%);
    border-color: darken($color, 5%);
  }
}

// NEW _mixins.scss
@use "sass:color";

@mixin button-hover($color) {
  &:hover {
    background-color: color.adjust($color, $lightness: 10%);
    border-color: color.adjust($color, $lightness: -5%);
  }
}
```

### 6. Common Patterns in Your Project:

For shadow variables using rgba():
```scss
// OLD
$shadow-light: rgba(0, 0, 0, 0.15);

// NEW - Keep as is! This is a color definition, not a function call
$shadow-light: rgba(0, 0, 0, 0.15); // This is OK

// But when using it with a variable:
// OLD
box-shadow: 0 2px 4px rgba($neutral-black, 0.2);

// NEW
@use "sass:color";
box-shadow: 0 2px 4px color.adjust($neutral-black, $alpha: -0.8);
```

### 7. Quick Fix Script

Run this in your terminal to find all files with deprecated functions:
```bash
grep -r "lighten\|darken\|rgba(\$\|adjust-hue\|saturate\|desaturate\|transparentize\|opacify\|percentage\|round\|ceil\|floor" --include="*.scss" src/
```

## Testing After Migration

1. Run `pnpm run dev` and check for deprecation warnings
2. Verify styles still look correct
3. Test color variations and hover states
4. Check responsive breakpoints

## Additional Resources

- [Sass Module System Documentation](https://sass-lang.com/documentation/at-rules/use)
- [Sass Color Module](https://sass-lang.com/documentation/modules/color)
- [Migration Tool](https://sass-lang.com/documentation/cli/migrator)