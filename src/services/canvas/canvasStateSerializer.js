/**
 * Canvas State Serializer
 *
 * Handles serialization and deserialization of canvas state for database storage.
 * Converts useCanvasState data to/from JSONB format for Supabase.
 */

/**
 * Serialize canvas state for database storage
 * @param {Object} canvasState - Full state from useCanvasState
 * @param {Object} poemData - Poem data from canvas
 * @returns {Object} Serialized design settings for JSONB storage
 */
export function serializeCanvasState(canvasState, poemData = null) {
    try {
        const serialized = {
            version: '1.0.0', // For future migrations
            timestamp: Date.now(),

            // Poem positioning
            poemOffset: {
                x: canvasState.poemOffset?.x ?? 170,
                y: canvasState.poemOffset?.y ?? 0
            },

            // Background - normalize string to object if needed
            backgroundImage: (() => {
                if (!canvasState.backgroundImage) return null;

                // If it's a string, convert to object
                if (typeof canvasState.backgroundImage === 'string') {
                    console.warn('⚠️ Serializer: backgroundImage is string, converting to object');
                    return {
                        url: canvasState.backgroundImage,
                        thumbnail: canvasState.backgroundImage,
                        photographer: 'Unknown',
                        source: 'custom',
                        width: null,
                        height: null
                    };
                }

                // It's already an object
                if (canvasState.backgroundImage.url) {
                    return {
                        url: canvasState.backgroundImage.url,
                        thumbnail: canvasState.backgroundImage.thumbnail,
                        alt: canvasState.backgroundImage.alt || null,
                        photographer: canvasState.backgroundImage.photographer,
                        source: canvasState.backgroundImage.source,
                        width: canvasState.backgroundImage.width,
                        height: canvasState.backgroundImage.height
                    };
                }

                return null;
            })(),

            // Global text styling
            textStyles: {
                fontSize: canvasState.fontSize ?? 20,
                fillColor: canvasState.fillColor ?? '#000000',
                letterSpacing: canvasState.letterSpacing ?? 0,
                lineHeight: canvasState.lineHeight ?? 30,
                lineHeightMultiplier: canvasState.lineHeightMultiplier ?? 1.5,
                textAlign: canvasState.textAlign ?? 'center',
                fontWeight: canvasState.fontWeight ?? 'normal',
                fontStyle: canvasState.fontStyle ?? 'normal',
                fontFamily: canvasState.currentFontFamily ?? 'Lato'
            },

            // Per-line overrides
            lineOverrides: canvasState.lineOverrides ?? {},

            // Title/Author color overrides
            titleColorOverride: canvasState.titleColorOverride ?? null,
            authorColorOverride: canvasState.authorColorOverride ?? null,

            // Container-level skew (legacy)
            containerSkew: {
                x: canvasState.skewX ?? 0,
                y: canvasState.skewY ?? 0,
                z: canvasState.skewZ ?? 0
            },

            // 3D transformations per line
            lineTransforms: canvasState.lineTransforms ?? {},

            // Global 3D settings
            global3DSettings: canvasState.global3DSettings ?? {
                perspective: 1000,
                depthSorting: true,
                lightingEnabled: false,
                defaultPivotMode: 'center',
                gevelPreset: 'none',
                globalLighting: {
                    enabled: false,
                    direction: {x: 0, y: 0, z: 1},
                    intensity: 1.0,
                    ambient: 0.3
                },
                material: {
                    blendMode: 'normal'
                }
            },

            // UI preferences
            preferences: {
                isOptimizationEnabled: canvasState.isOptimizationEnabled ?? false,
                moveMode: canvasState.moveMode ?? 'edit'
            },

            // Poem data reference (optional, for quick access)
            poemReference: poemData ? {
                title: poemData.title,
                author: poemData.author,
                lineCount: poemData.lines?.length ?? 0
            } : null
        };

        // Validate serialized data size
        const jsonString = JSON.stringify(serialized);
        const sizeInKB = (jsonString.length / 1024).toFixed(2);

        if (jsonString.length > 1024 * 1024) { // 1MB limit
            console.warn(`⚠️ Serialized canvas state is large: ${sizeInKB}KB`);
        }

        console.log(`✅ Canvas state serialized: ${sizeInKB}KB`);
        return serialized;

    } catch (error) {
        console.error('❌ Failed to serialize canvas state:', error);
        throw new Error('Failed to serialize canvas state for storage');
    }
}

/**
 * Deserialize canvas state from database
 * @param {Object} designSettings - JSONB design_settings from database
 * @returns {Object} Canvas state object ready for useCanvasState
 */
