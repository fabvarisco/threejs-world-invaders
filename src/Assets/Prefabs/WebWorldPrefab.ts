import { Octree } from "three/addons/math/Octree.js";
import Prefab from "./Prefab";
import {
  Scene
} from "three";

class WebWorldPrefab extends Prefab {
    private readonly worldOctree: Octree = new Octree();
  constructor(scene:Scene) {
    super(scene)
  }

  protected async _load(){
    this.loader.load("webWorld.glb", (gltf) => {
      this.scene.add(gltf.scene);
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
    });
  }

  public GetWorldOctree(){
    return this.worldOctree;
  }

}

export default WebWorldPrefab;
