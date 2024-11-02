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
  private targetPosition: Vector3 | null = null;
  constructor(
    model: Group | Mesh | Object3D,
    position: Vector3,
    speed: number,
    scene: Scene,
    args?: any
  ) {
    super(model, position, speed, scene, args);
  }

  public Init() {
    this.color = 0x28a745;
    this.model.traverse((child) => {
      if (child instanceof Mesh) {
        child.material.color.set(0x28a745); 
      }
    });
  }

  public Update(_deltaTime: number): void {
    if (this.targetPosition === null) {
      this.Destroy();
    } else {
      this.MoveTo(this.targetPosition, _deltaTime);
      this.LookTo(this.targetPosition);
      this.box3?.setFromObject(this.model)
      this.box3Helper?.updateMatrix(); 
    }
  }
}

export default GreenInvaderGameObject;
