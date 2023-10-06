import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

class Prefab {
  private loader: FBXLoader;
  private readonly fileName: string;
  protected object: THREE.Group;

  constructor(fileName: string) {
    this.fileName = fileName;
    this.object = new THREE.Group();
    this.loader = new FBXLoader();
  }

  async Load() {
    this.object = await this.loader
      .loadAsync(`/models/${this.fileName}.fbx`)
      .then((object) => {
        object.scale.set(0.01 / 5, 0.01 / 5, 0.01 / 5);
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
