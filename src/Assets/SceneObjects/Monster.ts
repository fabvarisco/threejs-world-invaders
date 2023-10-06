import SceneObject from "@/Assets/SceneObjects/SceneObject.ts";
import { ISceneObjects } from "@/type";
import { Vector3 } from "three";
import { DEVICE_POSITION } from "@/utils/utils.ts";

class Monster extends SceneObject {
  constructor({ object, scene, args }: ISceneObjects) {
    super({ object, scene, args });
    this.object.position.set(
      this.args.position!.x,
      this.args.position!.y,
      this.args.position!.z,
    );
  }
  updatePos() {
    const speed = 0.01;

    const direction = new Vector3();
    direction.subVectors(DEVICE_POSITION, this.object.position);
    direction.normalize();

    this.object.position.addScaledVector(direction, speed);

    this.object.position.add(this.direction);

    const distance = DEVICE_POSITION.distanceTo(this.object.position);
    if (distance <= 1.0) {
      this.Destroy();
      console.log(DEVICE_POSITION);
      console.log(this.object.position);
    }
  }

  Render() {
    console.log("monster");
    this.updatePos();
  }
}
export default Monster;
