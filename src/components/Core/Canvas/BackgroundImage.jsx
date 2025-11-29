// src/components/Core/Canvas/components/BackgroundImage.jsx
import React, {useEffect, useRef, useState, useMemo, forwardRef, useImperativeHandle} from 'react';
import {Assets, Texture} from 'pixi.js';
import defaultBackground from '@/assets/default-poem-background.png';
import {calculateOptimalImageRequest, IMAGE_QUALITY_MODE} from '@/utils/imageOptimization';

export const BackgroundImage = forwardRef(({
    imageUrl,           // Fallback voor oude string URLs (backward compatibility)
    photoData,          // Volledig photo object met metadata
    imageQualityMode = IMAGE_QUALITY_MODE.AUTO,   // Quality mode state
    canvasWidth,
    canvasHeight,
    onTextureLoaded // <-- New prop
}, ref) => {
    const [texture, setTexture] = useState(null);
    const previousTextureRef = useRef(null);
    const spriteRef = useRef(null);

    // Expose methods to parent for export functionality
    useImperativeHandle(ref, () => ({
        getSpriteBounds: () => {
            if (!spriteRef.current) return null;
            return spriteRef.current.getBounds();
        },
        getSpriteScale: () => {
            if (!spriteRef.current) return 1;
            return spriteRef.current.scale.x;
        },
        getTexture: () => texture
    }), [texture]);

    // Bereken optimal URL reactief based on quality mode
    const effectiveUrl = useMemo(() => {
        // Fallback voor oude string URLs (backward compatibility)
        if (!photoData) {
            console.log('🖼️ BackgroundImage: Using fallback imageUrl (no photoData)');
            return imageUrl;
        }

        // Herbereken URL met huidige quality mode
        const calculatedUrl = calculateOptimalImageRequest(
            photoData,
            canvasWidth,
            canvasHeight,
            imageQualityMode
        );

        console.log('🖼️ BackgroundImage: Quality mode URL calculated:', {
            qualityMode: imageQualityMode,
            photoSource: photoData.source,
            calculatedUrl: calculatedUrl?.substring(0, 80) + '...',
            canvasSize: `${canvasWidth}×${canvasHeight}`
        });

        return calculatedUrl;
    }, [photoData, canvasWidth, canvasHeight, imageQualityMode, imageUrl]);

    useEffect(() => {
        let isMounted = true;

        // Cleanup previous texture
        if (previousTextureRef.current && previousTextureRef.current !== Texture.EMPTY) {
            try {
                // Only destroy if it's not a shared/cached texture
                if (previousTextureRef.current.source && previousTextureRef.current.source.destroyed === false) {

                }
            } catch (err) {

            }
        }

        const urlToLoad = effectiveUrl || defaultBackground;

        // Load texture
        Assets.load(urlToLoad)
            .then(loadedTexture => {
                if (isMounted) {
                    setTexture(loadedTexture);
                    previousTextureRef.current = loadedTexture;
                    // Report actual dimensions to parent
                    if (onTextureLoaded) {
                        onTextureLoaded({
                            width: loadedTexture.width,
                            height: loadedTexture.height
                        });
                    }
                }
            })
            .catch(err => {

                // Fallback to default if custom image fails
                if (urlToLoad !== defaultBackground) {

                    Assets.load(defaultBackground)
                        .then(loadedTexture => {
                            if (isMounted) {
                                setTexture(loadedTexture);
                                previousTextureRef.current = loadedTexture;
                            }
                        })
                        .catch(fallbackErr => {


                            if (isMounted) {
                                setTexture(Texture.EMPTY);
                            }
                        });
                }
            });

        return () => {
            isMounted = false;
        };
    }, [effectiveUrl]);

    // If texture failed to load, render a solid color fallback instead of nothing
    if (!texture || texture === Texture.EMPTY) {
        return (
            <pixiGraphics
                draw={(graphics) => {
                    graphics.clear();
                    graphics.rect(0, 0, canvasWidth, canvasHeight);
                    graphics.fill({ color: 0xE5E5E5 }); // Light gray fallback
                }}
            />
        );
    }

    // Best Fit Strategy:
    // - Landscape: Contain (fit within canvas, black bars acceptable)
    // - Portrait: Fit-width (crop bottom, top at y=0)
    const isPortrait = texture.height > texture.width;
    let scale = 1;

    if (isPortrait) {
        // Portrait: Fit to canvas width
        scale = canvasWidth / texture.width;
    } else {
        // Landscape: Contain
        const scaleX = canvasWidth / texture.width;
        const scaleY = canvasHeight / texture.height;
        scale = Math.min(scaleX, scaleY);
    }

    return (
        <pixiSprite
            ref={spriteRef}
            texture={texture}
            anchor={{x: 0.5, y: 0}}
            x={canvasWidth / 2}
            y={0}
            scale={scale}
        />
    );
});

// Add display name for debugging
BackgroundImage.displayName = 'BackgroundImage';
