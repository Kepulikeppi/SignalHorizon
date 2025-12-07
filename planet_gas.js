import * as THREE from 'three';
import { VERTEX_SHADER } from './shaders/shaders_common.js';
import { GAS_FRAGMENT } from './shaders/shader_gas.js';
import { SeededRandom } from './utils.js';

export class GasPlanet {
    constructor(scene, config) {
        this.scene = scene;
        this.config = config;
        
        this.rng = new SeededRandom(this.config.seed);
        
        // Critical: Generate the seed vector
        this.seedVector = new THREE.Vector3(
            this.rng.random() * 100, 
            this.rng.random() * 100, 
            this.rng.random() * 100
        );
        
        this.mesh = this.init();
        this.scene.add(this.mesh);
    }

    init() {
        const geometry = new THREE.SphereGeometry(1, 128, 128);
        const material = new THREE.ShaderMaterial({
            vertexShader: VERTEX_SHADER,
            fragmentShader: GAS_FRAGMENT,
            uniforms: {
                uSunDirection: { value: new THREE.Vector3(1.0, 0.5, 1.0).normalize() },
                uSeed: { value: this.seedVector },
                uTime: { value: 0.0 },
                uColorPrimary: { value: new THREE.Vector3(this.rng.random(), this.rng.random(), this.rng.random()) },
                uColorSecondary: { value: new THREE.Vector3(this.rng.random(), this.rng.random(), this.rng.random()) }
            }
        });
        return new THREE.Mesh(geometry, material);
    }

    updateParams(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    update(time) {
        if (this.mesh) {
            this.mesh.rotation.y = time * this.config.rotationSpeed;
            this.mesh.material.uniforms.uTime.value = time;
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