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

  public Update(_targetPosition: Vector3, _deltaTime: number) {
    this.MoveTo(_targetPosition, _deltaTime);
    this.LookTo(_targetPosition);
  }

  public Destroy(): void {
    super.Destroy();
    ExplosionParticles(this.model.position, this.scene, this.color);
  }

}

export default InvaderGameObject;
