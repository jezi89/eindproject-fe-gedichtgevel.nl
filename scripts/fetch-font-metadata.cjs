
const fs = require('fs');
const path = require('path');
const https = require('https');

// List of fonts from useFontManager.js
const fonts = [
    'Merriweather', 'Lora', 'Playfair Display', 'Cormorant Garamond', 'EB Garamond',
    'Libre Baskerville', 'Noto Serif', 'PT Serif', 'Crimson Text', 'Vollkorn',
    'Lato', 'Montserrat', 'Raleway', 'Roboto', 'Open Sans', 'Source Sans Pro',
    'Nunito', 'Work Sans', 'Poppins', 'Oswald',
    'Arvo', 'Roboto Slab', 'Zilla Slab', 'Bitter', 'Crete Round', 'Patua One',
    'Ultra', 'Josefin Slab', 'Enriqueta', 'Antic Slab',
    'Lobster', 'Abril Fatface', 'Anton', 'Bebas Neue', 'Alfa Slab One',
    'Special Elite', 'Uncial Antiqua', 'Cinzel', 'Sacramento', 'Pacifico',
    'Inconsolata', 'Source Code Pro', 'Space Mono', 'Anonymous Pro', 'Cutive Mono'
];

// Non-Google fonts to manually define
const manualFonts = {
    'Quilty': ['400'], // Assuming regular only or standard weights
    'Arial': ['400', '700'],
    'Verdana': ['400', '700'],
    'Georgia': ['400', '700'],
    'Times New Roman': ['400', '700']
};

const OUTPUT_FILE = path.join(__dirname, '../src/data/font-metadata.json');

// Helper to fetch URL content
function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function fetchFontMetadata() {
    const metadata = { ...manualFonts };
    
    console.log(`Fetching metadata for ${fonts.length} Google Fonts...`);
    
    for (const font of fonts) {
        try {
            // Request all possible weights to see what's returned
            // We request a wide range. Google usually returns what's available or closest.
            // Actually, a better trick is to request a range or specific list.
            // If we request 100;200;...;900, the CSS will contain @font-face rules for available ones.
            const family = font.replace(/ /g, '+');
            const url = `https://fonts.googleapis.com/css2?family=${family}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
            
            const css = await fetchUrl(url);
            
            // Parse unique font-weights from CSS
            const weightMatches = css.match(/font-weight:\s*(\d+);/g);
            
            if (weightMatches) {
                const weights = [...new Set(weightMatches.map(w => w.match(/\d+/)[0]))].sort();
                metadata[font] = weights;
                console.log(`✅ ${font}: [${weights.join(', ')}]`);
            } else {
                console.warn(`⚠️ ${font}: No weights found in CSS. Defaulting to 400.`);
                metadata[font] = ['400'];
            }
            
            // Be nice to the API
            await new Promise(r => setTimeout(r, 100));
            
        } catch (error) {
            console.error(`❌ ${font}: Failed to fetch (${error.message})`);
            metadata[font] = ['400']; // Fallback
        }
    }
    
    // Ensure directory exists
    const dir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(metadata, null, 2));
    console.log(`\nSaved font metadata to ${OUTPUT_FILE}`);
}

fetchFontMetadata();
