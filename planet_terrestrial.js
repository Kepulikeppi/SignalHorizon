import * as THREE from 'three';
import { VERTEX_SHADER } from './shaders/shaders_common.js';
import { TERRESTRIAL_FRAGMENT } from './shaders/shader_terrestrial.js';
import { CLOUD_FRAGMENT } from './shaders/shader_cloud.js';
import { SeededRandom } from './utils.js';

export class TerrestrialPlanet {
    constructor(scene, config) {
        this.scene = scene;
        this.config = config;
        this.rng = new SeededRandom(this.config.seed);
        this.seedVector = new THREE.Vector3(this.rng.random()*100, this.rng.random()*100, this.rng.random()*100);
        this.meshes = [];
        this.init();
    }

    init() {
        const isAlien = this.rng.random() > 0.8;
        const waterVal = isAlien ? new THREE.Vector3(0.6, 0.2, 0.6) : new THREE.Vector3(0.0, 0.3, 0.6);
        const landVal  = isAlien ? new THREE.Vector3(0.5, 0.1, 0.1) : new THREE.Vector3(0.1, 0.45, 0.1);
        const desertVal = isAlien ? new THREE.Vector3(0.8, 0.4, 0.2) : new THREE.Vector3(0.75, 0.65, 0.4);

        const params = {
            waterLevel: this.config.waterLevel, // Use config directly
            atmoDensity: this.config.atmoDensity,
            colorWater: waterVal,
            colorOceanDeep: new THREE.Vector3(waterVal.x * 0.5, waterVal.y * 0.5, waterVal.z * 0.5),
            colorLand: landVal,
            colorDesert: desertVal,
            colorIce: new THREE.Vector3(0.95, 0.95, 1.0),
        };

        // 1. SURFACE
        const geometry = new THREE.SphereGeometry(1, 128, 128);
        const material = new THREE.ShaderMaterial({
            vertexShader: VERTEX_SHADER,
            fragmentShader: TERRESTRIAL_FRAGMENT,
            uniforms: {
                uSunDirection: { value: new THREE.Vector3(1.0, 0.5, 1.0).normalize() },
                uSeed: { value: this.seedVector },
                uColorWater: { value: params.colorWater },
                uColorOceanDeep: { value: params.colorOceanDeep },
                uColorLand: { value: params.colorLand },
                uColorDesert: { value: params.colorDesert },
                uColorIce: { value: params.colorIce },
                uWaterLevel: { value: params.waterLevel },
                uAtmosphereDensity: { value: params.atmoDensity }
            }
        });

        this.surface = new THREE.Mesh(geometry, material);
        this.scene.add(this.surface);
        this.meshes.push(this.surface);

        // 2. CLOUDS
        this.createClouds();
    }

    createClouds() {
        const cloudGeo = new THREE.SphereGeometry(1.02, 64, 64);
        const cloudMat = new THREE.ShaderMaterial({
            transparent: true,
            vertexShader: VERTEX_SHADER,
            fragmentShader: CLOUD_FRAGMENT,
            uniforms: { 
                uTime: { value: 0.0 },
                uSeed: { value: this.seedVector },
                uCloudDensity: { value: this.config.cloudDensity } // Pass initial config value
            }
        });
        this.clouds = new THREE.Mesh(cloudGeo, cloudMat);
        this.scene.add(this.clouds);
        this.meshes.push(this.clouds);
        
        // Initial check
        this.clouds.visible = this.config.cloudDensity > 0.01;
    }

    updateParams(newConfig) {
        this.config = { ...this.config, ...newConfig };

        if (this.surface) {
            this.surface.material.uniforms.uWaterLevel.value = this.config.waterLevel;
            this.surface.material.uniforms.uAtmosphereDensity.value = this.config.atmoDensity;
        }
        
        // FIX: Update the actual Uniform in the shader!
        if (this.clouds) {
            this.clouds.visible = this.config.cloudDensity > 0.01;
            this.clouds.material.uniforms.uCloudDensity.value = this.config.cloudDensity;
        }
    }

    update(time) {
        if (this.surface) this.surface.rotation.y = time * this.config.rotationSpeed;
        if (this.clouds) {
            this.clouds.rotation.y = time * (this.config.rotationSpeed * 1.2);
            this.clouds.material.uniforms.uTime.value = time;
        }
    }

    dispose() {
        this.meshes.forEach(mesh => {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
        this.meshes = [];
    }
}