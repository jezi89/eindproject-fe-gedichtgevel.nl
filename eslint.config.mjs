// Importeer alle benodigde ESLint plugins en configuraties
import js from '@eslint/js';                      // Basis JavaScript linting regels
import globals from 'globals';                    // Globale variabelen definities voor verschillende omgevingen
import reactPlugin from 'eslint-plugin-react';    // React-specifieke linting regels
import reactHooks from 'eslint-plugin-react-hooks'; // Regels voor correcte React hooks
import reactRefresh from 'eslint-plugin-react-refresh'; // Voor correcte HMR met React
import jsxA11y from 'eslint-plugin-jsx-a11y';     // Toegankelijkheidsregels voor JSX
import importPlugin from 'eslint-plugin-import';  // Import statement validatie


// Basisregels voor React componenten en JSX
const reactRules = {
    // Schakel prop-types validatie uit aangezien veel moderne projecten dit niet gebruiken
    'react/prop-types': 'off',

    // Schakel verouderde React import regels uit voor moderne React (React 17+)
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',

    // Waarschuw bij gebruik van verouderde React APIs
    'react/no-deprecated': 'warn',

    // Key prop is essentieel voor lists in React
    'react/jsx-key': 'warn',

    // Voorkom dubbele props in JSX elementen
    'react/jsx-no-duplicate-props': 'error',

    // Controleer op niet gedefinieerde variabelen in JSX
    'react/jsx-no-undef': 'error',

    // Voorkom directe state mutaties (anti-pattern in React)
    'react/no-direct-mutation-state': 'error',

    // Controleer op ongeldige properties in DOM elementen
    'react/no-unknown-property': 'error',

    // Voorkom dat false, 0, of '' wordt gerenderd in JSX (React 19 features)
    'react/jsx-no-leaked-render': 'warn',

    // Voorkom onnodige React.Fragment wrappers
    'react/jsx-no-useless-fragment': 'warn',

    // Waarschuw bij definiëren van componenten binnen andere componenten
    'react/no-unstable-nested-components': 'warn',

    // Bevorder correcte naamgeving van useState variabelen
    'react/hook-use-state': 'warn'
};

// Import statement validatie regels
const importRules = {
    // Controleer dat geïmporteerde modules bestaan
    'import/no-unresolved': 'error',

    // Controleer dat named imports bestaan in geïmporteerde module
    'import/named': 'error',

    // Controleer dat default imports bestaan in geïmporteerde module
    'import/default': 'error',

    // Controleer dat namespace imports (import * as x) bestaan
    'import/namespace': 'error',

    // Voorkom absolute paden in imports (Vite-specifieke optimalisatie)
    'import/no-absolute-path': 'error'
};

/**
 ♦ Toegankelijkheidsregels voor JSX (a11y) ♦
 ◇────────────────────────────────────────────────◇
 */

const jsxA11yRules = {

    // Interactie-toegankelijkheid regels
    'jsx-a11y/click-events-have-key-events': 'warn',     // Zorgt dat onClick elementen ook keyboardtoegankelijk zijn
    'jsx-a11y/no-noninteractive-element-interactions': 'warn', // Voorkomt dat niet-interactieve elementen events afhandelen
    'jsx-a11y/interactive-supports-focus': 'warn',       // Zorgt dat interactieve elementen focusbaar zijn
    'jsx-a11y/tabindex-no-positive': 'warn',            // Voorkomt positieve tabindex waarden

    // Semantische regels
    'jsx-a11y/no-distracting-elements': 'warn',         // Voorkomt elementen die afleidend kunnen zijn (marquee, blink)
    'jsx-a11y/scope': 'warn',                           // Controleert dat scope alleen op th elementen wordt gebruikt

    // ARIA regels
    'jsx-a11y/aria-props': 'warn',                      // Valideer ARIA attributen
    'jsx-a11y/aria-role': 'warn',                       // Valideert ARIA roles
    'jsx-a11y/aria-unsupported-elements': 'warn',       // Controleert op ARIA attributen op ongepaste elementen
    'jsx-a11y/no-redundant-roles': 'warn',              // Voorkomt redundante ARIA roles


    // Formulier regels
    'jsx-a11y/label-has-associated-control': 'warn',    // Zorgt dat labels gekoppeld zijn aan formulierelementen
    'jsx-a11y/no-autofocus': 'warn',                    // Waarschuwt bij gebruik van autofocus

    // Afbeelding regels
    'jsx-a11y/alt-text': 'warn',     // Zorg ervoor dat img elementen alt attributes hebben
    'jsx-a11y/img-redundant-alt': 'warn',   // Voorkom redundante alt tekst zoals "afbeelding van..."


// ---◇ Content validatie ◇---

    // Links
    'jsx-a11y/anchor-has-content': 'warn',     // Controleer dat anchors content hebben

    // Koppen
    'jsx-a11y/heading-has-content': 'warn',     // Zorg ervoor dat headers content hebben

// ---◇ Document structuur ◇---

    // HTML-document
    'jsx-a11y/html-has-lang': 'warn',


};

