import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

class Prefab {
  private loader: FBXLoader;
  private readonly fileName: string;
  protected scene: THREE.Scene;
  protected object: THREE.Group;

  constructor(fileName: string, scene: THREE.Scene) {
    this.fileName = fileName;
    this.object = new THREE.Group();
    this.loader = new FBXLoader();
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
      })
      .finally(() => console.log("aaaa"));
  }

  AddToScene(position?: THREE.Vector3) {
    if (!this.object || !position) return;
    console.log(this.constructor);
    this.object = this.object.clone();
    this.object.position.x = position.x;
    this.object.position.y = position.y;
    this.object.position.z = position.z;
    this.scene.add(this.object);
  }

  _render() {}
}

export default Prefab;
