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
import { Octree } from "three/examples/jsm/math/Octree.js";
import { GetRandomInt } from "../../utils";

class WorldWebGameObject extends GameObject {
  private worldMeshes: Mesh[] = [];
  private octree: Octree = new Octree();
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
    this.octree.fromGraphNode(this.model);

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

  public ResetOctree() {
    this.octree.triangles = [];
    this.octree.subTrees = [];
    this.octree.fromGraphNode(this.model);
  }

  public GetMeshes() {
    return this.worldMeshes;
  }

  public GetRandomMesh(): Vector3 {
    const randomInt = GetRandomInt(0, this.worldMeshes.length - 1);
    return this.worldMeshes[randomInt].position;
  }

  public GetOctree(){
    return this.octree;
  }
}

export default WorldWebGameObject;
