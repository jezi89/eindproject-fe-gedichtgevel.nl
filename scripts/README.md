# Style Conversion Scripts

## Convert-StylesToDesignSystem.ps1

PowerShell script voor automatische conversie van hardcoded CSS/SCSS waarden naar design system variabelen.

### Functionaliteit

Het script herkent en converteert:
- **Kleuren**: Hex codes naar design system color tokens
- **Spacing**: Pixel/rem waarden naar spacing variabelen  
- **Typography**: Font sizes naar typography tokens
- **Border Radius**: Pixel waarden naar border radius variabelen

### Gebruik

#### Interactief (met file picker):
```powershell
.\Convert-StylesToDesignSystem.ps1
```

#### Specifiek bestand:
```powershell
.\Convert-StylesToDesignSystem.ps1 -FilePath "src/components/example/Example.module.scss"
```

#### Automatisch toepassen (zonder preview):
```powershell
.\Convert-StylesToDesignSystem.ps1 -FilePath "path/to/file.scss" -AutoReplace
```

#### Alleen preview (geen wijzigingen):
```powershell
.\Convert-StylesToDesignSystem.ps1 -FilePath "path/to/file.scss" -Preview
```

### Parameters

- `-FilePath`: Pad naar het te converteren bestand
- `-AutoReplace`: Automatisch toepassen zonder bevestiging
- `-Preview`: Toon alleen preview van wijzigingen (standaard: true)

### Design System Mappings

#### Kleuren
```scss
// Voor → Na
#943512 → vars.$primary-cognac
#e35712 → vars.$primary-flame
#ffffff → vars.$neutral-white
#efefef → vars.$neutral-light
```

#### Spacing
```scss
// Voor → Na  
4px → vars.$spacing-xxs
8px → vars.$spacing-xs
16px → vars.$spacing-m
24px → vars.$spacing-l
```

#### Typography
```scss
// Voor → Na
12px → vars.$font-size-xxxs
16px → vars.$font-size-s
20px → vars.$font-size-m
24px → vars.$font-size-l
```

#### Border Radius
```scss
// Voor → Na
4px → vars.$border-radius-sm
8px → vars.$border-radius-md
50% → vars.$border-radius-pill
```

### Veiligheid

- **Automatische backup**: Origineel bestand wordt bewaard als `.backup-[timestamp]`
- **Preview modus**: Standaard preview van wijzigingen voor bevestiging
- **Import toevoegen**: Voegt automatisch design system imports toe

### Voorbeeld Output

```
🎨 Gedichtgevel.nl Style Conversion Tool
════════════════════════════════════════════
📂 Analyseren bestand: Example.module.scss

═══════════════════════════════════════════════
  STYLE CONVERSION PREVIEW
  Bestand: Example.module.scss  
═══════════════════════════════════════════════

📂 Colors
   ────────────────────────────────────────
   🔄 #ffffff → vars.$neutral-white
   🔄 #efefef → vars.$neutral-light
   🔄 #943512 → vars.$primary-cognac

📂 Spacing
   ────────────────────────────────────────
   🔄 16px → vars.$spacing-m
   🔄 24px → vars.$spacing-l

📊 Totaal gevonden: 5 conversies

Wilt u deze wijzigingen toepassen? (y/N): y
🔄 Conversies toepassen...
💾 Backup gemaakt: Example.module.scss.backup-20250701-123456

✅ Conversie voltooid!
   📁 Bestand: Example.module.scss
   🔄 Conversies: 5
   💾 Backup: Example.module.scss.backup-20250701-123456

🎯 Design system conversie gereed!
```

### Vereisten

- Windows PowerShell 5.1+ of PowerShell Core 6+
- .NET Framework (voor file picker dialog)

### Tips

1. **Test eerst**: Gebruik preview modus om wijzigingen te controleren
2. **Backup check**: Controleer altijd de backup files
3. **Batch processing**: Run script voor meerdere bestanden via loop
4. **Custom mappings**: Voeg extra mappings toe in script voor project-specifieke waarden