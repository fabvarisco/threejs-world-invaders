import Prefab from "./Prefab";
import { MeshStandardMaterial } from "three";

class WebWorldPrefab extends Prefab {
  constructor() {
    super();
  }

  async Load() {
    try {
      const gltf = await this.gltfLoader.loadAsync("webWorld.glb");
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
      this.model = gltf.scene.clone();
      console.log("webWorld.glb loaded!");
    } catch (error) {
      console.error(error);
    }
  }
}

export default WebWorldPrefab;
