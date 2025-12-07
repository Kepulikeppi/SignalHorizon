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
        const rockColor = new THREE.Vector3(
            this.rng.range(0.6, 0.8), 
            this.rng.range(0.6, 0.7), 
            this.rng.range(0.6, 0.7)
        );
        
        const craterColor = new THREE.Vector3(
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
                // Pass the Fixed Sun
                uSunDirection: { value: this.worldSun },
                uSeed: { value: this.seedVector },
                uColorRock: { value: rockColor },
                uColorCraters: { value: craterColor }
            }
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);
    }

    updateParams(newConfig) { this.config = { ...this.config, ...newConfig }; }
    
    update(time) {
        if (this.mesh) {
            // Rotate the planet. 
            // The shader handles the lighting rotation automatically via modelMatrix.
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