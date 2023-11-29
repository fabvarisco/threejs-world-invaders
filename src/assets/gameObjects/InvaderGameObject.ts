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
    speed: number
  ) {
    super(model, position, speed);
    this.color = 0xffffff;
  }

  public Update(targetPosition: Vector3) {
    this.MoveTo(targetPosition);
    this.LookTo(targetPosition);
  }

  public Destroy(scene: Scene): void {
    super.Destroy(scene);
    ExplosionParticles(this.model.position, scene, this.color);
  }
}

export default InvaderGameObject;
