import { BARREN_HEIGHT_LOGIC } from './barren_height.js';

// --- VERTEX SHADER ---
export const BARREN_VERTEX = `
    uniform vec3 uSeed;
    
    // Terrain generation uniforms
    uniform float uCraterLargeDensity;
    uniform float uCraterLargeDepth;
    uniform float uCraterMedDensity;
    uniform float uCraterMedDepth;
    uniform float uBaseBumpiness;
    uniform float uGrainStrength;
    uniform float uGrainFrequency;
    uniform float uDisplacementStrength;
    
    varying vec3 vObjectPos;
    varying vec3 vNormal;
    varying vec3 vWorldNormal;
    varying float vHeight;

    ${BARREN_HEIGHT_LOGIC}

    void main() {
        vObjectPos = position;
        vNormal = normal;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        
        // Calculate height with all parameters
        float h = getSurfaceHeight(
            position, uSeed,
            uCraterLargeDensity, uCraterLargeDepth,
            uCraterMedDensity, uCraterMedDepth,
            uBaseBumpiness, uGrainStrength, uGrainFrequency
        );
        vHeight = h;
        
        // Displace vertices along normal
        vec3 newPosition = position + (normal * h * uDisplacementStrength);

        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
`;

// --- FRAGMENT SHADER ---
export const BARREN_FRAGMENT = `
    uniform vec3 uSunDirection;
    uniform vec3 uSeed; 
    uniform vec3 uColorRock;
    uniform vec3 uColorCraters;
    
    // Terrain generation uniforms (needed for normal calculation)
    uniform float uCraterLargeDensity;
    uniform float uCraterLargeDepth;
    uniform float uCraterMedDensity;
    uniform float uCraterMedDepth;
    uniform float uBaseBumpiness;
    uniform float uGrainStrength;
    uniform float uGrainFrequency;
    
    // Lighting uniforms
    uniform float uNormalStrength;
    uniform float uSurfaceGrit;
    uniform float uAmbientLight;

    varying vec3 vObjectPos;
    varying vec3 vNormal;
    varying vec3 vWorldNormal;
    varying float vHeight;

    ${BARREN_HEIGHT_LOGIC}

    void main() {
        vec3 sunDir = normalize(uSunDirection);
        
        // 1. MACRO LIGHTING - Day/Night terminator
        float macroLight = max(dot(vWorldNormal, sunDir), 0.0);
        
        // 2. CALCULATE MICRO NORMALS for crater detail
        float eps = 0.001; 
        float h = vHeight;
        float h_x = getSurfaceHeight(
            vObjectPos + vec3(eps, 0, 0), uSeed,
            uCraterLargeDensity, uCraterLargeDepth,
            uCraterMedDensity, uCraterMedDepth,
            uBaseBumpiness, uGrainStrength, uGrainFrequency
        );
        float h_y = getSurfaceHeight(
            vObjectPos + vec3(0, eps, 0), uSeed,
            uCraterLargeDensity, uCraterLargeDepth,
            uCraterMedDensity, uCraterMedDepth,
            uBaseBumpiness, uGrainStrength, uGrainFrequency
        );
        float h_z = getSurfaceHeight(
            vObjectPos + vec3(0, 0, eps), uSeed,
            uCraterLargeDensity, uCraterLargeDepth,
            uCraterMedDensity, uCraterMedDepth,
            uBaseBumpiness, uGrainStrength, uGrainFrequency
        );

        vec3 gradient = vec3(h_x - h, h_y - h, h_z - h) / eps;
        vec3 localPerturbedNormal = normalize(vNormal - gradient * uNormalStrength); 
        
        float craterShadow = 1.0 - clamp(length(gradient) * 2.0, 0.0, 0.5);

        // 3. COLORING
        float isCrater = smoothstep(-0.02, 0.03, h); 
        vec3 albedo = mix(uColorCraters, uColorRock, isCrater);
        
        // Surface grit texture
        float grit = snoise(vObjectPos * 80.0 + uSeed);
        albedo *= (1.0 - uSurfaceGrit * 0.5) + (uSurfaceGrit * grit);

        // 4. COMPOSITE LIGHTING
        float totalLight = uAmbientLight + ((1.0 - uAmbientLight) * macroLight * craterShadow);
        
        vec3 finalColor = albedo * totalLight;

        gl_FragColor = vec4(finalColor, 1.0);
    }
`;
