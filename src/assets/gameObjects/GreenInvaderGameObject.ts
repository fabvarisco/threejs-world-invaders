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

  public Update(targetPosition: Vector3, deltaTime: number): void {
    if (this.targetPosition === null) {
      this.targetPosition = targetPosition.clone();
    } else {
      this.MoveTo(this.targetPosition, deltaTime);
      this.LookTo(this.targetPosition);
      //this.DestroyOnDistance(this.targetPosition, 0.8)
    }

  }
}

export default GreenInvaderGameObject;
