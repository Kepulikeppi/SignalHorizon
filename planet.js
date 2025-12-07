import * as THREE from 'three';
import { VERTEX_SHADER, ROCKY_FRAGMENT, GAS_FRAGMENT } from './shaders/shaders_common.js';
import { SeededRandom } from './utils.js';

export class Planet {
    constructor(scene, seedValue, type = "terrestrial") {
        this.scene = scene;
        this.seedValue = seedValue; // The number, e.g. 12345
        this.type = type;
        
        // Initialize our custom Random Generator
        this.rng = new SeededRandom(seedValue);
        
        // Convert seed to Vector3 for shader noise offset
        this.seedVector = new THREE.Vector3(this.rng.random()*100, this.rng.random()*100, this.rng.random()*100);

        this.mesh = this.generate();
        this.scene.add(this.mesh);
    }

    generate() {
        let material;
        let geometry = new THREE.SphereGeometry(1, 128, 128);

        // --- TYPE 1: BARREN (Mercury-like) ---
        if (this.type === "barren") {
            material = new THREE.ShaderMaterial({
                vertexShader: VERTEX_SHADER,
                fragmentShader: ROCKY_FRAGMENT,
                uniforms: {
                    uSunDirection: { value: new THREE.Vector3(1.0, 0.5, 1.0).normalize() },
                    uSeed: { value: this.seedVector },
                    // Barren Params:
                    uWaterLevel: { value: -2.0 }, // Impossible to reach -> No water
                    uAtmosphereDensity: { value: 0.0 }, // No atmosphere
                    uColorWater: { value: new THREE.Vector3(0,0,0) }, // Irrelevant
                    uColorLand: { value: new THREE.Vector3(this.rng.range(0.3, 0.5), this.rng.range(0.2, 0.4), 0.2) }, // Grey/Brown
                    uColorMountain: { value: new THREE.Vector3(0.1, 0.1, 0.1) } // Dark Grey
                }
            });
        }
        
        // --- TYPE 2: TERRESTRIAL (Earth-like) ---
        else if (this.type === "terrestrial") {
            // Randomize colors based on seed
            const isAlien = this.rng.random() > 0.8; // 20% chance of weird colors
            
            const waterColor = isAlien ? new THREE.Vector3(0.5, 0.1, 0.6) : new THREE.Vector3(0.0, 0.2, 0.5);
            const landColor = isAlien ? new THREE.Vector3(0.4, 0.1, 0.1) : new THREE.Vector3(0.1, 0.4, 0.1);

            material = new THREE.ShaderMaterial({
                vertexShader: VERTEX_SHADER,
                fragmentShader: ROCKY_FRAGMENT,
                uniforms: {
                    uSunDirection: { value: new THREE.Vector3(1.0, 0.5, 1.0).normalize() },
                    uSeed: { value: this.seedVector },
                    // Terrestrial Params:
                    uWaterLevel: { value: this.rng.range(-0.1, 0.2) }, // Variable sea level
                    uAtmosphereDensity: { value: 0.6 },
                    uColorWater: { value: waterColor }, 
                    uColorLand: { value: landColor },
                    uColorMountain: { value: new THREE.Vector3(0.5, 0.45, 0.4) }
                }
            });
        }

        // --- TYPE 3: GAS GIANT ---
        else if (this.type === "gas") {
            material = new THREE.ShaderMaterial({
                vertexShader: VERTEX_SHADER,
                fragmentShader: GAS_FRAGMENT,
                uniforms: {
                    uSunDirection: { value: new THREE.Vector3(1.0, 0.5, 1.0).normalize() },
                    uSeed: { value: this.seedVector },
                    uTime: { value: 0.0 },
                    // Gas Params:
                    uColorPrimary: { value: new THREE.Vector3(this.rng.random(), this.rng.random(), this.rng.random()) },
                    uColorSecondary: { value: new THREE.Vector3(this.rng.random(), this.rng.random(), this.rng.random()) }
                }
            });
        }

        return new THREE.Mesh(geometry, material);
    }

    update(time) {
        this.mesh.rotation.y = time * 0.05;
        // Update uTime only if the shader has it (Gas Giant)
        if (this.mesh.material.uniforms.uTime) {
            this.mesh.material.uniforms.uTime.value = time;
        }
    }
    
    // Helper to cleanup old meshes before spawning new ones
    dispose() {
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}