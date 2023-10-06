import SceneObject from "@/Assets/SceneObjects/SceneObject.ts";
import { ISceneObjects } from "@/type";
import { Group, Vector3 } from "three";

class PlayerShoot extends SceneObject {
  private readonly velocity: Vector3;
  private readonly controller: Group;
  constructor(
    { object, position, scene }: ISceneObjects,
    velocity: Vector3,
    controller: Group,
  ) {
    super({ object: object, position: position, scene: scene });
    this.velocity = velocity;
    this.controller = controller;
    this.object.quaternion.setFromRotationMatrix(this.controller.matrixWorld);
    this.object.position.applyMatrix4(this.controller.matrixWorld);
  }
  updatePos() {
    this.object.position.add(this.velocity);
    if (this.object.position.distanceTo(this.controller.position) < 0.05) {
      this.Destroy();
    }
  }

  Render() {
    this.updatePos();
  }
}
export default PlayerShoot;
