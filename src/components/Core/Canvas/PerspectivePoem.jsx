import { useEffect, useRef } from "react";
import { Matrix, PerspectiveMesh, RenderTexture, Texture } from "pixi.js";
import { extend, useApplication, useTick } from "@pixi/react";

extend({ PerspectiveMesh });

/**
 * Echte perspectiefprojectie voor het gedicht (PixiJS v8 PerspectiveMesh).
 *
 * Werking: de children (gedichttekst + materiaal) worden in een verborgen
 * bron-container gerenderd, per frame naar een RenderTexture gekopieerd en
 * op een PerspectiveMesh geprojecteerd waarvan de hoekpunten via
 * perspX/perspY (graden, -45..45) worden gekanteld. Dit geeft — anders dan
 * skew — een écht verdwijnpunt: de "verre" kant van de tekst wordt kleiner.
 *
 * Let op: in perspectief-modus is de tekst een projectie; regels aanklikken/
 * verslepen op het canvas werkt dan niet (XY-sliders en alle styling wel).
 */
export function PerspectivePoem({
    enabled,
    perspX = 0,
    perspY = 0,
    bounds,
    padding = 60,
    children,
}) {
    const { app } = useApplication();
    const sourceRef = useRef(null);
    const meshRef = useRef(null);
    const textureRef = useRef(null);
    const renderMatrixRef = useRef(new Matrix());

    // Afmetingen van het te projecteren vlak (lokale ruimte van de PoemGroup)
    const w = Math.max(2, Math.ceil((bounds?.width || 0) + padding * 2));
    const h = Math.max(2, Math.ceil((bounds?.height || 0) + padding * 2));
    const bx = (bounds?.x || 0) - padding;
    const by = (bounds?.y || 0) - padding;

    // RenderTexture aanmaken/vervangen bij maatwijziging
    useEffect(() => {
        if (!enabled) return;
        const rt = RenderTexture.create({ width: w, height: h, resolution: 2, antialias: true });
        textureRef.current = rt;
        if (meshRef.current) meshRef.current.texture = rt;
        return () => {
            textureRef.current = null;
            if (meshRef.current) meshRef.current.texture = Texture.EMPTY;
            rt.destroy(true);
        };
    }, [enabled, w, h]);

    // Hoekpunten bijwerken op basis van de perspectief-sliders
    useEffect(() => {
        const mesh = meshRef.current;
        if (!mesh || !enabled) return;

        const px = Math.max(-1, Math.min(1, perspX / 45));
        const py = Math.max(-1, Math.min(1, perspY / 45));
        // Maximaal 35% krimp van de "verre" rand bij volledige uitslag
        const sx = 0.35 * Math.abs(px);
        const sy = 0.35 * Math.abs(py);

        const leftShrink = px < 0 ? sx : 0;   // linkerkant verder weg
        const rightShrink = px > 0 ? sx : 0;  // rechterkant verder weg
        const topShrink = py < 0 ? sy : 0;    // bovenkant verder weg
        const bottomShrink = py > 0 ? sy : 0; // onderkant verder weg

        mesh.setCorners(
            w * topShrink, h * leftShrink,          // linksboven
            w - w * topShrink, h * rightShrink,     // rechtsboven
            w - w * bottomShrink, h - h * rightShrink, // rechtsonder
            w * bottomShrink, h - h * leftShrink,   // linksonder
        );
    }, [enabled, perspX, perspY, w, h]);

    // Bron per frame naar de texture renderen (alleen in perspectief-modus)
    useTick(() => {
        const src = sourceRef.current;
        const rt = textureRef.current;
        if (!enabled || !src || !rt || !app?.renderer) return;

        // Bron staat visible=false in de scene; voor de expliciete render
        // tijdelijk aanzetten en de lokale offset compenseren.
        src.visible = true;
        renderMatrixRef.current.set(1, 0, 0, 1, -bx, -by);
        app.renderer.render({
            container: src,
            target: rt,
            clear: true,
            transform: renderMatrixRef.current,
        });
        src.visible = false;
    });

    return (
        <>
            <pixiContainer ref={sourceRef} visible={!enabled} label="PerspectiveSource">
                {children}
            </pixiContainer>
            {enabled && (
                <pixiPerspectiveMesh
                    ref={meshRef}
                    texture={textureRef.current || Texture.EMPTY}
                    x={bx}
                    y={by}
                    verticesX={20}
                    verticesY={20}
                />
            )}
        </>
    );
}
