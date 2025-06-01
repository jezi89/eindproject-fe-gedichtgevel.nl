/**
 * PostCSS Configuration for Gedichtgevel.nl
 *
 * Using postcss-preset-env stage 2 for modern CSS features with good browser support
 * and autoprefixer for vendor prefixes
 */

export default {
    plugins: {
        // PostCSS Preset Env - Stage 2 features (stable, good browser support)
        'postcss-preset-env': {
            // Stage 2: Features that are implemented by all major browsers
            stage: 2,

            // Browser targets - matches NFE-33 (93% coverage)
            browsers: 'last 2 versions and > 7%, not dead',

            // Features to enable/disable
            features: {
                // Enable modern CSS features
                'custom-properties': true,
                'color-function': true,
                'custom-media-queries': true,
                'media-query-ranges': true,

                // CSS Nesting (Stage 1, but widely supported)
                'nesting-rules': true,

                // Disable features that might conflict with SCSS
                'custom-selectors': false
            },

            // Don't insert polyfills (we'll handle anchor positioning manually)
            insertBefore: {},
            insertAfter: {}
        },

        // Autoprefixer - adds vendor prefixes based on browserslist
        autoprefixer: {
            // Grid support (for older browsers)
            grid: 'autoplace',

            // Remove outdated prefixes
            remove: true,

            // Add prefixes for these browsers (93% coverage per NFE-33)
            overrideBrowserslist: [
                'last 2 versions and > 7%',
                'not dead',
                'Chrome >= 90',
                'Firefox >= 90',
                'Safari >= 14',
                'Edge >= 90'
            ]
        }
    }
}