// Fix: Switched to a namespace import (`* as React`) for React.
// The namespace import is necessary for TypeScript to pick up the JSX type augmentations
// from @react-three/fiber, resolving errors with custom elements like `<mesh>`.
import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Vertex shader - passes UV coordinates to fragment shader
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader - creates the glitter effect
const fragmentShader = `
  uniform float iTime;
  uniform vec2 iResolution;
  uniform sampler2D iChannel0;
  uniform float intensity;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    float result = 0.0;

    // Sample noise texture at different scales and speeds
    result += texture2D(iChannel0, uv * 1.1 + vec2(iTime * -0.005)).r;
    result *= texture2D(iChannel0, uv * 0.9 + vec2(iTime * 0.005)).g;

    // Power function creates sharp, defined sparkles
    result = pow(result, 12.0);
    
    // Reddish color to match the theme
    vec3 color = vec3(1.0, 0.2, 0.2);

    // Amplify the result for visibility using the intensity uniform
    gl_FragColor = vec4(color * intensity * result, 1.0);
  }
`;

/**
 * Generate a random noise texture for the glitter effect
 */
function generateNoiseTexture(size = 512): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4);

  for (let i = 0; i < size * size; i++) {
    const stride = i * 4;
    const r = Math.random() * 255;
    const g = Math.random() * 255;
    const b = Math.random() * 255;

    data[stride] = r;
    data[stride + 1] = g;
    data[stride + 2] = b;
    data[stride + 3] = 255;
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  return texture;
}

interface SparklesPlaneProps {
  speed?: number;
  intensity?: number;
}

/**
 * SparklesPlane - Renders plane with shader material
 */
function SparklesPlane({ speed = 1, intensity = 5.0 }: SparklesPlaneProps) {
  const meshRef = React.useRef<THREE.Mesh>(null!);
  const noiseTexture = React.useMemo(() => generateNoiseTexture(512), []);

  const material = React.useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new THREE.Vector2(
            typeof window !== "undefined" ? window.innerWidth : 1920,
            typeof window !== "undefined" ? window.innerHeight : 1080
          ),
        },
        iChannel0: { value: noiseTexture },
        intensity: { value: intensity },
      },
      vertexShader,
      fragmentShader,
      transparent: true, // Set to true for blending
      side: THREE.DoubleSide,
    });
  }, [noiseTexture, intensity]);

  useFrame((state) => {
    if (meshRef.current && meshRef.current.material instanceof THREE.ShaderMaterial) {
      meshRef.current.material.uniforms.iTime.value = state.clock.elapsedTime * speed;
      meshRef.current.material.uniforms.iResolution.value.set(
        state.size.width,
        state.size.height
      );
    }
  });

  return (
    <mesh ref={meshRef} material={material}>
      <planeGeometry args={[10, 10]} />
    </mesh>
  );
}

interface GlitterBackgroundProps {
  speed?: number;
  intensity?: number;
}

const GlitterBackground: React.FC<GlitterBackgroundProps> = ({
  speed = 1,
  intensity = 5.0,
}) => {
  return (
    <div
      className="fixed scale-125 inset-0 w-full h-full opacity-50 mix-blend-lighten pointer-events-none z-0"
      style={{ width: "100vw", height: "100vh" }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 35 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
        gl={{ powerPreference: "high-performance" }}
      >
        <SparklesPlane speed={speed} intensity={intensity} />
      </Canvas>
    </div>
  );
};

export default GlitterBackground;