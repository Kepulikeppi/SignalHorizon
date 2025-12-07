import { initScene, createStarfield } from './scene.js';
import { TerrestrialPlanet } from './planet_terrestrial.js';
import { BarrenPlanet } from './planet_barren.js';
import { GasPlanet } from './planet_gas.js';
import { GAME_DEFAULTS } from './scene-config.js'; // Import Defaults

// Setup
const { scene, camera, renderer, controls } = initScene();
createStarfield(scene);

// --- GLOBAL STATE ---
// Load defaults from config
const gameState = {
    type: GAME_DEFAULTS.type,
    seed: GAME_DEFAULTS.seed,
    params: { ...GAME_DEFAULTS.params } // Create a copy of the object
};

let currentPlanet = null;

// Initial Generation
generate();

// --- GENERATION LOGIC ---
function generate() {
    if (currentPlanet) currentPlanet.dispose();

    const config = {
        seed: gameState.seed,
        ...gameState.params
    };

    if (gameState.type === "gas") {
        currentPlanet = new GasPlanet(scene, config);
        toggleSliders(false);
    } else if (gameState.type === "barren") {
        currentPlanet = new BarrenPlanet(scene, config);
        toggleSliders(false);
    } else {
        currentPlanet = new TerrestrialPlanet(scene, config);
        toggleSliders(true);
    }
    
    console.log(`Generated: ${gameState.type} [Seed: ${gameState.seed}]`);
}

// --- SLIDER LOGIC ---
function updateParam(key, value) {
    gameState.params[key] = parseFloat(value);
    if (currentPlanet) {
        currentPlanet.updateParams({ [key]: gameState.params[key] });
    }
}

// Sync HTML sliders to Config Defaults on load
document.getElementById('inp-water').value = gameState.params.waterLevel;
document.getElementById('inp-atmo').value = gameState.params.atmoDensity;
document.getElementById('inp-clouds').value = gameState.params.cloudDensity;
document.getElementById('inp-rot').value = gameState.params.rotationSpeed;

document.getElementById('inp-water').addEventListener('input', (e) => updateParam('waterLevel', e.target.value));
document.getElementById('inp-atmo').addEventListener('input', (e) => updateParam('atmoDensity', e.target.value));
document.getElementById('inp-clouds').addEventListener('input', (e) => updateParam('cloudDensity', e.target.value));
document.getElementById('inp-rot').addEventListener('input', (e) => updateParam('rotationSpeed', e.target.value));

document.getElementById('btn-barren').addEventListener('click', () => { gameState.type = "barren"; generate(); });
document.getElementById('btn-terrestrial').addEventListener('click', () => { gameState.type = "terrestrial"; generate(); });
document.getElementById('btn-gas').addEventListener('click', () => { gameState.type = "gas"; generate(); });
document.getElementById('btn-seed').addEventListener('click', () => { 
    gameState.seed = Math.floor(Math.random() * 99999); 
    generate(); 
});

function toggleSliders(isTerrestrial) {
    const opacity = isTerrestrial ? "1.0" : "0.3";
    const pointerEvents = isTerrestrial ? "auto" : "none";
    const settings = document.getElementById('settings-panel');
    [settings.children[0], settings.children[1], settings.children[2]].forEach(el => {
        el.style.opacity = opacity;
        el.style.pointerEvents = pointerEvents;
    });
}

function animate(time) {
    requestAnimationFrame(animate);
    const t = time * 0.001;
    if (currentPlanet) currentPlanet.update(t);
    controls.update();
    renderer.render(scene, camera);
}

animate(0);