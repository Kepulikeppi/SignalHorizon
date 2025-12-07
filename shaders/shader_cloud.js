import { NOISE_FUNCTIONS } from './shaders_common.js';

export const CLOUD_FRAGMENT = `
    uniform float uTime;
    uniform float uCloudDensity;
    uniform vec3 uSeed;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    ${NOISE_FUNCTIONS}
    
    void main() {
        float n = fbm(vPosition * 1.5 + uSeed + vec3(uTime * 0.02, 0.0, 0.0));
        
        float threshold = 0.6 - (uCloudDensity * 0.6); 
        float alpha = smoothstep(threshold, threshold + 0.1, n);
        
        vec3 sunDir = normalize(vec3(1.0, 0.5, 1.0));
        float diff = max(dot(vNormal, sunDir), 0.0);
        vec3 cloudColor = vec3(0.95) * (0.3 + diff * 0.7);

        gl_FragColor = vec4(cloudColor, alpha); 
    }
`;