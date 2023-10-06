import SceneObject from "@/Assets/SceneObjects/SceneObject.ts";
import { ISceneObjects } from "@/type";

class AngrySlime extends SceneObject {
  constructor({ object, scene, args }: ISceneObjects) {
    super({ object, scene, args });
  }
}
export default AngrySlime;
