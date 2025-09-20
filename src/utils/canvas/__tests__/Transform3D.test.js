/**
 * @fileoverview Integration tests for 3D transformations including skewZ
 * Tests the combined skew system (skewX, skewY, skewZ) with 3D perspective effects
 */

import { Transform3D, Transform3DManager } from '../Transform3D';

describe('Transform3D - SkewZ Integration Tests', () => {
	describe('Basic SkewZ Functionality', () => {
		test('should initialize with default skewZ value', () => {
			const transform = new Transform3D();
			expect(transform.skewZ).toBe(0);
		});

		test('should accept skewZ in constructor options', () => {
			const transform = new Transform3D({ skewZ: 30 });
			expect(transform.skewZ).toBe(30);
		});

		test('should include skewZ in clone operation', () => {
			const original = new Transform3D({ skewZ: 45 });
			const cloned = original.clone();
			expect(cloned.skewZ).toBe(45);
		});

		test('should reset skewZ to 0 in reset operation', () => {
			const transform = new Transform3D({ skewZ: 30 });
			transform.reset();
			expect(transform.skewZ).toBe(0);
		});
	});

	describe('Combined Skew Calculations', () => {
		test('should calculate combined skew with only direct skew values', () => {
			const transform = new Transform3D({
				skewX: 30,
				skewY: 20,
				skewZ: 15
			});

			const combinedSkew = transform.calculateCombinedSkew();
			
			// Should include direct skew values converted to radians
			const expectedSkewX = (30 * Math.PI) / 180;
			const expectedSkewY = (20 * Math.PI) / 180;
			const skewZRad = (15 * Math.PI) / 180;
			const expectedSkewZEffectX = Math.sin(skewZRad) * 0.3;
			const expectedSkewZEffectY = Math.cos(skewZRad) * 0.3 - 0.3;

			expect(combinedSkew.x).toBeCloseTo(expectedSkewX + expectedSkewZEffectX, 5);
			expect(combinedSkew.y).toBeCloseTo(expectedSkewY + expectedSkewZEffectY, 5);
		});

		test('should combine 3D perspective skew with direct skew values', () => {
			const transform = new Transform3D({
				rotationX: 10,
				rotationY: 15,
				skewX: 20,
				skewY: 25,
				skewZ: 30
			});

			const combinedSkew = transform.calculateCombinedSkew();
			const perspective3D = transform.calculate3DSkew();

			// Should include both perspective and direct skew effects
			expect(combinedSkew.x).not.toBe(perspective3D.x);
			expect(combinedSkew.y).not.toBe(perspective3D.y);
			
			// Values should be reasonable (not NaN or infinite)
			expect(isFinite(combinedSkew.x)).toBe(true);
			expect(isFinite(combinedSkew.y)).toBe(true);
		});

		test('should handle zero skewZ gracefully', () => {
			const transform = new Transform3D({
				skewX: 30,
				skewY: 20,
				skewZ: 0
			});

			const combinedSkew = transform.calculateCombinedSkew();
			
			// With skewZ = 0, should only have direct skew effects
			const expectedSkewX = (30 * Math.PI) / 180;
			const expectedSkewY = (20 * Math.PI) / 180;

			expect(combinedSkew.x).toBeCloseTo(expectedSkewX, 5);
			expect(combinedSkew.y).toBeCloseTo(expectedSkewY - 0.3, 5); // -0.3 from skewZ effect
		});
	});

	describe('PIXI Properties Integration', () => {
		test('should include combined skew in toPixiProperties', () => {
			const transform = new Transform3D({
				skewX: 15,
				skewY: 10,
				skewZ: 20
			});

			const pixiProps = transform.toPixiProperties();
			const expectedSkew = transform.calculateCombinedSkew();

			expect(pixiProps.skew).toEqual(expectedSkew);
		});

		test('should maintain other properties while adding skew', () => {
			const transform = new Transform3D({
				x: 100,
				y: 200,
				rotationZ: 45,
				uniformScale: 1.5,
				skewZ: 30
			});

			const pixiProps = transform.toPixiProperties();

			expect(pixiProps.x).toBe(100);
			expect(pixiProps.y).toBe(200);
			expect(pixiProps.rotation).toBeCloseTo((45 * Math.PI) / 180, 5);
			expect(pixiProps.scale.x).toBe(1.5);
			expect(pixiProps.scale.y).toBe(1.5);
			expect(pixiProps.skew).toBeDefined();
		});
	});

	describe('Edge Cases and Boundary Values', () => {
		test('should handle maximum skew values', () => {
			const transform = new Transform3D({
				skewX: 45,
				skewY: 45,
				skewZ: 45
			});

			const combinedSkew = transform.calculateCombinedSkew();
			
			expect(isFinite(combinedSkew.x)).toBe(true);
			expect(isFinite(combinedSkew.y)).toBe(true);
		});

		test('should handle negative skew values', () => {
			const transform = new Transform3D({
				skewX: -30,
				skewY: -20,
				skewZ: -15
			});

			const combinedSkew = transform.calculateCombinedSkew();
			
			expect(isFinite(combinedSkew.x)).toBe(true);
			expect(isFinite(combinedSkew.y)).toBe(true);
		});

		test('should handle extreme rotation with skewZ', () => {
			const transform = new Transform3D({
				rotationX: 90,
				rotationY: 90,
				skewZ: 45
			});

			const combinedSkew = transform.calculateCombinedSkew();
			
			expect(isFinite(combinedSkew.x)).toBe(true);
			expect(isFinite(combinedSkew.y)).toBe(true);
		});
	});
});

