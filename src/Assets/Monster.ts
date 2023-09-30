import Prefab from "./Prefab.ts";
import { Scene } from "three";

class Monster extends Prefab {
  constructor(fileName: string, scene: Scene) {
    super(fileName, scene);
    console.log("monster");
  }

  _render() {
    super._render();
    this.object.position.z -= 0.01;
    console.log(this.object.position);
    //console.log("render tower")
  }
}

export default Monster;
