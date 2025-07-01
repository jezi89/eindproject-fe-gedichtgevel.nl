# Convert-StylesToDesignSystem.ps1
# PowerShell script voor automatische conversie van hardcoded styles naar design system variabelen
# Voor Gedichtgevel.nl project

param(
    [Parameter(Mandatory=$false)]
    [string]$FilePath,
    
    [Parameter(Mandatory=$false)]
    [switch]$AutoReplace = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$Preview = $true
)

# Design system mappings
$ColorMappings = @{
    # Primary Colors
    "#943512" = "vars.`$primary-cognac"
    "#e35712" = "vars.`$primary-flame"
    "#3b1608" = "vars.`$primary-dark"
    "#68270d" = "vars.`$primary-darker"
    "#953813" = "vars.`$primary-muted"
    "#c24919" = "vars.`$primary-light"
    "#e3602b" = "vars.`$primary-lighter"
    
    # Secondary Colors  
    "#156064" = "vars.`$secondary-carribean-current"
    "#061d1e" = "vars.`$secondary-dark"
    "#0f4648" = "vars.`$secondary-muted"
    "#156366" = "vars.`$secondary-light"
    "#1b8083" = "vars.`$secondary-lighter"
    "#219da1" = "vars.`$secondary-vibrant"
    "#29c2c7" = "vars.`$secondary-brightest"
    "#62dbdf" = "vars.`$secondary-pale"
    "#b3edef" = "vars.`$secondary-pastel"
    
    # Neutral Colors
    "#ffffff" = "vars.`$neutral-white"
    "#f9f4ed" = "vars.`$neutral-off-white"
    "#fff5e1" = "vars.`$neutral-cream"
    "#efefef" = "vars.`$neutral-light"
    "#5f6477" = "vars.`$neutral-mid"
    "#dadce2" = "vars.`$neutral-mid-light"
    "#747990" = "vars.`$neutral-mid-dark"
    "#4d5061" = "vars.`$neutral-dark"
    "#2b2d36" = "vars.`$neutral-darker"
    "#a99489" = "vars.`$neutral-warm-grey"
    "#000000" = "vars.`$neutral-black"
    "#141204" = "vars.`$neutral-soft-black"
    "#2b140b" = "vars.`$neutral-rich-black"
    "#C4C4C4" = "vars.`$neutral-grey-figma"
    "#5D3A29" = "vars.`$neutral-dark-brown-figma"
    
    # Accent Colors
    "#d09a47" = "vars.`$accent-gold"
    "#856d61" = "vars.`$accent-brown"
    "#c8e9a0" = "vars.`$accent-sage"
    "#ccd698" = "vars.`$accent-moss"
    "#b2b5c2" = "vars.`$accent-greyish"
    "#E6B17A" = "vars.`$accent-golden-highlight"
    
    # Feedback Colors
    "#28a745" = "vars.`$feedback-success"
    "#ffc107" = "vars.`$feedback-warning"
    "#dc3545" = "vars.`$feedback-error"
    "#17a2b8" = "vars.`$feedback-info"
}

$SpacingMappings = @{
    # Pixel to rem conversions (assuming 16px base)
    "4px" = "vars.`$spacing-xxs"
    "8px" = "vars.`$spacing-xs"
    "12px" = "vars.`$spacing-s"
    "16px" = "vars.`$spacing-m"
    "24px" = "vars.`$spacing-l"
    "32px" = "vars.`$spacing-xl"
    "48px" = "vars.`$spacing-xxl"
    "64px" = "vars.`$spacing-xxxl"
    
    # Rem values
    "0.25rem" = "vars.`$spacing-xxs"
    "0.5rem" = "vars.`$spacing-xs"
    "0.75rem" = "vars.`$spacing-s"
    "1rem" = "vars.`$spacing-m"
    "1.5rem" = "vars.`$spacing-l"
    "2rem" = "vars.`$spacing-xl"
    "3rem" = "vars.`$spacing-xxl"
    "4rem" = "vars.`$spacing-xxxl"
}

