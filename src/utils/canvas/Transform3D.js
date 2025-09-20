/**
 * @fileoverview 3D Transformation System Foundation
 *
 * @description
 * Evolutionaire uitbreiding van de bestaande 2D skew transformaties naar 3D.
 * Behoudt container-level transformaties en voegt per-text 3D effecten toe.
 *
 * @version 1.0.0
 * @author Canvas Optimization - 3D Transformation System
 */

/**
 * 3D Transform interface voor individuele text objecten
 */
export class Transform3D {
	constructor(options = {}) {
		// Basis 3D transformaties
		this.x = options.x || 0;
		this.y = options.y || 0;
		this.z = options.z || 0;

		// 3D rotaties (in graden) - Enhanced per-text controls
		this.rotationX = options.rotationX || 0; // Kanteling naar voren/achteren
		this.rotationY = options.rotationY || 0; // Kanteling links/rechts (perspective)
		this.rotationZ = options.rotationZ || 0; // Per-line rotation (0-360°)

		// Enhanced per-text scaling (0.5x-2.0x)
		this.scaleX = options.scaleX || 1;
		this.scaleY = options.scaleY || 1;
		this.scaleZ = options.scaleZ || 1;
		this.uniformScale = options.uniformScale || 1; // Unified scale control

		// 3D Skew transformations (container-level integration)
		this.skewX = options.skewX || 0; // Horizontal skew (degrees)
		this.skewY = options.skewY || 0; // Vertical skew (degrees)
		this.skewZ = options.skewZ || 0; // Z-axis skew (degrees) - NEW

		// Enhanced pivot point selection (center/top/bottom)
		this.pivotX = options.pivotX || 0.5; // 0 = links, 0.5 = midden, 1 = rechts
		this.pivotY = options.pivotY || 0.5; // 0 = boven, 0.5 = midden, 1 = onder
		this.pivotMode = options.pivotMode || "center"; // 'center', 'top', 'bottom'

		// Gevel realism effects
		this.lighting = {
			enabled: options.lighting?.enabled || false,
			intensity: options.lighting?.intensity || 1.0,
			direction: options.lighting?.direction || { x: 0, y: 0, z: 1 },
			ambient: options.lighting?.ambient || 0.3,
			tint: options.lighting?.tint || 0xffffff,
		};

		// Material and blend effects
		this.material = {
			blendMode: options.material?.blendMode || "normal",
			roughness: options.material?.roughness || 0.5,
			metallic: options.material?.metallic || 0.0,
			opacity: options.material?.opacity || 1.0,
		};

		// Perspective settings
		this.perspective = options.perspective || 1000;
	}

	/**
	 * Clone deze transform
	 */
	clone() {
		return new Transform3D({
			x: this.x,
			y: this.y,
			z: this.z,
			rotationX: this.rotationX,
			rotationY: this.rotationY,
			rotationZ: this.rotationZ,
			perspective: this.perspective,
			scaleX: this.scaleX,
			scaleY: this.scaleY,
			scaleZ: this.scaleZ,
			uniformScale: this.uniformScale,
			pivotX: this.pivotX,
			pivotY: this.pivotY,
			pivotMode: this.pivotMode,
			skewX: this.skewX,
			skewY: this.skewY,
			skewZ: this.skewZ,
			lighting: { ...this.lighting },
			material: { ...this.material },
		});
	}

	/**
	 * Reset alle transformaties naar default waarden
	 */
	reset() {
		this.x = this.y = this.z = 0;
		this.rotationX = this.rotationY = this.rotationZ = 0;
		this.scaleX = this.scaleY = this.scaleZ = 1;
		this.uniformScale = 1;
		this.pivotX = this.pivotY = 0.5;
		this.pivotMode = "center";
		this.skewX = this.skewY = this.skewZ = 0;
		this.perspective = 1000;

		// Reset lighting and material
		this.lighting = {
			enabled: false,
			intensity: 1.0,
			direction: { x: 0, y: 0, z: 1 },
			ambient: 0.3,
			tint: 0xffffff,
		};

		this.material = {
			blendMode: "normal",
			roughness: 0.5,
			metallic: 0.0,
			opacity: 1.0,
		};
	}

