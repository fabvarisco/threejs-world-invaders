import SceneObject from "@/Assets/SceneObjects/SceneObject.ts";
import { ISceneObjects } from "@/type";

class Bee extends SceneObject {
  constructor({ object, position, scene }: ISceneObjects) {
    super({ object: object, position: position, scene: scene });
  }

  Render() {
    super.Render();
  }
}
export default Bee;
