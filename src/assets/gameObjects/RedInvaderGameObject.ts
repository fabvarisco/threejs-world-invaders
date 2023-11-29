import { Vector3, Group, Mesh, Object3D } from "three";
import InvaderGameObject from "./InvaderGameObject";

class RedInvaderGameObject extends InvaderGameObject {
  constructor(
    model: Group | Mesh | Object3D,
    position: Vector3,
    speed: number
  ) {
    super(model, position, speed);
    this.color = 0xff0000;
    this.model.traverse((child) => {
      if (child instanceof Mesh) {
        child.material.color.set(this.color);
      }
    });
  }
}

export default RedInvaderGameObject;
