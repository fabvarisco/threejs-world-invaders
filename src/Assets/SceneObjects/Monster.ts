import SceneObject from "@/Assets/SceneObjects/SceneObject.ts";
import { ISceneObjects } from "@/type";
import { Vector3 } from "three";
import { DEVICE_POSITION } from "@/utils/utils.ts";

class Monster extends SceneObject {
  constructor({ object, position, scene }: ISceneObjects) {
    super({ object: object, position: position, scene: scene });
  }
  updatePos() {
    const speed = 0.01;

    const direction = new Vector3();
    direction.subVectors(DEVICE_POSITION, this.object.position);
    direction.normalize();

    this.object.position.addScaledVector(direction, speed);
  }

  Render() {
    this.updatePos();
  }
}
export default Monster;