$FontSizeMappings = @{
    "12px" = "vars.`$font-size-xxxs"
    "14px" = "vars.`$font-size-xxs"
    "15px" = "vars.`$font-size-xs"
    "16px" = "vars.`$font-size-s"
    "18px" = "vars.`$font-size-sm-md"
    "20px" = "vars.`$font-size-m"
    "24px" = "vars.`$font-size-l"
    "32px" = "vars.`$font-size-xl"
    "36px" = "vars.`$font-size-xxl"
    "48px" = "vars.`$font-size-xxxl"
    "64px" = "vars.`$font-size-4xl"
    "80px" = "vars.`$font-size-5xl"
    
    # Rem values
    "0.75rem" = "vars.`$font-size-xxxs"
    "0.875rem" = "vars.`$font-size-xxs"
    "0.9375rem" = "vars.`$font-size-xs"
    "1rem" = "vars.`$font-size-s"
    "1.125rem" = "vars.`$font-size-sm-md"
    "1.25rem" = "vars.`$font-size-m"
    "1.5rem" = "vars.`$font-size-l"
    "2rem" = "vars.`$font-size-xl"
    "2.25rem" = "vars.`$font-size-xxl"
    "3rem" = "vars.`$font-size-xxxl"
    "4rem" = "vars.`$font-size-4xl"
    "5rem" = "vars.`$font-size-5xl"
}

$BorderRadiusMappings = @{
    "4px" = "vars.`$border-radius-sm"
    "8px" = "vars.`$border-radius-md"
    "12px" = "vars.`$border-radius-lg"
    "16px" = "vars.`$border-radius-xl"
    "9999px" = "vars.`$border-radius-pill"
    "50%" = "vars.`$border-radius-pill"
}

function Show-FileSelector {
    Add-Type -AssemblyName System.Windows.Forms
    $fileDialog = New-Object System.Windows.Forms.OpenFileDialog
    $fileDialog.Filter = "SCSS Files (*.scss)|*.scss|CSS Files (*.css)|*.css|All Files (*.*)|*.*"
    $fileDialog.Title = "Selecteer bestand voor style conversie"
    $fileDialog.InitialDirectory = (Get-Location)
    
    if ($fileDialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
        return $fileDialog.FileName
    }
    return $null
}

function Find-StyleMatches {
    param([string]$Content, [hashtable]$Mappings, [string]$Category)
    
    $matches = @()
    foreach ($key in $Mappings.Keys) {
        $escapedKey = [regex]::Escape($key)
        if ($Content -match $escapedKey) {
            $matches += [PSCustomObject]@{
                Category = $Category
                Original = $key
                Replacement = $Mappings[$key]
                Context = ""
            }
        }
    }
    return $matches
}

function Show-PreviewResults {
    param([array]$AllMatches, [string]$FilePath)
    
    Write-Host "`n" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host "  STYLE CONVERSION PREVIEW" -ForegroundColor Yellow  
    Write-Host "  Bestand: $((Split-Path $FilePath -Leaf))" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host ""
    
    if ($AllMatches.Count -eq 0) {
        Write-Host "✅ Geen hardcoded style waarden gevonden!" -ForegroundColor Green
        Write-Host "   Het bestand gebruikt al design system variabelen." -ForegroundColor Green
        return $false
    }
    
    $groupedMatches = $AllMatches | Group-Object Category
    
    foreach ($group in $groupedMatches) {
        Write-Host "📂 $($group.Name)" -ForegroundColor Cyan
        Write-Host "   " + ("─" * 40) -ForegroundColor DarkGray
        
        foreach ($match in $group.Group) {
            Write-Host "   🔄 " -ForegroundColor Yellow -NoNewline
            Write-Host "$($match.Original)" -ForegroundColor Red -NoNewline
            Write-Host " → " -ForegroundColor Yellow -NoNewline  
            Write-Host "$($match.Replacement)" -ForegroundColor Green
        }
        Write-Host ""
    }
    
    Write-Host "📊 Totaal gevonden: $($AllMatches.Count) conversies" -ForegroundColor Magenta
    return $true
}

