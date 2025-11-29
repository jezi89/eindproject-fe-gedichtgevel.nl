import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as PIXI from 'pixi.js';
import { extend } from '@pixi/react';
import { BevelFilter } from 'pixi-filters';


// Register TilingSprite with @pixi/react
extend({ TilingSprite: PIXI.TilingSprite });

export const TextBackground = ({
    width,
    height,
    textureUrl,
    padding = 20,
    bevelThickness = 3,
    shadowDistance = 5,
    shadowBlur = 4,
    shadowAlpha = 0.5,
    cornerRadius = 10,
}) => {
    const maskRef = useRef(null);
    const [maskObj, setMaskObj] = useState(null);

    const [activeTexture, setActiveTexture] = useState(null);

    // Load texture and wait for validity
    // Load texture using Texture.from (more robust for these WebP files than Assets.load)
    // Load texture and wait for validity
    useEffect(() => {
        if (!textureUrl) {
            setActiveTexture(null);
            return;
        }

        const loadTexture = async () => {
            try {
                // Try Assets.load first (modern Pixi)
                const tex = await PIXI.Assets.load(textureUrl);
                if (tex) {
                    setActiveTexture(tex);
                    return;
                }
            } catch (assetErr) {
                // Silent fallback
            }

            // Fallback to Texture.from
            try {
                const tex = PIXI.Texture.from(textureUrl);
                if (tex.valid) {
                    setActiveTexture(tex);
                } else {
                    tex.once('update', () => setActiveTexture(tex));
                    tex.once('error', (err) => console.error('❌ Texture.from failed:', err));
                }
            } catch (err) {
                console.error('❌ All texture loading methods failed:', err);
            }
        };

        loadTexture();

        return () => {
            // Cleanup if needed
        };
    }, [textureUrl]);

    // Create filters - Sprite filters (Bevel)
    const spriteFilters = useMemo(() => {
        try {
            const bevel = new BevelFilter({
                thickness: bevelThickness,
                lightColor: 0xffffff,
                shadowColor: 0x000000,
                lightAlpha: 0.7,
                shadowAlpha: 0.7,
            });
            return [bevel];
        } catch (error) {
            console.warn('Failed to create bevel filter:', error);
            return [];
        }
    }, [bevelThickness]);

    // Draw mask
    useEffect(() => {
        if (maskRef.current) {
            const g = maskRef.current;
            g.clear();
            g.roundRect(-padding, -padding, width + padding * 2, height + padding * 2, cornerRadius);
            g.fill({ color: 0xffffff }); // PixiJS v8 syntax
            setMaskObj(g);
        }
    }, [width, height, padding, cornerRadius]);

    if (!textureUrl) return null;

    return (
        <pixiContainer>
            {/* Mask for the tiling sprite */}
            <pixiGraphics ref={maskRef} />



            {/* Textured Layer - Only render when texture is valid */}
            {activeTexture && (
                <pixiTilingSprite
                    key={textureUrl} // Force remount when texture changes
                    texture={activeTexture}
                    width={width + padding * 2}
                    height={height + padding * 2}
                    mask={maskObj}
                    filters={spriteFilters}
                    x={-padding}
                    y={-padding}
                />
            )}
        </pixiContainer>
    );
};
