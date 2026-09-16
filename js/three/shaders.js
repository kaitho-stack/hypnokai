/**
 * Dynamic Quantum-to-Hypno GLSL Shaders
 * Warps from smooth quantum glass into a pulsating Hypnokai hypnotic spiral vortex.
 */

export const GlassFresnelShader = {
  uniforms: {
    uTime: { value: 0.0 },
    uColor: { value: [0.10, 0.18, 0.98] },          // Quantum Indigo
    uAccent: { value: [0.0, 0.96, 0.83] },         // Quantum Cyan
    uAccent2: { value: [0.95, 0.15, 0.58] },       // Magenta rim
    uHypnoBlend: { value: 0.0 },                   // 0.0 = Quantum, 1.0 = Hypno alter-ego
    uFresnelPower: { value: 2.4 },
    uRoughness: { value: 0.15 },
    uDispersion: { value: 0.35 },
    uMouse: { value: [0.0, 0.0] }
  },

  vertexShader: /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    uniform float uTime;
    uniform float uHypnoBlend;
    uniform vec2 uMouse;

    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;

      // 1. Quantum subtle wave breath
      float quantumWave = sin(position.x * 2.0 + uTime * 0.9) * cos(position.y * 2.0 + uTime * 0.7) * 0.035;

      // 2. Hypno Vortex Warp: Spiral expansion & psychedelic ripple
      float angle = atan(position.y, position.x);
      float dist = length(position.xy);
      float hypnoSpiral = sin(dist * 6.5 - uTime * 2.8 + angle * 4.0) * 0.12 * uHypnoBlend;
      float hypnoTwist = cos(position.z * 4.0 + uTime * 2.0) * 0.08 * uHypnoBlend;

      vec3 modifiedPos = position + normal * (quantumWave * (1.0 - uHypnoBlend) + hypnoSpiral + hypnoTwist);

      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(modifiedPos, 1.0);
      vViewDir = normalize(-mvPosition.xyz);

      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform vec3 uColor;
    uniform vec3 uAccent;
    uniform vec3 uAccent2;
    uniform float uHypnoBlend;
    uniform float uFresnelPower;
    uniform float uRoughness;
    uniform float uDispersion;

    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying vec3 vWorldPosition;
    varying vec2 vUv;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewDir);

      float NdotV = clamp(dot(normal, viewDir), 0.0, 1.0);
      float fresnel = pow(1.0 - NdotV, uFresnelPower);

      // Chromatic dispersion
      float fresnelR = pow(1.0 - clamp(NdotV - uDispersion * 0.08, 0.0, 1.0), uFresnelPower);
      float fresnelG = pow(1.0 - clamp(NdotV, 0.0, 1.0), uFresnelPower);
      float fresnelB = pow(1.0 - clamp(NdotV + uDispersion * 0.08, 0.0, 1.0), uFresnelPower);

      // Specular shine
      vec3 lightDir = normalize(vec3(0.6, 1.2, 1.6));
      vec3 halfVector = normalize(lightDir + viewDir);
      float spec = clamp(pow(clamp(dot(normal, halfVector), 0.0, 1.0), 36.0), 0.0, 0.85);

      // 1. Quantum Color Scheme (Deep Indigo & Electric Cyan)
      vec3 quantumCore = mix(uColor * 0.35, uColor, pow(NdotV, 1.5));
      vec3 quantumRim = vec3(
        fresnelR * uAccent2.r + fresnel * 0.15,
        fresnelG * uAccent.g + fresnel * 0.35,
        fresnelB * uColor.b + fresnel * 0.75
      );
      vec3 quantumFinal = quantumCore + quantumRim * 1.25 + vec3(spec * 0.75);

      // 2. Hypnokai Color Scheme (Ultraviolet & Psychedelic Neon Magenta / Electric Violet)
      vec3 hypnoUltraviolet = vec3(0.55, 0.05, 0.95);
      vec3 hypnoHotMagenta = vec3(0.98, 0.06, 0.65);
      vec3 hypnoNeonCyan = vec3(0.0, 1.0, 0.88);

      // Hypnotic concentric pulse rings
      float ringDist = length(vWorldPosition.xy);
      float pulseRings = sin(ringDist * 8.0 - uTime * 4.0) * 0.5 + 0.5;

      vec3 hypnoCore = mix(hypnoUltraviolet * 0.4, hypnoHotMagenta * 0.9, pulseRings);
      vec3 hypnoRim = vec3(
        fresnelR * hypnoHotMagenta.r + fresnel * 0.4,
        fresnelG * hypnoNeonCyan.g * 0.8,
        fresnelB * hypnoUltraviolet.b + fresnel * 0.6
      );
      vec3 hypnoFinal = hypnoCore + hypnoRim * 1.5 + vec3(spec * 0.9);

      // Smooth interpolation between Quantum state and Hypnokai state
      vec3 finalColor = mix(quantumFinal, hypnoFinal, uHypnoBlend);
      float alpha = clamp(0.75 + fresnel * 0.25, 0.0, 1.0);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};