	/**
	 * Set pivot point based on mode
	 */
	setPivotFromMode(mode) {
		this.pivotMode = mode;
		switch (mode) {
			case "top":
				this.pivotX = 0.5;
				this.pivotY = 0;
				break;
			case "bottom":
				this.pivotX = 0.5;
				this.pivotY = 1;
				break;
			case "center":
			default:
				this.pivotX = 0.5;
				this.pivotY = 0.5;
				break;
		}
	}

	/**
	 * Apply uniform scale to both X and Y
	 */
	setUniformScale(scale) {
		this.uniformScale = scale;
		this.scaleX = scale;
		this.scaleY = scale;
	}

	/**
	 * Converteer naar PIXI.js compatible properties
	 */
	toPixiProperties() {
		const finalScale = {
			x: this.scaleX * this.uniformScale,
			y: this.scaleY * this.uniformScale,
		};

		const finalAlpha = this.calculateAlpha() * this.material.opacity;
		const lightingEffect = this.calculateLightingEffect();
		const combinedSkew = this.calculateCombinedSkew();

		return {
			x: this.x,
			y: this.y,
			rotation: (this.rotationZ * Math.PI) / 180, // PIXI gebruikt radialen
			scale: finalScale,
			pivot: { x: this.pivotX, y: this.pivotY },
			alpha: finalAlpha * lightingEffect.alpha,
			skew: combinedSkew,
			tint: this.lighting.enabled ? lightingEffect.tint : 0xffffff,
			blendMode: this.material.blendMode,
		};
	}

	/**
	 * Bereken alpha voor diepte-effect (verder weg = transparanter)
	 */
	calculateAlpha() {
		if (this.z === 0) return 1;

		// Simpele diepte-alpha berekening
		const depthFactor = Math.max(0, 1 - Math.abs(this.z) / 500);
		return Math.max(0.1, depthFactor); // Minimum 10% zichtbaarheid
	}

	/**
	 * Bereken 3D skew effect voor perspective illusion
	 */
	calculate3DSkew() {
		const skewX = ((this.rotationY * Math.PI) / 180) * 0.5; // Perspective effect
		const skewY = ((this.rotationX * Math.PI) / 180) * 0.5; // Tilt effect

		return { x: skewX, y: skewY };
	}

	/**
	 * Bereken gecombineerde skew: 3D perspective + directe skew waarden
	 */
	calculateCombinedSkew() {
		const perspective3D = this.calculate3DSkew();

		// Convert direct skew values from degrees to radians
		const directSkewX = (this.skewX * Math.PI) / 180;
		const directSkewY = (this.skewY * Math.PI) / 180;
		const directSkewZ = (this.skewZ * Math.PI) / 180;

		// Combine 3D perspective skew with direct skew values
		// skewZ affects both X and Y skew in a rotational manner
		const skewZEffectX = Math.sin(directSkewZ) * 0.3; // Z-skew creates X component
		const skewZEffectY = Math.cos(directSkewZ) * 0.3 - 0.3; // Z-skew creates Y component

		return {
			x: perspective3D.x + directSkewX + skewZEffectX,
			y: perspective3D.y + directSkewY + skewZEffectY,
		};
	}

	/**
	 * Calculate lighting effect for gevel realism
	 */
	calculateLightingEffect() {
		if (!this.lighting.enabled) {
			return { alpha: 1.0, tint: 0xffffff };
		}

		// Calculate surface normal based on rotations
		const normalX = Math.sin((this.rotationY * Math.PI) / 180);
		const normalY = Math.sin((this.rotationX * Math.PI) / 180);
		const normalZ =
			Math.cos((this.rotationX * Math.PI) / 180) *
			Math.cos((this.rotationY * Math.PI) / 180);

		// Dot product with light direction for intensity
		const dotProduct =
			normalX * this.lighting.direction.x +
			normalY * this.lighting.direction.y +
			normalZ * this.lighting.direction.z;

		// Calculate final lighting intensity
		const lightIntensity = Math.max(
			this.lighting.ambient,
			this.lighting.ambient +
				(1 - this.lighting.ambient) *
					Math.max(0, dotProduct) *
					this.lighting.intensity
		);

		// Apply material properties
		const materialFactor = 1 - this.material.metallic * 0.3; // Metallic surfaces reflect differently
		const roughnessFactor = 1 - this.material.roughness * 0.2; // Rough surfaces scatter light

		const finalIntensity = lightIntensity * materialFactor * roughnessFactor;

		// FIXED: Clamp finalIntensity to valid range for PIXI color calculations
		const clampedIntensity = Math.max(0, Math.min(1, finalIntensity));

		// Convert intensity to tint (darker = lower RGB values)
		const tintValue = Math.floor(255 * clampedIntensity);
		const tint = (tintValue << 16) | (tintValue << 8) | tintValue;

		return {
			alpha: clampedIntensity, // Also clamp alpha to valid range
			tint: this.lighting.tint !== 0xffffff ? this.lighting.tint : tint,
		};
	}

