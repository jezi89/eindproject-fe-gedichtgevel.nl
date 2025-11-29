import { useMemo } from 'react';
import { BlurFilter } from 'pixi.js';
import { DropShadowFilter } from 'pixi-filters';

/**
 * Custom hook to generate PixiJS filters and style properties for text effects.
 * 
 * @param {string} mode - The active text effect mode ('none', 'painted', 'raised', 'engraved').
 * @param {object} params - Parameters for the active effect (opacity, blur, distance, depth).
 * @returns {object} - An object containing { filters, blendMode, alpha }.
 */
export const useTextEffects = (mode, params) => {
    return useMemo(() => {
        if (!mode || mode === 'none') {
            return { style: {}, blendMode: 'normal', alpha: 1 };
        }

        const effectParams = params || {};

        if (mode === 'painted') {
            return {
                style: {
                    filters: [new BlurFilter(effectParams.blur || 0)],
                },
                blendMode: 'multiply',
                alpha: effectParams.opacity || 0.8
            };
        }

        if (mode === 'raised') {
            return {
                style: {
                    filters: [new DropShadowFilter({
                        distance: effectParams.distance || 6,
                        blur: 2, // Sharper shadow for more "pop"
                        alpha: 0.8, // Darker shadow
                        rotation: 45,
                        color: 0x000000
                    })]
                },
                blendMode: 'normal',
                alpha: 1
            };
        }

        if (mode === 'engraved') {
            const depth = effectParams.depth || 2;
            const shadow = new DropShadowFilter({
                distance: depth,
                blur: 1,
                alpha: 0.9, // Strong inner shadow
                rotation: 225, // Top-Left (Shadow)
                color: 0x000000
            });
            
            const highlight = new DropShadowFilter({
                distance: depth,
                blur: 2, // Softer highlight
                alpha: 0.3, // Much more subtle highlight (was 0.8)
                rotation: 45, // Bottom-Right (Highlight)
                color: 0xffffff
            });

            return {
                style: {
                    filters: [shadow, highlight]
                },
                blendMode: 'normal',
                alpha: 1
            };
        }

        return { style: {}, blendMode: 'normal', alpha: 1 };
    }, [mode, params]);
};
