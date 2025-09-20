// src/components/Core/Canvas/components/BackgroundImage.jsx
import React, { useEffect, useState } from 'react';
import { Assets, Sprite, Texture } from 'pixi.js';

const BackgroundImage = ({ imageUrl, canvasWidth, canvasHeight }) => {
  const [texture, setTexture] = useState(Texture.EMPTY);

  useEffect(() => {
    if (imageUrl) {
      // Gebruik Assets.load voor moderne textuur-lading (PIXI v7+)
      Assets.load(imageUrl).then(loadedTexture => {
        setTexture(loadedTexture);
      }).catch(err => console.error("Fout bij laden achtergrondtextuur:", err));
    } else {
      setTexture(Texture.EMPTY);
    }
  }, [imageUrl]);

  if (texture === Texture.EMPTY) {
    return null; // Render niets als er geen afbeelding is
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
