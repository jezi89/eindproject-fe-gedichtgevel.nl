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

        }

        return serialized;

    } catch (error) {

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

        return canvasState;

    } catch (error) {

        throw new Error('Failed to deserialize canvas state from storage');
    }
}
