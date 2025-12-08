import { initScene, createStarfield } from './scene.js';
import { TerrestrialPlanet } from './planet_terrestrial.js';
import { BarrenPlanet } from './planet_barren.js';
import { GasPlanet } from './planet_gas.js';
import { GAME_DEFAULTS } from './scene-config.js';

// Setup
const { scene, camera, renderer, controls } = initScene();
createStarfield(scene);

// --- GLOBAL STATE ---
const gameState = {
    type: GAME_DEFAULTS.type,
    seed: GAME_DEFAULTS.seed,
    params: { ...GAME_DEFAULTS.params },
    terrestrial: { ...GAME_DEFAULTS.terrestrial },
    barren: { ...GAME_DEFAULTS.barren }
};

let currentPlanet = null;

// Initial Generation
generate();

// --- GENERATION LOGIC ---
function generate() {
    if (currentPlanet) currentPlanet.dispose();

    if (gameState.type === "gas") {
        const config = {
            seed: gameState.seed,
            rotationSpeed: gameState.params.rotationSpeed
        };
        currentPlanet = new GasPlanet(scene, config);
        showPanel(null);
    } else if (gameState.type === "barren") {
        const config = {
            seed: gameState.seed,
            rotationSpeed: gameState.params.rotationSpeed,
            ...gameState.barren
        };
        currentPlanet = new BarrenPlanet(scene, config);
        showPanel('barren');
    } else {
        const config = {
            seed: gameState.seed,
            rotationSpeed: gameState.params.rotationSpeed,
            ...gameState.terrestrial
        };
        currentPlanet = new TerrestrialPlanet(scene, config);
        showPanel('terrestrial');
    }
    
    console.log(`Generated: ${gameState.type} [Seed: ${gameState.seed}]`);
}

// --- PANEL VISIBILITY ---
function showPanel(type) {
    document.getElementById('settings-panel-terrestrial').classList.remove('active');
    document.getElementById('settings-panel-barren').classList.remove('active');
    
    if (type === 'terrestrial') {
        document.getElementById('settings-panel-terrestrial').classList.add('active');
    } else if (type === 'barren') {
        document.getElementById('settings-panel-barren').classList.add('active');
    }
}

// --- TERRESTRIAL SLIDER LOGIC ---
function updateTerrestrialParam(key, value) {
    gameState.terrestrial[key] = parseFloat(value);
    if (currentPlanet && gameState.type === 'terrestrial') {
        currentPlanet.updateParams({ [key]: gameState.terrestrial[key] });
    }
}

// Sync terrestrial sliders
document.getElementById('inp-water').value = gameState.terrestrial.waterLevel;
document.getElementById('inp-atmo').value = gameState.terrestrial.atmoDensity;
document.getElementById('inp-clouds').value = gameState.terrestrial.cloudDensity;
document.getElementById('inp-rot').value = gameState.params.rotationSpeed;

document.getElementById('inp-water').addEventListener('input', (e) => updateTerrestrialParam('waterLevel', e.target.value));
document.getElementById('inp-atmo').addEventListener('input', (e) => updateTerrestrialParam('atmoDensity', e.target.value));
document.getElementById('inp-clouds').addEventListener('input', (e) => updateTerrestrialParam('cloudDensity', e.target.value));
document.getElementById('inp-rot').addEventListener('input', (e) => {
    gameState.params.rotationSpeed = parseFloat(e.target.value);
});

// --- BARREN SLIDER LOGIC ---
function updateBarrenParam(key, value, displayId) {
    const val = parseFloat(value);
    gameState.barren[key] = val;
    
    // Update display value
    if (displayId) {
        const displayEl = document.getElementById(displayId);
        if (displayEl) {
            // Format based on the magnitude
            if (val < 0.01) displayEl.textContent = val.toFixed(3);
            else if (val < 1) displayEl.textContent = val.toFixed(2);
            else displayEl.textContent = val.toFixed(1);
        }
    }
    
    if (currentPlanet && gameState.type === 'barren') {
        currentPlanet.updateParams({ [key]: val });
    }
}

// Barren slider mappings: [inputId, paramKey, displayId]
const barrenSliders = [
    ['inp-lgDensity', 'craterLargeDensity', 'val-lgDensity'],
    ['inp-lgDepth', 'craterLargeDepth', 'val-lgDepth'],
    ['inp-mdDensity', 'craterMedDensity', 'val-mdDensity'],
    ['inp-mdDepth', 'craterMedDepth', 'val-mdDepth'],
    ['inp-bump', 'baseBumpiness', 'val-bump'],
    ['inp-grainStr', 'grainStrength', 'val-grainStr'],
    ['inp-grainFreq', 'grainFrequency', 'val-grainFreq'],
    ['inp-disp', 'displacementStrength', 'val-disp'],
    ['inp-normStr', 'normalStrength', 'val-normStr'],
    ['inp-grit', 'surfaceGrit', 'val-grit'],
    ['inp-ambient', 'ambientLight', 'val-ambient'],
];

// Initialize barren sliders
barrenSliders.forEach(([inputId, paramKey, displayId]) => {
    const input = document.getElementById(inputId);
    if (input) {
        input.value = gameState.barren[paramKey];
        // Set initial display value
        const val = gameState.barren[paramKey];
        const displayEl = document.getElementById(displayId);
        if (displayEl) {
            if (val < 0.01) displayEl.textContent = val.toFixed(3);
            else if (val < 1) displayEl.textContent = val.toFixed(2);
            else displayEl.textContent = val.toFixed(1);
        }
        // Add listener
        input.addEventListener('input', (e) => updateBarrenParam(paramKey, e.target.value, displayId));
    }
});

// Barren rotation slider
document.getElementById('inp-rotBarren').value = gameState.params.rotationSpeed;
document.getElementById('val-rotBarren').textContent = gameState.params.rotationSpeed.toFixed(2);
document.getElementById('inp-rotBarren').addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    gameState.params.rotationSpeed = val;
    document.getElementById('val-rotBarren').textContent = val.toFixed(2);
});

// --- TYPE BUTTONS ---
document.getElementById('btn-barren').addEventListener('click', () => { gameState.type = "barren"; generate(); });
document.getElementById('btn-terrestrial').addEventListener('click', () => { gameState.type = "terrestrial"; generate(); });
document.getElementById('btn-gas').addEventListener('click', () => { gameState.type = "gas"; generate(); });
document.getElementById('btn-seed').addEventListener('click', () => { 
    gameState.seed = Math.floor(Math.random() * 99999); 
    generate(); 
});

// --- ANIMATION LOOP ---
function animate(time) {
    requestAnimationFrame(animate);
    const t = time * 0.001;
    if (currentPlanet) currentPlanet.update(t);
    controls.update();
    renderer.render(scene, camera);
}

animate(0);