describe('Transform3DManager - SkewZ Integration', () => {
	let manager;

	beforeEach(() => {
		manager = new Transform3DManager();
	});

	test('should handle skewZ updates through updateTransform', () => {
		manager.updateTransform(0, 'skewZ', 30);
		
		const transform = manager.getTransform(0);
		expect(transform.skewZ).toBe(30);
	});

	test('should maintain skewZ in transform operations', () => {
		const transform = new Transform3D({ skewZ: 25 });
		manager.setTransform(0, transform);
		
		const retrieved = manager.getTransform(0);
		expect(retrieved.skewZ).toBe(25);
	});

	test('should reset skewZ when resetting transform', () => {
		manager.updateTransform(0, 'skewZ', 40);
		manager.resetTransform(0);
		
		const transform = manager.getTransform(0);
		expect(transform.skewZ).toBe(0);
	});
});

describe('Real-world Integration Scenarios', () => {
	test('should work with typical poem line transformation', () => {
		const transform = new Transform3D({
			// Typical 3D positioning
			x: 50,
			y: 100,
			z: -20,
			rotationY: 15, // Perspective effect
			
			// Combined skew effects
			skewX: 10,  // Container-level horizontal skew
			skewY: 5,   // Container-level vertical skew  
			skewZ: 20,  // New Z-axis skew for 3D effect
			
			// Scaling
			uniformScale: 1.2
		});

		const pixiProps = transform.toPixiProperties();

		// Should have reasonable values for all properties
		expect(pixiProps.x).toBe(50);
		expect(pixiProps.y).toBe(100);
		expect(pixiProps.scale.x).toBe(1.2);
		expect(pixiProps.scale.y).toBe(1.2);
		
		// Skew should combine all effects
		expect(pixiProps.skew.x).toBeDefined();
		expect(pixiProps.skew.y).toBeDefined();
		expect(isFinite(pixiProps.skew.x)).toBe(true);
		expect(isFinite(pixiProps.skew.y)).toBe(true);
		
		// Alpha should be affected by Z-depth
		expect(pixiProps.alpha).toBeLessThan(1);
		expect(pixiProps.alpha).toBeGreaterThan(0);
	});

	test('should handle multiple lines with different skewZ values', () => {
		const transforms = [
			new Transform3D({ skewZ: 0 }),
			new Transform3D({ skewZ: 15 }),
			new Transform3D({ skewZ: 30 }),
			new Transform3D({ skewZ: -15 })
		];

		const pixiPropsArray = transforms.map(t => t.toPixiProperties());

		// Each should have different skew values
		const skewXValues = pixiPropsArray.map(p => p.skew.x);
		const uniqueSkewXValues = new Set(skewXValues);
		
		expect(uniqueSkewXValues.size).toBeGreaterThan(1);
		
		// All should be valid
		pixiPropsArray.forEach(props => {
			expect(isFinite(props.skew.x)).toBe(true);
			expect(isFinite(props.skew.y)).toBe(true);
		});
	});
});