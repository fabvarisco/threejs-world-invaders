import { Vector3, Scene } from "three";
import InvaderGameObject from "./InvaderGameObject";

class GreenInvaderGameObject extends InvaderGameObject {
  constructor(
    position: Vector3,
    speed: number,
    scene: Scene

  ) {
    super(position, speed, scene);
  }

  public Update( deltaTime: number): void {

    }

}

export default GreenInvaderGameObject;
