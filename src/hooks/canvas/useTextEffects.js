import { useMemo, useState, useEffect } from 'react';
import { Assets, BlurFilter, DisplacementFilter, Sprite } from 'pixi.js';
import { DropShadowFilter } from 'pixi-filters';
// Registreert 'overlay', 'soft-light', 'hard-light' e.d. als geldige blendMode-waarden (PixiJS v8)
import 'pixi.js/advanced-blend-modes';

// Muurtextuur die als displacement-map dient: de grijswaarden (voegen, barsten)
// verschuiven pixels van de letters zodat ze het oppervlak lijken te volgen.
const DISPLACEMENT_MAP_URL = '/textures/webp/cracked_concrete_wall_diff_2k.webp';

/**
 * Custom hook to generate PixiJS filters and style properties for text effects.
 *
 * @param {string} mode - The active text effect mode ('none', 'muurverf', 'painted', 'raised', 'engraved').
 * @param {object} params - Parameters for the active effect (opacity, blur, distance, depth, blendMode, displacement).
 * @returns {object} - An object containing { filters, blendMode, alpha }.
 */
export const useTextEffects = (mode, params) => {
    // Displacement-map wordt async geladen zodra het muurverf-effect erom vraagt
    const needsDisplacement = mode === 'muurverf' && (params?.displacement || 0) > 0;
    const [displacementTexture, setDisplacementTexture] = useState(null);

    useEffect(() => {
        if (!needsDisplacement || displacementTexture) return;
        let cancelled = false;
        Assets.load(DISPLACEMENT_MAP_URL)
            .then((texture) => {
                if (!cancelled) setDisplacementTexture(texture);
            })
            .catch((err) => console.error('Displacement-map laden mislukt:', err));
        return () => {
            cancelled = true;
        };
    }, [needsDisplacement, displacementTexture]);

    return useMemo(() => {
        if (!mode || mode === 'none') {
            return { filters: [], style: {}, blendMode: 'normal', alpha: 1 };
        }

        const effectParams = params || {};

        if (mode === 'muurverf') {
            // Verf die de muurtextuur "pakt": de blend mode laat voegen en reliëf
            // van de achtergrondfoto door de letters heen schijnen.
            const filters = [];

            const displacement = effectParams.displacement || 0;
            if (displacement > 0 && displacementTexture) {
                const mapSprite = new Sprite(displacementTexture);
                const displacementFilter = new DisplacementFilter({
                    sprite: mapSprite,
                    scale: displacement,
                });
                // Extra ruimte zodat verschoven pixels niet worden afgekapt
                displacementFilter.padding = Math.ceil(displacement) + 10;
                filters.push(displacementFilter);
            }

            if (effectParams.blur > 0) {
                filters.push(new BlurFilter({ strength: effectParams.blur }));
            }
            return {
                filters,
                style: {},
                blendMode: effectParams.blendMode || 'multiply',
                alpha: effectParams.opacity !== undefined ? effectParams.opacity : 0.9
            };
        }

        if (mode === 'painted') {
            return {
                filters: [new BlurFilter({ strength: effectParams.blur || 0 })],
                style: {},
                blendMode: 'normal', // Changed from multiply to normal to preserve color
                alpha: effectParams.opacity || 0.8
            };
        }

        if (mode === 'raised') {
            const distance = effectParams.distance || 6;
            const angle = 45 * (Math.PI / 180);
            const shadow = new DropShadowFilter({
                offset: {
                    x: Math.round(distance * Math.cos(angle)),
                    y: Math.round(distance * Math.sin(angle))
                },
                blur: 2, // Sharper shadow for more "pop"
                alpha: 0.8, // Darker shadow
                color: 0x000000
            });
            shadow.padding = 30; // Prevent clipping

            return {
                filters: [shadow],
                style: {},
                blendMode: 'normal',
                alpha: 1
            };
        }

        if (mode === 'engraved') {
            const depth = effectParams.depth || 2;
            const opacity = effectParams.opacity !== undefined ? effectParams.opacity : 1;

            // Shadow (Top-Left, 225 degrees)
            const shadowAngle = 225 * (Math.PI / 180);
            const shadow = new DropShadowFilter({
                offset: {
                    x: Math.round(depth * Math.cos(shadowAngle)),
                    y: Math.round(depth * Math.sin(shadowAngle))
                },
                blur: 1,
                alpha: 0.9, // Strong inner shadow
                color: 0x000000
            });
            shadow.padding = 30; // Prevent clipping

            // Highlight (Bottom-Right, 45 degrees)
            const highlightAngle = 45 * (Math.PI / 180);
            const highlight = new DropShadowFilter({
                offset: {
                    x: Math.round(depth * Math.cos(highlightAngle)),
                    y: Math.round(depth * Math.sin(highlightAngle))
                },
                blur: 2, // Softer highlight
                alpha: 0.5, // Stronger highlight for better visibility
                color: 0xffffff
            });
            highlight.padding = 30; // Prevent clipping

            return {
                filters: [shadow, highlight],
                style: {},
                blendMode: 'normal', // Changed from conditional multiply to normal to preserve color
                alpha: opacity // Apply opacity to the whole container (text + shadow)
            };
        }

        return { filters: [], style: {}, blendMode: 'normal', alpha: 1 };
    }, [mode, params, displacementTexture]);
};
