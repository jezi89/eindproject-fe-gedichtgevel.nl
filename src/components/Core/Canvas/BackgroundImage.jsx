// src/components/Core/Canvas/components/BackgroundImage.jsx
import React, {useEffect, useRef, useState} from 'react';
import {Assets, Texture} from 'pixi.js';
import defaultBackground from '@/assets/default-poem-background.png';

export const BackgroundImage = ({imageUrl, canvasWidth, canvasHeight}) => {
    const [texture, setTexture] = useState(null);
    const previousTextureRef = useRef(null);

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

        const urlToLoad = imageUrl || defaultBackground;

        // Load texture
        Assets.load(urlToLoad)
            .then(loadedTexture => {
                if (isMounted) {
                    setTexture(loadedTexture);
                    previousTextureRef.current = loadedTexture;
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
    }, [imageUrl]);

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

    // "Cover" effect logica: schaal de afbeelding om het canvas te vullen zonder vervorming
    const canvasAspect = canvasWidth / canvasHeight;
    const imageAspect = texture.width / texture.height;
    let scale = 1;
    if (canvasAspect > imageAspect) {
        scale = canvasWidth / texture.width; // Fit to width
    } else {
        scale = canvasHeight / texture.height; // Fit to height
    }

    return (
        <pixiSprite
            texture={texture}
            anchor={0.5}
            x={canvasWidth / 2}
            y={canvasHeight / 2}
            scale={scale}
        />
    );
};


