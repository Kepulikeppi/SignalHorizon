import { NOISE_FUNCTIONS } from './shaders_common.js';
import { CRATER_LOGIC } from './crater_logic.js'; 

export const BARREN_HEIGHT_LOGIC = `
    ${NOISE_FUNCTIONS}
    ${CRATER_LOGIC}

    // These uniforms will be declared in the main shader
    // uCraterLargeDensity, uCraterLargeDepth
    // uCraterMedDensity, uCraterMedDepth
    // uBaseBumpiness, uGrainStrength, uGrainFrequency

    float getSurfaceHeight(vec3 p, vec3 seed, float largeDensity, float largeDepth, float medDensity, float medDepth, float baseBump, float grainStr, float grainFreq) {
        // 1. General Shape - gentle lumps
        float base = fbm(p * 1.0 + seed) * baseBump;
        
        // 2. Large Craters - Sparse but deep
        float cratersLarge = getCraterHeight(p + seed, largeDensity, 1.0) * largeDepth; 
        
        // 3. Medium Craters - More frequent
        float cratersMed = getCraterHeight(p + seed + vec3(12.3), medDensity, 1.0) * medDepth;
        
        // 4. Micro Texture
        float grain = snoise(p * grainFreq + seed) * grainStr;

        return base + cratersLarge + cratersMed + grain;
    }
`;
