import SceneObject from "@/Assets/SceneObject.ts";
import { ISceneObjects } from "@/type";

class Monster extends SceneObject {
  constructor({ object, position, scene }: ISceneObjects) {
    super({ object: object, position: position, scene: scene });
    console.log("monster");
  }

  Render() {
    super.Render();
    this.object.position.z -= 1;
  }
}
export default Monster;
