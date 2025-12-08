// A library specifically for generating crater shapes
// Uses a self-contained hash function to avoid dependency errors

export const CRATER_LOGIC = `
    // Fast 3D Hash Function (Dave_Hoskins)
    // Input: vec3, Output: vec3 (Random Offset)
    vec3 hash33(vec3 p3) {
        p3 = fract(p3 * vec3(.1031, .1030, .0973));
        p3 += dot(p3, p3.yxz+33.33);
        return fract((p3.xxy + p3.yxx)*p3.zyx);
    }

    // 3D Voronoi / Cellular Noise
    // Returns: x = distance to closest point, y = random ID of that point
    vec2 cellular(vec3 P) {
        const float K = 0.142857142857; // 1/7
        const float jitter = 0.8; // How random the spacing is
        
        vec3 Pi = floor(P);
        vec3 Pf = fract(P);
        
        float min_dist = 10.0;
        float id_rand = 0.0;
        
        // Check neighbors
        for(int i=-1; i<=1; i++) {
            for(int j=-1; j<=1; j++) {
                for(int k=-1; k<=1; k++) {
                    vec3 p = vec3(float(i), float(j), float(k));
                    
                    // Get random offset for this neighbor cell
                    vec3 rand_offset = hash33(Pi + p);
                    
                    vec3 center = p + rand_offset * jitter;
                    vec3 d_vec = Pf - center;
                    float d = dot(d_vec, d_vec); // Squared distance
                    
                    if(d < min_dist) {
                        min_dist = d;
                        // Use the x component of the hash as the ID
                        id_rand = rand_offset.x; 
                    }
                }
            }
        }
        return vec2(sqrt(min_dist), id_rand);
    }

    // THE CRATER PROFILE FUNCTION
    float getCraterHeight(vec3 p, float density, float size) {
        // 1. Get distance to nearest crater center
        // We scale p by density to grid-ify it
        vec2 cell = cellular(p * density);
        float dist = cell.x; // Distance from center
        float rand = cell.y; // Random ID

        // 2. Filter: Only create craters if rand > threshold
        // This creates sparse craters instead of a honeycomb
        if (rand > 0.5) return 0.0; 

        // 3. Shape the Crater
        float radius = 0.3 + (rand * 0.2); // Random radius
        
        // The Bowl (Hole)
        float bowl = smoothstep(radius, 0.0, dist); 
        
        // The Rim (Ridge)
        float rim = smoothstep(radius + 0.1, radius, dist) * smoothstep(radius - 0.1, radius, dist);
        
        return (rim * 0.25) - (bowl * 0.6); 
    }
`;
