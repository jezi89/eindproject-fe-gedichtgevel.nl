const fs = require('fs');
const path = require('path');

const DUTCH_WORDS = new Set([
  'de', 'het', 'een', 'en', 'is', 'van', 'op', 'te', 'zijn', 'er', 'niet', 'dat', 'ik', 'je', 'we', 'ze', 'hij', 'hem', 'haar', 'dit', 'dat', 'die', 'deze',
  'maar', 'met', 'voor', 'als', 'aan', 'om', 'ook', 'nog', 'bij', 'of', 'door', 'over', 'al', 'zo', 'dan', 'nu', 'naar', 'uit', 'zelf', 'wel', 'ja', 'nee',
  'misschien', 'worden', 'kunnen', 'moeten', 'willen', 'doen', 'zien', 'kijken', 'horen', 'luisteren', 'zeggen', 'vragen', 'antwoorden', 'geven', 'nemen',
  'gebruiken', 'maken', 'laten', 'gaan', 'komen', 'blijven', 'staan', 'liggen', 'zitten', 'lopen', 'rennen', 'werken', 'spelen', 'leren', 'lezen', 'schrijven',
  'functie', 'variabele', 'klasse', 'object', 'array', 'lijst', 'bestand', 'map', 'project', 'code', 'regel', 'fout', 'probleem', 'oplossing', 'test', 'debug',
  'gebruiker', 'klant', 'naam', 'adres', 'email', 'telefoon', 'datum', 'tijd', 'jaar', 'maand', 'dag', 'uur', 'minuut', 'seconde',
  'belangrijk', 'let', 'op', 'verwijderen', 'toevoegen', 'aanpassen', 'wijzigen', 'update', 'nieuwe', 'oude', 'tijdelijk', 'vast', 'los', 'open', 'dicht',
  'aan', 'uit', 'start', 'stop', 'einde', 'begin', 'klaar', 'bezig', 'wachten', 'laden', 'opslaan', 'zoeken', 'vinden', 'krijgen', 'hebben', 'had', 'heeft',
  'geweest', 'wordt', 'werd', 'zullen', 'zou', 'zouden', 'kan', 'kon', 'konden', 'mag', 'mocht', 'mochten', 'wil', 'wilde', 'wilden', 'moet', 'moest', 'moesten'
]);

const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss'];
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', 'coverage', '.next', '.gemini'];

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        scanDirectory(fullPath);
      }
    } else if (EXTENSIONS.includes(path.extname(file))) {
      checkFile(fullPath);
    }
  });
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Regex for comments: 
  // 1. Single line // ...
  // 2. Multi line /* ... */
  const commentRegex = /\/\/.*|\/\*[\s\S]*?\*\//g;
  
  let match;
  while ((match = commentRegex.exec(content)) !== null) {
    const comment = match[0];
    const cleanComment = comment.replace(/\/\/|\/\*|\*\/|\*/g, '').trim();
    
    if (isDutch(cleanComment)) {
      // Find line number
      const lineNumber = content.substring(0, match.index).split('\n').length;
      console.log(`File: ${filePath}`);
      console.log(`Line: ${lineNumber}`);
      console.log(`Comment: ${comment.trim()}`);
      console.log('---');
    }
  }
}

function isDutch(text) {
  const words = text.toLowerCase().split(/\s+|[.,!?;:"'()\[\]{}]/);
  let dutchWordCount = 0;
  let totalWords = 0;

  for (const word of words) {
    if (word.length > 1) { // Ignore single letters mostly
      totalWords++;
      if (DUTCH_WORDS.has(word)) {
        dutchWordCount++;
      }
    }
  }

  // Heuristic: If more than 20% of words are Dutch common words, or if it contains very specific Dutch words
  if (totalWords > 0 && (dutchWordCount / totalWords > 0.2 || dutchWordCount >= 2)) {
    return true;
  }
  
  return false;
}

console.log('Scanning for Dutch comments...');
scanDirectory(path.join(__dirname, 'src'));
console.log('Scan complete.');
