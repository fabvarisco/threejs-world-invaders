import {
  Vector3,
  Group,
  Mesh,
  Object3D,
  Scene,
  ColorRepresentation,
} from "three";
import InvaderGameObject from "./InvaderGameObject";

class GreenInvaderGameObject extends InvaderGameObject {
  constructor(
    model: Group | Mesh | Object3D,
    position: Vector3,
    speed: number,
    scene: Scene,
    args?: any
  ) {
    super(model, position, speed, scene, args);
  }


  public Update(_deltaTime: number): void {
    if (this.target === null) {
      this.Destroy();
    } else {
      this.MoveTo(this.target, _deltaTime);
      this.LookTo(this.target);
      this.box3?.setFromObject(this.model);
      this.box3Helper?.updateMatrix();
    }
  }
}

export default GreenInvaderGameObject;