	/**
	 * Apply gevel preset configuration
	 */
	applyGevelPreset(presetName) {
		const presets = {
			brick: {
				lighting: { enabled: true, intensity: 0.8, ambient: 0.4 },
				material: { roughness: 0.8, metallic: 0.1, blendMode: "multiply" },
			},
			stone: {
				lighting: { enabled: true, intensity: 0.9, ambient: 0.3 },
				material: { roughness: 0.9, metallic: 0.0, blendMode: "overlay" },
			},
			metal: {
				lighting: { enabled: true, intensity: 1.0, ambient: 0.2 },
				material: { roughness: 0.2, metallic: 0.9, blendMode: "screen" },
			},
			glass: {
				lighting: { enabled: true, intensity: 0.6, ambient: 0.6 },
				material: {
					roughness: 0.1,
					metallic: 0.3,
					blendMode: "add",
					opacity: 0.8,
				},
			},
			wood: {
				lighting: { enabled: true, intensity: 0.7, ambient: 0.5 },
				material: { roughness: 0.7, metallic: 0.0, blendMode: "normal" },
			},
		};

		const preset = presets[presetName];
		if (preset) {
			Object.assign(this.lighting, preset.lighting);
			Object.assign(this.material, preset.material);
		}
	}
}

/**
 * 3D Transform Manager - beheert alle 3D transformaties
 */
export class Transform3DManager {
  constructor() {
    this.transforms = new Map(); // lineIndex -> Transform3D
    this.globalPerspective = 1000;
    this.globalDepthSorting = true;
  }

  /**
   * Krijg of maak transform voor een specifieke regel
   */
  getTransform(lineIndex) {
    if (!this.transforms.has(lineIndex)) {
      this.transforms.set(lineIndex, new Transform3D());
    }
    return this.transforms.get(lineIndex);
  }

  /**
   * Set transform voor een specifieke regel
   */
  setTransform(lineIndex, transform) {
    this.transforms.set(lineIndex, transform);
  }

  /**
   * Update een specifieke property voor een regel
   */
  updateTransform(lineIndex, property, value) {
    const transform = this.getTransform(lineIndex);
    if (Object.prototype.hasOwnProperty.call(transform, property)) {
			transform[property] = value;
		}
  }

  /**
   * Reset alle transformaties
   */
  resetAll() {
    this.transforms.clear();
  }

  /**
   * Reset transformatie voor specifieke regel
   */
  resetTransform(lineIndex) {
    if (this.transforms.has(lineIndex)) {
      this.transforms.get(lineIndex).reset();
    }
  }

  /**
   * Krijg alle transforms gesorteerd op Z-diepte (voor render volgorde)
   */
  getDepthSortedTransforms() {
    const entries = Array.from(this.transforms.entries());

    if (!this.globalDepthSorting) {
      return entries;
    }

    // Sorteer op Z-waarde (verder weg eerst = achtergrond)
    return entries.sort(([, a], [, b]) => a.z - b.z);
  }

  /**
   * Bereken perspective effect voor een transform
   */
  static calculatePerspective(transform, distance = 1000) {
    // FIXED: Always calculate perspective effect, even when z=0
    // This allows global perspective settings to work intuitively
    const effectiveZ = transform.z || 0;

    // Simpele perspective berekening
    const scale = distance / (distance + effectiveZ);
    const alpha = Math.max(0.1, Math.min(1, scale));

    return {
      scaleX: scale,
      scaleY: scale,
      alpha: alpha
    };
  }

  /**
   * Converteer 3D rotatie naar 2D skew approximatie
   */
  static rotation3DToSkew(rotationX, rotationY, rotationZ) {
    // Converteer 3D rotaties naar 2D skew effecten
    const radX = (rotationX * Math.PI) / 180;
    const radY = (rotationY * Math.PI) / 180;
    const radZ = (rotationZ * Math.PI) / 180;

    return {
      skewX: Math.sin(radY) * 0.5, // Y-rotatie wordt X-skew
      skewY: Math.sin(radX) * 0.5, // X-rotatie wordt Y-skew
      rotation: radZ // Z-rotatie blijft normale rotatie
    };
  }

