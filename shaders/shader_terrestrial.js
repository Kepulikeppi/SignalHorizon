import { NOISE_FUNCTIONS } from './shaders_common.js';

export const TERRESTRIAL_FRAGMENT = `
    uniform vec3 uSunDirection;
    uniform vec3 uSeed; 
    uniform vec3 uColorWater;
    uniform vec3 uColorOceanDeep;
    uniform vec3 uColorLand;
    uniform vec3 uColorDesert;
    uniform vec3 uColorIce;
    uniform float uWaterLevel;
    uniform float uAtmosphereDensity;

    varying vec3 vNormal;
    varying vec3 vPosition;

    ${NOISE_FUNCTIONS}

    void main() {
        float lat = abs(vPosition.y); 
        float hBase = fbm(vPosition * 2.0 + uSeed); 
        float hDetail = fbm(vPosition * 10.0 + uSeed); 
        float height = hBase + (hDetail * 0.1);

        float tempNoise = snoise(vPosition * 3.0 + uSeed);
        float temperature = (1.0 - lat) + (tempNoise * 0.2);

        float moistureWave = cos(lat * 6.0); 
        float moistureNoise = snoise(vPosition * 4.0 + uSeed + vec3(10.0));
        float moisture = moistureWave + moistureNoise;

        vec3 color = vec3(0.0);
        float specular = 0.0;
        
        if (height < uWaterLevel) {
            specular = 1.0;
            float depth = (uWaterLevel - height) * 2.0;
            color = mix(uColorWater, uColorOceanDeep, clamp(depth, 0.0, 1.0));
        } else {
            if (height < uWaterLevel + 0.05) {
                 color = uColorDesert;
                 specular = 0.2;
            } else {
                if (temperature < 0.15) {
                    color = uColorIce;
                    specular = 0.4;
                } else if (temperature < 0.3) {
                    color = mix(uColorLand, vec3(0.5), 0.5);
                } else if (moisture < -0.2) {
                    color = uColorDesert;
                } else {
                    float vegVar = snoise(vPosition * 20.0); 
                    vec3 jungle = uColorLand * 0.6; 
                    color = mix(uColorLand, jungle, smoothstep(0.0, 1.0, moisture));
                    if (height > 0.65) color = mix(color, vec3(0.3), 0.8);
                    if (height > 0.85 && temperature < 0.8) color = uColorIce;
                }
            }
        }

        vec3 ambient = vec3(0.05);
        float diff = max(dot(vNormal, uSunDirection), 0.0);
        vec3 viewDir = normalize(cameraPosition - vPosition);
        vec3 reflectDir = reflect(-uSunDirection, vNormal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
        
        vec3 finalColor = color * (ambient + diff) + (vec3(1.0) * spec * specular);

        if (uAtmosphereDensity > 0.0) {
            float fresnel = pow(1.0 - dot(viewDir, vNormal), 3.0);
            vec3 skyColor = vec3(0.4, 0.7, 1.0); 
            finalColor += skyColor * fresnel * uAtmosphereDensity;
        }

        gl_FragColor = vec4(finalColor, 1.0);
    }
`;
