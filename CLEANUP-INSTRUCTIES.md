# 🧹 Git Repository Cleanup Instructies

Dit document beschrijft stap-voor-stap hoe je de repository opschoont om alle AI-tool sporen en onnodige bestanden uit de git geschiedenis te verwijderen, terwijl je PR's en feature branches behoudt.

## ⚠️ Belangrijke Waarschuwingen

- **Dit herschrijft de volledige git geschiedenis**
- **Force push is nodig** - anderen moeten opnieuw clonen
- **Onomkeerbaar proces** - maak backups!
- **Je werkt alleen** aan dit project (bevestigd)

## 📋 Wat wordt verwijderd?

### Bestanden uit geschiedenis:
- `CLAUDE.md`, `GEMINI.md` (AI configuratie)
- `.github/` (CI/CD workflows)
- `DEBUG/`, `Inspect/` (debug artifacts)
- `LEGACY-EMPTY/` (oude code)
- Documentatie: `FRAMER_MOTION_SIMPLIFICATION.md`, `react-architecture-analysis*.md`, `SENTRY_IMPLEMENTATIE.md`, `TESTING_COVERAGE.md`
- Development files: `migrate-scss.js`, `pnpm-workspace.yaml`, `lint-output.txt`, `stats.html`, `vercel.json`
- `.idea/` (IDE config - mag niet ingeleverd volgens eisen)

### Commit messages:
- Referenties naar "claude", "gemini", "AI" worden vervangen
- ".github", "DEBUG", etc. krijgen generieke namen

## 🚀 Stap-voor-Stap Proces

### **Stap 0: Verificatie Shadow Repo** ✅ (KLAAR)

De shadow repo is aangemaakt en gevuld:
- URL: `https://github.com/jezi89/eindproject-fe-gedichtgevel-PRIVATE-DE`
- Status: Private
- Inhoud: Volledige backup inclusief ALLE ignored files

### **Stap 1: Commit Huidige Wijzigingen**

Commit eerst alle unstaged changes:

```powershell
# Check status
git status

# Commit alle wijzigingen
git add .gitignore
git commit -m "refactor: update project configuration and documentation"

# Of stash als je ze niet wilt committen
git stash push -m "Pre-cleanup stash"
```

### **Stap 2: Verwijder Bestanden uit Geschiedenis**

Voer het cleanup script uit:

```powershell
# Voer script uit
.\cleanup-git-history.ps1

# Volg de instructies in het script
# - Typ "ja" om te bevestigen
# - Wacht tot het proces klaar is (kan 1-5 minuten duren)
```

**Wat doet dit script?**
- Maakt automatisch een backup branch
- Verwijdert alle bestanden uit de lijst met `git filter-branch`
- Ruimt oude refs op
- Toont nieuwe repository grootte

### **Stap 3: Herschrijf Commit Messages**

Voer het message cleanup script uit:

```powershell
# Voer script uit
.\cleanup-commit-messages.ps1

# Typ "ja" om te bevestigen
```

**Wat doet dit script?**
- Vervangt AI-tool referenties in commit messages
- Maakt nieuwe backup branch
- Herschrijft alle commit messages

### **Stap 4: Valideer Resultaten**

Controleer of alles correct is:

```powershell
# 1. Check git log (geen CLAUDE/GEMINI referenties)
git log --oneline -20

# 2. Check dat bestanden weg zijn
git ls-tree -r --name-only HEAD | grep -E "CLAUDE|GEMINI|DEBUG|.github"
# (Moet leeg zijn)

# 3. Check repository grootte
du -sh .git
# Of in PowerShell:
(Get-ChildItem .git -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB

# 4. Test de applicatie
pnpm run dev
# Open http://localhost:5173 en test functionaliteit
```

### **Stap 5: Update .gitignore en Commit**

De `.gitignore` is al bijgewerkt. Commit de wijzigingen:

```powershell
git add .gitignore
git commit -m "refactor: update gitignore to exclude development artifacts"
```

### **Stap 6: Force Push naar Remote**

**LET OP: Dit overschrijft de remote geschiedenis!**

```powershell
# Push alle branches
git push origin --force --all

# Push alle tags
git push origin --force --tags
```

