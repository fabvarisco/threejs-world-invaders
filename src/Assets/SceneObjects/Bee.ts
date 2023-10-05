import SceneObject from "@/Assets/SceneObjects/SceneObject.ts";
import { ISceneObjects } from "@/type";
import { removeSceneObject, SCENE_OBJECTS } from "@/utils/utils.ts";
import PortalWeb from "@/Assets/SceneObjects/PortalWeb.ts";
import { Vector3 } from "three";

class Bee extends SceneObject {
  constructor({ object, position, scene }: ISceneObjects) {
    super({ object: object, position: position, scene: scene });
  }

  Render() {}
}
export default Bee;
