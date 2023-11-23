import { Octree } from "three/addons/math/Octree.js";
import Prefab from "./Prefab";
import { MeshStandardMaterial } from "three";

class WebWorldPrefab extends Prefab {
  private readonly worldOctree: Octree = new Octree();
  constructor() {
    super();
  }

  async Load() {
    try {
      const gltf = await this.gltfLoader.loadAsync("webWorld.glb");

      this.worldOctree.fromGraphNode(gltf.scene);

      gltf.scene.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          const material = child.material as MeshStandardMaterial;

          if (material.map) {
            material.map.anisotropy = 4;
          }
        }
      });
      this.object = gltf.scene.clone();
      console.log("webWorld.glb loaded!");
    } catch (error) {
      console.error(error);
    }
  }

  public GetWorldOctree() {
    return this.worldOctree;
  }
}

export default WebWorldPrefab;
