// ==========================================================
// SCENE CONFIGURATION
// Tweak these values to change the look and feel of the game
// without touching the core logic code.
// ==========================================================

export const SCENE_CONFIG = {
    // --- CAMERA SETTINGS ---
    camera: {
        fov: 45,
        near: 0.1,
        far: 2000,
        initialZ: 2.7, // Distance from planet
    },
    
    // --- CONTROLS (MOUSE) ---
    controls: {
        damping: true,
        dampingFactor: 0.05,
        minDist: 1.5, // Closest zoom
        maxDist: 10.0, // Furthest zoom (inside skybox)
    },

    // --- SKYBOX / STARS ---
    skybox: {
        radius: 900,
        textureResolution: 4096, // 4096 = Crisp, 2048 = Faster
        bgColor: '#000000',
        
        // Background Dust Stars
        tinyStarCount: 10000,
        tinyStarSizeMin: 0.1,
        tinyStarSizeMax: 0.2, // Keep small for realism
        tinyStarOpacityMin: 0.2,
        tinyStarOpacityMax: 1.0,

        // Bright Constellation Stars
        brightStarCount: 300,
        brightStarSizeMin: 0.4,
        brightStarSizeMax: 0.8,

        // Nebulas (The faint blue clouds)
        nebulaCount: 6,
        nebulaSizeMin: 200,
        nebulaSizeMax: 600,
        nebulaColorStart: 'rgba(30, 50, 90, 0.10)',
        nebulaColorEnd: 'rgba(0, 0, 0, 0)'
    }
};

// --- DEFAULT GAMEPLAY VALUES ---
export const GAME_DEFAULTS = {
    // Starting Seed
    seed: 12345,
    
    // Default Planet Type on Load
    type: "terrestrial", 

    // Initial Slider Values
    params: {
        waterLevel: 0.0,      // -1.0 to 1.0
        atmoDensity: 0.6,     // 0.0 to 2.0
        cloudDensity: 0.5,    // 0.0 to 1.0
        rotationSpeed: 0.05   // 0.0 to 0.5
    }
};