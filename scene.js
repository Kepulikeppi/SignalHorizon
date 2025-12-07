import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SCENE_CONFIG } from './scene-config.js'; // Import Config

export function initScene() {
    const scene = new THREE.Scene();
    const cfg = SCENE_CONFIG.camera;

    const camera = new THREE.PerspectiveCamera(cfg.fov, window.innerWidth / window.innerHeight, cfg.near, cfg.far);
    camera.position.z = cfg.initialZ;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = SCENE_CONFIG.controls.damping;
    controls.dampingFactor = SCENE_CONFIG.controls.dampingFactor;
    controls.minDistance = SCENE_CONFIG.controls.minDist;
    controls.maxDistance = SCENE_CONFIG.controls.maxDist;

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return { scene, camera, renderer, controls };
}

function createStarTexture() {
    const cfg = SCENE_CONFIG.skybox;

    const canvas = document.createElement('canvas');
    canvas.width = cfg.textureResolution;
    canvas.height = cfg.textureResolution / 2;
    const ctx = canvas.getContext('2d');

    // 1. Background
    ctx.fillStyle = cfg.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Tiny Stars
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < cfg.tinyStarCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const alpha = Math.random() * (cfg.tinyStarOpacityMax - cfg.tinyStarOpacityMin) + cfg.tinyStarOpacityMin;
        const size = Math.random() * (cfg.tinyStarSizeMax - cfg.tinyStarSizeMin) + cfg.tinyStarSizeMin;
        
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    // 3. Bright Stars
    for (let i = 0; i < cfg.brightStarCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const alpha = Math.random();
        const size = Math.random() * (cfg.brightStarSizeMax - cfg.brightStarSizeMin) + cfg.brightStarSizeMin;

        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    // 4. Nebulas
    for (let i = 0; i < cfg.nebulaCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * (cfg.nebulaSizeMax - cfg.nebulaSizeMin) + cfg.nebulaSizeMin;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, cfg.nebulaColorStart); 
        gradient.addColorStop(1, cfg.nebulaColorEnd);
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 1.0;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16; 
    return texture;
}

export function createStarfield(scene) {
    const starTexture = createStarTexture();
    const geometry = new THREE.SphereGeometry(SCENE_CONFIG.skybox.radius, 64, 64);
    
    const material = new THREE.MeshBasicMaterial({
        map: starTexture,
        side: THREE.BackSide,
        color: 0x888888 
    });

    const skybox = new THREE.Mesh(geometry, material);
    scene.add(skybox);
}