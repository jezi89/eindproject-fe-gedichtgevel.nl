// src/components/Core/Canvas/components/BackgroundImage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Assets, Texture } from 'pixi.js';
import defaultBackground from '@/assets/default-poem-background.png';

const BackgroundImage = ({ imageUrl, canvasWidth, canvasHeight }) => {
  const [texture, setTexture] = useState(null);
  const previousTextureRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    // Cleanup previous texture
    if (previousTextureRef.current && previousTextureRef.current !== Texture.EMPTY) {
      try {
        // Only destroy if it's not a shared/cached texture
        if (previousTextureRef.current.baseTexture && previousTextureRef.current.baseTexture.destroyed === false) {
          console.log('🧹 Cleaning up previous texture');
        }
      } catch (err) {
        console.warn('Failed to cleanup texture:', err);
      }
    }

    const urlToLoad = imageUrl || defaultBackground;
    console.log('🖼️ Loading background:', urlToLoad === defaultBackground ? 'default' : 'custom');

    // Load texture
    Assets.load(urlToLoad)
      .then(loadedTexture => {
        if (isMounted) {
          setTexture(loadedTexture);
          previousTextureRef.current = loadedTexture;
        }
      })
      .catch(err => {
        console.error("❌ Error loading background texture:", err);
        // Fallback to default if custom image fails
        if (urlToLoad !== defaultBackground) {
          console.log('📦 Falling back to default background');
          Assets.load(defaultBackground)
            .then(loadedTexture => {
              if (isMounted) {
                setTexture(loadedTexture);
                previousTextureRef.current = loadedTexture;
              }
            })
            .catch(fallbackErr => {
              console.error("❌ Failed to load default background:", fallbackErr);
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

  if (!texture || texture === Texture.EMPTY) {
    return null;
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

export default BackgroundImage;
