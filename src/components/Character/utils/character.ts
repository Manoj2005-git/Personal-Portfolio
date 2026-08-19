import * as THREE from "three";
import { GLTFLoader, DRACOLoader } from "three-stdlib";

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

const AVATAR_MODEL = "/models/avatar.glb";

export function createRikinCharacter(
  onProgress?: (pct: number) => void,
  onLoaded?: () => void
): CharacterRefs {
  const character = new THREE.Group();
  character.name = "rikin-character";
  const mobile = isMobile();

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");

  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  loader.load(
    AVATAR_MODEL,
    (gltf) => {
      const model = gltf.scene;
      model.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          if (!mobile) {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        }
      });
      model.scale.setScalar(4.8);
      model.position.set(0, -0.9, 0);
      character.add(model);
      dracoLoader.dispose();
      onLoaded?.();
    },
    (xhr) => {
      if (xhr.lengthComputable && onProgress) {
        onProgress(Math.round((xhr.loaded / xhr.total) * 100));
      }
    },
    (error) => {
      console.error("Failed to load avatar model", error);
      dracoLoader.dispose();
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
