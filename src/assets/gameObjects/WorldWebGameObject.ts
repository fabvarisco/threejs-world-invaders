import {
  Vector3,
  Group,
  Mesh,
  Object3D,
  Scene,
  MeshStandardMaterial,
  Box3,
} from "three";
import GameObject from "./GameObject";

class WorldWebGameObject extends GameObject {
  public worldMeshes: Mesh[] = [];

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
        this.worldMeshes.push(child);
      }
    });
  }

  public DetectCollisionWithWorldObjects(invaderBox: Box3): Mesh[] {
    const collidedObjects: Mesh[] = [];

    for (const worldMesh of this.worldMeshes) {
      const worldBox = new Box3().setFromObject(worldMesh);

      if (worldBox.intersectsBox(invaderBox)) {
        collidedObjects.push(worldMesh);
      }
    }

    return collidedObjects;
  }
}

export default WorldWebGameObject;