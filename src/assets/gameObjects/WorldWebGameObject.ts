import {
  Vector3,
  Group,
  Mesh,
  Object3D,
  Scene,
  MeshStandardMaterial,
} from "three";
import GameObject from "./GameObject";

class WorldWebGameObject extends GameObject {
  constructor(
    model: Group | Mesh | Object3D,
    position: Vector3,
    speed: number,
    scene: Scene
  ) {
    super(model, position, speed, scene);
    this.model.traverse((child: any) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        const material = child.material as MeshStandardMaterial;
        if (material.map) {
          material.map.anisotropy = 4;
        }
      }
    });
  }
}

export default WorldWebGameObject;
