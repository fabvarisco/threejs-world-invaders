import { Vector3, Group, Mesh, Object3D, Scene } from "three";
import InvaderGameObject from "./InvaderGameObject";

class GreenInvaderGameObject extends InvaderGameObject {
  private targetPosition: Vector3 | null = null;
  constructor(
    model: Group | Mesh | Object3D,
    position: Vector3,
    speed: number,
    scene: Scene,
    args?: any
  ) {
    super(model, position, speed, scene, args);
    this.color = 0x00ff00;
    this.model.traverse((child) => {
      if (child instanceof Mesh) {
        child.material.color.set(this.color);
      }
    });
  }

  public Update(_target: Vector3, _deltaTime: number): void {
    if (this.targetPosition === null) {
      this.Destroy();
    } else {
      this.MoveTo(this.targetPosition, _deltaTime);
      this.LookTo(this.targetPosition);
    }
  }

  public SetTargetPosition(_targetPosition: Vector3):void {
      this.targetPosition = _targetPosition;
  }
}

export default GreenInvaderGameObject;
