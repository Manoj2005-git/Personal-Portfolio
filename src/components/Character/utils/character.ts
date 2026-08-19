import * as THREE from "three";

export interface CharacterRefs {
  character: THREE.Group;
  headGroup?: THREE.Group;
  leftPupil?: THREE.Mesh;
  rightPupil?: THREE.Mesh;
  leftEyelid?: THREE.Mesh;
  rightEyelid?: THREE.Mesh;
  leftBrow?: THREE.Mesh;
  rightBrow?: THREE.Mesh;
  torso?: THREE.Object3D;
}

const isMobile = () =>
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  (window.innerWidth <= 1024 && "ontouchstart" in window);

const AVATAR_IMAGE = "/images/avatar1.avif";

export function createRikinCharacter(
  onProgress?: (pct: number) => void,
  onLoaded?: () => void
): CharacterRefs {
  const character = new THREE.Group();
  character.name = "rikin-character";
  const mobile = isMobile();

  const loader = new THREE.TextureLoader();

  loader.load(
    AVATAR_IMAGE,
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      const material = new THREE.ShaderMaterial({
        uniforms: { map: { value: texture } },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D map;
          varying vec2 vUv;
          void main() {
            vec4 pixel = texture2D(map, vUv);
            float yellowBackdrop = smoothstep(0.72, 0.94, pixel.r)
              * smoothstep(0.34, 0.66, pixel.g)
              * (1.0 - smoothstep(0.12, 0.3, pixel.b));
            float y = 1.0 - vUv.y;
            float headWidth = smoothstep(0.08, 0.2, y) * smoothstep(0.36, 0.25, y) * 0.14;
            float shoulderWidth = smoothstep(0.28, 0.38, y) * smoothstep(0.62, 0.5, y) * 0.2;
            float bodyWidth = smoothstep(0.5, 0.62, y) * smoothstep(0.88, 0.72, y) * 0.13;
            float silhouetteWidth = max(headWidth, max(shoulderWidth, bodyWidth));
            float silhouette = 1.0 - smoothstep(silhouetteWidth, silhouetteWidth + 0.035, abs(vUv.x - 0.5));
            pixel.a *= 1.0 - yellowBackdrop * (1.0 - silhouette);
            if (pixel.a < 0.08) discard;
            gl_FragColor = pixel;
          }
        `,
        transparent: true,
        depthWrite: false,
      });

      const model = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
      model.scale.setScalar(mobile ? 1.55 : 2.1);
      model.position.set(0, -0.25, 0);
      character.add(model);
      onLoaded?.();
    },
    (xhr) => {
      if (xhr.lengthComputable && onProgress) {
        onProgress(Math.round((xhr.loaded / xhr.total) * 100));
      }
    },
    (error) => {
      console.error("Failed to load avatar model", error);
      onLoaded?.();
    }
  );

  const headGroup = character;
  const torso = character;

  return {
    character,
    headGroup,
    torso,
  };
}
