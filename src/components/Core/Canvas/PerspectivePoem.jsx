import { useCallback, useEffect, useRef } from "react";
import { Matrix, PerspectiveMesh, RenderTexture, Texture } from "pixi.js";
import { extend, useApplication, useTick } from "@pixi/react";

extend({ PerspectiveMesh });

// Genormaliseerde hoekpunten (0..1) in de volgorde die setCorners verwacht:
// linksboven, rechtsboven, rechtsonder, linksonder. Standaard = platte rechthoek.
export const DEFAULT_PERSPECTIVE_CORNERS = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
];

/**
 * Sleepbare hoekgreep (PixiJS graphics). Meldt bij pointerdown welke hoek
 * versleept wordt; de globale beweging wordt in PerspectivePoem afgehandeld.
 */
function CornerHandle({ index, x, y, onDown }) {
    const ref = useRef(null);

    useEffect(() => {
        const g = ref.current;
        if (!g) return;
        g.eventMode = "static";
        g.cursor = "grab";
        const down = (event) => {
            event.stopPropagation();
            onDown(index, event);
        };
        g.on("pointerdown", down);
        return () => g.off("pointerdown", down);
    }, [index, onDown]);

    return (
        <pixiGraphics
            ref={ref}
            x={x}
            y={y}
            draw={(g) => {
                g.clear();
                // Grote transparante trefzone + zichtbare greep
                g.circle(0, 0, 16).fill({ color: 0x2b6cb0, alpha: 0.2 });
                g.circle(0, 0, 8)
                    .fill({ color: 0xffffff, alpha: 0.95 })
                    .stroke({ color: 0x2b6cb0, width: 3 });
            }}
        />
    );
}

/**
 * Echte perspectiefprojectie voor het gedicht (PixiJS v8 PerspectiveMesh).
 *
 * Werking: de children (gedichttekst + materiaal) worden in een verborgen
 * bron-container gerenderd, per frame naar een RenderTexture gekopieerd en
 * op een PerspectiveMesh geprojecteerd. De hoekpunten komen uit één van twee
 * modi:
 *  - slider-modus: perspX/perspY (graden, -45..45) kantelen het vlak symmetrisch;
 *  - vrije modus: de gebruiker versleept de vier hoeken zelf (wysiwyg op de gevel),
 *    opgeslagen als genormaliseerde `corners`.
 *
 * Let op: in perspectief-modus is de tekst een projectie; regels aanklikken/
 * verslepen op het canvas werkt dan niet (sliders, hoekgrepen en styling wel).
 */
export function PerspectivePoem({
    enabled,
    perspX = 0,
    perspY = 0,
    freeMode = false,
    corners = DEFAULT_PERSPECTIVE_CORNERS,
    onCornersChange,
    bounds,
    padding = 60,
    children,
}) {
    const { app } = useApplication();
    const sourceRef = useRef(null);
    const meshRef = useRef(null);
    const textureRef = useRef(null);
    const handlesRef = useRef(null);
    const renderMatrixRef = useRef(new Matrix());
    const draggingRef = useRef(-1);
    const cornersRef = useRef(corners);
    cornersRef.current = corners;

    // Afmetingen van het te projecteren vlak (lokale ruimte van de PoemGroup)
    const w = Math.max(2, Math.ceil((bounds?.width || 0) + padding * 2));
    const h = Math.max(2, Math.ceil((bounds?.height || 0) + padding * 2));
    const bx = (bounds?.x || 0) - padding;
    const by = (bounds?.y || 0) - padding;

    // Hoekpunten in pixels: uit de sleep-hoeken (vrije modus) of uit de sliders.
    const cornerPx = freeMode
        ? corners.map((c) => ({ x: c.x * w, y: c.y * h }))
        : null;

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

    // Hoekpunten van de mesh bijwerken (vrije modus of slider-modus)
    useEffect(() => {
        const mesh = meshRef.current;
        if (!mesh || !enabled) return;

        if (freeMode) {
            const p = corners.map((c) => ({ x: c.x * w, y: c.y * h }));
            mesh.setCorners(p[0].x, p[0].y, p[1].x, p[1].y, p[2].x, p[2].y, p[3].x, p[3].y);
            return;
        }

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
    }, [enabled, freeMode, corners, perspX, perspY, w, h]);

    // Slepen van de hoekgrepen: globale beweging op de stage afhandelen zodat
    // de greep de cursor blijft volgen, ook buiten de greep zelf.
    const handleDown = useCallback((index) => {
        draggingRef.current = index;
    }, []);

    useEffect(() => {
        if (!enabled || !freeMode || !app?.stage || !onCornersChange) return;
        const container = handlesRef.current;
        if (!container) return;

        // Stage interactief maken zodat globalpointermove vuurt tijdens het slepen.
        app.stage.eventMode = "static";

        const move = (event) => {
            const idx = draggingRef.current;
            if (idx < 0) return;
            const local = container.toLocal(event.global);
            // Iets buiten [0,1] toestaan voor extra vrijheid aan de randen.
            const nx = Math.max(-0.5, Math.min(1.5, local.x / w));
            const ny = Math.max(-0.5, Math.min(1.5, local.y / h));
            const cur = cornersRef.current;
            if (cur[idx].x === nx && cur[idx].y === ny) return;
            const next = cur.map((c, i) => (i === idx ? { x: nx, y: ny } : c));
            onCornersChange(next);
        };
        const up = () => {
            draggingRef.current = -1;
        };

        app.stage.on("globalpointermove", move);
        app.stage.on("pointerup", up);
        app.stage.on("pointerupoutside", up);
        return () => {
            app.stage.off("globalpointermove", move);
            app.stage.off("pointerup", up);
            app.stage.off("pointerupoutside", up);
        };
    }, [enabled, freeMode, app, w, h, onCornersChange]);

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
            {enabled && freeMode && cornerPx && (
                <pixiContainer ref={handlesRef} x={bx} y={by} label="PerspectiveHandles">
                    {cornerPx.map((p, i) => (
                        <CornerHandle
                            key={i}
                            index={i}
                            x={p.x}
                            y={p.y}
                            onDown={handleDown}
                        />
                    ))}
                </pixiContainer>
            )}
        </>
    );
}
