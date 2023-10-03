import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import SceneObject from "@/Assets/SceneObjects/SceneObject.ts";

class Prefab {
  private loader: FBXLoader;
  private readonly fileName: string;
  protected scene: THREE.Scene;
  protected object: THREE.Group;
  protected objectSceneType: typeof SceneObject;

  constructor(
    fileName: string,
    scene: THREE.Scene,
    objectSceneType: typeof SceneObject,
  ) {
    this.fileName = fileName;
    this.object = new THREE.Group();
    this.loader = new FBXLoader();
    this.objectSceneType = objectSceneType;
    this.scene = scene;
  }

  async Load() {
    this.object = await this.loader
      .loadAsync(`src/Assets/models/${this.fileName}.fbx`)
      .then((object) => {
        object.scale.set(0.01, 0.01, 0.01);
        return object;
      })
      .catch(() => {
        throw new Error("Failed to load " + this.fileName);
      });
  }
  GetObject() {
    return this.object;
  }
}

export default Prefab;
