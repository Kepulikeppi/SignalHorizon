import { NOISE_FUNCTIONS } from './shaders_common.js';

export const GAS_FRAGMENT = `
    uniform vec3 uSunDirection;
    uniform vec3 uSeed;
    uniform vec3 uColorPrimary;
    uniform vec3 uColorSecondary;
    uniform float uTime;

    varying vec3 vNormal;
    varying vec3 vPosition;

    ${NOISE_FUNCTIONS}

    void main() {
        vec3 stretchedPos = vPosition;
        stretchedPos.y *= 10.0;
        stretchedPos.x *= 0.5;
        float noiseVal = fbm(stretchedPos + uSeed + vec3(uTime * 0.1, 0.0, 0.0));
        vec3 color = mix(uColorPrimary, uColorSecondary, noiseVal);
        float diff = max(dot(vNormal, uSunDirection), 0.0) * 0.8 + 0.2;
        vec3 viewDir = normalize(cameraPosition - vPosition);
        float fresnel = pow(1.0 - dot(viewDir, vNormal), 2.0);
        vec3 finalColor = color * diff + (color * fresnel * 0.5);
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;