  /**
   * Bereken lighting effect gebaseerd op 3D positie
   */
  static calculateLighting(transform, lightDirection = { x: 0, y: 0, z: 1 }) {
    // Simpele lighting berekening voor 3D effect
    const normal = {
      x: Math.sin((transform.rotationY * Math.PI) / 180),
      y: Math.sin((transform.rotationX * Math.PI) / 180),
      z: Math.cos((transform.rotationX * Math.PI) / 180) * Math.cos((transform.rotationY * Math.PI) / 180)
    };

    // Dot product voor lighting intensity
    const intensity = Math.max(0.3,
      normal.x * lightDirection.x +
      normal.y * lightDirection.y +
      normal.z * lightDirection.z
    );

    return intensity;
  }

  /**
     * Krijg of maak transform voor een specifieke regel
     */
    getTransform(lineIndex) {
        if (!this.transforms.has(lineIndex)) {
            this.transforms.set(lineIndex, new Transform3D());
        }
        return this.transforms.get(lineIndex);
    }

    /**
     * Set transform voor een specifieke regel
     */
    setTransform(lineIndex, transform) {
        this.transforms.set(lineIndex, transform);
    }

    /**
     * Update een specifieke property voor een regel
     */
    updateTransform(lineIndex, property, value) {
        const transform = this.getTransform(lineIndex);
        if (Object.prototype.hasOwnProperty.call(transform, property)) {
            transform[property] = value;
        }
    }

    /**
     * Reset alle transformaties
     */
    resetAll() {
        this.transforms.clear();
    }

    /**
     * Reset transformatie voor specifieke regel
     */
    resetTransform(lineIndex) {
        if (this.transforms.has(lineIndex)) {
            this.transforms.get(lineIndex).reset();
        }
    }

    /**
     * Krijg alle transforms gesorteerd op Z-diepte (voor render volgorde)
     */
    getDepthSortedTransforms() {
        const entries = Array.from(this.transforms.entries());

        if (!this.globalDepthSorting) {
            return entries;
        }

        // Sorteer op Z-waarde (verder weg eerst = achtergrond)
        return entries.sort(([, a], [, b]) => a.z - b.z);
    }

    /**
   * Debug info voor development
   */
  getDebugInfo() {
    const transforms = Array.from(this.transforms.entries()).map(([index, transform]) => ({
      lineIndex: index,
      position: { x: transform.x, y: transform.y, z: transform.z },
      rotation: { x: transform.rotationX, y: transform.rotationY, z: transform.rotationZ },
      scale: { x: transform.scaleX, y: transform.scaleY, z: transform.scaleZ }
    }));

    return {
      totalTransforms: this.transforms.size,
      globalPerspective: this.globalPerspective,
      depthSorting: this.globalDepthSorting,
      transforms: transforms
    };
  }
}

// Export singleton instance voor global gebruik
// UNUSED: export const global3DManager = new Transform3DManager();

/**
 * Utility functies voor 3D math
 */
// UNUSED: // UNUSED: export const Transform3DUtils = {
/**
 * Converteer graden naar radialen
 */
// degreesToRadians: (degrees) => (degrees * Math.PI) / 180,
//
// /**
//  * Converteer radialen naar graden
//  */
// radiansToDegrees: (radians) => (radians * 180) / Math.PI,
//
// /**
//  * Clamp waarde tussen min en max
//  */
// clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
//
// /**
//  * Linear interpolatie tussen twee waarden
//  */
// lerp: (a, b, t) => a + (b - a) * t,
//
// /**
//  * Bereken afstand tussen twee 3D punten
//  */
// distance3D: (a, b) => Math.sqrt(
//   Math.pow(b.x - a.x, 2) +
//   Math.pow(b.y - a.y, 2) +
//   Math.pow(b.z - a.z, 2)
// ),
//
// /**
//  * Normalize 3D vector
//  */
// normalize3D: (vector) => {
//   const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
//   return length > 0 ? {
//     x: vector.x / length,
//     y: vector.y / length,
//     z: vector.z / length
//   } : { x: 0, y: 0, z: 0 };
// }
// };