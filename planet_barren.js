import * as THREE from 'three';
import { SeededRandom } from './utils.js';
import { BARREN_VERTEX, BARREN_FRAGMENT } from './shaders/shader_barren.js';

export class BarrenPlanet {
    constructor(scene, config) {
        this.scene = scene;
        this.config = config; 
        this.rng = new SeededRandom(this.config.seed);
        
        // STATIC SUN in World Space
        this.worldSun = new THREE.Vector3(1.0, 0.5, 1.0).normalize();
        
        this.seedVector = new THREE.Vector3(
            this.rng.random() * 100, 
            this.rng.random() * 100, 
            this.rng.random() * 100
        );
        
        this.init();
    }

    init() {
        // Generate colors from seed (or use config if provided)
        const rockColor = this.config.rockColor || new THREE.Vector3(
            this.rng.range(0.6, 0.8), 
            this.rng.range(0.6, 0.7), 
            this.rng.range(0.6, 0.7)
        );
        
        const craterColor = this.config.craterColor || new THREE.Vector3(
            rockColor.x * 0.7, 
            rockColor.y * 0.7, 
            rockColor.z * 0.8 
        );

        // High resolution mesh
        const geometry = new THREE.SphereGeometry(1, 256, 256);
        
        const material = new THREE.ShaderMaterial({
            vertexShader: BARREN_VERTEX,
            fragmentShader: BARREN_FRAGMENT,
            uniforms: {
                // Base uniforms
                uSunDirection: { value: this.worldSun },
                uSeed: { value: this.seedVector },
                uColorRock: { value: rockColor },
                uColorCraters: { value: craterColor },
                
                // Crater parameters
                uCraterLargeDensity: { value: this.config.craterLargeDensity ?? 3.0 },
                uCraterLargeDepth: { value: this.config.craterLargeDepth ?? 0.2 },
                uCraterMedDensity: { value: this.config.craterMedDensity ?? 8.0 },
                uCraterMedDepth: { value: this.config.craterMedDepth ?? 0.08 },
                
                // Terrain parameters
                uBaseBumpiness: { value: this.config.baseBumpiness ?? 0.05 },
                uGrainStrength: { value: this.config.grainStrength ?? 0.005 },
                uGrainFrequency: { value: this.config.grainFrequency ?? 40.0 },
                uDisplacementStrength: { value: this.config.displacementStrength ?? 0.05 },
                
                // Lighting parameters
                uNormalStrength: { value: this.config.normalStrength ?? 3.0 },
                uSurfaceGrit: { value: this.config.surfaceGrit ?? 0.3 },
                uAmbientLight: { value: this.config.ambientLight ?? 0.03 }
            }
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);
    }

    updateParams(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        if (this.mesh && this.mesh.material.uniforms) {
            const u = this.mesh.material.uniforms;
            
            // Update all uniforms that exist in newConfig
            if (newConfig.craterLargeDensity !== undefined) u.uCraterLargeDensity.value = newConfig.craterLargeDensity;
            if (newConfig.craterLargeDepth !== undefined) u.uCraterLargeDepth.value = newConfig.craterLargeDepth;
            if (newConfig.craterMedDensity !== undefined) u.uCraterMedDensity.value = newConfig.craterMedDensity;
            if (newConfig.craterMedDepth !== undefined) u.uCraterMedDepth.value = newConfig.craterMedDepth;
            if (newConfig.baseBumpiness !== undefined) u.uBaseBumpiness.value = newConfig.baseBumpiness;
            if (newConfig.grainStrength !== undefined) u.uGrainStrength.value = newConfig.grainStrength;
            if (newConfig.grainFrequency !== undefined) u.uGrainFrequency.value = newConfig.grainFrequency;
            if (newConfig.displacementStrength !== undefined) u.uDisplacementStrength.value = newConfig.displacementStrength;
            if (newConfig.normalStrength !== undefined) u.uNormalStrength.value = newConfig.normalStrength;
            if (newConfig.surfaceGrit !== undefined) u.uSurfaceGrit.value = newConfig.surfaceGrit;
            if (newConfig.ambientLight !== undefined) u.uAmbientLight.value = newConfig.ambientLight;
            
            // Colors
            if (newConfig.rockColor !== undefined) u.uColorRock.value = newConfig.rockColor;
            if (newConfig.craterColor !== undefined) u.uColorCraters.value = newConfig.craterColor;
        }
    }
    
    update(time) {
        if (this.mesh) {
            this.mesh.rotation.y = time * this.config.rotationSpeed;
        }
    }
    
    dispose() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
    }
}
