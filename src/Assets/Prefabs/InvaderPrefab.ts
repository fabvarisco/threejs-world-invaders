import Prefab from "./Prefab";
import {
    Scene
  } from "three";
class InvaderPrefab extends Prefab {
  constructor(scene: Scene) {
    super(scene)
  }

  protected async _load(){
    const self = this;
    this.loader
        .loadAsync("invader.glb")
        .then((gltf) => {
          self.object = gltf.scene.clone();
        })
        .catch((err: string) => console.log(err));
  }

}

export default InvaderPrefab;
