import { BARREN_HEIGHT_LOGIC } from './barren_height.js';

// --- VERTEX SHADER ---
export const BARREN_VERTEX = `
    uniform vec3 uSeed;
    
    varying vec3 vObjectPos; // Position on the sphere (Local)
    varying vec3 vNormal;    // Normal of the sphere (Local)
    varying float vHeight;   // Height for coloring

    ${BARREN_HEIGHT_LOGIC}

    void main() {
        vObjectPos = position;
        vNormal = normal; // Pass local normal to fragment
        
        // 1. Physical Displacement (Silhouette)
        // We calculate height here to push the vertices out/in
        float h = getSurfaceHeight(position, uSeed);
        vHeight = h;
        
        // Displace: 0.05 is enough for a silhouette. 
        // Too high = spikes. Detail comes from lighting, not displacement.
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
    varying float vHeight;

    ${BARREN_HEIGHT_LOGIC}

    void main() {
        // 1. CALCULATE HIGH-RES NORMALS (Per Pixel)
        // We calculate the slope of the noise at this specific pixel
        float eps = 0.001; 
        float h = vHeight; // Use interpolated height for center
        float h_x = getSurfaceHeight(vObjectPos + vec3(eps, 0, 0), uSeed);
        float h_y = getSurfaceHeight(vObjectPos + vec3(0, eps, 0), uSeed);
        float h_z = getSurfaceHeight(vObjectPos + vec3(0, 0, eps), uSeed);

        // Calculate gradient (The slope of the crater)
        vec3 gradient = vec3(h_x - h, h_y - h, h_z - h) / eps;

        // Perturb the Local Normal
        // Strength 5.0 makes the craters look deep
        vec3 localPerturbedNormal = normalize(vNormal - gradient * 5.0); 

        // 2. CONVERT TO WORLD SPACE
        // This is the critical step. We take our detailed local normal
        // and rotate it by the planet's rotation (modelMatrix) so it faces the universe correctly.
        // Note: modelMatrix is provided by Three.js automatically.
        vec3 worldNormal = normalize(mat3(modelMatrix) * localPerturbedNormal);

        // 3. LIGHTING (Shadows)
        // Now we compare the Rotating Planet Surface against the Fixed Sun
        vec3 sunDir = normalize(uSunDirection);
        float diff = max(dot(worldNormal, sunDir), 0.0);
        
        // Sharp Terminator: Make the transition from light to dark crisp
        // This helps the "Moon" look
        // diff = smoothstep(0.0, 0.2, diff); 

        // 4. COLORING
        float isCrater = smoothstep(-0.02, 0.03, h); 
        vec3 albedo = mix(uColorCraters, uColorRock, isCrater);
        
        // Add detailed grit texture
        float grit = snoise(vObjectPos * 120.0 + uSeed);
        albedo *= (0.8 + 0.3 * grit);

        // 5. COMPOSITE
        // Diffuse + very low ambient (0.01) so shadows are BLACK
        vec3 finalColor = albedo * (diff + 0.01);

        gl_FragColor = vec4(finalColor, 1.0);
    }
`;