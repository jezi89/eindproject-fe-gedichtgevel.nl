import React, {useEffect, useRef, useState, useMemo, forwardRef, useImperativeHandle} from 'react';
import {Assets, Texture} from 'pixi.js';
import defaultBackground from '@/assets/default-poem-background.png';
import {calculateOptimalImageRequest, IMAGE_QUALITY_MODE} from '@/utils/imageOptimization';

export const BackgroundImage = forwardRef(({
    imageUrl,
    photoData,
    imageQualityMode = IMAGE_QUALITY_MODE.AUTO,
    canvasWidth,
    canvasHeight,
    onTextureLoaded
}, ref) => {
    const [texture, setTexture] = useState(null);
    const previousTextureRef = useRef(null);
    const spriteRef = useRef(null);

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

    const effectiveUrl = useMemo(() => {
        if (!photoData) {
            return imageUrl;
        }

        return calculateOptimalImageRequest(
            photoData,
            canvasWidth,
            canvasHeight,
            imageQualityMode
        );
    }, [photoData, canvasWidth, canvasHeight, imageQualityMode, imageUrl]);

    useEffect(() => {
        let isMounted = true;

        if (previousTextureRef.current && previousTextureRef.current !== Texture.EMPTY) {
            try {
                if (previousTextureRef.current.source && previousTextureRef.current.source.destroyed === false) {

                }
            } catch (err) {

            }
        }

        const urlToLoad = effectiveUrl || defaultBackground;

        Assets.load(urlToLoad)
            .then(loadedTexture => {
                if (isMounted) {
                    setTexture(loadedTexture);
                    previousTextureRef.current = loadedTexture;
                    if (onTextureLoaded) {
                        onTextureLoaded({
                            width: loadedTexture.width,
                            height: loadedTexture.height
                        });
                    }
                }
            })
            .catch(err => {
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

    if (!texture || texture === Texture.EMPTY) {
        return (
            <pixiGraphics
                draw={(graphics) => {
                    graphics.clear();
                    graphics.rect(0, 0, canvasWidth, canvasHeight);
                    graphics.fill({ color: 0xE5E5E5 });
                }}
            />
        );
    }

    const isPortrait = texture.height > texture.width;
    let scale = 1;

    if (isPortrait) {
        scale = canvasWidth / texture.width;
    } else {
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

BackgroundImage.displayName = 'BackgroundImage';
