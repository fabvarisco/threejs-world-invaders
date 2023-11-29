import { Vector3, Group, Mesh, Object3D } from "three";
import InvaderGameObject from "./InvaderGameObject";

class GreenInvaderGameObject extends InvaderGameObject {
  private targetPosition: Vector3 | null = null;
  constructor(
    model: Group | Mesh | Object3D,
    position: Vector3,
    speed: number
  ) {
    super(model, position, speed);
    this.color = 0x00ff00;
    this.model.traverse((child) => {
      if (child instanceof Mesh) {
        child.material.color.set(this.color);
      }
    });
  }

  public Update(targetPosition: Vector3): void {
    if (this.targetPosition === null) {
      this.targetPosition = targetPosition;
    }
    if (this.targetPosition !== null) {
      this.MoveTo(targetPosition);
      this.LookTo(targetPosition);
    }
  }
}

export default GreenInvaderGameObject;
