import { Octree } from "three/addons/math/Octree.js";
import Prefab from "./Prefab";

class WebWorldPrefab extends Prefab {
    private readonly worldOctree: Octree = new Octree();
  constructor() {
    super()
    console.log("testew")
  }

  async Load(){
    this.gltfLoader.loadAsync("webWorld.glb").then(gltf => {
      this.worldOctree.fromGraphNode(gltf.scene);
      gltf.scene.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material.map) {
            child.material.map.anisotropy = 4;
          }
        }
    });
    }).catch(err => console.error(err)).finally(()=> console.log("webWorld.glb loaded!" ));
  }

  public GetWorldOctree(){
    return this.worldOctree;
  }

}

export default WebWorldPrefab;