export function deserializeCanvasState(designSettings) {
    try {
        if (!designSettings) {
            throw new Error('No design settings provided');
        }

        // Handle version migrations if needed
        const version = designSettings.version || '1.0.0';

        if (version !== '1.0.0') {
            console.warn(`⚠️ Design uses version ${version}, current is 1.0.0. Migration may be needed.`);
        }

        // Return state object matching useCanvasState structure
        const canvasState = {
            // Poem positioning
            poemOffset: designSettings.poemOffset || {x: 170, y: 0},

            // Background
            backgroundImage: designSettings.backgroundImage || null,

            // Text styles
            fontSize: designSettings.textStyles?.fontSize ?? 20,
            fillColor: designSettings.textStyles?.fillColor ?? '#000000',
            letterSpacing: designSettings.textStyles?.letterSpacing ?? 0,
            lineHeight: designSettings.textStyles?.lineHeight ?? 30,
            lineHeightMultiplier: designSettings.textStyles?.lineHeightMultiplier ?? 1.5,
            textAlign: designSettings.textStyles?.textAlign ?? 'center',
            fontWeight: designSettings.textStyles?.fontWeight ?? 'normal',
            fontStyle: designSettings.textStyles?.fontStyle ?? 'normal',
            currentFontFamily: designSettings.textStyles?.fontFamily ?? 'Lato',

            // Overrides
            lineOverrides: designSettings.lineOverrides || {},
            titleColorOverride: designSettings.titleColorOverride ?? null,
            authorColorOverride: designSettings.authorColorOverride ?? null,

            // Skew
            skewX: designSettings.containerSkew?.x ?? 0,
            skewY: designSettings.containerSkew?.y ?? 0,
            skewZ: designSettings.containerSkew?.z ?? 0,

            // 3D transforms
            lineTransforms: designSettings.lineTransforms || {},
            global3DSettings: designSettings.global3DSettings || {
                perspective: 1000,
                depthSorting: true,
                lightingEnabled: false,
                defaultPivotMode: 'center',
                gevelPreset: 'none',
                globalLighting: {
                    enabled: false,
                    direction: {x: 0, y: 0, z: 1},
                    intensity: 1.0,
                    ambient: 0.3
                },
                material: {
                    blendMode: 'normal'
                }
            },

            // Preferences
            isOptimizationEnabled: designSettings.preferences?.isOptimizationEnabled ?? false,
            moveMode: designSettings.preferences?.moveMode ?? 'edit',

            // Metadata
            _metadata: {
                version: version,
                loadedAt: Date.now(),
                originalTimestamp: designSettings.timestamp
            }
        };

        console.log('✅ Canvas state deserialized successfully');
        return canvasState;

    } catch (error) {
        console.error('❌ Failed to deserialize canvas state:', error);
        throw new Error('Failed to deserialize canvas state from storage');
    }
}

// UNUSED
// /**
//  * Validate canvas state before serialization
//  * @param {Object} canvasState - State to validate
//  * @returns {Object} Validation result with { valid: boolean, errors: string[] }
//  */
// function validateCanvasState(canvasState) {
//     const errors = [];
//
//     // Check required fields
//     if (!canvasState) {
//         errors.push('Canvas state is null or undefined');
//         return { valid: false, errors };
//     }
//
//     // Validate numeric values
//     if (typeof canvasState.fontSize !== 'number' || canvasState.fontSize <= 0) {
//         errors.push('Invalid fontSize value');
//     }
//
//     if (typeof canvasState.lineHeight !== 'number' || canvasState.lineHeight <= 0) {
//         errors.push('Invalid lineHeight value');
//     }
//
//     // Validate color format
//     const colorRegex = /^#[0-9A-Fa-f]{6}$/;
//     if (canvasState.fillColor && !colorRegex.test(canvasState.fillColor)) {
//         errors.push('Invalid fillColor format (should be #RRGGBB)');
//     }
//
//     // Validate poemOffset
//     if (canvasState.poemOffset) {
//         if (typeof canvasState.poemOffset.x !== 'number' || typeof canvasState.poemOffset.y !== 'number') {
//             errors.push('Invalid poemOffset coordinates');
//         }
//     }
//
//     return {
//         valid: errors.length === 0,
//         errors
//     };
// }

// UNUSED
// /**
//  * Create a minimal state object for new designs
//  * @returns {Object} Default canvas state
//  */
// function createDefaultCanvasState() {
//     return {
//         poemOffset: { x: 170, y: 0 },
//         backgroundImage: null,
//         textStyles: {
//             fontSize: 20,
//             fillColor: '#000000',
//             letterSpacing: 0,
//             lineHeight: 30,
//             lineHeightMultiplier: 1.5,
//             textAlign: 'center',
//             fontWeight: 'normal',
//             fontStyle: 'normal',
//             fontFamily: 'Lato'
//         },
//         lineOverrides: {},
//         titleColorOverride: null,
//         authorColorOverride: null,
//         containerSkew: { x: 0, y: 0, z: 0 },
//         lineTransforms: {},
//         global3DSettings: {
//             perspective: 1000,
//             depthSorting: true,
//             lightingEnabled: false,
//             defaultPivotMode: 'center',
//             gevelPreset: 'none',
//             globalLighting: {
//                 enabled: false,
//                 direction: { x: 0, y: 0, z: 1 },
//                 intensity: 1.0,
//                 ambient: 0.3
//             },
//             material: {
//                 blendMode: 'normal'
//             }
//         },
//         preferences: {
//             isOptimizationEnabled: false,
//             moveMode: 'edit'
//         }
//     };
// }

// UNUSED
// /**
//  * Compare two canvas states to detect changes
//  * @param {Object} state1 - First state
//  * @param {Object} state2 - Second state
//  * @returns {boolean} True if states are different
//  */
// function hasCanvasStateChanged(state1, state2) {
//     try {
//         const serialized1 = serializeCanvasState(state1);
//         const serialized2 = serializeCanvasState(state2);
//
//         // Remove timestamps for comparison
//         delete serialized1.timestamp;
//         delete serialized2.timestamp;
//
//         return JSON.stringify(serialized1) !== JSON.stringify(serialized2);
//     } catch (error) {
//         console.warn('Failed to compare canvas states:', error);
//         return true; // Assume changed if comparison fails
//     }
// }
