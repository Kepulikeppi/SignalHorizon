import { NOISE_FUNCTIONS } from './shaders_common.js';
import { CRATER_LOGIC } from './crater_logic.js'; 

export const BARREN_HEIGHT_LOGIC = `
    ${NOISE_FUNCTIONS}
    ${CRATER_LOGIC}

    float getSurfaceHeight(vec3 p, vec3 seed) {
        // 1. General Shape - gentle lumps
        float base = fbm(p * 1.0 + seed) * 0.05;
        
        // 2. Large Craters - Sparse but deep
        // density 3.0, size 1.0
        float cratersLarge = getCraterHeight(p + seed, 3.0, 1.0) * 0.2; 
        
        // 3. Medium Craters - More frequent
        // density 8.0
        float cratersMed = getCraterHeight(p + seed + vec3(12.3), 8.0, 1.0) * 0.08;
        
        // 4. Micro Texture - Very subtle to avoid aliasing
        float grain = snoise(p * 40.0 + seed) * 0.005;

        return base + cratersLarge + cratersMed + grain;
    }
`;