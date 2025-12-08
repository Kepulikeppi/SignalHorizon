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
    type: "barren", // Changed to barren for testing

    // Shared params
    params: {
        rotationSpeed: 0.05   // 0.0 to 0.5
    },

    // Terrestrial-specific params
    terrestrial: {
        waterLevel: 0.0,      // -1.0 to 1.0
        atmoDensity: 0.6,     // 0.0 to 2.0
        cloudDensity: 0.5,    // 0.0 to 1.0
    },

    // Barren-specific params (ALL 10 PARAMETERS)
    barren: {
        // Crater settings
        craterLargeDensity: 3.0,    // 1.0 to 10.0 - How many large craters
        craterLargeDepth: 0.2,      // 0.0 to 0.5 - How deep large craters are
        craterMedDensity: 8.0,      // 2.0 to 20.0 - How many medium craters
        craterMedDepth: 0.08,       // 0.0 to 0.2 - How deep medium craters are
        
        // Terrain settings
        baseBumpiness: 0.05,        // 0.0 to 0.2 - Overall terrain waviness
        grainStrength: 0.005,       // 0.0 to 0.02 - Micro texture strength
        grainFrequency: 40.0,       // 10.0 to 100.0 - Micro texture scale
        displacementStrength: 0.05, // 0.0 to 0.15 - Silhouette deformation
        
        // Lighting settings
        normalStrength: 3.0,        // 0.5 to 8.0 - How sharp crater edges look
        surfaceGrit: 0.3,           // 0.0 to 1.0 - Visual surface noise
        ambientLight: 0.03,         // 0.0 to 0.2 - Brightness of dark side
    }
};
