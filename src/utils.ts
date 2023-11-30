import {
  BufferAttribute,
  BufferGeometry,
  ColorRepresentation,
  Float32BufferAttribute,
  Points,
  PointsMaterial,
  Scene,
  Vector3,
  Object3D
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

export function CreateStars(scene: Scene) {
  const starsGeometry = new BufferGeometry();
  const starsMaterial = new PointsMaterial({
    color: 0xffffff,
    size: 2,
  });

  const starsVertices = [];
  for (let i = 0; i < 7000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starsVertices.push(x, y, z);
  }

  starsGeometry.setAttribute(
    "position",
    new Float32BufferAttribute(starsVertices, 3)
  );
  const stars = new Points(starsGeometry, starsMaterial);
  scene.add(stars);
}

export function ExplosionParticles(
  position: Vector3,
  scene: Scene,
  color: ColorRepresentation = 0xff0000
) {
  const particleGeometry = new BufferGeometry();
  const particleMaterial = new PointsMaterial({
    color,
    size: 1,
  });

  const particlesCount = 10;
  const particlesPositions = new Float32Array(particlesCount * 3);

  for (let i = 0; i < particlesCount; i++) {
    const i3 = i * 3;
    particlesPositions[i3] = position.x + (Math.random() - 0.5) * 5;
    particlesPositions[i3 + 1] = position.y + (Math.random() - 0.5) * 5;
    particlesPositions[i3 + 2] = position.z + (Math.random() - 0.5) * 5;
  }

  particleGeometry.setAttribute(
    "position",
    new BufferAttribute(particlesPositions, 3)
  );

  const particles = new Points(particleGeometry, particleMaterial);
  scene.add(particles);

  let animationId: number;

  const animateParticles = () => {
    const positions = particleGeometry.attributes.position
      .array as Float32Array;

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      positions[i3] += (Math.random() - 0.5) * 3;
      positions[i3 + 1] += (Math.random() - 0.5) * 3;
      positions[i3 + 2] += (Math.random() - 0.5) * 3;
    }

    particleGeometry.attributes.position.needsUpdate = true;

    if (particles.material.opacity > 0) {
      particles.material.opacity -= 0.03;
    } else {
      scene.remove(particles);
      cancelAnimationFrame(animationId);
    }
  };

  const particleAnimation = () => {
    animateParticles();
    animationId = requestAnimationFrame(particleAnimation);
  };

  particleAnimation();

  return () => {
    cancelAnimationFrame(animationId);
    scene.remove(particles);
  };
}

export async function Loader(fileName: string) {
  const gltfLoader: GLTFLoader = new GLTFLoader().setPath("/models/");
  const fbxLoader: FBXLoader = new FBXLoader().setPath("/models/");
  let model;

  if (fileName.endsWith(".fbx")) {
    try {
      const fbx = await fbxLoader.loadAsync(fileName);
      model = fbx.clone();
      console.log(fileName + " loaded!");
    } catch (error) {
      console.error(error);
    }
  }

  if (fileName.endsWith(".glb")) {
    try {
      const gltf = await gltfLoader.loadAsync(fileName);
      model = gltf.scene.clone();
      console.log(fileName + " loaded!");
    } catch (error) {
      console.error(error);
    }
  }




  return model

}