### **Stap 7: Verificatie op GitHub**

1. Ga naar: https://github.com/jezi89/eindproject-fe-gedichtgevel.nl
2. Check:
   - ✅ Alle PR's zijn nog zichtbaar (titels + beschrijvingen)
   - ✅ Feature branches zijn nog zichtbaar
   - ✅ CLAUDE.md, GEMINI.md, .github/, DEBUG/ zijn NIET meer zichtbaar
   - ✅ Recent commits tonen geen AI-tool referenties

3. Check commit history:
   ```powershell
   # Bekijk commits in browser
   https://github.com/jezi89/eindproject-fe-gedichtgevel.nl/commits/main
   ```

### **Stap 8: Lokale Cleanup**

Verwijder de cleanup scripts (deze worden niet mee ingeleverd):

```powershell
# Deze bestanden zijn al in .gitignore, dus lokaal laten staan is OK
# Of verwijderen:
Remove-Item cleanup-git-history.ps1
Remove-Item cleanup-commit-messages.ps1
Remove-Item FILES_TO_REMOVE.txt
```

## 📦 Inleverbare ZIP Maken

Na de cleanup kun je een schone ZIP maken:

### Optie A: Handmatig

```powershell
# Maak clean clone
cd ..
git clone https://github.com/jezi89/eindproject-fe-gedichtgevel.nl eindproject-INLEVERING
cd eindproject-INLEVERING

# Verwijder .git (niet mee inleveren)
Remove-Item -Recurse -Force .git

# Installeer dependencies
pnpm install

# Test build
pnpm run build

# Maak ZIP (zonder node_modules)
# Gebruik Windows Explorer: Rechtermuisknop > Send to > Compressed folder
```

### Optie B: Script (nog te maken)

Er komt nog een `create-submission-zip.ps1` script.

## 🔄 Workflow na Cleanup

### Voor Development (thuis op laptop):
```powershell
# Clone shadow repo (met alle AI tools)
git clone git@github.com:jezi89/eindproject-fe-gedichtgevel-PRIVATE-DE.git gedichtgevel-DEV

# Werk met CLAUDE.md, DEBUG/, etc.
# Push naar shadow repo
```

### Voor Inlevering:
```powershell
# Clone public repo (schone versie)
git clone https://github.com/jezi89/eindproject-fe-gedichtgevel.nl eindproject-INLEVERING

# Dit is de schone versie zonder AI sporen
```

## ✅ Checklist Voltooiing

- [ ] Stap 1: Wijzigingen gecommit
- [ ] Stap 2: cleanup-git-history.ps1 uitgevoerd
- [ ] Stap 3: cleanup-commit-messages.ps1 uitgevoerd
- [ ] Stap 4: Validatie geslaagd (app werkt, bestanden weg)
- [ ] Stap 5: .gitignore gecommit
- [ ] Stap 6: Force push naar origin
- [ ] Stap 7: GitHub verificatie OK
- [ ] Stap 8: Lokale cleanup gedaan

## 🆘 Troubleshooting

### "Cannot rewrite branches: You have unstaged changes"
```powershell
git stash push -m "Pre-cleanup"
# Probeer opnieuw
```

### "Force push rejected"
```powershell
# Check of je push rechten hebt
git remote -v

# Force push expliciet
git push origin main --force
```

### "Script execution is disabled"
```powershell
# Voer uit als admin:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Iets ging mis - terugdraaien
```powershell
# Check backup branches
git branch | grep backup

# Keer terug naar laatste backup
git checkout backup-before-cleanup-YYYYMMDD-HHMM

# Of terugkeren naar shadow repo
git remote add shadow-restore git@github.com:jezi89/eindproject-fe-gedichtgevel-PRIVATE-DE.git
git fetch shadow-restore
git reset --hard shadow-restore/main
```

## 📞 Contact

Bij problemen: check de shadow repo backup op:
https://github.com/jezi89/eindproject-fe-gedichtgevel-PRIVATE-DE

Deze bevat de volledige originele staat voor herstel.

---

**Laatste update:** 2025-10-22
**Status:** Klaar voor uitvoering
