import { BARREN_HEIGHT_LOGIC } from './barren_height.js';

// --- VERTEX SHADER ---
export const BARREN_VERTEX = `
    uniform vec3 uSeed;
    
    varying vec3 vObjectPos;    // Position on the sphere (Local/Object space)
    varying vec3 vNormal;       // Normal of the sphere (Local/Object space)
    varying vec3 vWorldNormal;  // Base sphere normal in world space (for macro lighting)
    varying float vHeight;      // Height for coloring

    ${BARREN_HEIGHT_LOGIC}

    void main() {
        vObjectPos = position;
        vNormal = normal;
        
        // Transform the BASE sphere normal to world space for macro sun lighting
        // This gives us the day/night terminator independent of surface detail
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        
        // 1. Physical Displacement (Silhouette)
        float h = getSurfaceHeight(position, uSeed);
        vHeight = h;
        
        // Displace vertices along normal
        vec3 newPosition = position + (normal * h * 0.05);

        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
`;

// --- FRAGMENT SHADER ---
export const BARREN_FRAGMENT = `
    uniform vec3 uSunDirection; // FIXED World Space Sun
    uniform vec3 uSeed; 
    uniform vec3 uColorRock;
    uniform vec3 uColorCraters;

    varying vec3 vObjectPos;
    varying vec3 vNormal;
    varying vec3 vWorldNormal;  // Base world normal for macro lighting
    varying float vHeight;

    ${BARREN_HEIGHT_LOGIC}

    void main() {
        vec3 sunDir = normalize(uSunDirection);
        
        // 1. MACRO LIGHTING - Day/Night terminator based on sphere shape
        // This uses the smooth world normal from the base sphere geometry
        float macroLight = max(dot(vWorldNormal, sunDir), 0.0);
        
        // 2. CALCULATE MICRO NORMALS for crater detail lighting
        float eps = 0.001; 
        float h = vHeight;
        float h_x = getSurfaceHeight(vObjectPos + vec3(eps, 0, 0), uSeed);
        float h_y = getSurfaceHeight(vObjectPos + vec3(0, eps, 0), uSeed);
        float h_z = getSurfaceHeight(vObjectPos + vec3(0, 0, eps), uSeed);

        // Calculate gradient (The slope of the crater)
        vec3 gradient = vec3(h_x - h, h_y - h, h_z - h) / eps;

        // Perturb the local normal for micro detail
        vec3 localPerturbedNormal = normalize(vNormal - gradient * 3.0); 
        
        // For micro lighting, we compare against the local sun direction
        // Transform sun to local space for detail comparison
        vec3 localSunDir = normalize(vNormal); // approximate - use base normal direction
        float microDetail = max(dot(localPerturbedNormal, vNormal), 0.0);
        
        // Combine: use gradient to add local shadowing within craters
        float craterShadow = 1.0 - clamp(length(gradient) * 2.0, 0.0, 0.5);

        // 3. COLORING
        float isCrater = smoothstep(-0.02, 0.03, h); 
        vec3 albedo = mix(uColorCraters, uColorRock, isCrater);
        
        // Add subtle grit texture (reduced intensity)
        float grit = snoise(vObjectPos * 80.0 + uSeed);
        albedo *= (0.9 + 0.15 * grit);

        // 4. COMPOSITE LIGHTING
        // Macro light controls day/night, micro detail adds crater shadows
        float ambient = 0.03;
        float totalLight = ambient + (macroLight * 0.97 * craterShadow);
        
        vec3 finalColor = albedo * totalLight;

        gl_FragColor = vec4(finalColor, 1.0);
    }
`;