function Apply-StyleConversions {
    param([string]$Content, [array]$AllMatches)
    
    $updatedContent = $Content
    
    foreach ($match in $AllMatches) {
        $escapedOriginal = [regex]::Escape($match.Original)
        $updatedContent = $updatedContent -replace $escapedOriginal, $match.Replacement
    }
    
    return $updatedContent
}

function Add-DesignSystemImports {
    param([string]$Content)
    
    $hasVarsImport = $Content -match '@use.*variables.*as vars'
    $hasMixinsImport = $Content -match '@use.*mixins.*as mix'
    
    if (-not $hasVarsImport -and -not $hasMixinsImport) {
        $imports = "@use `"@styles/variables`" as vars;`n@use `"@styles/mixins`" as mix;`n`n"
        return $imports + $Content
    } elseif (-not $hasVarsImport) {
        $imports = "@use `"@styles/variables`" as vars;`n"
        return $imports + $Content  
    } elseif (-not $hasMixinsImport) {
        $imports = "@use `"@styles/mixins`" as mix;`n"
        return $imports + $Content
    }
    
    return $Content
}

# Main execution
try {
    Write-Host "🎨 Gedichtgevel.nl Style Conversion Tool" -ForegroundColor Magenta
    Write-Host "════════════════════════════════════════════" -ForegroundColor Magenta
    
    # Get file path
    if (-not $FilePath) {
        $FilePath = Show-FileSelector
        if (-not $FilePath) {
            Write-Host "❌ Geen bestand geselecteerd. Script afgebroken." -ForegroundColor Red
            exit 1
        }
    }
    
    if (-not (Test-Path $FilePath)) {
        Write-Host "❌ Bestand niet gevonden: $FilePath" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "📂 Analyseren bestand: $((Split-Path $FilePath -Leaf))" -ForegroundColor Blue
    
    # Read file content
    $content = Get-Content $FilePath -Raw
    
    # Find all matches
    $allMatches = @()
    $allMatches += Find-StyleMatches $content $ColorMappings "Colors"
    $allMatches += Find-StyleMatches $content $SpacingMappings "Spacing"  
    $allMatches += Find-StyleMatches $content $FontSizeMappings "Typography"
    $allMatches += Find-StyleMatches $content $BorderRadiusMappings "Border Radius"
    
    # Show preview
    if ($Preview) {
        $hasMatches = Show-PreviewResults $allMatches $FilePath
        
        if (-not $hasMatches) {
            exit 0
        }
        
        if (-not $AutoReplace) {
            Write-Host ""
            $response = Read-Host "Wilt u deze wijzigingen toepassen? (y/N)"
            if ($response -ne 'y' -and $response -ne 'Y') {
                Write-Host "❌ Conversie geannuleerd door gebruiker." -ForegroundColor Yellow
                exit 0
            }
        }
    }
    
    # Apply conversions
    if ($allMatches.Count -gt 0) {
        Write-Host "🔄 Conversies toepassen..." -ForegroundColor Blue
        
        $updatedContent = Apply-StyleConversions $content $allMatches
        $updatedContent = Add-DesignSystemImports $updatedContent
        
        # Create backup
        $backupPath = $FilePath + ".backup-" + (Get-Date -Format "yyyyMMdd-HHmmss")
        Copy-Item $FilePath $backupPath
        Write-Host "💾 Backup gemaakt: $((Split-Path $backupPath -Leaf))" -ForegroundColor Gray
        
        # Write updated content
        Set-Content $FilePath $updatedContent -Encoding UTF8
        
        Write-Host ""
        Write-Host "✅ Conversie voltooid!" -ForegroundColor Green
        Write-Host "   📁 Bestand: $((Split-Path $FilePath -Leaf))" -ForegroundColor Green
        Write-Host "   🔄 Conversies: $($allMatches.Count)" -ForegroundColor Green
        Write-Host "   💾 Backup: $((Split-Path $backupPath -Leaf))" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎯 Design system conversie gereed!" -ForegroundColor Magenta