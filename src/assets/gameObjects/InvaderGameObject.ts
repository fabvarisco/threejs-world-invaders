import {
  Vector3,
  Group,
  Mesh,
  Object3D,
  Scene,
  ColorRepresentation,
} from "three";
import GameObject from "./GameObject";
import { ExplosionParticles } from "../../utils";

class InvaderGameObject extends GameObject {
  protected color: ColorRepresentation;
  constructor(
    model: Group | Mesh | Object3D,
    position: Vector3,
    speed: number,
    scene: Scene
  ) {
    super(model, position, speed, scene);
    this.color = 0xffffff;
  }

  public Update(targetPosition: Vector3, deltaTime: number) {
    this.MoveTo(targetPosition, deltaTime);
    this.LookTo(targetPosition);
  }

  public Destroy(): void {
    super.Destroy();
    ExplosionParticles(this.model.position, this.scene, this.color);
  }
}

export default InvaderGameObject;