// React Hooks specifieke regels
const reactHooksRules = {
    // Voorkom onregelmatig hook-gebruik (bijv. in condities)
    'react-hooks/rules-of-hooks': 'error',

    // Controleer dependency arrays van hooks zoals useEffect
    'react-hooks/exhaustive-deps': 'warn'
};

// Vite en HMR specifieke regels
const viteRules = {
    // Regel voor Fast Refresh (HMR) in Vite
    'react-refresh/only-export-components': [
        'warn',
        {
            // Sta constante exports toe naast component exports
            allowConstantExport: true,

            // Support voor React Router v7 exports
            allowExportNames: ['meta', 'links', 'loader', 'action']
        }
    ]
};

// De volledige configuratie exporteren als array van config objecten
export default [
    // Globale ignores - deze bestanden/mappen worden volledig overgeslagen
    {ignores: ['dist', 'node_modules', 'build']},

    // Algemene ESLint opties - werken op root niveau
    {
        // Rapporteer ongebruikte eslint-disable comments
        linterOptions: {
            reportUnusedDisableDirectives: 'error',
        }
    },

    // JavaScript aanbevolen regels als basis
    js.configs.recommended,

    // Configuratie voor JavaScript en JSX bestanden
    {
        // Welke bestanden deze regels moeten gebruiken
        files: ['**/*.{js,jsx}'],

        // Taalopties voor JavaScript en JSX
        languageOptions: {
            // Gebruik de nieuwste ECMAScript versie
            ecmaVersion: 'latest',

            // Dit zijn ES modules (import/export syntax)
            sourceType: 'module',

            // Globale variabelen voor browser en Node omgevingen beschikbaar maken
            globals: {
                ...globals.browser,
                ...globals.node
            },

            // Parser opties specifiek voor JSX
            parserOptions: {
                ecmaFeatures: {jsx: true}
            }
        },

        // Activeer alle plugins
        plugins: {
            react: reactPlugin,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            'jsx-a11y': jsxA11y,
            import: importPlugin
        },

        // Combineer alle regelsets
        rules: {
            ...reactRules,
            ...reactHooksRules,
            ...jsxA11yRules,
            ...importRules,
            ...viteRules,

            // Basis JavaScript regels
            'no-unused-vars': 'warn'
        },

        // Extra settings voor plugins
        settings: {
            // Automatisch detecteren welke React versie wordt gebruikt
            react: {version: 'detect'},

            // Configuratie voor import/resolver
            'import/resolver': {
                alias: {
                    map: [
                        ['@', './src']
                    ],
                    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
                },
                node: {
                    // Ondersteunde bestandsextensies voor imports
                    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
                }
            }
        }
    },

    // Basis ondersteuning voor TypeScript bestanden
    // (Zelfs als je nu geen TypeScript gebruikt, is dit handig voor toekomstige uitbreiding)
    {
        files: ['**/*.{ts,tsx}'],
        // Hier kun je TypeScript-specifieke configuraties toevoegen indien nodig
    }
];
